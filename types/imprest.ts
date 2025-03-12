import { User } from "./user";

export interface ImprestApproval {
  _id: string;
  approvedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  approvedAt: string
  comments?: string;
}

export interface ImprestRejection {
  _id: string;
  rejectedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  rejectedAt: string
  reason: string;
}

export interface ImprestDisbursement {
  _id: string;
  disbursedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  disbursedAt: string
  paymentReference: string;
}

export interface ImprestReceipt {
  _id: string;
  description: string;
  amount: number;
  currency: string;
  receiptUrl: string;
  uploadedAt: string
}

export interface ImprestAccounting {
  verifiedBy: User;
  verifiedAt: string
  receipts: ImprestReceipt[];
  totalAmount: number;
  balance: number;
  comments?: string;
}

export type ImprestStatus = 
  | "pending_hod"
  | "pending_accountant"
  | "approved"
  | "rejected"
  | "disbursed"
  | "accounted"
  | "overdue";

export interface Imprest {
  _id: string;
  requestedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    payrollNumber: string;
  };
  amount: number;
  currency: string;
  paymentType: string;
  paymentReason: string;
  requestDate: string
  dueDate: string
  status: ImprestStatus;
  approvals?: ImprestApproval[];
  rejections?: ImprestRejection[];
  disbursement?: ImprestDisbursement;
  receipts?: ImprestReceipt[];
  accounting?: ImprestAccounting;
  accountedAt?: string
  createdAt: string
  updatedAt: string
  hodApproval?: ImprestApproval;
  accountantApproval?: ImprestApproval;
}
