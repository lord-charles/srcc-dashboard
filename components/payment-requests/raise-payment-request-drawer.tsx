"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CreditCard,
  Loader2,
  X,
  Check,
  AlertCircle,
  Info,
  Upload,
  Pencil,
  FileText,
} from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  createPaymentRequest,
  updatePaymentRequest,
  getLpoRemainingBalance,
} from "@/services/payment-request.service";
import { cloudinaryService } from "@/lib/cloudinary-service";
import type { PaymentRequest } from "@/types/payment-request";
import type { Lpo } from "@/types/lpo";

const formSchema = z.object({
  amount: z.coerce
    .number({ required_error: "Amount is required", invalid_type_error: "Must be a number" })
    .positive("Amount must be greater than 0"),
  currency: z.string().min(1, "Currency is required"),
  description: z.string().min(5, "Description must be at least 5 characters").max(500).optional().or(z.literal("")),
  grnUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lpo: Lpo;
  projectId: string;
  editRequest?: PaymentRequest | null;
  onSuccess?: () => void;
}

export function RaisePaymentRequestDrawer({
  open,
  onOpenChange,
  lpo,
  projectId,
  editRequest,
  onSuccess,
}: Props) {
  const isEdit = !!editRequest;
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingBalance, setRemainingBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [attachments, setAttachments] = useState<
    Array<{ url: string; name: string; status: "uploading" | "done" | "error" }>
  >([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
      currency: lpo.currency || "KES",
      description: "",
      grnUrl: "",
    },
  });

  // Populate form in edit mode
  useEffect(() => {
    if (isEdit && editRequest) {
      form.reset({
        amount: editRequest.amount,
        currency: editRequest.currency,
        description: editRequest.description || "",
        grnUrl: editRequest.grnUrl || "",
      });
      const initialAtts = (editRequest.attachments || (editRequest.grnUrl ? [editRequest.grnUrl] : [])).map((url) => ({
        url,
        name: url.split("/").pop() || "Attached Document",
        status: "done" as const,
      }));
      setAttachments(initialAtts);
    }
  }, [isEdit, editRequest]);

  // Load LPO remaining balance
  useEffect(() => {
    if (!open || !lpo._id) return;
    setLoadingBalance(true);
    getLpoRemainingBalance(lpo._id, editRequest?._id).then((res) => {
      if (res.success) setRemainingBalance(res.data.balance);
      setLoadingBalance(false);
    });
  }, [open, lpo._id, editRequest?._id]);

  const handleFileUpload = async (files: File[]) => {
    if (!files.length) return;

    for (const file of files) {
      setAttachments((prev) => [
        ...prev,
        { url: "", name: file.name, status: "uploading" },
      ]);

      cloudinaryService.uploadFile(file)
        .then((url) => {
          setAttachments((prev) =>
            prev.map((a) =>
              a.name === file.name && a.status === "uploading"
                ? { url, name: file.name, status: "done" }
                : a
            )
          );
          toast({ title: "Uploaded", description: `${file.name} uploaded successfully.` });
        })
        .catch(() => {
          setAttachments((prev) =>
            prev.map((a) =>
              a.name === file.name && a.status === "uploading"
                ? { ...a, status: "error" }
                : a
            )
          );
          toast({ title: "Upload failed", description: `Could not upload ${file.name}.`, variant: "destructive" });
        });
    }
  };

  const handleSubmit = async (values: FormValues) => {
    if (remainingBalance !== null && values.amount > remainingBalance) {
      setError(`Amount exceeds the LPO remaining balance of ${lpo.currency} ${remainingBalance.toLocaleString()}`);
      return;
    }

    const uploadedAttachments = attachments.filter((a) => a.status === "done").map((a) => a.url);

    setIsSubmitting(true);
    setError(null);

    const payload = {
      projectId,
      lpoId: lpo._id,
      amount: values.amount,
      currency: values.currency,
      description: values.description || undefined,
      grnUrl: uploadedAttachments.length > 0 ? uploadedAttachments[0] : (values.grnUrl || undefined),
      attachments: uploadedAttachments,
    };

    const res = isEdit && editRequest
      ? await updatePaymentRequest(editRequest._id, payload)
      : await createPaymentRequest(payload);

    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error);
      toast({ variant: "destructive", title: "Error", description: res.error });
      return;
    }

    toast({
      title: isEdit ? "Request resubmitted" : "Payment request raised",
      description: isEdit
        ? "Your revised payment request has been resubmitted for HOD approval."
        : "Payment request has been submitted for HOD approval.",
    });

    form.reset();
    onOpenChange(false);
    onSuccess?.();
  };

  const watchedAmount = form.watch("amount");
  const exceedsBalance = remainingBalance !== null && watchedAmount > remainingBalance;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[90vh] max-h-[90vh]">
        <div className="flex-1 flex flex-col min-h-0 w-full">
          {/* Header */}
          <DrawerHeader className="pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${isEdit ? "bg-amber-100 text-amber-600" : "bg-primary/10 text-primary"}`}>
                {isEdit ? <Pencil className="h-6 w-6" /> : <CreditCard className="h-6 w-6" />}
              </div>
              <div>
                <DrawerTitle className="text-2xl font-semibold">
                  {isEdit ? "Edit & Resubmit Payment Request" : "Raise Payment Request"}
                </DrawerTitle>
                <DrawerDescription className="text-sm mt-1">
                  Against LPO <strong>{lpo.lpoNo}</strong> — {lpo.supplierId?.name || "Supplier"}
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>

          <ScrollArea className="flex-1">
            <div className="py-6 px-6 md:px-10 space-y-6">
              {/* Revision Notice */}
              {isEdit && editRequest?.revision && (
                <Alert className="border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10">
                  <Pencil className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <AlertTitle className="text-amber-700 dark:text-amber-300">Revision Required</AlertTitle>
                  <AlertDescription className="text-amber-600 dark:text-amber-400">
                    {editRequest.revision.comment}
                  </AlertDescription>
                </Alert>
              )}

              {/* Error */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* LPO Summary */}
              <Card className="border-2 border-primary/10 bg-primary/5">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wide">LPO Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">LPO Number</p>
                      <p className="font-semibold">{lpo.lpoNo}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Amount</p>
                      <p className="font-semibold">{lpo.currency} {lpo.totalAmount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Remaining Balance</p>
                      {loadingBalance ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : remainingBalance !== null ? (
                        <p className={`font-semibold ${remainingBalance <= 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}>
                          {lpo.currency} {remainingBalance.toLocaleString()}
                        </p>
                      ) : (
                        <p className="text-muted-foreground">—</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Supplier</p>
                      <p className="font-semibold truncate">{lpo.supplierId?.name || "—"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Amount */}
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Amount <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative flex items-center">
                              <span className="absolute left-3 text-muted-foreground text-sm font-medium">
                                {lpo.currency || "KES"}
                              </span>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                className={`pl-16 ${exceedsBalance ? "border-destructive" : ""}`}
                                {...field}
                                onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
                              />
                            </div>
                          </FormControl>
                          {exceedsBalance && (
                            <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Amount exceeds remaining balance of {lpo.currency} {remainingBalance?.toLocaleString()}
                            </p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Currency (read-only from LPO) */}
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly className="bg-muted/50 cursor-not-allowed" />
                          </FormControl>
                          <FormDescription>Inherited from LPO</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description / Payment Purpose</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe what this payment is for..."
                            className="resize-y min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="flex justify-between">
                          <span>Optional but recommended for audit clarity</span>
                          <span className={`text-xs ${(field.value?.length || 0) > 450 ? "text-amber-600" : "text-muted-foreground"}`}>
                            {field.value?.length || 0}/500
                          </span>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Supporting Documents Upload */}
                  <Card className="border shadow-sm">
                    <CardContent className="p-5 space-y-4">
                      <div>
                        <h3 className="font-medium text-sm">Supporting Documents / GRN</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Optional — Upload confirmation notes, bills, or goods received notes
                        </p>
                      </div>

                      <div className="space-y-3">
                        <FileUpload
                          onChange={handleFileUpload}
                          multiple={true}
                        />

                        {attachments.length > 0 && (
                          <div className="space-y-2 mt-1">
                            {attachments.map((file, index) => (
                              <div
                                key={index}
                                className={cn(
                                  "flex items-center gap-3 px-3.5 py-2.5 rounded-lg border text-sm transition-colors",
                                  file.status === "uploading" && "bg-muted/30 border-border/60",
                                  file.status === "done" && "bg-background border-border",
                                  file.status === "error" && "bg-destructive/5 border-destructive/20"
                                )}
                              >
                                {/* Icon */}
                                <div className={cn(
                                  "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
                                  file.status === "uploading" && "bg-muted",
                                  file.status === "done" && "bg-primary/10",
                                  file.status === "error" && "bg-destructive/10"
                                )}>
                                  {file.status === "uploading" ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                                  ) : file.status === "done" ? (
                                    <FileText className="w-3.5 h-3.5 text-primary" />
                                  ) : (
                                    <X className="w-3.5 h-3.5 text-destructive" />
                                  )}
                                </div>

                                {/* Name + Status */}
                                <div className="flex-1 min-w-0">
                                  {file.status === "done" ? (
                                    <a
                                      href={file.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-medium text-foreground hover:text-primary transition-colors truncate block"
                                    >
                                      {file.name}
                                    </a>
                                  ) : (
                                    <span className={cn("font-medium truncate block", file.status === "error" && "text-destructive")}>
                                      {file.name}
                                    </span>
                                  )}
                                  <span className={cn(
                                    "text-xs mt-0.5 block",
                                    file.status === "uploading" && "text-muted-foreground",
                                    file.status === "done" && "text-muted-foreground",
                                    file.status === "error" && "text-destructive/70"
                                  )}>
                                    {file.status === "uploading" && "Uploading..."}
                                    {file.status === "done" && "Uploaded"}
                                    {file.status === "error" && "Upload failed — please try again"}
                                  </span>
                                </div>

                                {/* Remove */}
                                {file.status !== "uploading" && (
                                  <button
                                    type="button"
                                    onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== index))}
                                    className="shrink-0 text-muted-foreground/50 hover:text-destructive transition-colors p-1 rounded"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Info notice */}
                  <Alert className="bg-muted/30 border">
                    <Info className="h-5 w-5 text-primary" />
                    <AlertTitle>Approval Workflow</AlertTitle>
                    <AlertDescription className="text-muted-foreground text-sm">
                      Your payment request will be sent to the <strong>Head of Department (HOD)</strong> for approval.
                      Once approved, the Finance Checker will raise a payment voucher.
                    </AlertDescription>
                  </Alert>
                </form>
              </Form>
            </div>
          </ScrollArea>

          {/* Footer */}
          <DrawerFooter className="border-t py-4">
            <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2 -mt-5">
              <DrawerClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting || isUploading} className="gap-2 mt-2 sm:mt-0">
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </DrawerClose>
              <Button
                type="button"
                disabled={isSubmitting || isUploading || exceedsBalance}
                onClick={form.handleSubmit(handleSubmit)}
                className="gap-2 min-w-[160px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    {isEdit ? "Resubmit Request" : "Submit for HOD Approval"}
                  </>
                )}
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
