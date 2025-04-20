"use client";

import type React from "react";
import { useState } from "react";
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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createInvoice,
  editInvoice,
  submitInvoice,
} from "@/services/invoice.service";
import { Invoice, InvoiceFormState } from "@/types/project";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

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
      router.refresh();
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
      router.refresh();
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
                              handleItemChange(index, "amount", e.target.value)
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
                              handleItemChange(index, "taxRate", e.target.value)
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
                    setFormState((prev) => ({ ...prev, notes: e.target.value }))
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
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Tax Rate</TableHead>
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
                  {invoice.revisionRequest && (
                    <div className="mt-6 p-4 bg-yellow-100 rounded-lg shadow text-black">
                      <h5 className="font-semibold mb-3 flex items-center text-yellow-800">
                        <AlertCircle className="mr-2 h-5 w-5 text-yellow-500" />
                        Revision Requested
                      </h5>
                      <p className="text-sm">
                        <strong>Requested by:</strong>{" "}
                        {invoice.revisionRequest.requestedBy}
                      </p>
                      <p className="text-sm mt-1">
                        <strong>Requested at:</strong>{" "}
                        {formatDate(invoice.revisionRequest.requestedAt)}
                      </p>
                      <p className="text-sm mt-1">
                        <strong>Comments:</strong>{" "}
                        {invoice.revisionRequest.comments}
                      </p>
                      <p className="text-sm mt-1">
                        <strong>Changes:</strong>{" "}
                        {invoice.revisionRequest.changes.join(", ")}
                      </p>
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
                                {loading ? "Generating PDF..." : "Download PDF"}
                              </Button>
                            )}
                          </PDFDownloadLink>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Download invoice as PDF</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button variant="default">Add Payment Record</Button>
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
  );
};

export default InvoicesSection;
