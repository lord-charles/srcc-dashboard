"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Budget } from "@/types/project";
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

    // Check dates from both internal and external categories
    const allDates = [
      ...budget.internalCategories.flatMap(cat =>
        cat.items.flatMap(item => [item.startDate, item.endDate])
      ),
      ...budget.externalCategories.flatMap(cat =>
        cat.items.flatMap(item => [item.startDate, item.endDate])
      ),
    ].filter(date => date) as string[];

    if (allDates.length === 0) return true;

    const dates = allDates.map(date => new Date(date));
    const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
    const latest = new Date(Math.max(...dates.map(d => d.getTime())));

    return (
      (earliest >= dateRange.from && earliest <= dateRange.to) ||
      (latest >= dateRange.from && latest <= dateRange.to)
    );
  });

  const totalPlannedCost = filteredBudgets.reduce(
    (sum, budget) => sum + budget.totalInternalBudget + budget.totalExternalBudget,
    0
  );

  const totalActualCost = filteredBudgets.reduce(
    (sum, budget) => sum + budget.totalInternalSpent + budget.totalExternalSpent,
    0
  );

  const budgetVariance = totalPlannedCost
    ? ((totalActualCost - totalPlannedCost) / totalPlannedCost) * 100
    : 0;

  const activeBudgets = filteredBudgets.filter(
    (budget) => budget.status === "approved"
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Planned Cost</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totalPlannedCost, "KES")}
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
            {formatCurrency(totalActualCost, "KES")}
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
          <CardTitle className="text-sm font-medium">Approved Budgets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeBudgets}</div>
          <p className="text-xs text-muted-foreground">
            Number of approved budgets
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
