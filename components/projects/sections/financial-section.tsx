"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingUp, 
  Receipt, 
  Store, 
  ClipboardList, 
  ClipboardCheck, 
  ArrowUpRight, 
  FileCheck, 
  Percent, 
  FileText, 
  Ban,
  Loader2,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { Project } from "@/types/project";
import { formatCurrency } from "../project-stat-cards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoicesSection } from "./invoices-section";
import { LpoSection } from "./lpo-section";
import { ProjectPaymentRequestsSection } from "./project-payment-requests-section";
import { ProjectPaymentVouchersSection } from "./project-payment-vouchers-section";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getLposByProject } from "@/services/lpo.service";
import { getPaymentRequests, getPaymentVouchers } from "@/services/payment-request.service";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface FinancialSectionProps {
  totalBudget: number;
  amountSpent: number;
  totalProjectValue: number;
  currency: string;
  projectData: Project;
}

export const FinancialSection: React.FC<FinancialSectionProps> = ({
  totalBudget,
  amountSpent,
  totalProjectValue,
  currency,
  projectData,
}) => {
  const formatCurrency2 = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency || "KES",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("financialtab") || "overview",
  );

  const [lpos, setLpos] = useState<any[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [isLoadingExtra, setIsLoadingExtra] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        setIsLoadingExtra(true);
        const [lposRes, prsRes, vouchersRes] = await Promise.all([
          getLposByProject(projectData._id),
          getPaymentRequests({ projectId: projectData._id }),
          getPaymentVouchers(),
        ]);
        if (!active) return;
        if (lposRes.success && lposRes.data) {
          setLpos(lposRes.data);
        }
        if (prsRes.success && prsRes.data) {
          setPaymentRequests(prsRes.data);
        }
        if (vouchersRes.success && vouchersRes.data) {
          const projectVouchers = vouchersRes.data.filter((v: any) => {
            const pr = v.paymentRequestId;
            const prProjId = pr?.projectId?._id || pr?.projectId;
            return prProjId === projectData._id;
          });
          setVouchers(projectVouchers);
        }
      } catch (err) {
        console.error("Failed to load financial overview extra data:", err);
      } finally {
        if (active) setIsLoadingExtra(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, [projectData._id]);

  useEffect(() => {
    const tab = searchParams.get("financialtab");
    if (tab && ["overview", "invoices", "lpos", "payment-requests", "payment-vouchers"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("financialtab", value);
    router.push(newUrl.pathname + newUrl.search, { scroll: false });
  };

  const spentPercentage =
    totalBudget > 0 ? (amountSpent / totalBudget) * 100 : 0;

  // Invoices Calculations
  const invoicesList = projectData.invoices || [];
  const totalInvoicesCount = invoicesList.length;
  const totalInvoicesAmount = invoicesList.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalInvoicesTax = invoicesList.reduce((sum, inv) => sum + (inv.totalTax || 0), 0);
  const totalInvoicesSubtotal = invoicesList.reduce((sum, inv) => sum + (inv.subtotal || 0), 0);

  // Credit Notes Tally
  const totalCreditNotesAmount = invoicesList.reduce((sum, inv) => {
    return sum + (inv.creditNotes?.reduce((cSum, cn) => cSum + (cn.amount || 0), 0) || 0);
  }, 0);

  let invoicesPaidCount = 0;
  let invoicesCreditNoteCount = 0;
  let invoicesPendingCount = 0;
  let invoicesPaidAmount = 0;

  invoicesList.forEach(inv => {
    const hasCreditNote = inv.creditNotes && inv.creditNotes.length > 0;
    const paidSum = inv.payments?.reduce((sum, p) => sum + (p.amountPaid || 0), 0) || 0;
    invoicesPaidAmount += paidSum;

    if (hasCreditNote) {
      invoicesCreditNoteCount++;
    } else if (inv.status === "paid") {
      invoicesPaidCount++;
    } else {
      invoicesPendingCount++;
    }
  });

  const invoicesOutstandingAmount = Math.max(0, totalInvoicesAmount - invoicesPaidAmount - totalCreditNotesAmount);

  // LPOs Calculations
  const totalLposCount = lpos.length;
  const totalLposAmount = lpos.reduce((sum, l) => sum + (l.totalAmount || 0), 0);
  const lposFinanceApprovedCount = lpos.filter(l => l.status === "finance_approved").length;
  const lposHodApprovedCount = lpos.filter(l => l.status === "hod_approved").length;
  const lposSubmittedCount = lpos.filter(l => l.status === "submitted").length;

  // Payment Requests Calculations
  const totalPrsCount = paymentRequests.length;
  const totalPrsAmount = paymentRequests.reduce((sum, pr) => sum + (pr.amount || 0), 0);
  const prsApprovedCount = paymentRequests.filter(pr => pr.status === "hod_approved").length;
  const prsPendingCount = paymentRequests.filter(pr => pr.status === "pending_hod_approval").length;

  // Vouchers Calculations
  const totalVouchersCount = vouchers.length;
  const totalVouchersAmount = vouchers.reduce((sum, v) => sum + (v.amount || 0), 0);
  const totalVouchersPaidAmount = vouchers.filter(v => v.status === "paid").reduce((sum, v) => sum + (v.amount || 0), 0);
  const vouchersPaidCount = vouchers.filter(v => v.status === "paid").length;
  const vouchersPendingCount = vouchers.filter(v => v.status !== "paid").length;

  // Taxes & Compliance
  let whtAmount = 0;
  let whtVatAmount = 0;
  let whtCertificatesCount = 0;
  let whtVatCertificatesCount = 0;
  let whtCertificatesMissing = 0;
  let whtVatCertificatesMissing = 0;

  invoicesList.forEach(inv => {
    inv.payments?.forEach(p => {
      if (p.method === "wht") {
        whtAmount += p.amountPaid || 0;
        if (p.whtCertificateUrl) {
          whtCertificatesCount++;
        } else {
          whtCertificatesMissing++;
        }
      } else if (p.method === "wht_vat") {
        whtVatAmount += p.amountPaid || 0;
        if (p.whtVatCertificateUrl) {
          whtVatCertificatesCount++;
        } else {
          whtVatCertificatesMissing++;
        }
      }
    });
  });

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-5 mb-4">
        <TabsTrigger value="overview">
          <TrendingUp className="w-4 h-4 mr-2" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="invoices">
          <Receipt className="w-4 h-4 mr-2" />
          Invoices
        </TabsTrigger>
        <TabsTrigger value="lpos">
          <Store className="w-4 h-4 mr-2" />
      LPOs
        </TabsTrigger>
        <TabsTrigger value="payment-requests">
          <ClipboardList className="w-4 h-4 mr-2" />
          Payment Requests
        </TabsTrigger>
        <TabsTrigger value="payment-vouchers">
          <ClipboardCheck className="w-4 h-4 mr-2" />
          Payment Vouchers
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        {isLoadingExtra ? (
          <div className="flex h-48 items-center justify-center bg-card rounded-md border shadow-sm">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <span className="text-sm font-medium">Loading financial metrics...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Quick Stats KPI Grid */}
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              
              {/* Invoices KPI */}
              <Card className="border-none shadow-md bg-white dark:bg-slate-900">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Invoices Ledger</span>
                  <Receipt className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {formatCurrency2(totalInvoicesAmount)}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1 flex flex-wrap gap-1.5 items-center">
                    <Badge variant="secondary" className="px-1 py-0 bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 font-normal">
                      {totalInvoicesCount} Total
                    </Badge>
                    <span>{invoicesPaidCount} Paid</span>
                    {invoicesCreditNoteCount > 0 && (
                      <span className="text-blue-600 font-medium">({invoicesCreditNoteCount} CN)</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* LPOs KPI */}
              <Card className="border-none shadow-md bg-white dark:bg-slate-900">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">LPOs Issued</span>
                  <Store className="h-4 w-4 text-violet-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {formatCurrency2(totalLposAmount)}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1 flex flex-wrap gap-1.5 items-center">
                    <Badge variant="secondary" className="px-1 py-0 bg-violet-50 text-violet-700 dark:bg-violet-950/20 dark:text-violet-400 font-normal">
                      {totalLposCount} LPOs
                    </Badge>
                    <span>{lposFinanceApprovedCount} Approved</span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Requests KPI */}
              <Card className="border-none shadow-md bg-white dark:bg-slate-900">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Requests Value</span>
                  <ClipboardList className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {formatCurrency2(totalPrsAmount)}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1 flex flex-wrap gap-1.5 items-center">
                    <Badge variant="secondary" className="px-1 py-0 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 font-normal">
                      {totalPrsCount} Req
                    </Badge>
                    <span>{prsApprovedCount} Approved</span>
                    {prsPendingCount > 0 && <span className="text-amber-600 font-medium">({prsPendingCount} Pend)</span>}
                  </div>
                </CardContent>
              </Card>

              {/* Vouchers KPI */}
              <Card className="border-none shadow-md bg-white dark:bg-slate-900">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Paid Outflow</span>
                  <ClipboardCheck className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {formatCurrency2(totalVouchersPaidAmount)}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1 flex flex-wrap gap-1.5 items-center">
                    <Badge variant="secondary" className="px-1 py-0 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 font-normal">
                      {vouchersPaidCount} Paid
                    </Badge>
                    <span>{vouchersPendingCount} Pending</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* In-depth details layout */}
            <div className="grid gap-2 md:grid-cols-2">
              
              {/* Left Column: Budget details */}
              <Card className="border-none shadow-md bg-white dark:bg-slate-900">
                <CardHeader className="border-b pb-4">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    Budget Allocation & Variance
                  </CardTitle>
                  <CardDescription>Overall vs Category-specific utilization</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Overall Budget Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-slate-600 dark:text-slate-300">Total Spent</span>
                      <span className="text-slate-800 dark:text-slate-100">
                        {formatCurrency2(amountSpent)} / {formatCurrency(
                          (projectData.budgetId?.totalInternalBudget || 0) +
                            (projectData.budgetId?.totalExternalBudget || 0),
                          projectData.currency,
                        )}
                      </span>
                    </div>
                    <Progress
                      value={isNaN(spentPercentage) ? 0 : spentPercentage}
                      className="h-2.5 bg-slate-100 dark:bg-slate-800"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{isNaN(spentPercentage) ? 0 : Math.round(spentPercentage)}% of total budget spent</span>
                      <span className="font-semibold text-emerald-600">
                        {formatCurrency2(Math.max(0, totalBudget - amountSpent))} remaining
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Internal vs External Categories */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">Category Budgets</h4>
                    
                    {/* Internal Budget */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-slate-500">Internal Budget (Staff, Ops)</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {formatCurrency2(projectData.budgetId?.totalInternalSpent || 0)} / {formatCurrency2(projectData.budgetId?.totalInternalBudget || 0)}
                        </span>
                      </div>
                      <Progress
                        value={
                          projectData.budgetId?.totalInternalBudget > 0 
                            ? ((projectData.budgetId.totalInternalSpent || 0) / projectData.budgetId.totalInternalBudget) * 100 
                            : 0
                        }
                        className="h-1.5"
                      />
                    </div>

                    {/* External Budget */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-slate-500">External Budget (Subcontractors, LPOs)</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {formatCurrency2(projectData.budgetId?.totalExternalSpent || 0)} / {formatCurrency2(projectData.budgetId?.totalExternalBudget || 0)}
                        </span>
                      </div>
                      <Progress
                        value={
                          projectData.budgetId?.totalExternalBudget > 0 
                            ? ((projectData.budgetId.totalExternalSpent || 0) / projectData.budgetId.totalExternalBudget) * 100 
                            : 0
                        }
                        className="h-1.5"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Right Column: Tax ledger & compliance */}
              <Card className="border-none shadow-md bg-white dark:bg-slate-900">
                <CardHeader className="border-b pb-4">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-emerald-600" />
                    Tax & Compliance Ledger
                  </CardTitle>
                  <CardDescription>VAT, WHT, Credit Notes and Outstanding balances</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4 text-sm">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">Subtotal before tax</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{formatCurrency2(totalInvoicesSubtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">VAT Amount (Total Tax)</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{formatCurrency2(totalInvoicesTax)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 text-blue-600">
                    <span className="font-medium">Credit Notes Issued</span>
                    <span className="font-semibold">-{formatCurrency2(totalCreditNotesAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 text-emerald-600">
                    <span className="font-medium">Total Paid Recorded</span>
                    <span className="font-semibold">-{formatCurrency2(invoicesPaidAmount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center py-1 font-bold text-slate-900 dark:text-slate-50">
                    <span>Outstanding Invoice Balance</span>
                    <span className={invoicesOutstandingAmount > 0 ? "text-rose-600" : "text-emerald-600"}>
                      {formatCurrency2(invoicesOutstandingAmount)}
                    </span>
                  </div>
                  
                  <Separator />
                  
                  {/* Withholding Taxes Breakdown */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Withholding Tax (WHT) Tally</h4>
                    
                    {/* WHT */}
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">WHT Paid (2% / 5%):</span>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          Certificates: {whtCertificatesCount} uploaded {whtCertificatesMissing > 0 && <span className="text-rose-500">({whtCertificatesMissing} missing)</span>}
                        </div>
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency2(whtAmount)}</span>
                    </div>

                    {/* WHT VAT */}
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">WHT VAT Paid (2% / 6%):</span>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          Certificates: {whtVatCertificatesCount} uploaded {whtVatCertificatesMissing > 0 && <span className="text-rose-500">({whtVatCertificatesMissing} missing)</span>}
                        </div>
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency2(whtVatAmount)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </>
        )}
      </TabsContent>

      <TabsContent value="invoices">
        <InvoicesSection
          invoices={projectData.invoices}
          currency={projectData.currency}
          projectId={projectData._id}
        />
      </TabsContent>

      <TabsContent value="lpos">
        <LpoSection
          projectId={projectData._id}
          projectCurrency={projectData.currency}
          projectName={projectData.name}
        />
      </TabsContent>

      <TabsContent value="payment-requests">
        <ProjectPaymentRequestsSection
          projectId={projectData._id}
          projectName={projectData.name}
        />
      </TabsContent>

      <TabsContent value="payment-vouchers">
        <ProjectPaymentVouchersSection
          projectId={projectData._id}
          projectName={projectData.name}
        />
      </TabsContent>
    </Tabs>
  );
};

export default FinancialSection;
