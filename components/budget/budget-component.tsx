"use client";

import { Header } from "../header";
import DashboardProvider from "@/app/dashboard-provider";
import { useState } from "react";
import { startOfMonth, endOfMonth, addDays } from "date-fns";
import { Loader2 } from "lucide-react";
import BudgetStatCards from "./budget-stat-cards";
import BudgetTable from "./budget-table/budget";
import { Budget as BudgetType } from "@/types/project";
import { DateRange } from "react-day-picker";

interface BudgetPageProps {
  budgets: BudgetType[];
}

export default function BudgetPage({ budgets }: BudgetPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  return (
    <DashboardProvider>
      <Header />
      <div className="p-4">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Budget Overview
          </h1>

        </div>
        <BudgetStatCards budgets={budgets} dateRange={date} />
        <div className="relative mt-8">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-gray-900/50">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          <BudgetTable budgets={budgets} />
        </div>
      </div>
    </DashboardProvider>
  );
}
