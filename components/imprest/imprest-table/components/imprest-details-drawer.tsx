"use client"

import type React from "react"

import { useState } from "react"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Imprest } from "@/types/imprest"
import { approveImprestHOD, approveImprestAccountant, rejectImprest } from "@/services/imprest.service"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Clock, FileText, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"

interface ImprestDetailsDrawerProps {
  imprest: Imprest
  trigger: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
}

export function ImprestDetailsDrawer({ imprest, trigger, open, onOpenChange, onClose }: ImprestDetailsDrawerProps) {
  const [comments, setComments] = useState("")
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const { toast } = useToast()

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount)
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

  const handleReject = async () => {
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
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_hod":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Pending HOD
          </Badge>
        )
      case "pending_accountant":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Pending Accountant
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className="h-[95vh] w-full sm:max-w-[95vw] sm:w-[600px]">
        <DrawerHeader className="border-b pb-4 px-6">
          <DrawerTitle className="text-2xl font-semibold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Imprest Details
          </DrawerTitle>
          <p className="text-sm text-muted-foreground mt-1">Request #{imprest._id.substring(imprest._id.length - 8)}</p>
        </DrawerHeader>
        <ScrollArea className="flex-1 px-6">
          <Tabs defaultValue="details" className="w-full mt-6">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="approvals">Approvals</TabsTrigger>
              <TabsTrigger value="actions" disabled={!["pending_hod", "pending_accountant"].includes(imprest.status)}>
                Actions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(imprest.amount, imprest.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <div className="mt-1">{getStatusBadge(imprest.status)}</div>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Payment Reason</p>
                      <p className="font-medium">{imprest.paymentReason}</p>
                    </div>
                  
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Employee Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">
                        {imprest.requestedBy.firstName} {imprest.requestedBy.lastName}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="font-medium capitalize">{imprest.requestedBy.department}</p>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{imprest.requestedBy.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Request Date</p>
                      <p className="font-medium">{formatDate(imprest.requestDate)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Due Date</p>
                      <p className="font-medium">{formatDate(imprest.dueDate)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Created At</p>
                      <p className="font-medium">{formatDate(imprest.createdAt)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Last Updated</p>
                      <p className="font-medium">{formatDate(imprest.updatedAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="approvals" className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">HOD Approval</CardTitle>
                </CardHeader>
                <CardContent>
                  {imprest.hodApproval ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approved
                        </Badge>
                        <p className="text-sm text-muted-foreground">{formatDate(imprest.hodApproval.approvedAt)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Approved By</p>
                        <p className="font-medium">
                          {imprest.hodApproval.approvedBy.firstName} {imprest.hodApproval.approvedBy.lastName}
                        </p>
                      </div>
                      {imprest.hodApproval.comments && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Comments</p>
                          <p className="text-sm">{imprest.hodApproval.comments}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-6 border border-dashed rounded-md border-muted">
                      <Clock className="h-5 w-5 text-muted-foreground mr-2" />
                      <p className="text-muted-foreground">Awaiting HOD approval</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Accountant Approval</CardTitle>
                </CardHeader>
                <CardContent>
                  {imprest.accountantApproval ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approved
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(imprest.accountantApproval.approvedAt)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Approved By</p>
                        <p className="font-medium">
                          {imprest.accountantApproval.approvedBy.firstName}{" "}
                          {imprest.accountantApproval.approvedBy.lastName}
                        </p>
                      </div>
                      {imprest.accountantApproval.comments && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Comments</p>
                          <p className="text-sm">{imprest.accountantApproval.comments}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-6 border border-dashed rounded-md border-muted">
                      <Clock className="h-5 w-5 text-muted-foreground mr-2" />
                      <p className="text-muted-foreground">
                        {!imprest.hodApproval ? "Awaiting HOD approval first" : "Awaiting Accountant approval"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions" className="space-y-6">
              {(imprest.status === "pending_hod" || imprest.status === "pending_accountant") && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">
                      {imprest.status === "pending_hod" ? "HOD Approval" : "Accountant Approval"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Enter your comments for this approval..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={imprest.status === "pending_hod" ? handleApproveHOD : handleApproveAccountant}
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        {isSubmitting ? (
                          <>
                            <Spinner className="mr-2" />
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
                        onClick={() => setReason("")}
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject Request
                      </Button>
                    </div>
                    {reason !== "" && (
                      <div className="space-y-4 mt-4 p-4 border border-destructive/50 rounded-md">
                        <h4 className="font-medium text-destructive flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Reject Imprest Request
                        </h4>
                        <Textarea
                          placeholder="Please provide a reason for rejection..."
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          className="min-h-[100px]"
                        />
                        <Button
                          variant="destructive"
                          onClick={handleReject}
                          disabled={isRejecting || !reason.trim()}
                          className="w-full"
                        >
                          {isRejecting ? (
                            <>
                              <Spinner className="mr-2" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <XCircle className="mr-2 h-4 w-4" />
                              Confirm Rejection
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </ScrollArea>
        <DrawerFooter className="border-t pt-4">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

