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
  amendmentNumber: string;
  description: string;
  date: string;
  approvedBy: string;
  _id: string;
}

export interface Contract {
  _id: string;
  contractNumber: string;
  title: string;
  description: string;
  contractorId: string;
  contractValue: number;
  currency: string;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
  status: 'active' | 'completed' | 'pending' | 'terminated'; 
  procurementMethod: string;
  procurementReferenceNumber: string;
  terms: Term[];
  deliverables: Deliverable[];
  paymentSchedule: PaymentSchedule[];
  requiresPerformanceSecurity: boolean;
  performanceSecurityAmount: number;
  amendments: Amendment[];
  createdBy: string;
  contractManagerId: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  projectId: string;
}

export interface ContractStats {
  totalContracts: number;
  activeContracts: number;
  totalValue: number;
  completedDeliverables: number;
  pendingPayments: number;
}