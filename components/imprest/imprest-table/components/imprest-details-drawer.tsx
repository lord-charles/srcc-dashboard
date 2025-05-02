"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import type { Imprest, ImprestStatus } from "@/types/imprest"
import { FileText, CheckCircle, XCircle, AlertTriangle, Clock, Calendar, User, DollarSign, Send, ArrowLeft, Banknote, FileCheck, MoreHorizontal, Printer, Download, Copy, Loader2, Info, ReceiptIcon, Briefcase, Tag, MessageSquare, Building, HelpCircle, Landmark, ShieldCheck, History, BarChart3, FileSpreadsheet, FilePlus, CalendarClock, CircleDollarSign, ClipboardList, Coins, Settings, CreditCardIcon } from 'lucide-react'
import { approveImprestAccountant, approveImprestHOD, disburseImprest, rejectImprest, approveImprestAccounting } from "@/services/imprest.service"

interface ImprestDetailsDrawerProps {
  imprest: Imprest
  trigger: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
  onApprove?: (id: string, comments: string, type: "hod" | "accountant") => Promise<void>
  onReject?: (id: string, reason: string) => Promise<void>
  onDisburse?: (id: string, data: { amount: number; comments: string }) => Promise<void>
}

export function ImprestDetailsDrawer({
  imprest,
  trigger,
  open,
  onOpenChange,
  onClose,
  onApprove,
  onReject,
  onDisburse,
}: ImprestDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [comments, setComments] = useState("")
  const [reason, setReason] = useState("")
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [disbursementAmount, setDisbursementAmount] = useState(imprest.amount)
  const [disbursementComments, setDisbursementComments] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [isDisbursing, setIsDisbursing] = useState(false)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  // Calculate approval progress
  useEffect(() => {
    let progressValue = 0
    if (imprest.status === "pending_hod") progressValue = 20
    else if (imprest.status === "pending_accountant") progressValue = 40
    else if (imprest.status === "approved") progressValue = 70
    else if (imprest.status === "disbursed") progressValue = 80
    else if (imprest.status === "pending_accounting_approval") progressValue = 90
    else if (imprest.status === "accounted") progressValue = 100
    else if (imprest.status === "rejected") progressValue = 100
    else if (imprest.status === "overdue") progressValue = 100

    // Animate progress
    const timer = setTimeout(() => {
      setProgress(progressValue)
    }, 200)

    return () => clearTimeout(timer)
  }, [imprest.status])

  const formatCurrency = (amount: number, currency: string = "KES") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getStatusInfo = (status: ImprestStatus) => {
    switch (status) {
      case "pending_hod":
        return {
          label: "Pending HOD",
          color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30",
          icon: <Clock className="h-3.5 w-3.5 mr-1.5" />,
        }
      case "pending_accountant":
        return {
          label: "Pending Accountant",
          color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30",
          icon: <Clock className="h-3.5 w-3.5 mr-1.5" />,
        }
      case "pending_accounting_approval":
        return {
          label: "Pending Accounting Approval",
          color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30",
          icon: <Clock className="h-3.5 w-3.5 mr-1.5" />,
        }
      case "overdue":
        return {
          label: "Overdue",
          color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30",
          icon: <XCircle className="h-3.5 w-3.5 mr-1.5" />,
        }
      case "approved":
        return {
          label: "Approved",
          color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30",
          icon: <CheckCircle className="h-3.5 w-3.5 mr-1.5" />,
        }
      case "rejected":
        return {
          label: "Rejected",
          color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30",
          icon: <XCircle className="h-3.5 w-3.5 mr-1.5" />,
        }
      case "disbursed":
        return {
          label: "Disbursed",
          color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/30",
          icon: <Banknote className="h-3.5 w-3.5 mr-1.5" />,
        }
      case "accounted":
        return {
          label: "Accounted",
          color: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800/30",
          icon: <FileCheck className="h-3.5 w-3.5 mr-1.5" />,
        }
      case "overdue":
        return {
          label: "Overdue",
          color: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/30",
          icon: <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />,
        }
    }
  }

  const handleApproveHOD = async () => {
    if (!comments.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide approval comments",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      await approveImprestHOD(imprest._id, comments)
      toast({
        title: "Approval successful",
        description: "Imprest has been approved by HOD",
      })
      onClose()
    } catch (error: any) {
      toast({
        title: "Approval failed",
        description: error.message || "Failed to approve imprest",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      window.location.reload()
    }
  }

  const handleApproveAccountant = async () => {
    if (!comments.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide approval comments",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      await approveImprestAccountant(imprest._id, comments)
      toast({
        title: "Approval successful",
        description: "Imprest has been approved by Accountant",
      })
      onClose()
    } catch (error: any) {
      toast({
        title: "Approval failed",
        description: error.message || "Failed to approve imprest",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      window.location.reload()
    }
  }

  const handleApproveAccounting = async () => {
    if (!comments.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide approval comments",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      await approveImprestAccounting(imprest._id, comments)
      toast({
        title: "Accounting Approval successful",
        description: "Imprest accounting has been approved",
      })
      onClose()
    } catch (error: any) {
      toast({
        title: "Approval failed",
        description: error.message || "Failed to approve imprest accounting",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      window.location.reload()
    }
  }


  const handleRejectImprest = async () => {
    if (!reason.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      })
      return
    }

    try {
      setIsRejecting(true)
      await rejectImprest(imprest._id, reason)
      toast({
        title: "Rejection successful",
        description: "Imprest has been rejected",
      })
      onClose()
    } catch (error: any) {
      toast({
        title: "Rejection failed",
        description: error.message || "Failed to reject imprest",
        variant: "destructive",
      })
    } finally {
      setIsRejecting(false)
      setShowRejectForm(false)
      window.location.reload()

    }
  }

  const handleDisburseImprest = async () => {
    if (!disbursementComments.trim() || disbursementAmount <= 0 || disbursementAmount > imprest.amount) {
      toast({
        title: "Invalid disbursement",
        description: "Please check the amount and provide comments",
        variant: "destructive",
      })
      return
    }

    try {
      setIsDisbursing(true)
      await disburseImprest(imprest._id, {
        amount: disbursementAmount,
        comments: disbursementComments,
      })
      toast({
        title: "Disbursement successful",
        description: "Imprest has been disbursed successfully",
      })
      onClose()
    } catch (error: any) {
      toast({
        title: "Disbursement failed",
        description: error || "Failed to disburse imprest",
        variant: "destructive",
      })
    } finally {
      setIsDisbursing(false)
      window.location.reload()

    }
  }

  const statusInfo = getStatusInfo(imprest.status)

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className="h-[95vh]">
        <div className="mx-auto w-full max-w-7xl flex flex-col">
          {/* Header with status bar */}
          <div className="border-b">
            <div className="px-6 pt-5 pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-full bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Imprest Request</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-sm text-muted-foreground">
                        #{imprest._id.substring(imprest._id.length - 8)}
                      </p>
                      <span className="text-muted-foreground">•</span>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(imprest.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className={cn("flex items-center px-3 py-1.5", statusInfo.color)}>
                  {statusInfo.icon}
                  {statusInfo.label}
                </Badge>
              </div>

              <div className="mt-6">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Requested</span>
                  <span>HOD Approval</span>
                  <span>Finance Approval</span>
                  <span>Disbursed</span>
                  <span>Accounting Approval</span>
                  <span>Accounted</span>
                </div>
                <div className="relative">
                  <Progress value={progress} className="h-2" />
                  <div className="absolute top-0 left-0 right-0 flex justify-between -mt-1">
                    <div className={cn(
                      "h-4 w-4 rounded-full border-2 border-background",
                      progress >= 20 ? "bg-primary" : "bg-muted"
                    )} />
                    <div className={cn(
                      "h-4 w-4 rounded-full border-2 border-background",
                      progress >= 40 ? "bg-primary" : "bg-muted"
                    )} />
                    <div className={cn(
                      "h-4 w-4 rounded-full border-2 border-background",
                      progress >= 60 ? "bg-primary" : "bg-muted"
                    )} />
                    <div className={cn(
                      "h-4 w-4 rounded-full border-2 border-background",
                      progress >= 80 ? "bg-primary" : "bg-muted"
                    )} />

                    <div className={cn(
                      "h-4 w-4 rounded-full border-2 border-background",
                      progress >= 100 ? "bg-primary" : "bg-muted"
                    )} />
                  </div>
                </div>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="px-6 w-full">
              <TabsList className="mb-3 h-auto -space-x-px bg-background p-0 shadow-sm shadow-black/5 rtl:space-x-reverse">
                <TabsTrigger
                  value="overview"
                  className="relative overflow-hidden rounded-none border border-border px-4 py-2 hover:bg-muted/50 transition-colors after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
                >
                  <FileText
                    className="-ms-0.5 me-1.5 opacity-60"
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="approvals"
                  className="relative overflow-hidden rounded-none border border-border px-4 py-2 hover:bg-muted/50 transition-colors after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
                >
                  <CheckCircle
                    className="-ms-0.5 me-1.5 opacity-60"
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  Approvals
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  className="relative overflow-hidden rounded-none border border-border px-4 py-2 hover:bg-muted/50 transition-colors after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
                >
                  <FileText
                    className="-ms-0.5 me-1.5 opacity-60"
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  Documents
                </TabsTrigger>
                <TabsTrigger
                  value="accounting"
                  className="relative overflow-hidden rounded-none border border-border px-4 py-2 hover:bg-muted/50 transition-colors after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
                >
                  <ReceiptIcon
                    className="-ms-0.5 me-1.5 opacity-60"
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  Accounting
                </TabsTrigger>
                <TabsTrigger
                  value="actions"
                  className="relative overflow-hidden rounded-none border border-border px-4 py-2 hover:bg-muted/50 transition-colors after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
                  disabled={!["pending_hod", "pending_accountant", "approved", "pending_accounting_approval"].includes(imprest.status)}
                >
                  <Settings
                    className="-ms-0.5 me-1.5 opacity-60"
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  Actions
                </TabsTrigger>
              </TabsList>


              {/* Content area */}
              <ScrollArea className="flex-1 h-[60vh]">
                <div className="h-full px-0 py-6 overflow-y-auto">
                  <TabsContent value="overview" className="m-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Amount Card */}
                      <div className="md:col-span-2 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-5 border border-primary/20">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Total Amount</h3>
                            <p className="text-3xl font-bold mt-1">{formatCurrency(imprest.amount, imprest.currency)}</p>
                            <div className="flex items-center mt-2 text-sm text-muted-foreground">
                              <Tag className="h-3.5 w-3.5 mr-1.5" />
                              <span>{imprest.paymentType}</span>
                            </div>
                          </div>
                          <div className="p-2.5 bg-background rounded-full shadow-sm">
                            <DollarSign className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <Separator className="my-4 bg-primary/20" />
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                              <span className="text-sm text-muted-foreground">Request Date</span>
                            </div>
                            <span className="text-sm font-medium">{formatDate(imprest.requestDate)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <CalendarClock className="h-4 w-4 text-muted-foreground mr-2" />
                              <span className="text-sm text-muted-foreground">Due Date</span>
                            </div>
                            <span className="text-sm font-medium">{formatDate(imprest.dueDate)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <CreditCardIcon className="h-4 w-4 text-muted-foreground mr-2" />
                              <span className="text-sm text-muted-foreground">Payment Method</span>
                            </div>
                            <span className="text-sm font-medium capitalize">Bank Transfer</span>
                          </div>
                        </div>
                      </div>

                      {/* Employee Card */}
                      <div className="bg-card rounded-xl p-5 border shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <Avatar className="h-12 w-12 border">
                            <AvatarImage
                              src={`https://avatar.vercel.sh/${imprest.requestedBy.email}`}
                              alt={`${imprest.requestedBy.firstName} ${imprest.requestedBy.lastName}`}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(imprest.requestedBy.firstName, imprest.requestedBy.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">
                              {imprest.requestedBy.firstName} {imprest.requestedBy.lastName}
                            </h3>
                            <p className="text-sm text-muted-foreground">{imprest.requestedBy.email}</p>
                          </div>
                        </div>
                        <Separator className="my-4" />
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 text-muted-foreground mr-2" />
                            <span className="text-sm text-muted-foreground mr-2">Department:</span>
                            <span className="text-sm font-medium capitalize">{imprest.department}</span>
                          </div>
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 text-muted-foreground mr-2" />
                            <span className="text-sm text-muted-foreground mr-2">Position:</span>
                            <span className="text-sm font-medium">{imprest.requestedBy?.phoneNumber || "N/A"}</span>
                          </div>
                          <div className="flex items-center">
                            <ShieldCheck className="h-4 w-4 text-muted-foreground mr-2" />
                            <span className="text-sm text-muted-foreground mr-2">Employee ID:</span>
                            <span className="text-sm font-medium">{imprest.requestedBy.employeeId || "EMP-" + imprest._id.substring(imprest._id.length - 6)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Request Details */}
                      <div className="md:col-span-3 bg-card rounded-xl p-5 border shadow-sm">
                        <h3 className="font-medium mb-4 flex items-center">
                          <Info className="h-4 w-4 mr-2 text-primary" />
                          Request Details
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Payment Reason</h4>
                            <p className="bg-muted/30 p-3 rounded-md">{imprest.paymentReason}</p>
                          </div>

                          {imprest.explanation && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">Detailed Explanation</h4>
                              <p className="bg-muted/30 p-3 rounded-md">{imprest.explanation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="approvals" className="m-0 space-y-6">
                    {/* HOD Approval */}
                    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                      <div className="bg-muted/30 px-5 py-3 border-b">
                        <h3 className="font-medium flex items-center">
                          <User className="h-4 w-4 mr-2 text-primary" />
                          HOD Approval
                        </h3>
                      </div>
                      <div className="p-5">
                        {imprest.hodApproval ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border">
                                <AvatarImage
                                  src={`https://avatar.vercel.sh/${imprest.hodApproval.approvedBy?.email}`}
                                  alt={`${imprest.hodApproval.approvedBy?.firstName} ${imprest.hodApproval.approvedBy?.lastName}`}
                                />
                                <AvatarFallback className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                  {getInitials(
                                    imprest.hodApproval.approvedBy?.firstName || "H",
                                    imprest.hodApproval.approvedBy?.lastName || "D"
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center">
                                  <h4 className="font-medium">
                                    {imprest.hodApproval.approvedBy?.firstName} {imprest.hodApproval.approvedBy?.lastName}
                                  </h4>
                                  <Badge className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30">
                                    <CheckCircle className="h-3 w-3 mr-1" /> Approved
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{formatDate(imprest.hodApproval.approvedAt)}</p>
                              </div>
                            </div>
                            {imprest.hodApproval.comments && (
                              <div className="bg-muted/30 p-3 rounded-md">
                                <div className="flex items-start gap-2">
                                  <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                                  <div>
                                    <h5 className="text-sm font-medium mb-1">Comments</h5>
                                    <p className="text-sm">{imprest.hodApproval.comments}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : imprest.rejection && imprest.status === "rejected" ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border">
                                <AvatarImage
                                  src={`https://avatar.vercel.sh/${imprest.rejection.rejectedBy?.email}`}
                                  alt={`${imprest.rejection.rejectedBy?.firstName} ${imprest.rejection.rejectedBy?.lastName}`}
                                />
                                <AvatarFallback className="bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                  {getInitials(
                                    imprest.rejection.rejectedBy?.firstName || "R",
                                    imprest.rejection.rejectedBy?.lastName || "J"
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center">
                                  <h4 className="font-medium">
                                    {imprest.rejection.rejectedBy?.firstName} {imprest.rejection.rejectedBy?.lastName}
                                  </h4>
                                  <Badge className="ml-2 bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30">
                                    <XCircle className="h-3 w-3 mr-1" /> Rejected
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{formatDate(imprest.rejection.rejectedAt)}</p>
                              </div>
                            </div>
                            <div className="bg-red-50/50 dark:bg-red-900/10 p-3 rounded-md border border-red-100 dark:border-red-900/20">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                                <div>
                                  <h5 className="text-sm font-medium mb-1 text-red-700 dark:text-red-400">Rejection Reason</h5>
                                  <p className="text-sm text-red-600 dark:text-red-300">{imprest.rejection.reason}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center mb-3">
                              <Clock className="h-6 w-6 text-amber-500" />
                            </div>
                            <h4 className="font-medium mb-1">Awaiting HOD Approval</h4>
                            <p className="text-sm text-muted-foreground max-w-md">
                              This imprest request is currently pending approval from the Head of Department.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Accountant Approval */}
                    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                      <div className="bg-muted/30 px-5 py-3 border-b">
                        <h3 className="font-medium flex items-center">
                          <Landmark className="h-4 w-4 mr-2 text-primary" />
                          Finance Approval
                        </h3>
                      </div>
                      <div className="p-5">
                        {imprest.accountantApproval ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border">
                                <AvatarImage
                                  src={`https://avatar.vercel.sh/${imprest.accountantApproval.approvedBy?.email}`}
                                  alt={`${imprest.accountantApproval.approvedBy?.firstName} ${imprest.accountantApproval.approvedBy?.lastName}`}
                                />
                                <AvatarFallback className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                  {getInitials(
                                    imprest.accountantApproval.approvedBy?.firstName || "F",
                                    imprest.accountantApproval.approvedBy?.lastName || "A"
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center">
                                  <h4 className="font-medium">
                                    {imprest.accountantApproval.approvedBy?.firstName} {imprest.accountantApproval.approvedBy?.lastName}
                                  </h4>
                                  <Badge className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30">
                                    <CheckCircle className="h-3 w-3 mr-1" /> Approved
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{formatDate(imprest.accountantApproval.approvedAt)}</p>
                              </div>
                            </div>
                            {imprest.accountantApproval.comments && (
                              <div className="bg-muted/30 p-3 rounded-md">
                                <div className="flex items-start gap-2">
                                  <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                                  <div>
                                    <h5 className="text-sm font-medium mb-1">Comments</h5>
                                    <p className="text-sm">{imprest.accountantApproval.comments}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : imprest.status === "pending_accounting_approval" && !imprest.accountantApproval ? (
                          <div className="flex flex-col items-center justify-center py-8 text-center w-full">
                            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                              <Clock className="h-6 w-6 text-blue-500" />
                            </div>
                            <h4 className="font-medium mb-1">Awaiting Accounting Approval</h4>
                            <p className="text-sm text-muted-foreground max-w-md mb-4">
                              This imprest request is pending accounting approval by an accountant.
                            </p>
                            <div className="w-full max-w-md mx-auto">
                              <Textarea
                                placeholder="Enter approval comments"
                                value={comments}
                                onChange={e => setComments(e.target.value)}
                                className="mb-3"
                                rows={3}
                              />
                              <Button
                                onClick={handleApproveAccounting}
                                disabled={isSubmitting}
                                className="w-full"
                              >
                                {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                Approve Accounting
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                              <Clock className="h-6 w-6 text-blue-500" />
                            </div>
                            <h4 className="font-medium mb-1">
                              {!imprest.hodApproval && imprest.status !== "rejected"
                                ? "Awaiting HOD Approval First"
                                : "Awaiting Finance Approval"}
                            </h4>
                            <p className="text-sm text-muted-foreground max-w-md">
                              {!imprest.hodApproval && imprest.status !== "rejected"
                                ? "This request needs HOD approval before it can be reviewed by Finance."
                                : "This imprest request is currently pending approval from the Finance department."}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Disbursement Information (if applicable) */}
                    {imprest.disbursement && (
                      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                        <div className="bg-muted/30 px-5 py-3 border-b">
                          <h3 className="font-medium flex items-center">
                            <Banknote className="h-4 w-4 mr-2 text-primary" />
                            Disbursement Details
                          </h3>
                        </div>
                        <div className="p-5">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border">
                                <AvatarImage
                                  src={`https://avatar.vercel.sh/${imprest.disbursement.disbursedBy?.email}`}
                                  alt={`${imprest.disbursement.disbursedBy?.firstName} ${imprest.disbursement.disbursedBy?.lastName}`}
                                />
                                <AvatarFallback className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                  {getInitials(
                                    imprest.disbursement.disbursedBy?.firstName || "F",
                                    imprest.disbursement.disbursedBy?.lastName || "O"
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center">
                                  <h4 className="font-medium">
                                    {imprest.disbursement.disbursedBy?.firstName} {imprest.disbursement.disbursedBy?.lastName}
                                  </h4>
                                  <Badge className="ml-2 bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/30">
                                    <Banknote className="h-3 w-3 mr-1" /> Disbursed
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{formatDate(imprest.disbursement.disbursedAt)}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-3 rounded-md">
                              <div>
                                <h5 className="text-sm font-medium mb-1">Amount Disbursed</h5>
                                <p className="text-lg font-semibold">{formatCurrency(imprest.disbursement.amount, imprest.currency)}</p>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium mb-1">Payment Reference</h5>
                                <p className="font-mono text-sm">{`REF-${imprest._id.substring(imprest._id.length - 6)}`}</p>
                              </div>
                            </div>

                            {imprest.disbursement.comments && (
                              <div className="bg-muted/30 p-3 rounded-md">
                                <div className="flex items-start gap-2">
                                  <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                                  <div>
                                    <h5 className="text-sm font-medium mb-1">Disbursement Notes</h5>
                                    <p className="text-sm">{imprest.disbursement.comments}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="documents" className="m-0 space-y-6">
                    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                      <div className="bg-muted/30 px-5 py-3 border-b">
                        <h3 className="font-medium flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-primary" />
                          Supporting Documents
                        </h3>
                      </div>
                      <div className="p-5">
                        {imprest.attachments && imprest.attachments.length > 0 ? (
                          <div className="space-y-3">
                            {imprest.attachments.map((attachment, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-md group hover:bg-muted/50 transition-colors">
                                <div className="flex items-center">
                                  <div className="p-2 bg-primary/10 rounded mr-3">
                                    <FileText className="h-4 w-4 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{attachment.fileName}</p>
                                    <p className="text-xs text-muted-foreground">{formatDate(attachment.uploadedAt)}</p>
                                  </div>
                                </div>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                                        <a href={attachment.fileUrl} target="_blank" rel="noopener noreferrer">
                                          <Download className="h-4 w-4" />
                                        </a>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Download Document</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                              <FileText className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h4 className="font-medium mb-1">No Documents Attached</h4>
                            <p className="text-sm text-muted-foreground max-w-md">
                              There are no supporting documents attached to this imprest request.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="accounting" className="m-0 space-y-6">
                    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                      <div className="bg-muted/30 px-5 py-3 border-b">
                        <h3 className="font-medium flex items-center">
                          <ReceiptIcon className="h-4 w-4 mr-2 text-primary" />
                          Accountability Status
                        </h3>
                      </div>
                      <div className="p-5">
                        {imprest.accounting ? (
                          <div className="space-y-5">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border">
                                <AvatarImage
                                  src={`https://avatar.vercel.sh/${imprest.accounting.verifiedBy?.email}`}
                                  alt={`${imprest.accounting.verifiedBy?.firstName} ${imprest.accounting.verifiedBy?.lastName}`}
                                />
                                <AvatarFallback className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                  {getInitials(
                                    imprest.accounting.verifiedBy?.firstName || "V",
                                    imprest.accounting.verifiedBy?.lastName || "A"
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center">
                                  <h4 className="font-medium">
                                    {imprest.accounting.verifiedBy?.firstName} {imprest.accounting.verifiedBy?.lastName}
                                  </h4>
                                  <Badge className="ml-2 bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800/30">
                                    <FileCheck className="h-3 w-3 mr-1" /> Verified
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{formatDate(imprest.accounting.verifiedAt)}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="bg-muted/30 p-3 rounded-md">
                                <h5 className="text-sm font-medium mb-1 text-muted-foreground">Imprest Amount</h5>
                                <p className="text-lg font-semibold">{formatCurrency(imprest.amount, imprest.currency)}</p>
                              </div>
                              <div className="bg-muted/30 p-3 rounded-md">
                                <h5 className="text-sm font-medium mb-1 text-muted-foreground">Accounted Amount</h5>
                                <p className="text-lg font-semibold">{formatCurrency(imprest.accounting.totalAmount, imprest.currency)}</p>
                              </div>
                              <div className={cn(
                                "p-3 rounded-md",
                                imprest.accounting.balance === 0
                                  ? "bg-emerald-50/50 dark:bg-emerald-900/10"
                                  : imprest.accounting.balance > 0
                                    ? "bg-amber-50/50 dark:bg-amber-900/10"
                                    : "bg-red-50/50 dark:bg-red-900/10"
                              )}>
                                <h5 className="text-sm font-medium mb-1 text-muted-foreground">
                                  {imprest.accounting.balance === 0
                                    ? "Balance (Settled)"
                                    : imprest.accounting.balance > 0
                                      ? "Balance (To Return)"
                                      : "Balance (To Reimburse)"}
                                </h5>
                                <p className={cn(
                                  "text-lg font-semibold",
                                  imprest.accounting.balance === 0
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : imprest.accounting.balance > 0
                                      ? "text-amber-600 dark:text-amber-400"
                                      : "text-red-600 dark:text-red-400"
                                )}>
                                  {formatCurrency(Math.abs(imprest.accounting.balance), imprest.currency)}
                                </p>
                              </div>
                            </div>

                            {imprest.accounting.comments && (
                              <div className="bg-muted/30 p-3 rounded-md">
                                <div className="flex items-start gap-2">
                                  <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                                  <div>
                                    <h5 className="text-sm font-medium mb-1">Verification Comments</h5>
                                    <p className="text-sm">{imprest.accounting.comments}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div>
                              <h4 className="text-sm font-medium mb-3">Receipt Details</h4>
                              {imprest.accounting.receipts.length > 0 ? (
                                <div className="space-y-3">
                                  {imprest.accounting.receipts.map((receipt, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-md group hover:bg-muted/50 transition-colors">
                                      <div className="flex items-center flex-1">
                                        <div className="p-2 bg-primary/10 rounded mr-3">
                                          <ReceiptIcon className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                          <p className="font-medium text-sm">{receipt.description}</p>
                                          <p className="text-xs text-muted-foreground">{formatDate(receipt.uploadedAt)}</p>
                                        </div>
                                        <p className="font-semibold">{formatCurrency(receipt.amount, imprest.currency)}</p>
                                      </div>
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                                              <a href={receipt.receiptUrl} target="_blank" rel="noopener noreferrer">
                                                <Download className="h-4 w-4" />
                                              </a>
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>View Receipt</TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex items-center justify-center p-6 border border-dashed rounded-md border-muted">
                                  <p className="text-muted-foreground">No receipts available</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : imprest.status === "disbursed" ? (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center mb-3">
                              <ClipboardList className="h-6 w-6 text-amber-500" />
                            </div>
                            <h4 className="font-medium mb-1">Pending Accountability</h4>
                            <p className="text-sm text-muted-foreground max-w-md">
                              This imprest has been disbursed but not yet accounted for. The employee needs to submit receipts and accounting details.
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                              <Clock className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h4 className="font-medium mb-1">Not Yet Applicable</h4>
                            <p className="text-sm text-muted-foreground max-w-md">
                              Accountability information will be available after the imprest has been disbursed and accounted for.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="actions" className="m-0">
                    <AnimatePresence>
                      {imprest.status === "pending_hod" && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                            <div className="bg-muted/30 px-5 py-3 border-b">
                              <h3 className="font-medium flex items-center">
                                <User className="h-4 w-4 mr-2 text-primary" />
                                HOD Approval Action
                              </h3>
                            </div>
                            <div className="p-5">
                              {!showRejectForm ? (
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="hod-comments">Approval Comments</Label>
                                    <Textarea
                                      id="hod-comments"
                                      placeholder="Enter your comments for this approval..."
                                      value={comments}
                                      onChange={(e) => setComments(e.target.value)}
                                      className="mt-1.5 min-h-[120px]"
                                    />
                                  </div>
                                  <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                      onClick={handleApproveHOD}
                                      disabled={isSubmitting}
                                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                    >
                                      {isSubmitting ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Processing...
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle className="mr-2 h-4 w-4" />
                                          Approve Request
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => setShowRejectForm(true)}
                                      disabled={isSubmitting}
                                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Reject Request
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                                    <div>
                                      <h4 className="font-medium text-red-700 mb-1">Reject Imprest Request</h4>
                                      <p className="text-sm text-red-600">
                                        Please provide a reason for rejecting this imprest request. This information will be shared with the requester.
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <Label htmlFor="rejection-reason" className="text-red-700">Rejection Reason</Label>
                                    <Textarea
                                      id="rejection-reason"
                                      placeholder="Please provide a detailed reason for rejection..."
                                      value={reason}
                                      onChange={(e) => setReason(e.target.value)}
                                      className="mt-1.5 min-h-[120px] border-red-200 focus-visible:ring-red-400"
                                    />
                                  </div>
                                  <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                      variant="destructive"
                                      onClick={handleRejectImprest}
                                      disabled={isRejecting || !reason.trim()}
                                      className="flex-1"
                                    >
                                      {isRejecting ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Processing...
                                        </>
                                      ) : (
                                        <>
                                          <XCircle className="mr-2 h-4 w-4" />
                                          Confirm Rejection
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => setShowRejectForm(false)}
                                      disabled={isRejecting}
                                      className="flex-1"
                                    >
                                      <ArrowLeft className="mr-2 h-4 w-4" />
                                      Back to Approval
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {imprest.status === "pending_accountant" && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                            <div className="bg-muted/30 px-5 py-3 border-b">
                              <h3 className="font-medium flex items-center">
                                <Landmark className="h-4 w-4 mr-2 text-primary" />
                                Finance Approval Action
                              </h3>
                            </div>
                            <div className="p-5">
                              {!showRejectForm ? (
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="accountant-comments">Approval Comments</Label>
                                    <Textarea
                                      id="accountant-comments"
                                      placeholder="Enter your comments for this approval..."
                                      value={comments}
                                      onChange={(e) => setComments(e.target.value)}
                                      className="mt-1.5 min-h-[120px]"
                                    />
                                  </div>
                                  <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                      onClick={handleApproveAccountant}
                                      disabled={isSubmitting}
                                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                    >
                                      {isSubmitting ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Processing...
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle className="mr-2 h-4 w-4" />
                                          Approve Request
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => setShowRejectForm(true)}
                                      disabled={isSubmitting}
                                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Reject Request
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                                    <div>
                                      <h4 className="font-medium text-red-700 mb-1">Reject Imprest Request</h4>
                                      <p className="text-sm text-red-600">
                                        Please provide a reason for rejecting this imprest request. This information will be shared with the requester.
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <Label htmlFor="rejection-reason" className="text-red-700">Rejection Reason</Label>
                                    <Textarea
                                      id="rejection-reason"
                                      placeholder="Please provide a detailed reason for rejection..."
                                      value={reason}
                                      onChange={(e) => setReason(e.target.value)}
                                      className="mt-1.5 min-h-[120px] border-red-200 focus-visible:ring-red-400"
                                    />
                                  </div>
                                  <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                      variant="destructive"
                                      onClick={handleRejectImprest}
                                      disabled={isRejecting || !reason.trim()}
                                      className="flex-1"
                                    >
                                      {isRejecting ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Processing...
                                        </>
                                      ) : (
                                        <>
                                          <XCircle className="mr-2 h-4 w-4" />
                                          Confirm Rejection
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => setShowRejectForm(false)}
                                      disabled={isRejecting}
                                      className="flex-1"
                                    >
                                      <ArrowLeft className="mr-2 h-4 w-4" />
                                      Back to Approval
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {imprest.status === "pending_accounting_approval" && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                            <div className="bg-muted/30 px-5 py-3 border-b">
                              <h3 className="font-medium flex items-center">
                                <FileCheck className="h-4 w-4 mr-2 text-primary" />
                                Accounting Approval Action
                              </h3>
                            </div>
                            <div className="p-5">
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="accounting-comments">Approval Comments</Label>
                                  <Textarea
                                    id="accounting-comments"
                                    placeholder="Enter your comments for this accounting approval..."
                                    value={comments}
                                    onChange={e => setComments(e.target.value)}
                                    className="mt-1.5 min-h-[120px]"
                                    disabled={isSubmitting}
                                  />
                                </div>
                                <Button
                                  onClick={async () => {
                                    if (!comments.trim()) {
                                      toast({
                                        title: "Missing information",
                                        description: "Please provide approval comments",
                                        variant: "destructive",
                                      });
                                      return;
                                    }
                                    try {
                                      setIsSubmitting(true);
                                      await approveImprestAccounting(imprest._id, comments);
                                      toast({
                                        title: "Approval successful",
                                        description: "Imprest accounting has been approved",
                                      });
                                      onClose();
                                    } catch (error: any) {
                                      toast({
                                        title: "Approval failed",
                                        description: error.message || "Failed to approve accounting",
                                        variant: "destructive",
                                      });
                                    } finally {
                                      setIsSubmitting(false);
                                      window.location.reload();
                                    }
                                  }}
                                  disabled={isSubmitting}
                                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                  {isSubmitting ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Approve Accounting
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {imprest.status === "approved" && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                            <div className="bg-muted/30 px-5 py-3 border-b">
                              <h3 className="font-medium flex items-center">
                                <Banknote className="h-4 w-4 mr-2 text-primary" />
                                Disburse Funds
                              </h3>
                            </div>
                            <div className="p-5">
                              <div className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start gap-3">
                                  <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                                  <div>
                                    <h4 className="font-medium text-blue-700 mb-1">Ready for Disbursement</h4>
                                    <p className="text-sm text-blue-600">
                                      This imprest request has been approved and is ready for funds disbursement.
                                    </p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="disbursement-amount">Disbursement Amount</Label>
                                    <div className="relative mt-1.5">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                        {imprest.currency}
                                      </span>
                                      <Input
                                        id="disbursement-amount"
                                        type="number"
                                        value={disbursementAmount}
                                        onChange={(e) => setDisbursementAmount(Number(e.target.value))}
                                        className="pl-12"
                                        step="0.01"
                                        min="0"
                                        max={imprest.amount}
                                      />
                                    </div>
                                    {disbursementAmount !== imprest.amount && (
                                      <p className="text-xs text-amber-600 mt-1.5 flex items-center">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        Disbursing {formatCurrency(disbursementAmount, imprest.currency)} of {formatCurrency(imprest.amount, imprest.currency)}
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    <Label htmlFor="payment-method">Payment Method</Label>
                                    <select
                                      id="payment-method"
                                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 mt-1.5"
                                      defaultValue="bank_transfer"
                                    >
                                      <option value="bank_transfer">Bank Transfer</option>
                                      <option value="cash">Cash</option>
                                      <option value="mobile_money">Mobile Money</option>
                                      <option value="check">Check</option>
                                    </select>
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor="disbursement-comments">Disbursement Notes</Label>
                                  <Textarea
                                    id="disbursement-comments"
                                    placeholder="Enter any notes about this disbursement..."
                                    value={disbursementComments}
                                    onChange={(e) => setDisbursementComments(e.target.value)}
                                    className="mt-1.5 min-h-[120px]"
                                  />
                                </div>
                                <Button
                                  onClick={handleDisburseImprest}
                                  disabled={isDisbursing || !disbursementComments.trim() || disbursementAmount <= 0 || disbursementAmount > imprest.amount}
                                  className="w-full bg-primary hover:bg-primary/90"
                                >
                                  {isDisbursing ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Processing Disbursement...
                                    </>
                                  ) : (
                                    <>
                                      <Send className="mr-2 h-4 w-4" />
                                      Disburse Funds
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </TabsContent>
                </div>
              </ScrollArea>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="border-t p-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Last updated: {formatDate(imprest.updatedAt)}
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem className="flex items-center">
                      <Printer className="h-4 w-4 mr-2" />
                      Print Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center">
                      <Download className="h-4 w-4 mr-2" />
                      Export as PDF
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex items-center">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy ID
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipProvider>

              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
