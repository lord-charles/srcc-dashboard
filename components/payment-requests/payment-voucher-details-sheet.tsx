"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
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
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  voucher: PaymentVoucher | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRoles?: string[];
  onSuccess?: () => void;
}

type ActionMode = null | "approve" | "reject" | "revision" | "pay" | "make_revision";

export function PaymentVoucherDetailsSheet({
  voucher,
  open,
  onOpenChange,
  userRoles = [],
  onSuccess,
}: Props) {
  const { data: session } = useSession();
  const { toast } = useToast();
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

  if (!voucher) return null;

  const status = voucher.status;
  const config = statusConfig[status] || statusConfig.pending_finance_approval;

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
    onSuccess?.();
    onOpenChange(false);
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

  return (
    <Sheet open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetAction(); }}>
      <SheetContent className="w-full sm:max-w-2xl p-0 flex flex-col h-full">
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <SheetTitle className="text-xl">Payment Voucher</SheetTitle>
                <SheetDescription className="mt-1">
                  Voucher No: <strong>{voucher.voucherNo}</strong>
                </SheetDescription>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <Badge className={`flex items-center gap-1 ${config.className}`}>
                {config.icon} {config.label}
              </Badge>
              {canMakeRevision && !actionMode && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs h-8 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
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
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 py-5 space-y-6">

            {actionMode !== "make_revision" && (
              <>
                {/* Status Banners */}
            {status === "rejected" && voucher.rejection && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Rejected</AlertTitle>
                <AlertDescription>
                  <span className="font-medium">{voucher.rejection.rejectedBy?.firstName} {voucher.rejection.rejectedBy?.lastName}</span> rejected on{" "}
                  {format(new Date(voucher.rejection.rejectedAt), "MMM d, yyyy")}.<br />
                  Reason: {voucher.rejection.reason}
                </AlertDescription>
              </Alert>
            )}

            {status === "revision_requested" && voucher.revision && (
              <Alert className="border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10">
                <RotateCcw className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertTitle className="text-amber-700 dark:text-amber-300">Revision Requested</AlertTitle>
                <AlertDescription className="text-amber-600 dark:text-amber-400">
                  {voucher.revision.comment}
                </AlertDescription>
              </Alert>
            )}

            {status === "paid" && voucher.payment && (
              <Alert className="border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10">
                <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <AlertTitle className="text-emerald-700 dark:text-emerald-300">Payment Processed</AlertTitle>
                <AlertDescription className="text-emerald-600 dark:text-emerald-400 space-y-1">
                  <p>Paid by <strong>{voucher.payment.paidBy?.firstName} {voucher.payment.paidBy?.lastName}</strong> on {format(new Date(voucher.payment.paidAt), "MMM d, yyyy")}</p>
                  {voucher.payment.transactionId && <p>Transaction ID: <strong>{voucher.payment.transactionId}</strong></p>}
                  {voucher.payment.paymentMethod && <p>Method: {voucher.payment.paymentMethod}</p>}
                  {voucher.payment.reference && <p>Reference: {voucher.payment.reference}</p>}
                  {voucher.payment.paymentAdviceUrl && (
                    <a
                      href={voucher.payment.paymentAdviceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      <FileText className="h-3.5 w-3.5" /> View Payment Advice <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Voucher Financial Summary */}
            <Card>
              <CardHeader className="pb-3 pt-4 px-5">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Voucher Details</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Voucher Amount</p>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {paymentRequest?.currency || "KES"} {voucher.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Voucher No</p>
                    <p className="text-lg font-semibold mt-1">{voucher.voucherNo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Prepared By</p>
                    <p className="font-medium">{voucher.preparedBy?.firstName} {voucher.preparedBy?.lastName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="font-medium">{format(new Date(voucher.createdAt), "MMM d, yyyy")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Linked Payment Request */}
            {paymentRequest && (
              <Card>
                <CardHeader className="pb-3 pt-4 px-5">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Linked Payment Request</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">Project:</span>
                    <span className="font-medium">{paymentRequest.projectId?.name || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">LPO:</span>
                    <span className="font-medium">{paymentRequest.lpoId?.lpoNo || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">Request Amount:</span>
                    <span className="font-medium">{paymentRequest.currency} {paymentRequest.amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">Requested By:</span>
                    <span className="font-medium">{paymentRequest.requestedBy?.firstName} {paymentRequest.requestedBy?.lastName}</span>
                  </div>
                  {paymentRequest.grnUrl && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">GRN:</span>
                      <a href={paymentRequest.grnUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 font-medium">
                        View Document <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Audit Trail */}
            <Card>
              <CardHeader className="pb-3 pt-4 px-5">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Audit Trail</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {voucher.auditTrail?.length > 0 ? (
                  <AuditTimeline entries={voucher.auditTrail} />
                ) : (
                  <p className="text-sm text-muted-foreground">No audit history yet.</p>
                )}
              </CardContent>
            </Card>
              </>
            )}

            {/* Action Panel */}
            {(canApproveReject || canMarkPaid || actionMode === "make_revision") && (
              <Card className="border-2 border-primary/20">
                <CardHeader className="pb-3 pt-4 px-5">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wide">
                    {canApproveReject
                      ? "Finance Approver Actions"
                      : canMarkPaid
                      ? "Payment Actions"
                      : "Edit Voucher"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {!actionMode && (
                    <div className="flex flex-wrap gap-2">
                      {canApproveReject && (
                        <>
                          <Button variant="default" className="gap-2 bg-green-600 hover:bg-green-700" onClick={() => setActionMode("approve")}>
                            <Check className="h-4 w-4" /> Approve Voucher
                          </Button>
                          <Button variant="outline" className="gap-2 border-amber-500 text-amber-700 hover:bg-amber-50" onClick={() => setActionMode("revision")}>
                            <RotateCcw className="h-4 w-4" /> Request Revision
                          </Button>
                          <Button variant="outline" className="gap-2 border-red-500 text-red-700 hover:bg-red-50" onClick={() => setActionMode("reject")}>
                            <X className="h-4 w-4" /> Reject Voucher
                          </Button>
                        </>
                      )}
                      {canMarkPaid && (
                        <Button variant="default" className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setActionMode("pay")}>
                          <DollarSign className="h-4 w-4" /> Mark as Paid
                        </Button>
                      )}
                    </div>
                  )}

                  {actionMode === "approve" && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Approval Comments (optional)</Label>
                      <Textarea placeholder="Add approval notes..." value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
                      <div className="flex gap-2">
                        <Button onClick={handleAction} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 gap-2">
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          Confirm Approval
                        </Button>
                        <Button variant="ghost" onClick={resetAction}>Cancel</Button>
                      </div>
                    </div>
                  )}

                  {actionMode === "reject" && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Rejection Reason <span className="text-destructive">*</span></Label>
                      <Textarea placeholder="Explain the rejection reason..." value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
                      <div className="flex gap-2">
                        <Button onClick={handleAction} disabled={isSubmitting} variant="destructive" className="gap-2">
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                          Confirm Rejection
                        </Button>
                        <Button variant="ghost" onClick={resetAction}>Cancel</Button>
                      </div>
                    </div>
                  )}

                  {actionMode === "revision" && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Revision Comments <span className="text-destructive">*</span></Label>
                      <Textarea placeholder="Describe what needs to be corrected..." value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
                      <div className="flex gap-2">
                        <Button onClick={handleAction} disabled={isSubmitting} className="gap-2 bg-amber-600 hover:bg-amber-700">
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                          Send for Revision
                        </Button>
                        <Button variant="ghost" onClick={resetAction}>Cancel</Button>
                      </div>
                    </div>
                  )}

                  {actionMode === "pay" && (
                    <div className="space-y-4">
                      <Alert className="bg-blue-50 border-blue-200">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-700 text-sm">
                          Marking this voucher as paid will notify the Project Manager and HOD. Please upload the payment advice document.
                        </AlertDescription>
                      </Alert>

                      {/* Payment Advice Upload */}
                      <div>
                        <Label className="text-sm font-medium">Payment Advice Document <span className="text-destructive">*</span></Label>
                        <p className="text-xs text-muted-foreground mb-2">Upload confirmation of bank transfer / payment advice</p>
                        <div className="flex gap-2 items-center">
                          <Input
                            placeholder="https://... or upload below"
                            value={paymentAdviceUrl}
                            onChange={(e) => setPaymentAdviceUrl(e.target.value)}
                            className="flex-1"
                          />
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAdviceUpload(f); }}
                            />
                            <Button type="button" variant="outline" size="sm" disabled={isUploading} asChild>
                              <span className="flex items-center gap-1">
                                {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                                Upload
                              </span>
                            </Button>
                          </label>
                        </div>
                        {paymentAdviceUrl && (
                          <a href={paymentAdviceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                            <ExternalLink className="h-3 w-3" /> Preview uploaded document
                          </a>
                        )}
                      </div>

                      {/* Optional payment details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm font-medium">Transaction ID</Label>
                          <Input placeholder="e.g. TXN-12345" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Payment Method</Label>
                          <Input placeholder="e.g. Bank Transfer, MPESA" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1" />
                        </div>
                        <div className="sm:col-span-2">
                          <Label className="text-sm font-medium">Reference</Label>
                          <Input placeholder="Internal payment reference..." value={reference} onChange={(e) => setReference(e.target.value)} className="mt-1" />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handleAction} disabled={isSubmitting || isUploading || !paymentAdviceUrl} className="gap-2 bg-blue-600 hover:bg-blue-700">
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
                          Confirm Payment
                        </Button>
                        <Button variant="ghost" onClick={resetAction}>Cancel</Button>
                      </div>
                    </div>
                  )}

                  {actionMode === "make_revision" && (
                    <div className="space-y-4">
                      {status === PaymentVoucherStatus.PENDING_FINANCE_APPROVAL ? (
                        <Alert className="border-primary/20 bg-primary/5 dark:bg-primary/10">
                          <RotateCcw className="h-4 w-4 text-primary" />
                          <AlertDescription className="text-foreground/90 text-sm">
                            You are editing this payment voucher while it is still pending finance approval. Your changes will be saved and the voucher will remain pending finance approval.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert className="border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10">
                          <RotateCcw className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          <AlertDescription className="text-amber-700 dark:text-amber-300 text-sm">
                            <span className="font-semibold block mb-1">Feedback from Finance Approver:</span>
                            <span className="italic block bg-muted/60 p-2 rounded text-foreground/90 my-2">
                              {`"${voucher.revision?.comment || "No feedback comments provided."}"`}
                            </span>
                            Please address this feedback by updating the details below.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Currency</Label>
                        <Input value={paymentRequest?.currency || "KES"} disabled className="bg-muted" />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Revised Amount <span className="text-destructive">*</span></Label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3 text-muted-foreground text-sm font-medium">{paymentRequest?.currency || "KES"}</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            className="pl-16"
                            value={revisedAmount}
                            onChange={(e) => setRevisedAmount(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Revision Comments / Notes <span className="text-destructive">*</span></Label>
                        <Textarea
                          placeholder="Provide details or explain how you addressed the feedback..."
                          value={revisedComments}
                          onChange={(e) => setRevisedComments(e.target.value)}
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button onClick={handleAction} disabled={isSubmitting} className="gap-2 bg-amber-600 hover:bg-amber-700">
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          Submit Revision
                        </Button>
                        <Button variant="ghost" onClick={resetAction}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
