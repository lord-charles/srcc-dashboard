"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CreditCard,
  Loader2,
  ArrowLeft,
  Check,
  AlertCircle,
  Info,
  X,
  FileText,
  Send,
} from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";

import { Button } from "@/components/ui/button";
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
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  createPaymentRequest,
  getLpoRemainingBalance,
} from "@/services/payment-request.service";
import { getLpoById } from "@/services/lpo.service";
import { cloudinaryService } from "@/lib/cloudinary-service";
import type { Lpo } from "@/types/lpo";
import { cn } from "@/lib/utils";

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
  projectId: string;
  lpoId: string;
}

export function PaymentRequestForm({ projectId, lpoId }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [lpo, setLpo] = useState<Lpo | null>(null);
  const [isLoadingLpo, setIsLoadingLpo] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      currency: "KES",
      description: "",
      grnUrl: "",
    },
  });

  // Fetch LPO details
  useEffect(() => {
    async function loadLpoDetails() {
      setIsLoadingLpo(true);
      const res = await getLpoById(lpoId);
      if (res.success && res.data) {
        setLpo(res.data);
        form.setValue("currency", res.data.currency || "KES");
      } else {
        setError(res.error || "Failed to load LPO details.");
        toast({
          variant: "destructive",
          title: "Error",
          description: res.error || "Failed to load LPO details.",
        });
      }
      setIsLoadingLpo(false);
    }
    loadLpoDetails();
  }, [lpoId]);

  // Load LPO remaining balance
  useEffect(() => {
    if (!lpoId) return;
    setLoadingBalance(true);
    getLpoRemainingBalance(lpoId).then((res) => {
      if (res.success) setRemainingBalance(res.data.balance);
      setLoadingBalance(false);
    });
  }, [lpoId]);

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

  const handleCancel = () => {
    router.push(`/projects/${projectId}?tab=financial&financialtab=lpos`);
  };

  const handleSubmit = async (values: FormValues) => {
    if (remainingBalance !== null && values.amount > remainingBalance) {
      setError(`Amount exceeds the LPO remaining balance of ${lpo?.currency || "KES"} ${remainingBalance.toLocaleString()}`);
      return;
    }

    const uploadedAttachments = attachments.filter((a) => a.status === "done").map((a) => a.url);

    setIsSubmitting(true);
    setError(null);

    const payload = {
      projectId,
      lpoId,
      amount: values.amount,
      currency: values.currency,
      description: values.description || undefined,
      grnUrl: uploadedAttachments.length > 0 ? uploadedAttachments[0] : (values.grnUrl || undefined),
      attachments: uploadedAttachments,
    };

    const res = await createPaymentRequest(payload);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error);
      toast({ variant: "destructive", title: "Error", description: res.error });
      return;
    }

    toast({
      title: "Payment request raised",
      description: "Payment request has been submitted for HOD approval.",
    });

    router.push(`/projects/${projectId}?tab=financial&financialtab=paymentrequests`);
  };

  const watchedAmount = form.watch("amount");
  const exceedsBalance = remainingBalance !== null && watchedAmount > remainingBalance;

  if (isLoadingLpo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground mt-2">Loading LPO details...</p>
      </div>
    );
  }

  if (!lpo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <AlertCircle className="w-8 h-8 text-destructive" />
        <h2 className="text-lg font-semibold">Failed to Load LPO</h2>
        <p className="text-sm text-muted-foreground">{error || "The requested LPO details could not be found."}</p>
        <Button onClick={handleCancel} variant="outline" className="mt-2">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Raise Payment Request</h1>
 
          </div>
        </div>

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
            <h3 className="font-semibold text-xs text-muted-foreground mb-3 uppercase tracking-wide">LPO Summary</h3>
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
                  <Loader2 className="h-4 w-4 animate-spin mt-1" />
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
                <p className="font-semibold truncate" title={lpo.supplierId?.name || ""}>
                  {lpo.supplierId?.name || "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Card */}
        <Card className="border border-border">
          <CardContent className="p-6">
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
                <div className="space-y-2 border-t pt-4">
                  <div>
                    <h3 className="font-semibold text-sm">Supporting Documents / GRN</h3>
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
                </div>

                {/* Workflow Notice */}
                <Alert className="bg-muted/30 border">
                  <Info className="h-5 w-5 text-primary" />
                  <AlertTitle>Approval Workflow</AlertTitle>
                  <AlertDescription className="text-muted-foreground text-sm">
                    Your payment request will be sent to the <strong>Head of Department (HOD)</strong> for approval.
                    Once approved, the Finance Checker will raise a payment voucher.
                  </AlertDescription>
                </Alert>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || exceedsBalance}
                    className="min-w-[160px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit for Approval
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
