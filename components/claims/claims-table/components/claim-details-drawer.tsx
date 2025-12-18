"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Claim, ClaimStatus, PaymentDetails } from "@/types/claim";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  approveClaim,
  rejectClaim,
  markClaimAsPaid,
} from "@/services/claims.service";
import { FileUpload } from "@/components/ui/file-upload";
import { cloudinaryService } from "@/lib/cloudinary-service";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  FileText,
  Calendar,
  DollarSign,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  FileSignature,
  History,
  Info,
  Receipt,
  ClipboardList,
  FileEdit,
  Building,
  ArrowRight,
  CalendarIcon,
  Tag,
  Briefcase,
  BarChart3,
  Mail,
  Shield,
} from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
    case "paid":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    case "pending_checker_approval":
    // case "pending_manager_approval":
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
      return (
        <CheckCircle2 className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
      );
    case "paid":
      return (
        <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
      );
    case "pending_checker_approval":
    // case "pending_manager_approval":
    case "pending_finance_approval":
      return (
        <Clock className="h-4 w-4 mr-2 text-amber-600 dark:text-amber-400" />
      );
    case "rejected":
      return (
        <XCircle className="h-4 w-4 mr-2 text-red-600 dark:text-red-400" />
      );
    case "draft":
      return (
        <FileEdit className="h-4 w-4 mr-2 text-slate-600 dark:text-slate-400" />
      );
    default:
      return (
        <Info className="h-4 w-4 mr-2 text-slate-600 dark:text-slate-400" />
      );
  }
};

const formatStatus = (status: ClaimStatus) => {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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
  const [actionType, setActionType] = useState<
    "approve" | "reject" | "payment" | null
  >(null);
  const [paymentAdviceUrl, setPaymentAdviceUrl] = useState("");
  const [isUploadingPayment, setIsUploadingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [transactionId, setTransactionId] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [approvalConsent, setApprovalConsent] = useState(false);
  const { toast } = useToast();
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const onOpenChange = isControlled
    ? controlledOnOpenChange
    : setUncontrolledOpen;

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange?.(isOpen);
    if (!isOpen) {
      onClose?.();
      setActiveTab("overview");
      setComments("");
      setActionType(null);
      setApprovalConsent(false);
    }
  };

  
  const isApprovalPending = claim.status.startsWith("pending_");
  // const currentStep = claim.approvalFlow?.steps.find(step => step.nextStatus === claim.status);
  const currentStep = claim.approvalFlow?.steps.find((step) =>
    claim.status?.toLowerCase().includes(step.role.toLowerCase())
  );
  const isDeadlinePassed =
    claim.currentLevelDeadline &&
    new Date(claim.currentLevelDeadline) < new Date();

  const handleAction = async (type: "approve" | "reject") => {
    // For approval, check consent checkbox
    if (type === "approve" && !approvalConsent) {
      toast({
        title: "Consent Required",
        description:
          "Please confirm that you have reviewed and approve this claim.",
        variant: "destructive",
      });
      return;
    }

    // For rejection, comments are required
    if (type === "reject" && !comments.trim()) {
      toast({
        title: "Comments Required",
        description: "Please provide a reason for rejecting the claim.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setActionType(type);

      if (type === "approve") {
        await approveClaim(claim._id, comments || "Approved");
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
      setApprovalConsent(false);
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

  const handleMarkAsPaid = async () => {
    if (!paymentAdviceUrl) {
      toast({
        title: "Payment Advice Required",
        description:
          "Please upload the payment advice document before marking as paid.",
        variant: "destructive",
      });
      return;
    }

    if (!transactionId.trim()) {
      toast({
        title: "Transaction ID Required",
        description: "Please provide a transaction ID.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setActionType("payment");

      await markClaimAsPaid(claim._id, {
        paymentMethod,
        transactionId,
        reference: paymentReference,
        paymentAdviceUrl,
      });

      toast({
        title: "Claim Marked as Paid",
        description: "The claim has been successfully marked as paid.",
      });

      onClose?.();
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to mark claim as paid",
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
                    className={cn(
                      "border px-3 py-1.5 flex items-center",
                      getStatusColor(claim.status)
                    )}
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
                    <TabsTrigger
                      value="contract"
                      className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3 h-full"
                    >
                      <FileSignature className="h-4 w-4 mr-2" />
                      Contract
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
                    {claim.status === "approved" && (
                      <TabsTrigger
                        value="payment"
                        className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3 h-full"
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Mark as Paid
                      </TabsTrigger>
                    )}
                    {claim.status === "paid" && (
                      <TabsTrigger
                        value="payment-details"
                        className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3 h-full"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Payment Details
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
                              <CardTitle className="text-lg font-semibold">
                                Claim Information
                              </CardTitle>
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
                                    {formatCurrency(
                                      claim.contractId?.contractValue || 0,
                                      claim?.currency
                                    )}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center text-sm font-medium text-muted-foreground">
                                    <DollarSign className="h-3.5 w-3.5 mr-1.5" />
                                    Claim Amount
                                  </div>
                                  <p className="font-semibold text-lg text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(
                                      claim?.amount || 0,
                                      claim?.currency
                                    )}
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
                              <CardTitle className="text-lg font-semibold">
                                Status & Timeline
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                              <div className="space-y-4">
                                <div className="space-y-1">
                                  <span className="text-sm font-medium text-muted-foreground">
                                    Current Status
                                  </span>
                                  <div
                                    className={cn(
                                      "px-3 py-2 rounded-md flex items-center font-medium",
                                      getStatusColor(claim.status)
                                    )}
                                  >
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
                                    <p
                                      className={cn(
                                        "font-medium",
                                        isDeadlinePassed
                                          ? "text-red-600 dark:text-red-400"
                                          : ""
                                      )}
                                    >
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
                                    {claim.createdBy?.firstName}{" "}
                                    {claim.createdBy?.lastName}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>

                      {/* Milestones Tab */}
                      <TabsContent
                        value="milestones"
                        className="mt-0 space-y-6"
                      >
                        <Card className="overflow-hidden border shadow-sm">
                          <CardHeader className="bg-emerald-50 dark:bg-emerald-950/40 px-6 py-4 flex flex-row items-center space-y-0 gap-2">
                            <Receipt className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            <CardTitle className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                              Milestones
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="space-y-8">
                              {claim.milestones.map((milestone, index) => {
                                // Calculate correct values based on contract value and claim amount
                                const contractValue =
                                  claim.contractId?.contractValue || 0;
                                const totalClaimAmount = claim.amount || 0;

                                // Distribute claim amount proportionally across milestones
                                const milestoneShare =
                                  totalClaimAmount / claim.milestones.length;
                                const calculatedCurrentClaim = milestoneShare;

                                // Max claimable is based on contract value and milestone percentage
                                // If percentageClaimed is 100%, max claimable should equal current claim
                                const calculatedMaxClaimable =
                                  milestone.percentageClaimed === 100
                                    ? calculatedCurrentClaim
                                    : (calculatedCurrentClaim * 100) /
                                      milestone.percentageClaimed;

                                const calculatedRemaining =
                                  calculatedMaxClaimable -
                                  calculatedCurrentClaim;

                                return (
                                  <div key={index} className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <div className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 w-8 h-8 rounded-full flex items-center justify-center mr-3 font-semibold">
                                          {index + 1}
                                        </div>
                                        <h4 className="font-medium text-lg">
                                          {milestone.title}
                                        </h4>
                                      </div>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Badge
                                            variant="outline"
                                            className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                                          >
                                            {milestone.percentageClaimed?.toFixed(
                                              2
                                            )}
                                            % Claimed
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
                                            {milestone.percentageClaimed?.toFixed(
                                              2
                                            )}
                                            % Complete
                                          </span>
                                        </div>
                                        <div className="text-right">
                                          <span className="text-xs font-semibold inline-block text-emerald-600">
                                            {formatCurrency(
                                              calculatedCurrentClaim,
                                              claim.currency
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="overflow-hidden h-2 text-xs flex rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                                        <div
                                          style={{
                                            width: `${milestone.percentageClaimed?.toFixed(
                                              2
                                            )}%`,
                                          }}
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
                                          {formatCurrency(
                                            calculatedMaxClaimable,
                                            claim.currency
                                          )}
                                        </p>
                                      </div>
                                      <div className="space-y-1">
                                        <div className="flex items-center text-sm font-medium text-muted-foreground">
                                          <DollarSign className="h-3.5 w-3.5 mr-1.5" />
                                          Current Claim
                                        </div>
                                        <p className="font-medium text-lg text-emerald-600 dark:text-emerald-400">
                                          {formatCurrency(
                                            calculatedCurrentClaim,
                                            claim.currency
                                          )}
                                        </p>
                                      </div>
                                      <div className="space-y-1">
                                        <div className="flex items-center text-sm font-medium text-muted-foreground">
                                          <ArrowRight className="h-3.5 w-3.5 mr-1.5" />
                                          Remaining
                                        </div>
                                        <p className="font-medium text-lg">
                                          {formatCurrency(
                                            calculatedRemaining,
                                            claim.currency
                                          )}
                                        </p>
                                      </div>
                                    </div>

                                    {index < claim.milestones.length - 1 && (
                                      <Separator className="my-4" />
                                    )}
                                  </div>
                                );
                              })}
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
                                  <AvatarImage
                                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${
                                      claim?.claimantId?.firstName || "john"
                                    }%20${
                                      claim?.claimantId?.lastName || "doe"
                                    }`}
                                    alt={`${
                                      claim?.claimantId?.firstName || "john"
                                    } ${claim?.claimantId?.lastName || "doe"}`}
                                  />
                                  <AvatarFallback className="text-2xl">
                                    {getInitials(
                                      claim?.claimantId?.firstName || "john",
                                      claim?.claimantId?.lastName || "doe"
                                    )}
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
                                      {claim.claimantId?.firstName || ""}{" "}
                                      {claim.claimantId?.lastName || ""}
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
                                      <span className="text-sm text-muted-foreground">
                                        Total Claim Amount
                                      </span>
                                      <p className="font-semibold text-lg text-blue-700 dark:text-blue-400">
                                        {formatCurrency(
                                          claim.amount,
                                          claim.currency
                                        )}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-sm text-muted-foreground">
                                        Claim Status
                                      </span>
                                      <p className="font-medium flex items-center mt-1">
                                        {getStatusIcon(claim.status)}
                                        {formatStatus(claim.status)}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-sm text-muted-foreground">
                                        Claim Version
                                      </span>
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

                      {/* Contract Tab */}
                      <TabsContent value="contract" className="mt-0 space-y-6">
                        <Card className="overflow-hidden border shadow-sm">
                          <CardHeader className="bg-indigo-50 dark:bg-indigo-950/40 px-6 py-4 flex flex-row items-center space-y-0 gap-2">
                            <FileSignature className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            <CardTitle className="text-lg font-semibold text-indigo-700 dark:text-indigo-400">
                              Contract Details
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="space-y-6">
                              {/* Contract Overview */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                  <div className="flex items-center text-sm font-medium text-muted-foreground">
                                    <Tag className="h-3.5 w-3.5 mr-1.5" />
                                    Contract Number
                                  </div>
                                  <p className="font-semibold text-lg">
                                    {claim.contractId?.contractNumber || "N/A"}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center text-sm font-medium text-muted-foreground">
                                    <Badge className="h-3.5 w-3.5 mr-1.5" />
                                    Status
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="capitalize"
                                  >
                                    {claim.contractId?.status || "N/A"}
                                  </Badge>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center text-sm font-medium text-muted-foreground">
                                    <DollarSign className="h-3.5 w-3.5 mr-1.5" />
                                    Contract Value
                                  </div>
                                  <p className="font-semibold text-lg text-indigo-600 dark:text-indigo-400">
                                    {formatCurrency(
                                      claim.contractId?.contractValue || 0,
                                      claim.contractId?.currency ||
                                        claim.currency
                                    )}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center text-sm font-medium text-muted-foreground">
                                    <DollarSign className="h-3.5 w-3.5 mr-1.5" />
                                    Currency
                                  </div>
                                  <p className="font-medium">
                                    {claim.contractId?.currency ||
                                      claim.currency}
                                  </p>
                                </div>
                              </div>

                              <Separator />

                              {/* Contract Period */}
                              <div>
                                <h4 className="font-medium mb-3 flex items-center text-indigo-700 dark:text-indigo-400">
                                  <CalendarIcon className="h-4 w-4 mr-2" />
                                  Contract Period
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                                  <div className="space-y-1">
                                    <span className="text-sm text-muted-foreground">
                                      Start Date
                                    </span>
                                    <p className="font-medium">
                                      {formatDate(claim.contractId?.startDate)}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-sm text-muted-foreground">
                                      End Date
                                    </span>
                                    <p className="font-medium">
                                      {formatDate(claim.contractId?.endDate)}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <Separator />

                              {/* Project Information */}
                              {claim.contractId?.projectId && (
                                <>
                                  <div>
                                    <h4 className="font-medium mb-3 flex items-center text-indigo-700 dark:text-indigo-400">
                                      <Building className="h-4 w-4 mr-2" />
                                      Associated Project
                                    </h4>
                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                                      <p className="font-semibold text-lg mb-1">
                                        {claim.contractId.projectId.name}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {claim.contractId.projectId.description}
                                      </p>
                                    </div>
                                  </div>

                                  <Separator />
                                </>
                              )}

                              {/* Contract Parties */}
                              <div>
                                <h4 className="font-medium mb-3 flex items-center text-indigo-700 dark:text-indigo-400">
                                  <User className="h-4 w-4 mr-2" />
                                  Contract Parties
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Contracted User */}
                                  {claim.contractId?.contractedUserId && (
                                    <div className="bg-muted/30 p-4 rounded-lg">
                                      <div className="flex items-center mb-3">
                                        <Avatar className="h-12 w-12 mr-3">
                                          <AvatarImage
                                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${
                                              claim.contractId.contractedUserId
                                                .firstName || "U"
                                            }%20${
                                              claim.contractId.contractedUserId
                                                .lastName || "N"
                                            }`}
                                          />
                                          <AvatarFallback>
                                            {getInitials(
                                              claim.contractId.contractedUserId
                                                .firstName || "U",
                                              claim.contractId.contractedUserId
                                                .lastName || "N"
                                            )}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <p className="text-xs text-muted-foreground mb-1">
                                            Contracted User
                                          </p>
                                          <p className="font-semibold">
                                            {claim.contractId.contractedUserId
                                              .firstName || ""}{" "}
                                            {claim.contractId.contractedUserId
                                              .lastName || ""}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {claim.contractId.contractedUserId
                                              .email || ""}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Created By */}
                                  {claim.contractId?.createdBy && (
                                    <div className="bg-muted/30 p-4 rounded-lg">
                                      <div className="flex items-center mb-3">
                                        <Avatar className="h-12 w-12 mr-3">
                                          <AvatarImage
                                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${
                                              claim.contractId.createdBy
                                                .firstName || "C"
                                            }%20${
                                              claim.contractId.createdBy
                                                .lastName || "B"
                                            }`}
                                          />
                                          <AvatarFallback>
                                            {getInitials(
                                              claim.contractId.createdBy
                                                .firstName || "C",
                                              claim.contractId.createdBy
                                                .lastName || "B"
                                            )}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <p className="text-xs text-muted-foreground mb-1">
                                            Created By
                                          </p>
                                          <p className="font-semibold">
                                            {claim.contractId.createdBy
                                              .firstName || ""}{" "}
                                            {claim.contractId.createdBy
                                              .lastName || ""}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {claim.contractId.createdBy.email ||
                                              ""}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Contract Description */}
                              {claim.contractId?.description && (
                                <>
                                  <Separator />
                                  <div>
                                    <h4 className="font-medium mb-3 flex items-center text-indigo-700 dark:text-indigo-400">
                                      <FileText className="h-4 w-4 mr-2" />
                                      Description
                                    </h4>
                                    <div className="bg-muted/30 p-4 rounded-lg">
                                      <p className="text-sm">
                                        {claim.contractId.description}
                                      </p>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Approval Tab C */}
                      {isApprovalPending && (
                        <TabsContent
                          value="approval"
                          className="mt-0 space-y-6"
                        >
                          <Card className="overflow-hidden border shadow-sm">
                            <CardHeader className="bg-purple-50 dark:bg-purple-950/40 px-6 py-4 flex flex-row items-center space-y-0 gap-2">
                              <ClipboardList className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                              <CardTitle className="text-lg font-semibold text-purple-700 dark:text-purple-400">
                                Claim Approval
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                              {isDeadlinePassed && (
                                <Alert variant="destructive" className="mb-6">
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertTitle>Deadline Passed</AlertTitle>
                                  <AlertDescription>
                                    This approval is past its deadline of{" "}
                                    {formatDate(claim.currentLevelDeadline)}{" "}
                                    {formatTime(claim.currentLevelDeadline)}
                                  </AlertDescription>
                                </Alert>
                              )}

                              <div className="space-y-6">
                                <div className="bg-muted/30 p-4 rounded-lg">
                                  <h3 className="text-base font-medium mb-3 flex items-center">
                                    <Shield className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
                                    {currentStep
                                      ? `${
                                          currentStep.department
                                        } ${currentStep.role
                                          .split("_")
                                          .join(" ")
                                          .toUpperCase()} Approval Required`
                                      : "Approval Required"}
                                  </h3>
                                  <p className="text-sm text-muted-foreground mb-4">
                                    {currentStep?.description ||
                                      "Please review this claim and provide your decision with appropriate comments."}
                                  </p>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-1">
                                      <span className="text-sm font-medium text-muted-foreground">
                                        Claim Amount
                                      </span>
                                      <p className="font-semibold text-lg text-purple-600 dark:text-purple-400">
                                        {formatCurrency(
                                          claim?.amount || 0,
                                          claim?.currency
                                        )}
                                      </p>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-sm font-medium text-muted-foreground">
                                        Deadline
                                      </span>
                                      <p
                                        className={cn(
                                          "font-medium",
                                          isDeadlinePassed
                                            ? "text-red-600 dark:text-red-400"
                                            : ""
                                        )}
                                      >
                                        {formatDate(claim.currentLevelDeadline)}
                                        {isDeadlinePassed && " (Overdue)"}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-base font-medium block mb-2">
                                    {currentStep
                                      ? `${
                                          currentStep.department
                                        } ${currentStep.role
                                          .split("_")
                                          .join(" ")
                                          .toUpperCase()} Comments (Optional)`
                                      : "Approval Comments (Optional)"}
                                  </label>
                                  <Textarea
                                    placeholder="Enter your comments regarding this claim approval or rejection (optional for approval, required for rejection)..."
                                    className="min-h-[120px] resize-none"
                                    value={comments}
                                    onChange={(e) =>
                                      setComments(e.target.value)
                                    }
                                  />
                                </div>

                                <div className="flex items-start space-x-3 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                                  <input
                                    type="checkbox"
                                    id="approvalConsent"
                                    checked={approvalConsent}
                                    onChange={(e) =>
                                      setApprovalConsent(e.target.checked)
                                    }
                                    className="mt-1 h-4 w-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                                  />
                                  <label
                                    htmlFor="approvalConsent"
                                    className="text-sm font-medium cursor-pointer"
                                  >
                                    I confirm that I have reviewed all claim
                                    details, supporting documents, and
                                    milestones, and I approve this claim for the
                                    amount of{" "}
                                    <span className="font-bold text-purple-700 dark:text-purple-400">
                                      {formatCurrency(
                                        claim?.amount || 0,
                                        claim?.currency
                                      )}
                                    </span>
                                    .
                                  </label>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                  <Button
                                    onClick={() => handleAction("approve")}
                                    className="flex-1"
                                    size="lg"
                                    variant="default"
                                    disabled={isSubmitting || !approvalConsent}
                                  >
                                    {isSubmitting &&
                                    actionType === "approve" ? (
                                      <div className="flex items-center space-x-2">
                                        <svg
                                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                        >
                                          <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                          ></circle>
                                          <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                          ></path>
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
                                    disabled={isSubmitting}
                                  >
                                    {isSubmitting && actionType === "reject" ? (
                                      <div className="flex items-center space-x-2">
                                        <svg
                                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                        >
                                          <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                          ></circle>
                                          <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                          ></path>
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
                            <CardTitle className="text-lg font-semibold text-teal-700 dark:text-teal-400">
                              Approval History
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="space-y-6">
                              {claim.auditTrail &&
                              claim.auditTrail.length > 0 ? (
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
                                            {formatDate(entry.performedAt)}{" "}
                                            {formatTime(entry.performedAt)}
                                          </div>
                                        </div>

                                        <div className="text-sm mb-3">
                                          <div className="flex items-center">
                                            <Avatar className="h-8 w-8 mr-2">
                                              <AvatarImage
                                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${
                                                  entry.performedBy
                                                    ?.firstName || "U"
                                                }%20${
                                                  entry.performedBy?.lastName ||
                                                  "N"
                                                }`}
                                              />
                                              <AvatarFallback className="text-xs">
                                                {entry.performedBy?.firstName &&
                                                entry.performedBy?.lastName
                                                  ? getInitials(
                                                      entry.performedBy
                                                        .firstName,
                                                      entry.performedBy.lastName
                                                    )
                                                  : "UN"}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div>
                                              <p className="font-medium">
                                                {entry.performedBy?.firstName ||
                                                  ""}{" "}
                                                {entry.performedBy?.lastName ||
                                                  ""}
                                              </p>
                                              <p className="text-xs text-muted-foreground flex items-center">
                                                <Mail className="h-3 w-3 mr-1" />
                                                {entry.performedBy?.email || ""}
                                              </p>
                                            </div>
                                          </div>
                                        </div>

                                        {entry.details && (
                                          <div className="bg-background p-4 rounded-md border text-sm">
                                            <div className="flex items-center mb-2">
                                              <Shield className="h-3.5 w-3.5 mr-1.5 text-teal-600 dark:text-teal-400" />
                                              <span className="font-medium capitalize">
                                                {entry.details.level} Level
                                              </span>
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
                                          <h4 className="font-medium">
                                            Checker Approval
                                          </h4>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          {formatDate(
                                            claim.approval.checkerApproval
                                              .approvedAt
                                          )}
                                        </div>
                                      </div>
                                      <div className="text-sm">
                                        <div className="flex items-center text-muted-foreground mb-2">
                                          <User className="h-3.5 w-3.5 mr-1.5" />
                                          Approved by:{" "}
                                          {
                                            claim.approval.checkerApproval
                                              .approvedBy
                                          }
                                        </div>
                                        <div className="bg-white dark:bg-green-950 p-3 rounded-md border text-sm">
                                          {
                                            claim.approval.checkerApproval
                                              .comments
                                          }
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {claim.approval.managerApproval && (
                                    <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                                      <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center">
                                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                                          <h4 className="font-medium">
                                            Manager Approval
                                          </h4>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          {formatDate(
                                            claim.approval.managerApproval
                                              .approvedAt
                                          )}
                                        </div>
                                      </div>
                                      <div className="text-sm">
                                        <div className="flex items-center text-muted-foreground mb-2">
                                          <User className="h-3.5 w-3.5 mr-1.5" />
                                          Approved by:{" "}
                                          {
                                            claim.approval.managerApproval
                                              .approvedBy
                                          }
                                        </div>
                                        <div className="bg-white dark:bg-green-950 p-3 rounded-md border text-sm">
                                          {
                                            claim.approval.managerApproval
                                              .comments
                                          }
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {claim.approval.financeApproval && (
                                    <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                                      <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center">
                                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                                          <h4 className="font-medium">
                                            Finance Approval
                                          </h4>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          {formatDate(
                                            claim.approval.financeApproval
                                              .approvedAt
                                          )}
                                        </div>
                                      </div>
                                      <div className="text-sm">
                                        <div className="flex items-center text-muted-foreground mb-2">
                                          <User className="h-3.5 w-3.5 mr-1.5" />
                                          Approved by:{" "}
                                          {
                                            claim.approval.financeApproval
                                              .approvedBy
                                          }
                                        </div>
                                        <div className="bg-white dark:bg-green-950 p-3 rounded-md border text-sm">
                                          {
                                            claim.approval.financeApproval
                                              .comments
                                          }
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

                      {/* Payment Tab */}
                      {claim.status === "approved" && (
                        <TabsContent value="payment" className="mt-0 space-y-6">
                          <Card className="overflow-hidden border shadow-sm">
                            <CardHeader className="bg-emerald-50 dark:bg-emerald-950/40 px-6 py-4 flex flex-row items-center space-y-0 gap-2">
                              <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                              <CardTitle className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                                Mark Claim as Paid
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                              <Alert className="mb-6">
                                <Info className="h-4 w-4" />
                                <AlertTitle>Payment Advice Required</AlertTitle>
                                <AlertDescription>
                                  You must upload a payment advice document
                                  before marking this claim as paid. This is
                                  mandatory for audit purposes.
                                </AlertDescription>
                              </Alert>

                              <div className="space-y-6">
                                <div className="bg-muted/30 p-4 rounded-lg">
                                  <h3 className="text-base font-medium mb-3 flex items-center">
                                    <Receipt className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                                    Claim Summary
                                  </h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <span className="text-sm font-medium text-muted-foreground">
                                        Claim Amount
                                      </span>
                                      <p className="font-semibold text-lg text-emerald-600 dark:text-emerald-400">
                                        {formatCurrency(
                                          claim?.amount || 0,
                                          claim?.currency
                                        )}
                                      </p>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-sm font-medium text-muted-foreground">
                                        Claimant
                                      </span>
                                      <p className="font-medium">
                                        {claim.claimantId?.firstName}{" "}
                                        {claim.claimantId?.lastName}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="paymentMethod">
                                      Payment Method *
                                    </Label>
                                    <Select
                                      value={paymentMethod}
                                      onValueChange={setPaymentMethod}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select payment method" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="bank_transfer">
                                          Bank Transfer
                                        </SelectItem>
                                        <SelectItem value="mpesa">
                                          M-Pesa
                                        </SelectItem>
                                        <SelectItem value="cheque">
                                          Cheque
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="transactionId">
                                      Transaction ID *
                                    </Label>
                                    <Input
                                      id="transactionId"
                                      placeholder="Enter transaction ID"
                                      value={transactionId}
                                      onChange={(e) =>
                                        setTransactionId(e.target.value)
                                      }
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="paymentReference">
                                      Payment Reference (Optional)
                                    </Label>
                                    <Input
                                      id="paymentReference"
                                      placeholder="Enter payment reference"
                                      value={paymentReference}
                                      onChange={(e) =>
                                        setPaymentReference(e.target.value)
                                      }
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Payment Advice Document *</Label>
                                    <FileUpload
                                      onChange={async (files) => {
                                        if (files.length > 0) {
                                          setIsUploadingPayment(true);
                                          try {
                                            const url =
                                              await cloudinaryService.uploadFile(
                                                files[0]
                                              );
                                            setPaymentAdviceUrl(url);
                                            toast({
                                              title: "Success",
                                              description:
                                                "Payment advice uploaded successfully.",
                                            });
                                          } catch (error) {
                                            toast({
                                              title: "Upload Failed",
                                              description:
                                                "Could not upload payment advice.",
                                              variant: "destructive",
                                            });
                                          } finally {
                                            setIsUploadingPayment(false);
                                          }
                                        }
                                      }}
                                    />
                                    {paymentAdviceUrl && (
                                      <a
                                        href={paymentAdviceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-500 hover:underline flex items-center mt-2"
                                      >
                                        <FileText className="h-3 w-3 mr-1" />
                                        View Uploaded Payment Advice
                                      </a>
                                    )}
                                  </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                  <Button
                                    onClick={handleMarkAsPaid}
                                    className="flex-1"
                                    size="lg"
                                    variant="default"
                                    disabled={
                                      isSubmitting ||
                                      isUploadingPayment ||
                                      !paymentAdviceUrl ||
                                      !transactionId.trim()
                                    }
                                  >
                                    {isSubmitting &&
                                    actionType === "payment" ? (
                                      <div className="flex items-center space-x-2">
                                        <Spinner />
                                        <span>Processing Payment...</span>
                                      </div>
                                    ) : (
                                      <>
                                        <CheckCircle2 className="mr-2 h-5 w-5" />
                                        Mark as Paid
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      )}

                      {/* Payment Details Tab */}
                      {claim.status === "paid" && claim.payment && (
                        <TabsContent
                          value="payment-details"
                          className="mt-0 space-y-6"
                        >
                          <Card className="overflow-hidden border shadow-sm">
                            <CardHeader className="bg-green-50 dark:bg-green-950/40 px-6 py-4 flex flex-row items-center space-y-0 gap-2">
                              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                              <CardTitle className="text-lg font-semibold text-green-700 dark:text-green-400">
                                Payment Completed
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                              <div className="space-y-6">
                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                                  <div className="flex items-center mb-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                                    <h3 className="text-base font-medium text-green-700 dark:text-green-400">
                                      Payment Successfully Processed
                                    </h3>
                                  </div>
                                  <p className="text-sm text-green-600 dark:text-green-300">
                                    This claim has been marked as paid and the
                                    payment has been processed.
                                  </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-4">
                                    <div className="space-y-1">
                                      <div className="flex items-center text-sm font-medium text-muted-foreground">
                                        <DollarSign className="h-3.5 w-3.5 mr-1.5" />
                                        Payment Amount
                                      </div>
                                      <p className="font-semibold text-lg text-green-600 dark:text-green-400">
                                        {formatCurrency(
                                          claim.amount || 0,
                                          claim.currency
                                        )}
                                      </p>
                                    </div>

                                    <div className="space-y-1">
                                      <div className="flex items-center text-sm font-medium text-muted-foreground">
                                        <Receipt className="h-3.5 w-3.5 mr-1.5" />
                                        Payment Method
                                      </div>
                                      <p className="font-medium capitalize">
                                        {claim.payment.paymentMethod.replace(
                                          "_",
                                          " "
                                        )}
                                      </p>
                                    </div>

                                    <div className="space-y-1">
                                      <div className="flex items-center text-sm font-medium text-muted-foreground">
                                        <Tag className="h-3.5 w-3.5 mr-1.5" />
                                        Transaction ID
                                      </div>
                                      <p className="font-medium font-mono text-sm bg-muted px-2 py-1 rounded">
                                        {claim.payment.transactionId}
                                      </p>
                                    </div>

                                    {claim.payment.reference && (
                                      <div className="space-y-1">
                                        <div className="flex items-center text-sm font-medium text-muted-foreground">
                                          <FileText className="h-3.5 w-3.5 mr-1.5" />
                                          Payment Reference
                                        </div>
                                        <p className="font-medium">
                                          {claim.payment.reference}
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  <div className="space-y-4">
                                    <div className="space-y-1">
                                      <div className="flex items-center text-sm font-medium text-muted-foreground">
                                        <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                                        Payment Date
                                      </div>
                                      <p className="font-medium">
                                        {formatDate(claim.payment.paidAt)}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {formatTime(claim.payment.paidAt)}
                                      </p>
                                    </div>

                                    <div className="space-y-1">
                                      <div className="flex items-center text-sm font-medium text-muted-foreground">
                                        <User className="h-3.5 w-3.5 mr-1.5" />
                                        Processed By
                                      </div>
                                      <p className="font-medium">
                                        {typeof claim.payment.paidBy ===
                                        "object"
                                          ? `${claim.payment.paidBy.firstName} ${claim.payment.paidBy.lastName}`
                                          : claim.payment.paidBy}
                                      </p>
                                    </div>

                                    <div className="space-y-1">
                                      <div className="flex items-center text-sm font-medium text-muted-foreground">
                                        <FileText className="h-3.5 w-3.5 mr-1.5" />
                                        Payment Advice
                                      </div>
                                      <a
                                        href={claim.payment.paymentAdviceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                      >
                                        <FileText className="h-3.5 w-3.5 mr-1.5" />
                                        View Payment Advice Document
                                      </a>
                                    </div>
                                  </div>
                                </div>

                                <Separator />

                                <div className="bg-muted/30 p-4 rounded-lg">
                                  <h4 className="font-medium mb-3 flex items-center">
                                    <Info className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                                    Payment Summary
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">
                                        Claimant
                                      </span>
                                      <p className="font-medium">
                                        {claim.claimantId?.firstName}{" "}
                                        {claim.claimantId?.lastName}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Contract
                                      </span>
                                      <p className="font-medium">
                                        {claim.contractId?.contractNumber}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Project
                                      </span>
                                      <p className="font-medium">
                                        {claim.projectId?.name}
                                      </p>
                                    </div>
                                  </div>
                                </div>
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
                  <Button
                    variant="outline"
                    size="lg"
                    className={isApprovalPending ? "flex-1" : "w-full"}
                  >
                    Close
                  </Button>
                </DrawerClose>
              </div>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </TooltipProvider>
  );
}
