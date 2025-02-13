export interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
}

export interface TeamMember {
  userId: User
  startDate: string
  endDate: string
  responsibilities: string[]
  _id: string
}

export interface RiskAssessment {
  factors: string[]
  mitigationStrategies: string[]
  lastAssessmentDate: string
  nextAssessmentDate: string
}

export interface ProjectMilestone {
  _id: string
  title: string
  description: string
  dueDate: string
  completed: boolean
  budget: number
  actualCost: number | null
}

export interface ProjectDocument {
  name: string
  url: string
}

export interface Project {
  _id: string
  name: string
  description: string
  totalBudget: number
  totalProjectValue: number
  currency: string
  contractStartDate: string
  contractEndDate: string
  client: string
  status: 'active' | 'completed' | 'cancelled' | 'on-hold'
  createdBy: User
  updatedBy: User
  projectManagerId: User
  teamMembers: TeamMember[]
  procurementMethod: string
  projectProposalUrl: string
  signedContractUrl: string
  executionMemoUrl: string
  signedBudgetUrl: string
  riskLevel: 'Low' | 'Medium' | 'High'
  riskAssessment: RiskAssessment
  reportingFrequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly'
  amountSpent: number
  milestones: ProjectMilestone[]
  documents: ProjectDocument[]
  kpis: any[]
  createdAt: string
  updatedAt: string
  __v: number
}
