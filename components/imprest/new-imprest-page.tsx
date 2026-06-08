"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  AlertCircle,
  Check,
  CreditCard,
  Info,
  Loader2,
  Pencil,
  ArrowLeft,
  X,
} from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileUpload } from "../ui/file-upload2";
import { ComboBox } from "../ui/combobox";
import { cloudinaryService } from "@/lib/cloudinary-service";
import { getProjects, searchProjects } from "@/services/projects-service";
import { createImprest, updateImprest, getImprestById } from "@/services/imprest.service";
import type { Imprest } from "@/types/imprest";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

const formSchema = z.object({
  paymentReason: z
    .string()
    .min(5, {
      message: "Payment reason must be at least 5 characters.",
    })
    .max(100, {
      message: "Payment reason must not exceed 100 characters.",
    }),
  currency: z.string({
    required_error: "Please select a currency.",
  }),
  amount: z.coerce
    .number({
      required_error: "Please enter an amount.",
      invalid_type_error: "Amount must be a number.",
    })
    .positive({
      message: "Amount must be greater than 0.",
    }),
  paymentType: z.string({
    required_error: "Please select a payment type.",
  }),
  explanation: z
    .string()
    .min(10, {
      message: "Explanation must be at least 10 characters.",
    })
    .max(500, {
      message: "Explanation must not exceed 500 characters.",
    }),
  projectId: z.string().optional(),
  attachmentUrls: z.array(z.string()).optional(),
});

export type FormValues = z.infer<typeof formSchema>;

const currencies = [
  { value: "KES", label: "KES - Kenyan Shilling", symbol: "KSh" },
  { value: "USD", label: "USD - US Dollar", symbol: "$" },
  { value: "EUR", label: "EUR - Euro", symbol: "€" },
  { value: "GBP", label: "GBP - British Pound", symbol: "£" },
];

const paymentTypes = [
  { value: "Contingency Cash", label: "Contingency Cash" },
  { value: "Purchase Cash", label: "Purchase Cash" },
  { value: "Travel Cash", label: "Travel Cash" },
  { value: "Others", label: "Others" },
];

export function NewImprestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { toast } = useToast();

  const [editImprest, setEditImprest] = useState<Imprest | null>(null);
  const [isLoadingImprest, setIsLoadingImprest] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Projects list for combobox
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  const isEditMode = !!editId;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentReason: "",
      currency: "KES",
      amount: undefined,
      paymentType: "Contingency Cash",
      explanation: "",
      projectId: "",
      attachmentUrls: [],
    },
  });

  const [projectSearchQuery, setProjectSearchQuery] = useState("");

  // Load and search projects with debounce
  useEffect(() => {
    if (projectSearchQuery.trim() === "") {
      const currentProjId = form.getValues("projectId");
      if (currentProjId) {
        setProjects((prev) => prev.filter((p) => p._id === currentProjId));
      } else {
        setProjects([]);
      }
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoadingProjects(true);
      const res = await searchProjects(projectSearchQuery);
      if (res.success) {
        setProjects(res.data || []);
      }
      setIsLoadingProjects(false);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [projectSearchQuery, form]);

  // Load imprest if in edit mode
  useEffect(() => {
    if (editId) {
      const id = editId;
      async function loadImprest() {
        setIsLoadingImprest(true);
        const res = await getImprestById(id);
        if (res.success && res.data) {
          const imprest = res.data;
          setEditImprest(imprest);
          if (imprest.projectId) {
            const projObj =
              typeof imprest.projectId === "object"
                ? imprest.projectId
                : { _id: imprest.projectId, name: "Loading project..." };
            setProjects([projObj]);
          }
          form.reset({
            paymentReason: imprest.paymentReason || "",
            currency: imprest.currency || "KES",
            amount: imprest.amount,
            paymentType: imprest.paymentType || "Contingency Cash",
            explanation: imprest.explanation || "",
            projectId: (imprest.projectId as any)?._id || imprest.projectId || "",
            attachmentUrls: imprest.attachments?.map((a) => a.fileUrl) || [],
          });
          setUploadedUrls(imprest.attachments?.map((a) => a.fileUrl) || []);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load imprest request details.",
          });
          router.push("/my-imprest");
        }
        setIsLoadingImprest(false);
      }
      loadImprest();
    }
  }, [editId, form, router, toast]);

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = files.map(async (file, index) => {
        const url = await cloudinaryService.uploadFile(file);
        setUploadProgress(((index + 1) / files.length) * 100);
        return url;
      });

      const urls = await Promise.all(uploadPromises);
      setUploadedUrls((prev) => [...prev, ...urls]);

      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) uploaded successfully.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Could not upload files. Please try again.",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (selectedFiles.length > 0 && uploadedUrls.length === 0) {
        await handleFileUpload(selectedFiles);
      }

      const formData = {
        ...values,
        projectId: values.projectId || undefined,
        attachmentUrls: uploadedUrls,
      };

      if (isEditMode && editId) {
        const res = await updateImprest(editId, formData);
        if (!res.success) throw new Error(res.error);
        toast({
          title: "Imprest resubmitted",
          description: "Your revised imprest request has been resubmitted for approval.",
        });
      } else {
        const res = await createImprest(formData);
        if (!res.success) throw new Error(res.error);
        toast({
          title: "Imprest request submitted",
          description: "Your imprest request has been submitted successfully.",
        });
      }

      router.push("/my-imprest");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while submitting your request.",
      );

      toast({
        variant: "destructive",
        title: "Submission failed",
        description: "There was an error submitting your imprest request.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCurrency = form.watch("currency");
  const currencySymbol =
    currencies.find((c) => c.value === selectedCurrency)?.symbol || "$";

  const handleBack = () => {
    router.push("/my-imprest");
  };

  if (isLoadingImprest) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading details...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-2">
      <div className="max-w-7xl space-y-2">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEditMode ? "Edit Imprest Request" : "New Imprest Request"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isEditMode
                ? "Modify your imprest request and resubmit for approval"
                : "Create a new imprest application for review"}
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isEditMode && editImprest?.revision && (
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/50">
            <Pencil className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <div>
              <AlertTitle className="text-amber-700 dark:text-amber-300 font-semibold">
                Revision Requested
              </AlertTitle>
              <AlertDescription className="text-amber-600 dark:text-amber-400 text-sm mt-1">
                {editImprest.revision.reason}
              </AlertDescription>
            </div>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* Card 1: Details */}
              <Card className="border shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Request Details
                  </h3>

                  <FormField
                    control={form.control}
                    name="paymentReason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Payment Reason <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Google Cloud Payment"
                            {...field}
                            className="bg-background"
                          />
                        </FormControl>
                        <FormDescription>Brief reason for the imprest request</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Payment Type <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Select payment type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {paymentTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="projectId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Link to Project (Optional)</FormLabel>
                        <FormControl>
                          <ComboBox
                            options={projects.map((p) => ({
                              value: p._id,
                              label: p.name,
                            }))}
                            value={field.value || ""}
                            onChange={field.onChange}
                            placeholder={isLoadingProjects ? "Loading projects..." : "Search and select project..."}
                            inputPlaceholder="Search projects..."
                            onSearchChange={setProjectSearchQuery}
                            shouldFilter={false} // Disable client-side filtering to show exact search results
                          />
                        </FormControl>
                        <FormDescription>
                          Link this imprest request to a project&apos;s financial tracker
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Card 2: Financials */}
              <Card className="border shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Financial Information
                  </h3>

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Currency <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {currencies.map((currency) => (
                              <SelectItem
                                key={currency.value}
                                value={currency.value}
                              >
                                {currency.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                            <span className="absolute left-3 text-muted-foreground text-sm font-semibold">
                              {currencySymbol}
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className="pl-12 bg-background"
                              {...field}
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(val === "" ? undefined : parseFloat(val));
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Explanation */}
            <Card className="border shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Explanation
                </h3>

                <FormField
                  control={form.control}
                  name="explanation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Detailed Explanation <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide a detailed explanation for this imprest request..."
                          className="min-h-[150px] bg-background text-sm resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="flex justify-between text-xs text-muted-foreground">
                        <span>Detailed explanation of request</span>
                        <span className={field.value.length > 450 ? "text-amber-600 font-medium" : ""}>
                          {field.value.length}/500
                        </span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Attachments */}
            <Card className="border shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Attachments (Optional)
                  </h3>
                  <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md font-medium">
                    {uploadedUrls.length}/15 files
                  </span>
                </div>

                <FileUpload
                  value={selectedFiles}
                  onChange={async (files) => {
                    setSelectedFiles(files);
                    if (files.length > 0) {
                      await handleFileUpload(files);
                    }
                  }}
                  maxFiles={15}
                  maxSize={MAX_FILE_SIZE}
                  acceptedTypes={ACCEPTED_FILE_TYPES}
                  disabled={isSubmitting || isUploading}
                />

                {uploadedUrls.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Uploaded Files</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {uploadedUrls.map((url, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-xs bg-muted/65 p-2 rounded-lg border border-border"
                        >
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary font-medium hover:underline truncate flex-1"
                          >
                            Attachment {index + 1}
                          </a>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setUploadedUrls((prev) => prev.filter((_, i) => i !== index));
                            }}
                            className="h-6 w-6 p-0 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                            disabled={isSubmitting}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Alert className="bg-muted/30 border border-border/60">
              <Info className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <AlertTitle className="font-semibold text-foreground/90">Important Information</AlertTitle>
                <AlertDescription className="text-muted-foreground text-sm mt-0.5">
                  Your imprest request will be reviewed by your Head of Department and the Accountant before approval. Please ensure all details are accurate.
                </AlertDescription>
              </div>
            </Alert>

            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-border/60 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting || isUploading}
                className="w-full sm:w-auto h-11 px-5"
              >
                Cancel
              </Button>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    setSelectedFiles([]);
                    setUploadedUrls([]);
                  }}
                  disabled={isSubmitting || isUploading}
                  className="h-11 px-5"
                >
                  Reset Form
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="h-11 px-6 min-w-[140px] font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      {isEditMode ? "Resubmit Request" : "Submit Request"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
