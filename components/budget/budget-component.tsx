"use client";

import { Header } from "../header";
import DashboardProvider from "@/app/dashboard-provider";
import { Budget as BudgetType } from "@/types/project";
import { BudgetStats } from "./budget-stats";
import BudgetTable from "./budget-table/budget";
import { Card } from "../ui/card";

interface BudgetPageProps {
  budgets: BudgetType[];
}

export default function BudgetPage({ budgets }: BudgetPageProps) {


  return (
    <DashboardProvider>
      <Header />
      <div className="p-3">
        <BudgetStats budgetData={budgets} />
        <Card className="relative mt-4 p-3">
          <BudgetTable budgets={budgets} />
        </Card>
      </div>
    </DashboardProvider>
  );
}
