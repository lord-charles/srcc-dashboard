import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
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
import { useEffect, useMemo, useState } from "react";
import { formatDateForInput } from "@/lib/date-utils";
import { TemplateEditorDialog } from "./template-editor-dialog";
import { Eye } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { cloudinaryService } from "@/lib/cloudinary-service";
import { ScrollArea } from "../ui/scroll-area";

const attachmentSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  url: z.string().url({ message: "Valid URL required" }),
  type: z.string().optional(),
});

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
  milestoneId: z.string().optional().nullable(),
  templateId: z.string().optional().nullable(),
  editedTemplateContent: z.string().optional(),
  attachments: z.array(attachmentSchema).optional(),
});

export type ContractFormValues = z.infer<typeof formSchema>;

interface CreateContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ContractFormValues) => Promise<void>;
  projectName: string;
  teamMemberName: string;
  teamMemberEmail: string;
  internalCategories: any[];
  milestones?: Array<{
    _id: string;
    title: string;
    description: string;
  }>;
  isSubmitting: boolean;
  templates?: Array<{
    _id: string;
    name: string;
    version?: string;
    contentType: string;
    content: string;
    variables?: string[];
    category?: string;
  }>; // optional list of templates
  isCoach?: boolean; // Flag to indicate if this is for a coach
  coachContractData?: {
    rate: number;
    currency: string;
    rateUnit: "per_session" | "per_hour";
  }; // Coach's embedded contract data
}

export function CreateContractDialog({
  open,
  onOpenChange,
  onSubmit,
  projectName,
  teamMemberName,
  teamMemberEmail,
  internalCategories,
  milestones = [],
  isSubmitting,
  templates = [],
  isCoach = false,
  coachContractData,
}: CreateContractDialogProps) {
  const [templateEditorOpen, setTemplateEditorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<
    (typeof templates)[0] | null
  >(null);

  // Find user in internal budget (code 2237) - only for team members, not coaches
  const salaryCategory = !isCoach
    ? internalCategories?.find((cat) => cat.name === "2237")
    : null;
  const userBudgetItem = !isCoach
    ? salaryCategory?.items?.find((item: any) =>
        item.name.includes(teamMemberEmail),
      )
    : null;

  // For coaches, we don't require budget allocation - use coach contract data instead
  const canCreateContract = isCoach || !!userBudgetItem;

  // Extract budget details if user is found - memoize to prevent recalculation
  const budgetStartDate = useMemo(() => {
    if (isCoach) {
      return new Date().toISOString().split("T")[0];
    }
    return userBudgetItem?.startDate || new Date().toISOString().split("T")[0];
  }, [isCoach, userBudgetItem?.startDate]);

  const budgetEndDate = useMemo(() => {
    if (isCoach) {
      return new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .split("T")[0];
    }
    return (
      userBudgetItem?.endDate ||
      new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .split("T")[0]
    );
  }, [isCoach, userBudgetItem?.endDate]);

  // Calculate default contract value
  const defaultContractValue = useMemo(() => {
    if (isCoach && coachContractData) {
      // For coaches, use their rate * 10 as default (assuming 10 sessions/hours)
      return coachContractData.rate * 10;
    }
    return userBudgetItem?.estimatedAmount || 0;
  }, [isCoach, coachContractData, userBudgetItem?.estimatedAmount]);

  // Get default currency
  const defaultCurrency = useMemo(() => {
    if (isCoach && coachContractData) {
      return coachContractData.currency;
    }
    return "KES";
  }, [isCoach, coachContractData]);

  // Filter templates based on contract type
  const filteredTemplates = useMemo(() => {
    if (!templates) return [];

    if (isCoach) {
      // For coaches, show templates with category 'coach'
      return templates.filter((t) => t.category === "coach");
    } else {
      // For team members, show templates with no category, 'team_member', or 'consultant'
      return templates.filter(
        (t) =>
          !t.category ||
          t.category === "team_member" ||
          t.category === "consultant",
      );
    }
  }, [templates, isCoach]);

  const firstTemplateId = filteredTemplates?.[0]?._id;

  // Create form with initial values
  const defaultValues = useMemo(
    () => ({
      description: isCoach
        ? `Coach Contract for ${projectName}`
        : `Consultant Contract for ${projectName}`,
      contractValue: defaultContractValue,
      currency: defaultCurrency,
      startDate: formatDateForInput(budgetStartDate),
      endDate: formatDateForInput(budgetEndDate),
      status: "draft",
      templateId: firstTemplateId || undefined,
    }),
    [
      isCoach,
      projectName,
      defaultContractValue,
      defaultCurrency,
      budgetStartDate,
      budgetEndDate,
      firstTemplateId,
    ],
  );

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const {
    fields: attachmentFields,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: "attachments" as const,
  });

  // Track uploading state for each attachment row
  const [attachmentUploading, setAttachmentUploading] = useState<
    Record<number, boolean>
  >({});

  // Update form values when team member or budget changes
  useEffect(() => {
    form.reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues]);

  const handleSubmit = async (values: ContractFormValues) => {
    await onSubmit(values);
  };

  const handleViewTemplate = () => {
    const templateId = form.getValues("templateId");
    if (templateId) {
      const template = filteredTemplates.find((t) => t._id === templateId);
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

  // Prepare contract data for template population
  const contractDataForTemplate = {
    projectName,
    teamMemberName,
    teamMemberEmail,
    contractValue: form.watch("contractValue") || 0,
    currency: form.watch("currency") || "KES",
    startDate: form.watch("startDate") || "",
    endDate: form.watch("endDate") || "",
    description: form.watch("description") || "",
    // Coach-specific data
    isCoach,
    coachRate: coachContractData?.rate,
    coachRateUnit: coachContractData?.rateUnit,
    coachTitle:
      teamMemberName.split(" ")[0] === teamMemberName ? "Mr/Ms" : "Mr/Ms", // Could be enhanced to detect title
    coachFirstName: teamMemberName.split(" ")[0],
    coachLastName: teamMemberName.split(" ").slice(1).join(" "),
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[calc(100vh-3rem)] mx-auto p-0 flex flex-col">
        <DrawerHeader className="px-6 pt-6">
          <DrawerTitle>
            {canCreateContract
              ? "Create New Contract"
              : "Cannot Create Contract"}
          </DrawerTitle>
          <DrawerDescription>
            {canCreateContract ? (
              `Create a contract for ${isCoach ? "coach" : "team member"} ${teamMemberName} on project ${projectName}.`
            ) : (
              <span className="text-destructive">
                Cannot create contract - {teamMemberName} is not allocated in
                the internal budget (code 2237). Please add them to the budget
                first.
              </span>
            )}
          </DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="flex-1">
          <Form {...form}>
            <form
              id="create-contract-form"
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6 p-6"
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
                          disabled={!isCoach} // Only disable for team members (budget-based)
                        />
                      </FormControl>
                      <FormDescription>
                        {isCoach
                          ? `Based on coach rate (${coachContractData?.rate || 0} ${coachContractData?.currency || "KES"} per ${coachContractData?.rateUnit === "per_session" ? "session" : "hour"})`
                          : "Fixed as per budget allocation"}
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
                        Select the contract currency
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
                            !field.value && "text-muted-foreground",
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {isCoach
                          ? "Contract start date"
                          : "Fixed as per budget allocation"}
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
                            !field.value && "text-muted-foreground",
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {isCoach
                          ? "Contract end date"
                          : "Fixed as per budget allocation"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {milestones && milestones.length > 0 && (
                <FormField
                  control={form.control}
                  name="milestoneId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Milestone (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select milestone (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">
                            No specific milestone
                          </SelectItem>
                          {milestones.map((milestone) => (
                            <SelectItem
                              key={milestone._id}
                              value={milestone._id}
                            >
                              {milestone.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Link this contract to a specific project milestone
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {filteredTemplates && filteredTemplates.length > 0 && (
                <FormField
                  control={form.control}
                  name="templateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Template</FormLabel>
                      <div className="flex gap-2">
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select a template" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredTemplates.map((t) => (
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
                          disabled={!field.value}
                          title="View and edit template"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormDescription>
                        The selected template will be embedded in the contract.
                        Click the eye icon to preview and edit.
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
                        <SelectItem value="draft">Draft</SelectItem>
                        {/* <SelectItem value="pending_signature">
                        Pending Signature
                      </SelectItem> */}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Draft contracts can be edited.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Attachments */}
              <div className="space-y-2 border rounded-md p-3">
                <div className="flex items-center justify-between">
                  <FormLabel>
                    Attachments(optional-attach link or upload file)
                  </FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ name: "", url: "", type: "" })}
                  >
                    Add
                  </Button>
                </div>
                <div className="space-y-3">
                  {attachmentFields.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Add supporting document URLs (e.g., offer letters, IDs).
                    </p>
                  )}
                  {attachmentFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-12 gap-2 items-start"
                    >
                      <FormField
                        control={form.control}
                        name={`attachments.${index}.name` as const}
                        render={({ field }) => (
                          <FormItem className="col-span-4">
                            <FormControl>
                              <Input placeholder="Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`attachments.${index}.url` as const}
                        render={({ field }) => (
                          <FormItem className="col-span-4">
                            <FormControl>
                              <Input placeholder="https://..." {...field} />
                            </FormControl>
                            {field.value ? (
                              <p className="text-xs text-muted-foreground mt-1 break-all">
                                Linked: {field.value}
                              </p>
                            ) : null}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="col-span-4 flex items-center">
                        <div className="flex flex-col">
                          <FileUpload
                            onChange={async (files) => {
                              if (!files?.length) return;
                              setAttachmentUploading((prev) => ({
                                ...prev,
                                [index]: true,
                              }));
                              try {
                                const url = await cloudinaryService.uploadFile(
                                  files[0],
                                );
                                form.setValue(
                                  `attachments.${index}.url` as const,
                                  url,
                                  { shouldValidate: true },
                                );
                              } catch (e: any) {
                                // no toast here; parent handles toasts
                              } finally {
                                setAttachmentUploading((prev) => ({
                                  ...prev,
                                  [index]: false,
                                }));
                              }
                            }}
                          />
                          {attachmentUploading[index] && (
                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                              <Spinner />
                              <span>Uploading...</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-span-1 flex items-center justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          title="Remove"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spacer so footer doesn't cover content */}
              <div className="h-24" />
            </form>
          </Form>
        </ScrollArea>

        {/* Sticky bottom action bar */}
        <div className="border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 sticky bottom-0">
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="create-contract-form"
              disabled={isSubmitting || !canCreateContract}
              className={
                !canCreateContract ? "cursor-not-allowed opacity-50" : ""
              }
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <Spinner />
                  <span>Creating...</span>
                </div>
              ) : (
                "Create Contract"
              )}
            </Button>
          </div>
        </div>
      </DrawerContent>

      <TemplateEditorDialog
        open={templateEditorOpen}
        onOpenChange={setTemplateEditorOpen}
        template={selectedTemplate}
        onSave={handleSaveEditedTemplate}
        contractData={contractDataForTemplate as any}
      />
    </Drawer>
  );
}
