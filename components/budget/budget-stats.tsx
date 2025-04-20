"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Cell, ResponsiveContainer, PieChart, Pie, Sector } from "recharts"
import {
  ClockIcon,
  AlertCircleIcon,
  DollarSignIcon,
  CalendarIcon,
  BarChart3Icon,
  PieChartIcon,
  CheckCircleIcon,
  CloudyIcon as PendingIcon,
  FileIcon,
} from "lucide-react"
import { formatCurrency, formatDate, formatPercentage } from "@/lib/utils"

// Types
type BudgetStatus = any
type BudgetCategory = {
  name: string
  description: string
  items: BudgetItem[]
  tags: string[]
}
type BudgetItem = {
  name: string
  description: string
  estimatedAmount: number
  actualAmount: number
  tags: string[]
  frequency: string
  startDate: string
  endDate: string
}
type Budget = {
  _id: string
  projectId: {
    _id: string
    name: string
    description: string
    status: string
  }
  internalCategories: BudgetCategory[]
  externalCategories: BudgetCategory[]
  currency: string
  totalInternalBudget: number
  totalExternalBudget: number
  totalInternalSpent: number
  totalExternalSpent: number
  version: number
  status: BudgetStatus
  createdBy: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  updatedBy: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  notes: string
  auditTrail: any[]
  createdAt: string
  updatedAt: string
  approvedAt?: string
  approvedBy?: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  approvalFlow?: {
    checkerApprovals?: any[]
    managerApprovals?: any[]
    financeApprovals?: any[]
  }
}


// Helper functions
const getStatusColor = (status: BudgetStatus): string => {
  switch (status) {
    case "approved":
      return "bg-emerald-500"
    case "draft":
      return "bg-slate-400"
    case "revision_requested":
      return "bg-amber-500"
    default:
      return status.includes("pending") ? "bg-sky-500" : "bg-slate-400"
  }
}

const getStatusBadgeVariant = (status: BudgetStatus): string => {
  switch (status) {
    case "approved":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
    case "draft":
      return "bg-slate-100 text-slate-800 dark:bg-slate-800/30 dark:text-slate-300 border-slate-200 dark:border-slate-700"
    case "revision_requested":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800"
    default:
      return status.includes("pending")
        ? "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300 border-sky-200 dark:border-sky-800"
        : "bg-slate-100 text-slate-800 dark:bg-slate-800/30 dark:text-slate-300 border-slate-200 dark:border-slate-700"
  }
}

const getStatusIcon = (status: BudgetStatus) => {
  switch (status) {
    case "approved":
      return <CheckCircleIcon className="h-3 w-3 text-emerald-500 mr-1" />
    case "draft":
      return <FileIcon className="h-3 w-3 text-slate-500 mr-1" />
    case "revision_requested":
      return <AlertCircleIcon className="h-3 w-3 text-amber-500 mr-1" />
    default:
      return status.includes("pending") ? (
        <PendingIcon className="h-3 w-3 text-sky-500 mr-1" />
      ) : (
        <FileIcon className="h-3 w-3 text-slate-500 mr-1" />
      )
  }
}

const getReadableStatus = (status: BudgetStatus): string => {
  switch (status) {
    case "draft":
      return "Draft"
    case "pending_checker_approval":
      return "Pending Checker"
    case "pending_manager_approval":
      return "Pending Manager"
    case "pending_finance_approval":
      return "Pending Finance"
    case "approved":
      return "Approved"
    case "revision_requested":
      return "Revision Requested"
    default:
      return status.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())
  }
}

const getApprovalTime = (budget: Budget): number | null => {
  if (!budget.approvedAt || !budget.createdAt) return null

  const created = new Date(budget.createdAt).getTime()
  const approved = new Date(budget.approvedAt).getTime()

  return (approved - created) / (1000 * 60 * 60) // hours
}

const getCategoryTotals = (budgets: Budget[]) => {
  const categoryMap = new Map<string, number>()

  budgets.forEach((budget) => {
    budget.internalCategories.forEach((category) => {
      const current = categoryMap.get(category.description) || 0
      const categoryTotal = category.items.reduce((sum, item) => sum + (item.estimatedAmount || 0), 0)
      categoryMap.set(category.description, current + categoryTotal)
    })

    budget.externalCategories.forEach((category) => {
      const current = categoryMap.get(category.description) || 0
      const categoryTotal = category.items.reduce((sum, item) => sum + (item.estimatedAmount || 0), 0)
      categoryMap.set(category.description, current + categoryTotal)
    })
  })

  // Convert to array and sort by value
  const sortedCategories = Array.from(categoryMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // If we have more than 5 categories, group the smaller ones as "Others"
  if (sortedCategories.length > 5) {
    const topCategories = sortedCategories.slice(0, 4)
    const otherCategories = sortedCategories.slice(4)

    const othersTotal = otherCategories.reduce((sum, category) => sum + category.value, 0)

    return [...topCategories, { name: `Others (${otherCategories.length})`, value: othersTotal }]
  }

  return sortedCategories
}

const getFrequencyDistribution = (budgets: Budget[]) => {
  const frequencyMap = new Map<string, number>()

  budgets.forEach((budget) => {
    const allCategories = [...budget.internalCategories, ...budget.externalCategories]

    allCategories.forEach((category) => {
      category.items.forEach((item) => {
        const frequency = item.frequency || "unknown"
        const current = frequencyMap.get(frequency) || 0
        frequencyMap.set(frequency, current + (item.estimatedAmount || 0))
      })
    })
  })

  return Array.from(frequencyMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

// Enhanced color palette with better contrast
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d", "#ffc658", "#8dd1e1"]

export function BudgetStats({budgetData}: {budgetData: any}) {
  const [loading, setLoading] = useState(true)
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setBudgets(budgetData)
      } catch (error) {
        console.error("Error fetching budget data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const stats = useMemo(() => {
    if (!budgets.length) {
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
      }
    }

    const totalBudgets = budgets.length
    const totalAmount = budgets.reduce(
      (sum, budget) => sum + (budget.totalInternalBudget || 0) + (budget.totalExternalBudget || 0),
      0,
    )
    const totalSpent = budgets.reduce(
      (sum, budget) => sum + (budget.totalInternalSpent || 0) + (budget.totalExternalSpent || 0),
      0,
    )
    const approvedBudgets = budgets.filter((b) => b.status === "approved").length
    const pendingBudgets = budgets.filter((b) => b.status.includes("pending")).length
    const draftBudgets = budgets.filter((b) => b.status === "draft").length
    const revisionRequestedBudgets = budgets.filter((b) => b.status === "revision_requested").length

    const approvalTimes = budgets.map(getApprovalTime).filter((time): time is number => time !== null)

    const averageApprovalTime = approvalTimes.length
      ? approvalTimes.reduce((sum, time) => sum + time, 0) / approvalTimes.length
      : 0

    return {
      totalBudgets,
      totalAmount,
      totalSpent,
      averageBudgetAmount: totalBudgets ? totalAmount / totalBudgets : 0,
      approvedBudgets,
      pendingBudgets,
      draftBudgets,
      revisionRequestedBudgets,
      averageApprovalTime,
      currency: budgets[0]?.currency || "KES",
      spendingRate: totalAmount > 0 ? (totalSpent / totalAmount) * 100 : 0,
    }
  }, [budgets])

  const statusDistribution = useMemo(() => {
    const statusMap = new Map<BudgetStatus, number>()

    budgets.forEach((budget) => {
      const status = budget.status
      const current = statusMap.get(status) || 0
      statusMap.set(status, current + 1)
    })

    return Array.from(statusMap.entries()).sort((a, b) => b[1] - a[1])
  }, [budgets])

  const categoryData = useMemo(() => getCategoryTotals(budgets), [budgets])
  const frequencyData = useMemo(() => getFrequencyDistribution(budgets), [budgets])

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props

    return (
      <g>
        <text x={cx} y={cy} dy={-20} textAnchor="middle" fill="#888">
          {payload.name}
        </text>
        <text x={cx} y={cy} textAnchor="middle" fill="#333" className="text-lg font-semibold">
          {formatCurrency(value, stats.currency)}
        </text>
        <text x={cx} y={cy} dy={20} textAnchor="middle" fill="#999">
          {`${(percent * 100).toFixed(1)}%`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 5}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    )
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {/* Financial Overview Card */}
        <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900/80">
            <CardTitle className="flex items-center text-lg font-semibold">
              <DollarSignIcon className="mr-2 h-5 w-5 text-emerald-500" />
              Financial Overview
            </CardTitle>
            <CardDescription>Budget allocation and spending</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(stats.totalAmount, stats.currency)}
                </h3>
                <span className="text-sm text-muted-foreground">Total Budget</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Spent</span>
                  <span className="font-medium">
                    {formatCurrency(stats.totalSpent, stats.currency)} ({formatPercentage(stats.spendingRate)})
                  </span>
                </div>
                <Progress value={stats.spendingRate} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Total Budgets</p>
                  <p className="text-lg font-semibold">{stats.totalBudgets}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Avg. Amount</p>
                  <p className="text-lg font-semibold">{formatCurrency(stats.averageBudgetAmount, stats.currency)}</p>
                </div>
              </div>

              <div className="pt-2 text-xs text-muted-foreground border-t">
                <div className="flex items-center">
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  Last updated: {budgets.length ? formatDate(budgets[0].updatedAt) : "N/A"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution Card */}
        <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900/80">
            <CardTitle className="flex items-center text-lg font-semibold">
              <BarChart3Icon className="mr-2 h-5 w-5 text-sky-500" />
              Approval Status
            </CardTitle>
            <CardDescription>Budget approval workflow</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                    {stats.approvedBudgets}
                    <span className="text-sm font-normal text-muted-foreground ml-1">/ {stats.totalBudgets}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">Approved Budgets</p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-semibold">
                    {stats.averageApprovalTime.toFixed(1)}
                    <span className="text-sm font-normal ml-1">hrs</span>
                  </p>
                  <p className="text-sm text-muted-foreground">Avg. Approval Time</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Status Distribution</p>
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  {statusDistribution.map(([status, count], i) => (
                    <div
                      key={i}
                      className={`${getStatusColor(status)}`}
                      style={{
                        width: `${stats.totalBudgets > 0 ? (count / stats.totalBudgets) * 100 : 0}%`,
                      }}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {statusDistribution.map(([status, count], i) => (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className={`${getStatusBadgeVariant(status)}`}>
                          <span className="flex items-center">
                            {getStatusIcon(status)}
                            {getReadableStatus(status)}: {count}
                          </span>
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{Math.round((count / stats.totalBudgets) * 100)}% of total budgets</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-lg font-semibold">{stats.pendingBudgets}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Drafts</p>
                  <p className="text-lg font-semibold">{stats.draftBudgets}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution Card */}
        <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900/80">
            <CardTitle className="flex items-center text-lg font-semibold">
              <PieChartIcon className="mr-2 h-5 w-5 text-violet-500" />
              Budget Categories
            </CardTitle>
            <CardDescription>Distribution by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[180px] w-full">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No category data available</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Top Categories</p>
              <ScrollArea className="h-[80px] rounded-md border p-2">
                <div className="space-y-1">
                  {categoryData.map((category, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div
                          className="h-3 w-3 rounded-full mr-2"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="truncate max-w-[180px]" title={category.name}>
                          {category.name}
                        </span>
                      </div>
                      <span className="font-medium">{formatCurrency(category.value, stats.currency)}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        {/* Budget Timeline Card */}
        <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900/80">
            <CardTitle className="flex items-center text-lg font-semibold">
              <ClockIcon className="mr-2 h-5 w-5 text-amber-500" />
              Budget Timeline
            </CardTitle>
            <CardDescription>Frequency and duration analysis</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 capitalize">
                  {frequencyData.length > 0 ? frequencyData[0].name : "N/A"}
                </h3>
                <span className="text-sm text-muted-foreground">Top Frequency</span>
              </div>

              <div className="space-y-2">
                {frequencyData.slice(0, 3).map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{item.name}</span>
                      <span className="font-medium">{formatCurrency(item.value, stats.currency)}</span>
                    </div>
                    <Progress
                      value={frequencyData[0].value > 0 ? (item.value / frequencyData[0].value) * 100 : 0}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Newest Budget</p>
                  <p className="text-sm font-medium">
                    {budgets.length
                      ? formatDate(
                          budgets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
                            .createdAt,
                        )
                      : "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Last Approved</p>
                  <p className="text-sm font-medium">
                    {budgets.filter((b) => b.approvedAt).length
                      ? formatDate(
                          budgets
                            .filter((b) => b.approvedAt)
                            .sort((a, b) => new Date(b.approvedAt!).getTime() - new Date(a.approvedAt!).getTime())[0]
                            .approvedAt!,
                        )
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="pt-2 text-xs text-muted-foreground border-t">
                <div className="flex items-center">
                  <AlertCircleIcon className="mr-1 h-3 w-3 text-amber-500" />
                  {stats.pendingBudgets > 0
                    ? `${stats.pendingBudgets} budget${stats.pendingBudgets > 1 ? "s" : ""} awaiting approval`
                    : "No pending approvals"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
