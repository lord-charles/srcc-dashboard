"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import type { Contract, Amendment } from "@/types/contract"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { createClaim, fetchClaimsByContract } from "@/services/contracts.service"
import {
  AlertCircle,
  FileText,
  DollarSign,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  AlertTriangle,
  FileSignature,
  ClipboardList,
  FileEdit,
  Briefcase,
  Calendar,
  Receipt,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { ProjectMilestone } from "@/types/project"

interface MyContractDetailsDrawerProps {
  contract: Contract
  onClose?: () => void
  onGenerateOtp?: (contractId: string) => void
  otpGenerating?: boolean
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface MilestoneData {
  amount: number;
  percentage: number;
}

const formatCurrency = (amount: number, currency = "KES") => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

const statusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "pending_acceptance":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    case "expired":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }
}

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "MMM d, yyyy HH:mm")
  } catch (error) {
    return "Invalid Date"
  }
}

const getStatusBadgeColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "approved":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    case "paid":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    case "cancelled":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    default:
      return status.includes("pending") 
        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
        : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }
}

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "approved":
      return <CheckCircle2 className="h-4 w-4" />
    case "rejected":
      return <XCircle className="h-4 w-4" />
    case "paid":
      return <Receipt className="h-4 w-4" />
    case "cancelled":
      return <AlertTriangle className="h-4 w-4" />
    default:
      return status.includes("pending") 
        ? <Clock className="h-4 w-4" />
        : <AlertCircle className="h-4 w-4" />
  }
}

export function MyContractDetailsDrawer({
  contract,
  onClose,
  onGenerateOtp,
  otpGenerating,
  trigger,
  open,
  onOpenChange,
}: MyContractDetailsDrawerProps) {
  const [selectedMilestones, setSelectedMilestones] = useState<Record<string, MilestoneData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [claimsHistory, setClaimsHistory] = useState<any[]>([])
  const [isLoadingClaims, setIsLoadingClaims] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open && contract._id) {
      loadClaimsHistory()
    }
  }, [open, contract._id])

  const loadClaimsHistory = async () => {
    try {
      setIsLoadingClaims(true)
      const claims = await fetchClaimsByContract(contract._id)
      setClaimsHistory(claims)
    } catch (error: any) {
      toast({
        title: "Failed to Load Claims",
        description: error.message || "Could not load claims history",
        variant: "destructive",
      })
    } finally {
      setIsLoadingClaims(false)
    }
  }

  const calculateMaxClaimAmount = () => {
    const maxPerMilestone = contract.contractValue / contract.projectId.milestones.length
    return maxPerMilestone
  }

  const handleMilestoneAmountChange = (milestoneId: string, value: string) => {
    const amount = Math.max(0, Number(value) || 0);
    const maxAmount = calculateMaxClaimAmount();
    const percentage = Math.min(100, (amount / maxAmount) * 100);

    setSelectedMilestones(prev => ({
      ...prev,
      [milestoneId]: { amount, percentage }
    }));
  };

  const calculateTotalClaimAmount = () => {
    return Object.values(selectedMilestones).reduce((total, { amount }) => total + amount, 0);
  };

  const handleSubmitClaim = async () => {
    const totalAmount = calculateTotalClaimAmount()
    if (totalAmount <= 0) {
      toast({
        title: "Invalid Claim Amount",
        description: "Please select at least one milestone to claim",
        variant: "destructive",
      })
      return
    }

    const milestones = Object.entries(selectedMilestones)
      .filter(([_, { amount }]) => amount > 0)
      .map(([milestoneId, { percentage }]) => {
        const milestone = contract.projectId.milestones.find((m) => m._id === milestoneId)
        return {
          milestoneId,
          title: milestone?.title || "",
          percentageClaimed: percentage
        }
      })

    try {
      setIsSubmitting(true)
      await createClaim({
        projectId: contract.projectId._id,
        contractId: contract._id,
        amount: totalAmount,
        currency: contract.currency,
        milestones,
      })

      toast({
        title: "Claim Submitted",
        description: "Your claim has been submitted successfully",
      })

      setSelectedMilestones({})
      onClose?.()
    } catch (error: any) {
      toast({
        title: "Failed to Submit Claim",
        description: error.message || "An error occurred while submitting your claim",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isActiveMilestone = (milestone: ProjectMilestone) => {
    const milestoneDate = new Date(milestone.dueDate)
    const now = new Date()

    return milestone.completed
  }

 


  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            View Details
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent className="h-[95vh] max-h-[95vh]">
        <div className="mx-auto w-full max-w-5xl h-full flex flex-col">
          <DrawerHeader className="flex-none border-b pb-4">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-2xl font-bold flex items-center">
                <FileText className="mr-3 h-6 w-6 text-primary" />
                Contract Details
              </DrawerTitle>
              <Badge variant="outline" className={cn("border px-3 py-1", statusColor(contract.status))}>
                {contract.status}
              </Badge>
            </div>
            <DrawerDescription className="mt-2">
              {contract.contractNumber} • {contract.description}
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="details" className="h-full flex flex-col">
              <div className="border-b px-6">
                <TabsList className="h-14 w-full justify-start gap-2 bg-transparent">
                  <TabsTrigger
                    value="details"
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3 h-full"
                  >
                    <FileSignature className="h-4 w-4 mr-2" />
                    Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="contractor"
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3 h-full"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Contractor
                  </TabsTrigger>
                  <TabsTrigger
                    value="amendments"
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3 h-full"
                  >
                    <FileEdit className="h-4 w-4 mr-2" />
                    Amendments
                  </TabsTrigger>
                  <TabsTrigger
                    value="approvals"
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3 h-full"
                  >
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Approvals
                  </TabsTrigger>
                  {contract.status.toLowerCase() === "active" && (
                    <>
                      <TabsTrigger
                        value="claims"
                        className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3 h-full"
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Claims
                      </TabsTrigger>
                      <TabsTrigger
                        value="claims_history"
                        className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3 h-full"
                      >
                        <Receipt className="h-4 w-4 mr-2" />
                        Claims History
                      </TabsTrigger>
                    </>
                  )}
                </TabsList>
              </div>

              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-[calc(95vh-13rem)] w-full">
                  <div className="px-6 py-6">
                    <TabsContent value="details" className="mt-0 space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-xl flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-primary" />
                            Project Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Project Name</label>
                              <p className="text-lg font-semibold">{contract.projectId.name}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Contract Value</label>
                              <p className="text-lg font-semibold text-primary">
                                {formatCurrency(contract.contractValue, contract.currency)}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                              <p className="text-base">{format(new Date(contract.startDate), "MMM d, yyyy")}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">End Date</label>
                              <p className="text-base">{format(new Date(contract.endDate), "MMM d, yyyy")}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-xl flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Contract Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableBody>
                              <TableRow>
                                <TableCell className="font-medium">Contract Number</TableCell>
                                <TableCell>{contract.contractNumber}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">Description</TableCell>
                                <TableCell>{contract.description}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">Created At</TableCell>
                                <TableCell>{formatDate(contract?.createdAt)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">Last Updated</TableCell>
                                <TableCell>{formatDate(contract?.updatedAt)}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>

                      {contract.status.toLowerCase() === "pending_acceptance" && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                              <AlertCircle className="h-5 w-5 text-primary" />
                              Contract Acceptance
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Alert className="mb-4">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                Accepting the contract will make it active and legally binding.
                              </AlertDescription>
                            </Alert>
                            <Button
                              className="w-full"
                              onClick={() => onGenerateOtp?.(contract._id)}
                              disabled={otpGenerating}
                            >
                              {otpGenerating ? (
                                <>
                                  <Spinner className="mr-2 h-4 w-4" />
                                  Generating OTP...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Accept Contract
                                </>
                              )}
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    <TabsContent value="contractor" className="mt-0 space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-xl flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            Contractor Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center space-x-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-semibold text-primary">
                              {contract.contractedUserId.firstName[0]}
                              {contract.contractedUserId.lastName[0]}
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold">
                                {`${contract.contractedUserId.firstName} ${contract.contractedUserId.lastName}`}
                              </h3>
                              <p className="text-sm text-muted-foreground">Contractor</p>
                            </div>
                          </div>
                          <Separator className="my-4" />
                          <div className="space-y-4">
                            <div className="flex items-center">
                              <Mail className="w-5 h-5 mr-2 text-muted-foreground" />
                              <span>{contract.contractedUserId.email}</span>
                            </div>
                            <div className="flex items-center">
                              <Phone className="w-5 h-5 mr-2 text-muted-foreground" />
                              <span>{contract.contractedUserId.phoneNumber}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="amendments" className="mt-0 space-y-6">
                        <Card className="overflow-hidden border shadow-sm">
                          <div className="bg-amber-50 dark:bg-amber-950/40 px-6 py-4 flex items-center">
                            <FileEdit className="h-5 w-5 mr-2 text-amber-600 dark:text-amber-400" />
                            <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-400">Amendments</h3>
                          </div>
                          <CardContent className="p-6">
                            <div className="space-y-5">
                              {contract?.amendments?.map((amendment: Amendment, index) => (
                                <div
                                  key={amendment._id || index}
                                  className={cn(
                                    "pb-5",
                                    index !== (contract?.amendments?.length || 2) - 1 && "border-b"
                                  )}
                                >
                                  <div className="flex items-center mb-3">
                                    <div className="bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold mr-2">
                                      {index + 1}
                                    </div>
                                    <h4 className="font-medium">Amendment {index + 1}</h4>
                                  </div>
                                  <p className="text-sm mt-1">
                                    {amendment.description || "No description"}
                                  </p>
                                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                                    {amendment.date && (
                                      <div className="flex items-center">
                                        <Calendar className="h-3.5 w-3.5 mr-1" />
                                        {formatDate(amendment.date)}
                                      </div>
                                    )}
                                    {amendment.changedFields &&
                                      amendment.changedFields.length > 0 && (
                                        <div className="flex items-start">
                                          <span className="mr-1">Changed:</span>
                                          <span className="font-medium">
                                            {amendment.changedFields.join(", ")}
                                          </span>
                                        </div>
                                      )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                    <TabsContent value="approvals" className="mt-0 space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-xl flex items-center gap-2">
                            <ClipboardList className="h-5 w-5 text-primary" />
                            Approval Flow
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {contract.approvalFlow ? (
                            <div className="space-y-6">
                              <div>
                                <h4 className="font-semibold mb-2">Finance Approvals</h4>
                                {contract?.approvalFlow?.financeApprovals&&contract?.approvalFlow?.financeApprovals.length === 0 ? (
                                  <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>No finance approvals yet.</AlertDescription>
                                  </Alert>
                                ) : (
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Comment</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {contract.approvalFlow.financeApprovals&& contract.approvalFlow.financeApprovals.map((approval, index) => (
                                        <TableRow key={index}>
                                          <TableCell>{approval.comments}</TableCell>
                                          <TableCell>
                                            {approval.approvedAt ? (
                                              <span className="flex items-center text-green-600">
                                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                                Approved
                                              </span>
                                            ) : (
                                              <span className="flex items-center text-red-600">
                                                <XCircle className="h-4 w-4 mr-1" />
                                                Rejected
                                              </span>
                                            )}
                                          </TableCell>
                                          <TableCell>{formatDate(approval.approvedAt)}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                )}
                              </div>

                              <Separator />

                              <div>
                                <h4 className="font-semibold mb-2">MD Approvals</h4>
                                {contract?.approvalFlow?.mdApprovals && contract?.approvalFlow?.mdApprovals.length === 0 ? (
                                  <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>No MD approvals yet.</AlertDescription>
                                  </Alert>
                                ) : (
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Comments</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {contract?.approvalFlow?.mdApprovals && contract?.approvalFlow?.mdApprovals.map((approval, index) => (
                                        <TableRow key={index}>
                                          <TableCell>{approval.comments}</TableCell>
                                          <TableCell>
                                            {approval.approvedAt ? (
                                              <span className="flex items-center text-green-600">
                                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                                Approved
                                              </span>
                                            ) : (
                                              <span className="flex items-center text-red-600">
                                                <XCircle className="h-4 w-4 mr-1" />
                                                Rejected
                                              </span>
                                            )}
                                          </TableCell>
                                          <TableCell>{formatDate(approval.approvedAt)}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                )}
                              </div>

                              {/* {contract.approvalFlow.finalApproval && (
                                <>
                                  <Separator />
                                  <div>
                                    <h4 className="font-semibold mb-2">Final Approval</h4>
                                    <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg">
                                      <div className="flex items-center gap-2">
                                        {contract.approvalFlow.finalApproval.approved ? (
                                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        ) : (
                                          <XCircle className="h-5 w-5 text-red-600" />
                                        )}
                                        <span>{contract.approvalFlow.finalApproval.approverName}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">
                                          {formatDate(contract.approvalFlow.finalApproval.date)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )} */}
                            </div>
                          ) : (
                            <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>No approval flow information available.</AlertDescription>
                            </Alert>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {contract.status.toLowerCase() === "active" && (
                      <>
                        <TabsContent value="claims" className="mt-0 space-y-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-xl flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-primary" />
                                Submit New Claim
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <Card className="bg-primary/5 border-none">
                                    <CardContent className="pt-6">
                                      <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="h-4 w-4 text-primary" />
                                        <h4 className="font-medium">Maximum Per Milestone</h4>
                                      </div>
                                      <p className="text-2xl font-bold text-primary">
                                        {formatCurrency(calculateMaxClaimAmount(), contract.currency)}
                                      </p>
                                    </CardContent>
                                  </Card>
                                  <Card className="bg-primary/5 border-none">
                                    <CardContent className="pt-6">
                                      <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle className="h-4 w-4 text-primary" />
                                        <h4 className="font-medium">Total Available</h4>
                                      </div>
                                      <p className="text-2xl font-bold text-primary">
                                        {formatCurrency(contract.contractValue, contract.currency)}
                                      </p>
                                    </CardContent>
                                  </Card>
                                </div>

                                <div className="space-y-4">
                                  {contract.projectId.milestones.map((milestone) => {
                                    const isActive = milestone.completed
                                    const milestoneData = selectedMilestones[milestone._id] || { amount: 0, percentage: 0 };
                                    
                                    return (
                                      <div key={milestone._id} className="bg-card border rounded-lg overflow-hidden">
                                        <div className="border-b bg-muted/30 p-4">
                                          <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                              <h4 className="font-medium">{milestone.title}</h4>
                                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span>Due: {format(new Date(milestone.dueDate), "MMM d, yyyy")}</span>
                                              </div>
                                            </div>
                                            {isActive && (
                                              <Badge variant="outline" className={cn(
                                                milestone.completed ? "border-green-200 bg-green-100 text-green-800" : "border-yellow-200 bg-yellow-100 text-yellow-800"
                                              )}>
                                                {milestone.completed ? "Completed" : "Not Active"}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                        <div className="p-4 space-y-4">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                              <label className="text-sm font-medium">Claim Amount</label>
                                              <div className="relative">
                                                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                  type="number"
                                                  min="0"
                                                  max={calculateMaxClaimAmount()}
                                                  placeholder="Enter amount"
                                                  value={milestoneData.amount || ""}
                                                  onChange={(e) => handleMilestoneAmountChange(milestone._id, e.target.value)}
                                                  disabled={!milestone.completed}
                                                  className="pl-9"
                                                />
                                              </div>
                                            </div>
                                            <div className="space-y-2">
                                              <label className="text-sm font-medium">Percentage</label>
                                              <div className="h-10 bg-muted/50 rounded-md flex items-center px-3">
                                                <span className="text-muted-foreground">{milestoneData.percentage.toFixed(1)}%</span>
                                              </div>
                                            </div>
                                          </div>
                                          <Progress 
                                            value={milestoneData.percentage} 
                                            className={cn(
                                              "h-2",
                                              milestoneData.percentage > 0 && "bg-primary/20"
                                            )}
                                          />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                <Card className="bg-muted/30 border-none">
                                  <CardContent className="pt-6">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                      <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Total Claim Amount</p>
                                        <p className="text-3xl font-bold text-primary">
                                          {formatCurrency(calculateTotalClaimAmount(), contract.currency)}
                                        </p>
                                      </div>
                                      <Button
                                        onClick={handleSubmitClaim}
                                        disabled={isSubmitting || calculateTotalClaimAmount() <= 0}
                                        size="lg"
                                        className="w-full md:w-auto"
                                      >
                                        {isSubmitting ? (
                                          <>
                                            <Spinner className="mr-2 h-4 w-4" />
                                            Submitting...
                                          </>
                                        ) : (
                                          <>
                                            <DollarSign className="mr-2 h-4 w-4" />
                                            Submit Claim
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                        <TabsContent value="claims_history" className="mt-0 space-y-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-xl flex items-center gap-2">
                                <Receipt className="h-5 w-5 text-primary" />
                                Claims History
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              {isLoadingClaims ? (
                                <div className="flex items-center justify-center py-8">
                                  <Spinner className="h-8 w-8" />
                                </div>
                              ) : claimsHistory.length === 0 ? (
                                <Alert>
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertDescription>No claims found for this contract.</AlertDescription>
                                </Alert>
                              ) : (
                                <div className="space-y-4">
                                  {claimsHistory.map((claim) => (
                                    <Card key={claim._id} className="bg-muted/30">
                                      <CardContent className="pt-6">
                                        <div className="flex flex-col md:flex-row justify-between gap-4">
                                          <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                              <Badge className={cn(
                                                "capitalize flex items-center gap-1.5",
                                                getStatusBadgeColor(claim.status)
                                              )}>
                                                {getStatusIcon(claim.status)}
                                                {claim.status.replace(/_/g, " ")}
                                              </Badge>
                                              <span className="text-sm text-muted-foreground">
                                                {formatDate(claim.createdAt)}
                                              </span>
                                            </div>
                                            <p className="text-2xl font-bold">
                                              {formatCurrency(claim.amount, claim.currency)}
                                            </p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                              <User className="h-3.5 w-3.5" />
                                              <span>
                                                {claim.claimantId.firstName} {claim.claimantId.lastName}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="space-y-2">
                                            <h4 className="text-sm font-medium text-muted-foreground">Milestones Claimed</h4>
                                            <div className="flex flex-wrap gap-2">
                                              {claim.milestones.map((milestone: any) => (
                                                <Badge 
                                                  key={milestone.milestoneId} 
                                                  variant="outline" 
                                                  className="text-xs flex items-center gap-1"
                                                >
                                                  <Calendar className="h-3 w-3" />
                                                  {milestone.title} ({milestone.percentageClaimed}%)
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                        {claim.status === "rejected" && claim.rejection && (
                                          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                                            <div className="flex items-start gap-2 text-red-700 dark:text-red-300">
                                              <AlertCircle className="h-5 w-5 mt-0.5" />
                                              <div>
                                                <p className="font-medium">Rejection Details</p>
                                                <p className="text-sm mt-1">{claim.rejection.reason}</p>
                                                <div className="mt-2 text-xs flex items-center gap-2">
                                                  <User className="h-3.5 w-3.5" />
                                                  <span>Rejected by: {claim.rejection.rejectedBy.firstName} {claim.rejection.rejectedBy.lastName}</span>
                                                  <span>•</span>
                                                  <span>{formatDate(claim.rejection.rejectedAt)}</span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                        {claim.status === "paid" && claim.payment && (
                                          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                                            <div className="flex items-start gap-2 text-blue-700 dark:text-blue-300">
                                              <Receipt className="h-5 w-5 mt-0.5" />
                                              <div>
                                                <p className="font-medium">Payment Details</p>
                                                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mt-2">
                                                  <div className="flex items-center gap-2">
                                                    <DollarSign className="h-3.5 w-3.5" />
                                                    <span>Method: {claim.payment.paymentMethod}</span>
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                    <FileText className="h-3.5 w-3.5" />
                                                    <span>Transaction ID: {claim.payment.transactionId}</span>
                                                  </div>
                                                  {claim.payment.reference && (
                                                    <div className="flex items-center gap-2">
                                                      <FileSignature className="h-3.5 w-3.5" />
                                                      <span>Reference: {claim.payment.reference}</span>
                                                    </div>
                                                  )}
                                                </div>
                                                <div className="mt-2 text-xs flex items-center gap-2">
                                                  <User className="h-3.5 w-3.5" />
                                                  <span>Processed by: {claim.payment.paidBy.firstName} {claim.payment.paidBy.lastName}</span>
                                                  <span>•</span>
                                                  <span>{formatDate(claim.payment.paidAt)}</span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </Tabs>
          </div>

          <DrawerFooter className="flex-none border-t">
            <DrawerClose asChild>
              <Button variant="outline" size="lg">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
