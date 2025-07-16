import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

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
});

export type ContractFormValues = z.infer<typeof formSchema>;

interface EditContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ContractFormValues) => Promise<void>;
  contract: Contract;
  isSubmitting: boolean;
}

export function EditContractDialog({
  open,
  onOpenChange,
  onSubmit,
  contract,
  isSubmitting,
}: EditContractDialogProps) {
  // Format ISO date string to YYYY-MM-DD for HTML date input
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return new Date().toISOString().split("T")[0];
    // Handle both ISO string and date objects
    const date = typeof dateString === 'object' ? dateString : new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: contract?.description || "",
      contractValue: contract?.contractValue || 0,
      currency: contract?.currency || "USD",
      startDate: formatDateForInput(contract?.startDate),
      endDate: formatDateForInput(contract?.endDate),
      status: contract?.status || "draft",
    },
  });

  // Update form values when contract changes
  useEffect(() => {
    if (contract) {
      form.reset({
        description: contract.description || "",
        contractValue: contract.contractValue || 0,
        currency: contract.currency || "USD",
        startDate: formatDateForInput(contract.startDate),
        endDate: formatDateForInput(contract.endDate),
        status: contract.status || "draft",
      });
    }
  }, [contract, form]);

  const handleSubmit = async (values: ContractFormValues) => {
    await onSubmit(values);
  };

  const isDraft = contract?.status === "draft";

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
    </Dialog>
  );
}
