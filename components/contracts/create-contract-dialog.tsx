import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { useEffect } from "react";
import { formatDateForInput } from "@/lib/date-utils";

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
  templateId: z.string().optional(),
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
  isSubmitting: boolean;
  templates?: Array<{ _id: string; name: string; version?: string }>; // optional list of templates
}

export function CreateContractDialog({
  open,
  onOpenChange,
  onSubmit,
  projectName,
  teamMemberName,
  teamMemberEmail,
  internalCategories,
  isSubmitting,
  templates = [],
}: CreateContractDialogProps) {



  // Find user in internal budget (code 2237)
  const salaryCategory = internalCategories?.find(cat => cat.name === '2237');
  const userBudgetItem = salaryCategory?.items?.find(
    (item: any) => item.name.includes(teamMemberEmail)
  );



  // Extract budget details if user is found
  const budgetStartDate = userBudgetItem?.startDate || new Date().toISOString().split('T')[0];
  const budgetEndDate = userBudgetItem?.endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];

  // Create form with initial values
  const defaultValues = {
    description: `Team Member Contract for ${projectName}`,
    contractValue: userBudgetItem?.estimatedAmount || 0,
    currency: "KES",
    startDate: budgetStartDate,
    endDate: budgetEndDate,
    status: "draft",
    templateId: templates?.[0]?._id || undefined,
  };

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Update form values when team member or budget changes
  useEffect(() => {
    const newValues = {
      description: `Team Member Contract for ${projectName}`,
      contractValue: userBudgetItem?.estimatedAmount || 0,
      currency: "KES",
      startDate: formatDateForInput(budgetStartDate),
      endDate: formatDateForInput(budgetEndDate),
      status: form.getValues("status"), // Preserve current status
      templateId: form.getValues("templateId") || templates?.[0]?._id
    };
    
    form.reset(newValues);
  }, [teamMemberEmail, projectName, userBudgetItem, budgetStartDate, budgetEndDate, templates]);

  const handleSubmit = async (values: ContractFormValues) => {
    await onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{userBudgetItem ? 'Create New Contract' : 'Cannot Create Contract'}</DialogTitle>
          <DialogDescription>
            {userBudgetItem ? 
              `Create a contract for team member ${teamMemberName} on project ${projectName}.`
             : 
              <span className="text-destructive">
                Cannot create contract - {teamMemberName} is not allocated in the internal budget (code 2237).
                Please add them to the budget first.
              </span>
            }
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
                      <Input type="number" placeholder="0" {...field} disabled/>
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
                    <FormControl>
                      <Input type="text" value="KES" disabled />
                    </FormControl>
                    <FormDescription>
                      Fixed as per budget allocation
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
              
            </div>
            {templates && templates.length > 0 && (
              <FormField
                control={form.control}
                name="templateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Template</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {templates.map((t) => (
                          <SelectItem key={t._id} value={t._id}>
                            {t.name}{t.version ? ` (v${t.version})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The selected template will be embedded in the contract.
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
            <DialogFooter>
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
                disabled={isSubmitting || !userBudgetItem}
                className={!userBudgetItem ? 'cursor-not-allowed opacity-50' : ''}>

                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <Spinner />
                    <span>Creating...</span>
                  </div>
                ) : (
                  "Create Contract"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
