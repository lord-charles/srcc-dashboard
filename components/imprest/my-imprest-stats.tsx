"use client";

import { useMemo } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  History,
  ReceiptText,
  Shield,
  Timer,
  TrendingUp,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  calculateDaysRemaining,
  formatCurrency,
  formatDate,
  formatPercentage,
  getDaysRemainingColor,
  getReadableStatus,
  getStatusBadgeVariant,
} from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";

type ImprestStatus =
  | "accounted"
  | "pending_accountant"
  | "pending_hod"
  | "rejected"
  | "disbursed";

interface MyImprest {
  _id: string;
  employeeName: string;
  department: string;
  requestDate: string;
  dueDate: string;
  paymentReason: string;
  currency: string;
  amount: number;
  paymentType: string;
  explanation: string;
  status: ImprestStatus;
  requestedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
  };
  attachments: Array<{
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
    _id: string;
  }>;
  hodApproval?: {
    approvedBy: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    approvedAt: string;
    comments: string;
  };
  accountantApproval?: {
    approvedBy: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    approvedAt: string;
    comments: string;
  };
  disbursement?: {
    disbursedBy: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    disbursedAt: string;
    amount: number;
    comments: string;
  };
  accounting?: {
    verifiedBy: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    verifiedAt: string;
    receipts: Array<{
      description: string;
      amount: number;
      receiptUrl: string;
      uploadedAt: string;
      _id: string;
    }>;
    totalAmount: number;
    balance: number;
    comments: string;
  };
  rejection?: {
    rejectedBy: string;
    rejectedAt: string;
    reason: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface MyImprestStats {
  totalImprests: number;
  totalAmount: number;
  activeImprests: number;
  activeAmount: number;
  accountedImprests: number;
  pendingImprests: number;
  rejectedImprests: number;
  statusCounts: Record<ImprestStatus, number>;
  currencyDistribution: Record<string, number>;
  upcomingDeadlines: MyImprest[];
  recentActivity: {
    type: string;
    date: string;
    details: string;
    imprestId: string;
  }[];
  averageProcessingTime: number;
  accountingRequired: number;
  accountingRequiredAmount: number;
  monthlyTrend: Record<string, number>;
}

export function MyImprestStats({ imprests }: { imprests: any }) {
  const stats = useMemo(() => {
    if (!imprests || !imprests.length) {
      return {
        totalImprests: 0,
        totalAmount: 0,
        activeImprests: 0,
        activeAmount: 0,
        accountedImprests: 0,
        pendingImprests: 0,
        rejectedImprests: 0,
        statusCounts: {
          accounted: 0,
          pending_accountant: 0,
          pending_hod: 0,
          rejected: 0,
          disbursed: 0,
        } as Record<ImprestStatus, number>,
        currencyDistribution: {} as Record<string, number>,
        upcomingDeadlines: [],
        recentActivity: [],
        averageProcessingTime: 0,
        accountingRequired: 0,
        accountingRequiredAmount: 0,
        monthlyTrend: {},
      } as MyImprestStats;
    }

    try {
      const statusCounts: Record<ImprestStatus, number> = {
        accounted: 0,
        pending_accountant: 0,
        pending_hod: 0,
        rejected: 0,
        disbursed: 0,
      };

      const currencyDistribution: Record<string, number> = {};
      const monthlyTrend: Record<string, number> = {};

      let totalAmount = 0;
      let activeAmount = 0;
      let accountingRequiredAmount = 0;

      // Processing times in hours
      const processingTimes: number[] = [];

      // Recent activity
      const recentActivity: {
        type: string;
        date: string;
        details: string;
        imprestId: string;
      }[] = [];

      // Upcoming deadlines (imprests that need accounting)
      const upcomingDeadlines: MyImprest[] = [];

      imprests.forEach((imprest: MyImprest) => {
        if (!imprest) return;

        // Status counts - handle null/undefined status
        const status = imprest.status || "pending_hod";
        statusCounts[status as ImprestStatus] =
          (statusCounts[status as ImprestStatus] || 0) + 1;

        // Currency distribution - handle null/undefined currency
        const currency = imprest.currency || "KES";
        const amount = imprest.amount || 0;
        currencyDistribution[currency] =
          (currencyDistribution[currency] || 0) + amount;

        // Total amount
        totalAmount += amount;

        // Active amount (pending or disbursed)
        if (
          status === "pending_accountant" ||
          status === "pending_hod" ||
          status === "disbursed"
        ) {
          activeAmount += amount;
        }

        // Accounting required (disbursed but not accounted)
        if (status === "disbursed") {
          accountingRequiredAmount += amount;
          upcomingDeadlines.push(imprest);
        }

        // Monthly trend
        if (imprest.createdAt) {
          try {
            const date = new Date(imprest.createdAt);
            const monthYear = `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, "0")}`;
            monthlyTrend[monthYear] = (monthlyTrend[monthYear] || 0) + amount;
          } catch (e) {
            // Skip if date is invalid
          }
        }

        // Processing time calculation
        if (
          (status === "accounted" || status === "disbursed") &&
          imprest.hodApproval &&
          imprest.hodApproval.approvedAt &&
          imprest.createdAt
        ) {
          try {
            const requestDate = new Date(imprest.createdAt);
            const approvalDate = new Date(imprest.hodApproval.approvedAt);
            const processingTime =
              (approvalDate.getTime() - requestDate.getTime()) /
              (1000 * 60 * 60); // hours
            if (!isNaN(processingTime) && processingTime >= 0) {
              processingTimes.push(processingTime);
            }
          } catch (e) {
            // Skip this processing time calculation if dates are invalid
          }
        }

        // Recent activity
        if (imprest.accounting && imprest.accounting.verifiedAt) {
          recentActivity.push({
            type: "accounting",
            date: imprest.accounting.verifiedAt,
            details: `You accounted for ${formatCurrency(amount, currency)} (${
              imprest.paymentReason
            })`,
            imprestId: imprest._id,
          });
        }

        if (imprest.disbursement && imprest.disbursement.disbursedAt) {
          recentActivity.push({
            type: "disbursement",
            date: imprest.disbursement.disbursedAt,
            details: `${formatCurrency(amount, currency)} disbursed for ${
              imprest.paymentReason
            }`,
            imprestId: imprest._id,
          });
        }

        if (
          imprest.accountantApproval &&
          imprest.accountantApproval.approvedAt
        ) {
          recentActivity.push({
            type: "approval",
            date: imprest.accountantApproval.approvedAt,
            details: `Accountant approved your imprest for ${imprest.paymentReason}`,
            imprestId: imprest._id,
          });
        }

        if (imprest.hodApproval && imprest.hodApproval.approvedAt) {
          recentActivity.push({
            type: "approval",
            date: imprest.hodApproval.approvedAt,
            details: `HOD approved your imprest for ${imprest.paymentReason}`,
            imprestId: imprest._id,
          });
        }

        if (imprest.rejection && imprest.rejection.rejectedAt) {
          recentActivity.push({
            type: "rejection",
            date: imprest.rejection.rejectedAt,
            details: `Your imprest for ${imprest.paymentReason} was rejected: ${
              imprest.rejection.reason || "No reason provided"
            }`,
            imprestId: imprest._id,
          });
        }
      });

      // Sort recent activity by date (newest first)
      recentActivity.sort((a, b) => {
        try {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        } catch (e) {
          return 0;
        }
      });

      // Sort upcoming deadlines by due date (soonest first)
      upcomingDeadlines.sort((a, b) => {
        try {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        } catch (e) {
          return 0;
        }
      });

      // Calculate average processing time
      const averageProcessingTime = processingTimes.length
        ? processingTimes.reduce((sum, time) => sum + time, 0) /
          processingTimes.length
        : 0;

      return {
        totalImprests: imprests.length,
        totalAmount,
        activeImprests:
          (statusCounts.pending_accountant || 0) +
          (statusCounts.pending_hod || 0) +
          (statusCounts.disbursed || 0),
        activeAmount,
        accountedImprests: statusCounts.accounted || 0,
        pendingImprests:
          (statusCounts.pending_accountant || 0) +
          (statusCounts.pending_hod || 0),
        rejectedImprests: statusCounts.rejected || 0,
        statusCounts,
        currencyDistribution,
        upcomingDeadlines,
        recentActivity: recentActivity.slice(0, 5), // Only keep the 5 most recent activities
        averageProcessingTime,
        accountingRequired: statusCounts.disbursed || 0,
        accountingRequiredAmount,
        monthlyTrend,
      } as MyImprestStats;
    } catch (error) {
      console.error("Error calculating stats:", error);
      return {
        totalImprests: imprests.length,
        totalAmount: 0,
        activeImprests: 0,
        activeAmount: 0,
        accountedImprests: 0,
        pendingImprests: 0,
        rejectedImprests: 0,
        statusCounts: {
          accounted: 0,
          pending_accountant: 0,
          pending_hod: 0,
          rejected: 0,
          disbursed: 0,
        },
        currencyDistribution: {},
        upcomingDeadlines: [],
        recentActivity: [],
        averageProcessingTime: 0,
        accountingRequired: 0,
        accountingRequiredAmount: 0,
        monthlyTrend: {},
      } as MyImprestStats;
    }
  }, [imprests]);

  const defaultCurrency = useMemo(() => {
    try {
      const currencies = Object.keys(stats.currencyDistribution || {});
      return currencies.length > 0 ? currencies[0] : "KES";
    } catch (e) {
      return "KES";
    }
  }, [stats.currencyDistribution]);

  const monthlyTrendSorted = useMemo(() => {
    try {
      return Object.entries(stats.monthlyTrend || {})
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6);
    } catch (e) {
      return [];
    }
  }, [stats.monthlyTrend]);

  if (!imprests || imprests.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <FileText className="h-6 w-6 text-slate-500 dark:text-slate-400" />
        </div>
        <h3 className="mb-1 text-lg font-medium">No Imprest Requests Found</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          You haven&apos;t made any imprest requests yet. Click the button below
          to create your first request.
        </p>
        <Button className="mt-4">Create New Imprest Request</Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
        {/* Overview Card */}
        <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
            <CardTitle className="flex items-center text-lg font-semibold">
              <User className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
              My Imprest Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2.5">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Total Requests
                  </span>
                  <span className="text-2xl font-bold">
                    {stats.totalImprests || 0}
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Total value:{" "}
                  {formatCurrency(stats.totalAmount || 0, defaultCurrency)}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Status Distribution</p>
                <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="bg-emerald-500 transition-all duration-300"
                    style={{
                      width: `${
                        stats.totalImprests > 0
                          ? ((stats.accountedImprests || 0) /
                              stats.totalImprests) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                  <div
                    className="bg-amber-500 transition-all duration-300"
                    style={{
                      width: `${
                        stats.totalImprests > 0
                          ? ((stats.pendingImprests || 0) /
                              stats.totalImprests) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                  <div
                    className="bg-blue-500 transition-all duration-300"
                    style={{
                      width: `${
                        stats.totalImprests > 0
                          ? ((stats.accountingRequired || 0) /
                              stats.totalImprests) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                  <div
                    className="bg-rose-500 transition-all duration-300"
                    style={{
                      width: `${
                        stats.totalImprests > 0
                          ? ((stats.rejectedImprests || 0) /
                              stats.totalImprests) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                      >
                        Accounted: {stats.accountedImprests || 0}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {formatPercentage(
                          stats.totalImprests > 0
                            ? ((stats.accountedImprests || 0) /
                                stats.totalImprests) *
                                100
                            : 0
                        )}
                        {" of your imprests"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                      >
                        Pending: {stats.pendingImprests || 0}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Awaiting approval from HOD or Accountant</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                      >
                        Disbursed: {stats.accountingRequired || 0}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Funds disbursed, accounting required</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Active Imprests
                  </div>
                  <div className="mt-1 text-lg font-semibold">
                    {stats.activeImprests || 0}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Avg. Processing
                  </div>
                  <div className="mt-1 text-lg font-semibold">
                    {Math.round(stats.averageProcessingTime || 0)}
                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                      hrs
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Imprests Card */}
        <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-2 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/50">
            <CardTitle className="flex items-center text-lg font-semibold">
              <TrendingUp className="mr-2 h-5 w-5 text-amber-600 dark:text-amber-400" />
              Active Imprests
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Active Amount
                  </div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(stats.activeAmount || 0, defaultCurrency)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Requests
                  </div>
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {stats.activeImprests || 0}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Recent Requests</p>
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {stats.upcomingDeadlines &&
                  stats.upcomingDeadlines.length > 0 ? (
                    stats.upcomingDeadlines.slice(0, 2).map((imprest, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs font-medium line-clamp-1">
                              {imprest.paymentReason}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {formatCurrency(
                                imprest.amount || 0,
                                imprest.currency || defaultCurrency
                              )}
                            </p>
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="outline"
                                className={getStatusBadgeVariant(
                                  imprest.status
                                )}
                              >
                                {getReadableStatus(imprest.status)}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Created: {formatDate(imprest.createdAt)}</p>
                              {imprest.dueDate && (
                                <p>
                                  Due: {formatDate(imprest.dueDate)} (
                                  <span
                                    className={getDaysRemainingColor(
                                      calculateDaysRemaining(imprest.dueDate)
                                    )}
                                  >
                                    {calculateDaysRemaining(imprest.dueDate)}{" "}
                                    days
                                  </span>
                                  )
                                </p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        No active imprests
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accounting Status Card */}
        <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-2 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50">
            <CardTitle className="flex items-center text-lg font-semibold">
              <ReceiptText className="mr-2 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Accounting Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Accounting Required
                  </div>
                  <div className="text-2xl font-bold">
                    {stats.accountingRequired || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Amount
                  </div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(
                      stats.accountingRequiredAmount || 0,
                      defaultCurrency
                    )}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Accounting Deadlines</p>
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {stats.upcomingDeadlines &&
                  stats.upcomingDeadlines.length > 0 ? (
                    stats.upcomingDeadlines
                      .filter((imprest) => imprest.status === "disbursed")
                      .map((imprest, i) => {
                        const daysRemaining = calculateDaysRemaining(
                          imprest.dueDate
                        );
                        return (
                          <div
                            key={i}
                            className="rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-xs font-medium line-clamp-1">
                                  {imprest.paymentReason}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                  Due: {formatDate(imprest.dueDate)}
                                </p>
                              </div>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge
                                    variant="outline"
                                    className={`${
                                      daysRemaining < 0
                                        ? "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
                                        : daysRemaining <= 2
                                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    }`}
                                  >
                                    {daysRemaining < 0
                                      ? "Overdue"
                                      : daysRemaining === 0
                                      ? "Due today"
                                      : `${daysRemaining} days`}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {formatCurrency(
                                      imprest.amount || 0,
                                      imprest.currency || defaultCurrency
                                    )}{" "}
                                    disbursed on{" "}
                                    {imprest.disbursement
                                      ? formatDate(
                                          imprest.disbursement.disbursedAt
                                        )
                                      : "N/A"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <div className="text-center py-4 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                      <CheckCircle className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        No accounting required
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Card */}
        <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-2 bg-gradient-to-r from-violet-50 to-violet-100 dark:from-violet-950/50 dark:to-violet-900/50">
            <CardTitle className="flex items-center text-lg font-semibold">
              <History className="mr-2 h-5 w-5 text-violet-600 dark:text-violet-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Completed
                  </div>
                  <div className="text-2xl font-bold">
                    {stats.accountedImprests || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Success Rate
                  </div>
                  <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                    {formatPercentage(
                      stats.totalImprests > 0
                        ? ((stats.accountedImprests || 0) /
                            (stats.totalImprests -
                              (stats.pendingImprests || 0))) *
                            100
                        : 0
                    )}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Activity Timeline</p>
                <ScrollArea className="space-y-2 pr-1 h-[155px]">
                  {stats.recentActivity && stats.recentActivity.length > 0 ? (
                    stats.recentActivity.map((activity, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          {activity.type === "accounting" && (
                            <ReceiptText className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                          )}
                          {activity.type === "disbursement" && (
                            <DollarSign className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                          )}
                          {activity.type === "approval" && (
                            <CheckCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                          )}
                          {activity.type === "rejection" && (
                            <AlertCircle className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs line-clamp-2">
                              {activity.details ||
                                "Activity details unavailable"}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {activity.date
                                ? formatDate(activity.date)
                                : "Date unavailable"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                      <Shield className="h-5 w-5 mx-auto text-slate-400 mb-1" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        No recent activity
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
