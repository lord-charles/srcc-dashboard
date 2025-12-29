"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertCircle, Check, CreditCard, Info, Loader2, X } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileUpload } from "../ui/file-upload2";
import { cloudinaryService } from "@/lib/cloudinary-service";

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
  attachmentUrls: z.array(z.string()).optional(),
});

export type FormValues = z.infer<typeof formSchema>;

// Currency options
const currencies = [
  { value: "KES", label: "KES - Kenyan Shilling", symbol: "KSh" },
  { value: "USD", label: "USD - US Dollar", symbol: "$" },
  { value: "EUR", label: "EUR - Euro", symbol: "€" },
  { value: "GBP", label: "GBP - British Pound", symbol: "£" },
];

// Payment type options
const paymentTypes = [
  { value: "Contingency Cash", label: "Contingency Cash" },
  { value: "Purchase Cash", label: "Purchase Cash" },
  { value: "Travel Cash", label: "Travel Cash" },
  { value: "Others", label: "Others" },
];

interface NewImprestDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: FormValues) => Promise<void>;
}

export function NewImprestDrawer({
  open,
  onOpenChange,
  onSubmit,
}: NewImprestDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const { toast } = useToast();
  // Initialize the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentReason: "",
      currency: "KES",
      amount: undefined,
      paymentType: "Contingency Cash",
      explanation: "",
      attachmentUrls: [],
    },
  });

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = files.map(async (file, index) => {
        const url = await cloudinaryService.uploadFile(file);
        // Update progress
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
      // Upload any remaining files
      if (selectedFiles.length > 0 && uploadedUrls.length === 0) {
        await handleFileUpload(selectedFiles);
      }

      const formData = {
        ...values,
        attachmentUrls: uploadedUrls,
      };

      if (onSubmit) {
        await onSubmit(formData);
      }

      toast({
        title: "Imprest request submitted",
        description: "Your imprest request has been submitted successfully.",
      });

      setTimeout(() => {
        onOpenChange(false);
        form.reset();
        setSelectedFiles([]);
        setUploadedUrls([]);
        setUploadProgress(0);
      }, 500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while submitting your request."
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

  // Get the selected currency symbol
  const selectedCurrency = form.watch("currency");
  const currencySymbol =
    currencies.find((c) => c.value === selectedCurrency)?.symbol || "$";

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[90vh] max-h-[90vh]">
        <div className="h-full flex flex-col  w-full">
          <DrawerHeader className="pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full text-primary">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <DrawerTitle className="text-2xl font-semibold">
                  New Imprest Request
                </DrawerTitle>
                <DrawerDescription className="text-sm mt-1">
                  Create a new imprest application for approval
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>

          <ScrollArea className="flex-1">
            <div className="py-6 px-6 md:px-10">
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="border shadow-sm">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-medium mb-4">
                          Request Details
                        </h3>
                        <div className="space-y-6">
                          <FormField
                            control={form.control}
                            name="paymentReason"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Payment Reason{" "}
                                  <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g. Google Cloud Payment"
                                    {...field}
                                    className="bg-background"
                                  />
                                </FormControl>
                                <FormDescription>
                                  Brief reason for the imprest request
                                </FormDescription>
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
                                  Payment Type{" "}
                                  <span className="text-destructive">*</span>
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="bg-background">
                                      <SelectValue placeholder="Select payment type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {paymentTypes.map((type) => (
                                      <SelectItem
                                        key={type.value}
                                        value={type.value}
                                      >
                                        {type.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border shadow-sm">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-medium mb-4">
                          Financial Information
                        </h3>
                        <div className="space-y-6">
                          <FormField
                            control={form.control}
                            name="currency"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Currency{" "}
                                  <span className="text-destructive">*</span>
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
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
                                        className="flex items-center gap-2"
                                      >
                                        <span className="font-medium">
                                          {currency.symbol}
                                        </span>{" "}
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
                                  Amount{" "}
                                  <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                  <div className="relative flex items-center">
                                    <div className="absolute inset-y-0 left-2 flex items-center pl-3 pointer-events-none">
                                      <span className="text-muted-foreground">
                                        {currencySymbol}
                                      </span>
                                    </div>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      placeholder="0.00"
                                      className="pl-16 bg-background"
                                      {...field}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        field.onChange(
                                          value === ""
                                            ? undefined
                                            : Number.parseFloat(value)
                                        );
                                      }}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium mb-4">Explanation</h3>
                      <FormField
                        control={form.control}
                        name="explanation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Detailed Explanation{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Provide a detailed explanation for this imprest request..."
                                className="min-h-[150px] resize-y bg-background"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="flex justify-between">
                              <span>
                                Detailed explanation of the imprest request
                              </span>
                              <span
                                className={`text-xs ${
                                  field.value.length > 450
                                    ? "text-amber-600"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {field.value.length}/500
                              </span>
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* File Attachments Section */}
                  <Card className="border shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">
                          Attachments (Optional)
                        </h3>
                        <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md">
                          {uploadedUrls.length}/15 files uploaded
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
                        <div className="mt-4 space-y-2">
                          <p className="text-sm font-medium">Uploaded Files:</p>
                          <div className="space-y-1">
                            {uploadedUrls.map((url, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between text-xs bg-muted p-2 rounded"
                              >
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline truncate flex-1"
                                >
                                  Attachment {index + 1}
                                </a>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setUploadedUrls((prev) =>
                                      prev.filter((_, i) => i !== index)
                                    );
                                  }}
                                  disabled={isSubmitting}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Alert className="bg-muted/30 border">
                    <Info className="h-5 w-5 text-primary" />
                    <AlertTitle>Important Information</AlertTitle>
                    <AlertDescription className="text-muted-foreground">
                      Your imprest request will be reviewed by your Head of
                      Department and the Accountant before approval. Please
                      ensure all information is accurate and complete.
                    </AlertDescription>
                  </Alert>
                </form>
              </Form>
            </div>
          </ScrollArea>

          <DrawerFooter className="border-t py-4">
            <div className="flex flex-col space-y-4">
              {(isSubmitting || isUploading) && (
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>
                      {isUploading ? "Uploading files" : "Submitting request"}
                    </span>
                    <span>{uploadProgress.toFixed(0)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-1" />
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
                <DrawerClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting || isUploading}
                    className="gap-2 mt-2 sm:mt-0"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </DrawerClose>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting || isUploading}
                    onClick={() => {
                      form.reset();
                      setSelectedFiles([]);
                      setUploadedUrls([]);
                    }}
                    className="gap-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Reset Form
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    onClick={form.handleSubmit(handleSubmit)}
                    className="gap-2 min-w-[120px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Submit Request
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
