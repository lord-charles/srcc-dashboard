"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Budget } from "@/types/budget";
import { formatCurrency } from "@/lib/utils";
import { DateRange } from "react-day-picker";

interface BudgetStatCardsProps {
  budgets?: Budget[];
  dateRange?: DateRange;
}

export default function BudgetStatCards({
  budgets = [],
  dateRange,
}: BudgetStatCardsProps) {
  const filteredBudgets = budgets.filter((budget) => {
    if (!dateRange?.from || !dateRange?.to) return true;
    const budgetStart = new Date(budget.budgetStartDate);
    const budgetEnd = new Date(budget.budgetEndDate);
    return (
      (budgetStart >= dateRange.from && budgetStart <= dateRange.to) ||
      (budgetEnd >= dateRange.from && budgetEnd <= dateRange.to)
    );
  });

  const totalPlannedCost = filteredBudgets.reduce(
    (sum, budget) => sum + (parseFloat(budget.totalPlannedCost?.toString() || "0") || 0),
    0
  );

  const totalActualCost = filteredBudgets.reduce(
    (sum, budget) => sum + (parseFloat(budget.totalActualCost?.toString() || "0") || 0),
    0
  );

  const budgetVariance = totalPlannedCost
    ? ((totalActualCost - totalPlannedCost) / totalPlannedCost) * 100
    : 0;

  const activeBudgets = filteredBudgets.filter(
    (budget) => budget.status === "active"
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Planned Cost</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalPlannedCost}
          </div>
          <p className="text-xs text-muted-foreground">
            Total budgeted amount for all projects
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Actual Cost</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalActualCost}
          </div>
          <p className="text-xs text-muted-foreground">
            Total spent amount across all projects
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Budget Variance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {budgetVariance.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Percentage difference between planned and actual costs
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Budgets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeBudgets}</div>
          <p className="text-xs text-muted-foreground">
            Number of currently active budgets
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
