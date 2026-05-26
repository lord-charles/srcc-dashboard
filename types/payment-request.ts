// ─── Payment Request Types ──────────────────────────────────────────────────

export enum PaymentRequestStatus {
  PENDING_HOD_APPROVAL = "pending_hod_approval",
  HOD_APPROVED = "hod_approved",
  REVISION_REQUESTED = "revision_requested",
  REJECTED = "rejected",
}

export enum PaymentVoucherStatus {
  PENDING_FINANCE_APPROVAL = "pending_finance_approval",
  APPROVED = "approved",
  REVISION_REQUESTED = "revision_requested",
  REJECTED = "rejected",
  PAID = "paid",
}

export interface AuditEntry {
  actionBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  action: string;
  actionAt: string;
  comments?: string;
}

export interface ApprovalInfo {
  approvedBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  approvedAt: string;
  comments?: string;
}

export interface RejectionInfo {
  rejectedBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  rejectedAt: string;
  reason: string;
}

export interface RevisionInfo {
  requestedBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  requestedAt: string;
  comment: string;
}

export interface PaymentInfo {
  paidBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  paidAt: string;
  transactionId?: string;
  paymentMethod?: string;
  reference?: string;
  paymentAdviceUrl?: string;
}

// ─── Payment Request ─────────────────────────────────────────────────────────

export interface PaymentRequest {
  _id: string;
  projectId: {
    _id: string;
    name: string;
    department?: string;
    currency?: string;
  };
  lpoId: {
    _id: string;
    lpoNo: string;
    totalAmount: number;
    preparedBy?: string;
    status?: string;
  };
  amount: number;
  currency: string;
  description?: string;
  grnUrl?: string;
  requestedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phoneNumber?: string;
  };
  status: PaymentRequestStatus;
  approval?: ApprovalInfo;
  rejection?: RejectionInfo;
  revision?: RevisionInfo;
  auditTrail: AuditEntry[];
  createdAt: string;
  updatedAt: string;
}

// ─── Payment Voucher ─────────────────────────────────────────────────────────

export interface PaymentVoucher {
  _id: string;
  voucherNo: string;
  paymentRequestId: PaymentRequest;
  amount: number;
  preparedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  status: PaymentVoucherStatus;
  approval?: ApprovalInfo;
  rejection?: RejectionInfo;
  revision?: RevisionInfo;
  payment?: PaymentInfo;
  auditTrail: AuditEntry[];
  createdAt: string;
  updatedAt: string;
}

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface CreatePaymentRequestPayload {
  projectId: string;
  lpoId: string;
  amount: number;
  currency: string;
  description?: string;
  grnUrl?: string;
}

export interface ApprovePayload {
  comments?: string;
}

export interface RejectPayload {
  reason: string;
}

export interface RevisionPayload {
  comment: string;
}

export interface CreateVoucherPayload {
  paymentRequestId: string;
  amount: number;
}

export interface PayVoucherPayload {
  transactionId?: string;
  paymentMethod?: string;
  reference?: string;
  paymentAdviceUrl: string;
}
