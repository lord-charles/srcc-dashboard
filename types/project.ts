export interface Milestone {
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
}

export interface TeamMember {
  name: string;
  role: string;
  contact: string;
}

export type ProjectStatus = "active" | "on-hold" | "completed" | "cancelled";
export type RiskLevel = "Low" | "Medium" | "High";
export type ReportingFrequency = "Monthly" | "Quarterly" | "Bi-Annually" | "Annually";

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
  status: ProjectStatus;
  projectManager: string;
  milestones: Milestone[];
  teamMembers: TeamMember[];
  procurementMethod: string;
  signedContractUrl: string;
  contractExecutionMemoUrl: string;
  signedBudgetUrl: string;
  riskLevel: RiskLevel;
  reportingFrequency: ReportingFrequency;
  actualCompletionDate: string | null;
  amountSpent: number;
}
