"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Contract,
  ContractStatus,
  Amendment,
  ApprovalEntry,
} from "@/types/contract";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { approveContract, rejectContract } from "@/services/contracts.service";
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
  Loader2,
  Download,
  FileCheck,
  ChevronDown,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  const [isDocumentOpen, setIsDocumentOpen] = useState(false);
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
  const hasApprovalFlow =
    contract.approvalFlow &&
    ((contract.approvalFlow.financeApprovals &&
      contract.approvalFlow.financeApprovals.length > 0) ||
      (contract.approvalFlow.mdApprovals &&
        contract.approvalFlow.mdApprovals.length > 0) ||
      contract.finalApproval ||
      contract.rejectionDetails);

  const hasAmendments = contract.amendments && contract.amendments.length > 0;
  const hasContractDetails =
    contract.templateSnapshot &&
    contract.templateSnapshot.content &&
    contract.templateSnapshot.content.trim().length > 0;
  const handleDownloadPDF = async () => {
    if (!hasContractDetails || !contract.templateSnapshot?.content) return;

    try {
      // Create a printable HTML document
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast({
          title: "Popup Blocked",
          description: "Please allow popups to download the PDF",
          variant: "destructive",
        });
        return;
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Contract ${contract.contractNumber}</title>
            <style>
              @page {
                size: A4;
                margin: 2.5cm 2cm 2cm 2cm;
              }
              body {
                font-family: 'Times New Roman', Times, serif;
                line-height: 1.6;
                color: #000;
                font-size: 12pt;
                margin: 0;
                padding: 0;
              }
              .page-container {
                position: relative;
                min-height: 100vh;
                padding-bottom: 180px;
              }
              .contract-header {
                text-align: right;
                margin-bottom: 30px;
                padding-bottom: 15px;
                border-bottom: 2px solid #003366;
              }
              .contract-ref {
                font-weight: bold;
                font-size: 11pt;
                color: #003366;
              }
              .contract-content {
                white-space: pre-line;
                text-align: justify;
                margin-bottom: 60px;
              }
              .signature-section {
                margin-top: 60px;
                page-break-inside: avoid;
              }
              .signature-label {
                font-weight: bold;
                margin-top: 6px;
                color: #003366;
              }
              .md-signature {
                margin-top: 30px;
                display: flex;
                align-items: flex-end;
                justify-content: space-between;
                gap: 24px;
              }
              .signature-image {
                width: 160px;
                height: auto;
              }
              .stamp-image {
                width: 180px;
                height: auto;
                opacity: 0.95;
              }
              .md-signature {
                margin-top: 40px;
                display: flex;
                align-items: center;
                gap: 40px;
              }
              .signature-image {
                width: 220px;
                height: auto;
              }
              .stamp-image {
                width: 140px;
                height: auto;
                opacity: 0.9;
              }
              .footer {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                top:10;
                padding: 15px 30px;
                font-size: 9pt;
                line-height: 1.4;
              }
              .footer-content {
                max-width: 800px;
                margin: 0 auto;
              }
              .footer-title {
                font-weight: bold;
                font-size: 10pt;
                margin-bottom: 8px;
                letter-spacing: 0.5px;
              }
              .footer-details {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
              }
              .footer-item {
                flex: 1;
                min-width: 200px;
              }
              .footer-label {
                font-weight: bold;
                display: inline;
              }
              @media print {
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .footer {
                  position: fixed;
                  bottom: 0;
                }
              }
            </style>
          </head>
          <body>
            <div class="page-container">
              <div class="contract-header">
                <div class="contract-ref">Contract Ref. No: ${
                  contract.contractNumber
                }</div>
                <div style="font-size: 10pt; color: #666; margin-top: 5px;">
                  Date: ${formatDate(contract.createdAt || contract.startDate)}
                </div>
              </div>
              
              <div class="contract-content">
                ${contract.templateSnapshot.content}
              </div>

              <div class="signature-section">
                <div class="md-signature">
                  <div style="text-align:center;">
                    <img src="${location.origin}/srcc/owande_signature.png" alt="MD Signature" class="signature-image" />
                    <div class="signature-label">Managing Director</div>
                  </div>
                  <img src="${location.origin}/srcc/srcc_stamp.jpg" alt="SRCC Stamp" class="stamp-image" />
                </div>
              </div>
            </div>

           
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 250);
      };

      toast({
        title: "PDF Ready",
        description: "Print dialog opened. Save as PDF to download.",
      });
      setTimeout(() => {
        location.reload();
      }, 2500);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

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
                className={cn(
                  "border px-3 py-1",
                  getStatusColor(contract.status)
                )}
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
                    value="document"
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3 h-full"
                  >
                    <FileCheck className="h-4 w-4 mr-2" />
                    Contract Document
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
                    Consultant
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
                          <h3 className="text-lg font-semibold">
                            Contract Information
                          </h3>
                        </div>
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                              <span className="text-sm font-medium text-muted-foreground">
                                Contract Number
                              </span>
                              <p className="font-semibold text-lg">
                                {contract.contractNumber}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-sm font-medium text-muted-foreground">
                                Project
                              </span>
                              <p className="font-semibold text-lg">
                                {contract.projectId?.name || "N/A"}
                              </p>
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-1">
                              <span className="text-sm font-medium text-muted-foreground">
                                Description
                              </span>
                              <p className="font-medium">
                                {contract.description}
                              </p>
                            </div>

                            {contract.currentLevelDeadline && (
                              <div className="space-y-1">
                                <span className="text-sm font-medium text-muted-foreground flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  Approval Deadline
                                </span>
                                <p
                                  className={cn(
                                    "font-medium",
                                    contract.currentLevelDeadline &&
                                      new Date(contract.currentLevelDeadline) <
                                        new Date()
                                      ? "text-red-600 dark:text-red-400"
                                      : ""
                                  )}
                                >
                                  {formatDate(contract.currentLevelDeadline)}
                                  {contract.currentLevelDeadline &&
                                    new Date(contract.currentLevelDeadline) <
                                      new Date() &&
                                    " (Overdue)"}
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
                            <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                              Financial Summary
                            </h3>
                          </div>
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="space-y-1">
                                <span className="text-sm font-medium text-muted-foreground">
                                  Contract Value
                                </span>
                                <p className="font-semibold text-lg text-emerald-600 dark:text-emerald-400">
                                  {formatCurrency(
                                    contract.contractValue,
                                    contract.currency
                                  )}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-sm font-medium text-muted-foreground">
                                  Duration
                                </span>
                                <p className="font-medium">
                                  {formatDate(contract.startDate)} -{" "}
                                  {formatDate(contract.endDate)}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="overflow-hidden border shadow-sm">
                          <div className="bg-blue-50 dark:bg-blue-950/40 px-6 py-4 flex items-center">
                            <User className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                            <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                              Consultant Summary
                            </h3>
                          </div>
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="space-y-1">
                                <span className="text-sm font-medium text-muted-foreground">
                                  Name
                                </span>
                                <p className="font-medium">
                                  {contract.contractedUserId?.firstName}{" "}
                                  {contract.contractedUserId?.lastName}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-sm font-medium text-muted-foreground">
                                  Email
                                </span>
                                <p className="font-medium">
                                  {contract.contractedUserId?.email}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    {/* Contract Document Tab */}
                    <TabsContent value="document" className="mt-0 space-y-6">
                      <Collapsible
                        open={isDocumentOpen}
                        onOpenChange={setIsDocumentOpen}
                      >
                        <Card className="overflow-hidden border shadow-sm">
                          <CollapsibleTrigger className="w-full">
                            <div className="bg-indigo-50 dark:bg-indigo-950/40 px-6 py-4 flex items-center justify-between hover:bg-indigo-100 dark:hover:bg-indigo-950/60 transition-colors">
                              <div className="flex items-center gap-2">
                                <FileCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-400">
                                  Contract Document
                                </h3>
                                <ChevronDown
                                  className={cn(
                                    "h-4 w-4 text-indigo-600 dark:text-indigo-400 transition-transform duration-200",
                                    isDocumentOpen && "rotate-180"
                                  )}
                                />
                              </div>
                              {hasContractDetails && (
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadPDF();
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center gap-2"
                                >
                                  <Download className="h-4 w-4" />
                                  Download PDF
                                </Button>
                              )}
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent
                              id="contract-scroll-container"
                              className="p-6 relative max-h-[70vh] overflow-y-auto"
                              style={{ scrollBehavior: "smooth" }}
                            >
                              {hasContractDetails ? (
                                <div className="bg-white dark:bg-gray-950 border rounded-lg p-8 shadow-inner">
                                  <div className="max-w-3xl mx-auto pr-0">
                                    {/* Contract Header */}
                                    <div className="mb-6 pb-4 border-b">
                                      <div className="text-sm font-medium text-muted-foreground mb-2">
                                        Contract Reference Number
                                      </div>
                                      <div className="text-lg font-semibold">
                                        {contract.contractNumber}
                                      </div>
                                      <div className="text-sm text-muted-foreground mt-2">
                                        Date:{" "}
                                        {formatDate(
                                          contract.createdAt ||
                                            contract.startDate
                                        )}
                                      </div>
                                    </div>

                                    {/* Contract Content */}
                                    <div
                                      className="prose prose-sm dark:prose-invert max-w-none"
                                      style={{
                                        whiteSpace: "pre-line",
                                        lineHeight: "1.8",
                                        fontFamily: "Georgia, serif",
                                      }}
                                    >
                                      {contract.templateSnapshot
                                        ?.contentType === "html" ? (
                                        <div
                                          dangerouslySetInnerHTML={{
                                            __html:
                                              contract.templateSnapshot
                                                ?.content || "",
                                          }}
                                        />
                                      ) : (
                                        <div>
                                          {contract.templateSnapshot?.content ||
                                            "No content available"}
                                        </div>
                                      )}
                                    </div>

                                    {/* Metadata */}
                                    {contract.templateSnapshot?.version && (
                                      <div className="mt-8 pt-4 border-t text-xs text-muted-foreground">
                                        <div>
                                          Version:{" "}
                                          {contract.templateSnapshot.version}
                                        </div>
                                        {contract.templateSnapshot
                                          .contentType && (
                                          <div>
                                            Format:{" "}
                                            {
                                              contract.templateSnapshot
                                                .contentType
                                            }
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  {/* Bottom gradient scroll hint */}
                                  <div className="pointer-events-none absolute left-1/2 right-0 bottom-60 h-14 bg-gradient-to-t from-white/95 dark:from-gray-950/95 to-transparent flex items-end justify-center">
                                    <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                                      <span className="hidden sm:inline">Scroll to read more</span>
                                      <ChevronDown className="h-3.5 w-3.5" />
                                    </div>
                                  </div>

                                  {/* Floating Scroll Button */}
                                  <Button
                                    type="button"
                                    size="icon"
                                    aria-label="Scroll down"
                                    title="Scroll down"
                                    className="absolute left-3/4 -translate-x-1/2 bottom-72 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-400 animate-bounce"
                                    onClick={() => {
                                      const el = document.getElementById(
                                        "contract-scroll-container"
                                      );
                                      if (el) {
                                        el.scrollBy({
                                          top: Math.round(el.clientHeight * 0.85),
                                          behavior: "smooth",
                                        });
                                      }
                                    }}
                                  >
                                    <ChevronDown className="h-5 w-5" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="text-center py-12">
                                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                  <p className="text-muted-foreground text-lg font-medium mb-2">
                                    No Contract Document Available
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    The contract document has not been generated
                                    yet.
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>

                      {contract.attachments &&
                        contract.attachments.length > 0 && (
                          <Card className="overflow-hidden border shadow-sm">
                            <div className="bg-slate-50 dark:bg-slate-900/40 px-6 py-4 flex items-center">
                              <FileText className="h-5 w-5 mr-2 text-slate-600 dark:text-slate-300" />
                              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                                Attachments
                              </h3>
                            </div>
                            <CardContent className="p-6">
                              <div className="space-y-3">
                                {contract.attachments.map((att, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between border rounded-md p-3"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <FileText className="h-4 w-4 text-muted-foreground" />
                                      <a
                                        href={att.url}
                                        // target="_blank"
                                        rel="noreferrer"
                                        className="font-medium truncate hover:underline"
                                        title={att.name}
                                      >
                                        {att.name || att.url}
                                      </a>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <a
                                        href={att.url}
                                        // target="_blank"
                                        rel="noreferrer"
                                      >
                                        <Button variant="outline" size="sm">
                                          View
                                        </Button>
                                      </a>
                                      <a href={att.url} download>
                                        <Button
                                          variant="secondary"
                                          size="sm"
                                          className="flex items-center gap-1"
                                        >
                                          <Download className="h-3 w-3" />
                                          Download
                                        </Button>
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                    </TabsContent>

                    {/* Financial Tab */}
                    <TabsContent value="financial" className="mt-0 space-y-6">
                      <Card className="overflow-hidden border shadow-sm">
                        <div className="bg-emerald-50 dark:bg-emerald-950/40 px-6 py-4 flex items-center">
                          <DollarSign className="h-5 w-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                          <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                            Financial Details
                          </h3>
                        </div>
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                              <span className="text-sm font-medium text-muted-foreground">
                                Contract Value
                              </span>
                              <p className="font-semibold text-xl text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(
                                  contract.contractValue,
                                  contract.currency
                                )}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-sm font-medium text-muted-foreground">
                                Currency
                              </span>
                              <p className="font-medium text-lg">
                                {contract.currency}
                              </p>
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
                          <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                            Payment Schedule
                          </h3>
                        </div>
                        <CardContent className="p-6">
                          <div className="text-center text-muted-foreground py-6">
                            Payment schedule information will appear here when
                            available.
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Consultant Tab */}
                    <TabsContent value="contractor" className="mt-0 space-y-6">
                      <Card className="overflow-hidden border shadow-sm">
                        <div className="bg-blue-50 dark:bg-blue-950/40 px-6 py-4 flex items-center">
                          <User className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                          <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                            Consultant Information
                          </h3>
                        </div>
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                              <span className="text-sm font-medium text-muted-foreground">
                                Name
                              </span>
                              <p className="font-semibold text-lg">
                                {contract.contractedUserId?.firstName}{" "}
                                {contract.contractedUserId?.lastName}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-sm font-medium text-muted-foreground">
                                Email
                              </span>
                              <p className="font-medium">
                                {contract.contractedUserId?.email}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-sm font-medium text-muted-foreground">
                                Phone
                              </span>
                              <p className="font-medium">
                                {contract.contractedUserId?.phoneNumber}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Additional Consultant information could go here */}
                      <Card className="overflow-hidden border shadow-sm">
                        <div className="bg-blue-50/50 dark:bg-blue-950/20 px-6 py-4 flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                          <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                            Consultant Documents
                          </h3>
                        </div>
                        <CardContent className="p-6">
                          <div className="text-center text-muted-foreground py-6">
                            Consultant documents will appear here when
                            available.
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
                            <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-400">
                              Contract Approval
                            </h3>
                          </div>
                          <CardContent className="p-6">
                            {contract.currentLevelDeadline &&
                              new Date(contract.currentLevelDeadline) <
                                new Date() && (
                                <Alert className="mb-6" variant="destructive">
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertDescription>
                                    This approval is past its deadline of{" "}
                                    {formatDate(contract.currentLevelDeadline)}
                                  </AlertDescription>
                                </Alert>
                              )}

                            <div className="space-y-6">
                              <div>
                                <label className="text-base font-medium block mb-2">
                                  {currentLevel === "finance"
                                    ? "Finance Approval Comments"
                                    : "MD Approval Comments"}
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
                                  disabled={
                                    isApproving ||
                                    isRejecting ||
                                    !comments.trim()
                                  }
                                >
                                  {isApproving ? (
                                    <div className="flex items-center space-x-2">
                                      <Spinner />
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
                                  disabled={
                                    isApproving ||
                                    isRejecting ||
                                    !comments.trim()
                                  }
                                >
                                  {isRejecting ? (
                                    <div className="flex items-center space-x-2">
                                      <Spinner />
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
                            <h3 className="text-lg font-semibold text-teal-700 dark:text-teal-400">
                              Approval History
                            </h3>
                          </div>
                          <CardContent className="p-6">
                            <div className="space-y-6">
                              {contract?.approvalFlow?.financeApprovals &&
                                contract.approvalFlow.financeApprovals.length >
                                  0 && (
                                  <div>
                                    <h4 className="font-medium mb-3 flex items-center">
                                      <DollarSign className="h-4 w-4 mr-1" />
                                      Finance Approvals
                                    </h4>
                                    <div className="space-y-3">
                                      {contract.approvalFlow.financeApprovals.map(
                                        (approval: ApprovalEntry, index) => (
                                          <div
                                            key={index}
                                            className="bg-muted/40 rounded-lg p-3"
                                          >
                                            <div className="text-sm font-medium text-muted-foreground mb-2">
                                              Approved on{" "}
                                              {formatDate(approval.approvedAt)}
                                            </div>
                                            {approval.comments && (
                                              <div className="bg-background p-3 rounded-md border text-sm">
                                                {approval.comments}
                                              </div>
                                            )}
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                              {contract?.approvalFlow?.mdApprovals &&
                                contract.approvalFlow.mdApprovals.length >
                                  0 && (
                                  <div>
                                    <h4 className="font-medium mb-3 flex items-center">
                                      <User className="h-4 w-4 mr-1" />
                                      MD Approvals
                                    </h4>
                                    <div className="space-y-3">
                                      {contract.approvalFlow.mdApprovals.map(
                                        (approval: ApprovalEntry, index) => (
                                          <div
                                            key={index}
                                            className="bg-muted/40 rounded-lg p-3"
                                          >
                                            <div className="text-sm font-medium text-muted-foreground mb-2">
                                              Approved on{" "}
                                              {formatDate(approval.approvedAt)}
                                            </div>
                                            {approval.comments && (
                                              <div className="bg-background p-3 rounded-md border text-sm">
                                                {approval.comments}
                                              </div>
                                            )}
                                          </div>
                                        )
                                      )}
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
                                      Approved on{" "}
                                      {formatDate(
                                        contract.finalApproval.approvedAt
                                      )}
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
                                      Rejected on{" "}
                                      {formatDate(
                                        contract.rejectionDetails.rejectedAt
                                      )}
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
                      <TabsContent
                        value="amendments"
                        className="mt-0 space-y-6"
                      >
                        <Card className="overflow-hidden border shadow-sm">
                          <div className="bg-amber-50 dark:bg-amber-950/40 px-6 py-4 flex items-center">
                            <FileEdit className="h-5 w-5 mr-2 text-amber-600 dark:text-amber-400" />
                            <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-400">
                              Amendments
                            </h3>
                          </div>
                          <CardContent className="p-6">
                            <div className="space-y-5">
                              {contract?.amendments?.map(
                                (amendment: Amendment, index) => (
                                  <div
                                    key={amendment._id || index}
                                    className={cn(
                                      "pb-5",
                                      index !==
                                        (contract?.amendments?.length || 2) -
                                          1 && "border-b"
                                    )}
                                  >
                                    <div className="flex items-center mb-3">
                                      <div className="bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold mr-2">
                                        {index + 1}
                                      </div>
                                      <h4 className="font-medium">
                                        Amendment {index + 1}
                                      </h4>
                                    </div>
                                    <p className="text-sm mt-1">
                                      {amendment.description ||
                                        "No description"}
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                                      {amendment.date && (
                                        <div className="flex items-center">
                                          <Calendar className="h-3.5 w-3.5 mr-1" />
                                          {formatDate(amendment.date)}
                                        </div>
                                      )}
                                      {amendment?.approvedBy && (
                                        <div className="flex items-center">
                                          <User className="h-3.5 w-3.5 mr-1" />
                                          <span>
                                            {`${(amendment as any)?.approvedBy?.firstName || ""} ${(amendment as any)?.approvedBy?.lastName || ""}`.trim() || "—"}
                                          </span>
                                        </div>
                                      )}
                                      {amendment.changedFields &&
                                        amendment.changedFields.length > 0 && (
                                          <div className="flex items-start">
                                            <span className="mr-1">
                                              Changed:
                                            </span>
                                            <span className="font-medium">
                                              {amendment.changedFields.join(
                                                ", "
                                              )}
                                            </span>
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                )
                              )}
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
              <Button variant="outline" size="lg">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
