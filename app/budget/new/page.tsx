import DashboardProvider from '@/app/dashboard-provider';
import BudgetForm from '@/components/budget/new-budget';

import { Header } from '@/components/header';

export default async function NewBudget() {
  return (
    <DashboardProvider>
      <Header />
      <BudgetForm />
    </DashboardProvider>
  )
}
