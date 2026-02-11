import { User } from "./user";

export interface ImprestApproval {
  approvedBy: User;
  approvedAt: string;
  comments?: string;
}

export interface ImprestRejection {
  rejectedBy: User;
  rejectedAt: string;
  reason: string;
}

export interface ImprestDisbursement {
  disbursedBy: User;
  disbursedAt: string;
  amount: number;
  comments?: string;
}

export interface ImprestReceipt {
  description: string;
  amount: number;
  receiptUrl: string;
  uploadedAt: string;
}

export interface ImprestAccounting {
  verifiedBy: User;
  verifiedAt: string;
  receipts: ImprestReceipt[];
  totalAmount: number;
  balance: number;
  comments?: string;
}

export interface ImprestAcknowledgment {
  acknowledgedBy: User;
  acknowledgedAt: string;
  received: boolean;
  comments?: string;
}

export interface ImprestDisputeResolution {
  resolvedBy: User;
  resolvedAt: string;
  resolution: "disbursed" | "cancelled";
  adminComments?: string;
}

export interface ImprestRevision {
  requestedBy: User;
  requestedAt: string;
  reason: string;
}

export interface ImprestAccountingRevision {
  requestedBy: User;
  requestedAt: string;
  reason: string;
}

export interface ImprestAttachment {
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

export type ImprestStatus =
  | "revision_requested"
  | "pending_hod"
  | "pending_accountant"
  | "pending_accounting_approval"
  | "approved"
  | "rejected"
  | "disbursed"
  | "pending_acknowledgment"
  | "disputed"
  | "resolved_dispute"
  | "accounted"
  | "overdue";

export type ImprestPaymentType =
  | "Contingency Cash"
  | "Travel Cash"
  | "Purchase Cash"
  | "Others";

export interface Imprest {
  _id: string;
  employeeName: string;
  department: string;
  requestDate: string;
  dueDate: string;
  paymentReason: string;
  currency: string;
  amount: number;
  paymentType: ImprestPaymentType;
  explanation: string;
  status: ImprestStatus;
  hasDisputeHistory?: boolean; // Track if this imprest was ever disputed
  requestedBy: User;
  hodApproval?: ImprestApproval;
  accountantApproval?: ImprestApproval;
  rejection?: ImprestRejection;
  disbursement?: ImprestDisbursement;
  acknowledgment?: ImprestAcknowledgment;
  disputeResolution?: ImprestDisputeResolution;
  revision?: ImprestRevision;
  accountingRevision?: ImprestAccountingRevision;
  accounting?: ImprestAccounting;
  attachments?: ImprestAttachment[];
  createdAt: string;
  updatedAt: string;
}
