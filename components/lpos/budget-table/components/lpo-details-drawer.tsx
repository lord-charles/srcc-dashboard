"use client";

import { useState } from "react";
import { format } from "date-fns";
import { updateLpoStatus } from "@/services/lpo.service";
import { Lpo, LpoStatus } from "@/types/lpo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Building2,
  Truck,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Package,
  History,
  ClipboardCheck,
} from "lucide-react";
import {
  Stepper,
  StepperItem,
  StepperIndicator,
  StepperTitle,
  StepperSeparator,
} from "@/components/ui/stepper";
import { cn } from "@/lib/utils";

interface LpoDetailsDrawerProps {
  lpo: Lpo;
  trigger: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
}

const formatCurrency = (amount: number, currency: string = "KES") => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

export function LpoDetailsDrawer({
  lpo,
  trigger,
  open,
  onOpenChange,
  onClose,
}: LpoDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "finance_approved":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "hod_approved":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800";
      case "submitted":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "draft":
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300 border-slate-200 dark:border-slate-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStepIndex = (status: string) => {
    switch (status) {
      case "submitted": return 0;
      case "hod_approved": return 1;
      case "finance_approved": return 2;
      case "rejected": return -1;
      default: return 0;
    }
  };

  const handleAction = async (action: "approve" | "reject") => {
    if (action === "reject" && !comments.trim()) {
      toast({
        title: "Comments Required",
        description: "Please provide a reason for rejecting the LPO.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      let nextStatus = "";
      
      if (action === "approve") {
        if (lpo.status === "submitted") nextStatus = "hod_approved";
        else if (lpo.status === "hod_approved") nextStatus = "finance_approved";
      } else {
        nextStatus = "rejected";
      }

      if (!nextStatus) return;

      const result = await updateLpoStatus(lpo._id, nextStatus);

      if (result.success) {
        toast({
          title: action === "approve" ? "LPO Approved" : "LPO Rejected",
          description: `The LPO has been ${action === "approve" ? "approved" : "rejected"} successfully.`,
        });
        onOpenChange?.(false);
        onClose?.();
        window.location.reload();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update LPO status.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStep = getStepIndex(lpo.status);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
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
                  <DrawerTitle className="text-2xl font-bold">LPO Details</DrawerTitle>
                  <DrawerDescription className="mt-1 flex items-center">
                     <span className="font-mono font-bold text-primary mr-2">{lpo.lpoNo}</span>
                     &bull; Prepared by {lpo.preparedBy?.firstName} {lpo.preparedBy?.lastName}
                  </DrawerDescription>
                </div>
              </div>
              <Badge variant="outline" className={cn("px-4 py-1.5 text-sm font-bold border-2 capitalize", getStatusColor(lpo.status))}>
                {lpo.status.replace(/_/g, ' ')}
              </Badge>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="px-6 border-b bg-muted/30">
                <TabsList className="h-14 w-full justify-start gap-4 bg-transparent">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-6">
                    <History className="h-4 w-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="approval" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-6">
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    Approval Workflow
                  </TabsTrigger>
                  <TabsTrigger value="history" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md px-6" disabled>
                     History
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-6 space-y-8">
                  <TabsContent value="overview" className="m-0 space-y-8">
                    {/* Stepper Visualization */}
                    <div className="bg-muted/20 p-8 rounded-xl border border-dashed">
                      <h4 className="text-sm font-semibold mb-6 flex items-center uppercase tracking-wider text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        Approval Progress
                      </h4>
                      <Stepper value={currentStep === -1 ? 0 : currentStep}>
                        <StepperItem step={0} completed={currentStep > 0}>
                           <div className="flex flex-col items-center">
                             <StepperIndicator className={lpo.status === 'rejected' ? 'bg-red-100 text-red-600' : ''} />
                             <StepperTitle className="mt-2">Submitted</StepperTitle>
                           </div>
                        </StepperItem>
                        <StepperSeparator />
                        <StepperItem step={1} completed={currentStep > 1} disabled={currentStep < 1 && lpo.status !== 'hod_approved'}>
                           <div className="flex flex-col items-center">
                             <StepperIndicator />
                             <StepperTitle className="mt-2">HOD Approved</StepperTitle>
                           </div>
                        </StepperItem>
                        <StepperSeparator />
                        <StepperItem step={2} completed={currentStep >= 2} disabled={currentStep < 2 && lpo.status !== 'finance_approved'}>
                           <div className="flex flex-col items-center">
                             <StepperIndicator />
                             <StepperTitle className="mt-2">Finance Approved</StepperTitle>
                           </div>
                        </StepperItem>
                      </Stepper>
                      
                      {lpo.status === 'rejected' && (
                        <div className="mt-6 flex items-center justify-center text-red-600 font-bold bg-red-50 p-3 rounded-lg border border-red-200">
                          <AlertCircle className="h-5 w-5 mr-2" />
                          This LPO has been rejected
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="md:col-span-2">
                        <CardHeader className="flex flex-row items-center gap-2">
                          <Package className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg">Items & Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-12 gap-4 text-sm font-bold text-muted-foreground border-b pb-2">
                              <div className="col-span-6">Description</div>
                              <div className="col-span-2 text-center">Qty</div>
                              <div className="col-span-2 text-right">Rate</div>
                              <div className="col-span-2 text-right">Total</div>
                            </div>
                            {lpo.items.map((item, idx) => (
                              <div key={idx} className="grid grid-cols-12 gap-4 text-sm py-1 border-b border-muted/50 last:border-0">
                                <div className="col-span-6 font-medium">{item.description}</div>
                                <div className="col-span-2 text-center">{item.quantity}</div>
                                <div className="col-span-2 text-right">{item.rate.toLocaleString()}</div>
                                <div className="col-span-2 text-right font-bold">{item.total.toLocaleString()}</div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-6 space-y-2">
                             <div className="flex justify-between text-sm">
                               <span className="text-muted-foreground">Subtotal:</span>
                               <span className="font-medium">{lpo.subTotal.toLocaleString()} {lpo.currency}</span>
                             </div>
                             <div className="flex justify-between text-sm">
                               <span className="text-muted-foreground">VAT Amount:</span>
                               <span className="font-medium">{lpo.vatAmount.toLocaleString()} {lpo.currency}</span>
                             </div>
                             <Separator />
                             <div className="flex justify-between text-lg font-bold">
                               <span>Total Amount:</span>
                               <span className="text-primary">{formatCurrency(lpo.totalAmount, lpo.currency)}</span>
                             </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="space-y-6">
                        <Card>
                          <CardHeader className="flex flex-row items-center gap-2">
                            <Truck className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">Supplier Info</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                             <div>
                               <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Company Name</p>
                               <p className="font-bold text-blue-600 dark:text-blue-400">{lpo.supplierId?.name || "N/A"}</p>
                             </div>
                             <div>
                               <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Contact</p>
                               <p className="font-medium">{lpo.supplierId?.phone || "No phone"}</p>
                               <p className="text-sm">{lpo.supplierId?.email || "No email"}</p>
                             </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="flex flex-row items-center gap-2">
                             <Building2 className="h-5 w-5 text-primary" />
                             <CardTitle className="text-lg">Project Info</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                             <p className="font-bold">{lpo.projectId?.name || "N/A"}</p>
                             <p className="text-sm text-muted-foreground">{lpo.projectId?.description || "No description"}</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="approval" className="m-0">
                    <div className="max-w-2xl mx-auto space-y-8">
                       <div className="bg-primary/5 p-6 rounded-xl border border-primary/20">
                         <h3 className="text-lg font-bold mb-4 flex items-center">
                           <ClipboardCheck className="h-5 w-5 mr-2 text-primary" />
                           Review Actions
                         </h3>
                         
                         <p className="text-sm text-muted-foreground mb-6">
                           As a reviewer, you can either approve this LPO to move it to the next stage or reject it back to the preparer.
                         </p>

                         <div className="space-y-4">
                           <div className="space-y-2">
                             <label className="text-sm font-bold">Comments / Reason</label>
                             <Textarea 
                               placeholder="Add your comments or rejection reason here..." 
                               className="min-h-[120px] bg-background"
                               value={comments}
                               onChange={(e) => setComments(e.target.value)}
                             />
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                              <Button 
                                variant="outline" 
                                className="h-12 font-bold border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => handleAction("reject")}
                                disabled={isSubmitting || lpo.status === 'finance_approved' || lpo.status === 'rejected'}
                              >
                                {isSubmitting ? "Processing..." : "Reject LPO"}
                              </Button>
                              <Button 
                                className="h-12 font-bold"
                                onClick={() => handleAction("approve")}
                                disabled={isSubmitting || lpo.status === 'finance_approved' || lpo.status === 'rejected'}
                              >
                                {isSubmitting ? "Processing..." : "Approve LPO"}
                              </Button>
                           </div>
                         </div>
                       </div>

                       <div className="space-y-4">
                         <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Next Action Required By</h4>
                         <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-lg">
                            <div className="bg-amber-100 p-3 rounded-full">
                               <Clock className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                               <p className="font-bold text-lg">
                                 {lpo.status === 'submitted' ? "HOD Approval" : lpo.status === 'hod_approved' ? "Finance Approval" : "Completed"}
                               </p>
                               <p className="text-sm text-muted-foreground">
                                 {lpo.status === 'submitted' ? "Waiting for Head of Department to review." : lpo.status === 'hod_approved' ? "Waiting for Finance to finalize the order." : "Process completed."}
                               </p>
                            </div>
                         </div>
                       </div>
                    </div>
                  </TabsContent>
                </div>
              </ScrollArea>
            </Tabs>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
