"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Contract, ContractStatus, Amendment, ApprovalEntry } from "@/types/contract";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { approveContract, rejectContract } from "@/services/contracts.service";
import { AlertCircle, FileText, Calendar, DollarSign, User, CheckCircle2, XCircle, Clock, FileSignature, History, Info, Receipt, ClipboardList, FileEdit, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

interface ContractDetailsDrawerProps {
  contract: Contract;
  trigger: React.ReactNode;
  onClose?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const formatCurrency = (amount: number, currency: string = "KES") => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

const getStatusColor = (status: ContractStatus) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800";
    case "completed":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800";
    case "pending_finance_approval":
    case "pending_md_approval":
    case "pending_signature":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    case "terminated":
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border-gray-200 dark:border-gray-800";
  }
};

const formatStatus = (status: ContractStatus) => {
  return status.split("_").map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(" ");
};

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "N/A";
  try {
    return format(new Date(dateString), "PPP");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

export function ContractDetailsDrawer({
  contract,
  trigger,
  onClose,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ContractDetailsDrawerProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [comments, setComments] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const { toast } = useToast();

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const onOpenChange = isControlled ? controlledOnOpenChange : setUncontrolledOpen;

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange?.(isOpen);
    if (!isOpen) {
      onClose?.();
      // Reset tab when closing
      setActiveTab("overview");
    }
  };

  const isApprovalPending = contract.status.startsWith("pending_");
  const currentLevel = isApprovalPending ? contract.status.split("_")[1] : null;

  const handleApprove = async () => {
    if (!comments.trim()) {
      toast({
        title: "Comments Required",
        description: "Please provide comments before approving the contract.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsApproving(true);
      await approveContract(contract._id, comments);
      toast({
        title: "Contract Approved",
        description: "The contract has been successfully approved.",
      });
      onClose?.();
      setComments("");
    } catch (error: any) {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve contract",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
      window.location.reload();

    }
  };

  const handleReject = async () => {
    if (!comments.trim()) {
      toast({
        title: "Comments Required",
        description: "Please provide rejection comments.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsRejecting(true);
      await rejectContract(contract._id, comments);
      toast({
        title: "Contract Rejected",
        description: "The contract has been rejected.",
      });
      onClose?.();
      setComments("");
    } catch (error: any) {
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject contract",
        variant: "destructive",
      });
    } finally {
      setIsRejecting(false);
      window.location.reload();
    }
  };

  // Determine which tabs to show
  const hasApprovalFlow = contract.approvalFlow && (
    (contract.approvalFlow.financeApprovals && contract.approvalFlow.financeApprovals.length > 0) ||
    (contract.approvalFlow.mdApprovals && contract.approvalFlow.mdApprovals.length > 0) ||
    contract.finalApproval ||
    contract.rejectionDetails
  );
  
  const hasAmendments = contract.amendments && contract.amendments.length > 0;

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className="h-[95vh] max-h-[95vh]">
        <div className="mx-auto w-full max-w-5xl h-full flex flex-col">
          <DrawerHeader className="flex-none  pb-4">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-2xl flex items-center">
                <FileText className="mr-3 h-6 w-6 text-primary" />
                Contract Details
              </DrawerTitle>
              <Badge 
                variant="outline" 
                className={cn("border px-3 py-1", getStatusColor(contract.status))}
              >
                {formatStatus(contract.status)}
              </Badge>
            </div>
            <DrawerDescription className="mt-2">
              {contract.description}
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-hidden">
            <Tabs 
              defaultValue="overview" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="h-full flex flex-col"
            >
              <div className="px-6">
                <TabsList className="h-14 w-full justify-start gap-2 bg-transparent">
                  <TabsTrigger 
                    value="overview" 
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3 h-full"
                  >
                    <Info className="h-4 w-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="financial" 
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3 h-full"
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Financial
                  </TabsTrigger>
                  <TabsTrigger 
                    value="contractor" 
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3 h-full"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Contractor
                  </TabsTrigger>
                  {isApprovalPending && (
                    <TabsTrigger 
                      value="approval" 
                      className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3 h-full"
                    >
                      <ClipboardList className="h-4 w-4 mr-2" />
                      Approval
                    </TabsTrigger>
                  )}
                  {hasApprovalFlow && (
                    <TabsTrigger 
                      value="history" 
                      className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3 h-full"
                    >
                      <History className="h-4 w-4 mr-2" />
                      History
                    </TabsTrigger>
                  )}
                  {hasAmendments && (
                    <TabsTrigger 
                      value="amendments" 
                      className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3 h-full"
                    >
                      <FileEdit className="h-4 w-4 mr-2" />
                      Amendments
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>

              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-[calc(95vh-13rem)] w-full">
                  <div className="px-6 py-6">
                    {/* Overview Tab */}
                    <TabsContent value="overview" className="mt-0 space-y-6">
                      <Card className="overflow-hidden border shadow-sm">
                        <div className="bg-primary/5 px-6 py-4 flex items-center">
                          <FileSignature className="h-5 w-5 mr-2 text-primary" />
                          <h3 className="text-lg font-semibold">Contract Information</h3>
                        </div>
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                              <span className="text-sm font-medium text-muted-foreground">
                                Contract Number
                              </span>
                              <p className="font-semibold text-lg">{contract.contractNumber}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-sm font-medium text-muted-foreground">Project</span>
                              <p className="font-semibold text-lg">
                                {contract.projectId?.name || "N/A"}
                              </p>
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-1">
                              <span className="text-sm font-medium text-muted-foreground">
                                Description
                              </span>
                              <p className="font-medium">{contract.description}</p>
                            </div>
                            
                            {contract.currentLevelDeadline && (
                              <div className="space-y-1">
                                <span className="text-sm font-medium text-muted-foreground flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  Approval Deadline
                                </span>
                                <p className={cn("font-medium", contract.currentLevelDeadline && new Date(contract.currentLevelDeadline) < new Date() ? "text-red-600 dark:text-red-400" : "")}>
                                  {formatDate(contract.currentLevelDeadline)}
                                  {contract.currentLevelDeadline && new Date(contract.currentLevelDeadline) < new Date() && " (Overdue)"}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="overflow-hidden border shadow-sm">
                          <div className="bg-emerald-50 dark:bg-emerald-950/40 px-6 py-4 flex items-center">
                            <DollarSign className="h-5 w-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                            <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">Financial Summary</h3>
                          </div>
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="space-y-1">
                                <span className="text-sm font-medium text-muted-foreground">
                                  Contract Value
                                </span>
                                <p className="font-semibold text-lg text-emerald-600 dark:text-emerald-400">
                                  {formatCurrency(contract.contractValue, contract.currency)}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-sm font-medium text-muted-foreground">
                                  Duration
                                </span>
                                <p className="font-medium">
                                  {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="overflow-hidden border shadow-sm">
                          <div className="bg-blue-50 dark:bg-blue-950/40 px-6 py-4 flex items-center">
                            <User className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                            <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                              Contractor Summary
                            </h3>
                          </div>
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="space-y-1">
                                <span className="text-sm font-medium text-muted-foreground">Name</span>
                                <p className="font-medium">
                                  {contract.contractedUserId?.firstName}{" "}
                                  {contract.contractedUserId?.lastName}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-sm font-medium text-muted-foreground">Email</span>
                                <p className="font-medium">
                                  {contract.contractedUserId?.email}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    {/* Financial Tab */}
                    <TabsContent value="financial" className="mt-0 space-y-6">
                      <Card className="overflow-hidden border shadow-sm">
                        <div className="bg-emerald-50 dark:bg-emerald-950/40 px-6 py-4 flex items-center">
                          <DollarSign className="h-5 w-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                          <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">Financial Details</h3>
                        </div>
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                              <span className="text-sm font-medium text-muted-foreground">
                                Contract Value
                              </span>
                              <p className="font-semibold text-xl text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(contract.contractValue, contract.currency)}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-sm font-medium text-muted-foreground">
                                Currency
                              </span>
                              <p className="font-medium text-lg">{contract.currency}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-sm font-medium text-muted-foreground flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                Start Date
                              </span>
                              <p className="font-medium">
                                {formatDate(contract.startDate)}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-sm font-medium text-muted-foreground flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                End Date
                              </span>
                              <p className="font-medium">
                                {formatDate(contract.endDate)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Additional financial information could go here */}
                      <Card className="overflow-hidden border shadow-sm">
                        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 px-6 py-4 flex items-center">
                          <Receipt className="h-5 w-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                          <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">Payment Schedule</h3>
                        </div>
                        <CardContent className="p-6">
                          <div className="text-center text-muted-foreground py-6">
                            Payment schedule information will appear here when available.
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Contractor Tab */}
                    <TabsContent value="contractor" className="mt-0 space-y-6">
                      <Card className="overflow-hidden border shadow-sm">
                        <div className="bg-blue-50 dark:bg-blue-950/40 px-6 py-4 flex items-center">
                          <User className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                          <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                            Contractor Information
                          </h3>
                        </div>
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                              <span className="text-sm font-medium text-muted-foreground">Name</span>
                              <p className="font-semibold text-lg">
                                {contract.contractedUserId?.firstName}{" "}
                                {contract.contractedUserId?.lastName}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-sm font-medium text-muted-foreground">Email</span>
                              <p className="font-medium">
                                {contract.contractedUserId?.email}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-sm font-medium text-muted-foreground">Phone</span>
                              <p className="font-medium">
                                {contract.contractedUserId?.phoneNumber}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Additional contractor information could go here */}
                      <Card className="overflow-hidden border shadow-sm">
                        <div className="bg-blue-50/50 dark:bg-blue-950/20 px-6 py-4 flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                          <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                            Contractor Documents
                          </h3>
                        </div>
                        <CardContent className="p-6">
                          <div className="text-center text-muted-foreground py-6">
                            Contractor documents will appear here when available.
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Approval Tab */}
                    {isApprovalPending && (
                      <TabsContent value="approval" className="mt-0 space-y-6">
                        <Card className="overflow-hidden border shadow-sm">
                          <div className="bg-purple-50 dark:bg-purple-950/40 px-6 py-4 flex items-center">
                            <ClipboardList className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                            <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-400">Contract Approval</h3>
                          </div>
                          <CardContent className="p-6">
                            {contract.currentLevelDeadline && new Date(contract.currentLevelDeadline) < new Date() && (
                              <Alert className="mb-6" variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                  This approval is past its deadline of {formatDate(contract.currentLevelDeadline)}
                                </AlertDescription>
                              </Alert>
                            )}

                            <div className="space-y-6">
                              <div>
                                <label className="text-base font-medium block mb-2">
                                  {currentLevel === "finance" ? "Finance Approval Comments" : "MD Approval Comments"}
                                </label>
                                <Textarea
                                  placeholder="Enter your comments..."
                                  className="min-h-[120px] resize-none"
                                  value={comments}
                                  onChange={(e) => setComments(e.target.value)}
                                />
                              </div>
                              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <Button
                                  onClick={handleApprove}
                                  className="flex-1"
                                  size="lg"
                                  variant="default"
                                  disabled={isApproving || isRejecting || !comments.trim()}
                                >
                                  {isApproving ? (
                                    <div className="flex items-center space-x-2">
                                      <Spinner  />
                                      <span>Approving...</span>
                                    </div>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="mr-2 h-5 w-5" />
                                      Approve Contract
                                    </>
                                  )}
                                </Button>
                                <Button
                                  onClick={handleReject}
                                  className="flex-1"
                                  size="lg"
                                  variant="destructive"
                                  disabled={isApproving || isRejecting || !comments.trim()}
                                >
                                  {isRejecting ? (
                                   <div className="flex items-center space-x-2">
                                      <Spinner  />
                                      <span>Rejecting...</span>
                                    </div>
                                  ) : (
                                    <>
                                      <XCircle className="mr-2 h-5 w-5" />
                                      Reject Contract
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    )}

                    {/* History Tab */}
                    {hasApprovalFlow && (
                      <TabsContent value="history" className="mt-0 space-y-6">
                        <Card className="overflow-hidden border shadow-sm">
                          <div className="bg-teal-50 dark:bg-teal-950/40 px-6 py-4 flex items-center">
                            <History className="h-5 w-5 mr-2 text-teal-600 dark:text-teal-400" />
                            <h3 className="text-lg font-semibold text-teal-700 dark:text-teal-400">Approval History</h3>
                          </div>
                          <CardContent className="p-6">
                            <div className="space-y-6">
                              {contract?.approvalFlow?.financeApprovals && 
                              contract.approvalFlow.financeApprovals.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-3 flex items-center">
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    Finance Approvals
                                  </h4>
                                  <div className="space-y-3">
                                    {contract.approvalFlow.financeApprovals.map((approval: ApprovalEntry, index) => (
                                      <div key={index} className="bg-muted/40 rounded-lg p-3">
                                        <div className="text-sm font-medium text-muted-foreground mb-2">
                                          Approved on {formatDate(approval.approvedAt)}
                                        </div>
                                        {approval.comments && (
                                          <div className="bg-background p-3 rounded-md border text-sm">
                                            {approval.comments}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                            {contract?.approvalFlow?.mdApprovals && 
                              contract.approvalFlow.mdApprovals.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-3 flex items-center">
                                    <User className="h-4 w-4 mr-1" />
                                    MD Approvals
                                  </h4>
                                  <div className="space-y-3">
                                    {contract.approvalFlow.mdApprovals.map((approval: ApprovalEntry, index) => (
                                      <div key={index} className="bg-muted/40 rounded-lg p-3">
                                        <div className="text-sm font-medium text-muted-foreground mb-2">
                                          Approved on {formatDate(approval.approvedAt)}
                                        </div>
                                        {approval.comments && (
                                          <div className="bg-background p-3 rounded-md border text-sm">
                                            {approval.comments}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {contract.finalApproval && (
                                <div>
                                  <h4 className="font-medium mb-3 flex items-center">
                                    <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" />
                                    Final Approval
                                  </h4>
                                  <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
                                    <div className="text-sm font-medium">
                                      Approved on {formatDate(contract.finalApproval.approvedAt)}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {contract.rejectionDetails && (
                                <div>
                                  <h4 className="font-medium mb-3 flex items-center text-red-600 dark:text-red-400">
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Rejection Details
                                  </h4>
                                  <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
                                    <div className="text-sm font-medium mb-2">
                                      Rejected on {formatDate(contract.rejectionDetails.rejectedAt)}
                                    </div>
                                    <div className="text-sm font-medium mb-2">
                                      Level: {contract.rejectionDetails.level}
                                    </div>
                                    <div className="bg-white dark:bg-red-950 p-3 rounded-md border border-red-200 dark:border-red-800 text-sm">
                                      {contract.rejectionDetails.reason}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    )}

                    {/* Amendments Tab */}
                    {hasAmendments && (
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
                    )}
                  </div>
                </ScrollArea>
              </div>
            </Tabs>
          </div>

          <DrawerFooter className="flex-none border-t">
            <DrawerClose asChild>
              <Button variant="outline" size="lg">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
