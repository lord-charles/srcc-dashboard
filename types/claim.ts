export type ClaimStatus =
  | "draft"
  | "pending_checker_approval"
  | "pending_reviewer_approval"
  | "pending_approver_approval"
  | "pending_srcc_checker_approval"
  | "pending_srcc_finance_approval"
  | "pending_director_approval"
  | "pending_academic_director_approval"
  | "pending_finance_approval"
  | "approved"
  | "rejected"
  | "paid"
  | "cancelled"
  | "revision_requested";

export interface ClaimMilestone {
  _id: string;
  milestoneId: string;
  title: string;
  percentageClaimed: number;
  maxClaimableAmount: number;
  previouslyClaimed: number;
  currentClaim: number;
  remainingClaimable: number;
}

export interface ApprovalDetails {
  approvedBy: string;
  approvedAt: string;
  comments: string;
}

export interface AuditTrailEntry {
  _id: string;
  action: string;
  performedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  performedAt: string;
  details: {
    level: string;
    comments: string;
  };
}

interface ApprovalStep {
  stepNumber: number;
  role: string;
  department: string;
  description: string;
  nextStatus: string;
  _id: string;
}

interface ApprovalFlow {
  _id: string;
  department: string;
  description: string;
  isActive: boolean;
  steps: ApprovalStep[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentDetails {
  paidBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  paidAt: string;
  transactionId: string;
  paymentMethod: string;
  reference?: string;
  paymentAdviceUrl: string;
}

export interface Claim {
  _id: string;
  projectId: {
    _id: string;
    name: string;
    description: string;
    department?: string;
  };
  contractId: {
    _id: string;
    contractNumber: string;
    contractValue: number;
    currency?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    projectId?: {
      _id: string;
      name: string;
      description: string;
    };
    createdBy?: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    contractedUserId?: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  claimantId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  amount: number;
  currency: string;
  milestones: ClaimMilestone[];
  status: ClaimStatus;
  version: number;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  updatedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  documents: string[];
  auditTrail: AuditTrailEntry[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  approval?: {
    checkerApproval?: ApprovalDetails;
    managerApproval?: ApprovalDetails;
    financeApproval?: ApprovalDetails;
  };
  approvalFlow: ApprovalFlow;
  currentLevelDeadline?: string;
  payment?: PaymentDetails;
}
