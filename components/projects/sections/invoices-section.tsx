"use client";

import React, { useState, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  Edit,
  FileText,
  Plus,
  Loader2,
  Send,
} from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { PDFDownloadLink } from "@react-pdf/renderer";
import InvoicePDF from "./invoice-pdf";
import {
  Drawer as ModalDrawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
  Drawer,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  attachActualInvoice,
  createInvoice,
  editInvoice,
  recordPayment,
  submitInvoice,
  requestInvoiceRevision,
} from "@/services/invoice.service";
import { Invoice, InvoiceFormState } from "@/types/project";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { FileUpload } from "@/components/ui/file-upload";
import { cloudinaryService } from "@/lib/cloudinary-service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InvoicesSectionProps {
  invoices: Invoice[];
  currency: string;
  projectId: string;
}

const initialFormState: InvoiceFormState = {
  items: [{ description: "", quantity: 0, amount: 0, taxRate: 16 }],
  invoiceDate: format(new Date(), "yyyy-MM-dd"),
  dueDate: format(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    "yyyy-MM-dd",
  ),
  paymentTerms: "Net 30",
  notes: "",
};

export const InvoicesSection: React.FC<InvoicesSectionProps> = ({
  invoices,
  currency,
  projectId,
}) => {
  const [showPaymentDrawer, setShowPaymentDrawer] = useState<string | null>(
    null,
  );
  const [showAttachDrawer, setShowAttachDrawer] = useState<string | null>(null);
  const [showRevisionDrawer, setShowRevisionDrawer] = useState<string | null>(
    null,
  );

  console.log("invoices", invoices)
  const [paymentForm, setPaymentForm] = useState<any>({});
  const [paymentTab, setPaymentTab] = useState<"regular" | "wht" | "wht_vat">(
    "regular",
  );
  const [attachUrl, setAttachUrl] = useState<string>("");
  const [revisionForm, setRevisionForm] = useState<{
    comments: string;
    changes: string[];
  }>({ comments: "", changes: [""] });
  const [isPaymentSubmitting, setIsPaymentSubmitting] = useState(false);
  const [isAttachSubmitting, setIsAttachSubmitting] = useState(false);
  const [isRevisionSubmitting, setIsRevisionSubmitting] = useState(false);
  const [isReceiptUploading, setIsReceiptUploading] = useState(false);
  const [isWhtCertUploading, setIsWhtCertUploading] = useState(false);
  const [isWhtVatCertUploading, setIsWhtVatCertUploading] = useState(false);
  const [isAttachUploading, setIsAttachUploading] = useState(false);
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>(
    {},
  );

  const openPaymentDrawer = (invoiceId: string) => {
    setShowPaymentDrawer(invoiceId);
    setPaymentForm({});
    setPaymentTab("regular");
  };
  const closePaymentDrawer = () => setShowPaymentDrawer(null);
  const openAttachDrawer = (invoiceId: string) => {
    setShowAttachDrawer(invoiceId);
    setAttachUrl("");
  };
  const closeAttachDrawer = () => setShowAttachDrawer(null);
  const openRevisionDrawer = (invoiceId: string) => {
    setShowRevisionDrawer(invoiceId);
    setRevisionForm({ comments: "", changes: [""] });
  };
  const closeRevisionDrawer = () => setShowRevisionDrawer(null);

  const handlePaymentSubmit = async () => {
    if (!showPaymentDrawer) return;

    // Validation based on payment tab
    const errors: Record<string, string> = {};

    if (
      !paymentForm.amountPaid ||
      isNaN(Number(paymentForm.amountPaid)) ||
      Number(paymentForm.amountPaid) <= 0
    ) {
      errors.amountPaid = "Amount paid is required and must be greater than 0.";
    }

    if (paymentTab === "regular") {
      // Regular payment validation
      if (!paymentForm.method || paymentForm.method.trim() === "") {
        errors.method = "Payment method is required.";
      }
      if (
        !paymentForm.receiptUrl ||
        typeof paymentForm.receiptUrl !== "string" ||
        !paymentForm.receiptUrl.startsWith("http")
      ) {
        errors.receiptUrl = "Receipt URL is required and must be a valid URL.";
      }
    } else if (paymentTab === "wht") {
      // WHT payment validation
      if (
        !paymentForm.whtCertificateRefNo ||
        paymentForm.whtCertificateRefNo.trim() === ""
      ) {
        errors.whtCertificateRefNo =
          "WHT Certificate Reference Number is required.";
      }
      if (
        !paymentForm.whtCertificateUrl ||
        typeof paymentForm.whtCertificateUrl !== "string" ||
        !paymentForm.whtCertificateUrl.startsWith("http")
      ) {
        errors.whtCertificateUrl = "WHT Certificate attachment is required.";
      }
    } else if (paymentTab === "wht_vat") {
      // WHT-VAT payment validation
      if (
        !paymentForm.whtVatCertificateRefNo ||
        paymentForm.whtVatCertificateRefNo.trim() === ""
      ) {
        errors.whtVatCertificateRefNo =
          "WHT-VAT Certificate Reference Number is required.";
      }
      if (
        !paymentForm.whtVatCertificateUrl ||
        typeof paymentForm.whtVatCertificateUrl !== "string" ||
        !paymentForm.whtVatCertificateUrl.startsWith("http")
      ) {
        errors.whtVatCertificateUrl =
          "WHT-VAT Certificate attachment is required.";
      }
    }

    setPaymentErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsPaymentSubmitting(true);
    try {
      // Set the method based on the tab and ensure paidAt has a default value
      const paymentData = {
        ...paymentForm,
        method: paymentTab === "regular" ? paymentForm.method : paymentTab,
        // Default to today's date if paidAt is not provided
        paidAt: paymentForm.paidAt || format(new Date(), "yyyy-MM-dd"),
      };

      await recordPayment(showPaymentDrawer, paymentData);
      toast({
        title: "Success",
        description: "Payment recorded successfully.",
      });
      closePaymentDrawer();
      // Delay reload to ensure drawer closes first
      setTimeout(() => window.location.reload(), 100);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to record payment.",
        variant: "destructive",
      });
    } finally {
      setIsPaymentSubmitting(false);
    }
  };

  const handleAttachSubmit = async () => {
    if (!showAttachDrawer || !attachUrl) return;
    setIsAttachSubmitting(true);
    try {
      await attachActualInvoice(showAttachDrawer, attachUrl);
      toast({ title: "Success", description: "Actual invoice URL attached." });
      closeAttachDrawer();
      // Delay reload to ensure drawer closes first
      setTimeout(() => window.location.reload(), 100);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to attach invoice URL.",
        variant: "destructive",
      });
    } finally {
      setIsAttachSubmitting(false);
    }
  };

  const handleRevisionSubmit = async () => {
    if (!showRevisionDrawer) return;

    // Validation
    if (!revisionForm.comments.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide revision comments.",
        variant: "destructive",
      });
      return;
    }

    const validChanges = revisionForm.changes.filter((c) => c.trim() !== "");
    if (validChanges.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please specify at least one change required.",
        variant: "destructive",
      });
      return;
    }

    setIsRevisionSubmitting(true);
    try {
      const result = await requestInvoiceRevision(
        showRevisionDrawer,
        revisionForm.comments,
        validChanges,
      );

      if (!result.success) {
        toast({
          title: "Request Failed",
          description: result.error || "Failed to request revision.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Revision request submitted successfully.",
      });
      closeRevisionDrawer();
      // Delay reload to ensure drawer closes first
      setTimeout(() => window.location.reload(), 100);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsRevisionSubmitting(false);
    }
  };

  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] =
    useState<InvoiceFormState>(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [submittingInvoiceId, setSubmittingInvoiceId] = useState<string | null>(
    null,
  );
  const { toast } = useToast();
  const router = useRouter();

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formState.invoiceDate) {
      errors.invoiceDate = "Invoice date is required";
    }
    if (!formState.dueDate) {
      errors.dueDate = "Due date is required";
    }
    if (!formState.paymentTerms) {
      errors.paymentTerms = "Payment terms are required";
    }

    formState.items.forEach((item, index) => {
      if (!item.description) {
        errors[`items.${index}.description`] = "Description is required";
      }
      if (item.quantity <= 0) {
        errors[`items.${index}.quantity`] = "Quantity must be greater than 0";
      }
      if (item.amount <= 0) {
        errors[`items.${index}.amount`] = "Amount must be greater than 0";
      }
      if (item.taxRate < 0) {
        errors[`items.${index}.taxRate`] = "Tax rate cannot be negative";
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddItem = () => {
    setFormState((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { description: "", quantity: 0, amount: 0, taxRate: 16 },
      ],
    }));
  };

  const handleRemoveItem = (index: number) => {
    if (formState.items.length > 1) {
      setFormState((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setFormState((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: field === "description" ? value : Number(value),
            }
          : item,
      ),
    }));
    // Clear error when field is updated
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`items.${index}.${field}`];
      return newErrors;
    });
  };

  const calculateTotals = () => {
    return formState.items.reduce(
      (acc, item) => {
        const amount = item.quantity * item.amount;
        const taxAmount = (amount * item.taxRate) / 100;
        return {
          subtotal: acc.subtotal + amount,
          totalTax: acc.totalTax + taxAmount,
          total: acc.total + amount + taxAmount,
        };
      },
      { subtotal: 0, totalTax: 0, total: 0 },
    );
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormState({
      items: invoice.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        amount: item.amount,
        taxRate: item.taxRate,
      })),
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      paymentTerms: invoice.paymentTerms,
      notes: invoice.notes || "",
    });
    setIsDrawerOpen(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const totals = calculateTotals();

      const invoiceData = {
        projectId,
        ...formState,
        currency,
        subtotal: totals.subtotal,
        totalTax: totals.totalTax,
        totalAmount: totals.total,
      };

      if (editingInvoice) {
        await editInvoice(editingInvoice._id, invoiceData);
        toast({
          title: "Success",
          description: "Invoice updated successfully",
        });
      } else {
        await createInvoice(invoiceData);
        toast({
          title: "Success",
          description: "Invoice created successfully",
        });
      }

      setIsDrawerOpen(false);
      setFormState(initialFormState);
      setFormErrors({});
      setEditingInvoice(null);
      // Delay reload to ensure any modals close first
      setTimeout(() => window.location.reload(), 100);
    } catch (error) {
      toast({
        title: "Error",
        description: editingInvoice
          ? "Failed to update invoice. Please try again."
          : "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitForApproval = async (invoice: Invoice) => {
    try {
      setSubmittingInvoiceId(invoice._id);
      await submitInvoice(invoice._id);
      toast({
        title: "Success",
        description: "Invoice submitted for approval",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit invoice for approval",
        variant: "destructive",
      });
    } finally {
      setSubmittingInvoiceId(null);
      // Delay reload to ensure any modals close first
      setTimeout(() => window.location.reload(), 100);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency || "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return "Invalid date";
      return format(date, "MMM d, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-500 text-white";
      case "partially_paid":
        return "bg-blue-500 text-white";
      case "pending":
      case "pending_invoice_attachment":
        return "bg-yellow-500 text-white";
      case "revision_requested":
        return "bg-orange-500 text-white";
      case "overdue":
        return "bg-red-500 text-white";
      case "draft":
        return "bg-gray-500 text-white";
      case "approved":
        return "bg-purple-500 text-white";
      case "rejected":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const toggleInvoiceExpansion = (invoiceId: string) => {
    setExpandedInvoice(expandedInvoice === invoiceId ? null : invoiceId);
  };

  return (
    <>
      <Card className="w-full shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Invoices</CardTitle>
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerTrigger asChild>
              <Button variant="default">
                <Plus className="h-4 w-4 mr-2" />
                Request Invoice
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[90vh] flex flex-col">
              <DrawerHeader>
                <DrawerTitle>
                  {editingInvoice ? "Edit Invoice" : "Create New Invoice"}
                </DrawerTitle>
                <DrawerDescription>
                  {editingInvoice
                    ? "Update the invoice details below"
                    : "Fill in the invoice details below"}
                </DrawerDescription>
              </DrawerHeader>
              <div className="flex-1 overflow-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label htmlFor="invoiceDate">Invoice Date</Label>
                    <Input
                      type="date"
                      id="invoiceDate"
                      value={formState.invoiceDate}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          invoiceDate: e.target.value,
                        }))
                      }
                      className={formErrors.invoiceDate ? "border-red-500" : ""}
                    />
                    {formErrors.invoiceDate && (
                      <p className="text-sm text-red-500 mt-1">
                        <AlertTriangle className="h-4 w-4 inline mr-1" />
                        {formErrors.invoiceDate}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      type="date"
                      id="dueDate"
                      value={formState.dueDate}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          dueDate: e.target.value,
                        }))
                      }
                      className={formErrors.dueDate ? "border-red-500" : ""}
                    />
                    {formErrors.dueDate && (
                      <p className="text-sm text-red-500 mt-1">
                        <AlertTriangle className="h-4 w-4 inline mr-1" />
                        {formErrors.dueDate}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Input
                    id="paymentTerms"
                    value={formState.paymentTerms}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        paymentTerms: e.target.value,
                      }))
                    }
                    className={formErrors.paymentTerms ? "border-red-500" : ""}
                  />
                  {formErrors.paymentTerms && (
                    <p className="text-sm text-red-500 mt-1">
                      <AlertTriangle className="h-4 w-4 inline mr-1" />
                      {formErrors.paymentTerms}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Invoice Items</h4>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddItem}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>

                  {formState.items.map((item, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-4">
                        <div>
                          <Label>Description</Label>
                          <Input
                            value={item.description}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "description",
                                e.target.value,
                              )
                            }
                            className={
                              formErrors[`items.${index}.description`]
                                ? "border-red-500"
                                : ""
                            }
                          />
                          {formErrors[`items.${index}.description`] && (
                            <p className="text-sm text-red-500 mt-1">
                              <AlertTriangle className="h-4 w-4 inline mr-1" />
                              {formErrors[`items.${index}.description`]}
                            </p>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "quantity",
                                  e.target.value,
                                )
                              }
                              className={
                                formErrors[`items.${index}.quantity`]
                                  ? "border-red-500"
                                  : ""
                              }
                            />
                            {formErrors[`items.${index}.quantity`] && (
                              <p className="text-sm text-red-500 mt-1">
                                <AlertTriangle className="h-4 w-4 inline mr-1" />
                                {formErrors[`items.${index}.quantity`]}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label>Amount</Label>
                            <Input
                              type="number"
                              value={item.amount}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "amount",
                                  e.target.value,
                                )
                              }
                              className={
                                formErrors[`items.${index}.amount`]
                                  ? "border-red-500"
                                  : ""
                              }
                            />
                            {formErrors[`items.${index}.amount`] && (
                              <p className="text-sm text-red-500 mt-1">
                                <AlertTriangle className="h-4 w-4 inline mr-1" />
                                {formErrors[`items.${index}.amount`]}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label>Tax Rate (%)</Label>
                            <Input
                              type="number"
                              value={item.taxRate}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "taxRate",
                                  e.target.value,
                                )
                              }
                              className={
                                formErrors[`items.${index}.taxRate`]
                                  ? "border-red-500"
                                  : ""
                              }
                            />
                            {formErrors[`items.${index}.taxRate`] && (
                              <p className="text-sm text-red-500 mt-1">
                                <AlertTriangle className="h-4 w-4 inline mr-1" />
                                {formErrors[`items.${index}.taxRate`]}
                              </p>
                            )}
                          </div>
                        </div>
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => handleRemoveItem(index)}
                          >
                            Remove Item
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="mt-6">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formState.notes}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Add any additional notes..."
                  />
                </div>

                <div className="mt-6 bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(calculateTotals().subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Tax:</span>
                      <span>{formatCurrency(calculateTotals().totalTax)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total Amount:</span>
                      <span>{formatCurrency(calculateTotals().total)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <DrawerFooter className="border-t">
                <Button
                  onClick={handleSubmit}
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingInvoice ? "Updating..." : "Creating..."}
                    </>
                  ) : editingInvoice ? (
                    "Update Invoice"
                  ) : (
                    "Create Invoice"
                  )}
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {invoices.map((invoice) => (
              <Card
                key={invoice._id}
                className="overflow-hidden border-0 shadow-md"
              >
                <div
                  className="flex items-center justify-between p-4 cursor-pointer  transition-colors duration-150"
                  onClick={() => toggleInvoiceExpansion(invoice._id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 p-2 rounded-full">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">
                        Invoice #{invoice.invoiceNumber}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Issued by: {invoice.issuedBy.firstName}{" "}
                        {invoice.issuedBy.lastName}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge
                          className={getInvoiceStatusColor(invoice.status)}
                        >
                          {invoice.status.replace("_", " ").toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(invoice.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {(invoice.status === "draft" ||
                      invoice.status === "revision_requested") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSubmitForApproval(invoice)}
                        disabled={submittingInvoiceId === invoice._id}
                      >
                        {submittingInvoiceId === invoice._id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            {invoice.status === "revision_requested"
                              ? "Resubmit Invoice"
                              : "Submit for Approval"}
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setExpandedInvoice(
                          expandedInvoice === invoice._id ? null : invoice._id,
                        )
                      }
                    >
                      {expandedInvoice === invoice._id ? (
                        <ChevronUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-green-600" />
                      )}
                    </Button>
                    {(invoice.status === "draft" ||
                      invoice.status === "revision_requested") && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(invoice)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {expandedInvoice === invoice._id && (
                  <Card className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <Card className="p-4 rounded-lg shadow">
                        <h5 className="font-semibold mb-3 text-green-800">
                          Invoice Details
                        </h5>
                        <div className="space-y-2">
                          <p className="text-sm flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-green-600" />
                            Invoice Date: {formatDate(invoice.invoiceDate)}
                          </p>
                          <p className="text-sm flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-green-600" />
                            Due Date: {formatDate(invoice.dueDate)}
                          </p>
                          <p className="text-sm flex items-center">
                            <DollarSign className="mr-2 h-4 w-4 text-green-600" />
                            Payment Terms: {invoice.paymentTerms}
                          </p>
                          <div className="pt-2 border-t">
                            <Badge
                              className={getInvoiceStatusColor(invoice.status)}
                            >
                              {invoice.status.replace("_", " ").toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                      <Card className="p-4 rounded-lg shadow">
                        <h5 className="font-semibold mb-3 text-green-800">
                          Amount Summary
                        </h5>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Subtotal:</span>
                            <span className="text-sm font-medium">
                              {formatCurrency(invoice.subtotal)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Total Tax:</span>
                            <span className="text-sm font-medium">
                              {formatCurrency(invoice.totalTax)}
                            </span>
                          </div>
                          <div className="flex justify-between pt-2 border-t">
                            <span className="text-sm font-semibold">
                              Total Amount:
                            </span>
                            <span className="text-sm font-semibold text-green-600">
                              {formatCurrency(invoice.totalAmount)}
                            </span>
                          </div>
                        </div>
                      </Card>
                      <Card className="p-4 rounded-lg shadow">
                        <h5 className="font-semibold mb-3 text-green-800">
                          Payment Status
                        </h5>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Total Paid:</span>
                            <span className="text-sm font-medium text-green-600">
                              {formatCurrency(
                                invoice.payments?.reduce(
                                  (sum, payment: any) =>
                                    sum + payment?.amountPaid,
                                  0,
                                ) || 0,
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Outstanding:</span>
                            <span className="text-sm font-medium text-red-600">
                              {formatCurrency(
                                invoice.totalAmount -
                                  (invoice.payments?.reduce(
                                    (sum, payment: any) =>
                                      sum + payment.amountPaid,
                                    0,
                                  ) || 0),
                              )}
                            </span>
                          </div>
                          <div className="pt-2 border-t">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    ((invoice.payments?.reduce(
                                      (sum, payment: any) =>
                                        sum + payment.amountPaid,
                                      0,
                                    ) || 0) /
                                      invoice.totalAmount) *
                                      100,
                                  )}%`,
                                }}
                              ></div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {Math.round(
                                ((invoice.payments?.reduce(
                                  (sum, payment: any) =>
                                    sum + payment.amountPaid,
                                  0,
                                ) || 0) /
                                  invoice.totalAmount) *
                                  100,
                              )}
                              % paid
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>
                    <Card className=" rounded-lg shadow overflow-hidden">
                      <h5 className="font-semibold p-4  text-green-800">
                        Invoice Items
                      </h5>
                      <Table>
                        <TableHeader>
                          <TableRow className="">
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">
                              Quantity
                            </TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">
                              Tax Rate
                            </TableHead>
                            <TableHead className="text-right">
                              Tax Amount
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoice.items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.description}</TableCell>
                              <TableCell className="text-right">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(item.amount)}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.taxRate}%
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(item.taxAmount)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                    {/* Payment Records Section */}
                    {invoice.payments && invoice.payments.length > 0 && (
                      <div className="mt-6 p-4 rounded-lg shadow">
                        <h5 className="font-semibold mb-3 text-blue-800">
                          Payment Records
                        </h5>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[60px]">#</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead className="text-right">
                                  Amount
                                </TableHead>
                                <TableHead>Reference</TableHead>
                                <TableHead className="text-center">
                                  Receipt / Certificate
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {invoice.payments.map((payment: any, index) => (
                                <TableRow key={index}>
                                  <TableCell className="text-xs">
                                    {index + 1}
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {payment.paidAt
                                      ? formatDate(payment.paidAt)
                                      : 'N/A'}
                                  </TableCell>
                                  <TableCell className="text-sm capitalize">
                                    {payment.method?.replace('_', ' ') || 'N/A'}
                                  </TableCell>
                                  <TableCell className="text-right text-sm font-medium text-green-600">
                                    {formatCurrency(payment.amountPaid)}
                                  </TableCell>
                                  <TableCell className="text-xs font-mono align-top">
                                    <div className="space-y-1">
                                      {payment.referenceNumber && (
                                        <div>
                                          <span className="font-semibold">Ref:</span>{' '}
                                          {payment.referenceNumber}
                                        </div>
                                      )}
                                      {payment.bankName && (
                                        <div>{payment.bankName}</div>
                                      )}
                                      {payment.accountNumber && (
                                        <div>{payment.accountNumber}</div>
                                      )}
                                      {payment.branchCode && (
                                        <div>{payment.branchCode}</div>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-xs align-top">
                                    <div className="flex flex-col gap-1 items-start">
                                      {payment.receiptUrl && (
                                        <div className="flex gap-1">
                                          <a
                                            href={payment.receiptUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            <Button
                                              variant="outline"
                                              size="xs"
                                              className="h-7 px-2 text-xs"
                                            >
                                              <FileText className="h-3 w-3 mr-1" />
                                              Receipt
                                            </Button>
                                          </a>
                                          <a
                                            href={payment.receiptUrl}
                                            download={`payment-receipt-${index + 1}.pdf`}
                                          >
                                            <Button
                                              variant="default"
                                              size="xs"
                                              className="h-7 px-2 text-xs"
                                            >
                                              Download
                                            </Button>
                                          </a>
                                        </div>
                                      )}

                                      {payment.method === 'wht' &&
                                        payment.whtCertificateUrl && (
                                          <div className="flex gap-1">
                                            <a
                                              href={payment.whtCertificateUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                            >
                                              <Button
                                                variant="outline"
                                                size="xs"
                                                className="h-7 px-2 text-xs"
                                              >
                                                <FileText className="h-3 w-3 mr-1" />
                                                WHT Cert
                                              </Button>
                                            </a>
                                            <a
                                              href={payment.whtCertificateUrl}
                                              download={`wht-certificate-${index + 1}.pdf`}
                                            >
                                              <Button
                                                variant="default"
                                                size="xs"
                                                className="h-7 px-2 text-xs"
                                              >
                                                Download
                                              </Button>
                                            </a>
                                          </div>
                                        )}

                                      {payment.method === 'wht_vat' &&
                                        payment.whtVatCertificateUrl && (
                                          <div className="flex gap-1">
                                            <a
                                              href={payment.whtVatCertificateUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                            >
                                              <Button
                                                variant="outline"
                                                size="xs"
                                                className="h-7 px-2 text-xs"
                                              >
                                                <FileText className="h-3 w-3 mr-1" />
                                                WHT-VAT
                                              </Button>
                                            </a>
                                            <a
                                              href={payment.whtVatCertificateUrl}
                                              download={`wht-vat-certificate-${index + 1}.pdf`}
                                            >
                                              <Button
                                                variant="default"
                                                size="xs"
                                                className="h-7 px-2 text-xs"
                                              >
                                                Download
                                              </Button>
                                            </a>
                                          </div>
                                        )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Payment Summary */}
                        <div className="mt-4 p-3 bg-white rounded border-l-4 border-blue-500">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">
                              Total Paid:
                            </span>
                            <span className="text-lg font-semibold text-green-600">
                              {formatCurrency(
                                invoice.payments.reduce(
                                  (sum, payment: any) =>
                                    sum + payment.amountPaid,
                                  0,
                                ),
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm font-medium text-gray-700">
                              Outstanding Balance:
                            </span>
                            <span className="text-lg font-semibold text-red-600">
                              {formatCurrency(
                                invoice.totalAmount -
                                  invoice.payments.reduce(
                                    (sum, payment: any) =>
                                      sum + payment.amountPaid,
                                    0,
                                  ),
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Display Revision Request Details */}
                    {invoice.revisionRequest && (
                      <div className="mt-6 bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg shadow">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                          <div className="flex-1">
                            <h5 className="font-semibold mb-2 text-orange-800">
                              Revision Requested
                            </h5>
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm font-medium text-orange-700">
                                  Comments:
                                </p>
                                <p className="text-sm text-orange-900 mt-1">
                                  {invoice.revisionRequest.comments}
                                </p>
                              </div>
                              {invoice.revisionRequest.changes &&
                                invoice.revisionRequest.changes.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium text-orange-700">
                                      Required Changes:
                                    </p>
                                    <ul className="list-disc list-inside text-sm text-orange-900 mt-1 space-y-1">
                                      {invoice.revisionRequest.changes.map(
                                        (change: string, idx: number) => (
                                          <li key={idx}>{change}</li>
                                        ),
                                      )}
                                    </ul>
                                  </div>
                                )}
                              <div className="text-xs text-orange-600 pt-2 border-t border-orange-200">
                                Requested on{" "}
                                {formatDate(
                                  invoice.revisionRequest.requestedAt,
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {invoice.notes && (
                      <div className="mt-6 bg-gray-50 p-4 rounded-lg shadow">
                        <h5 className="font-semibold mb-2 text-gray-800">
                          Notes
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          {invoice.notes}
                        </p>
                      </div>
                    )}
                    {invoice.actualInvoice && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg shadow flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <p className="text-sm text-muted-foreground">
                            Invoice is available
                          </p>
                        </div>
                        <div className="flex space-x-2 mt-4 md:mt-0">
                          <a
                            href={invoice?.actualInvoice}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline">View</Button>
                          </a>
                          <a
                            href={invoice?.actualInvoice}
                            download={invoice?.actualInvoice || "invoice.pdf"}
                          >
                            <Button variant="default">Download</Button>
                          </a>
                        </div>
                      </div>
                    )}
                    <div className="mt-6 bg-white p-4 rounded-lg shadow">
                      <h5 className="font-semibold mb-3 text-green-800">
                        Audit Trail
                      </h5>
                      <div className="space-y-3">
                        {invoice.auditTrail?.map((audit: any, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border-l-4 border-green-400"
                          >
                            <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900">
                                  {audit.action
                                    ?.replace(/_/g, " ")
                                    .toLowerCase()
                                    .replace(/\b\w/g, (l: any) =>
                                      l.toUpperCase(),
                                    )}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(audit.performedAt)}
                                </p>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                by {audit.performedBy?.firstName || "Unknown"}{" "}
                                {audit.performedBy?.lastName || ""}
                                {audit.performedBy?.email && (
                                  <span className="text-gray-400">
                                    {" "}
                                    ({audit.performedBy.email})
                                  </span>
                                )}
                              </p>
                              {audit.details && (
                                <div className="mt-2 text-xs text-gray-500">
                                  {audit.details.comments && (
                                    <p>Comments: {audit.details.comments}</p>
                                  )}
                                  {audit.details.status && (
                                    <p>Status: {audit.details.status}</p>
                                  )}
                                  {audit.details.actualInvoice && (
                                    <p>
                                      Document:{" "}
                                      <a
                                        href={audit.details.actualInvoice}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                      >
                                        View Document
                                      </a>
                                    </p>
                                  )}
                                  {audit.details.payment && (
                                    <div className="mt-1">
                                      <p>Payment Details:</p>
                                      <ul className="ml-2 space-y-1">
                                        <li>
                                          Amount:{" "}
                                          {formatCurrency(
                                            Number(
                                              audit.details.payment.amountPaid,
                                            ),
                                          )}
                                        </li>
                                        <li>
                                          Method:{" "}
                                          {audit.details.payment.method?.replace(
                                            "_",
                                            " ",
                                          )}
                                        </li>
                                        {audit.details.payment
                                          .referenceNumber && (
                                          <li>
                                            Reference:{" "}
                                            {
                                              audit.details.payment
                                                .referenceNumber
                                            }
                                          </li>
                                        )}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )) || (
                          <p className="text-sm text-gray-500">
                            No audit trail available
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <PDFDownloadLink
                              document={
                                <InvoicePDF
                                  invoice={invoice}
                                  currency={currency}
                                />
                              }
                              fileName={`invoice-${invoice.invoiceNumber}.pdf`}
                            >
                              {({ blob, url, loading, error }) => (
                                <Button variant="outline">
                                  {loading
                                    ? "Generating PDF..."
                                    : "Download PDF"}
                                </Button>
                              )}
                            </PDFDownloadLink>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Download invoice as PDF</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* Only show payment button if not fully paid */}
                      {invoice.status !== "paid" && (
                        <Button
                          variant="default"
                          onClick={() => openPaymentDrawer(invoice._id)}
                        >
                          Add Payment Record
                        </Button>
                      )}

                      {/* Show revision request button for pending_invoice_attachment status */}
                      {invoice.status === "pending_invoice_attachment" && (
                        <Button
                          variant="outline"
                          onClick={() => openRevisionDrawer(invoice._id)}
                        >
                          Request Revision
                        </Button>
                      )}

                      <Button
                        variant="default"
                        onClick={() => openAttachDrawer(invoice._id)}
                      >
                        {invoice.actualInvoice
                          ? "Update Invoice"
                          : "Attach Invoice"}
                      </Button>
                    </div>
                  </Card>
                )}
              </Card>
            ))}
            {invoices.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No invoices have been generated yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* --- Payment Drawer with Tabs --- */}
      {showPaymentDrawer && (
        <ModalDrawer
          open={!!showPaymentDrawer}
          onOpenChange={closePaymentDrawer}
        >
          <DrawerContent className="max-w-[800px] mx-auto max-h-[95vh] flex flex-col">
            <DrawerHeader>
              <DrawerTitle>Add Payment Record</DrawerTitle>
              <DrawerDescription>
                Record a payment, WHT, or WHT-VAT for this invoice.
              </DrawerDescription>
            </DrawerHeader>

            <Tabs
              value={paymentTab}
              onValueChange={(v) =>
                setPaymentTab(v as "regular" | "wht" | "wht_vat")
              }
              className="flex-1 flex flex-col min-h-0"
            >
              <div className="px-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="regular">Regular Payment</TabsTrigger>
                  <TabsTrigger value="wht">WHT</TabsTrigger>
                  <TabsTrigger value="wht_vat">WHT-VAT</TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1 px-4 py-4 h-[300px]">
                {/* Regular Payment Tab */}
                <TabsContent value="regular" className="mt-0 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Amount Paid *</Label>
                      <Input
                        type="number"
                        placeholder="Amount Paid"
                        value={paymentForm.amountPaid || ""}
                        onChange={(e) =>
                          setPaymentForm((f: any) => ({
                            ...f,
                            amountPaid: e.target.value,
                          }))
                        }
                        min={0}
                        className={
                          paymentErrors.amountPaid ? "border-red-500" : ""
                        }
                      />
                      {paymentErrors.amountPaid && (
                        <p className="text-sm text-red-500 mt-1">
                          {paymentErrors.amountPaid}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Payment Method *</Label>
                      <Select
                        value={paymentForm.method || ""}
                        onValueChange={(val) =>
                          setPaymentForm((f: any) => ({ ...f, method: val }))
                        }
                      >
                        <SelectTrigger
                          className={
                            paymentErrors.method ? "border-red-500" : ""
                          }
                        >
                          <SelectValue placeholder="Select Method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank_transfer">
                            Bank Transfer
                          </SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                          <SelectItem value="mpesa">MPESA</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                        </SelectContent>
                      </Select>
                      {paymentErrors.method && (
                        <p className="text-sm text-red-500 mt-1">
                          {paymentErrors.method}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Bank Name</Label>
                      <Input
                        type="text"
                        placeholder="Bank Name"
                        value={paymentForm.bankName || ""}
                        onChange={(e) =>
                          setPaymentForm((f: any) => ({
                            ...f,
                            bankName: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Account Number</Label>
                      <Input
                        type="text"
                        placeholder="Account Number"
                        value={paymentForm.accountNumber || ""}
                        onChange={(e) =>
                          setPaymentForm((f: any) => ({
                            ...f,
                            accountNumber: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Branch Code</Label>
                      <Input
                        type="text"
                        placeholder="Branch Code"
                        value={paymentForm.branchCode || ""}
                        onChange={(e) =>
                          setPaymentForm((f: any) => ({
                            ...f,
                            branchCode: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Reference Number</Label>
                      <Input
                        type="text"
                        placeholder="Reference Number"
                        value={paymentForm.referenceNumber || ""}
                        onChange={(e) =>
                          setPaymentForm((f: any) => ({
                            ...f,
                            referenceNumber: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Payment Date</Label>
                      <Input
                        type="date"
                        value={paymentForm.paidAt || ""}
                        onChange={(e) =>
                          setPaymentForm((f: any) => ({
                            ...f,
                            paidAt: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Receipt Upload *</Label>
                      <FileUpload
                        onChange={async (files) => {
                          if (!files?.length) return;
                          setIsReceiptUploading(true);
                          try {
                            const url = await cloudinaryService.uploadFile(
                              files[0],
                            );
                            setPaymentForm((f: any) => ({
                              ...f,
                              receiptUrl: url,
                            }));
                            setPaymentErrors((prev) => {
                              const n = { ...prev };
                              delete n.receiptUrl;
                              return n;
                            });
                            toast({
                              title: "Uploaded",
                              description: "Receipt uploaded successfully",
                            });
                          } catch (e: any) {
                            toast({
                              title: "Upload failed",
                              description: e?.message || "Unable to upload",
                              variant: "destructive",
                            });
                          } finally {
                            setIsReceiptUploading(false);
                          }
                        }}
                      />
                      {isReceiptUploading && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" /> Uploading
                          receipt...
                        </p>
                      )}
                      {paymentForm.receiptUrl && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Linked: {paymentForm.receiptUrl}
                        </p>
                      )}
                      {paymentErrors.receiptUrl && (
                        <p className="text-sm text-red-500 mt-1">
                          {paymentErrors.receiptUrl}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Comments</Label>
                    <Textarea
                      placeholder="Comments (optional)"
                      value={paymentForm.comments || ""}
                      onChange={(e) =>
                        setPaymentForm((f: any) => ({
                          ...f,
                          comments: e.target.value,
                        }))
                      }
                    />
                  </div>
                </TabsContent>

                {/* WHT Tab */}
                <TabsContent value="wht" className="mt-0 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>WHT Amount *</Label>
                      <Input
                        type="number"
                        placeholder="WHT Amount"
                        value={paymentForm.amountPaid || ""}
                        onChange={(e) =>
                          setPaymentForm((f: any) => ({
                            ...f,
                            amountPaid: e.target.value,
                          }))
                        }
                        min={0}
                        className={
                          paymentErrors.amountPaid ? "border-red-500" : ""
                        }
                      />
                      {paymentErrors.amountPaid && (
                        <p className="text-sm text-red-500 mt-1">
                          {paymentErrors.amountPaid}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>WHT Certificate Ref No. *</Label>
                      <Input
                        type="text"
                        placeholder="Certificate Reference Number"
                        value={paymentForm.whtCertificateRefNo || ""}
                        onChange={(e) =>
                          setPaymentForm((f: any) => ({
                            ...f,
                            whtCertificateRefNo: e.target.value,
                          }))
                        }
                        className={
                          paymentErrors.whtCertificateRefNo
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {paymentErrors.whtCertificateRefNo && (
                        <p className="text-sm text-red-500 mt-1">
                          {paymentErrors.whtCertificateRefNo}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <Label>WHT Certificate Upload *</Label>
                      <FileUpload
                        onChange={async (files) => {
                          if (!files?.length) return;
                          setIsWhtCertUploading(true);
                          try {
                            const url = await cloudinaryService.uploadFile(
                              files[0],
                            );
                            setPaymentForm((f: any) => ({
                              ...f,
                              whtCertificateUrl: url,
                            }));
                            setPaymentErrors((prev) => {
                              const n = { ...prev };
                              delete n.whtCertificateUrl;
                              return n;
                            });
                            toast({
                              title: "Uploaded",
                              description:
                                "WHT Certificate uploaded successfully",
                            });
                          } catch (e: any) {
                            toast({
                              title: "Upload failed",
                              description: e?.message || "Unable to upload",
                              variant: "destructive",
                            });
                          } finally {
                            setIsWhtCertUploading(false);
                          }
                        }}
                      />
                      {isWhtCertUploading && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" /> Uploading
                          certificate...
                        </p>
                      )}
                      {paymentForm.whtCertificateUrl && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Linked: {paymentForm.whtCertificateUrl}
                        </p>
                      )}
                      {paymentErrors.whtCertificateUrl && (
                        <p className="text-sm text-red-500 mt-1">
                          {paymentErrors.whtCertificateUrl}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Payment Date</Label>
                      <Input
                        type="date"
                        value={paymentForm.paidAt || ""}
                        onChange={(e) =>
                          setPaymentForm((f: any) => ({
                            ...f,
                            paidAt: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Comments</Label>
                    <Textarea
                      placeholder="Comments (optional)"
                      value={paymentForm.comments || ""}
                      onChange={(e) =>
                        setPaymentForm((f: any) => ({
                          ...f,
                          comments: e.target.value,
                        }))
                      }
                    />
                  </div>
                </TabsContent>

                {/* WHT-VAT Tab */}
                <TabsContent value="wht_vat" className="mt-0 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>WHT-VAT Amount *</Label>
                      <Input
                        type="number"
                        placeholder="WHT-VAT Amount"
                        value={paymentForm.amountPaid || ""}
                        onChange={(e) =>
                          setPaymentForm((f: any) => ({
                            ...f,
                            amountPaid: e.target.value,
                          }))
                        }
                        min={0}
                        className={
                          paymentErrors.amountPaid ? "border-red-500" : ""
                        }
                      />
                      {paymentErrors.amountPaid && (
                        <p className="text-sm text-red-500 mt-1">
                          {paymentErrors.amountPaid}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>WHT-VAT Certificate Ref No. *</Label>
                      <Input
                        type="text"
                        placeholder="Certificate Reference Number"
                        value={paymentForm.whtVatCertificateRefNo || ""}
                        onChange={(e) =>
                          setPaymentForm((f: any) => ({
                            ...f,
                            whtVatCertificateRefNo: e.target.value,
                          }))
                        }
                        className={
                          paymentErrors.whtVatCertificateRefNo
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {paymentErrors.whtVatCertificateRefNo && (
                        <p className="text-sm text-red-500 mt-1">
                          {paymentErrors.whtVatCertificateRefNo}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <Label>WHT-VAT Certificate Upload *</Label>
                      <FileUpload
                        onChange={async (files) => {
                          if (!files?.length) return;
                          setIsWhtVatCertUploading(true);
                          try {
                            const url = await cloudinaryService.uploadFile(
                              files[0],
                            );
                            setPaymentForm((f: any) => ({
                              ...f,
                              whtVatCertificateUrl: url,
                            }));
                            setPaymentErrors((prev) => {
                              const n = { ...prev };
                              delete n.whtVatCertificateUrl;
                              return n;
                            });
                            toast({
                              title: "Uploaded",
                              description:
                                "WHT-VAT Certificate uploaded successfully",
                            });
                          } catch (e: any) {
                            toast({
                              title: "Upload failed",
                              description: e?.message || "Unable to upload",
                              variant: "destructive",
                            });
                          } finally {
                            setIsWhtVatCertUploading(false);
                          }
                        }}
                      />
                      {isWhtVatCertUploading && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" /> Uploading
                          certificate...
                        </p>
                      )}
                      {paymentForm.whtVatCertificateUrl && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Linked: {paymentForm.whtVatCertificateUrl}
                        </p>
                      )}
                      {paymentErrors.whtVatCertificateUrl && (
                        <p className="text-sm text-red-500 mt-1">
                          {paymentErrors.whtVatCertificateUrl}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Payment Date</Label>
                      <Input
                        type="date"
                        value={paymentForm.paidAt || ""}
                        onChange={(e) =>
                          setPaymentForm((f: any) => ({
                            ...f,
                            paidAt: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Comments</Label>
                    <Textarea
                      placeholder="Comments (optional)"
                      value={paymentForm.comments || ""}
                      onChange={(e) =>
                        setPaymentForm((f: any) => ({
                          ...f,
                          comments: e.target.value,
                        }))
                      }
                    />
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>

            <DrawerFooter>
  
                <Button
                onClick={handlePaymentSubmit}
                disabled={isPaymentSubmitting}
                className="flex items-center w-full"
              >
                {isPaymentSubmitting ? (
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                ) : null}
                Submit Payment
              </Button>
              <Button variant="outline" className="flex-1 w-full">
                Cancel
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </ModalDrawer>
      )}

      {/* --- Attach Invoice Drawer --- */}
      {showAttachDrawer && (
        <ModalDrawer open={!!showAttachDrawer} onOpenChange={closeAttachDrawer}>
          <DrawerContent className="max-w-lg mx-auto">
            <DrawerHeader>
              <DrawerTitle>Attach Actual Invoice</DrawerTitle>
              <DrawerDescription>
                Provide the URL to the signed or final invoice document (PDF
                preferred).
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 space-y-2">
              <Label>Invoice Upload</Label>
              <FileUpload
                onChange={async (files) => {
                  if (!files?.length) return;
                  setIsAttachUploading(true);
                  try {
                    const url = await cloudinaryService.uploadFile(files[0]);
                    setAttachUrl(url);
                    toast({
                      title: "Uploaded",
                      description: "Invoice uploaded successfully",
                    });
                  } catch (e: any) {
                    toast({
                      title: "Upload failed",
                      description: e?.message || "Unable to upload",
                      variant: "destructive",
                    });
                  } finally {
                    setIsAttachUploading(false);
                  }
                }}
              />
              {isAttachUploading && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" /> Uploading
                  invoice...
                </p>
              )}
              {attachUrl && (
                <p className="text-xs text-muted-foreground">
                  Linked: {attachUrl}
                </p>
              )}
            </div>
            <DrawerFooter>
              <Button
                onClick={handleAttachSubmit}
                disabled={isAttachSubmitting || isAttachUploading || !attachUrl}
                className="w-full"
              >
                {isAttachSubmitting ? (
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                ) : null}
                Attach
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" className="w-full">
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </ModalDrawer>
      )}

      {/* --- Request Revision Drawer --- */}
      {showRevisionDrawer && (
        <ModalDrawer
          open={!!showRevisionDrawer}
          onOpenChange={closeRevisionDrawer}
        >
          <DrawerContent className="max-w-lg mx-auto">
            <DrawerHeader>
              <DrawerTitle>Request Invoice Revision</DrawerTitle>
              <DrawerDescription>
                Request changes to the invoice before attaching the actual
                document. The invoice creator will be notified.
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 space-y-4">
              <div>
                <Label>Revision Comments *</Label>
                <Textarea
                  placeholder="Explain what needs to be revised..."
                  value={revisionForm.comments}
                  onChange={(e) =>
                    setRevisionForm((f) => ({ ...f, comments: e.target.value }))
                  }
                  rows={4}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Required Changes *</Label>
                <div className="space-y-2 mt-1">
                  {revisionForm.changes.map((change, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Change ${index + 1}`}
                        value={change}
                        onChange={(e) => {
                          const newChanges = [...revisionForm.changes];
                          newChanges[index] = e.target.value;
                          setRevisionForm((f) => ({
                            ...f,
                            changes: newChanges,
                          }));
                        }}
                      />
                      {revisionForm.changes.length > 1 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const newChanges = revisionForm.changes.filter(
                              (_, i) => i !== index,
                            );
                            setRevisionForm((f) => ({
                              ...f,
                              changes: newChanges,
                            }));
                          }}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setRevisionForm((f) => ({
                        ...f,
                        changes: [...f.changes, ""],
                      }))
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Change
                  </Button>
                </div>
              </div>
            </div>
            <DrawerFooter>
              <Button
                onClick={handleRevisionSubmit}
                disabled={isRevisionSubmitting}
                className="w-full"
              >
                {isRevisionSubmitting ? (
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                ) : null}
                Request Revision
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" className="w-full">
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </ModalDrawer>
      )}
    </>
  );
};

export default InvoicesSection;
