"use client";
import { DollarSign, Users, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RecentAdvanceStats } from "@/types/dashboard";
import { PaginatedAdvances } from "@/types/advance";
import AdvanceTable from "../advance/advance-table/advance";

interface RecentAdvancesProps {
  recentAdvancesStats: RecentAdvanceStats;
  recentAdvances: PaginatedAdvances;
}

export function RecentAdvances({
  recentAdvancesStats,
  recentAdvances,
}: RecentAdvancesProps) {
  return (
    <Card className="w-full shadow-md">
      <CardHeader className="border-b bg-muted/40 pb-8">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Recent Advances
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Current month advance requests from employees
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Requested
              </CardTitle>
              <DollarSign className="h-4 w-4 opacity-70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                KSH {recentAdvancesStats.totalRequested.amount.toLocaleString()}
              </div>
              <p className="text-xs opacity-70">
                {recentAdvancesStats.totalRequested.period}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-green-600 text-primary-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Approved Amount
              </CardTitle>
              <Users className="h-4 w-4 opacity-70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                KSH {recentAdvancesStats.approvedAmount.amount.toLocaleString()}
              </div>
              <p className="text-xs opacity-70">
                {recentAdvancesStats.approvedAmount.period}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-600 text-primary-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Requests
              </CardTitle>
              <Clock className="h-4 w-4 opacity-70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recentAdvancesStats.pendingRequests.count}
              </div>
              <p className="text-xs opacity-70">
                {recentAdvancesStats.pendingRequests.description}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-blue-600 text-primary-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Employees Requested
              </CardTitle>
              <Users className="h-4 w-4 opacity-70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recentAdvancesStats.uniqueRequesters?.count?.toLocaleString()}
              </div>
              <p className="text-xs opacity-70">
                {recentAdvancesStats.totalRequested.period}
              </p>
            </CardContent>
          </Card>
        </div>
        <AdvanceTable advances={recentAdvances.data} />
      </CardContent>
    </Card>
  );
}
