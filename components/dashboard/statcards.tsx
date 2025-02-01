"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Wallet,
  TrendingUp,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { DashboardStats } from "@/types/dashboard";

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  trend: {
    value: string;
    label: string;
    direction: "up" | "down" | "neutral";
  };
  icon: React.ElementType;
}

interface DashboardStatCardsProps {
  stats: DashboardStats;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <Card
      className={`overflow-hidden transition-all duration-500 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <CardContent className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {title}
            </p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {value}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {subtitle}
            </p>
          </div>
          <Icon className="h-8 w-8 text-blue-500 dark:text-blue-400" />
        </div>
        <div
          className={`flex items-center mt-4 text-sm ${
            trend.direction === "up"
              ? "text-green-600 dark:text-green-400"
              : trend.direction === "down"
              ? "text-red-600 dark:text-red-400"
              : "text-blue-600 dark:text-blue-400"
          }`}
        >
          {trend.direction === "up" ? (
            <TrendingUp className="h-4 w-4 mr-1" />
          ) : trend.direction === "down" ? (
            <TrendingUp className="h-4 w-4 mr-1 rotate-180" />
          ) : (
            <TrendingUp className="h-4 w-4 mr-1 rotate-90" />
          )}
          <span>
            {trend.value} {trend.label}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export function DashboardStatCards({ stats }: DashboardStatCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Employees"
        value={stats.employees.total.toString()}
        subtitle={stats.employees.description}
        trend={{
          value: stats.employees.quarterlyGrowth,
          label: "vs last quarter",
          direction:
            parseFloat(stats.employees.quarterlyGrowth) > 0
              ? "up"
              : parseFloat(stats.employees.quarterlyGrowth) < 0
              ? "down"
              : "neutral",
        }}
        icon={Users}
      />
      <StatCard
        title="Total Advances"
        value={`KES ${stats.advances.total.amount.toLocaleString()}`}
        subtitle="Total amount disbursed"
        trend={{
          value: `${stats.advances.total.repaymentRate}%`,
          label: "repayment rate",
          direction: stats.advances.total.repaymentRate > 50 ? "up" : "down",
        }}
        icon={Wallet}
      />
      <StatCard
        title="Active Advances"
        value={stats.advances.active.count.toString()}
        subtitle={`${stats.advances.active.percentageOfTotal}% of total advances`}
        trend={{
          value: `KES ${stats.advances.active.dueThisMonth.toLocaleString()}`,
          label: "due this month",
          direction: "neutral",
        }}
        icon={TrendingUp}
      />
      <StatCard
        title="At Risk Advances"
        value={stats.advances.atRisk.count.toString()}
        subtitle={`${stats.advances.atRisk.percentageOfTotal}% of total advances`}
        trend={{
          value: stats.advances.atRisk.changeFromLastMonth.toString(),
          label: "vs last month",
          direction:
            stats.advances.atRisk.changeFromLastMonth > 0 ? "down" : "up",
        }}
        icon={AlertCircle}
      />
    </div>
  );
}
