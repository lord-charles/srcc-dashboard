"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import type { Contract, Amendment } from "@/types/contract";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  createClaim,
  fetchClaimsByContract,
} from "@/services/contracts.service";
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
  Download,
  FileCheck,
  ChevronDown,
} from "lucide-react";
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { ProjectMilestone } from "@/types/project";

interface MyContractDetailsDrawerProps {
  contract: Contract;
  onClose?: () => void;
  onGenerateOtp?: (contractId: string) => void;
  otpGenerating?: boolean;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
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
  }).format(amount);
};

const statusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "pending_acceptance":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case "expired":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "MMM d, yyyy HH:mm");
  } catch (error) {
    return "Invalid Date";
  }
};

export function MyContractDetailsDrawer({
  contract,
  onClose,
  onGenerateOtp,
  otpGenerating,
  trigger,
  open,
  onOpenChange,
}: MyContractDetailsDrawerProps) {
  const [selectedMilestones, setSelectedMilestones] = useState<
    Record<string, MilestoneData>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claimsHistory, setClaimsHistory] = useState<any[]>([]);
  const [isLoadingClaims, setIsLoadingClaims] = useState(false);
  const { toast } = useToast();

  const hasContractDetails =
    contract.templateSnapshot &&
    contract.templateSnapshot.content &&
    contract.templateSnapshot.content.trim().length > 0;
  const loadClaimsHistory = async () => {
    try {
      setIsLoadingClaims(true);
      const claims = await fetchClaimsByContract(contract._id);
      setClaimsHistory(claims);
    } catch (error: any) {
      toast({
        title: "Failed to Load Claims",
        description: error.message || "Could not load claims history",
        variant: "destructive",
      });
    } finally {
      setIsLoadingClaims(false);
    }
  };

  useEffect(() => {
    if (open && contract._id) {
      loadClaimsHistory();
    }
  }, [open, contract._id]);

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "paid":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return status.includes("pending")
          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
          : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <CheckCircle2 className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "paid":
        return <Receipt className="h-4 w-4" />;
      case "cancelled":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return status.includes("pending") ? (
          <Clock className="h-4 w-4" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        );
    }
  };

  const calculateMaxClaimAmount = () => {
    if (
      !contract.projectId ||
      !contract.projectId.milestones ||
      contract.projectId.milestones.length === 0
    ) {
      return 0;
    }
    const maxPerMilestone =
      contract.contractValue / contract.projectId.milestones.length;
    return maxPerMilestone;
  };

  const handleMilestoneAmountChange = (milestoneId: string, value: string) => {
    const amount = Math.max(0, Number(value) || 0);
    const maxAmount = calculateMaxClaimAmount();
    const percentage = Math.min(100, (amount / maxAmount) * 100);

    setSelectedMilestones((prev) => ({
      ...prev,
      [milestoneId]: { amount, percentage },
    }));
  };

  const calculateTotalClaimAmount = () => {
    return Object.values(selectedMilestones).reduce(
      (total, { amount }) => total + amount,
      0
    );
  };

  const handleSubmitClaim = async () => {
    const totalAmount = calculateTotalClaimAmount();
    if (totalAmount <= 0) {
      toast({
        title: "Invalid Claim Amount",
        description: "Please select at least one milestone to claim",
        variant: "destructive",
      });
      return;
    }

    const milestones = Object.entries(selectedMilestones)
      .filter(([_, { amount }]) => amount > 0)
      .map(([milestoneId, { percentage }]) => {
        const milestone = contract.projectId?.milestones?.find(
          (m) => m._id === milestoneId
        );
        return {
          milestoneId,
          title: milestone?.title || "",
          percentageClaimed: percentage,
        };
      });

    try {
      setIsSubmitting(true);
      await createClaim({
        projectId: contract?.projectId._id,
        contractId: contract._id,
        amount: totalAmount,
        currency: contract.currency,
        milestones,
      });

      toast({
        title: "Claim Submitted",
        description: "Your claim has been submitted successfully",
      });

      setSelectedMilestones({});
      onClose?.();
    } catch (error: any) {
      toast({
        title: "Failed to Submit Claim",
        description:
          error.message || "An error occurred while submitting your claim",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!hasContractDetails || !contract.templateSnapshot?.content) return;

    try {
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
              .footer {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                color: white;
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
                    <img src="${
                      location.origin
                    }/srcc/owande_signature.png" alt="MD Signature" class="signature-image" />
                    <div class="signature-label">Managing Director</div>
                  </div>
                  <img src="${
                    location.origin
                  }/srcc/srcc_stamp.jpg" alt="SRCC Stamp" class="stamp-image" />
                </div>
              </div>
            </div>


          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 250);
      };

      toast({
        title: "PDF Ready",
        description: "Print dialog opened. Save as PDF to download.",
      });
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
              <Badge
                variant="outline"
                className={cn("border px-3 py-1", statusColor(contract.status))}
              >
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
                  {hasContractDetails && (
                    <TabsTrigger
                      value="document"
                      className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3 h-full"
                    >
                      <FileCheck className="h-4 w-4 mr-2" />
                      Contract Document
                    </TabsTrigger>
                  )}
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
                <ScrollArea
                  id="my-contract-scroll-area"
                  className="h-[calc(95vh-13rem)] w-full"
                >
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
                              <label className="text-sm font-medium text-muted-foreground">
                                Project Name
                              </label>
                              <p className="text-lg font-semibold">
                                {contract.projectId?.name || "Not available"}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">
                                Contract Value
                              </label>
                              <p className="text-lg font-semibold text-primary">
                                {formatCurrency(
                                  contract.contractValue,
                                  contract.currency
                                )}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">
                                Start Date
                              </label>
                              <p className="text-base">
                                {format(
                                  new Date(contract.startDate),
                                  "MMM d, yyyy"
                                )}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">
                                End Date
                              </label>
                              <p className="text-base">
                                {format(
                                  new Date(contract.endDate),
                                  "MMM d, yyyy"
                                )}
                              </p>
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
                                <TableCell className="font-medium">
                                  Contract Number
                                </TableCell>
                                <TableCell>{contract.contractNumber}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  Description
                                </TableCell>
                                <TableCell>{contract.description}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  Created At
                                </TableCell>
                                <TableCell>
                                  {formatDate(contract?.createdAt)}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">
                                  Last Updated
                                </TableCell>
                                <TableCell>
                                  {formatDate(contract?.updatedAt)}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>

                      {contract.status.toLowerCase() ===
                        "pending_acceptance" && (
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
                                Accepting the contract will make it active and
                                legally binding.
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

                    {/* Contract Document Tab */}
                    <TabsContent value="document" className="mt-0 space-y-6">
                      <Card className="overflow-hidden border shadow-sm">
                        <div className="bg-indigo-50 dark:bg-indigo-950/40 px-6 py-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <FileCheck className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                            <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-400">
                              Contract Document
                            </h3>
                          </div>
                          {hasContractDetails && (
                            <Button
                              onClick={handleDownloadPDF}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <Download className="h-4 w-4" />
                              Download PDF
                            </Button>
                          )}
                        </div>
                        <CardContent
                          id="contract-scroll-container"
                          className="p-6 relative max-h-[70vh] overflow-y-auto"
                          style={{ scrollBehavior: "smooth" }}
                        >
                          {hasContractDetails ? (
                            <>
                              <div className="bg-white dark:bg-gray-950 border rounded-lg p-8 shadow-inner">
                                <div className="max-w-3xl mx-auto">
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
                                        contract.createdAt || contract.startDate
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
                                    {contract.templateSnapshot?.contentType ===
                                    "html" ? (
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
                              </div>
                              {/* Bottom gradient scroll hint */}
                              <div className="pointer-events-none absolute left-1/2 right-0 bottom-60 h-14 bg-gradient-to-t from-white/95 dark:from-gray-950/95 to-transparent flex items-end justify-center">
                                <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                                  <span className="hidden sm:inline">
                                    Scroll to read more
                                  </span>
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
                            </>
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
                      </Card>
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
                              <p className="text-sm text-muted-foreground">
                                Contractor
                              </p>
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
                              <span>
                                {contract.contractedUserId.phoneNumber}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="amendments" className="mt-0 space-y-6">
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
                                      (contract?.amendments?.length || 2) - 1 &&
                                      "border-b"
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
                                    {amendment.description || "No description"}
                                  </p>
                                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                                    {amendment.date && (
                                      <div className="flex items-center">
                                        <Calendar className="h-3.5 w-3.5 mr-1" />
                                        {formatDate(amendment.date)}
                                      </div>
                                    )}
                                    {amendment.approvedBy && (
                                      <div className="flex items-center">
                                        <User className="h-3.5 w-3.5 mr-1" />
                                        <span>
                                          {amendment.approvedBy.firstName}{" "}
                                          {amendment.approvedBy.lastName}
                                        </span>
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
                              )
                            )}
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
                                <h4 className="font-semibold mb-2">
                                  Finance Approvals
                                </h4>
                                {contract?.approvalFlow?.financeApprovals &&
                                contract?.approvalFlow?.financeApprovals
                                  .length === 0 ? (
                                  <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                      No finance approvals yet.
                                    </AlertDescription>
                                  </Alert>
                                ) : (
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Approver</TableHead>
                                        <TableHead>Comment</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {contract.approvalFlow.financeApprovals &&
                                        contract.approvalFlow.financeApprovals.map(
                                          (approval, index) => (
                                            <TableRow key={index}>
                                              <TableCell>
                                                {`${
                                                  approval?.approverId
                                                    ?.firstName || ""
                                                } ${
                                                  approval?.approverId
                                                    ?.lastName || ""
                                                }`.trim() || "—"}
                                              </TableCell>
                                              <TableCell>
                                                {approval.comments}
                                              </TableCell>
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
                                              <TableCell>
                                                {formatDate(
                                                  approval.approvedAt
                                                )}
                                              </TableCell>
                                            </TableRow>
                                          )
                                        )}
                                    </TableBody>
                                  </Table>
                                )}
                              </div>

                              <Separator />

                              <div>
                                <h4 className="font-semibold mb-2">
                                  MD Approvals
                                </h4>
                                {contract?.approvalFlow?.mdApprovals &&
                                contract?.approvalFlow?.mdApprovals.length ===
                                  0 ? (
                                  <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                      No MD approvals yet.
                                    </AlertDescription>
                                  </Alert>
                                ) : (
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Approver</TableHead>
                                        <TableHead>Comments</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {contract?.approvalFlow?.mdApprovals &&
                                        contract?.approvalFlow?.mdApprovals.map(
                                          (approval, index) => (
                                            <TableRow key={index}>
                                              <TableCell>
                                                {`${
                                                  approval?.approverId
                                                    ?.firstName || ""
                                                } ${
                                                  approval?.approverId
                                                    ?.lastName || ""
                                                }`.trim() || "—"}
                                              </TableCell>
                                              <TableCell>
                                                {approval.comments}
                                              </TableCell>
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
                                              <TableCell>
                                                {formatDate(
                                                  approval.approvedAt
                                                )}
                                              </TableCell>
                                            </TableRow>
                                          )
                                        )}
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
                              <AlertDescription>
                                No approval flow information available.
                              </AlertDescription>
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
                                        <h4 className="font-medium">
                                          Maximum Per Milestone
                                        </h4>
                                      </div>
                                      <p className="text-2xl font-bold text-primary">
                                        {formatCurrency(
                                          calculateMaxClaimAmount(),
                                          contract.currency
                                        )}
                                      </p>
                                    </CardContent>
                                  </Card>
                                  <Card className="bg-primary/5 border-none">
                                    <CardContent className="pt-6">
                                      <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle className="h-4 w-4 text-primary" />
                                        <h4 className="font-medium">
                                          Total Available
                                        </h4>
                                      </div>
                                      <p className="text-2xl font-bold text-primary">
                                        {formatCurrency(
                                          contract.contractValue,
                                          contract.currency
                                        )}
                                      </p>
                                    </CardContent>
                                  </Card>
                                </div>

                                <div className="space-y-4">
                                  {contract.projectId?.milestones &&
                                  contract.projectId.milestones.length > 0 ? (
                                    contract.projectId.milestones.map(
                                      (milestone) => {
                                        const isActive = milestone.completed;
                                        const milestoneData =
                                          selectedMilestones[milestone._id] || {
                                            amount: 0,
                                            percentage: 0,
                                          };

                                        return (
                                          <div
                                            key={milestone._id}
                                            className="bg-card border rounded-lg overflow-hidden"
                                          >
                                            <div className="border-b bg-muted/30 p-4">
                                              <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                  <h4 className="font-medium">
                                                    {milestone.title}
                                                  </h4>
                                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span>
                                                      Due:{" "}
                                                      {format(
                                                        new Date(
                                                          milestone.dueDate
                                                        ),
                                                        "MMM d, yyyy"
                                                      )}
                                                    </span>
                                                  </div>
                                                </div>
                                                {isActive && (
                                                  <Badge
                                                    variant="outline"
                                                    className={cn(
                                                      milestone.completed
                                                        ? "border-green-200 bg-green-100 text-green-800"
                                                        : "border-yellow-200 bg-yellow-100 text-yellow-800"
                                                    )}
                                                  >
                                                    {milestone.completed
                                                      ? "Completed"
                                                      : "Not Active"}
                                                  </Badge>
                                                )}
                                              </div>
                                            </div>
                                            <div className="p-4 space-y-4">
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                  <label className="text-sm font-medium">
                                                    Claim Amount
                                                  </label>
                                                  <div className="relative">
                                                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                      type="number"
                                                      min="0"
                                                      max={calculateMaxClaimAmount()}
                                                      placeholder="Enter amount"
                                                      value={
                                                        milestoneData.amount ||
                                                        ""
                                                      }
                                                      onChange={(e) =>
                                                        handleMilestoneAmountChange(
                                                          milestone._id,
                                                          e.target.value
                                                        )
                                                      }
                                                      disabled={
                                                        !milestone.completed
                                                      }
                                                      className="pl-9"
                                                    />
                                                  </div>
                                                </div>
                                                <div className="space-y-2">
                                                  <label className="text-sm font-medium">
                                                    Percentage
                                                  </label>
                                                  <div className="h-10 bg-muted/50 rounded-md flex items-center px-3">
                                                    <span className="text-muted-foreground">
                                                      {milestoneData.percentage.toFixed(
                                                        1
                                                      )}
                                                      %
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                              <Progress
                                                value={milestoneData.percentage}
                                                className={cn(
                                                  "h-2",
                                                  milestoneData.percentage >
                                                    0 && "bg-primary/20"
                                                )}
                                              />
                                            </div>
                                          </div>
                                        );
                                      }
                                    )
                                  ) : (
                                    <div className="text-sm text-muted-foreground p-4">
                                      No milestones available.
                                    </div>
                                  )}
                                </div>

                                <Card className="bg-muted/30 border-none">
                                  <CardContent className="pt-6">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                      <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">
                                          Total Claim Amount
                                        </p>
                                        <p className="text-3xl font-bold text-primary">
                                          {formatCurrency(
                                            calculateTotalClaimAmount(),
                                            contract.currency
                                          )}
                                        </p>
                                      </div>
                                      <Button
                                        onClick={handleSubmitClaim}
                                        disabled={
                                          isSubmitting ||
                                          calculateTotalClaimAmount() <= 0
                                        }
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
                        <TabsContent
                          value="claims_history"
                          className="mt-0 space-y-6"
                        >
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
                                  <AlertDescription>
                                    No claims found for this contract.
                                  </AlertDescription>
                                </Alert>
                              ) : (
                                <div className="space-y-4">
                                  {claimsHistory.map((claim) => (
                                    <Card
                                      key={claim._id}
                                      className="bg-muted/30"
                                    >
                                      <CardContent className="pt-6">
                                        <div className="flex flex-col md:flex-row justify-between gap-4">
                                          <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                              <Badge
                                                className={cn(
                                                  "capitalize flex items-center gap-1.5",
                                                  getStatusBadgeColor(
                                                    claim.status
                                                  )
                                                )}
                                              >
                                                {getStatusIcon(claim.status)}
                                                {claim.status.replace(
                                                  /_/g,
                                                  " "
                                                )}
                                              </Badge>
                                              <span className="text-sm text-muted-foreground">
                                                {formatDate(claim.createdAt)}
                                              </span>
                                            </div>
                                            <p className="text-2xl font-bold">
                                              {formatCurrency(
                                                claim.amount,
                                                claim.currency
                                              )}
                                            </p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                              <User className="h-3.5 w-3.5" />
                                              <span>
                                                {claim.claimantId.firstName}{" "}
                                                {claim.claimantId.lastName}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="space-y-2">
                                            <h4 className="text-sm font-medium text-muted-foreground">
                                              Milestones Claimed
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                              {claim.milestones.map(
                                                (milestone: any) => (
                                                  <Badge
                                                    key={milestone.milestoneId}
                                                    variant="outline"
                                                    className="text-xs flex items-center gap-1"
                                                  >
                                                    <Calendar className="h-3 w-3" />
                                                    {milestone.title} (
                                                    {
                                                      milestone.percentageClaimed
                                                    }
                                                    %)
                                                  </Badge>
                                                )
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        {claim.status === "rejected" &&
                                          claim.rejection && (
                                            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                                              <div className="flex items-start gap-2 text-red-700 dark:text-red-300">
                                                <AlertCircle className="h-5 w-5 mt-0.5" />
                                                <div>
                                                  <p className="font-medium">
                                                    Rejection Details
                                                  </p>
                                                  <p className="text-sm mt-1">
                                                    {claim.rejection.reason}
                                                  </p>
                                                  <div className="mt-2 text-xs flex items-center gap-2">
                                                    <User className="h-3.5 w-3.5" />
                                                    <span>
                                                      Rejected by:{" "}
                                                      {
                                                        claim.rejection
                                                          .rejectedBy.firstName
                                                      }{" "}
                                                      {
                                                        claim.rejection
                                                          .rejectedBy.lastName
                                                      }
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                      {formatDate(
                                                        claim.rejection
                                                          .rejectedAt
                                                      )}
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        {claim.status === "paid" &&
                                          claim.payment && (
                                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                                              <div className="flex items-start gap-2 text-blue-700 dark:text-blue-300">
                                                <Receipt className="h-5 w-5 mt-0.5" />
                                                <div>
                                                  <p className="font-medium">
                                                    Payment Details
                                                  </p>
                                                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mt-2">
                                                    <div className="flex items-center gap-2">
                                                      <DollarSign className="h-3.5 w-3.5" />
                                                      <span>
                                                        Method:{" "}
                                                        {
                                                          claim.payment
                                                            .paymentMethod
                                                        }
                                                      </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                      <FileText className="h-3.5 w-3.5" />
                                                      <span>
                                                        Transaction ID:{" "}
                                                        {
                                                          claim.payment
                                                            .transactionId
                                                        }
                                                      </span>
                                                    </div>
                                                    {claim.payment
                                                      .reference && (
                                                      <div className="flex items-center gap-2">
                                                        <FileSignature className="h-3.5 w-3.5" />
                                                        <span>
                                                          Reference:{" "}
                                                          {
                                                            claim.payment
                                                              .reference
                                                          }
                                                        </span>
                                                      </div>
                                                    )}
                                                  </div>
                                                  <div className="mt-2 text-xs flex items-center gap-2">
                                                    <User className="h-3.5 w-3.5" />
                                                    <span>
                                                      Processed by:{" "}
                                                      {
                                                        claim.payment.paidBy
                                                          .firstName
                                                      }{" "}
                                                      {
                                                        claim.payment.paidBy
                                                          .lastName
                                                      }
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                      {formatDate(
                                                        claim.payment.paidAt
                                                      )}
                                                    </span>
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
                  <ScrollBar orientation="vertical" />
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
