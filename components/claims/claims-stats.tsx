"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Clock,
  FileCheck2,
  CheckCircle2,
  Users,
  Building2,
  Hourglass,
  Calendar,
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
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

// Define claim status types for better type safety
type ClaimStatus =
  | "pending_claim_checker_approval"
  | "pending_reviewer_approval"
  | "pending_approver_approval"
  | "pending_srcc_checker_approval"
  | "pending_srcc_finance_approval"
  | "approved"
  | "rejected"
  | string;

// Define claim interface for type safety
interface Milestone {
  milestoneId: string;
  title: string;
  percentageClaimed: number;
  maxClaimableAmount: number;
  previouslyClaimed: number;
  currentClaim: number;
  remainingClaimable: number;
  _id: string;
}

interface AuditTrailEntry {
  action: string;
  performedBy: string;
  performedAt: string;
  details: {
    role: string;
    department: string;
    comments: string;
    nextStatus: string;
  };
  _id: string;
}

interface ApprovalStep {
  stepNumber: number;
  role: string;
  department: string;
  description: string;
  nextStatus: string;
  _id: string;
}

interface Claim {
  _id: string;
  projectId?: {
    _id?: string;
    name?: string;
    description?: string;
    department?: string;
  };
  contractId?: {
    _id?: string;
    contractNumber?: string;
    contractValue?: number;
  };
  claimantId?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  amount?: number;
  currency?: string;
  milestones?: Milestone[];
  status?: ClaimStatus;
  version?: number;
  createdBy?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
  };
  updatedBy?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
  };
  documents?: any[];
  auditTrail?: AuditTrailEntry[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  currentLevelDeadline?: string;
  approval?: {
    reviewerApproval?: {
      approvedBy?: string;
      approvedAt?: string;
      comments?: string;
      department?: string;
    };
    approverApproval?: {
      approvedBy?: string;
      approvedAt?: string;
      comments?: string;
      department?: string;
    };
  };
  approvalFlow?: {
    _id?: string;
    department?: string;
    __v?: number;
    createdAt?: string;
    description?: string;
    isActive?: boolean;
    steps?: ApprovalStep[];
    updatedAt?: string;
  };
}

// Define stats interface
interface ClaimStats {
  // Financial metrics
  totalClaims: number;
  totalClaimedAmount: number;
  totalApprovedAmount: number;
  totalPendingAmount: number;
  averageClaimAmount: number;
  currencyDistribution: Record<string, number>;

  // Status metrics
  statusDistribution: Record<ClaimStatus, number>;
  approvalRatio: number;
  pendingApprovals: number;

  // Department metrics
  departmentDistribution: Record<string, number>;
  departmentAmounts: Record<string, number>;

  // Timeline metrics
  averageApprovalTime: number | null;
  fastestApproval: number | null;
  slowestApproval: number | null;
  pendingByAge: {
    lessThan24h: number;
    lessThan48h: number;
    lessThan7d: number;
    moreThan7d: number;
  };

  // Milestone metrics
  totalMilestones: number;
  averagePercentageClaimed: number;
  totalRemainingClaimable: number;

  // Activity metrics
  recentActivity: {
    lastCreated: string | null;
    lastUpdated: string | null;
    lastApproved: string | null;
  };
}

// Update the getReadableStatus function to better categorize statuses
const getReadableStatus = (status: ClaimStatus): string => {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  if (status === "pending") return "Pending";
  if (status.includes("pending")) return "Pending";

  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

// Update the getStatusBadgeVariant function for consistent styling
const getStatusBadgeVariant = (status: ClaimStatus): string => {
  if (status === "approved")
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "rejected") return "bg-rose-50 text-rose-700 border-rose-200";
  if (status === "pending")
    return "bg-amber-50 text-amber-700 border-amber-200";
  if (status.includes("pending"))
    return "bg-amber-50 text-amber-700 border-amber-200";

  return "bg-slate-50 text-slate-700 border-slate-200";
};

// Add this function to group statuses for visualization
const groupStatusesForDisplay = (
  statusDistribution: [string, number][]
): [string, number][] => {
  const grouped: Record<string, number> = {
    Approved: 0,
    Rejected: 0,
    Pending: 0,
    Other: 0,
  };

  statusDistribution.forEach(([status, count]) => {
    if (status === "approved") {
      grouped["Approved"] += count;
    } else if (status === "rejected") {
      grouped["Rejected"] += count;
    } else if (status.includes("pending")) {
      grouped["Pending"] += count;
    } else {
      grouped["Other"] += count;
    }
  });

  return Object.entries(grouped).filter(([_, count]) => count > 0);
};

export default function ClaimsStats({ claimsData }: { claimsData: any }) {
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [stats, setStats] = useState<ClaimStats>({
    // Financial metrics
    totalClaims: 0,
    totalClaimedAmount: 0,
    totalApprovedAmount: 0,
    totalPendingAmount: 0,
    averageClaimAmount: 0,
    currencyDistribution: {},

    // Status metrics
    statusDistribution: {},
    approvalRatio: 0,
    pendingApprovals: 0,

    // Department metrics
    departmentDistribution: {},
    departmentAmounts: {},

    // Timeline metrics
    averageApprovalTime: null,
    fastestApproval: null,
    slowestApproval: null,
    pendingByAge: {
      lessThan24h: 0,
      lessThan48h: 0,
      lessThan7d: 0,
      moreThan7d: 0,
    },

    // Milestone metrics
    totalMilestones: 0,
    averagePercentageClaimed: 0,
    totalRemainingClaimable: 0,

    // Activity metrics
    recentActivity: {
      lastCreated: null,
      lastUpdated: null,
      lastApproved: null,
    },
  });

  // Calculate claim statistics
  useEffect(() => {
    const calculateStats = async () => {
      try {
        setLoading(true);

        if (!Array.isArray(claimsData) || claimsData.length === 0) {
          console.warn("Claims data is empty or not an array");
          setLoading(false);
          return;
        }

        // Initialize counters and aggregators
        let totalClaims = 0;
        let totalClaimedAmount = 0;
        let totalApprovedAmount = 0;
        let totalPendingAmount = 0;
        const currencyDistribution: Record<string, number> = {};
        const statusDistribution: Record<ClaimStatus, number> = {};
        const departmentDistribution: Record<string, number> = {};
        const departmentAmounts: Record<string, number> = {};

        let totalApprovalTime = 0;
        let approvalTimeCount = 0;
        let fastestApproval = Number.MAX_VALUE;
        let slowestApproval = 0;
        let lastCreated: Date | null = null;
        let lastUpdated: Date | null = null;
        let lastApproved: Date | null = null;

        let pendingLessThan24h = 0;
        let pendingLessThan48h = 0;
        let pendingLessThan7d = 0;
        let pendingMoreThan7d = 0;

        let totalMilestones = 0;
        let totalPercentageClaimed = 0;
        let totalRemainingClaimable = 0;

        // Current date for calculations
        const now = new Date();

        // Process each claim
        claimsData.forEach((claim: Claim) => {
          if (!claim) return;

          totalClaims++;

          // Financial metrics
          const amount = Number(claim.amount) || 0;
          if (!isNaN(amount)) {
            totalClaimedAmount += amount;

            if (claim.status === "approved") {
              totalApprovedAmount += amount;
            } else if (claim.status && claim.status.includes("pending")) {
              totalPendingAmount += amount;
            }
          }

          // Currency distribution
          const currency = claim.currency || "Unknown";
          currencyDistribution[currency] =
            (currencyDistribution[currency] || 0) + amount;

          // Status distribution
          const status = claim.status || "Unknown";
          statusDistribution[status] = (statusDistribution[status] || 0) + 1;

          // Department metrics
          const department = claim.projectId?.department || "Unknown";
          departmentDistribution[department] =
            (departmentDistribution[department] || 0) + 1;
          departmentAmounts[department] =
            (departmentAmounts[department] || 0) + amount;

          // Timeline metrics for approved claims
          if (
            claim.status === "approved" &&
            claim.auditTrail &&
            claim.auditTrail.length > 0 &&
            claim.createdAt
          ) {
            try {
              const createdDate = new Date(claim.createdAt);
              const lastApprovalEntry =
                claim.auditTrail[claim.auditTrail.length - 1];

              if (lastApprovalEntry && lastApprovalEntry.performedAt) {
                const approvalDate = new Date(lastApprovalEntry.performedAt);

                if (
                  !isNaN(createdDate.getTime()) &&
                  !isNaN(approvalDate.getTime())
                ) {
                  const approvalTimeHours =
                    (approvalDate.getTime() - createdDate.getTime()) /
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
              }
            } catch (error) {
              console.error("Error calculating approval time:", error);
            }
          }

          // Age of pending claims
          if (
            claim.status &&
            claim.status.includes("pending") &&
            claim.createdAt
          ) {
            try {
              const createdDate = new Date(claim.createdAt);
              if (!isNaN(createdDate.getTime())) {
                const ageHours =
                  (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);

                if (ageHours < 24) {
                  pendingLessThan24h++;
                } else if (ageHours < 48) {
                  pendingLessThan48h++;
                } else if (ageHours < 168) {
                  // 7 days
                  pendingLessThan7d++;
                } else {
                  pendingMoreThan7d++;
                }
              }
            } catch (error) {
              console.error("Error calculating claim age:", error);
            }
          }

          // Milestone metrics
          if (claim.milestones && Array.isArray(claim.milestones)) {
            totalMilestones += claim.milestones.length;

            claim.milestones.forEach((milestone) => {
              if (milestone.percentageClaimed) {
                totalPercentageClaimed += milestone.percentageClaimed;
              }

              if (milestone.remainingClaimable) {
                totalRemainingClaimable += milestone.remainingClaimable;
              }
            });
          }

          // Recent activity tracking
          try {
            if (claim.createdAt) {
              const createdDate = new Date(claim.createdAt);
              if (
                !isNaN(createdDate.getTime()) &&
                (!lastCreated || createdDate > lastCreated)
              ) {
                lastCreated = createdDate;
              }
            }

            if (claim.updatedAt) {
              const updatedDate = new Date(claim.updatedAt);
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

        // Calculate derived metrics
        const averageClaimAmount =
          totalClaims > 0 ? totalClaimedAmount / totalClaims : 0;
        const approvalRatio =
          totalClaims > 0
            ? (statusDistribution["approved"] || 0) / totalClaims
            : 0;
        const pendingApprovals = Object.entries(statusDistribution)
          .filter(([status]) => status.includes("pending"))
          .reduce((sum, [, count]) => sum + count, 0);
        const averagePercentageClaimed =
          totalMilestones > 0 ? totalPercentageClaimed / totalMilestones : 0;

        // Set the calculated stats
        setStats({
          totalClaims,
          totalClaimedAmount,
          totalApprovedAmount,
          totalPendingAmount,
          averageClaimAmount,
          currencyDistribution,

          statusDistribution,
          approvalRatio,
          pendingApprovals,

          departmentDistribution,
          departmentAmounts,

          averageApprovalTime:
            approvalTimeCount > 0
              ? totalApprovalTime / approvalTimeCount
              : null,
          fastestApproval:
            fastestApproval !== Number.MAX_VALUE ? fastestApproval : null,
          slowestApproval: slowestApproval > 0 ? slowestApproval : null,
          pendingByAge: {
            lessThan24h: pendingLessThan24h,
            lessThan48h: pendingLessThan48h,
            lessThan7d: pendingLessThan7d,
            moreThan7d: pendingMoreThan7d,
          },

          totalMilestones,
          averagePercentageClaimed,
          totalRemainingClaimable,

          recentActivity: {
            lastCreated: lastCreated ?? null,
            lastUpdated: lastUpdated ?? null,
            lastApproved: lastApproved ?? null,
          },
        });
      } catch (error) {
        console.error("Error calculating claim stats:", error);
      } finally {
        setLoading(false);
      }
    };

    calculateStats();
  }, [claimsData]);

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

  // Memoize status distribution for performance
  const statusDistribution = useMemo(() => {
    return Object.entries(stats.statusDistribution).sort(
      ([, a], [, b]) => b - a
    );
  }, [stats.statusDistribution]);

  // Add a new memoized value for grouped statuses
  const groupedStatusDistribution = useMemo(() => {
    return groupStatusesForDisplay(statusDistribution);
  }, [statusDistribution]);

  // Memoize department distribution for performance
  const departmentDistribution = useMemo(() => {
    return Object.entries(stats.departmentDistribution).sort(
      ([, a], [, b]) => b - a
    );
  }, [stats.departmentDistribution]);

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* Toggle Button */}
        <div className="flex justify-end">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-1.5"
          >
            {expanded ? "Show Less" : "Show More Details"}
            <svg
              className={`h-4 w-4 transition-transform duration-300 ${
                expanded ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {/* Approval Status Card */}

          <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 hover:shadow-xl transition-shadow duration-300 group">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform duration-300" />
                Approval Status
              </CardTitle>
              <CardDescription>Claim approval metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-16 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-2 w-full rounded-full" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold">
                        {stats.pendingApprovals}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Pending Approvals
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
                          className="stroke-blue-500 transition-all duration-500"
                          cx="50"
                          cy="50"
                          r="40"
                          strokeWidth="10"
                          fill="none"
                          strokeDasharray="251.2"
                          strokeDashoffset={
                            stats.totalClaims > 0
                              ? 251.2 -
                                251.2 *
                                  (stats.pendingApprovals / stats.totalClaims)
                              : 251.2
                          }
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                        {stats.totalClaims > 0
                          ? Math.round(
                              (stats.pendingApprovals / stats.totalClaims) * 100
                            )
                          : 0}
                        %
                      </div>
                    </div>
                  </div>

                  {expanded && (
                    <>
                      <div>
                        <p className="text-sm font-medium mb-2">
                          Status Distribution
                        </p>
                        <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                          {groupedStatusDistribution.map(
                            ([status, count], i) => {
                              let bgColor = "bg-slate-500";
                              if (status === "Approved")
                                bgColor = "bg-emerald-500";
                              if (status === "Rejected")
                                bgColor = "bg-rose-500";
                              if (status === "Pending")
                                bgColor = "bg-amber-500";

                              return (
                                <div
                                  key={i}
                                  className={`${bgColor} transition-all duration-300`}
                                  style={{
                                    width: `${
                                      stats.totalClaims > 0
                                        ? (count / stats.totalClaims) * 100
                                        : 0
                                    }%`,
                                  }}
                                />
                              );
                            }
                          )}
                        </div>

                        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                          {groupedStatusDistribution.map(
                            ([status, count], i) => (
                              <div key={i} className="flex items-center gap-1">
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    status === "Approved"
                                      ? "bg-emerald-500"
                                      : status === "Rejected"
                                      ? "bg-rose-500"
                                      : status === "Pending"
                                      ? "bg-amber-500"
                                      : "bg-slate-500"
                                  }`}
                                ></span>
                                <span>
                                  {status}:{" "}
                                  {Math.round(
                                    (count / stats.totalClaims) * 100
                                  )}
                                  %
                                </span>
                              </div>
                            )
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          {statusDistribution
                            .slice(0, 6)
                            .map(([status, count], i) => (
                              <Tooltip key={i}>
                                <TooltipTrigger asChild>
                                  <Badge
                                    variant="outline"
                                    className={`${getStatusBadgeVariant(
                                      status as ClaimStatus
                                    )} hover:bg-opacity-80 transition-colors`}
                                  >
                                    {getReadableStatus(status as ClaimStatus)}:{" "}
                                    {count}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {Math.round(
                                      (count / stats.totalClaims) * 100
                                    )}
                                    % of total claims
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {status.replace(/_/g, " ")}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                        </div>
                      </div>

                      <div className="pt-3">
                        <p className="text-sm font-medium mb-1.5">
                          Approval Time
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Average
                          </span>
                          <span className="font-medium">
                            {formatDuration(stats.averageApprovalTime)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Fastest
                          </span>
                          <span className="font-medium text-emerald-600">
                            {formatDuration(stats.fastestApproval)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0 pb-3">
              <div className="w-full flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Approval Rate</span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="font-medium group-hover:text-blue-600 transition-colors cursor-help">
                      {Math.round(stats.approvalRatio * 100)}%
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Percentage of claims that have been fully approved</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardFooter>
          </Card>

          {/* Department Distribution Card */}
          <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-violet-500" />
                Department Analysis
              </CardTitle>
              <CardDescription>Claims by department</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-20 rounded-lg" />
                    <Skeleton className="h-20 rounded-lg" />
                  </div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {departmentDistribution
                      .slice(0, 3)
                      .map(([department, count], i) => (
                        <div
                          key={i}
                          className="flex flex-col items-center justify-center p-3 rounded-lg bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                          <div
                            className={`h-3 w-3 rounded-full ${
                              i === 0 ? "bg-violet-500" : "bg-amber-500"
                            } mb-1`}
                          ></div>
                          <p className="text-xl font-bold">{count}</p>
                          <p className="text-xs text-muted-foreground text-center">
                            {department}
                          </p>
                        </div>
                      ))}
                  </div>

                  {expanded && (
                    <div>
                      <p className="text-sm font-medium mb-2">
                        Department Distribution
                      </p>
                      {departmentDistribution.map(([department, count], i) => (
                        <div key={i} className="mb-2">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>{department}</span>
                            <span className="font-medium">
                              {formatCurrency(
                                stats.departmentAmounts[department] || 0
                              )}
                            </span>
                          </div>
                          <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                            <div
                              className={
                                i % 2 === 0 ? "bg-violet-500" : "bg-amber-500"
                              }
                              style={{
                                width: `${
                                  stats.totalClaims > 0
                                    ? (count / stats.totalClaims) * 100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                          <div className="flex justify-end mt-1">
                            <span className="text-xs text-muted-foreground">
                              {Math.round((count / stats.totalClaims) * 100)}%
                              of claims
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0 pb-3">
              <div className="w-full flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Top Department</span>
                </div>
                {departmentDistribution.length > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="bg-violet-50 text-violet-700 border-violet-200"
                      >
                        {departmentDistribution[0][0]}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {departmentDistribution[0][1]} claims (
                        {Math.round(
                          (departmentDistribution[0][1] / stats.totalClaims) *
                            100
                        )}
                        %)
                      </p>
                      <p>
                        {formatCurrency(
                          stats.departmentAmounts[
                            departmentDistribution[0][0]
                          ] || 0
                        )}{" "}
                        total value
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </CardFooter>
          </Card>

          {/* Processing Timeline Card */}

          <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 hover:shadow-xl transition-shadow duration-300 group">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500 group-hover:scale-110 transition-transform duration-300" />
                Processing Timeline
              </CardTitle>
              <CardDescription>Claim processing metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-16 w-16 rounded-full" />
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
                        {stats.pendingByAge.lessThan24h +
                          stats.pendingByAge.lessThan48h +
                          stats.pendingByAge.lessThan7d +
                          stats.pendingByAge.moreThan7d}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Pending Claims
                      </p>
                    </div>
                    <div className="h-16 w-16 rounded-full bg-amber-50 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
                      <Hourglass className="h-8 w-8 text-amber-500" />
                    </div>
                  </div>

                  {expanded && (
                    <>
                      <div>
                        <p className="text-sm font-medium mb-2">
                          Claims by Age
                        </p>
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between text-sm group/age">
                            <div className="flex items-center gap-2">
                              <span className="h-3 w-3 rounded-full bg-emerald-500 group-hover/age:scale-125 transition-transform"></span>
                              <span>Less than 24h</span>
                            </div>
                            <Badge
                              variant="outline"
                              className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 transition-colors"
                            >
                              {stats.pendingByAge.lessThan24h}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-sm group/age">
                            <div className="flex items-center gap-2">
                              <span className="h-3 w-3 rounded-full bg-blue-500 group-hover/age:scale-125 transition-transform"></span>
                              <span>24h - 48h</span>
                            </div>
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors"
                            >
                              {stats.pendingByAge.lessThan48h}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-sm group/age">
                            <div className="flex items-center gap-2">
                              <span className="h-3 w-3 rounded-full bg-amber-500 group-hover/age:scale-125 transition-transform"></span>
                              <span>2d - 7d</span>
                            </div>
                            <Badge
                              variant="outline"
                              className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 transition-colors"
                            >
                              {stats.pendingByAge.lessThan7d}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-sm group/age">
                            <div className="flex items-center gap-2">
                              <span className="h-3 w-3 rounded-full bg-rose-500 group-hover/age:scale-125 transition-transform"></span>
                              <span>More than 7d</span>
                            </div>
                            <Badge
                              variant="outline"
                              className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 transition-colors"
                            >
                              {stats.pendingByAge.moreThan7d}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3">
                        <p className="text-sm font-medium mb-1.5">
                          Milestone Progress
                        </p>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-muted-foreground">
                            Average Claimed
                          </span>
                          <span className="font-medium">
                            {Math.round(stats.averagePercentageClaimed)}%
                          </span>
                        </div>
                        <Progress
                          value={stats.averagePercentageClaimed}
                          className={`h-2.5 ${
                            stats.averagePercentageClaimed > 75
                              ? "bg-emerald-500"
                              : stats.averagePercentageClaimed > 50
                              ? "bg-blue-500"
                              : stats.averagePercentageClaimed > 25
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          } transition-all duration-500`}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0 pb-3">
              <div className="w-full flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Last Approved</span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 transition-colors"
                    >
                      {stats.recentActivity.lastApproved
                        ? getTimeAgo(stats.recentActivity.lastApproved)
                        : "N/A"}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    {stats.recentActivity.lastApproved ? (
                      <>
                        <p>Last claim approved on</p>
                        <p className="font-medium">
                          {formatDate(stats.recentActivity.lastApproved)}
                        </p>
                      </>
                    ) : (
                      <p>No claims have been approved yet</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
