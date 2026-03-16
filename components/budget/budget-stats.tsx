"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Cell, ResponsiveContainer, PieChart, Pie, Sector } from "recharts";
import {
  ClockIcon,
  AlertCircleIcon,
  DollarSignIcon,
  BarChart3Icon,
  PieChartIcon,
  CheckCircleIcon,
  CloudyIcon as PendingIcon,
  FileIcon,
} from "lucide-react";
import { formatCurrency, formatDate, formatPercentage } from "@/lib/utils";

// Types
type BudgetStatus = any;
type BudgetCategory = {
  name: string;
  description: string;
  items: BudgetItem[];
  tags: string[];
};
type BudgetItem = {
  name: string;
  description: string;
  estimatedAmount: number;
  actualAmount: number;
  tags: string[];
  frequency: string;
  startDate: string;
  endDate: string;
};
type Budget = {
  _id: string;
  projectId: { _id: string; name: string; description: string; status: string };
  internalCategories: BudgetCategory[];
  externalCategories: BudgetCategory[];
  currency: string;
  totalInternalBudget: number;
  totalExternalBudget: number;
  totalInternalSpent: number;
  totalExternalSpent: number;
  version: number;
  status: BudgetStatus;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  updatedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  notes: string;
  auditTrail: any[];
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  approvalFlow?: {
    checkerApprovals?: any[];
    managerApprovals?: any[];
    financeApprovals?: any[];
  };
};

// Helper functions
const getStatusColor = (status: BudgetStatus): string => {
  switch (status) {
    case "approved":
      return "bg-emerald-500";
    case "draft":
      return "bg-slate-400";
    case "revision_requested":
      return "bg-amber-500";
    default:
      return status.includes("pending") ? "bg-sky-500" : "bg-slate-400";
  }
};

const getStatusBadgeVariant = (status: BudgetStatus): string => {
  switch (status) {
    case "approved":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    case "draft":
      return "bg-slate-100 text-slate-800 dark:bg-slate-800/30 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    case "revision_requested":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    default:
      return status.includes("pending")
        ? "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300 border-sky-200 dark:border-sky-800"
        : "bg-slate-100 text-slate-800 dark:bg-slate-800/30 dark:text-slate-300 border-slate-200 dark:border-slate-700";
  }
};

const getStatusIcon = (status: BudgetStatus) => {
  switch (status) {
    case "approved":
      return <CheckCircleIcon className="h-3 w-3 text-emerald-500 mr-1" />;
    case "draft":
      return <FileIcon className="h-3 w-3 text-slate-500 mr-1" />;
    case "revision_requested":
      return <AlertCircleIcon className="h-3 w-3 text-amber-500 mr-1" />;
    default:
      return status.includes("pending") ? (
        <PendingIcon className="h-3 w-3 text-sky-500 mr-1" />
      ) : (
        <FileIcon className="h-3 w-3 text-slate-500 mr-1" />
      );
  }
};

const getReadableStatus = (status: BudgetStatus): string => {
  switch (status) {
    case "draft":
      return "Draft";
    case "pending_checker_approval":
      return "Pending Checker";
    case "pending_manager_approval":
      return "Pending Manager";
    case "pending_finance_approval":
      return "Pending Finance";
    case "approved":
      return "Approved";
    case "revision_requested":
      return "Revision Requested";
    default:
      return status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l: string) => l.toUpperCase());
  }
};

const getApprovalTime = (budget: Budget): number | null => {
  if (!budget.approvedAt || !budget.createdAt) return null;
  return (
    (new Date(budget.approvedAt).getTime() -
      new Date(budget.createdAt).getTime()) /
    (1000 * 60 * 60)
  );
};

const getCategoryTotals = (budgets: Budget[]) => {
  const categoryMap = new Map<string, number>();
  budgets.forEach((budget) => {
    [...budget.internalCategories, ...budget.externalCategories].forEach(
      (category) => {
        const total = category.items.reduce(
          (sum, item) => sum + (item.estimatedAmount || 0),
          0,
        );
        categoryMap.set(
          category.description,
          (categoryMap.get(category.description) || 0) + total,
        );
      },
    );
  });
  const sorted = Array.from(categoryMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  if (sorted.length > 5) {
    const others = sorted.slice(4);
    return [
      ...sorted.slice(0, 4),
      {
        name: `Others (${others.length})`,
        value: others.reduce((s, c) => s + c.value, 0),
      },
    ];
  }
  return sorted;
};

const getFrequencyDistribution = (budgets: Budget[]) => {
  const frequencyMap = new Map<string, number>();
  budgets.forEach((budget) => {
    [...budget.internalCategories, ...budget.externalCategories].forEach(
      (category) => {
        category.items.forEach((item) => {
          const freq = item.frequency || "unknown";
          frequencyMap.set(
            freq,
            (frequencyMap.get(freq) || 0) + (item.estimatedAmount || 0),
          );
        });
      },
    );
  });
  return Array.from(frequencyMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

// Shared card shell for consistent sizing
function StatCard({
  icon,
  iconColor,
  title,
  children,
}: {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900 hover:shadow-md transition-shadow duration-200 flex flex-col">
      <CardHeader className="px-4 pt-4 pb-2 flex-shrink-0">
        <CardTitle className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <span className={iconColor}>{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 flex flex-col flex-1 gap-3">
        {children}
      </CardContent>
    </Card>
  );
}

// Compact label-value row
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-slate-800 dark:text-slate-100">
        {value}
      </span>
    </div>
  );
}

export function BudgetStats({ budgetData }: { budgetData: any }) {
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setBudgets(budgetData);
      } catch (error) {
        console.error("Error fetching budget data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    if (!budgets.length)
      return {
        totalBudgets: 0,
        totalAmount: 0,
        totalSpent: 0,
        averageBudgetAmount: 0,
        approvedBudgets: 0,
        pendingBudgets: 0,
        draftBudgets: 0,
        revisionRequestedBudgets: 0,
        averageApprovalTime: 0,
        currency: "KES",
        spendingRate: 0,
      };
    const totalAmount = budgets.reduce(
      (s, b) => s + (b.totalInternalBudget || 0) + (b.totalExternalBudget || 0),
      0,
    );
    const totalSpent = budgets.reduce(
      (s, b) => s + (b.totalInternalSpent || 0) + (b.totalExternalSpent || 0),
      0,
    );
    const approvedBudgets = budgets.filter(
      (b) => b.status === "approved",
    ).length;
    const pendingBudgets = budgets.filter((b) =>
      b.status.includes("pending"),
    ).length;
    const draftBudgets = budgets.filter((b) => b.status === "draft").length;
    const approvalTimes = budgets
      .map(getApprovalTime)
      .filter((t): t is number => t !== null);
    return {
      totalBudgets: budgets.length,
      totalAmount,
      totalSpent,
      averageBudgetAmount: budgets.length ? totalAmount / budgets.length : 0,
      approvedBudgets,
      pendingBudgets,
      draftBudgets,
      revisionRequestedBudgets: budgets.filter(
        (b) => b.status === "revision_requested",
      ).length,
      averageApprovalTime: approvalTimes.length
        ? approvalTimes.reduce((s, t) => s + t, 0) / approvalTimes.length
        : 0,
      currency: budgets[0]?.currency || "KES",
      spendingRate: totalAmount > 0 ? (totalSpent / totalAmount) * 100 : 0,
    };
  }, [budgets]);

  const statusDistribution = useMemo(() => {
    const map = new Map<BudgetStatus, number>();
    budgets.forEach((b) => map.set(b.status, (map.get(b.status) || 0) + 1));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [budgets]);

  const categoryData = useMemo(() => getCategoryTotals(budgets), [budgets]);
  const frequencyData = useMemo(
    () => getFrequencyDistribution(budgets),
    [budgets],
  );

  const renderActiveShape = (props: any) => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value,
    } = props;
    return (
      <g>
        <text x={cx} y={cy - 14} textAnchor="middle" fill="#888" fontSize={10}>
          {payload.name}
        </text>
        <text
          x={cx}
          y={cy + 2}
          textAnchor="middle"
          fill="#333"
          fontSize={11}
          fontWeight={600}
        >
          {formatCurrency(value, stats.currency)}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" fill="#999" fontSize={10}>
          {`${(percent * 100).toFixed(1)}%`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 4}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="p-4 space-y-3">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </Card>
          ))}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1 — Financial Overview */}
        <StatCard
          icon={<DollarSignIcon className="h-4 w-4" />}
          iconColor="text-emerald-500"
          title="Financial Overview"
        >
          {/* Big number */}
          <div>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 leading-tight">
              {formatCurrency(stats.totalAmount, stats.currency)}
            </p>
            <p className="text-xs text-muted-foreground">Total Budget</p>
          </div>

          {/* Spend bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Spent</span>
              <span className="font-medium">
                {formatCurrency(stats.totalSpent, stats.currency)} ·{" "}
                {formatPercentage(stats.spendingRate)}
              </span>
            </div>
            <Progress value={stats.spendingRate} className="h-1.5" />
          </div>

          {/* Two-col grid */}
          <div className="grid grid-cols-2 gap-x-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs text-muted-foreground">Budgets</p>
              <p className="text-sm font-semibold">{stats.totalBudgets}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg. Amount</p>
              <p className="text-sm font-semibold">
                {formatCurrency(stats.averageBudgetAmount, stats.currency)}
              </p>
            </div>
          </div>
        </StatCard>

        {/* 2 — Approval Status */}
        <StatCard
          icon={<BarChart3Icon className="h-4 w-4" />}
          iconColor="text-sky-500"
          title="Approval Status"
        >
          {/* Big number + avg time side by side */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xl font-bold text-sky-600 dark:text-sky-400 leading-tight">
                {stats.approvedBudgets}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  / {stats.totalBudgets}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">
                {stats.averageApprovalTime.toFixed(1)} hrs
              </p>
              <p className="text-xs text-muted-foreground">Avg. approval</p>
            </div>
          </div>

          {/* Stacked bar */}
          <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            {statusDistribution.map(([status, count], i) => (
              <div
                key={i}
                className={getStatusColor(status)}
                style={{
                  width: `${stats.totalBudgets > 0 ? (count / stats.totalBudgets) * 100 : 0}%`,
                }}
              />
            ))}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1">
            {statusDistribution.map(([status, count], i) => (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 h-5 ${getStatusBadgeVariant(status)}`}
                  >
                    <span className="flex items-center">
                      {getStatusIcon(status)}
                      {getReadableStatus(status)}: {count}
                    </span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {Math.round((count / stats.totalBudgets) * 100)}% of total
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Pending / Drafts */}
          <div className="grid grid-cols-2 gap-x-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-sm font-semibold">{stats.pendingBudgets}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Drafts</p>
              <p className="text-sm font-semibold">{stats.draftBudgets}</p>
            </div>
          </div>
        </StatCard>

        {/* 3 — Budget Categories */}
        <StatCard
          icon={<PieChartIcon className="h-4 w-4" />}
          iconColor="text-violet-500"
          title="Budget Categories"
        >
          {/* Compact donut */}
          <div className="h-[140px] w-full flex-shrink-0">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={58}
                    dataKey="value"
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-xs text-muted-foreground">No data</p>
              </div>
            )}
          </div>

          {/* Category list */}
          <ScrollArea className="h-[72px] rounded border border-slate-100 dark:border-slate-800 px-2 py-1">
            <div className="space-y-1">
              {categoryData.map((cat, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span
                      className="truncate text-slate-600 dark:text-slate-300"
                      title={cat.name}
                    >
                      {cat.name}
                    </span>
                  </div>
                  <span className="font-medium ml-2 flex-shrink-0">
                    {formatCurrency(cat.value, stats.currency)}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </StatCard>

        {/* 4 — Budget Timeline */}
        <StatCard
          icon={<ClockIcon className="h-4 w-4" />}
          iconColor="text-amber-500"
          title="Budget Timeline"
        >
          {/* Top frequency */}
          <div>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400 capitalize leading-tight">
              {frequencyData[0]?.name ?? "N/A"}
            </p>
            <p className="text-xs text-muted-foreground">Top Frequency</p>
          </div>

          {/* Frequency bars */}
          <div className="space-y-1.5">
            {frequencyData.slice(0, 3).map((item, i) => (
              <div key={i} className="space-y-0.5">
                <div className="flex justify-between text-xs">
                  <span className="capitalize text-slate-600 dark:text-slate-300">
                    {item.name}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(item.value, stats.currency)}
                  </span>
                </div>
                <Progress
                  value={
                    frequencyData[0]?.value > 0
                      ? (item.value / frequencyData[0].value) * 100
                      : 0
                  }
                  className="h-1.5"
                />
              </div>
            ))}
          </div>

          {/* Newest / Last approved */}
          <div className="grid grid-cols-2 gap-x-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs text-muted-foreground">Newest</p>
              <p className="text-xs font-medium">
                {budgets.length
                  ? formatDate(
                      [...budgets].sort(
                        (a, b) =>
                          new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime(),
                      )[0].createdAt,
                    )
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Approved</p>
              <p className="text-xs font-medium">
                {budgets.some((b) => b.approvedAt)
                  ? formatDate(
                      [...budgets]
                        .filter((b) => b.approvedAt)
                        .sort(
                          (a, b) =>
                            new Date(b.approvedAt!).getTime() -
                            new Date(a.approvedAt!).getTime(),
                        )[0].approvedAt!,
                    )
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* Footer notice */}
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <AlertCircleIcon className="h-3 w-3 text-amber-500 flex-shrink-0" />
            {stats.pendingBudgets > 0
              ? `${stats.pendingBudgets} budget${stats.pendingBudgets > 1 ? "s" : ""} awaiting approval`
              : "No pending approvals"}
          </div>
        </StatCard>
      </div>
    </TooltipProvider>
  );
}
