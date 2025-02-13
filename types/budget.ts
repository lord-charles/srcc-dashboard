export interface BudgetItem {
  _id: string;
  itemName: string;
  plannedCost: number;
  actualCost: number;
  description: string;
  dateIncurred: string;
}

export interface Budget {
  _id: string;
  projectName: string;
  projectValue: number;
  budgetStartDate: string;
  budgetEndDate: string;
  budgetCategory: string;
  currency: string;
  totalPlannedCost: number;
  totalActualCost: number;
  status: 'active' | 'completed' | 'pending';
  notes: string;
  budgetItems: BudgetItem[];
  projectId: string;
  budgetOwner: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateBudgetDTO {
  projectName: string;
  projectValue: number;
  budgetStartDate: string;
  budgetEndDate: string;
  budgetCategory: string;
  currency: string;
  totalPlannedCost: number;
  totalActualCost?: number;
  status?: 'active' | 'completed' | 'pending';
  notes?: string;
  budgetItems: Omit<BudgetItem, '_id'>[];
  projectId: string;
  budgetOwner: string;
}

export interface UpdateBudgetDTO extends Partial<CreateBudgetDTO> {}
