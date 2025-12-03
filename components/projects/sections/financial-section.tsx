"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp } from "lucide-react";
import { Project } from "@/types/project";
import { formatCurrency } from "../project-stat-cards";

interface FinancialSectionProps {
  totalBudget: number;
  amountSpent: number;
  totalProjectValue: number;
  currency: string;
  projectData: Project;
}

export const FinancialSection: React.FC<FinancialSectionProps> = ({
  totalBudget,
  amountSpent,
  totalProjectValue,
  currency,
  projectData,
}) => {
  const formatCurrency2 = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency || "KES",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const spentPercentage =
    totalBudget > 0 ? (amountSpent / totalBudget) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Project Value
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency2(totalProjectValue)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Budget
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    (projectData.budgetId?.totalInternalBudget || 0) +
                      (projectData.budgetId?.totalExternalBudget || 0),
                    projectData.currency
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div>Amount Spent</div>
              <div className="font-medium">{formatCurrency2(amountSpent)}</div>
            </div>
            <Progress
              value={isNaN(spentPercentage) ? 0 : spentPercentage}
              className="h-2"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div>
                {isNaN(spentPercentage) ? 0 : Math.round(spentPercentage)}% of
                budget spent
              </div>
              <div>
                {formatCurrency2(
                  isNaN(totalBudget - amountSpent)
                    ? 0
                    : totalBudget - amountSpent
                )}{" "}
                remaining
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialSection;
