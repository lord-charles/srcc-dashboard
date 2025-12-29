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
} from "@/services/invoice.service";
import { Invoice, InvoiceFormState } from "@/types/project";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { FileUpload } from "@/components/ui/file-upload";
import { cloudinaryService } from "@/lib/cloudinary-service";

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
    "yyyy-MM-dd"
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
    null
  );
  const [showAttachDrawer, setShowAttachDrawer] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState<any>({});
  const [attachUrl, setAttachUrl] = useState<string>("");
  const [isPaymentSubmitting, setIsPaymentSubmitting] = useState(false);
  const [isAttachSubmitting, setIsAttachSubmitting] = useState(false);
  const [isReceiptUploading, setIsReceiptUploading] = useState(false);
  const [isAttachUploading, setIsAttachUploading] = useState(false);
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>(
    {}
  );

  const openPaymentDrawer = (invoiceId: string) => {
    setShowPaymentDrawer(invoiceId);
    setPaymentForm({});
  };
  const closePaymentDrawer = () => setShowPaymentDrawer(null);
  const openAttachDrawer = (invoiceId: string) => {
    setShowAttachDrawer(invoiceId);
    setAttachUrl("");
  };
  const closeAttachDrawer = () => setShowAttachDrawer(null);

  const handlePaymentSubmit = async () => {
    if (!showPaymentDrawer) return;
    // Validation: amountPaid, method, and receiptUrl are required
    const errors: Record<string, string> = {};
    if (
      !paymentForm.amountPaid ||
      isNaN(Number(paymentForm.amountPaid)) ||
      Number(paymentForm.amountPaid) <= 0
    ) {
      errors.amountPaid = "Amount paid is required and must be greater than 0.";
    }
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
    setPaymentErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setIsPaymentSubmitting(true);
    try {
      await recordPayment(showPaymentDrawer, paymentForm);
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

  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] =
    useState<InvoiceFormState>(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [submittingInvoiceId, setSubmittingInvoiceId] = useState<string | null>(
    null
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
          : item
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
      { subtotal: 0, totalTax: 0, total: 0 }
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
      case "pending":
      case "pending_approval":
        return "bg-yellow-500 text-white";
      case "overdue":
        return "bg-red-500 text-white";
      case "draft":
        return "bg-gray-500 text-white";
      default:
        return "bg-green-500 text-white";
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
                                e.target.value
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
                                  e.target.value
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
                                  e.target.value
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
                                  e.target.value
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
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {invoice.status === "draft" && (
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
                            Submit for Approval
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setExpandedInvoice(
                          expandedInvoice === invoice._id ? null : invoice._id
                        )
                      }
                    >
                      {expandedInvoice === invoice._id ? (
                        <ChevronUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-green-600" />
                      )}
                    </Button>
                    {invoice.status === "draft" && (
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <Card className=" p-4 rounded-lg shadow">
                        <h5 className="font-semibold mb-3 text-green-800">
                          Invoice Details
                        </h5>
                        <p className="text-sm flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-green-600" />{" "}
                          Invoice Date: {formatDate(invoice.invoiceDate)}
                        </p>
                        <p className="text-sm flex items-center mt-2">
                          <Clock className="mr-2 h-4 w-4 text-green-600" /> Due
                          Date: {formatDate(invoice.dueDate)}
                        </p>
                        <p className="text-sm flex items-center mt-2">
                          <DollarSign className="mr-2 h-4 w-4 text-green-600" />{" "}
                          Payment Terms: {invoice.paymentTerms}
                        </p>
                      </Card>
                      <Card className=" p-4 rounded-lg shadow">
                        <h5 className="font-semibold mb-3 text-green-800">
                          Amount Summary
                        </h5>
                        <p className="text-sm">
                          Subtotal: {formatCurrency(invoice.subtotal)}
                        </p>
                        <p className="text-sm mt-2">
                          Total Tax: {formatCurrency(invoice.totalTax)}
                        </p>
                        <p className="text-sm font-semibold mt-2">
                          Total Amount: {formatCurrency(invoice.totalAmount)}
                        </p>
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
                    {invoice.notes && (
                      <div className="mt-6  p-4 rounded-lg shadow">
                        <h5 className="font-semibold mb-2 text-green-800">
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
                      <div className="space-y-3 text-black">
                        {invoice.auditTrail.map((audit, index) => (
                          <div
                            key={index}
                            className="text-sm border-l-2 border-green-400 pl-3"
                          >
                            <p className="font-medium">
                              {audit.action} by {audit.performedBy.firstName}{" "}
                              {audit.performedBy.lastName}
                            </p>
                            <p className="text-muted-foreground">
                              {formatDate(audit.performedAt)}
                            </p>
                            {audit.details && (
                              <p className="text-muted-foreground mt-1">
                                {audit.details.comments || audit.details.status}
                              </p>
                            )}
                          </div>
                        ))}
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
                      <Button
                        variant="default"
                        onClick={() => openPaymentDrawer(invoice._id)}
                      >
                        Add Payment Record
                      </Button>
                      <Button
                        variant="default"
                        onClick={() => openAttachDrawer(invoice._id)}
                      >
                        Attach Invoice
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

      {/* --- Payment Drawer --- */}
      {showPaymentDrawer && (
        <ModalDrawer
          open={!!showPaymentDrawer}
          onOpenChange={closePaymentDrawer}
        >
          <DrawerContent className="max-w-[500px] mx-auto">
            <DrawerHeader>
              <DrawerTitle>Add Payment Record</DrawerTitle>
              <DrawerDescription>
                Record a payment for this invoice. Provide a receipt URL.
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Amount Paid</Label>
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
                    className={paymentErrors.amountPaid ? "border-red-500" : ""}
                  />
                  {paymentErrors.amountPaid && (
                    <p className="text-sm text-red-500 mt-1">
                      {paymentErrors.amountPaid}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <Select
                    value={paymentForm.method || ""}
                    onValueChange={(val) =>
                      setPaymentForm((f: any) => ({ ...f, method: val }))
                    }
                  >
                    <SelectTrigger
                      className={paymentErrors.method ? "border-red-500" : ""}
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
                  <Label>Receipt Upload</Label>
                  <FileUpload
                    onChange={async (files) => {
                      if (!files?.length) return;
                      setIsReceiptUploading(true);
                      try {
                        const url = await cloudinaryService.uploadFile(
                          files[0]
                        );
                        setPaymentForm((f: any) => ({ ...f, receiptUrl: url }));
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
            </div>
            <DrawerFooter>
              <Button
                onClick={handlePaymentSubmit}
                disabled={isPaymentSubmitting}
                className="w-full"
              >
                {isPaymentSubmitting ? (
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                ) : null}
                Submit Payment
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
    </>
  );
};

export default InvoicesSection;
