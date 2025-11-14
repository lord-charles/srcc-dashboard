"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  DollarSign,
  FileCheck,
  FileText,
  Filter,
  Landmark,
  Layers,
  ReceiptText,
  Shield,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  calculateDaysRemaining,
  formatCurrency,
  formatDate,
  formatPercentage,
  getReadableStatus,
  getStatusBadgeVariant,
  getStatusColor,
} from "@/lib/utils"
import { ScrollArea } from "../ui/scroll-area"

type ImprestStatus = "accounted" | "pending_accountant" | "pending_hod" | "rejected" | "disbursed"

interface Imprest {
  _id: string
  employeeName: string
  department: string
  requestDate: string
  dueDate: string
  paymentReason: string
  currency: string
  amount: number
  paymentType: string
  explanation: string
  status: ImprestStatus
  requestedBy: {
    _id: string
    firstName: string
    lastName: string
    email: string
    department: string
  }
  attachments: Array<{
    fileName: string
    fileUrl: string
    uploadedAt: string
    _id: string
  }>
  hodApproval?: {
    approvedBy: {
      _id: string
      firstName: string
      lastName: string
      email: string
    }
    approvedAt: string
    comments: string
  }
  accountantApproval?: {
    approvedBy: {
      _id: string
      firstName: string
      lastName: string
      email: string
    }
    approvedAt: string
    comments: string
  }
  disbursement?: {
    disbursedBy: {
      _id: string
      firstName: string
      lastName: string
      email: string
    }
    disbursedAt: string
    amount: number
    comments: string
  }
  accounting?: {
    verifiedBy: {
      _id: string
      firstName: string
      lastName: string
      email: string
    }
    verifiedAt: string
    receipts: Array<{
      description: string
      amount: number
      receiptUrl: string
      uploadedAt: string
      _id: string
    }>
    totalAmount: number
    balance: number
    comments: string
  }
  rejection?: {
    rejectedBy: string
    rejectedAt: string
    reason: string
  }
  createdAt: string
  updatedAt: string
}

interface ImprestStats {
  totalImprests: number
  totalAmount: number
  totalAccountedAmount: number
  totalPendingAmount: number
  averageProcessingTime: number
  statusCounts: Record<ImprestStatus, number>
  departmentCounts: Record<string, number>
  departmentAmounts: Record<string, number>
  currencyCounts: Record<string, number>
  paymentTypeCounts: Record<string, number>
  overdueCounts: number
  dueSoonCounts: number
  recentActivity: {
    type: string
    date: string
    details: string
  }[]
}

export function ImprestStats({ imprests }: { imprests: any }) {

  const stats = useMemo(() => {
    if (!imprests || !imprests.length) {
      return {
        totalImprests: 0,
        totalAmount: 0,
        totalAccountedAmount: 0,
        totalPendingAmount: 0,
        averageProcessingTime: 0,
        statusCounts: {
          accounted: 0,
          pending_accountant: 0,
          pending_hod: 0,
          rejected: 0,
          disbursed: 0,
        } as Record<ImprestStatus, number>,
        departmentCounts: {} as Record<string, number>,
        departmentAmounts: {} as Record<string, number>,
        currencyCounts: {} as Record<string, number>,
        paymentTypeCounts: {} as Record<string, number>,
        overdueCounts: 0,
        dueSoonCounts: 0,
        recentActivity: [],
      } as ImprestStats
    }

    const statusCounts: Record<ImprestStatus, number> = {
      accounted: 0,
      pending_accountant: 0,
      pending_hod: 0,
      rejected: 0,
      disbursed: 0,
    }

    const departmentCounts: Record<string, number> = {}
    const departmentAmounts: Record<string, number> = {}
    const currencyCounts: Record<string, number> = {}
    const paymentTypeCounts: Record<string, number> = {}

    let totalAmount = 0
    let totalAccountedAmount = 0
    let totalPendingAmount = 0
    let overdueCounts = 0
    let dueSoonCounts = 0

    // Processing times in hours
    const processingTimes: number[] = []

    // Recent activity
    const recentActivity: {
      type: string
      date: string
      details: string
    }[] = []

    try {
      imprests.forEach((imprest: Imprest) => {
        if (!imprest) return

        // Status counts - handle null/undefined status
        const status = imprest.status || "pending_hod"
        statusCounts[status as ImprestStatus] = (statusCounts[status as ImprestStatus] || 0) + 1

        // Department counts - handle null/undefined department
        const department = imprest.department || "unknown"
        departmentCounts[department] = (departmentCounts[department] || 0) + 1

        // Department amounts - handle null/undefined department or amount
        const amount = imprest.amount || 0
        departmentAmounts[department] = (departmentAmounts[department] || 0) + amount

        // Currency counts - handle null/undefined currency
        const currency = imprest.currency || "USD"
        currencyCounts[currency] = (currencyCounts[currency] || 0) + 1

        // Payment type counts - handle null/undefined payment type
        const paymentType = imprest.paymentType || "Unknown"
        paymentTypeCounts[paymentType] = (paymentTypeCounts[paymentType] || 0) + 1

        // Total amount - handle null/undefined amount
        totalAmount += amount

        // Accounted vs pending amounts - handle null/undefined status or amount
        if (status === "accounted") {
          totalAccountedAmount += amount
        } else if (status.includes("pending")) {
          totalPendingAmount += amount
        }

        // Overdue and due soon counts - handle null/undefined dueDate or status
        if (imprest.dueDate) {
          const daysRemaining = calculateDaysRemaining(imprest.dueDate)
          if (daysRemaining < 0 && status !== "accounted" && status !== "rejected") {
            overdueCounts++
          } else if (daysRemaining <= 2 && daysRemaining >= 0 && status !== "accounted" && status !== "rejected") {
            dueSoonCounts++
          }
        }

        // Processing time calculation - handle null/undefined dates or missing properties
        if (
          status === "accounted" &&
          imprest.hodApproval &&
          imprest.accounting &&
          imprest.createdAt &&
          imprest.accounting.verifiedAt
        ) {
          try {
            const requestDate = new Date(imprest.createdAt)
            const accountedDate = new Date(imprest.accounting.verifiedAt)
            const processingTime = (accountedDate.getTime() - requestDate.getTime()) / (1000 * 60 * 60) // hours
            if (!isNaN(processingTime) && processingTime >= 0) {
              processingTimes.push(processingTime)
            }
          } catch (e) {
            // Skip this processing time calculation if dates are invalid
          }
        }

        // Recent activity - handle null/undefined properties
        if (imprest.accounting && imprest.accounting.verifiedAt) {
          recentActivity.push({
            type: "accounting",
            date: imprest.accounting.verifiedAt,
            details: `${imprest.employeeName || "Employee"} accounted for ${formatCurrency(amount, currency)}`,
          })
        }

        if (imprest.disbursement && imprest.disbursement.disbursedAt) {
          recentActivity.push({
            type: "disbursement",
            date: imprest.disbursement.disbursedAt,
            details: `${formatCurrency(amount, currency)} disbursed to ${imprest.employeeName || "Employee"}`,
          })
        }

        if (imprest.accountantApproval && imprest.accountantApproval.approvedAt) {
          recentActivity.push({
            type: "approval",
            date: imprest.accountantApproval.approvedAt,
            details: `Accountant approved ${imprest.employeeName || "Employee"}'s imprest`,
          })
        }

        if (imprest.hodApproval && imprest.hodApproval.approvedAt) {
          recentActivity.push({
            type: "approval",
            date: imprest.hodApproval.approvedAt,
            details: `HOD approved ${imprest.employeeName || "Employee"}'s imprest`,
          })
        }

        if (imprest.rejection && imprest.rejection.rejectedAt) {
          recentActivity.push({
            type: "rejection",
            date: imprest.rejection.rejectedAt,
            details: `${imprest.employeeName || "Employee"}'s imprest was rejected: ${
              imprest.rejection.reason || "No reason provided"
            }`,
          })
        }
      })

      // Sort recent activity by date (newest first)
      recentActivity.sort((a, b) => {
        try {
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        } catch (e) {
          return 0
        }
      })

      // Calculate average processing time
      const averageProcessingTime = processingTimes.length
        ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
        : 0

      return {
        totalImprests: imprests.length,
        totalAmount,
        totalAccountedAmount,
        totalPendingAmount,
        averageProcessingTime,
        statusCounts,
        departmentCounts,
        departmentAmounts,
        currencyCounts,
        paymentTypeCounts,
        overdueCounts,
        dueSoonCounts,
        recentActivity: recentActivity.slice(0, 5), // Only keep the 5 most recent activities
      } as ImprestStats
    } catch (error) {
      console.error("Error calculating stats:", error)
      return {
        totalImprests: imprests.length,
        totalAmount,
        totalAccountedAmount,
        totalPendingAmount,
        averageProcessingTime: 0,
        statusCounts,
        departmentCounts,
        departmentAmounts,
        currencyCounts,
        paymentTypeCounts,
        overdueCounts,
        dueSoonCounts,
        recentActivity: [],
      } as ImprestStats
    }
  }, [imprests])

  const statusDistribution = useMemo(() => {
    try {
      return Object.entries(stats.statusCounts || {}).filter(([_, count]) => count > 0)
    } catch (e) {
      return []
    }
  }, [stats.statusCounts])

  const departmentDistribution = useMemo(() => {
    try {
      return Object.entries(stats.departmentCounts || {})
        .sort((a, b) => b[1] - a[1])
        .filter(([_, count]) => count > 0)
    } catch (e) {
      return []
    }
  }, [stats.departmentCounts])

  const departmentAmountDistribution = useMemo(() => {
    try {
      return Object.entries(stats.departmentAmounts || {})
        .sort((a, b) => b[1] - a[1])
        .filter(([_, amount]) => amount > 0)
    } catch (e) {
      return []
    }
  }, [stats.departmentAmounts])

  const currencyDistribution = useMemo(() => {
    try {
      return Object.entries(stats.currencyCounts || {})
        .sort((a, b) => b[1] - a[1])
        .filter(([_, count]) => count > 0)
    } catch (e) {
      return []
    }
  }, [stats.currencyCounts])

  const paymentTypeDistribution = useMemo(() => {
    try {
      return Object.entries(stats.paymentTypeCounts || {})
        .sort((a, b) => b[1] - a[1])
        .filter(([_, count]) => count > 0)
    } catch (e) {
      return []
    }
  }, [stats.paymentTypeCounts])

  const defaultCurrency = useMemo(() => {
    try {
      return currencyDistribution.length > 0 ? currencyDistribution[0][0] : "USD"
    } catch (e) {
      return "USD"
    }
  }, [currencyDistribution])


  if (!imprests || imprests.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <FileText className="h-6 w-6 text-slate-500 dark:text-slate-400" />
        </div>
        <h3 className="mb-1 text-lg font-medium">No Imprest Data Available</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          There are no imprest records to display at this time.
        </p>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Financial Overview Card */}
        <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-2 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50">
            <CardTitle className="flex items-center text-lg font-semibold">
              <DollarSign className="mr-2 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Financial Overview
            </CardTitle>
            <CardDescription>Imprest funds allocation and usage</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Amount</span>
                  <span className="text-2xl font-bold">
                    {stats.totalAmount > 0
                      ? formatCurrency(stats.totalAmount, defaultCurrency)
                      : formatCurrency(0, defaultCurrency)}
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Across {stats.totalImprests} imprest {stats.totalImprests === 1 ? "request" : "requests"}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Accounted vs Pending</p>
                <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="bg-emerald-500 transition-all duration-300"
                    style={{
                      width: `${stats.totalAmount > 0 ? (stats.totalAccountedAmount / stats.totalAmount) * 100 : 0}%`,
                    }}
                  />
                  <div
                    className="bg-amber-500 transition-all duration-300"
                    style={{
                      width: `${stats.totalAmount > 0 ? (stats.totalPendingAmount / stats.totalAmount) * 100 : 0}%`,
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
                        Accounted: {formatCurrency(stats.totalAccountedAmount, defaultCurrency)}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {formatPercentage(
                          stats.totalAmount > 0 ? (stats.totalAccountedAmount / stats.totalAmount) * 100 : 0,
                        )}{" "}
                        of total amount
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                      >
                        Pending: {formatCurrency(stats.totalPendingAmount, defaultCurrency)}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {formatPercentage(
                          stats.totalAmount > 0 ? (stats.totalPendingAmount / stats.totalAmount) * 100 : 0,
                        )}{" "}
                        of total amount
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

            </div>
          </CardContent>
          <CardFooter className="border-t bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                <Clock className="mr-1 h-3 w-3" />
                Last updated: {formatDate(new Date().toISOString())}
              </div>
              <div className="flex items-center text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors">
                <ArrowUpRight className="mr-1 h-3 w-3" />
                View details
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Status Card */}
        <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
            <CardTitle className="flex items-center text-lg font-semibold">
              <Activity className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
              Approval Status
            </CardTitle>
            <CardDescription>Imprest approval workflow metrics</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Approval Rate</div>
                  <div className="text-2xl font-bold">
                    {stats.statusCounts.accounted || 0}/{stats.totalImprests || 0}
                    <span className="ml-1 text-sm font-normal text-slate-500 dark:text-slate-400">
                      (
                      {formatPercentage(
                        stats.totalImprests > 0 ? ((stats.statusCounts.accounted || 0) / stats.totalImprests) * 100 : 0,
                      )}
                      )
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg. Processing</div>
                  <div className="text-2xl font-bold">
                    {Math.round(stats.averageProcessingTime || 0)}
                    <span className="ml-1 text-sm font-normal text-slate-500 dark:text-slate-400">hours</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Status Distribution</p>
                <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  {statusDistribution.length > 0 ? (
                    statusDistribution.map(([status, count], i) => (
                      <div
                        key={i}
                        className={`${getStatusColor(status as ImprestStatus)} transition-all duration-300`}
                        style={{
                          width: `${stats.totalImprests > 0 ? (count / stats.totalImprests) * 100 : 0}%`,
                        }}
                      />
                    ))
                  ) : (
                    <div className="bg-slate-300 dark:bg-slate-600 w-full" />
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {statusDistribution.length > 0 ? (
                    statusDistribution.map(([status, count], i) => (
                      <Tooltip key={i}>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className={`${getStatusBadgeVariant(status as ImprestStatus)}`}>
                            {getReadableStatus(status as string)}: {count}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{Math.round((count / stats.totalImprests) * 100)}% of total imprests</p>
                        </TooltipContent>
                      </Tooltip>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">No status data available</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="flex items-center">
                    <AlertTriangle className="mr-1 h-3 w-3 text-amber-500" />
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Due Soon</div>
                  </div>
                  <div className="mt-1 text-lg font-semibold">{stats.dueSoonCounts || 0}</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="flex items-center">
                    <AlertTriangle className="mr-1 h-3 w-3 text-rose-500" />
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Overdue</div>
                  </div>
                  <div className="mt-1 text-lg font-semibold">{stats.overdueCounts || 0}</div>
                </div>
              </div>
            </div>
          </CardContent>
     
        </Card>

        {/* Department Card */}
        <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-2 bg-gradient-to-r from-violet-50 to-violet-100 dark:from-violet-950/50 dark:to-violet-900/50">
            <CardTitle className="flex items-center text-lg font-semibold">
              <Users className="mr-2 h-5 w-5 text-violet-600 dark:text-violet-400" />
              Department Analysis
            </CardTitle>
            <CardDescription>Imprest distribution by department</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Top Department</div>
                  <div className="text-xl font-bold capitalize">
                    {departmentDistribution.length > 0 ? departmentDistribution[0][0] : "None"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Amount</div>
                  <div className="text-xl font-bold">
                    {departmentAmountDistribution.length > 0
                      ? formatCurrency(departmentAmountDistribution[0][1], defaultCurrency)
                      : formatCurrency(0, defaultCurrency)}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Department Distribution</p>
                {departmentDistribution.length > 0 ? (
                  departmentDistribution.map(([dept, count], i) => (
                    <div key={i} className="mb-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="capitalize">{dept}</span>
                        <span>
                          {count} ({formatPercentage(stats.totalImprests > 0 ? (count / stats.totalImprests) * 100 : 0)}
                          )
                        </span>
                      </div>
                      <Progress
                        value={stats.totalImprests > 0 ? (count / stats.totalImprests) * 100 : 0}
                        className="h-1.5"
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-2 text-sm text-slate-500 dark:text-slate-400">
                    No department data available
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Department Breakdown</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {departmentDistribution.length > 0 ? (
                    departmentDistribution.map(([dept, count], i) => (
                      <Tooltip key={i}>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="capitalize">
                            {dept.length > 10 ? `${dept.substring(0, 10)}...` : dept}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {dept}: {count} imprests (
                            {formatPercentage(stats.totalImprests > 0 ? (count / stats.totalImprests) * 100 : 0)})
                          </p>
                          <p>{formatCurrency(stats.departmentAmounts[dept] || 0, defaultCurrency)}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">No department data</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
       
        </Card>

        {/* Activity Card */}
        <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-2 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/50">
            <CardTitle className="flex items-center text-lg font-semibold">
              <FileCheck className="mr-2 h-5 w-5 text-amber-600 dark:text-amber-400" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest imprest transactions and approvals</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Approvals</div>
                  <div className="text-2xl font-bold">
                    {(stats.statusCounts.pending_accountant || 0) + (stats.statusCounts.pending_hod || 0) || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Needs Attention</div>
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {(stats.overdueCounts || 0) + (stats.dueSoonCounts || 0)}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Recent Activity</p>
                <ScrollArea className="h-[150px]">
                <div className="space-y-2">
                  {stats.recentActivity && stats.recentActivity.length > 0 ? (
                    stats.recentActivity.map((activity, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          {activity.type === "accounting" && (
                            <ReceiptText className="h-4 w-4 text-emerald-500 mt-0.5" />
                          )}
                          {activity.type === "disbursement" && <Landmark className="h-4 w-4 text-blue-500 mt-0.5" />}
                          {activity.type === "approval" && <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5" />}
                          {activity.type === "rejection" && <AlertTriangle className="h-4 w-4 text-rose-500 mt-0.5" />}
                          <div className="flex-1">
                            <p className="text-xs">{activity.details || "Activity details unavailable"}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {activity.date ? formatDate(activity.date) : "Date unavailable"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                      <Shield className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">No recent activity</p>
                    </div>
                  )}
                </div>
                </ScrollArea>
              </div>
            </div>
          </CardContent>
       
        </Card>
      </div>
    </TooltipProvider>
  )
}
