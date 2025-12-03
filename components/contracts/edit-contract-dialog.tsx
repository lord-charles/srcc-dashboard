import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Spinner } from "../ui/spinner";
import { Contract } from "@/types/project";
import { TemplateEditorDialog } from "./template-editor-dialog";

const formSchema = z.object({
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
  contractValue: z.coerce.number().min(0, {
    message: "Contract value must be a positive number.",
  }),
  currency: z.string().min(1, {
    message: "Please select a currency.",
  }),
  startDate: z.string().min(1, {
    message: "Please select a start date.",
  }),
  endDate: z.string().min(1, {
    message: "Please select an end date.",
  }),
  status: z.string().min(1, {
    message: "Please select a status.",
  }),
  templateId: z.string().optional().nullable(),
  editedTemplateContent: z.string().optional(),
});

export type ContractFormValues = z.infer<typeof formSchema>;

interface EditContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ContractFormValues) => Promise<void>;
  contract: Contract;
  isSubmitting: boolean;
  templates?: Array<{
    _id: string;
    name: string;
    version?: string;
    contentType: string;
    content: string;
    variables?: string[];
  }>;
}

export function EditContractDialog({
  open,
  onOpenChange,
  onSubmit,
  contract,
  isSubmitting,
  templates = [],
}: EditContractDialogProps) {
  const [templateEditorOpen, setTemplateEditorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<
    (typeof templates)[0] | null
  >(null);

  // Format ISO date string to YYYY-MM-DD for HTML date input
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return new Date().toISOString().split("T")[0];
    // Handle both ISO string and date objects
    const date =
      typeof dateString === "object" ? dateString : new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: contract?.description || "",
      contractValue: contract?.contractValue || 0,
      currency: contract?.currency || "KES",
      startDate: formatDateForInput(contract?.startDate),
      endDate: formatDateForInput(contract?.endDate),
      status: contract?.status || "draft",
      templateId:
        (contract as any)?.templateId?._id ||
        (contract as any)?.templateId ||
        "none",
    },
  });

  // Update form values when contract changes
  useEffect(() => {
    if (contract) {
      const templateId =
        (contract as any)?.templateId?._id || (contract as any)?.templateId;
      form.reset({
        description: contract.description || "",
        contractValue: contract.contractValue || 0,
        currency: contract.currency || "KES",
        startDate: formatDateForInput(contract.startDate),
        endDate: formatDateForInput(contract.endDate),
        status: contract.status || "draft",
        templateId: templateId || "none",
      });
    }
  }, [contract, form]);

  const handleSubmit = async (values: ContractFormValues) => {
    await onSubmit(values);
  };

  const handleViewTemplate = () => {
    const templateId = form.getValues("templateId");
    if (templateId) {
      const template = templates.find((t) => t._id === templateId);
      if (template) {
        setSelectedTemplate(template);
        setTemplateEditorOpen(true);
      }
    }
  };

  const handleSaveEditedTemplate = (editedContent: string) => {
    form.setValue("editedTemplateContent", editedContent);
    setTemplateEditorOpen(false);
  };

  const isDraft = contract?.status === "draft";

  // Prepare contract data for template population
  const contractDataForTemplate = {
    projectName: (contract as any)?.projectId?.name || "Project",
    teamMemberName: `${contract.contractedUserId.firstName} ${contract.contractedUserId.lastName}`,
    teamMemberEmail: contract.contractedUserId.email,
    contractValue: form.watch("contractValue") || 0,
    currency: form.watch("currency") || "KES",
    startDate: form.watch("startDate") || "",
    endDate: form.watch("endDate") || "",
    description: form.watch("description") || "",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Contract</DialogTitle>
          <DialogDescription>
            {isDraft
              ? "Update contract details. You can modify all fields while the contract is in draft status."
              : "You can only update the status of this contract since it's not in draft status."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Contract description"
                      className="resize-none"
                      {...field}
                      disabled={!isDraft}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contractValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        disabled
                      />
                    </FormControl>
                    <FormDescription>
                      Fixed as per budget allocation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      // disabled={!isDraft}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="KES">KES</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {isDraft
                        ? "Select contract currency"
                        : "Fixed as per budget allocation"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className={cn(
                          "w-full",
                          !field.value && "text-muted-foreground"
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Fixed as per budget allocation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className={cn(
                          "w-full",
                          !field.value && "text-muted-foreground"
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Fixed as per budget allocation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {templates && templates.length > 0 && (
              <FormField
                control={form.control}
                name="templateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Contract Template{" "}
                      {!field.value && isDraft && "(Optional)"}
                    </FormLabel>
                    <div className="flex gap-2">
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                        // disabled={!isDraft}
                      >
                        <FormControl>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select a template (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No Template</SelectItem>
                          {templates.map((t) => (
                            <SelectItem key={t._id} value={t._id}>
                              {t.name}
                              {t.version ? ` (v${t.version})` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleViewTemplate}
                        disabled={
                          !field.value || field.value === "none" || !isDraft
                        }
                        title="View and edit template"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormDescription>
                      {isDraft
                        ? field.value && field.value !== "none"
                          ? "The selected template will be embedded in the contract. Click the eye icon to preview and edit."
                          : "You can assign a template to this contract. Templates help standardize contract content."
                        : "Template cannot be changed after draft status"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isDraft && (
                        <>
                          <SelectItem value="draft">Draft</SelectItem>
                        </>
                      )}
                      {/* <SelectItem value="suspended">Suspended</SelectItem> */}
                      <SelectItem value="terminated">Terminated</SelectItem>
                      {!isDraft &&
                        contract?.status !== "suspended" &&
                        contract?.status !== "terminated" && (
                          <SelectItem value={contract?.status || "active"}>
                            {contract?.status === "pending_signature"
                              ? "Pending Signature"
                              : contract?.status === "active"
                              ? "Active"
                              : contract?.status}
                          </SelectItem>
                        )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {isDraft
                      ? "Draft contracts can be edited."
                      : "You can suspend or terminate this contract."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <Spinner />
                    <span>Updating...</span>
                  </div>
                ) : (
                  "Update Contract"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      <TemplateEditorDialog
        open={templateEditorOpen}
        onOpenChange={setTemplateEditorOpen}
        template={selectedTemplate}
        onSave={handleSaveEditedTemplate}
        contractData={contractDataForTemplate as any}
      />
    </Dialog>
  );
}
