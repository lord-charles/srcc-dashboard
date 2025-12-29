import { BudgetApprovalFlow, User } from "./project";

export interface BudgetItem {
  name: string;
  description: string;
  estimatedAmount: number;
  actualAmount: number;
  tags: string[];
  frequency: 'one-time' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate?: string;
  endDate?: string;
}

export interface BudgetAuditTrailItem {
  _id: string;
  action:
  | "CREATED"
  | "SUBMITTED_FOR_APPROVAL"
  | "REVISION_REQUESTED"
  | "APPROVED";
  performedBy: User;
  performedAt: string;
  details?: {
    status?: string;
    from?: string;
    to?: string;
    comments?: string;
    changes?: string[];
    returnToStatus?: string;
    returnToLevel?: string;
    previousVersion?: number;
    level?: string;
    approvers?: Array<{
      id: string;
      name: string;
      role: string;
    }>;
  };
}

export interface BudgetCategory {
  name: string;
  description: string;
  items: BudgetItem[];
  tags: string[];
}

export interface Budget {
  _id: string;
  projectId: {
    _id: string;
    name: string;
    description: string;
    status: string;
  };
  internalCategories: BudgetCategory[];
  externalCategories: BudgetCategory[];
  currency: string;
  totalInternalBudget: number;
  totalExternalBudget: number;
  totalInternalSpent: number;
  totalExternalSpent: number;
  version: number;
  status: 'draft' | 'pending_checker_approval' | 'pending_manager_approval' | 'pending_finance_approval' | 'approved' | 'rejected' | 'revision_requested';
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    employeeId: string;
  };
  updatedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    employeeId: string;
  };
  notes: string;
  createdAt: string;
  updatedAt: string;
  auditTrail: BudgetAuditTrailItem[];
  currentLevelDeadline?: string;
  approvalFlow: BudgetApprovalFlow;
}

export interface CreateBudgetDTO {
  projectId: string;
  internalCategories: BudgetCategory[];
  externalCategories: BudgetCategory[];
  currency: string;
  totalInternalBudget: number;
  totalExternalBudget: number;
  notes?: string;
}

export interface UpdateBudgetDTO extends Partial<CreateBudgetDTO> { }
