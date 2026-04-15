export enum LpoStatus {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  HOD_APPROVED = "hod_approved",
  FINANCE_APPROVED = "finance_approved",
  REJECTED = "rejected",
}

export interface LpoItem {
  noOfDays: number;
  description: string;
  quantity: number;
  rate: number;
  total: number;
}

export interface Lpo {
  _id: string;
  projectId: {
    _id: string;
    name: string;
    description: string;
  };
  supplierId: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    kraPin?: string;
  };
  lpoNo: string;
  lpoDate: string;
  items: LpoItem[];
  subTotal: number;
  vatAmount: number;
  totalAmount: number;
  currency: string;
  status: LpoStatus;
  validityDays: number;
  preparedBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}
