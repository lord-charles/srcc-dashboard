"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Claim, ClaimStatus } from "@/types/claim";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { approveClaim, rejectClaim } from "@/services/claims.service";
import { AlertCircle, FileText, Calendar, DollarSign, User, CheckCircle2, XCircle, Clock, FileSignature, History, Info, Receipt, ClipboardList, FileEdit, Building, ArrowRight, CalendarIcon, Tag, Briefcase, BarChart3, Mail, Shield } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";



interface ClaimDetailsDrawerProps {
  claim: Claim;
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

const getStatusColor = (status: ClaimStatus) => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800";
    case "pending_checker_approval":
    case "pending_manager_approval":
    case "pending_finance_approval":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800";
    case "draft":
      return "bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300 border-slate-200 dark:border-slate-800";
    default:
      return "bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300 border-slate-200 dark:border-slate-800";
  }
};

const getStatusIcon = (status: ClaimStatus) => {
  switch (status) {
    case "approved":
      return <CheckCircle2 className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />;
    case "pending_checker_approval":
    case "pending_manager_approval":
    case "pending_finance_approval":
      return <Clock className="h-4 w-4 mr-2 text-amber-600 dark:text-amber-400" />;
    case "rejected":
      return <XCircle className="h-4 w-4 mr-2 text-red-600 dark:text-red-400" />;
    case "draft":
      return <FileEdit className="h-4 w-4 mr-2 text-slate-600 dark:text-slate-400" />;
    default:
      return <Info className="h-4 w-4 mr-2 text-slate-600 dark:text-slate-400" />;
  }
};

const formatStatus = (status: ClaimStatus) => {
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

const formatTime = (dateString: string | undefined): string => {
  if (!dateString) return "";
  try {
    return format(new Date(dateString), "p");
  } catch (error) {
    return "";
  }
};

const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export function ClaimDetailsDrawer({
  claim,
  trigger,
  onClose,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ClaimDetailsDrawerProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [comments, setComments] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const { toast } = useToast();
  console.log(claim)
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const onOpenChange = isControlled ? controlledOnOpenChange : setUncontrolledOpen;

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange?.(isOpen);
    if (!isOpen) {
      onClose?.();
      setActiveTab("overview");
      setComments("");
      setActionType(null);
    }
  };

  const isApprovalPending = claim.status.startsWith("pending_");
  // const currentStep = claim.approvalFlow?.steps.find(step => step.nextStatus === claim.status);
  const currentStep = claim.approvalFlow?.steps.find(
    step => claim.status?.toLowerCase().includes(step.role.toLowerCase())
  );
  const isDeadlinePassed = claim.currentLevelDeadline && new Date(claim.currentLevelDeadline) < new Date();

  const handleAction = async (type: "approve" | "reject") => {
    if (!comments.trim()) {
      toast({
        title: "Comments Required",
        description: `Please provide comments before ${type === "approve" ? "approving" : "rejecting"} the claim.`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setActionType(type);

      if (type === "approve") {
        await approveClaim(claim._id, comments);
        toast({
          title: "Claim Approved",
          description: "The claim has been successfully approved.",
        });
      } else {
        await rejectClaim(claim._id, comments);
        toast({
          title: "Claim Rejected",
          description: "The claim has been rejected.",
        });
      }

      onClose?.();
      setComments("");
      window.location.reload();
    } catch (error: any) {
      toast({
        title: type === "approve" ? "Approval Failed" : "Rejection Failed",
        description: error.message || `Failed to ${type} claim`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setActionType(null);
    }
  };

  return (
    <TooltipProvider>
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="h-[95vh] max-h-[95vh]">
          <div className="mx-auto w-full max-w-5xl h-full flex flex-col">
            <DrawerHeader className="flex-none pb-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-2 rounded-lg mr-3">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <DrawerTitle className="text-2xl font-bold">
                      Claim Details
                    </DrawerTitle>
                    <DrawerDescription className="mt-1 flex items-center">
                      <Tag className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                      {claim.contractId?.contractNumber}
                    </DrawerDescription>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <Badge
                    variant="outline"
                    className={cn("border px-3 py-1.5 flex items-center", getStatusColor(claim.status))}
                  >
                    {getStatusIcon(claim.status)}
                    {formatStatus(claim.status)}
                  </Badge>
                  {claim.version > 1 && (
                    <span className="text-xs text-muted-foreground mt-1">
                      Version {claim.version}
                    </span>
                  )}
                </div>
              </div>
            </DrawerHeader>

            <div className="flex-1 overflow-hidden">
              <Tabs
                defaultValue="overview"
                value={activeTab}
                onValueChange={setActiveTab}
                className="h-full flex flex-col"
              >
                <div className="px-6 border-b">
                  <TabsList className="h-14 w-full justify-start gap-2 bg-transparent">
                    <TabsTrigger
                      value="overview"
                      className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3 h-full"
                    >
                      <Info className="h-4 w-4 mr-2" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value="milestones"
                      className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3 h-full"
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      Milestones
                    </TabsTrigger>
                    <TabsTrigger
                      value="claimant"
                      className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3 h-full"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Claimant
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
                    <TabsTrigger
                      value="history"
                      className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3 h-full"
                    >
                      <History className="h-4 w-4 mr-2" />
                      History
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-hidden">
                  <ScrollArea className="h-[calc(95vh-13rem)] w-full">
                    <div className="px-6 py-6">
                      {/* Overview Tab */}
                      <TabsContent value="overview" className="mt-0 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <Card className="md:col-span-2 overflow-hidden border shadow-sm">
                            <CardHeader className="bg-primary/5 px-6 py-4 flex flex-row items-center space-y-0 gap-2">
                              <FileSignature className="h-5 w-5 text-primary" />
                              <CardTitle className="text-lg font-semibold">Claim Information</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                  <div className="flex items-center text-sm font-medium text-muted-foreground">
                                    <Building className="h-3.5 w-3.5 mr-1.5" />
                                    Project
                                  </div>
                                  <p className="font-semibold text-lg">
                                    {claim.projectId.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {claim.projectId.description}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center text-sm font-medium text-muted-foreground">
                                    <Tag className="h-3.5 w-3.5 mr-1.5" />
                                    Contract Number
                                  </div>
                                  <p className="font-semibold text-lg">
                                    {claim.contractId?.contractNumber}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center text-sm font-medium text-muted-foreground">
                                    <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                                    Contract Value
                                  </div>
                                  <p className="font-semibold text-lg">
                                    {formatCurrency(claim.contractId?.contractValue || 0, claim?.currency)}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center text-sm font-medium text-muted-foreground">
                                    <DollarSign className="h-3.5 w-3.5 mr-1.5" />
                                    Claim Amount
                                  </div>
                                  <p className="font-semibold text-lg text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(claim?.amount || 0, claim?.currency)}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center text-sm font-medium text-muted-foreground">
                                    <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                                    Created Date
                                  </div>
                                  <p className="font-medium">
                                    {formatDate(claim?.createdAt)}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center text-sm font-medium text-muted-foreground">
                                    <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                                    Last Updated
                                  </div>
                                  <p className="font-medium">
                                    {formatDate(claim?.updatedAt)}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="overflow-hidden border shadow-sm">
                            <CardHeader className="bg-primary/5 px-6 py-4 flex flex-row items-center space-y-0 gap-2">
                              <Clock className="h-5 w-5 text-primary" />
                              <CardTitle className="text-lg font-semibold">Status & Timeline</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                              <div className="space-y-4">
                                <div className="space-y-1">
                                  <span className="text-sm font-medium text-muted-foreground">Current Status</span>
                                  <div className={cn("px-3 py-2 rounded-md flex items-center font-medium", getStatusColor(claim.status))}>
                                    {getStatusIcon(claim.status)}
                                    {formatStatus(claim.status)}
                                  </div>
                                </div>

                                {claim.currentLevelDeadline && (
                                  <div className="space-y-1">
                                    <span className="text-sm font-medium text-muted-foreground flex items-center">
                                      <Clock className="h-3.5 w-3.5 mr-1.5" />
                                      Approval Deadline
                                    </span>
                                    <p className={cn("font-medium", isDeadlinePassed ? "text-red-600 dark:text-red-400" : "")}>
                                      {formatDate(claim.currentLevelDeadline)}
                                      {isDeadlinePassed && (
                                        <span className="ml-2 text-xs bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                                          Overdue
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                )}

                                <div className="space-y-1">
                                  <span className="text-sm font-medium text-muted-foreground flex items-center">
                                    <User className="h-3.5 w-3.5 mr-1.5" />
                                    Created By
                                  </span>
                                  <p className="font-medium">
                                    {claim.createdBy?.firstName} {claim.createdBy?.lastName}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>


                      </TabsContent>

                      {/* Milestones Tab */}
                      <TabsContent value="milestones" className="mt-0 space-y-6">
                        <Card className="overflow-hidden border shadow-sm">
                          <CardHeader className="bg-emerald-50 dark:bg-emerald-950/40 px-6 py-4 flex flex-row items-center space-y-0 gap-2">
                            <Receipt className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            <CardTitle className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">Milestones</CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="space-y-8">
                              {claim.milestones.map((milestone, index) => (
                                <div key={index} className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <div className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 w-8 h-8 rounded-full flex items-center justify-center mr-3 font-semibold">
                                        {index + 1}
                                      </div>
                                      <h4 className="font-medium text-lg">{milestone.title}</h4>
                                    </div>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                                          {milestone.percentageClaimed}% Claimed
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Percentage of milestone claimed</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>

                                  <div className="relative pt-1">
                                    <div className="flex items-center justify-between mb-2">
                                      <div>
                                        <span className="text-xs font-semibold inline-block text-emerald-600">
                                          {milestone.percentageClaimed}% Complete
                                        </span>
                                      </div>
                                      <div className="text-right">
                                        <span className="text-xs font-semibold inline-block text-emerald-600">
                                          {formatCurrency(milestone.currentClaim, claim.currency)}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="overflow-hidden h-2 text-xs flex rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                                      <div
                                        style={{ width: `${milestone.percentageClaimed}%` }}
                                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500"
                                      ></div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/30 p-4 rounded-lg">
                                    <div className="space-y-1">
                                      <div className="flex items-center text-sm font-medium text-muted-foreground">
                                        <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                                        Maximum Claimable
                                      </div>
                                      <p className="font-medium text-lg">
                                        {formatCurrency(milestone.maxClaimableAmount, claim.currency)}
                                      </p>
                                    </div>
                                    <div className="space-y-1">
                                      <div className="flex items-center text-sm font-medium text-muted-foreground">
                                        <DollarSign className="h-3.5 w-3.5 mr-1.5" />
                                        Current Claim
                                      </div>
                                      <p className="font-medium text-lg text-emerald-600 dark:text-emerald-400">
                                        {formatCurrency(milestone.currentClaim, claim.currency)}
                                      </p>
                                    </div>
                                    <div className="space-y-1">
                                      <div className="flex items-center text-sm font-medium text-muted-foreground">
                                        <ArrowRight className="h-3.5 w-3.5 mr-1.5" />
                                        Remaining
                                      </div>
                                      <p className="font-medium text-lg">
                                        {formatCurrency(milestone.remainingClaimable, claim.currency)}
                                      </p>
                                    </div>
                                  </div>

                                  {index < claim.milestones.length - 1 && (
                                    <Separator className="my-4" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Claimant Tab */}
                      <TabsContent value="claimant" className="mt-0 space-y-6">
                        <Card className="overflow-hidden border shadow-sm">
                          <CardHeader className="bg-blue-50 dark:bg-blue-950/40 px-6 py-4 flex flex-row items-center space-y-0 gap-2">
                            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <CardTitle className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                              Claimant Information
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row items-start gap-6">
                              <div className="flex-shrink-0">
                                <Avatar className="h-24 w-24">
                                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${claim?.claimantId?.firstName || "john"}%20${claim?.claimantId?.lastName || "doe"}`} alt={`${claim?.claimantId?.firstName || "john"} ${claim?.claimantId?.lastName || "doe"}`} />
                                  <AvatarFallback className="text-2xl">
                                    {getInitials(claim?.claimantId?.firstName || "john", claim?.claimantId?.lastName || "doe")}
                                  </AvatarFallback>
                                </Avatar>
                              </div>

                              <div className="flex-1 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-1">
                                    <div className="flex items-center text-sm font-medium text-muted-foreground">
                                      <User className="h-3.5 w-3.5 mr-1.5" />
                                      Full Name
                                    </div>
                                    <p className="font-semibold text-lg">
                                      {claim.claimantId?.firstName || ""} {claim.claimantId?.lastName || ""}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center text-sm font-medium text-muted-foreground">
                                      <Mail className="h-3.5 w-3.5 mr-1.5" />
                                      Email Address
                                    </div>
                                    <p className="font-medium">
                                      {claim.claimantId?.email || ""}
                                    </p>
                                  </div>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                  <h4 className="font-medium mb-3 flex items-center text-blue-700 dark:text-blue-400">
                                    <Info className="h-4 w-4 mr-2" />
                                    Claim Summary
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                      <span className="text-sm text-muted-foreground">Total Claim Amount</span>
                                      <p className="font-semibold text-lg text-blue-700 dark:text-blue-400">
                                        {formatCurrency(claim.amount, claim.currency)}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-sm text-muted-foreground">Claim Status</span>
                                      <p className="font-medium flex items-center mt-1">
                                        {getStatusIcon(claim.status)}
                                        {formatStatus(claim.status)}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-sm text-muted-foreground">Claim Version</span>
                                      <p className="font-medium">
                                        {claim.version}
                                        {claim.version > 1 && (
                                          <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                                            Updated
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Approval Tab C */}
                      {isApprovalPending && (
                        <TabsContent value="approval" className="mt-0 space-y-6">
                          <Card className="overflow-hidden border shadow-sm">
                            <CardHeader className="bg-purple-50 dark:bg-purple-950/40 px-6 py-4 flex flex-row items-center space-y-0 gap-2">
                              <ClipboardList className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                              <CardTitle className="text-lg font-semibold text-purple-700 dark:text-purple-400">Claim Approval</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                              {isDeadlinePassed && (
                                <Alert variant="destructive" className="mb-6">
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertTitle>Deadline Passed</AlertTitle>
                                  <AlertDescription>
                                    This approval is past its deadline of {formatDate(claim.currentLevelDeadline)} {formatTime(claim.currentLevelDeadline)}
                                  </AlertDescription>
                                </Alert>
                              )}

                              <div className="space-y-6">
                                <div className="bg-muted/30 p-4 rounded-lg">
                                  <h3 className="text-base font-medium mb-3 flex items-center">
                                    <Shield className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
                                    {currentStep ? `${currentStep.department} ${currentStep.role.split('_').join(' ').toUpperCase()} Approval Required` : 'Approval Required'}
                                  </h3>
                                  <p className="text-sm text-muted-foreground mb-4">
                                    {currentStep?.description || 'Please review this claim and provide your decision with appropriate comments.'}
                                  </p>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-1">
                                      <span className="text-sm font-medium text-muted-foreground">Claim Amount</span>
                                      <p className="font-semibold text-lg text-purple-600 dark:text-purple-400">
                                        {formatCurrency(claim?.amount || 0, claim?.currency)}
                                      </p>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-sm font-medium text-muted-foreground">Deadline</span>
                                      <p className={cn("font-medium", isDeadlinePassed ? "text-red-600 dark:text-red-400" : "")}>
                                        {formatDate(claim.currentLevelDeadline)}
                                        {isDeadlinePassed && " (Overdue)"}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-base font-medium block mb-2">
                                    {currentStep ? `${currentStep.department} ${currentStep.role.split('_').join(' ').toUpperCase()} Comments` : 'Approval Comments'}
                                  </label>
                                  <Textarea
                                    placeholder="Enter your comments regarding this claim approval or rejection..."
                                    className="min-h-[120px] resize-none"
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                  />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                  <Button
                                    onClick={() => handleAction("approve")}
                                    className="flex-1"
                                    size="lg"
                                    variant="default"
                                    disabled={isSubmitting || !comments.trim()}
                                  >
                                    {isSubmitting && actionType === "approve" ? (
                                      <div className="flex items-center space-x-2">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Approving</span>
                                        <Spinner />
                                      </div>
                                    ) : (
                                      <>
                                        <CheckCircle2 className="mr-2 h-5 w-5" />
                                        Approve Claim
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    onClick={() => handleAction("reject")}
                                    className="flex-1"
                                    size="lg"
                                    variant="destructive"
                                    disabled={isSubmitting || !comments.trim()}
                                  >
                                    {isSubmitting && actionType === "reject" ? (
                                      <div className="flex items-center space-x-2">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Rejecting...</span>
                                        <Spinner />

                                      </div>
                                    ) : (
                                      <>
                                        <XCircle className="mr-2 h-5 w-5" />
                                        Reject Claim
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
                      <TabsContent value="history" className="mt-0 space-y-6">
                        <Card className="overflow-hidden border shadow-sm">
                          <CardHeader className="bg-teal-50 dark:bg-teal-950/40 px-6 py-4 flex flex-row items-center space-y-0 gap-2">
                            <History className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                            <CardTitle className="text-lg font-semibold text-teal-700 dark:text-teal-400">Approval History</CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="space-y-6">
                              {claim.auditTrail && claim.auditTrail.length > 0 ? (
                                <div className="relative border-l-2 border-teal-200 dark:border-teal-800 pl-6 ml-3 space-y-8">
                                  {claim.auditTrail.map((entry, index) => (
                                    <div key={entry._id} className="relative">
                                      <div className="absolute -left-[31px] bg-teal-100 dark:bg-teal-900 border-4 border-teal-50 dark:border-teal-950 rounded-full w-6 h-6 flex items-center justify-center">
                                        {entry.action === "APPROVED" ? (
                                          <CheckCircle2 className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                                        ) : entry.action === "REJECTED" ? (
                                          <XCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
                                        ) : (
                                          <FileEdit className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                                        )}
                                      </div>

                                      <div className="bg-muted/30 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="font-medium">
                                            {entry.action}
                                          </div>
                                          <div className="text-sm text-muted-foreground">
                                            {formatDate(entry.performedAt)} {formatTime(entry.performedAt)}
                                          </div>
                                        </div>

                                        <div className="text-sm mb-3">
                                          <span className="text-muted-foreground">Performed by: </span>
                                          <span className="font-medium">{entry.performedBy}</span>
                                        </div>

                                        {entry.details && (
                                          <div className="bg-background p-4 rounded-md border text-sm">
                                            <div className="flex items-center mb-2">
                                              <Shield className="h-3.5 w-3.5 mr-1.5 text-teal-600 dark:text-teal-400" />
                                              <span className="font-medium capitalize">{entry.details.level} Level</span>
                                            </div>
                                            <div className="pl-5 border-l-2 border-teal-200 dark:border-teal-800">
                                              {entry.details.comments}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                  <History className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                  <p>No history records available</p>
                                </div>
                              )}

                              {claim.approval && (
                                <div className="space-y-6 mt-8">
                                  <h3 className="font-medium text-lg flex items-center">
                                    <CheckCircle2 className="h-5 w-5 mr-2 text-teal-600 dark:text-teal-400" />
                                    Approval Records
                                  </h3>

                                  {claim.approval.checkerApproval && (
                                    <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                                      <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center">
                                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                                          <h4 className="font-medium">Checker Approval</h4>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          {formatDate(claim.approval.checkerApproval.approvedAt)}
                                        </div>
                                      </div>
                                      <div className="text-sm">
                                        <div className="flex items-center text-muted-foreground mb-2">
                                          <User className="h-3.5 w-3.5 mr-1.5" />
                                          Approved by: {claim.approval.checkerApproval.approvedBy}
                                        </div>
                                        <div className="bg-white dark:bg-green-950 p-3 rounded-md border text-sm">
                                          {claim.approval.checkerApproval.comments}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {claim.approval.managerApproval && (
                                    <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                                      <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center">
                                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                                          <h4 className="font-medium">Manager Approval</h4>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          {formatDate(claim.approval.managerApproval.approvedAt)}
                                        </div>
                                      </div>
                                      <div className="text-sm">
                                        <div className="flex items-center text-muted-foreground mb-2">
                                          <User className="h-3.5 w-3.5 mr-1.5" />
                                          Approved by: {claim.approval.managerApproval.approvedBy}
                                        </div>
                                        <div className="bg-white dark:bg-green-950 p-3 rounded-md border text-sm">
                                          {claim.approval.managerApproval.comments}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {claim.approval.financeApproval && (
                                    <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                                      <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center">
                                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                                          <h4 className="font-medium">Finance Approval</h4>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          {formatDate(claim.approval.financeApproval.approvedAt)}
                                        </div>
                                      </div>
                                      <div className="text-sm">
                                        <div className="flex items-center text-muted-foreground mb-2">
                                          <User className="h-3.5 w-3.5 mr-1.5" />
                                          Approved by: {claim.approval.financeApproval.approvedBy}
                                        </div>
                                        <div className="bg-white dark:bg-green-950 p-3 rounded-md border text-sm">
                                          {claim.approval.financeApproval.comments}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </div>
                  </ScrollArea>
                </div>
              </Tabs>
            </div>

            <DrawerFooter className="flex-none border-t">
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                {isApprovalPending && (
                  <>
                    <Button
                      onClick={() => {
                        setActiveTab("approval");
                      }}
                      className="flex-1"
                      variant="outline"
                      size="lg"
                    >
                      <ClipboardList className="mr-2 h-5 w-5" />
                      Go to Approval
                    </Button>
                  </>
                )}
                <DrawerClose asChild>
                  <Button variant="outline" size="lg" className={isApprovalPending ? "flex-1" : "w-full"}>Close</Button>
                </DrawerClose>
              </div>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </TooltipProvider>
  );
}
