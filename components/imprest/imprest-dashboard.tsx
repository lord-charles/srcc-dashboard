"use client"

import React from "react"

import { useState, useEffect } from "react"
import { format, parseISO, isValid } from "date-fns"
import {
  ArrowUpDown,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  CreditCard,
  Download,
  Eye,
  Filter,
  Info,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  DollarSign,
  User,
  ThumbsUp,
  MoreHorizontal,
  X,
  AlertCircle,
  FileCheck,
  Copy,
  MessageSquare,
  CheckCircle,
  Bell,
  AlertTriangle,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { NewImprestDrawer } from "./new-imprest-drawer"
import { createImprest, getMyImprest } from "@/services/imprest.service"
import { FormValues } from "./new-imprest-drawer"
import { ImprestAccountabilitySection } from "./imprest-accountability-section"
import { MyImprestStats } from "./my-imprest-stats"

// Type definitions
export type ApprovalInfo = {
  approvedBy: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  approvedAt: string
  comments: string
}
 interface ImprestRejection {
  rejectedBy: {
    _id: string
    firstName: string
    lastName: string
    email: string
  };
  rejectedAt: string;
  reason: string;
}

export type RequestedBy = {
  _id: string
  firstName: string
  lastName: string
  email: string
  department: string
}

export type Imprest = {
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
  status: string
  requestedBy: RequestedBy
  createdAt: string
  updatedAt: string
  rejection?: ImprestRejection
  __v: number
  hodApproval?: ApprovalInfo
  accountantApproval?: ApprovalInfo
}

const StatusBadge = ({ status }: { status: string }) => {
  const statusMap: Record<string, { color: string; bgColor: string; label: string; icon: React.ReactNode }> = {
    approved: {
      color: "text-emerald-700 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
      label: "Approved",
      icon: <Check className="h-3.5 w-3.5" />,
    },
    disbursed: {
      color: "text-blue-700 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
      label: "Disbursed",
      icon: <CreditCard className="h-3.5 w-3.5" />,
    },
    pending_hod: {
      color: "text-amber-700 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/50",
      label: "Pending HOD",
      icon: <Clock className="h-3.5 w-3.5" />,
    },
    pending_accountant: {
      color: "text-amber-700 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/50",
      label: "Pending Accountant",
      icon: <Clock className="h-3.5 w-3.5" />,
    },
    rejected: {
      color: "text-rose-700 dark:text-rose-400",
      bgColor: "bg-rose-50 dark:bg-rose-950/50",
      label: "Rejected",
      icon: <Info className="h-3.5 w-3.5" />,
    },
  }

  const { color, bgColor, label, icon } = statusMap[status] || {
    color: "text-gray-700 dark:text-gray-400",
    bgColor: "bg-gray-50 dark:bg-gray-800/50",
    label: status,
    icon: <Info className="h-3.5 w-3.5" />,
  }

  return (
    <Badge
      variant="outline"
      className={`${color} ${bgColor} border-0 flex items-center gap-1.5 px-2.5 py-1 capitalize font-medium shadow-sm`}
    >
      {icon}
      {label}
    </Badge>
  )
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Format date with proper handling of invalid dates
const formatDate = (dateString: string) => {
  try {
    const date = parseISO(dateString)
    if (isValid(date)) {
      return format(date, "MMM d, yyyy")
    }
    return format(new Date(dateString), "MMM d, yyyy")
  } catch (error) {
    return dateString
  }
}

// Calculate approval progress percentage
const calculateApprovalProgress = (imprest: Imprest) => {
  if (imprest.status === "rejected") return 100
  if (imprest.status === "approved") return 100
  if (imprest.status === "disbursed") return 100

  let progress = 0
  if (imprest.hodApproval) progress += 50
  if (imprest.accountantApproval) progress += 50

  return progress
}

const ApprovalTimeline = ({ imprest }: { imprest: Imprest }) => {
  return (
    <div className="space-y-4 py-2">
      <div className="flex justify-between mb-2">
        <div className="text-sm font-medium">Approval Progress</div>
        <div className="text-sm text-muted-foreground">{calculateApprovalProgress(imprest)}%</div>
      </div>
      <Progress value={calculateApprovalProgress(imprest)} className="h-2.5 rounded-full" />

      <div className="space-y-4 mt-5 relative before:absolute before:left-[11px] before:top-1 before:h-[calc(100%-8px)] before:w-0.5 before:bg-muted">
        <div className="flex items-start gap-4 relative z-10">
          <div
            className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center shadow-sm ${imprest.hodApproval ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}
          >
            {imprest.hodApproval ? <Check className="h-3.5 w-3.5" /> : "1"}
          </div>
          <div className="bg-background dark:bg-card rounded-lg p-3 shadow-sm border border-border/50 flex-1">
            <div className="font-medium text-sm">HOD Approval</div>
            {imprest.hodApproval ? (
              <div className="text-xs text-muted-foreground mt-1">
                {formatDate(imprest.hodApproval.approvedAt)} by {imprest.hodApproval.approvedBy.firstName}{" "}
                {imprest.hodApproval.approvedBy.lastName}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground mt-1">Pending</div>
            )}
            {imprest.hodApproval?.comments && (
              <div className="text-xs mt-2 italic bg-muted/50 p-2 rounded-md">{imprest.hodApproval.comments}</div>
            )}
          </div>
        </div>

        <div className="flex items-start gap-4 relative z-10">
          <div
            className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center shadow-sm ${imprest.accountantApproval ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}
          >
            {imprest.accountantApproval ? <Check className="h-3.5 w-3.5" /> : "2"}
          </div>
          <div className="bg-background dark:bg-card rounded-lg p-3 shadow-sm border border-border/50 flex-1">
            <div className="font-medium text-sm">Accountant Approval</div>
            {imprest.accountantApproval ? (
              <div className="text-xs text-muted-foreground mt-1">
                {formatDate(imprest.accountantApproval.approvedAt)} by {imprest.accountantApproval.approvedBy.firstName}{" "}
                {imprest.accountantApproval.approvedBy.lastName}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground mt-1">
                {imprest.hodApproval ? "In Progress" : "Waiting for HOD Approval"}
              </div>
            )}
            {imprest.accountantApproval?.comments && (
              <div className="text-xs mt-2 italic bg-muted/50 p-2 rounded-md">
                {imprest.accountantApproval.comments}
              </div>
            )}
          </div>
        </div>

        {imprest.status === "rejected" && (
          <div className="mt-2 text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 p-3 rounded-md border border-rose-200 dark:border-rose-900/50">
            <div className="flex items-center gap-2 font-medium mb-1">
              <Info className="h-4 w-4" />
              Request Rejected
            </div>
            <p>Please review the comments and resubmit if necessary.</p>
          </div>
        )}
      </div>
    </div>
  )
}

const ImprestDetailView = ({ imprest, onClose }: { imprest: Imprest; onClose: () => void }) => {
  return (
    <Dialog open={!!imprest} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <StatusBadge status={imprest.status} />
            <DialogTitle>Imprest Request Details</DialogTitle>
          </div>
          <DialogDescription className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            Submitted on {formatDate(imprest.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-2 bg-muted/30 rounded-t-lg">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    Request Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between items-center pb-2 border-b border-border/30">
                      <dt className="text-muted-foreground">Reference ID:</dt>
                      <dd className="font-medium bg-muted/30 px-2 py-0.5 rounded">{imprest._id.substring(0, 8)}</dd>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border/30">
                      <dt className="text-muted-foreground">Payment Reason:</dt>
                      <dd className="font-medium">{imprest.paymentReason}</dd>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border/30">
                      <dt className="text-muted-foreground">Amount:</dt>
                      <dd className="font-medium text-primary">{formatCurrency(imprest.amount, imprest.currency)}</dd>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border/30">
                      <dt className="text-muted-foreground">Payment Type:</dt>
                      <dd className="font-medium">{imprest.paymentType}</dd>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border/30">
                      <dt className="text-muted-foreground">Request Date:</dt>
                      <dd className="font-medium">{formatDate(imprest.requestDate)}</dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-muted-foreground">Due Date:</dt>
                      <dd className="font-medium">{formatDate(imprest.dueDate)}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-2 bg-muted/30 rounded-t-lg">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Requester Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between items-center pb-2 border-b border-border/30">
                      <dt className="text-muted-foreground">Name:</dt>
                      <dd className="font-medium">
                        {imprest.requestedBy.firstName} {imprest.requestedBy.lastName}
                      </dd>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border/30">
                      <dt className="text-muted-foreground">Email:</dt>
                      <dd className="font-medium">{imprest.requestedBy.email}</dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-muted-foreground">Department:</dt>
                      <dd className="font-medium capitalize">{imprest.requestedBy.department}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-2 bg-muted/30 rounded-t-lg">
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  Explanation
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm bg-muted/20 p-3 rounded-md border border-border/30">{imprest.explanation}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-2 bg-muted/30 rounded-t-lg">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Approval Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ApprovalTimeline imprest={imprest} />
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <CardFooter className="flex justify-between border-t pt-4 mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" className="border-primary/20 bg-primary/5 hover:bg-primary/10">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            {imprest.status === "rejected" && (
              <Button className="shadow-md">
                <RefreshCw className="mr-2 h-4 w-4" />
                Resubmit
              </Button>
            )}
          </div>
        </CardFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function ImprestDashboard({ initialData }: { initialData: any }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<string[]>([])
  const [sortConfig, setSortConfig] = useState<{ key: keyof Imprest; direction: "asc" | "desc" }>({
    key: "createdAt",
    direction: "desc",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [selectedImprest, setSelectedImprest] = useState<Imprest | null>(null)
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState("all")
  const [pendingPage, setPendingPage] = useState(1);
  const [approvedPage, setApprovedPage] = useState(1);
  const [rejectedPage, setRejectedPage] = useState(1);
  const [disbursedPage, setDisbursedPage] = useState(1);
  const [imprestData, setImprestData] = useState<Imprest[]>(initialData)

  const { toast } = useToast()


  const [isNewImprestModalOpen, setIsNewImprestModalOpen] = useState(false)

  const handleCreateImprest = async (data: FormValues) => {
    try {
      await createImprest(data);

      toast({
        title: "Success",
        description: "Imprest request created successfully",
      });

      const updatedData = await getMyImprest();
      setImprestData(updatedData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create imprest request",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Get unique payment types for filtering
  const uniquePaymentTypes = Array.from(new Set(imprestData.map((item) => item.paymentType)))

  // Status filter handler
  const handleStatusFilter = (status: string) => {
    setStatusFilter((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }
  
  const handlePaymentTypeFilter = (type: string) => {
    setPaymentTypeFilter((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  // Filter function with enhanced filtering options
  const filteredData = imprestData.filter((imprest) => {
    const matchesSearch =
      imprest.paymentReason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imprest.explanation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imprest.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imprest._id.toLowerCase().includes(searchTerm.toLowerCase())

    // Status filter
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(imprest.status)

    // Payment type filter
    const matchesPaymentType = paymentTypeFilter.length === 0 || paymentTypeFilter.includes(imprest.paymentType)

    // Date filter
    let matchesDate = true
    const currentDate = new Date()
    const requestDate = new Date(imprest.requestDate)

    if (dateFilter === "last7days") {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(currentDate.getDate() - 7)
      matchesDate = requestDate >= sevenDaysAgo
    } else if (dateFilter === "last30days") {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(currentDate.getDate() - 30)
      matchesDate = requestDate >= thirtyDaysAgo
    } else if (dateFilter === "last90days") {
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(currentDate.getDate() - 90)
      matchesDate = requestDate >= ninetyDaysAgo
    }

    // Tab filter
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && (imprest.status === "pending_hod" || imprest.status === "pending_accountant")) ||
      (activeTab === "approved" && imprest.status === "approved") ||
      (activeTab === "rejected" && imprest.status === "rejected") ||
      (activeTab === "disbursed" && imprest.status === "disbursed")

    return matchesSearch && matchesStatus && matchesPaymentType && matchesDate && matchesTab
  })

  // Sort function
  const sortedData = [...filteredData].sort((a, b) => {
    const { key, direction } = sortConfig

    // Handle date fields
    if (key === "requestDate" || key === "dueDate" || key === "createdAt" || key === "updatedAt") {
      const dateA = new Date(a[key] || "").getTime()
      const dateB = new Date(b[key] || "").getTime()
      return direction === "asc" ? dateA - dateB : dateB - dateA
    }

    // Handle numeric fields
    if (key === "amount") {
      const valueA = a[key] || 0
      const valueB = b[key] || 0
      return direction === "asc" ? valueA - valueB : valueB - valueA
    }

    // Handle string fields with null checks
    const valueA = a[key] || ""
    const valueB = b[key] || ""
    if (valueA < valueB) return direction === "asc" ? -1 : 1
    if (valueA > valueB) return direction === "asc" ? 1 : -1
    return 0
  })
  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)

  // Sort handler
  const handleSort = (key: keyof Imprest) => {
    let direction: "asc" | "desc" = "asc"

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }

    setSortConfig({ key, direction })
  }
  const resetFilters = () => {
    setSearchTerm("")
    setStatusFilter([])
    setDateFilter("all")
    setPaymentTypeFilter([])
    setSortConfig({ key: "createdAt", direction: "desc" })
    setActiveTab("all")

    toast({
      title: "Filters reset",
      description: "All filters have been reset to default values.",
    })
  }

  // Toggle row expansion
  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Calculate summary statistics
  const pendingCount = imprestData.filter((item) => item.status === "pending_hod" || item.status === "pending_accountant").length
  const approvedCount = imprestData.filter((item) => item.status === "approved").length
  const disbursedCount = imprestData.filter((item) => item.status === "disbursed").length
  const rejectedCount = imprestData.filter((item) => item.status === "rejected").length

  // Export data function
  const handleExport = () => {
    toast({
      title: "Export initiated",
      description: "Your data is being prepared for export.",
    })
  }

  const handleViewDetails = (imprest: Imprest) => {
    setSelectedImprest(imprest)
  }

  const handleCloseDetails = () => {
    setSelectedImprest(null)
  }

  // Add these computed values
  const pendingItems = sortedData.filter(item => item.status === "pending_hod" || item.status === "pending_accountant");
  const approvedItems = sortedData.filter(item => item.status === "approved");
  const rejectedItems = sortedData.filter(item => item.status === "rejected");
  const disbursedItems = sortedData.filter(item => item.status === "disbursed");

  const pendingTotalPages = Math.ceil(pendingItems.length / itemsPerPage);
  const approvedTotalPages = Math.ceil(approvedItems.length / itemsPerPage);
  const rejectedTotalPages = Math.ceil(rejectedItems.length / itemsPerPage);
  const disbursedTotalPages = Math.ceil(disbursedItems.length / itemsPerPage);

  const pendingIndexOfLastItem = pendingPage * itemsPerPage;
  const pendingIndexOfFirstItem = pendingIndexOfLastItem - itemsPerPage;

  const approvedIndexOfLastItem = approvedPage * itemsPerPage;
  const approvedIndexOfFirstItem = approvedIndexOfLastItem - itemsPerPage;

  const rejectedIndexOfLastItem = rejectedPage * itemsPerPage;
  const rejectedIndexOfFirstItem = rejectedIndexOfLastItem - itemsPerPage;

  const disbursedIndexOfLastItem = disbursedPage * itemsPerPage;
  const disbursedIndexOfFirstItem = disbursedIndexOfLastItem - itemsPerPage;

  const handleExportSingle = (imprest: Imprest) => {
    toast({
      title: "Exporting PDF",
      description: `Preparing PDF for ${imprest.paymentReason}`,
    });
  };

  const handleDuplicate = (imprest: Imprest) => {
    toast({
      title: "Duplicating Request",
      description: "Creating a new request based on the selected template.",
    });
  };

  const handleResubmit = (imprest: Imprest) => {
    toast({
      title: "Resubmitting Request",
      description: "Preparing to resubmit the rejected request.",
    });
  };

  

  return (
    <div className="p-3 space-y-8">
      <MyImprestStats imprests={initialData} />

      {/* Enhanced Main Content Card */}
      <Card className="w-full border-border/50 shadow-sm">
        <div className="pb-3 p-4 ">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                My Imprest Applications
              </CardTitle>
              <CardDescription>
                View and manage your imprest applications and track their approval status
              </CardDescription>
            </div>
            <Button
              className="md:self-start bg-primary hover:bg-primary/90 shadow-md"
              onClick={() => setIsNewImprestModalOpen(true)}

            >
              <Plus className="mr-2 h-4 w-4" />
              New Application
            </Button>
          </div>
        </div>

        <CardContent className="p-0">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-0 border-b">
              <TabsList className="w-full justify-start h-12 bg-transparent p-0 mb-[-1px]">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12 px-4 font-medium"
                >
                  All Requests
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12 px-4 font-medium"
                >
                  Pending
                  {pendingCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                    >
                      {pendingCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="approved"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12 px-4 font-medium"
                >
                  Approved
                  {approvedCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    >
                      {approvedCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="disbursed"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12 px-4 font-medium"
                >
                  Disbursed
                  {disbursedCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    >
                      {disbursedCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="rejected"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12 px-4 font-medium"
                >
                  Rejected
                  {rejectedCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                    >
                      {rejectedCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
            {/* All Requests Tab */}
            <TabsContent value="all" className="m-0">

            <div className="flex flex-col md:flex-row gap-4 py-4 px-2 border-b">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by reason, ID, or explanation..."
                    className="pl-8 border-border/50 focus-visible:ring-primary/20 focus-visible:ring-offset-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-10 border-border/50 hover:bg-muted/50">
                        <Filter className="mr-2 h-4 w-4 text-primary" />
                        Filter
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end"  className="w-56 border-border/50 shadow-lg scale-90">
                      <DropdownMenuLabel className="flex items-center gap-2 text-primary">
                        <Filter className="h-4 w-4" />
                        Filter Options
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem
                        checked={statusFilter.includes("accounted")}
                        onCheckedChange={() => handleStatusFilter("accounted")}
                        className="focus:bg-emerald-50 dark:focus:bg-emerald-950/30"
                      >
                        <span className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                          Accounted
                        </span>
                      </DropdownMenuCheckboxItem>
                   

                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Filter by Payment Type</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {uniquePaymentTypes.map((type) => (
                        <DropdownMenuCheckboxItem
                          key={type}
                          checked={paymentTypeFilter.includes(type)}
                          onCheckedChange={() => handlePaymentTypeFilter(type)}
                        >
                          {type}
                        </DropdownMenuCheckboxItem>
                      ))}

                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Filter by Date</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem
                        checked={dateFilter === "all"}
                        onCheckedChange={() => setDateFilter("all")}
                      >
                        All Time
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={dateFilter === "last7days"}
                        onCheckedChange={() => setDateFilter("last7days")}
                      >
                        Last 7 Days
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={dateFilter === "last30days"}
                        onCheckedChange={() => setDateFilter("last30days")}
                      >
                        Last 30 Days
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={dateFilter === "last90days"}
                        onCheckedChange={() => setDateFilter("last90days")}
                      >
                        Last 90 Days
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-10 border-border/50 hover:bg-muted/50">
                        <SlidersHorizontal className="mr-2 h-4 w-4 text-primary" />
                        Options
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="border-border/50 shadow-lg">
                      <DropdownMenuItem onClick={handleExport} className="focus:bg-primary/5">
                        <Download className="mr-2 h-4 w-4 text-primary" />
                        Export Data
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={resetFilters} className="focus:bg-primary/5">
                        <RefreshCw className="mr-2 h-4 w-4 text-primary" />
                        Reset Filters
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="flex items-center gap-2 text-primary">
                        <SlidersHorizontal className="h-4 w-4" />
                        Display Options
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem checked={itemsPerPage === 5} onCheckedChange={() => setItemsPerPage(5)}>
                        5 items per page
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={itemsPerPage === 10}
                        onCheckedChange={() => setItemsPerPage(10)}
                      >
                        10 items per page
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={itemsPerPage === 20}
                        onCheckedChange={() => setItemsPerPage(20)}
                      >
                        20 items per page
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>


            
                <>
                  {currentItems.length > 0 ? (
                    <div className="rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableHead className="w-[40px]"></TableHead>
                            <TableHead className="w-[180px]">
                              <Button
                                variant="ghost"
                                onClick={() => handleSort("paymentReason")}
                                className="flex items-center gap-1 font-medium hover:bg-transparent"
                              >
                                Payment Reason
                                <ArrowUpDown
                                  className={`h-3 w-3 ${sortConfig.key === "paymentReason" ? "text-primary" : "opacity-40"
                                    }`}
                                />
                              </Button>
                            </TableHead>
                            <TableHead>
                              <Button
                                variant="ghost"
                                onClick={() => handleSort("amount")}
                                className="flex items-center gap-1 font-medium hover:bg-transparent"
                              >
                                Amount
                                <ArrowUpDown
                                  className={`h-3 w-3 ${sortConfig.key === "amount" ? "text-primary" : "opacity-40"}`}
                                />
                              </Button>
                            </TableHead>
                            <TableHead className="hidden md:table-cell">
                              <Button
                                variant="ghost"
                                onClick={() => handleSort("requestDate")}
                                className="flex items-center gap-1 font-medium hover:bg-transparent"
                              >
                                Request Date
                                <ArrowUpDown
                                  className={`h-3 w-3 ${sortConfig.key === "requestDate" ? "text-primary" : "opacity-40"
                                    }`}
                                />
                              </Button>
                            </TableHead>
                            <TableHead className="hidden lg:table-cell">
                              <Button
                                variant="ghost"
                                onClick={() => handleSort("dueDate")}
                                className="flex items-center gap-1 font-medium hover:bg-transparent"
                              >
                                Due Date
                                <ArrowUpDown
                                  className={`h-3 w-3 ${sortConfig.key === "dueDate" ? "text-primary" : "opacity-40"}`}
                                />
                              </Button>
                            </TableHead>
                            <TableHead>
                              <Button
                                variant="ghost"
                                onClick={() => handleSort("status")}
                                className="flex items-center gap-1 font-medium hover:bg-transparent"
                              >
                                Status
                                <ArrowUpDown
                                  className={`h-3 w-3 ${sortConfig.key === "status" ? "text-primary" : "opacity-40"}`}
                                />
                              </Button>
                            </TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentItems.map((imprest) => (
                            <React.Fragment key={imprest._id}>
                              <TableRow className="group hover:bg-muted/20 transition-colors">
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full hover:bg-primary/10"
                                    onClick={() => toggleRowExpansion(imprest._id)}
                                  >
                                    <ChevronDown
                                      className={`h-4 w-4 transition-transform ${expandedRows[imprest._id] ? "rotate-180" : ""
                                        }`}
                                    />
                                  </Button>
                                </TableCell>
                                <TableCell className="font-medium">
                                  <div>
                                    <div className="font-medium truncate max-w-[180px]">{imprest.paymentReason}</div>
                                    <div className="text-xs text-muted-foreground">{imprest.paymentType}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <CreditCard className="mr-1 h-4 w-4 text-primary" />
                                    <span className="font-medium">
                                      {formatCurrency(imprest.amount, imprest.currency)}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  <div className="flex items-center">
                                    <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                                    <span>{formatDate(imprest.requestDate)}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                  <div className="flex items-center">
                                    <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                                    <span>{formatDate(imprest.dueDate)}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <StatusBadge status={imprest.status} />
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 opacity-20 group-hover:opacity-100 transition-opacity hover:bg-primary/10 hover:text-primary rounded-full"
                                      onClick={() => handleViewDetails(imprest)}
                                    >
                                      <Eye className="h-4 w-4" />
                                      <span className="sr-only">View Details</span>
                                    </Button>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 opacity-20 group-hover:opacity-100 transition-opacity hover:bg-muted rounded-full"
                                        >
                                          <MoreHorizontal className="h-4 w-4" />
                                          <span className="sr-only">More Options</span>
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem onClick={() => handleViewDetails(imprest)}>
                                          <Eye className="mr-2 h-4 w-4" />
                                          View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                          <Download className="mr-2 h-4 w-4" />
                                          Export as PDF
                                        </DropdownMenuItem>
                                        {imprest.status === "rejected" && (
                                          <DropdownMenuItem>
                                            <RefreshCw className="mr-2 h-4 w-4" />
                                            Resubmit
                                          </DropdownMenuItem>
                                        )}
                                        {imprest.status === "pending_hod" || imprest.status === "pending_accountant" && (
                                          <DropdownMenuItem>
                                            <X className="mr-2 h-4 w-4" />
                                            Cancel Request
                                          </DropdownMenuItem>
                                        )}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </TableCell>
                              </TableRow>

                              {expandedRows[imprest._id] && (
                                imprest.status === "disbursed" ? (
                                  <ImprestAccountabilitySection
                                  imprest={imprest}
                                  onDuplicate={handleDuplicate}
                                  />) : (
                                <TableRow>
                                  <TableCell colSpan={7} className="p-0 border-t-0">
                                    <div className="bg-muted/20 p-4 border-t border-border/30">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-background rounded-lg p-4 shadow-sm border border-border/50">
                                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                            <Info className="h-4 w-4 text-primary" />
                                            Explanation
                                          </h4>
                                          <p className="text-sm text-muted-foreground">{imprest.explanation}</p>
                                        </div>
                                        <div className="bg-background rounded-lg p-4 shadow-sm border border-border/50">
                                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-primary" />
                                            Approval Timeline
                                          </h4>
                                          <ApprovalTimeline imprest={imprest} />
                                        </div>
                                      </div>
                                      <div className="flex justify-end mt-4">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="text-xs h-8"
                                          onClick={() => handleViewDetails(imprest)}
                                        >
                                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                                          View Full Details
                                        </Button>
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>))}
                            
                            </React.Fragment>
                          ))}
                        </TableBody>
                      </Table>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-t gap-4">
                        <div className="text-sm text-muted-foreground">
                          Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                          <span className="font-medium">{Math.min(indexOfLastItem, sortedData.length)}</span> of{" "}
                          <span className="font-medium">{sortedData.length}</span> results
                        </div>

                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                isActive={currentPage === 1}
                                aria-disabled={currentPage === 1}
                                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                              />
                            </PaginationItem>

                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                              const pageNumber = i + 1
                              return (
                                <PaginationItem key={pageNumber}>
                                  <PaginationLink
                                    onClick={() => setCurrentPage(pageNumber)}
                                    isActive={currentPage === pageNumber}
                                    className={
                                      currentPage === pageNumber
                                        ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                                        : ""
                                    }
                                  >
                                    {pageNumber}
                                  </PaginationLink>
                                </PaginationItem>
                              )
                            })}

                            {totalPages > 5 && (
                              <>
                                <PaginationItem>
                                  <PaginationEllipsis />
                                </PaginationItem>
                                <PaginationItem>
                                  <PaginationLink
                                    onClick={() => setCurrentPage(totalPages)}
                                    isActive={currentPage === totalPages}
                                    className={
                                      currentPage === totalPages
                                        ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                                        : ""
                                    }
                                  >
                                    {totalPages}
                                  </PaginationLink>
                                </PaginationItem>
                              </>
                            )}

                            <PaginationItem>
                              <PaginationNext
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                isActive={currentPage === totalPages}
                                aria-disabled={currentPage === totalPages}
                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4 border border-border/50 shadow-sm">
                        <Search className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium">No results found</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        No imprest applications match your current filters.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4 border-primary/20 bg-primary/5 hover:bg-primary/10"
                        onClick={resetFilters}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reset Filters
                      </Button>
                    </div>
                  )}
                </>
            </TabsContent>

            {/* Pending Requests Tab */}
            <TabsContent value="pending" className="m-0">
              
                <>
                  {pendingItems.length > 0 ? (
                    <div className="rounded-md">
                      <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/50">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-full text-amber-700 dark:text-amber-400">
                            <Clock className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium text-amber-800 dark:text-amber-400">Pending Approval</h3>
                            <p className="text-sm text-amber-700/80 dark:text-amber-300/80 mt-0.5">
                              These requests are awaiting approval from either your HOD or the accountant.
                            </p>
                          </div>
                        </div>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableHead className="w-[40px]"></TableHead>
                            <TableHead className="w-[180px]">
                              <Button
                                variant="ghost"
                                onClick={() => handleSort("paymentReason")}
                                className="flex items-center gap-1 font-medium hover:bg-transparent"
                              >
                                Payment Reason
                                <ArrowUpDown
                                  className={`h-3 w-3 ${sortConfig.key === "paymentReason" ? "text-amber-500" : "opacity-40"
                                    }`}
                                />
                              </Button>
                            </TableHead>
                            <TableHead>
                              <Button
                                variant="ghost"
                                onClick={() => handleSort("amount")}
                                className="flex items-center gap-1 font-medium hover:bg-transparent"
                              >
                                Amount
                                <ArrowUpDown
                                  className={`h-3 w-3 ${sortConfig.key === "amount" ? "text-amber-500" : "opacity-40"}`}
                                />
                              </Button>
                            </TableHead>
                            <TableHead className="hidden md:table-cell">
                              <Button
                                variant="ghost"
                                onClick={() => handleSort("requestDate")}
                                className="flex items-center gap-1 font-medium hover:bg-transparent"
                              >
                                Request Date
                                <ArrowUpDown
                                  className={`h-3 w-3 ${sortConfig.key === "requestDate" ? "text-amber-500" : "opacity-40"
                                    }`}
                                />
                              </Button>
                            </TableHead>
                            <TableHead className="hidden lg:table-cell">
                              <Button
                                variant="ghost"
                                onClick={() => handleSort("dueDate")}
                                className="flex items-center gap-1 font-medium hover:bg-transparent"
                              >
                                Due Date
                                <ArrowUpDown
                                  className={`h-3 w-3 ${sortConfig.key === "dueDate" ? "text-amber-500" : "opacity-40"}`}
                                />
                              </Button>
                            </TableHead>
                            <TableHead>Approval Stage</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingItems.map((imprest) => (
                            <React.Fragment key={imprest._id}>
                              <TableRow className="group hover:bg-amber-50/30 dark:hover:bg-amber-950/10 transition-colors">
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full hover:bg-amber-100/50 dark:hover:bg-amber-900/20"
                                    onClick={() => toggleRowExpansion(imprest._id)}
                                  >
                                    <ChevronDown
                                      className={`h-4 w-4 transition-transform ${expandedRows[imprest._id] ? "rotate-180" : ""
                                        }`}
                                    />
                                  </Button>
                                </TableCell>
                                <TableCell className="font-medium">
                                  <div>
                                    <div className="font-medium truncate max-w-[180px]">{imprest.paymentReason}</div>
                                    <div className="text-xs text-muted-foreground">{imprest.paymentType}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <CreditCard className="mr-1 h-4 w-4 text-amber-500" />
                                    <span className="font-medium">
                                      {formatCurrency(imprest.amount, imprest.currency)}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  <div className="flex items-center">
                                    <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                                    <span>{formatDate(imprest.requestDate)}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                  <div className="flex items-center">
                                    <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                                    <span>{formatDate(imprest.dueDate)}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1.5">
                                    <div className={`h-2 w-2 rounded-full ${imprest.hodApproval ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    <span className="text-sm">
                                      {imprest.hodApproval ? 'Accountant Review' : 'HOD Review'}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 opacity-20 group-hover:opacity-100 transition-opacity hover:bg-amber-100/50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-400 rounded-full"
                                      onClick={() => handleViewDetails(imprest)}
                                    >
                                      <Eye className="h-4 w-4" />
                                      <span className="sr-only">View Details</span>
                                    </Button>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 opacity-20 group-hover:opacity-100 transition-opacity hover:bg-muted rounded-full"
                                        >
                                          <MoreHorizontal className="h-4 w-4" />
                                          <span className="sr-only">More Options</span>
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem onClick={() => handleViewDetails(imprest)}>
                                          <Eye className="mr-2 h-4 w-4" />
                                          View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                          <Download className="mr-2 h-4 w-4" />
                                          Export as PDF
                                        </DropdownMenuItem>
                                        <DropdownMenuItem >
                                          <X className="mr-2 h-4 w-4" />
                                          Cancel Request
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                          <Bell className="mr-2 h-4 w-4" />
                                          Send Reminder
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </TableCell>
                              </TableRow>

                              {expandedRows[imprest._id] && (
                                <TableRow>
                                  <TableCell colSpan={7} className="p-0 border-t-0">
                                    <div className="bg-amber-50/30 dark:bg-amber-950/10 p-4 border-t border-amber-200/30 dark:border-amber-800/30">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-background rounded-lg p-4 shadow-sm border border-border/50">
                                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                            <Info className="h-4 w-4 text-amber-500" />
                                            Explanation
                                          </h4>
                                          <p className="text-sm text-muted-foreground">{imprest.explanation}</p>
                                        </div>
                                        <div className="bg-background rounded-lg p-4 shadow-sm border border-border/50">
                                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-amber-500" />
                                            Approval Status
                                          </h4>
                                          <ApprovalTimeline imprest={imprest} />
                                        </div>
                                      </div>
                                      <div className="flex justify-end mt-4">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="text-xs h-8 border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:hover:bg-amber-900/30 dark:text-amber-400"
                                        // onClick={() => handleSendReminder(imprest)}
                                        >
                                          <Bell className="mr-1.5 h-3.5 w-3.5" />
                                          Send Reminder
                                        </Button>
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </React.Fragment>
                          ))}
                        </TableBody>
                      </Table>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-t gap-4">
                        <div className="text-sm text-muted-foreground">
                          Showing <span className="font-medium">{pendingIndexOfFirstItem + 1}</span> to{" "}
                          <span className="font-medium">{Math.min(pendingIndexOfLastItem, pendingItems.length)}</span> of{" "}
                          <span className="font-medium">{pendingItems.length}</span> pending requests
                        </div>

                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() => setPendingPage((prev) => Math.max(prev - 1, 1))}
                                isActive={pendingPage === 1}
                                aria-disabled={pendingPage === 1}
                                className={pendingPage === 1 ? "pointer-events-none opacity-50" : ""}
                              />
                            </PaginationItem>

                            {Array.from({ length: Math.min(pendingTotalPages, 5) }, (_, i) => {
                              const pageNumber = i + 1
                              return (
                                <PaginationItem key={pageNumber}>
                                  <PaginationLink
                                    onClick={() => setPendingPage(pageNumber)}
                                    isActive={pendingPage === pageNumber}
                                    className={
                                      pendingPage === pageNumber
                                        ? "bg-amber-500 text-white hover:bg-amber-600 hover:text-white"
                                        : ""
                                    }
                                  >
                                    {pageNumber}
                                  </PaginationLink>
                                </PaginationItem>
                              )
                            })}

                            {pendingTotalPages > 5 && (
                              <>
                                <PaginationItem>
                                  <PaginationEllipsis />
                                </PaginationItem>
                                <PaginationItem>
                                  <PaginationLink
                                    onClick={() => setPendingPage(pendingTotalPages)}
                                    isActive={pendingPage === pendingTotalPages}
                                    className={
                                      pendingPage === pendingTotalPages
                                        ? "bg-amber-500 text-white hover:bg-amber-600 hover:text-white"
                                        : ""
                                    }
                                  >
                                    {pendingTotalPages}
                                  </PaginationLink>
                                </PaginationItem>
                              </>
                            )}

                            <PaginationItem>
                              <PaginationNext
                                onClick={() => setPendingPage((prev) => Math.min(prev + 1, pendingTotalPages))}
                                isActive={pendingPage === pendingTotalPages}
                                aria-disabled={pendingPage === pendingTotalPages}
                                className={pendingPage === pendingTotalPages ? "pointer-events-none opacity-50" : ""}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="h-16 w-16 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-4 border border-amber-200 dark:border-amber-800/50 shadow-sm text-amber-500">
                        <CheckCircle className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-medium">No pending requests</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        You don&apos;t have any imprest applications awaiting approval.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4 border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:hover:bg-amber-900/30 dark:text-amber-400"
                        onClick={() => setIsNewImprestModalOpen(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Request
                      </Button>
                    </div>
                  )}
                </>
            </TabsContent>

            {/* Approved Requests Tab */}
            <TabsContent value="approved" className="m-0">
           
                <>
                  {approvedItems.length > 0 ? (
                    <div className="rounded-md">
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-800/50">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-full text-emerald-700 dark:text-emerald-400">
                            <Check className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium text-emerald-800 dark:text-emerald-400">Approved Requests</h3>
                            <p className="text-sm text-emerald-700/80 dark:text-emerald-300/80 mt-0.5">
                              These requests have been fully approved and processed.
                            </p>
                          </div>
                        </div>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableHead className="w-[40px]"></TableHead>
                            <TableHead className="w-[180px]">
                              <Button
                                variant="ghost"
                                onClick={() => handleSort("paymentReason")}
                                className="flex items-center gap-1 font-medium hover:bg-transparent"
                              >
                                Payment Reason
                                <ArrowUpDown
                                  className={`h-3 w-3 ${sortConfig.key === "paymentReason" ? "text-emerald-500" : "opacity-40"
                                    }`}
                                />
                              </Button>
                            </TableHead>
                            <TableHead>
                              <Button
                                variant="ghost"
                                onClick={() => handleSort("amount")}
                                className="flex items-center gap-1 font-medium hover:bg-transparent"
                              >
                                Amount
                                <ArrowUpDown
                                  className={`h-3 w-3 ${sortConfig.key === "amount" ? "text-emerald-500" : "opacity-40"}`}
                                />
                              </Button>
                            </TableHead>
                            <TableHead className="hidden md:table-cell">
                              <Button
                                variant="ghost"
                                onClick={() => handleSort("requestDate")}
                                className="flex items-center gap-1 font-medium hover:bg-transparent"
                              >
                                Request Date
                                <ArrowUpDown
                                  className={`h-3 w-3 ${sortConfig.key === "requestDate" ? "text-emerald-500" : "opacity-40"
                                    }`}
                                />
                              </Button>
                            </TableHead>
                            <TableHead className="hidden lg:table-cell">Approved Date</TableHead>
                            <TableHead>Approved By</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {approvedItems.map((imprest) => (
                            <React.Fragment key={imprest._id}>
                              <TableRow className="group hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10 transition-colors">
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20"
                                    onClick={() => toggleRowExpansion(imprest._id)}
                                  >
                                    <ChevronDown
                                      className={`h-4 w-4 transition-transform ${expandedRows[imprest._id] ? "rotate-180" : ""
                                        }`}
                                    />
                                  </Button>
                                </TableCell>
                                <TableCell className="font-medium">
                                  <div>
                                    <div className="font-medium truncate max-w-[180px]">{imprest.paymentReason}</div>
                                    <div className="text-xs text-muted-foreground">{imprest.paymentType}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <CreditCard className="mr-1 h-4 w-4 text-emerald-500" />
                                    <span className="font-medium">
                                      {formatCurrency(imprest.amount, imprest.currency)}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  <div className="flex items-center">
                                    <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                                    <span>{formatDate(imprest.requestDate)}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                  {imprest.accountantApproval && (
                                    <div className="flex items-center">
                                      <Check className="mr-1 h-4 w-4 text-emerald-500" />
                                      <span>{formatDate(imprest.accountantApproval.approvedAt)}</span>
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {imprest.accountantApproval && (
                                    <div className="flex items-center gap-1.5">
                                      <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                                          {imprest.accountantApproval.approvedBy.firstName.charAt(0)}
                                          {imprest.accountantApproval.approvedBy.lastName.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm">
                                        {imprest.accountantApproval.approvedBy.firstName} {imprest.accountantApproval.approvedBy.lastName}
                                      </span>
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 opacity-20 group-hover:opacity-100 transition-opacity hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-full"
                                      onClick={() => handleViewDetails(imprest)}
                                    >
                                      <Eye className="h-4 w-4" />
                                      <span className="sr-only">View Details</span>
                                    </Button>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 opacity-20 group-hover:opacity-100 transition-opacity hover:bg-muted rounded-full"
                                        >
                                          <MoreHorizontal className="h-4 w-4" />
                                          <span className="sr-only">More Options</span>
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem onClick={() => handleViewDetails(imprest)}>
                                          <Eye className="mr-2 h-4 w-4" />
                                          View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleExportSingle(imprest)}>
                                          <Download className="mr-2 h-4 w-4" />
                                          Export as PDF
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDuplicate(imprest)}>
                                          <Copy className="mr-2 h-4 w-4" />
                                          Duplicate Request
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </TableCell>
                              </TableRow>

                              {expandedRows[imprest._id] && (
                                <TableRow>
                                  <TableCell colSpan={7} className="p-0 border-t-0">
                                    <div className="bg-emerald-50/30 dark:bg-emerald-950/10 p-4 border-t border-emerald-200/30 dark:border-emerald-800/30">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-background rounded-lg p-4 shadow-sm border border-border/50">
                                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                            <Info className="h-4 w-4 text-emerald-500" />
                                            Explanation
                                          </h4>
                                          <p className="text-sm text-muted-foreground">{imprest.explanation}</p>
                                        </div>
                                        <div className="bg-background rounded-lg p-4 shadow-sm border border-border/50">
                                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4 text-emerald-500" />
                                            Approval Comments
                                          </h4>
                                          <div className="space-y-3">
                                            {imprest.hodApproval && (
                                              <div className="text-sm">
                                                <div className="font-medium text-xs text-muted-foreground">HOD Comment:</div>
                                                <p className="mt-1 bg-muted/20 p-2 rounded-md">{imprest.hodApproval.comments || "No comments provided"}</p>
                                              </div>
                                            )}
                                            {imprest.accountantApproval && (
                                              <div className="text-sm">
                                                <div className="font-medium text-xs text-muted-foreground">Accountant Comment:</div>
                                                <p className="mt-1 bg-muted/20 p-2 rounded-md">{imprest.accountantApproval.comments || "No comments provided"}</p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex justify-end mt-4">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="text-xs h-8 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/30 dark:text-emerald-400"
                                          onClick={() => handleDuplicate(imprest)}
                                        >
                                          <Copy className="mr-1.5 h-3.5 w-3.5" />
                                          Duplicate Request
                                        </Button>
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </React.Fragment>
                          ))}
                        </TableBody>
                      </Table>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-t gap-4">
                        <div className="text-sm text-muted-foreground">
                          Showing <span className="font-medium">{approvedIndexOfFirstItem + 1}</span> to{" "}
                          <span className="font-medium">{Math.min(approvedIndexOfLastItem, approvedItems.length)}</span> of{" "}
                          <span className="font-medium">{approvedItems.length}</span> approved requests
                        </div>

                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() => setApprovedPage((prev) => Math.max(prev - 1, 1))}
                                isActive={approvedPage === 1}
                                aria-disabled={approvedPage === 1}
                                className={approvedPage === 1 ? "pointer-events-none opacity-50" : ""}
                              />
                            </PaginationItem>

                            {Array.from({ length: Math.min(approvedTotalPages, 5) }, (_, i) => {
                              const pageNumber = i + 1
                              return (
                                <PaginationItem key={pageNumber}>
                                  <PaginationLink
                                    onClick={() => setApprovedPage(pageNumber)}
                                    isActive={approvedPage === pageNumber}
                                    className={
                                      approvedPage === pageNumber
                                        ? "bg-emerald-500 text-white hover:bg-emerald-600 hover:text-white"
                                        : ""
                                    }
                                  >
                                    {pageNumber}
                                  </PaginationLink>
                                </PaginationItem>
                              )
                            })}

                            {approvedTotalPages > 5 && (
                              <>
                                <PaginationItem>
                                  <PaginationEllipsis />
                                </PaginationItem>
                                <PaginationItem>
                                  <PaginationLink
                                    onClick={() => setApprovedPage(approvedTotalPages)}
                                    isActive={approvedPage === approvedTotalPages}
                                    className={
                                      approvedPage === approvedTotalPages
                                        ? "bg-emerald-500 text-white hover:bg-emerald-600 hover:text-white"
                                        : ""
                                    }
                                  >
                                    {approvedTotalPages}
                                  </PaginationLink>
                                </PaginationItem>
                              </>
                            )}

                            <PaginationItem>
                              <PaginationNext
                                onClick={() => setApprovedPage((prev) => Math.min(prev + 1, approvedTotalPages))}
                                isActive={approvedPage === approvedTotalPages}
                                aria-disabled={approvedPage === approvedTotalPages}
                                className={approvedPage === approvedTotalPages ? "pointer-events-none opacity-50" : ""}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4 border border-emerald-200 dark:border-emerald-800/50 shadow-sm text-emerald-500">
                        <FileCheck className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-medium">No approved requests</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        You don&apos;t have any approved imprest applications yet.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/30 dark:text-emerald-400"
                        onClick={() => setIsNewImprestModalOpen(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Request
                      </Button>
                    </div>
                  )}
                </>
            </TabsContent>

            {/* Disbursed Requests Tab */}
            <TabsContent value="disbursed" className="m-0">
             
                <>
                  {disbursedItems.length > 0 ? (
                    <div className="rounded-md">

<div className="p-4 bg-blue-400 dark:bg-blue-950/30 border-b border-blue-200 dark:border-blue-800/50">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-700 dark:text-blue-400">
                            <CreditCard className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium text-blue-800 dark:text-blue-400">Disbursed Requests</h3>
                            <p className="text-sm text-blue-700/80 dark:text-blue-300/80 mt-0.5">
                              These requests have been disbursed and you can collect the cash.
                            </p>
                          </div>
                        </div>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableHead className="w-[40px]"></TableHead>
                            <TableHead className="w-[180px]">
                              <Button
                                variant="ghost"
                                onClick={() => handleSort("paymentReason")}
                                className="flex items-center gap-1 font-medium hover:bg-transparent"
                              >
                                Payment Reason
                                <ArrowUpDown className={`h-3 w-3 ${sortConfig.key === "paymentReason" ? "text-primary" : "opacity-40"}`} />
                              </Button>
                            </TableHead>
                            <TableHead>
                              <Button
                                variant="ghost"
                                onClick={() => handleSort("amount")}
                                className="flex items-center gap-1 font-medium hover:bg-transparent"
                              >
                                Amount
                                <ArrowUpDown className={`h-3 w-3 ${sortConfig.key === "amount" ? "text-primary" : "opacity-40"}`} />
                              </Button>
                            </TableHead>
                            <TableHead className="hidden md:table-cell">Request Date</TableHead>
                            <TableHead className="hidden lg:table-cell">Due Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {disbursedItems.map((imprest) => (
                            <React.Fragment key={imprest._id}>
                              <TableRow className="group hover:bg-muted/20 transition-colors">
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full hover:bg-primary/10"
                                    onClick={() => toggleRowExpansion(imprest._id)}
                                  >
                                    <ChevronDown className={`h-4 w-4 transition-transform ${expandedRows[imprest._id] ? "rotate-180" : ""}`} />
                                  </Button>
                                </TableCell>
                                <TableCell className="font-medium">
                                  <div>
                                    <div className="font-medium truncate max-w-[180px]">{imprest.paymentReason}</div>
                                    <div className="text-xs text-muted-foreground">{imprest.paymentType}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <CreditCard className="mr-1 h-4 w-4 text-primary" />
                                    <span className="font-medium">
                                      {formatCurrency(imprest.amount, imprest.currency)}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{formatDate(imprest.requestDate)}</TableCell>
                                <TableCell className="hidden lg:table-cell">{formatDate(imprest.dueDate)}</TableCell>
                                <TableCell><StatusBadge status={imprest.status} /></TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 opacity-20 group-hover:opacity-100 transition-opacity hover:bg-primary/10 hover:text-primary rounded-full"
                                      onClick={() => handleViewDetails(imprest)}
                                    >
                                      <Eye className="h-4 w-4" />
                                      <span className="sr-only">View Details</span>
                                    </Button>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 opacity-20 group-hover:opacity-100 transition-opacity hover:bg-muted rounded-full"
                                        >
                                          <MoreHorizontal className="h-4 w-4" />
                                          <span className="sr-only">More Options</span>
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem onClick={() => handleViewDetails(imprest)}>
                                          <Eye className="mr-2 h-4 w-4" />
                                          View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleExportSingle(imprest)}>
                                          <Download className="mr-2 h-4 w-4" />
                                          Export as PDF
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </TableCell>
                              </TableRow>

                              {expandedRows[imprest._id] && (
                               <ImprestAccountabilitySection
                               imprest={imprest}
                               onDuplicate={handleDuplicate}
                               />
                              )}
                            </React.Fragment>
                          ))}
                        </TableBody>
                      </Table>

                      <div className="flex items-center justify-between px-6 py-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          Showing <span className="font-medium">{disbursedIndexOfFirstItem + 1}</span> to{" "}
                          <span className="font-medium">
                            {Math.min(disbursedIndexOfLastItem, disbursedItems.length)}
                          </span> of{" "}
                          <span className="font-medium">{disbursedItems.length}</span> results
                        </div>
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() => setDisbursedPage((prev) => Math.max(prev - 1, 1))}
                                isActive={disbursedPage === 1}
                                aria-disabled={disbursedPage === 1}
                                className={disbursedPage === 1 ? "pointer-events-none opacity-50" : ""}
                              />
                            </PaginationItem>
                            {Array.from({ length: Math.min(disbursedTotalPages, 5) }, (_, i) => {
                              const pageNumber = i + 1;
                              return (
                                <PaginationItem key={pageNumber}>
                                  <PaginationLink
                                    onClick={() => setDisbursedPage(pageNumber)}
                                    isActive={disbursedPage === pageNumber}
                                  >
                                    {pageNumber}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            })}
                            <PaginationItem>
                              <PaginationNext
                                onClick={() => setDisbursedPage((prev) => Math.min(prev + 1, disbursedTotalPages))}
                                isActive={disbursedPage === disbursedTotalPages}
                                aria-disabled={disbursedPage === disbursedTotalPages}
                                className={disbursedPage === disbursedTotalPages ? "pointer-events-none opacity-50" : ""}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 gap-2">
                      <div className="p-4 rounded-full bg-primary/5">
                        <CreditCard className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="font-medium">No Disbursed Requests</h3>
                      <p className="text-sm text-muted-foreground">You don&apos;t have any disbursed imprest requests yet.</p>
                    </div>
                  )}
                </>
            </TabsContent>

            {/* Rejected Requests Tab */}
            <TabsContent value="rejected" className="m-0">
            
                <>
                  {rejectedItems.length > 0 ? (
                    <div className="rounded-md">
                      <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border-b border-rose-200 dark:border-rose-800/50">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-rose-100 dark:bg-rose-900/50 rounded-full text-rose-700 dark:text-rose-400">
                            <AlertCircle className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium text-rose-800 dark:text-rose-400">Rejected Requests</h3>
                            <p className="text-sm text-rose-700/80 dark:text-rose-300/80 mt-0.5">
                              These requests were not approved. Review the feedback and consider resubmitting if necessary.
                            </p>
                          </div>
                        </div>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableHead className="w-[40px]"></TableHead>
                            <TableHead className="w-[180px]">
                              <Button
                                variant="ghost"
                                onClick={() => handleSort("paymentReason")}
                                className="flex items-center gap-1 font-medium hover:bg-transparent"
                              >
                                Payment Reason
                                <ArrowUpDown
                                  className={`h-3 w-3 ${sortConfig.key === "paymentReason" ? "text-rose-500" : "opacity-40"
                                    }`}
                                />
                              </Button>
                            </TableHead>
                            <TableHead>
                              <Button
                                variant="ghost"
                                onClick={() => handleSort("amount")}
                                className="flex items-center gap-1 font-medium hover:bg-transparent"
                              >
                                Amount
                                <ArrowUpDown
                                  className={`h-3 w-3 ${sortConfig.key === "amount" ? "text-rose-500" : "opacity-40"}`}
                                />
                              </Button>
                            </TableHead>
                            <TableHead className="hidden md:table-cell">
                              <Button
                                variant="ghost"
                                onClick={() => handleSort("requestDate")}
                                className="flex items-center gap-1 font-medium hover:bg-transparent"
                              >
                                Request Date
                                <ArrowUpDown
                                  className={`h-3 w-3 ${sortConfig.key === "requestDate" ? "text-rose-500" : "opacity-40"
                                    }`}
                                />
                              </Button>
                            </TableHead>
                            <TableHead className="hidden lg:table-cell">Rejected Date</TableHead>
                            <TableHead>Rejection Reason</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rejectedItems.map((imprest) => (
                            <React.Fragment key={imprest._id}>
                              <TableRow className="group hover:bg-rose-50/30 dark:hover:bg-rose-950/10 transition-colors">
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full hover:bg-rose-100/50 dark:hover:bg-rose-900/20"
                                    onClick={() => toggleRowExpansion(imprest._id)}
                                  >
                                    <ChevronDown
                                      className={`h-4 w-4 transition-transform ${expandedRows[imprest._id] ? "rotate-180" : ""
                                        }`}
                                    />
                                  </Button>
                                </TableCell>
                                <TableCell className="font-medium">
                                  <div>
                                    <div className="font-medium truncate max-w-[180px]">{imprest.paymentReason}</div>
                                    <div className="text-xs text-muted-foreground">{imprest.paymentType}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <CreditCard className="mr-1 h-4 w-4 text-rose-500" />
                                    <span className="font-medium">
                                      {formatCurrency(imprest.amount, imprest.currency)}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  <div className="flex items-center">
                                    <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                                    <span>{formatDate(imprest.requestDate)}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                  {imprest.rejection && (
                                    <div className="flex items-center">
                                      <X className="mr-1 h-4 w-4 text-rose-500" />
                                      <span>{formatDate(imprest.rejection.rejectedAt)}</span>
                                    </div>
                                  )}
                                
                                </TableCell>
                                <TableCell>
                                  <div className="max-w-[200px] truncate text-sm text-rose-700 dark:text-rose-400">
                                    {imprest.rejection?.reason || "No reason provided"}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 opacity-20 group-hover:opacity-100 transition-opacity hover:bg-rose-100/50 dark:hover:bg-rose-900/20 hover:text-rose-700 dark:hover:text-rose-400 rounded-full"
                                      onClick={() => handleViewDetails(imprest)}
                                    >
                                      <Eye className="h-4 w-4" />
                                      <span className="sr-only">View Details</span>
                                    </Button>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 opacity-20 group-hover:opacity-100 transition-opacity hover:bg-muted rounded-full"
                                        >
                                          <MoreHorizontal className="h-4 w-4" />
                                          <span className="sr-only">More Options</span>
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem onClick={() => handleViewDetails(imprest)}>
                                          <Eye className="mr-2 h-4 w-4" />
                                          View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleExportSingle(imprest)}>
                                          <Download className="mr-2 h-4 w-4" />
                                          Export as PDF
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleResubmit(imprest)}>
                                          <RefreshCw className="mr-2 h-4 w-4" />
                                          Resubmit Request
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </TableCell>
                              </TableRow>

                              {expandedRows[imprest._id] && (
                                <TableRow>
                                  <TableCell colSpan={7} className="p-0 border-t-0">
                                    <div className="bg-rose-50/30 dark:bg-rose-950/10 p-4 border-t border-rose-200/30 dark:border-rose-800/30">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-background rounded-lg p-4 shadow-sm border border-border/50">
                                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                            <Info className="h-4 w-4 text-rose-500" />
                                            Explanation
                                          </h4>
                                          <p className="text-sm text-muted-foreground">{imprest.explanation}</p>
                                          {imprest.rejection && (
                                            <div className="text-sm mt-4">
                                              <div className="flex flex-col space-y-1">
                                           
                                              <div className="font-medium text-xs text-muted-foreground">Rejected At:</div>
                                              <p className="mt-1 bg-rose-50/50 dark:bg-rose-950/30 p-2 rounded-md border border-rose-200/50 dark:border-rose-800/30 text-rose-700 dark:text-rose-400">
                                                {formatDate(imprest.rejection.rejectedAt)}
                                              </p>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                        <div className="bg-background rounded-lg p-4 shadow-sm border border-border/50">
                                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4 text-rose-500" />
                                            Rejection Reason
                                          </h4>
                                          <div className="space-y-3">
                                            {imprest.hodApproval && (
                                              <div className="text-sm">
                                                <div className="font-medium text-xs text-muted-foreground">HOD Feedback:</div>
                                                <p className="mt-1 bg-rose-50/50 dark:bg-rose-950/30 p-2 rounded-md border border-rose-200/50 dark:border-rose-800/30 text-rose-700 dark:text-rose-400">
                                                  {imprest.hodApproval.comments || "No specific feedback provided"}
                                                </p>
                                              </div>
                                            )}
                                            {imprest.accountantApproval && (
                                              <div className="text-sm">
                                                <div className="font-medium text-xs text-muted-foreground">Accountant Feedback:</div>
                                                <p className="mt-1 bg-rose-50/50 dark:bg-rose-950/30 p-2 rounded-md border border-rose-200/50 dark:border-rose-800/30 text-rose-700 dark:text-rose-400">
                                                  {imprest.accountantApproval.comments || "No specific feedback provided"}
                                                </p>
                                              </div>
                                            )}
                                            {imprest.rejection && (
                                              <div className="text-sm space-y-2">
                                              <div className="flex flex-col space-y-1">

                                                <div className="font-medium text-xs text-muted-foreground">Rejection Reason:</div>
                                                <p className="mt-1 bg-rose-50/50 dark:bg-rose-950/30 p-2 rounded-md border border-rose-200/50 dark:border-rose-800/30 text-rose-700 dark:text-rose-400">
                                                  {imprest.rejection.reason}
                                                </p>
                                              </div>
                                              <div className="flex flex-col space-y-1">
                                              <div className="font-medium text-xs text-muted-foreground">Rejected By:</div>
                                              <p className="mt-1 bg-rose-50/50 dark:bg-rose-950/30 p-2 rounded-md border border-rose-200/50 dark:border-rose-800/30 text-rose-700 dark:text-rose-400">
                                                {imprest.rejection.rejectedBy.firstName} {imprest.rejection.rejectedBy.lastName} ({imprest.rejection.rejectedBy.email})
                                              </p>
                                              </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex justify-end mt-4">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="text-xs h-8 border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:hover:bg-rose-900/30 dark:text-rose-400"
                                          onClick={() => handleResubmit(imprest)}
                                        >
                                          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                                          Resubmit with Changes
                                        </Button>
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </React.Fragment>
                          ))}
                        </TableBody>
                      </Table>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-t gap-4">
                        <div className="text-sm text-muted-foreground">
                          Showing <span className="font-medium">{rejectedIndexOfFirstItem + 1}</span> to{" "}
                          <span className="font-medium">{Math.min(rejectedIndexOfLastItem, rejectedItems.length)}</span> of{" "}
                          <span className="font-medium">{rejectedItems.length}</span> rejected requests
                        </div>

                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() => setRejectedPage((prev) => Math.max(prev - 1, 1))}
                                isActive={rejectedPage === 1}
                                aria-disabled={rejectedPage === 1}
                                className={rejectedPage === 1 ? "pointer-events-none opacity-50" : ""}
                              />
                            </PaginationItem>

                            {Array.from({ length: Math.min(rejectedTotalPages, 5) }, (_, i) => {
                              const pageNumber = i + 1
                              return (
                                <PaginationItem key={pageNumber}>
                                  <PaginationLink
                                    onClick={() => setRejectedPage(pageNumber)}
                                    isActive={rejectedPage === pageNumber}
                                    className={
                                      rejectedPage === pageNumber
                                        ? "bg-rose-500 text-white hover:bg-rose-600 hover:text-white"
                                        : ""
                                    }
                                  >
                                    {pageNumber}
                                  </PaginationLink>
                                </PaginationItem>
                              )
                            })}

                            {rejectedTotalPages > 5 && (
                              <>
                                <PaginationItem>
                                  <PaginationEllipsis />
                                </PaginationItem>
                                <PaginationItem>
                                  <PaginationLink
                                    onClick={() => setRejectedPage(rejectedTotalPages)}
                                    isActive={rejectedPage === rejectedTotalPages}
                                    className={
                                      rejectedPage === rejectedTotalPages
                                        ? "bg-rose-500 text-white hover:bg-rose-600 hover:text-white"
                                        : ""
                                    }
                                  >
                                    {rejectedTotalPages}
                                  </PaginationLink>
                                </PaginationItem>
                              </>
                            )}

                            <PaginationItem>
                              <PaginationNext
                                onClick={() => setRejectedPage((prev) => Math.min(prev + 1, rejectedTotalPages))}
                                isActive={rejectedPage === rejectedTotalPages}
                                aria-disabled={rejectedPage === rejectedTotalPages}
                                className={rejectedPage === rejectedTotalPages ? "pointer-events-none opacity-50" : ""}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="h-16 w-16 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mb-4 border border-rose-200 dark:border-rose-800/50 shadow-sm text-rose-500">
                        <ThumbsUp className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-medium">No rejected requests</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        You don&apos;t have any rejected imprest applications. That&apos;s good news!
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4 border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:hover:bg-rose-900/30 dark:text-rose-400"
                        onClick={() => setIsNewImprestModalOpen(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Request
                      </Button>
                    </div>
                  )}
                </>
            </TabsContent>
          </Tabs>

        </CardContent>
      </Card>
      <NewImprestDrawer open={isNewImprestModalOpen} onOpenChange={setIsNewImprestModalOpen} onSubmit={handleCreateImprest} />

      {/* Detail View Dialog */}
      {selectedImprest && <ImprestDetailView imprest={selectedImprest} onClose={handleCloseDetails} />}
    </div>
  )
}
