"use client";

import { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  approvePaymentRequest,
  rejectPaymentRequest,
  requestPaymentRequestRevision,
  createPaymentVoucher,
} from "@/services/payment-request.service";
import type { PaymentRequest } from "@/types/payment-request";
import { PaymentRequestStatus } from "@/types/payment-request";

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
  request: PaymentRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRoles?: string[];
  onSuccess?: () => void;
}

type ActionMode = null | "approve" | "reject" | "revision" | "create_voucher";

export function PaymentRequestDetailsSheet({
  request,
  open,
  onOpenChange,
  userRoles = [],
  onSuccess,
}: Props) {
  const { toast } = useToast();
  const [actionMode, setActionMode] = useState<ActionMode>(null);
  const [comment, setComment] = useState("");
  const [voucherAmount, setVoucherAmount] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!request) return null;

  const status = request.status;
  const config = statusConfig[status] || statusConfig.pending_hod_approval;

  const isHod = userRoles.includes("hod") || userRoles.includes("admin");
  const isSrccChecker = userRoles.includes("srcc_checker") || userRoles.includes("admin");

  const canApproveReject = isHod && status === PaymentRequestStatus.PENDING_HOD_APPROVAL;
  const canCreateVoucher = isSrccChecker && status === PaymentRequestStatus.HOD_APPROVED;

  const handleAction = async () => {
    if (!request) return;
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
    };

    toast({ title: "Success", description: messages[actionMode!] });
    setActionMode(null);
    setComment("");
    setVoucherAmount("");
    onSuccess?.();
    onOpenChange(false);
  };

  const resetAction = () => {
    setActionMode(null);
    setComment("");
    setVoucherAmount("");
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
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <SheetTitle className="text-xl">Payment Request Details</SheetTitle>
                <SheetDescription className="mt-1">
                  {(request.projectId as any)?.name || "Project"} — {(request.lpoId as any)?.lpoNo || "LPO"}
                </SheetDescription>
              </div>
            </div>
            <Badge className={`flex items-center gap-1 ${config.className}`}>
              {config.icon} {config.label}
            </Badge>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 py-5 space-y-6">

            {/* Rejection / Revision banners */}
            {status === "rejected" && request.rejection && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Rejected</AlertTitle>
                <AlertDescription>
                  <span className="font-medium">{request.rejection.rejectedBy?.firstName} {request.rejection.rejectedBy?.lastName}</span>{" "}
                  rejected on {format(new Date(request.rejection.rejectedAt), "MMM d, yyyy")}.<br />
                  <span className="mt-1 block">Reason: {request.rejection.reason}</span>
                </AlertDescription>
              </Alert>
            )}

            {status === "revision_requested" && request.revision && (
              <Alert className="border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10">
                <RotateCcw className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertTitle className="text-amber-700 dark:text-amber-300">Revision Requested</AlertTitle>
                <AlertDescription className="text-amber-600 dark:text-amber-400">
                  <span className="font-medium">{request.revision.requestedBy?.firstName} {request.revision.requestedBy?.lastName}</span>{" "}
                  requested revision on {format(new Date(request.revision.requestedAt), "MMM d, yyyy")}.<br />
                  <span className="mt-1 block">{request.revision.comment}</span>
                </AlertDescription>
              </Alert>
            )}

            {status === "hod_approved" && request.approval && (
              <Alert className="border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10">
                <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <AlertTitle className="text-emerald-700 dark:text-emerald-300">HOD Approved</AlertTitle>
                <AlertDescription className="text-emerald-600 dark:text-emerald-400">
                  Approved by <span className="font-medium">{request.approval.approvedBy?.firstName} {request.approval.approvedBy?.lastName}</span>{" "}
                  on {format(new Date(request.approval.approvedAt), "MMM d, yyyy")}.
                  {request.approval.comments && <span className="block mt-1">{request.approval.comments}</span>}
                </AlertDescription>
              </Alert>
            )}

            {/* Financial Summary */}
            <Card>
              <CardHeader className="pb-3 pt-4 px-5">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Financial Details
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Requested Amount</p>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {request.currency} {request.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">LPO Total</p>
                    <p className="text-lg font-semibold mt-1">
                      {request.currency} {(request.lpoId as any)?.totalAmount?.toLocaleString() || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Currency</p>
                    <p className="font-medium">{request.currency}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">LPO Number</p>
                    <p className="font-medium">{(request.lpoId as any)?.lpoNo || "—"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Request Info */}
            <Card>
              <CardHeader className="pb-3 pt-4 px-5">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Request Information
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Requested by:</span>
                  <span className="font-medium">
                    {request.requestedBy?.firstName} {request.requestedBy?.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Project:</span>
                  <span className="font-medium">{(request.projectId as any)?.name || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Submitted:</span>
                  <span className="font-medium">{format(new Date(request.createdAt), "MMM d, yyyy HH:mm")}</span>
                </div>
                {request.description && (
                  <div className="flex gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-muted-foreground">Description:</span>
                      <p className="mt-0.5 text-foreground/80">{request.description}</p>
                    </div>
                  </div>
                )}
                {request.grnUrl && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">GRN:</span>
                    <a
                      href={request.grnUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 font-medium"
                    >
                      View Document <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Audit Trail */}
            <Card>
              <CardHeader className="pb-3 pt-4 px-5">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Audit Trail
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {request.auditTrail?.length > 0 ? (
                  <AuditTimeline entries={request.auditTrail} />
                ) : (
                  <p className="text-sm text-muted-foreground">No audit history yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Action Panel */}
            {(canApproveReject || canCreateVoucher) && (
              <Card className="border-2 border-primary/20">
                <CardHeader className="pb-3 pt-4 px-5">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wide">
                    {canApproveReject ? "HOD Actions" : "Finance Checker Actions"}
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
                          <Button
                            variant="default"
                            className="gap-2 bg-green-600 hover:bg-green-700"
                            onClick={() => setActionMode("approve")}
                          >
                            <Check className="h-4 w-4" /> Approve
                          </Button>
                          <Button
                            variant="outline"
                            className="gap-2 border-amber-500 text-amber-700 hover:bg-amber-50"
                            onClick={() => setActionMode("revision")}
                          >
                            <RotateCcw className="h-4 w-4" /> Request Revision
                          </Button>
                          <Button
                            variant="outline"
                            className="gap-2 border-red-500 text-red-700 hover:bg-red-50"
                            onClick={() => setActionMode("reject")}
                          >
                            <X className="h-4 w-4" /> Reject
                          </Button>
                        </>
                      )}
                      {canCreateVoucher && (
                        <Button
                          variant="default"
                          className="gap-2"
                          onClick={() => { setActionMode("create_voucher"); setVoucherAmount(request.amount); }}
                        >
                          <FileText className="h-4 w-4" /> Create Payment Voucher
                        </Button>
                      )}
                    </div>
                  )}

                  {actionMode === "approve" && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Approval Comments (optional)</Label>
                      <Textarea
                        placeholder="Add any comments for the approval..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                      />
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
                      <Textarea
                        placeholder="Explain why this request is being rejected..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                      />
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
                      <Textarea
                        placeholder="Describe what needs to be corrected..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleAction}
                          disabled={isSubmitting}
                          className="gap-2 bg-amber-600 hover:bg-amber-700"
                        >
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                          Send for Revision
                        </Button>
                        <Button variant="ghost" onClick={resetAction}>Cancel</Button>
                      </div>
                    </div>
                  )}

                  {actionMode === "create_voucher" && (
                    <div className="space-y-3">
                      <Alert className="bg-blue-50 border-blue-200">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-700 text-sm">
                          Creating a voucher for this approved payment request. The Finance Approver will be notified.
                        </AlertDescription>
                      </Alert>
                      <div>
                        <Label className="text-sm font-medium">Voucher Amount <span className="text-destructive">*</span></Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          Must not exceed request amount of {request.currency} {request.amount.toLocaleString()}
                        </p>
                        <div className="relative flex items-center">
                          <span className="absolute left-3 text-muted-foreground text-sm font-medium">{request.currency}</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            className="pl-16"
                            value={voucherAmount}
                            onChange={(e) => setVoucherAmount(e.target.value === "" ? "" : parseFloat(e.target.value))}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleAction} disabled={isSubmitting} className="gap-2">
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                          Create Voucher
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
