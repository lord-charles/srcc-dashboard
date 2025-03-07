

export type ClaimStatus =
  | "draft"
  | "pending_checker_approval"
  | "pending_manager_approval" 
  | "pending_finance_approval"
  | "approved"
  | "rejected";

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

export interface Claim {
  _id: string;
  projectId: {
    _id: string;
    name: string;
    description: string;
  };
  contractId: {
    _id: string;
    contractNumber: string;
    contractValue: number;
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
  };
  updatedBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  documents: string[];
  auditTrail: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}
