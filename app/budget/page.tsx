import { getAllBudgets } from "@/services/budget.service";
import BudgetPage from "@/components/budget/budget-component";
import React from 'react'
import { Budget as BudgetType } from "@/types/project";

export default async function Budget() {
  const budgets = await getAllBudgets();

  // Transform the budget data to match the expected type
  const transformedBudgets: BudgetType[] = budgets?.map((budget: any) => ({
    ...budget,
    projectId: {
      _id: budget.projectId?._id || budget.projectId,
      name: budget.projectId?.name || "Unknown Project",
      description: budget.projectId?.description || "",
      status: budget.projectId?.status || "unknown"
    }
  })) || [];

  return (
    <div>
      <BudgetPage budgets={transformedBudgets} />
    </div>
  )
}
