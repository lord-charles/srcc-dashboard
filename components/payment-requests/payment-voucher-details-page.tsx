"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  X,
  User,
  Calendar,
  FileText,
  ExternalLink,
  RotateCcw,
  ChevronRight,
  Check,
  Building2,
  DollarSign,
  Upload,
  Receipt,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  approvePaymentVoucher,
  rejectPaymentVoucher,
  requestVoucherRevision,
  payVoucher,
  updatePaymentVoucher,
  getPaymentVoucherById,
} from "@/services/payment-request.service";
import { cloudinaryService } from "@/lib/cloudinary-service";
import type { PaymentVoucher } from "@/types/payment-request";
import { PaymentVoucherStatus } from "@/types/payment-request";

// ─── Status Config ────────────────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  pending_finance_approval: {
    label: "Pending Finance Approval",
    className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  approved: {
    label: "Approved",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
  },
  revision_requested: {
    label: "Revision Requested",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: <RotateCcw className="h-3.5 w-3.5" />,
  },
  rejected: {
    label: "Rejected",
    className: "bg-destructive/10 text-destructive border-destructive/20",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  paid: {
    label: "Paid",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
  },
};

// ─── Audit Timeline ───────────────────────────────────────────────────────────
function AuditTimeline({ entries }: { entries: PaymentVoucher["auditTrail"] }) {
  return (
    <div className="space-y-3">
      {entries.map((entry, idx) => (
        <div key={idx} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ChevronRight className="h-3.5 w-3.5 text-primary" />
            </div>
            {idx < entries.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
          </div>
          <div className="pb-4 flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="font-medium text-sm">{entry.action}</p>
              <span className="text-xs text-muted-foreground">
                {format(new Date(entry.actionAt), "MMM d, yyyy HH:mm")}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              By: {entry.actionBy?.firstName} {entry.actionBy?.lastName}
            </p>
            {entry.comments && (
              <p className="text-xs mt-1 text-foreground/70 bg-muted/50 rounded p-2 border-l-2 border-primary/30">
                {entry.comments}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface Props {
  initialVoucher: PaymentVoucher;
}

type ActionMode = null | "approve" | "reject" | "revision" | "pay" | "make_revision";

export function PaymentVoucherDetailsPage({ initialVoucher }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [voucher, setVoucher] = useState<PaymentVoucher>(initialVoucher);
  const [actionMode, setActionMode] = useState<ActionMode>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pay voucher fields
  const [paymentAdviceUrl, setPaymentAdviceUrl] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [reference, setReference] = useState("");

  // Revision / Edit fields
  const [revisedAmount, setRevisedAmount] = useState("");
  const [revisedComments, setRevisedComments] = useState("");

  const refreshVoucherData = async () => {
    const res = await getPaymentVoucherById(voucher._id);
    if (res.success) {
      setVoucher(res.data);
    }
  };

  const status = voucher.status;
  const config = statusConfig[status] || statusConfig.pending_finance_approval;

  const userRoles = session?.user?.roles || [];
  const isSrccFinance = userRoles.includes("srcc_finance") || userRoles.includes("admin");
  const isSrccChecker = userRoles.includes("srcc_checker") || userRoles.includes("admin");

  const canApproveReject = isSrccFinance && status === PaymentVoucherStatus.PENDING_FINANCE_APPROVAL;
  const canMarkPaid = (isSrccFinance || isSrccChecker) && status === PaymentVoucherStatus.APPROVED;

  const currentUserId = session?.user?.id;
  const voucherCreatorId = voucher.preparedBy?._id || (typeof voucher.preparedBy === "string" ? voucher.preparedBy : (voucher.preparedBy as any)?._id || (voucher.preparedBy as any));
  const isCreator = !!currentUserId && !!voucherCreatorId && currentUserId === voucherCreatorId;
  const canMakeRevision = (
    status === PaymentVoucherStatus.PENDING_FINANCE_APPROVAL ||
    status === PaymentVoucherStatus.REVISION_REQUESTED
  ) && isCreator;

  const paymentRequest = voucher.paymentRequestId as any;

  const handleAction = async () => {
    setIsSubmitting(true);
    setError(null);

    let res: any;

    if (actionMode === "approve") {
      res = await approvePaymentVoucher(voucher._id, { comments: comment });
    } else if (actionMode === "reject") {
      if (!comment.trim()) { setError("Rejection reason is required"); setIsSubmitting(false); return; }
      res = await rejectPaymentVoucher(voucher._id, { reason: comment });
    } else if (actionMode === "revision") {
      if (!comment.trim()) { setError("Revision comment is required"); setIsSubmitting(false); return; }
      res = await requestVoucherRevision(voucher._id, { comment });
    } else if (actionMode === "pay") {
      if (!paymentAdviceUrl.trim()) { setError("Payment advice document is required"); setIsSubmitting(false); return; }
      res = await payVoucher(voucher._id, {
        paymentAdviceUrl,
        transactionId: transactionId || undefined,
        paymentMethod: paymentMethod || undefined,
        reference: reference || undefined,
      });
    } else if (actionMode === "make_revision") {
      const amt = Number(revisedAmount);
      if (!amt || amt <= 0) { setError("Valid amount is required"); setIsSubmitting(false); return; }
      if (amt > paymentRequest?.amount) {
        setError(`Amount cannot exceed the payment request amount of ${paymentRequest?.currency || "KES"} ${paymentRequest?.amount?.toLocaleString()}`);
        setIsSubmitting(false);
        return;
      }
      res = await updatePaymentVoucher(voucher._id, {
        paymentRequestId: paymentRequest?._id || paymentRequest,
        amount: amt,
        comments: revisedComments || "Voucher revised by checker",
      });
    }

    setIsSubmitting(false);

    if (!res?.success) {
      setError(res?.error || "An error occurred");
      return;
    }

    const messages: Record<NonNullable<ActionMode>, string> = {
      approve: "Voucher approved. It is now pending payment.",
      reject: "Voucher rejected. Finance Checker has been notified.",
      revision: "Revision requested. Finance Checker has been notified.",
      pay: "Payment marked. Payment advice uploaded and PM notified.",
      make_revision: "Voucher revised and resubmitted successfully.",
    };

    toast({ title: "Success", description: messages[actionMode!] });
    resetAction();
    refreshVoucherData();
  };

  const handleAdviceUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const url = await cloudinaryService.uploadFile(file);
      setPaymentAdviceUrl(url);
      toast({ title: "Document uploaded", description: "Payment advice uploaded successfully." });
    } catch {
      toast({ variant: "destructive", title: "Upload failed", description: "Could not upload document." });
    } finally {
      setIsUploading(false);
    }
  };

  const resetAction = () => {
    setActionMode(null);
    setComment("");
    setPaymentAdviceUrl("");
    setTransactionId("");
    setReference("");
    setPaymentMethod("Bank Transfer");
    setRevisedAmount("");
    setRevisedComments("");
    setError(null);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/payment-vouchers");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl p-2 space-y-4">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Payment Voucher</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Voucher No: <span className="font-mono font-semibold text-primary">{voucher.voucherNo}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium ${config.className}`}>
              {config.icon} {config.label}
            </Badge>
            {canMakeRevision && !actionMode && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-9 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                onClick={() => {
                  setActionMode("make_revision");
                  setRevisedAmount(voucher.amount.toString());
                  setRevisedComments("");
                }}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {status === PaymentVoucherStatus.PENDING_FINANCE_APPROVAL ? "Edit Voucher" : "Revise Voucher"}
              </Button>
            )}
          </div>
        </div>

        {/* ── Main Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 items-start">
          {/* Left Columns (3 span) */}
          <div className="lg:col-span-3 space-y-6">
            {actionMode !== "make_revision" && (
              <>
                {/* Status Banners */}
                {status === "rejected" && voucher.rejection && (
                  <Alert variant="destructive" className="border-red-500/30 bg-red-500/5">
                    <XCircle className="h-5 w-5 mt-0.5" />
                    <div>
                      <AlertTitle className="font-semibold">Rejected</AlertTitle>
                      <AlertDescription className="mt-1 text-sm">
                        Rejected by <span className="font-medium text-foreground">{voucher.rejection.rejectedBy?.firstName} {voucher.rejection.rejectedBy?.lastName}</span> on {format(new Date(voucher.rejection.rejectedAt), "MMM d, yyyy")}.
                        <span className="mt-2 block bg-destructive/10 p-3 rounded font-mono text-xs border border-destructive/20">{voucher.rejection.reason}</span>
                      </AlertDescription>
                    </div>
                  </Alert>
                )}

                {status === "revision_requested" && voucher.revision && (
                  <Alert className="border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10">
                    <RotateCcw className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div>
                      <AlertTitle className="text-amber-700 dark:text-amber-300 font-semibold">Revision Requested</AlertTitle>
                      <AlertDescription className="text-amber-600 dark:text-amber-400 mt-1 text-sm">
                        <span className="mt-2 block bg-amber-500/10 p-3 rounded italic text-foreground border border-amber-500/20">{voucher.revision.comment}</span>
                      </AlertDescription>
                    </div>
                  </Alert>
                )}

                {status === "paid" && voucher.payment && (
                  <Alert className="border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10">
                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                    <div>
                      <AlertTitle className="text-emerald-700 dark:text-emerald-300 font-semibold">Payment Processed</AlertTitle>
                      <AlertDescription className="text-emerald-600 dark:text-emerald-400 mt-2 space-y-2 text-sm">
                        <p>Paid by <strong className="text-foreground">{voucher.payment.paidBy?.firstName} {voucher.payment.paidBy?.lastName}</strong> on {format(new Date(voucher.payment.paidAt), "MMMM d, yyyy")}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-emerald-500/5 dark:bg-emerald-500/10 p-3.5 rounded-lg border border-emerald-500/20">
                          {voucher.payment.transactionId && <p>Transaction ID: <strong className="text-foreground font-mono">{voucher.payment.transactionId}</strong></p>}
                          {voucher.payment.paymentMethod && <p>Method: <strong className="text-foreground">{voucher.payment.paymentMethod}</strong></p>}
                          {voucher.payment.reference && <p className="sm:col-span-2">Reference: <strong className="text-foreground">{voucher.payment.reference}</strong></p>}
                        </div>
                        {voucher.payment.paymentAdviceUrl && (
                          <a
                            href={voucher.payment.paymentAdviceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline pt-1"
                          >
                            <FileText className="h-4 w-4" /> View Payment Advice <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </AlertDescription>
                    </div>
                  </Alert>
                )}

                {/* Voucher Financial Summary */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-4 border-b border-border/60">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Voucher Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Voucher Amount</p>
                        <p className="text-3xl font-extrabold text-primary mt-2">
                          {paymentRequest?.currency || "KES"} {voucher.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="bg-muted/40 rounded-xl p-5 border border-border/40">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Voucher Number</p>
                        <p className="text-2xl font-bold mt-2 font-mono text-foreground/90">
                          {voucher.voucherNo}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Details info */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-4 border-b border-border/60">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Preparation Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-muted-foreground">Prepared By</span>
                        <span className="font-semibold text-foreground">
                          {voucher.preparedBy?.firstName} {voucher.preparedBy?.lastName}
                        </span>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-muted-foreground">Prepared Date</span>
                        <span className="font-semibold text-foreground">
                          {format(new Date(voucher.createdAt), "MMMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Action Panel */}
            {(canApproveReject || canMarkPaid || actionMode === "make_revision") && (
              <Card className="border-2 border-primary/20 shadow-md">
                <CardHeader className="pb-4 border-b border-border/60 bg-primary/5">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary">
                    {canApproveReject
                      ? "Finance Approver Actions"
                      : canMarkPaid
                      ? "Payment Actions"
                      : "Edit Voucher"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {!actionMode && (
                    <div className="flex flex-wrap gap-3">
                      {canApproveReject && (
                        <>
                          <Button variant="default" className="gap-2 bg-green-600 hover:bg-green-700 h-11 px-5 font-semibold" onClick={() => setActionMode("approve")}>
                            <Check className="h-4 w-4" /> Approve Voucher
                          </Button>
                          <Button variant="outline" className="gap-2 border-amber-500 text-amber-700 hover:bg-amber-50 h-11 px-5 font-semibold" onClick={() => setActionMode("revision")}>
                            <RotateCcw className="h-4 w-4" /> Request Revision
                          </Button>
                          <Button variant="outline" className="gap-2 border-red-500 text-red-700 hover:bg-red-50 h-11 px-5 font-semibold" onClick={() => setActionMode("reject")}>
                            <X className="h-4 w-4" /> Reject Voucher
                          </Button>
                        </>
                      )}
                      {canMarkPaid && (
                        <Button variant="default" className="gap-2 bg-blue-600 hover:bg-blue-700 h-11 px-5 font-semibold" onClick={() => setActionMode("pay")}>
                          <DollarSign className="h-4 w-4" /> Mark as Paid
                        </Button>
                      )}
                    </div>
                  )}

                  {actionMode === "approve" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Approval Comments (optional)</Label>
                        <Textarea placeholder="Add approval comments..." value={comment} onChange={(e) => setComment(e.target.value)} rows={4} className="resize-none text-sm" />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleAction} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 gap-2 h-10 px-4">
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          Confirm Approval
                        </Button>
                        <Button variant="ghost" onClick={resetAction} className="h-10">Cancel</Button>
                      </div>
                    </div>
                  )}

                  {actionMode === "reject" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-destructive">Rejection Reason <span className="text-destructive">*</span></Label>
                        <Textarea placeholder="Explain the reason for rejecting this voucher..." value={comment} onChange={(e) => setComment(e.target.value)} rows={4} className="resize-none text-sm" />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleAction} disabled={isSubmitting} variant="destructive" className="gap-2 h-10 px-4">
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                          Confirm Rejection
                        </Button>
                        <Button variant="ghost" onClick={resetAction} className="h-10">Cancel</Button>
                      </div>
                    </div>
                  )}

                  {actionMode === "revision" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-amber-700">Revision Comments <span className="text-destructive">*</span></Label>
                        <Textarea placeholder="Describe what corrections are required..." value={comment} onChange={(e) => setComment(e.target.value)} rows={4} className="resize-none text-sm" />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleAction} disabled={isSubmitting} className="gap-2 bg-amber-600 hover:bg-amber-700 h-10 px-4">
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                          Send for Revision
                        </Button>
                        <Button variant="ghost" onClick={resetAction} className="h-10">Cancel</Button>
                      </div>
                    </div>
                  )}

                  {actionMode === "pay" && (
                    <div className="space-y-4">
                      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50">
                        <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <AlertDescription className="text-blue-700 dark:text-blue-400 text-sm">
                          Please upload the payment advice or transfer receipt below.
                        </AlertDescription>
                      </Alert>

                      {/* Payment Advice Upload */}
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Payment Advice Document <span className="text-destructive">*</span></Label>
                        <p className="text-xs text-muted-foreground">Upload bank transfer slip or payment advice (PDF, image)</p>
                        <div className="flex gap-2 items-center mt-1">
                          <Input
                            placeholder="https://... or upload below"
                            value={paymentAdviceUrl}
                            onChange={(e) => setPaymentAdviceUrl(e.target.value)}
                            className="flex-1 h-10 text-sm"
                          />
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAdviceUpload(f); }}
                            />
                            <Button type="button" variant="outline" size="sm" className="h-10 px-4" disabled={isUploading} asChild>
                              <span className="flex items-center gap-1.5">
                                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                Upload
                              </span>
                            </Button>
                          </label>
                        </div>
                        {paymentAdviceUrl && (
                          <a href={paymentAdviceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1.5 mt-1 font-semibold">
                            <ExternalLink className="h-3 w-3" /> Preview uploaded document
                          </a>
                        )}
                      </div>

                      {/* Optional payment details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-sm font-semibold">Transaction ID</Label>
                          <Input placeholder="e.g. FT26..." value={transactionId} onChange={(e) => setTransactionId(e.target.value)} className="h-10" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm font-semibold">Payment Method</Label>
                          <Input placeholder="e.g. Bank Transfer" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="h-10" />
                        </div>
                        <div className="sm:col-span-2 space-y-1">
                          <Label className="text-sm font-semibold">Reference</Label>
                          <Input placeholder="Internal memo/notes..." value={reference} onChange={(e) => setReference(e.target.value)} className="h-10" />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button onClick={handleAction} disabled={isSubmitting || isUploading || !paymentAdviceUrl} className="gap-2 bg-blue-600 hover:bg-blue-700 h-10 px-4">
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
                          Confirm Payment
                        </Button>
                        <Button variant="ghost" onClick={resetAction} className="h-10">Cancel</Button>
                      </div>
                    </div>
                  )}

                  {actionMode === "make_revision" && (
                    <div className="space-y-4">
                      {status === PaymentVoucherStatus.PENDING_FINANCE_APPROVAL ? (
                        <Alert className="border-primary/20 bg-primary/5 dark:bg-primary/10">
                          <RotateCcw className="h-4 w-4 text-primary" />
                          <AlertDescription className="text-foreground/90 text-sm">
                            Editing payment voucher while it is still pending finance approval.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert className="border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10">
                          <RotateCcw className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          <AlertDescription className="text-amber-700 dark:text-amber-300 text-sm">
                            <span className="font-semibold block mb-1">Feedback from Finance Approver:</span>
                            <span className="italic block bg-muted/60 p-3 rounded-lg text-foreground/90 my-2">
                              {`"${voucher.revision?.comment || "No comments provided."}"`}
                            </span>
                            Please address this feedback below.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Currency</Label>
                        <Input value={paymentRequest?.currency || "KES"} disabled className="bg-muted" />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Revised Amount <span className="text-destructive">*</span></Label>
                        <div className="relative flex items-center mt-1">
                          <span className="absolute left-3 text-muted-foreground text-sm font-medium">{paymentRequest?.currency || "KES"}</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            className="pl-16 h-10"
                            value={revisedAmount}
                            onChange={(e) => setRevisedAmount(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Revision Comments / Notes <span className="text-destructive">*</span></Label>
                        <Textarea
                          placeholder="Provide details or explain how you addressed the feedback..."
                          value={revisedComments}
                          onChange={(e) => setRevisedComments(e.target.value)}
                          rows={3}
                          className="text-sm resize-none"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button onClick={handleAction} disabled={isSubmitting} className="gap-2 bg-amber-600 hover:bg-amber-700 h-10 px-4">
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          Submit Revision
                        </Button>
                        <Button variant="ghost" onClick={resetAction} className="h-10">Cancel</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Columns (2 span) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Linked Payment Request info card */}
            {paymentRequest && (
              <Card className="shadow-sm">
                <CardHeader className="pb-4 border-b border-border/60">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Linked Payment Request
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Project:</span>
                    <span className="font-semibold text-foreground ml-auto">{paymentRequest.projectId?.name || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">LPO:</span>
                    <span className="font-mono font-semibold text-primary ml-auto">{paymentRequest.lpoId?.lpoNo || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Request Amount:</span>
                    <span className="font-semibold text-foreground ml-auto">
                      {paymentRequest.currency} {paymentRequest.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Requested By:</span>
                    <span className="font-semibold text-foreground ml-auto">
                      {paymentRequest.requestedBy?.firstName} {paymentRequest.requestedBy?.lastName}
                    </span>
                  </div>
                  {paymentRequest.grnUrl && (
                    <div className="flex items-center justify-between pt-3 border-t border-border/60">
                      <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">GRN Document</span>
                      <a href={paymentRequest.grnUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 font-semibold text-xs bg-muted px-2.5 py-1 rounded">
                        View GRN <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Audit Trail */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4 border-b border-border/60">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Audit History
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {voucher.auditTrail?.length > 0 ? (
                  <AuditTimeline entries={voucher.auditTrail} />
                ) : (
                  <p className="text-sm text-muted-foreground">No audit logs found.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
