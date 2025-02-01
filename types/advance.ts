export type PaymentMethod = "mpesa" | "bank" | "cash" | "wallet";

export type AdvanceStatus =
  | "pending"
  | "approved"
  | "declined"
  | "disbursed"
  | "repaying"
  | "repaid";

interface AdvanceEmployee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
}

export interface Advance {
  _id: string;
  employee: AdvanceEmployee;
  amount: number;
  amountRepaid: number;
  purpose: string;
  status: AdvanceStatus;
  requestedDate: string;
  repaymentPeriod: number;
  interestRate: number;
  totalRepayment: number;
  installmentAmount: number;
  comments: string;
  preferredPaymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
  __v: number;
  approvedBy?: AdvanceEmployee;
  approvedDate?: string;
  disbursedBy?: AdvanceEmployee;
  disbursedDate?: string;
}

export interface PaginatedAdvances {
  data: Advance[];
  total: number;
  page: number;
  limit: number;
}
