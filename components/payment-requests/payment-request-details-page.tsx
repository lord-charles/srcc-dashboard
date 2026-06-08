"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  X,
  User,
  Calendar,
  FileText,
  ExternalLink,
  MessageSquare,
  RotateCcw,
  ChevronRight,
  Check,
  Building2,
  DollarSign,
  ArrowLeft,
  Paperclip,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { cloudinaryService } from "@/lib/cloudinary-service";
import {
  approvePaymentRequest,
  rejectPaymentRequest,
  requestPaymentRequestRevision,
  createPaymentVoucher,
  updatePaymentRequest,
  getLpoRemainingBalance,
  getPaymentVouchers,
  getPaymentRequestById,
} from "@/services/payment-request.service";
import type { PaymentRequest, PaymentVoucher } from "@/types/payment-request";
import { PaymentRequestStatus } from "@/types/payment-request";
import { cn } from "@/lib/utils";

// ─── Status Config ────────────────────────────────────────────────────────────
const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string; icon: React.ReactNode }
> = {
  pending_hod_approval: {
    label: "Pending HOD Approval",
    variant: "outline",
    className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  hod_approved: {
    label: "HOD Approved",
    variant: "outline",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
  },
  revision_requested: {
    label: "Revision Requested",
    variant: "outline",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: <RotateCcw className="h-3.5 w-3.5" />,
  },
  rejected: {
    label: "Rejected",
    variant: "outline",
    className: "bg-destructive/10 text-destructive border-destructive/20",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};

// ─── Timeline Component ───────────────────────────────────────────────────────
function AuditTimeline({ entries }: { entries: PaymentRequest["auditTrail"] }) {
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
  initialRequest: PaymentRequest;
}

type ActionMode = null | "approve" | "reject" | "revision" | "create_voucher" | "make_revision";

export function PaymentRequestDetailsPage({ initialRequest }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [request, setRequest] = useState<PaymentRequest>(initialRequest);
  const [actionMode, setActionMode] = useState<ActionMode>(null);
  const [comment, setComment] = useState("");
  const [voucherAmount, setVoucherAmount] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States for making revisions
  const [revisedAmount, setRevisedAmount] = useState("");
  const [revisedCurrency, setRevisedCurrency] = useState("KES");
  const [revisedDescription, setRevisedDescription] = useState("");
  const [revisedGrnUrl, setRevisedGrnUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [revisedAttachments, setRevisedAttachments] = useState<
    Array<{ url: string; name: string; status: "uploading" | "done" | "error" }>
  >([]);

  const handleRevisedFileUpload = async (files: File[]) => {
    if (!files.length) return;

    for (const file of files) {
      setRevisedAttachments((prev) => [
        ...prev,
        { url: "", name: file.name, status: "uploading" },
      ]);

      cloudinaryService.uploadFile(file)
        .then((url) => {
          setRevisedAttachments((prev) =>
            prev.map((a) =>
              a.name === file.name && a.status === "uploading"
                ? { url, name: file.name, status: "done" }
                : a
            )
          );
          toast({ title: "Uploaded", description: `${file.name} uploaded successfully.` });
        })
        .catch(() => {
          setRevisedAttachments((prev) =>
            prev.map((a) =>
              a.name === file.name && a.status === "uploading"
                ? { ...a, status: "error" }
                : a
            )
          );
          toast({ title: "Upload failed", description: `Could not upload ${file.name}.`, variant: "destructive" });
        });
    }
  };

  // Existing vouchers list
  const [existingVouchers, setExistingVouchers] = useState<PaymentVoucher[]>([]);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);

  const refreshRequestData = async () => {
    const res = await getPaymentRequestById(request._id);
    if (res.success) {
      setRequest(res.data);
    }
    fetchExistingVouchers();
  };

  useEffect(() => {
    fetchExistingVouchers();
  }, [request._id]);

  const fetchExistingVouchers = async () => {
    setIsLoadingVouchers(true);
    const res = await getPaymentVouchers({ paymentRequestId: request._id });
    if (res.success) {
      setExistingVouchers(res.data);
    }
    setIsLoadingVouchers(false);
  };

  const status = request.status;
  const config = statusConfig[status] || statusConfig.pending_hod_approval;

  const userRoles = session?.user?.roles || [];
  const isHod = userRoles.includes("hod") || userRoles.includes("admin");
  const isSrccChecker = userRoles.includes("srcc_checker") || userRoles.includes("admin");

  const canApproveReject = status === PaymentRequestStatus.PENDING_HOD_APPROVAL;
  const canCreateVoucher = status === PaymentRequestStatus.HOD_APPROVED;

  const currentUserId = session?.user?.id;
  const requestUserId = request.requestedBy?._id || (typeof request.requestedBy === "string" ? request.requestedBy : (request.requestedBy as any));
  const isRequester = !!currentUserId && !!requestUserId && currentUserId === requestUserId;
  const canMakeRevision = (
    status === PaymentRequestStatus.REVISION_REQUESTED ||
    status === PaymentRequestStatus.PENDING_HOD_APPROVAL
  ) && isRequester;

  const handleAction = async () => {
    setIsSubmitting(true);
    setError(null);

    let res: any;

    if (actionMode === "approve") {
      res = await approvePaymentRequest(request._id, { comments: comment });
    } else if (actionMode === "reject") {
      if (!comment.trim()) { setError("Rejection reason is required"); setIsSubmitting(false); return; }
      res = await rejectPaymentRequest(request._id, { reason: comment });
    } else if (actionMode === "revision") {
      if (!comment.trim()) { setError("Revision comment is required"); setIsSubmitting(false); return; }
      res = await requestPaymentRequestRevision(request._id, { comment });
    } else if (actionMode === "create_voucher") {
      const amt = Number(voucherAmount);
      if (!amt || amt <= 0) { setError("Valid voucher amount is required"); setIsSubmitting(false); return; }
      if (amt > request.amount) { setError(`Voucher amount cannot exceed request amount of ${request.currency} ${request.amount.toLocaleString()}`); setIsSubmitting(false); return; }
      res = await createPaymentVoucher({ paymentRequestId: request._id, amount: amt });
    } else if (actionMode === "make_revision") {
      const amt = Number(revisedAmount);
      if (!amt || amt <= 0) { setError("Valid amount is required"); setIsSubmitting(false); return; }
      if (!revisedDescription.trim()) { setError("Description / Reason for Revision is required"); setIsSubmitting(false); return; }

      const balRes = await getLpoRemainingBalance((request.lpoId as any)?._id || request.lpoId, request._id);
      if (balRes.success) {
        const balance = balRes.data.balance;
        if (amt > balance) {
          setError(`Amount exceeds the LPO remaining balance of ${request.currency} ${balance.toLocaleString()}`);
          setIsSubmitting(false);
          return;
        }
      }

      const uploadedAttachments = revisedAttachments.filter((a) => a.status === "done").map((a) => a.url);

      res = await updatePaymentRequest(request._id, {
        projectId: (request.projectId as any)?._id || request.projectId,
        lpoId: (request.lpoId as any)?._id || request.lpoId,
        amount: amt,
        currency: revisedCurrency,
        description: revisedDescription,
        grnUrl: uploadedAttachments.length > 0 ? uploadedAttachments[0] : (revisedGrnUrl || undefined),
        attachments: uploadedAttachments,
      });
    }

    setIsSubmitting(false);

    if (!res?.success) {
      setError(res?.error || "An error occurred");
      return;
    }

    const messages: Record<NonNullable<ActionMode>, string> = {
      approve: "Payment request approved. Finance Checker has been notified.",
      reject: "Payment request rejected. Requester has been notified.",
      revision: "Revision requested. Requester has been notified.",
      create_voucher: "Payment voucher created. Finance Approver has been notified.",
      make_revision: "Payment request revised and resubmitted successfully.",
    };

    toast({ title: "Success", description: messages[actionMode!] });
    setActionMode(null);
    setComment("");
    setVoucherAmount("");
    setRevisedAmount("");
    setRevisedDescription("");
    setRevisedGrnUrl("");
    refreshRequestData();
  };

  const resetAction = () => {
    setActionMode(null);
    setComment("");
    setVoucherAmount("");
    setRevisedAmount("");
    setRevisedDescription("");
    setRevisedGrnUrl("");
    setRevisedAttachments([]);
    setError(null);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      const projId = (request.projectId as any)?._id || request.projectId;
      router.push(`/projects/${projId}?tab=financial&financialtab=paymentrequests`);
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
              <h1 className="text-2xl font-bold tracking-tight">Payment Request</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {(request.projectId as any)?.name || "Project"} &middot; {(request.lpoId as any)?.lpoNo || "LPO"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`flex items-center gap-1.5 px-3 py-1 text-sm font-medium ${config.className}`}>
              {config.icon} {config.label}
            </Badge>
            {canMakeRevision && !actionMode && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-9 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                onClick={() => {
                  setActionMode("make_revision");
                  setRevisedAmount(request.amount.toString());
                  setRevisedCurrency(request.currency);
                  setRevisedDescription(request.description || "");
                  setRevisedGrnUrl(request.grnUrl || "");
                  const initialAtts = (request.attachments || (request.grnUrl ? [request.grnUrl] : [])).map((url) => ({
                    url,
                    name: url.split("/").pop() || "Attached Document",
                    status: "done" as const,
                  }));
                  setRevisedAttachments(initialAtts);
                }}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {status === PaymentRequestStatus.PENDING_HOD_APPROVAL ? "Edit Request" : "Revise Request"}
              </Button>
            )}
          </div>
        </div>

        {/* ── Main Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
          {/* Left Columns (3 span) */}
          <div className="lg:col-span-3 space-y-6">
            {actionMode !== "make_revision" && (
              <>
                {/* Rejection / Revision banners */}
                {status === "rejected" && request.rejection && (
                  <Alert variant="destructive" className="border-red-500/30 bg-red-500/5">
                    <XCircle className="h-5 w-5 mt-0.5" />
                    <div>
                      <AlertTitle className="font-semibold">Rejected</AlertTitle>
                      <AlertDescription className="mt-1 text-sm">
                        Rejected by <span className="font-medium text-foreground">{request.rejection.rejectedBy?.firstName} {request.rejection.rejectedBy?.lastName}</span> on {format(new Date(request.rejection.rejectedAt), "MMM d, yyyy")}.
                        <span className="mt-2 block bg-destructive/10 p-3 rounded font-mono text-xs border border-destructive/20">{request.rejection.reason}</span>
                      </AlertDescription>
                    </div>
                  </Alert>
                )}

                {status === "revision_requested" && request.revision && (
                  <Alert className="border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10">
                    <RotateCcw className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div>
                      <AlertTitle className="text-amber-700 dark:text-amber-300 font-semibold">Revision Requested</AlertTitle>
                      <AlertDescription className="text-amber-600 dark:text-amber-400 mt-1 text-sm">
                        Requested by <span className="font-medium text-foreground">{request.revision.requestedBy?.firstName} {request.revision.requestedBy?.lastName}</span> on {format(new Date(request.revision.requestedAt), "MMM d, yyyy")}.
                        <span className="mt-2 block bg-amber-500/10 p-3 rounded italic text-foreground border border-amber-500/20">{request.revision.comment}</span>
                      </AlertDescription>
                    </div>
                  </Alert>
                )}

                {status === "hod_approved" && request.approval && (
                  <Alert className="border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10">
                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                    <div>
                      <AlertTitle className="text-emerald-700 dark:text-emerald-300 font-semibold">HOD Approved</AlertTitle>
                      <AlertDescription className="text-emerald-600 dark:text-emerald-400 mt-1 text-sm">
                        Approved by <span className="font-medium text-foreground">{request.approval.approvedBy?.firstName} {request.approval.approvedBy?.lastName}</span> on {format(new Date(request.approval.approvedAt), "MMM d, yyyy")}.
                        {request.approval.comments && (
                          <span className="mt-2 block bg-emerald-500/10 p-3 rounded text-foreground border border-emerald-500/20">{request.approval.comments}</span>
                        )}
                      </AlertDescription>
                    </div>
                  </Alert>
                )}

                {/* Financial Summary */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-4 border-b border-border/60">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Financial Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Requested Amount</p>
                        <p className="text-3xl font-extrabold text-primary mt-2">
                          {request.currency} {request.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="bg-muted/40 rounded-xl p-5 border border-border/40">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">LPO Total Amount</p>
                        <p className="text-2xl font-bold text-foreground/90 mt-2">
                          {request.currency} {(request.lpoId as any)?.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "—"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Details info */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-4 border-b border-border/60">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Request details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-muted-foreground">Requested by</span>
                        <span className="font-semibold text-foreground">
                          {request.requestedBy?.firstName} {request.requestedBy?.lastName}
                        </span>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-muted-foreground">Project Name</span>
                        <span className="font-semibold text-foreground">{(request.projectId as any)?.name || "—"}</span>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-muted-foreground">LPO Number</span>
                        <span className="font-mono text-sm font-semibold text-primary">{(request.lpoId as any)?.lpoNo || "—"}</span>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-muted-foreground">Submitted Date</span>
                        <span className="font-semibold text-foreground">{format(new Date(request.createdAt), "MMMM d, yyyy HH:mm")}</span>
                      </div>
                    </div>

                    {request.description && (
                      <div className="pt-4 border-t border-border/65">
                        <span className="text-xs text-muted-foreground block mb-1">Description</span>
                        <p className="text-sm text-foreground/80 leading-relaxed bg-muted/30 p-3.5 rounded-lg border border-border/40">
                          {request.description}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Action Panel */}
            {(canApproveReject || canCreateVoucher || !!actionMode) && (
              <Card className="border-2 border-primary/20 shadow-md">
                <CardHeader className="pb-4 border-b border-border/60 bg-primary/5">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary">
                    {canApproveReject ? "HOD Actions" : canCreateVoucher ? "Finance Checker Actions" : "Edit Request"}
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
                          <Button
                            variant="default"
                            className="gap-2 bg-green-600 hover:bg-green-700 h-11 px-5 text-sm font-semibold"
                            onClick={() => setActionMode("approve")}
                          >
                            <Check className="h-4 w-4" /> Approve Request
                          </Button>
                          <Button
                            variant="outline"
                            className="gap-2 border-amber-500 text-amber-700 hover:bg-amber-50 h-11 px-5 text-sm font-semibold"
                            onClick={() => setActionMode("revision")}
                          >
                            <RotateCcw className="h-4 w-4" /> Request Revision
                          </Button>
                          <Button
                            variant="outline"
                            className="gap-2 border-red-500 text-red-700 hover:bg-red-50 h-11 px-5 text-sm font-semibold"
                            onClick={() => setActionMode("reject")}
                          >
                            <X className="h-4 w-4" /> Reject Request
                          </Button>
                        </>
                      )}
                      {canCreateVoucher && (
                        <Button
                          variant="default"
                          className="gap-2 h-11 px-5 text-sm font-semibold bg-primary hover:bg-primary/90"
                          onClick={() => { setActionMode("create_voucher"); setVoucherAmount(request.amount); }}
                        >
                          <FileText className="h-4 w-4" /> Create Payment Voucher
                        </Button>
                      )}
                    </div>
                  )}

                  {actionMode === "approve" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Approval Comments (optional)</Label>
                        <Textarea
                          placeholder="Add any comments or notes for this approval..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          rows={4}
                          className="resize-none text-sm"
                        />
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
                        <Textarea
                          placeholder="Explain why this request is being rejected..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          rows={4}
                          className="resize-none text-sm"
                        />
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
                        <Textarea
                          placeholder="Describe what needs to be corrected by the requester..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          rows={4}
                          className="resize-none text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleAction}
                          disabled={isSubmitting}
                          className="gap-2 bg-amber-600 hover:bg-amber-700 h-10 px-4"
                        >
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                          Send for Revision
                        </Button>
                        <Button variant="ghost" onClick={resetAction} className="h-10">Cancel</Button>
                      </div>
                    </div>
                  )}

                  {actionMode === "create_voucher" && (
                    <div className="space-y-4">
                      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50">
                        <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <AlertDescription className="text-blue-700 dark:text-blue-400 text-sm">
                          Creating a payment voucher for this approved request. The Finance Approver will review and sign off.
                        </AlertDescription>
                      </Alert>

                      {existingVouchers.length > 0 && (
                        <div className="border border-amber-200 dark:border-amber-800/40 bg-amber-500/5 dark:bg-amber-500/10 rounded-lg p-4 space-y-2.5">
                          <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
                            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" /> Vouchers Already Created for this Request
                          </div>
                          <div className="divide-y divide-amber-200/30 dark:divide-amber-800/20 text-xs">
                            {existingVouchers.map((v) => (
                              <div key={v._id} className="py-2.5 flex items-center justify-between gap-4">
                                <a
                                  href={`/payment-vouchers/${v._id}`}
                                  className="font-semibold text-primary hover:underline"
                                >
                                  {v.voucherNo}
                                </a>
                                <span className="text-muted-foreground font-medium">{request.currency} {v.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                <Badge variant="outline" className="text-[10px] capitalize px-2 py-0.5 bg-background">
                                  {v.status.replace(/_/g, " ")}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Voucher Amount <span className="text-destructive">*</span></Label>
                        <p className="text-xs text-muted-foreground">
                          Must not exceed request amount of {request.currency} {request.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <div className="relative flex items-center mt-1">
                          <span className="absolute left-3 text-muted-foreground text-sm font-medium">{request.currency}</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            className="pl-16 h-10 text-sm"
                            value={voucherAmount}
                            onChange={(e) => setVoucherAmount(e.target.value === "" ? "" : parseFloat(e.target.value))}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleAction} disabled={isSubmitting} className="gap-2 h-10 px-4">
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                          Create Voucher
                        </Button>
                        <Button variant="ghost" onClick={resetAction} className="h-10">Cancel</Button>
                      </div>
                    </div>
                  )}

                  {actionMode === "make_revision" && (
                    <div className="space-y-5">
                      {status === PaymentRequestStatus.PENDING_HOD_APPROVAL ? (
                        <Alert className="border-primary/20 bg-primary/5 dark:bg-primary/10">
                          <RotateCcw className="h-4 w-4 text-primary" />
                          <AlertDescription className="text-foreground/90 text-sm">
                            Editing payment request while it is still pending HOD approval. The request will remain pending.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert className="border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10">
                          <RotateCcw className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          <AlertDescription className="text-amber-700 dark:text-amber-300 text-sm">
                            <span className="font-semibold block mb-1">Feedback from HOD:</span>
                            <span className="italic block bg-muted/60 p-3 rounded-lg text-foreground/90 my-2">
                              {`"${request.revision?.comment || "No comments provided."}"`}
                            </span>
                            Please address this feedback below.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Currency</Label>
                        <Input value={revisedCurrency} disabled className="bg-muted" />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Revised Amount <span className="text-destructive">*</span></Label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3 text-muted-foreground text-sm font-medium">{revisedCurrency}</span>
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
                        <Label className="text-sm font-semibold">Description / Reason for Revision <span className="text-destructive">*</span></Label>
                        <Textarea
                          placeholder="Provide details or address the HOD's feedback..."
                          value={revisedDescription}
                          onChange={(e) => setRevisedDescription(e.target.value)}
                          rows={3}
                          className="text-sm resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Supporting Documents / GRN (Optional)</Label>
                        <div className="space-y-3">
                          <FileUpload
                            onChange={handleRevisedFileUpload}
                            multiple={true}
                          />

                          {revisedAttachments.length > 0 && (
                            <div className="space-y-2 mt-1">
                              {revisedAttachments.map((file, index) => (
                                <div
                                  key={index}
                                  className={cn(
                                    "flex items-center gap-3 px-3.5 py-2.5 rounded-lg border text-sm transition-colors",
                                    file.status === "uploading" && "bg-muted/30 border-border/60",
                                    file.status === "done" && "bg-background border-border",
                                    file.status === "error" && "bg-destructive/5 border-destructive/20"
                                  )}
                                >
                                  <div className={cn(
                                    "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
                                    file.status === "uploading" && "bg-muted",
                                    file.status === "done" && "bg-primary/10",
                                    file.status === "error" && "bg-destructive/10"
                                  )}>
                                    {file.status === "uploading" ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                                    ) : file.status === "done" ? (
                                      <FileText className="w-3.5 h-3.5 text-primary" />
                                    ) : (
                                      <X className="w-3.5 h-3.5 text-destructive" />
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    {file.status === "done" ? (
                                      <a
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-medium text-foreground hover:text-primary transition-colors truncate block"
                                      >
                                        {file.name}
                                      </a>
                                    ) : (
                                      <span className={cn("font-medium truncate block", file.status === "error" && "text-destructive")}>
                                        {file.name}
                                      </span>
                                    )}
                                    <span className={cn(
                                      "text-xs mt-0.5 block",
                                      file.status === "uploading" && "text-muted-foreground",
                                      file.status === "done" && "text-muted-foreground",
                                      file.status === "error" && "text-destructive/70"
                                    )}>
                                      {file.status === "uploading" && "Uploading..."}
                                      {file.status === "done" && "Uploaded"}
                                      {file.status === "error" && "Upload failed — please try again"}
                                    </span>
                                  </div>

                                  {file.status !== "uploading" && (
                                    <button
                                      type="button"
                                      onClick={() => setRevisedAttachments((prev) => prev.filter((_, i) => i !== index))}
                                      className="shrink-0 text-muted-foreground/50 hover:text-destructive transition-colors p-1 rounded"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button onClick={handleAction} disabled={isSubmitting || isUploading} className="gap-2 bg-amber-600 hover:bg-amber-700 h-10 px-4">
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
            {/* Supporting documents */}
            {((request.attachments && request.attachments.length > 0) || request.grnUrl) && (
              <Card className="shadow-sm">
                <CardHeader className="pb-4 border-b border-border/60">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Supporting Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="space-y-2.5">
                    {request.attachments && request.attachments.length > 0 ? (
                      request.attachments.map((url, i) => {
                        const name = decodeURIComponent(url.split("/").pop() || `Attachment ${i + 1}`);
                        return (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors text-sm"
                          >
                            <span className="flex items-center gap-2 truncate text-primary font-medium">
                              <Paperclip className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="truncate">{name}</span>
                            </span>
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          </a>
                        );
                      })
                    ) : (
                      <a
                        href={request.grnUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors text-sm"
                      >
                        <span className="flex items-center gap-2 truncate text-primary font-medium">
                          <Paperclip className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate">GRN Document</span>
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      </a>
                    )}
                  </div>
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
                {request.auditTrail?.length > 0 ? (
                  <AuditTimeline entries={request.auditTrail} />
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
