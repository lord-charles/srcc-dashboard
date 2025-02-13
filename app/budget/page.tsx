import BudgetPage from '@/components/budget/budget-component'
import { getAllBudgets } from '@/services/budget.service';
import React from 'react'

export default async function Budget() {
  const budgets = await getAllBudgets();
  return (
    <div>
      <BudgetPage budgets={budgets}/>
    </div>
  )
}
