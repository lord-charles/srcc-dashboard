import { ProjectMilestone } from "./project";

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

export type ContractStatus =
  | "draft"
  | "pending_finance_approval"
  | "pending_md_approval"
  | "pending_coach_admin_review"
  | "pending_coach_manager_approval"
  | "pending_coach_finance_approval"
  | "pending_srcc_checker_approval"
  | "pending_srcc_finance_approval"
  | "pending_signature"
  | "pending_acceptance"
  | "active"
  | "suspended"
  | "terminated"
  | "completed"
  | "rejected";

export interface ApprovalEntry {
  approverId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    id: string;
  };
  approvedAt: string;
  comments?: string;
}
export interface RejectionDetails {
  rejectedBy: string;
  rejectedAt: string;
  reason: string;
  level: string;
}

export interface FinalApproval {
  approvedBy: string;
  approvedAt: string;
}

export interface ApprovalFlow {
  financeApprovals?: ApprovalEntry[];
  mdApprovals?: ApprovalEntry[];
  coachAdminApprovals?: ApprovalEntry[];
  coachManagerApprovals?: ApprovalEntry[];
  coachFinanceApprovals?: ApprovalEntry[];
  srccCheckerApprovals?: ApprovalEntry[];
  srccFinanceApprovals?: ApprovalEntry[];
}

export interface Amendment {
  date?: string;
  description?: string;
  changedFields?: string[];
  approvedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    id: string;
  };
  _id?: string;
}
export interface ContractedUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

interface ProjectInfo {
  _id: string;
  name: string;
  milestones: ProjectMilestone[];
}
export interface TemplateVariable {
  name: string;
  type: string;
  required?: boolean;
  defaultValue?: string | number | boolean | null;
}

export interface TemplateSnapshot {
  _id: string;
  name: string;
  content: string; // raw HTML or text template
  contentType: "html" | "text";
  version: string;
  variables: TemplateVariable[];
}

export interface Contract {
  _id: string;
  contractNumber: string;
  description: string;
  contractValue: number;
  currency: string;
  type?: string;
  status: ContractStatus;
  createdBy: string;
  updatedBy: string;
  startDate: string;
  endDate: string;
  projectId: ProjectInfo;
  contractedUserId: ContractedUser;
  amendments?: Amendment[];
  approvalFlow?: ApprovalFlow;
  currentLevelDeadline?: string;
  finalApproval?: FinalApproval;
  rejectionDetails?: RejectionDetails;
  createdAt: string;
  updatedAt: string;
  templateSnapshot?: TemplateSnapshot;
  attachments?: Array<{
    name: string;
    url: string;
    type?: string;
  }>;
}

export interface ContractStats {
  totalContracts: number;
  activeContracts: number;
  totalValue: number;
  completedDeliverables: number;
  pendingPayments: number;
}
