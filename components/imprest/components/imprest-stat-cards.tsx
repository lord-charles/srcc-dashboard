"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Imprest, ImprestStatus } from "@/types/imprest"

interface StatusCounts {
  pending_hod: number;
  pending_accountant: number;
  approved: number;
  rejected: number;
  disbursed: number;
  accounted: number;
  overdue: number;
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

const getStatusColor = (status: ImprestStatus) => {
  if (status.includes("pending")) return "bg-amber-500 hover:bg-amber-600"
  if (status === "rejected") return "bg-red-500 hover:bg-red-600"
  if (status === "approved") return "bg-green-500 hover:bg-green-600"
  if (status === "overdue") return "bg-red-500 hover:bg-red-600"
  if (status === "disbursed") return "bg-blue-500 hover:bg-blue-600"
  if (status === "accounted") return "bg-green-500 hover:bg-green-600"
  return "bg-blue-500 hover:bg-blue-600"
}

const getStatusIcon = (status: ImprestStatus) => {
  if (status.includes("pending")) return <Clock className="w-3 h-3 mr-1" />
  if (status === "rejected") return <XCircle className="w-3 h-3 mr-1" />
  if (status === "approved") return <CheckCircle2 className="w-3 h-3 mr-1" />
  if (status === "overdue") return <AlertTriangle className="w-3 h-3 mr-1" />
  if (status === "disbursed") return <DollarSign className="w-3 h-3 mr-1" />
  if (status === "accounted") return <FileCheck className="w-3 h-3 mr-1" />
  return <AlertTriangle className="w-3 h-3 mr-1" />
}

interface ImprestStatCardsProps {
  imprestsData?: Imprest[];
}

interface ImprestStats {
  totalAmount: number;
  statusCounts: StatusCounts;
  mostRecentImprest: Imprest | null;
  pendingCount: number;
  currency: string;
}

export default function ImprestStatCards({ imprestsData }: ImprestStatCardsProps) {
  const memoizedStats = useMemo<ImprestStats>(() => {
    if (!imprestsData || imprestsData.length === 0) {
      return {
        totalAmount: 0,
        statusCounts: {
          pending_hod: 0,
          pending_accountant: 0,
          approved: 0,
          rejected: 0,
          disbursed: 0,
          accounted: 0,
          overdue: 0
        },
        mostRecentImprest: null,
        pendingCount: 0,
        currency: "KES"
      }
    }

    // Calculate aggregate statistics
    const totalAmount = imprestsData.reduce((sum, imprest) => sum + imprest.amount, 0)
    const currency = imprestsData[0].currency // Assuming all imprests use same currency

    // Initialize status counts
    const statusCounts: StatusCounts = {
      pending_hod: 0,
      pending_accountant: 0,
      approved: 0,
      rejected: 0,
      disbursed: 0,
      accounted: 0,
      overdue: 0
    }

    // Count imprests by status
    imprestsData.forEach((imprest) => {
      statusCounts[imprest.status] = (statusCounts[imprest.status] || 0) + 1
    })

    // Get most recent imprest
    const mostRecentImprest = [...imprestsData].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0]

    // Count pending imprests
    const pendingCount = statusCounts.pending_hod + statusCounts.pending_accountant

 
    return {
      totalAmount,
      statusCounts,
      mostRecentImprest,
      pendingCount,
      currency,
    }
  }, [imprestsData])

  if (!imprestsData || imprestsData.length === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Imprest Data</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              No imprest requests available
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { statusCounts, totalAmount, pendingCount, currency } = memoizedStats

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Amount */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totalAmount, currency)}
          </div>
          <p className="text-xs text-muted-foreground">
            Across {imprestsData.length} requests
          </p>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingCount}</div>
          <p className="text-xs text-muted-foreground">
            Awaiting approval
          </p>
          <Progress 
            value={(pendingCount / imprestsData.length) * 100} 
            className="mt-2"
          />
        </CardContent>
      </Card>

      {/* Approved Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Approved Requests</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statusCounts.approved || 0}</div>
          <p className="text-xs text-muted-foreground">
            Successfully processed
          </p>
          <Progress 
            value={(statusCounts.approved / imprestsData.length) * 100} 
            className="mt-2"
          />
        </CardContent>
      </Card>

      {/* Rejected Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rejected Requests</CardTitle>
          <XCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statusCounts.rejected || 0}</div>
          <p className="text-xs text-muted-foreground">
            Not approved
          </p>
          <Progress 
            value={(statusCounts.rejected / imprestsData.length) * 100} 
            className="mt-2"
          />
        </CardContent>
      </Card>
    </div>
  )
}
