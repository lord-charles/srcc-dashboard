export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface TeamMember {
  userId: User;
  startDate: string;
  endDate: string;
  responsibilities: string[];
  _id: string;
}

export interface CoachContract {
  rate: number;
  rateUnit: 'per_session' | 'per_hour';
  currency: 'KES' | 'USD';
  notes?: string;
}

export interface CoachAssignment {
  _id: string;
  userId: User;
  milestoneId: string;
  startDate?: string;
  endDate?: string;
  responsibilities: string[];
  contract: CoachContract;
}

export interface CoachManager {
  _id: string;
  userId: User;
  assignedDate: string;
  responsibilities: string[];
}

export interface CoachAssistant {
  _id: string;
  userId: User;
  assignedDate: string;
  responsibilities: string[];
}

export interface RiskAssessment {
  factors: string[];
  mitigationStrategies: string[];
  lastAssessmentDate: string | null;
  nextAssessmentDate: string | null;
}

export interface ProjectMilestone {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  completionDate?: string;
  budget: number;
  actualCost?: number | null;
}

export interface ProjectDocument {
  name: string;
  url: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  amount: number;
  taxRate: number;
  taxAmount: number;
}

export interface InvoiceFormItem {
  description: string;
  quantity: number;
  amount: number;
  taxRate: number;
}

export interface InvoiceFormState {
  items: InvoiceFormItem[];
  invoiceDate: string;
  dueDate: string;
  paymentTerms: string;
  notes: string;
}

export interface RevisionRequest {
  requestedBy: string;
  requestedAt: string;
  comments: string;
  changes: string[];
  returnToStatus: string;
  returnToLevel: string;
}

export interface AuditTrailItem {
  action: string;
  performedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  performedAt: string;
  details?: {
    status?: string;
    from?: string;
    to?: string;
    comments?: string;
    changes?: string[];
    returnToStatus?: string;
    returnToLevel?: string;
    level?: string;
  };
}

export interface InvoiceAuditTrailItem {
  _id: string;
  action:
    | "CREATED"
    | "SUBMITTED_FOR_APPROVAL"
    | "REVISION_REQUESTED"
    | "APPROVED"
    | "REJECTED";
  performedBy: User;
  performedAt: string;
  details?: {
    status?: string;
    from?: string;
    comments?: string;
    changes?: string[];
    returnToStatus?: string;
    returnToLevel?: string;
  };
}

export interface InvoiceRevisionRequest {
  _id: string;
  requestedBy: string;
  requestedAt: string;
  comments: string;
  changes: string[];
  returnToStatus: string;
  returnToLevel: string;
}

export interface Invoice {
  _id: string;
  projectId: string;
  invoiceNumber: string;
  issuedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  invoiceDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  totalTax: number;
  totalAmount: number;
  currency: string;
  status: "draft" | "pending_approval" | "approved" | "rejected" | "paid";
  paymentTerms: string;
  notes: string;
  createdBy: string;
  updatedBy: string;
  auditTrail: AuditTrailItem[];
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  revisionRequest?: RevisionRequest;
  actualInvoice?: string;
}

export interface Payment {
  _id: string;
  method: "bank_transfer" | "cheque" | "mpesa" | "cash";
  bankName?: string;
  accountNumber?: string;
  branchCode?: string;
  referenceNumber?: string;
  paidAt?: string; // ISO date string
  amountPaid?: number;
  receiptUrl?: string;
  comments?: string;
  recordedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface BudgetItem {
  name: string;
  description: string;
  estimatedAmount: number;
  actualAmount: number;
  tags: string[];
  frequency: string;
  startDate: string;
  endDate: string;
}

export interface BudgetCategory {
  name: string;
  description: string;
  items: BudgetItem[];
  tags: string[];
}

export interface BudgetApproval {
  approverId: string;
  approvedAt: string;
  comments: string;
  attachments: string[];
  _id: string;
}

export interface BudgetApprovalFlow {
  checkerApprovals: BudgetApproval[];
  managerApprovals: BudgetApproval[];
  financeApprovals: BudgetApproval[];
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

export interface Budget {
  _id: string;
  projectId: string;
  internalCategories: BudgetCategory[];
  externalCategories: BudgetCategory[];
  currency: string;
  totalInternalBudget: number;
  totalExternalBudget: number;
  totalInternalSpent: number;
  totalExternalSpent: number;
  version: number;
  status:
    | "draft"
    | "pending_checker_approval"
    | "pending_manager_approval"
    | "pending_finance_approval"
    | "approved"
    | "revision_requested"
    | "rejected";
  createdBy: User;
  updatedBy: User;
  notes: string;
  auditTrail: BudgetAuditTrailItem[];
  currentLevelDeadline?: string;
  approvalFlow: BudgetApprovalFlow;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ContractAmendment {
  date?: string;
  description?: string;
  changedFields?: string[];
  approvedBy?: string;
  _id?: string;
}
interface ContractedUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}
export interface Contract {
  _id: string;
  contractNumber: string;
  description: string;
  contractValue: number;
  currency: string;
  status:
    | "draft"
    | "pending_signature"
    | "active"
    | "suspended"
    | "terminated"
    | "completed";
  createdBy: string | User;
  updatedBy: string | User;
  startDate?: string;
  endDate?: string;
  projectId: string;
  contractedUserId: ContractedUser;
  amendments: ContractAmendment[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface AssistantProjectManager {
  userId: User;
  contractId?: Contract;
  assignedDate: string;
  responsibilities: string[];
  _id: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  totalBudget: number;
  totalProjectValue: number;
  currency: string;
  contractStartDate: string;
  contractEndDate: string;
  client: string;
  department: string;
  status: "active" | "completed" | "cancelled" | "on-hold";
  createdBy: User | null;
  updatedBy: User | null;
  projectManagerId: User;
  assistantProjectManagers?: AssistantProjectManager[];
  teamMembers: TeamMember[];
  coaches?: CoachAssignment[];
  coachManagers?: CoachManager[];
  coachAssistants?: CoachAssistant[];
  procurementMethod: string;
  projectProposalUrl: string;
  signedContractUrl: string;
  executionMemoUrl: string;
  signedBudgetUrl: string;
  riskLevel: "Low" | "Medium" | "High";
  riskAssessment: RiskAssessment;
  reportingFrequency: "Daily" | "Weekly" | "Monthly" | "Quarterly";
  amountSpent: number;
  milestones: ProjectMilestone[];
  documents: ProjectDocument[];
  kpis: any[];
  invoices: Invoice[];
  budgetId: Budget;
  teamMemberContracts?: Contract[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}
