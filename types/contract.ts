export interface Term {
  clause: string;
  description: string;
  _id: string;
}

export interface Deliverable {
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  acceptanceCriteria: string[];
  _id: string;
}

export interface PaymentSchedule {
  milestone: string;
  amount: number;
  dueDate: string;
  paid: boolean;
  paymentDate: string;
  _id: string;
}

export interface Amendment {
  date?: string;
  description?: string;
  changedFields?: string[];
  approvedBy?: string;
  _id: string;
}

export interface ContractedUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export interface ProjectInfo {
  _id: string;
  name: string;
}

export interface Contract {
  _id: string;
  contractNumber: string;
  description: string;
  contractValue: number;
  currency: string;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "draft" | "terminated";
  projectId: ProjectInfo;
  contractedUserId: ContractedUser;
  amendments: Amendment[];
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;

  // Legacy fields - keeping for backward compatibility
  title?: string;
  contractorId?: string;
  procurementMethod?: string;
  procurementReferenceNumber?: string;
  terms?: Term[];
  deliverables?: Deliverable[];
  paymentSchedule?: PaymentSchedule[];
  requiresPerformanceSecurity?: boolean;
  performanceSecurityAmount?: number;
  contractManagerId?: string;
}

export interface ContractStats {
  totalContracts: number;
  activeContracts: number;
  totalValue: number;
  completedDeliverables: number;
  pendingPayments: number;
}
