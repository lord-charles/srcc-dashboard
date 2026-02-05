"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  DollarSign,
  FileCheck,
  Hourglass,
  ShieldAlert,
  Timer,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

// Define contract status types for better type safety
type ContractStatus =
  | "active"
  | "pending"
  | "expired"
  | "draft"
  | "terminated"
  | "rejected"
  | string;

// Define contract interface for type safety
interface Contract {
  _id: string;
  contractNumber?: string;
  description?: string;
  contractValue?: number | string;
  currency?: string;
  status?: ContractStatus;
  createdBy?: string;
  updatedBy?: string;
  startDate?: string;
  endDate?: string;
  projectId?: {
    _id?: string;
    name?: string;
  } | null;
  contractedUserId?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
  } | null;
  amendments?: Array<{
    date?: string;
    description?: string;
    changedFields?: string[];
    approvedBy?: string;
    _id?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
  approvalFlow?: {
    financeApprovals?: Array<{
      approvedAt?: string;
      comments?: string;
      _id?: string;
    }>;
    mdApprovals?: Array<{
      approvedAt?: string;
      comments?: string;
      _id?: string;
    }>;
    _id?: string;
  };
  currentLevelDeadline?: string | null;
  finalApproval?: {
    approvedAt?: string;
    _id?: string;
  } | null;
}

// Define stats interface
interface ContractStats {
  totalContracts: number;
  totalValue: number;
  statusDistribution: Record<ContractStatus, number>;
  currencyDistribution: Record<string, number>;
  valueByProject: Record<string, number>;
  expiringContracts: {
    next30Days: number;
    next60Days: number;
    next90Days: number;
  };
  approvalMetrics: {
    averageApprovalTime: number | null;
    pendingApprovals: number;
    approvedContracts: number;
    fastestApproval: number | null;
    slowestApproval: number | null;
  };
  amendmentMetrics: {
    totalAmendments: number;
    contractsWithAmendments: number;
    averageAmendmentsPerContract: number;
    mostAmendedContract: {
      contractNumber: string;
      count: number;
    } | null;
  };
  projectAssociation: {
    withProject: number;
    withoutProject: number;
  };
  contractDuration: {
    averageMonths: number | null;
    shortestMonths: number | null;
    longestMonths: number | null;
  };
  recentActivity: {
    lastCreated: string | null;
    lastUpdated: string | null;
    lastApproved: string | null;
  };
}

export default function ContractStats({
  contractsData,
}: {
  contractsData: Contract[];
}) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ContractStats>({
    totalContracts: 0,
    totalValue: 0,
    statusDistribution: {},
    currencyDistribution: {},
    valueByProject: {},
    expiringContracts: {
      next30Days: 0,
      next60Days: 0,
      next90Days: 0,
    },
    approvalMetrics: {
      averageApprovalTime: null,
      pendingApprovals: 0,
      approvedContracts: 0,
      fastestApproval: null,
      slowestApproval: null,
    },
    amendmentMetrics: {
      totalAmendments: 0,
      contractsWithAmendments: 0,
      averageAmendmentsPerContract: 0,
      mostAmendedContract: null,
    },
    projectAssociation: {
      withProject: 0,
      withoutProject: 0,
    },
    contractDuration: {
      averageMonths: null,
      shortestMonths: null,
      longestMonths: null,
    },
    recentActivity: {
      lastCreated: null,
      lastUpdated: null,
      lastApproved: null,
    },
  });

  // Calculate contract statistics
  useEffect(() => {
    const calculateStats = async () => {
      try {
        setLoading(true);

        if (!Array.isArray(contractsData) || contractsData.length === 0) {
          console.warn("Contract data is empty or not an array");
          setLoading(false);
          return;
        }

        // Initialize counters and aggregators
        const totalContracts = contractsData.length;
        let totalValue = 0;
        const statusDistribution: Record<ContractStatus, number> = {};
        const currencyDistribution: Record<string, number> = {};
        const valueByProject: Record<string, number> = {};

        let expiringNext30Days = 0;
        let expiringNext60Days = 0;
        let expiringNext90Days = 0;

        let totalApprovalTime = 0;
        let approvalTimeCount = 0;
        let pendingApprovals = 0;
        let approvedContracts = 0;
        let fastestApproval = Number.MAX_VALUE;
        let slowestApproval = 0;

        let totalAmendments = 0;
        let contractsWithAmendments = 0;
        let mostAmendmentsCount = 0;
        let mostAmendedContractNumber = "";

        let withProject = 0;
        let withoutProject = 0;

        let totalDurationMonths = 0;
        let durationCount = 0;
        let shortestDuration = Number.MAX_VALUE;
        let longestDuration = 0;

        let lastCreated = null as Date | null;
        let lastUpdated = null as Date | null;
        let lastApproved = null as Date | null;

        // Current date for calculations
        const now = new Date();

        // Process each contract
        contractsData.forEach((contract: Contract) => {
          if (!contract) return;

          // Contract value calculations
          const value = Number(contract.contractValue) || 0;
          if (!isNaN(value)) {
            totalValue += value;
          }

          // Currency distribution
          const currency = contract.currency || "Unknown";
          currencyDistribution[currency] =
            (currencyDistribution[currency] || 0) + value;

          // Status distribution
          const status = contract.status || "Unknown";
          statusDistribution[status] = (statusDistribution[status] || 0) + 1;

          // Project association
          if (contract.projectId && contract.projectId.name) {
            withProject++;
            const projectName = contract.projectId.name || "Unknown Project";
            valueByProject[projectName] =
              (valueByProject[projectName] || 0) + value;
          } else {
            withoutProject++;
            valueByProject["No Project"] =
              (valueByProject["No Project"] || 0) + value;
          }

          // Expiration calculations
          if (contract.endDate) {
            try {
              const endDate = new Date(contract.endDate);
              if (!isNaN(endDate.getTime())) {
                const daysUntilExpiration = Math.ceil(
                  (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
                );

                if (daysUntilExpiration > 0) {
                  if (daysUntilExpiration <= 30) expiringNext30Days++;
                  if (daysUntilExpiration <= 60) expiringNext60Days++;
                  if (daysUntilExpiration <= 90) expiringNext90Days++;
                }
              }
            } catch (error) {
              console.error("Error parsing end date:", error);
            }
          }

          // Contract duration calculations
          if (contract.startDate && contract.endDate) {
            try {
              const startDate = new Date(contract.startDate);
              const endDate = new Date(contract.endDate);

              if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                // Calculate duration in months
                const durationMonths =
                  (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                  (endDate.getMonth() - startDate.getMonth());

                if (durationMonths > 0) {
                  totalDurationMonths += durationMonths;
                  durationCount++;

                  if (durationMonths < shortestDuration) {
                    shortestDuration = durationMonths;
                  }

                  if (durationMonths > longestDuration) {
                    longestDuration = durationMonths;
                  }
                }
              }
            } catch (error) {
              console.error("Error calculating contract duration:", error);
            }
          }

          // Approval metrics
          if (
            contract.finalApproval &&
            contract.finalApproval.approvedAt &&
            contract.createdAt
          ) {
            try {
              approvedContracts++;
              const approvalDate = new Date(contract.finalApproval.approvedAt);
              const creationDate = new Date(contract.createdAt);

              if (
                !isNaN(approvalDate.getTime()) &&
                !isNaN(creationDate.getTime())
              ) {
                const approvalTimeHours =
                  (approvalDate.getTime() - creationDate.getTime()) /
                  (1000 * 60 * 60);

                if (!isNaN(approvalTimeHours) && approvalTimeHours >= 0) {
                  totalApprovalTime += approvalTimeHours;
                  approvalTimeCount++;

                  if (approvalTimeHours < fastestApproval) {
                    fastestApproval = approvalTimeHours;
                  }

                  if (approvalTimeHours > slowestApproval) {
                    slowestApproval = approvalTimeHours;
                  }
                }

                // Track last approved date
                if (!lastApproved || approvalDate > lastApproved) {
                  lastApproved = approvalDate;
                }
              }
            } catch (error) {
              console.error("Error calculating approval time:", error);
            }
          } else if (
            status === "pending" ||
            status === "draft" ||
            status.startsWith("pending")
          ) {
            pendingApprovals++;
          }

          // Amendment metrics
          if (
            contract.amendments &&
            Array.isArray(contract.amendments) &&
            contract.amendments.length > 0
          ) {
            totalAmendments += contract.amendments.length;
            contractsWithAmendments++;

            if (contract.amendments.length > mostAmendmentsCount) {
              mostAmendmentsCount = contract.amendments.length;
              mostAmendedContractNumber =
                contract.contractNumber || contract._id;
            }
          }

          // Recent activity tracking
          try {
            if (contract.createdAt) {
              const createdDate = new Date(contract.createdAt);
              if (
                !isNaN(createdDate.getTime()) &&
                (!lastCreated || createdDate > lastCreated)
              ) {
                lastCreated = createdDate;
              }
            }

            if (contract.updatedAt) {
              const updatedDate = new Date(contract.updatedAt);
              if (
                !isNaN(updatedDate.getTime()) &&
                (!lastUpdated || updatedDate > lastUpdated)
              ) {
                lastUpdated = updatedDate;
              }
            }
          } catch (error) {
            console.error("Error tracking recent activity:", error);
          }
        });

        // Calculate averages and set state
        setStats({
          totalContracts,
          totalValue,
          statusDistribution,
          currencyDistribution,
          valueByProject,
          expiringContracts: {
            next30Days: expiringNext30Days,
            next60Days: expiringNext60Days,
            next90Days: expiringNext90Days,
          },
          approvalMetrics: {
            averageApprovalTime:
              approvalTimeCount > 0
                ? totalApprovalTime / approvalTimeCount
                : null,
            pendingApprovals,
            approvedContracts,
            fastestApproval:
              fastestApproval !== Number.MAX_VALUE ? fastestApproval : null,
            slowestApproval: slowestApproval > 0 ? slowestApproval : null,
          },
          amendmentMetrics: {
            totalAmendments,
            contractsWithAmendments,
            averageAmendmentsPerContract:
              totalContracts > 0 ? totalAmendments / totalContracts : 0,
            mostAmendedContract:
              mostAmendmentsCount > 0
                ? {
                    contractNumber: mostAmendedContractNumber,
                    count: mostAmendmentsCount,
                  }
                : null,
          },
          projectAssociation: {
            withProject,
            withoutProject,
          },
          contractDuration: {
            averageMonths:
              durationCount > 0 ? totalDurationMonths / durationCount : null,
            shortestMonths:
              shortestDuration !== Number.MAX_VALUE ? shortestDuration : null,
            longestMonths: longestDuration > 0 ? longestDuration : null,
          },
          recentActivity: {
            lastCreated: lastCreated?.toISOString() ?? null,
            lastUpdated: lastUpdated?.toISOString() ?? null,
            lastApproved: lastApproved?.toISOString() ?? null,
          },
        });
      } catch (error) {
        console.error("Error calculating contract stats:", error);
      } finally {
        setLoading(false);
      }
    };

    calculateStats();
  }, []);

  // Format currency with error handling
  const formatCurrency = (amount: number, currency = "KES") => {
    try {
      if (isNaN(amount)) return `${currency} 0`;

      return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: currency,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch (error) {
      console.error("Error formatting currency:", error);
      return `${currency} ${amount.toLocaleString()}`;
    }
  };

  // Format time duration
  const formatDuration = (hours: number | null) => {
    if (hours === null) return "N/A";
    if (isNaN(hours)) return "N/A";

    if (hours < 1) return `${Math.round(hours * 60)} minutes`;
    if (hours < 24) return `${Math.round(hours)} hours`;
    return `${Math.round(hours / 24)} days`;
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";

      return new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Error";
    }
  };

  // Get time ago
  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);

      if (diffDay > 30) {
        return formatDate(dateString);
      } else if (diffDay > 0) {
        return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
      } else if (diffHour > 0) {
        return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
      } else if (diffMin > 0) {
        return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
      } else {
        return "Just now";
      }
    } catch (error) {
      console.error("Error calculating time ago:", error);
      return "Error";
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-emerald-500";
      case "pending":
        return "bg-amber-500";
      case "expired":
        return "bg-red-500";
      case "draft":
        return "bg-blue-500";
      case "terminated":
        return "bg-slate-500";
      case "rejected":
        return "bg-rose-500";
      default:
        return "bg-slate-400";
    }
  };

  // Memoize status distribution for performance
  const statusDistribution = useMemo(() => {
    return Object.entries(stats.statusDistribution).sort(
      ([, a], [, b]) => b - a,
    );
  }, [stats.statusDistribution]);

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {/* Financial Overview Card */}
        <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              Overview
            </CardTitle>
            <CardDescription>Contract value and distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-16 w-16 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="pt-2">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold">
                      {formatCurrency(stats.totalValue)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total Contract Value
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Contracts</span>
                    <span className="font-medium">{stats.totalContracts}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Average Value
                      </span>
                      <span className="font-medium">
                        {stats.totalContracts > 0
                          ? formatCurrency(
                              stats.totalValue / stats.totalContracts,
                            )
                          : formatCurrency(0)}
                      </span>
                    </div>
                  </div>

                  {/* <div className="pt-2">
                    <p className="text-sm font-medium mb-1">Project Distribution</p>
                    <div className="space-y-1.5">
                      {topProjects.map(([project, value], i) => (
                        <div key={i} className="flex items-center justify-between text-sm group">
                          <div className="flex items-center gap-1.5 truncate pr-2 max-w-[70%]">
                            <span
                              className={`h-2 w-2 rounded-full ${["bg-emerald-500", "bg-blue-500", "bg-amber-500"][i % 3]
                                }`}
                            ></span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="truncate hover:text-foreground transition-colors">{project}</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{project}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <span className="font-medium">{formatCurrency(value)}</span>
                        </div>
                      ))}
                      {Object.keys(stats.valueByProject).length > 3 && (
                        <div className="text-xs text-muted-foreground text-right italic">
                          +{Object.keys(stats.valueByProject).length - 3} more projects
                        </div>
                      )}
                    </div>
                  </div> */}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contract Status Card */}
        <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-blue-500" />
              Contract Status
            </CardTitle>
            <CardDescription>Status distribution and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-12 w-12 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stats.totalContracts}</p>
                    <p className="text-sm text-muted-foreground">
                      Total Contracts
                    </p>
                  </div>
                  <div className="relative h-12 w-12">
                    <svg
                      className="h-12 w-12 rotate-[-90deg]"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        className="stroke-slate-200 dark:stroke-slate-700"
                        cx="50"
                        cy="50"
                        r="35"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        className="stroke-blue-500"
                        cx="50"
                        cy="50"
                        r="35"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray="219.9"
                        strokeDashoffset={
                          stats.totalContracts > 0 &&
                          stats.approvalMetrics.approvedContracts > 0
                            ? 219.9 -
                              219.9 *
                                (stats.approvalMetrics.approvedContracts /
                                  stats.totalContracts)
                            : 219.9
                        }
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    </div>
                  </div>
                </div>

                <div className="space-y-0">
                  {statusDistribution.slice(0, 3).map(([status, count], i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-1"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${getStatusColor(
                            status,
                          )}`}
                        ></div>
                        <span className="text-[8px] capitalize text-muted-foreground">
                          {status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{count}</span>
                        <span className="text-xs text-muted-foreground">
                          {stats.totalContracts > 0
                            ? `${Math.round((count / stats.totalContracts) * 100)}%`
                            : "0%"}
                        </span>
                      </div>
                    </div>
                  ))}
                  {statusDistribution.length > 3 && (
                    <div className="flex items-center justify-between py-1 border-t border-slate-200 dark:border-slate-700 pt-2">
                      <span className="text-xs text-muted-foreground italic">
                        +{statusDistribution.length - 3} more statuses
                      </span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-xs text-blue-500 cursor-help">
                            View all
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            {statusDistribution
                              .slice(3)
                              .map(([status, count], i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between gap-4"
                                >
                                  <span className="capitalize">{status}</span>
                                  <span>{count}</span>
                                </div>
                              ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Timeline & Expiration Card */}
        <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-violet-500" />
              Timeline
            </CardTitle>
            <CardDescription>Contract duration and expiration</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-10 w-20" />
                  <Skeleton className="h-16 w-16 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>
                <Skeleton className="h-4 w-32 mb-2" />
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">
                      {stats.expiringContracts.next30Days}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Expiring in 30 Days
                    </p>
                  </div>
                  <div className="relative h-16 w-16">
                    <svg
                      className="h-16 w-16 rotate-[-90deg]"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        className="stroke-slate-200 dark:stroke-slate-700"
                        cx="50"
                        cy="50"
                        r="40"
                        strokeWidth="10"
                        fill="none"
                      />
                      <circle
                        className="stroke-violet-500"
                        cx="50"
                        cy="50"
                        r="40"
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray="251.2"
                        strokeDashoffset={
                          stats.totalContracts > 0
                            ? 251.2 -
                              251.2 *
                                (stats.expiringContracts.next30Days /
                                  stats.totalContracts)
                            : 251.2
                        }
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                      {stats.totalContracts > 0
                        ? Math.round(
                            (stats.expiringContracts.next30Days /
                              stats.totalContracts) *
                              100,
                          )
                        : 0}
                      %
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Expiring in 60 Days
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-700 border-amber-200"
                    >
                      {stats.expiringContracts.next60Days}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Expiring in 90 Days
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {stats.expiringContracts.next90Days}
                    </Badge>
                  </div>

                  {/* <div>
                    <p className="text-sm font-medium mb-1">Renewal Timeline</p>
                    <div className="relative pt-2">
                      <div className="relative pl-6 pb-3 group">
                        <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-red-500 group-hover:ring-2 group-hover:ring-red-200 transition-all duration-200"></div>
                        <p className="text-sm font-medium flex items-center">
                          30 Days
                          {stats.expiringContracts.next30Days > 0 && (
                            <AlertTriangle className="h-3.5 w-3.5 text-red-500 ml-1" />
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Urgent renewal required
                        </p>
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>
            )}
          </CardContent>
          {/* <CardFooter className="pt-0 pb-3">
            <div className="w-full flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Hourglass className="h-4 w-4" />
                <span>Average Duration</span>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-medium">
                    {stats.contractDuration.averageMonths !== null
                      ? `${Math.round(
                          stats.contractDuration.averageMonths
                        )} months`
                      : "N/A"}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Average contract duration across all contracts</p>
                  {stats.contractDuration.shortestMonths !== null && (
                    <p>
                      Shortest: {stats.contractDuration.shortestMonths} months
                    </p>
                  )}
                  {stats.contractDuration.longestMonths !== null && (
                    <p>
                      Longest: {stats.contractDuration.longestMonths} months
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </div>
          </CardFooter> */}
        </Card>

        {/* Approval & Amendment Card */}
        <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              Approval
            </CardTitle>
            <CardDescription>Approval process metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-16 w-16 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-20 rounded-lg" />
                  <Skeleton className="h-20 rounded-lg" />
                </div>
                <Skeleton className="h-4 w-32 mb-2" />
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">
                      {formatDuration(
                        stats.approvalMetrics.averageApprovalTime,
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Average Approval Time
                    </p>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-amber-50 flex items-center justify-center">
                    <Timer className="h-8 w-8 text-amber-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <p className="text-md font-bold">
                      {stats.approvalMetrics.pendingApprovals}
                    </p>
                    <p className="text-xs text-muted-foreground text-center">
                      Pending
                    </p>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-help">
                        <p className="text-md font-bold">
                          {stats.amendmentMetrics.totalAmendments}
                        </p>
                        <p className="text-xs text-muted-foreground text-center">
                          Amendments
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {stats.amendmentMetrics.contractsWithAmendments}{" "}
                        contracts have amendments
                      </p>
                      {stats.amendmentMetrics.mostAmendedContract && (
                        <p>
                          Most amended:{" "}
                          {
                            stats.amendmentMetrics.mostAmendedContract
                              .contractNumber
                          }{" "}
                          ({stats.amendmentMetrics.mostAmendedContract.count})
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )}
          </CardContent>
          {/* <CardFooter className="pt-0 pb-3">
            <div className="w-full flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <ArrowUpRight className="h-4 w-4" />
                <span>Recent Activity</span>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200 cursor-help"
                  >
                    {stats.recentActivity.lastUpdated
                      ? getTimeAgo(stats.recentActivity.lastUpdated)
                      : "N/A"}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Last contract update:{" "}
                    {formatDate(stats.recentActivity.lastUpdated)}
                  </p>
                  <p>
                    Last contract created:{" "}
                    {formatDate(stats.recentActivity.lastCreated)}
                  </p>
                  <p>
                    Last contract approved:{" "}
                    {formatDate(stats.recentActivity.lastApproved)}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardFooter> */}
        </Card>
      </div>
    </TooltipProvider>
  );
}
