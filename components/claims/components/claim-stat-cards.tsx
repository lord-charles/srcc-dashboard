"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  DollarSign,
  FileCheck,
  FileX,
  PieChart,
  AlertTriangle,
  XCircle,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Claim, ClaimStatus } from "@/types/claim"

interface StatusCounts {
  draft: number;
  pending_checker_approval: number;
  pending_manager_approval: number;
  pending_finance_approval: number;
  approved: number;
  rejected: number;
  [key: string]: number;
}

// Helper functions
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount)
}

const formatStatus = (status: string) => {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const getStatusColor = (status: string) => {
  if (status.includes("pending")) return "bg-amber-500 hover:bg-amber-600"
  if (status === "rejected") return "bg-red-500 hover:bg-red-600"
  if (status === "approved") return "bg-green-500 hover:bg-green-600"
  return "bg-blue-500 hover:bg-blue-600"
}

const getStatusIcon = (status: string) => {
  if (status.includes("pending")) return <Clock className="w-3 h-3 mr-1" />
  if (status === "rejected") return <XCircle className="w-3 h-3 mr-1" />
  if (status === "approved") return <CheckCircle2 className="w-3 h-3 mr-1" />
  return <AlertTriangle className="w-3 h-3 mr-1" />
}

interface ClaimStatCardsProps {
  claimsData?: Claim[];
}

interface ClaimStats {
  totalClaimAmount: number;
  totalContractValue: number;
  contractUtilizationPercentage: number;
  statusCounts: StatusCounts;
  uniqueContracts: number;
  mostRecentClaim: Claim | null;
  pendingClaimsCount: number;
  projectBreakdown: Record<string, { name: string; amount: number }>;
}

export default function ClaimStatCards({ claimsData }: ClaimStatCardsProps) {
  const memoizedStats = useMemo<ClaimStats>(() => {
    if (!claimsData || claimsData.length === 0) {
      return {
        totalClaimAmount: 0,
        totalContractValue: 0,
        contractUtilizationPercentage: 0,
        statusCounts: {
          draft: 0,
          pending_checker_approval: 0,
          pending_manager_approval: 0,
          pending_finance_approval: 0,
          approved: 0,
          rejected: 0,
        },
        uniqueContracts: 0,
        mostRecentClaim: null,
        pendingClaimsCount: 0,
        projectBreakdown: {},
      }
    }

    // Calculate aggregate statistics
    const totalClaimAmount = claimsData.reduce((sum, claim) => sum + (claim.amount || 0), 0)
    const totalContractValue = claimsData.reduce((sum, claim) => sum + (claim.contractId?.contractValue || 0), 0)
    const contractUtilizationPercentage = totalContractValue > 0 ? (totalClaimAmount / totalContractValue) * 100 : 0

    // Initialize status counts with default values
    const statusCounts: StatusCounts = {
      draft: 0,
      pending_checker_approval: 0,
      pending_manager_approval: 0,
      pending_finance_approval: 0,
      approved: 0,
      rejected: 0,
    }

    // Count claims by status
    claimsData.forEach((claim) => {
      const status = claim.status || "unknown"
      statusCounts[status] = (statusCounts[status] || 0) + 1
    })

    // Get unique contracts
    const uniqueContracts = new Set(claimsData.map((claim) => claim.contractId?._id).filter(Boolean))

    // Get most recent claim
    const mostRecentClaim = [...claimsData].sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
    )[0]

    // Count pending claims
    const pendingClaimsCount = Object.entries(statusCounts)
      .filter(([status]) => status.includes("pending"))
      .reduce((sum, [_, count]) => sum + count, 0)

    // Group by project and sum amounts
    const projectBreakdown = claimsData.reduce(
      (acc, claim) => {
        const projectId = claim.projectId?._id
        if (projectId) {
          if (!acc[projectId]) {
            acc[projectId] = {
              name: claim.projectId?.name || "Unknown Project",
              amount: 0,
            }
          }
          acc[projectId].amount += claim.amount || 0
        }
        return acc
      },
      {} as Record<string, { name: string; amount: number }>,
    )

    return {
      totalClaimAmount,
      totalContractValue,
      contractUtilizationPercentage,
      statusCounts,
      uniqueContracts: uniqueContracts.size,
      mostRecentClaim,
      pendingClaimsCount,
      projectBreakdown,
    }
  }, [claimsData])

  if (!claimsData || claimsData.length === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Claims Data</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              No claims available
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { statusCounts, totalClaimAmount, pendingClaimsCount } = memoizedStats

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Claims Amount */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totalClaimAmount, "KES")}
          </div>
          <p className="text-xs text-muted-foreground">
            Across {claimsData.length} claims
          </p>
        </CardContent>
      </Card>

      {/* Pending Claims */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingClaimsCount}</div>
          <p className="text-xs text-muted-foreground">
            Awaiting approval
          </p>
          <Progress 
            value={(pendingClaimsCount / claimsData.length) * 100} 
            className="mt-2"
          />
        </CardContent>
      </Card>

      {/* Approved Claims */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Approved Claims</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statusCounts.approved || 0}</div>
          <p className="text-xs text-muted-foreground">
            Successfully processed
          </p>
          <Progress 
            value={(statusCounts.approved / claimsData.length) * 100} 
            className="mt-2"
          />
        </CardContent>
      </Card>

      {/* Rejected Claims */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rejected Claims</CardTitle>
          <XCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statusCounts.rejected || 0}</div>
          <p className="text-xs text-muted-foreground">
            Not approved
          </p>
          <Progress 
            value={(statusCounts.rejected / claimsData.length) * 100} 
            className="mt-2"
          />
        </CardContent>
      </Card>
    </div>
  )
}
