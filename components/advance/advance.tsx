"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CalendarIcon,
  CreditCardIcon,
  DollarSignIcon,
  UserIcon,
  AlertTriangleIcon,
} from "lucide-react";
import { DatePickerWithRange } from "../date-range-picker";
import { PaginatedAdvances } from "@/types/advance";
import AdvanceTable from "./advance-table/advance";
import { calculateAdvanceStats, formatCurrency } from "@/lib/advance-stats";
import { Button } from "../ui/button";

interface AdvanceModuleProps {
  initialData: PaginatedAdvances;
}

const AdvanceModule = ({ initialData }: AdvanceModuleProps) => {
  const stats = calculateAdvanceStats(initialData.data, initialData.total);

  return (
    <div className="min-h-screen">
      <div className=" px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Salary Advance
          </h1>
          <DatePickerWithRange />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <Card className="bg-white/50 backdrop-blur-lg dark:bg-gray-800/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Advances
              </CardTitle>
              <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAdvances}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card className="bg-white/50 backdrop-blur-lg dark:bg-gray-800/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Amount Disbursed
              </CardTitle>
              <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalAmountDisbursed)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total disbursed amount
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/50 backdrop-blur-lg dark:bg-gray-800/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Approvals
              </CardTitle>
              <AlertTriangleIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.pendingApprovals.count}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingApprovals.urgentCount} urgent requests
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/50 backdrop-blur-lg dark:bg-gray-800/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Repayment Period
              </CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageRepaymentPeriod.toFixed(1)} months
              </div>
              <p className="text-xs text-muted-foreground">Average duration</p>
            </CardContent>
          </Card>
          <Card className="bg-white/50 backdrop-blur-lg dark:bg-gray-800/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Employees with Active Advances
              </CardTitle>
              <UserIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.activeAdvances.count}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.activeAdvances.percentageOfEmployees.toFixed(1)}% of
                total employees
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-2 pt-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg font-medium">
                  Recent Advances
                </CardTitle>
                <CardDescription className="text-sm font-medium">
                  Here is a list of all Advances
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <AdvanceTable advances={initialData.data} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdvanceModule;
