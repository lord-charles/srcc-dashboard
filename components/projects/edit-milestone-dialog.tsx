"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  addMilestone,
  Milestone,
  updateMilestone,
} from "@/services/projects-service";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ProjectMilestone } from "@/types/project";

const milestoneSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  dueDate: z.string().min(1, "Due date is required"),
  completed: z.boolean(),
  completionDate: z.string().optional().nullable(),
  budget: z.coerce.number().min(0, "Budget must be a positive number"),
  actualCost: z.coerce
    .number()
    .min(0, "Actual cost must be a positive number")
    .optional()
    .nullable(),
});

type MilestoneFormData = z.infer<typeof milestoneSchema>;

interface EditMilestoneDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  milestone: ProjectMilestone | undefined;
}

export function EditMilestoneDialog({
  isOpen,
  onClose,
  projectId,
  milestone,
}: EditMilestoneDialogProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<MilestoneFormData>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      completed: false,
      completionDate: null,
      budget: 0,
      actualCost: null,
    },
  });

  const {
    formState: { isSubmitting },
    reset,
    watch,
  } = form;
  const isCompleted = watch("completed");

  useEffect(() => {
    if (milestone) {
      reset({
        title: milestone.title,
        description: milestone.description,
        dueDate: format(new Date(milestone.dueDate), "yyyy-MM-dd"),
        completed: milestone.completed,
        completionDate: milestone.completionDate
          ? format(new Date(milestone.completionDate), "yyyy-MM-dd")
          : null,
        budget: milestone.budget,
        actualCost: milestone.actualCost || null,
      });
    } else {
      reset({
        title: "",
        description: "",
        dueDate: "",
        completed: false,
        completionDate: null,
        budget: 0,
        actualCost: null,
      });
    }
  }, [milestone, reset]);

  const onSubmit = async (data: MilestoneFormData) => {
    try {
      // Convert null values to undefined for API compatibility
      const submitData = {
        ...data,
        completionDate: data.completionDate || undefined,
        actualCost: data.actualCost || undefined,
      };

      if (milestone?._id) {
        await updateMilestone(projectId, milestone._id, submitData);
        toast({
          title: "Success",
          description: "Milestone updated successfully",
        });
      } else {
        await addMilestone(projectId, submitData);
        toast({
          title: "Success",
          description: "Milestone added successfully",
        });
      }
      router.refresh();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {milestone ? "Edit Milestone" : "Add New Milestone"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter milestone title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter milestone description"
                      className="h-20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        min={0}
                        step="10"
                        placeholder="Enter budget amount"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="completed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Completed</FormLabel>
                    <FormDescription>
                      Mark if this milestone has been completed
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div
              className={cn(
                "grid grid-cols-2 gap-4",
                !isCompleted && "opacity-50"
              )}
            >
              <FormField
                control={form.control}
                name="completionDate"
                render={({ field: { value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Completion Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={value || ""}
                        disabled={!isCompleted}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="actualCost"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Actual Cost</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={value || ""}
                        onChange={(e) =>
                          onChange(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        min={0}
                        step="10"
                        placeholder="Enter actual cost"
                        disabled={!isCompleted}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    Saving... <Spinner className="ml-2" />
                  </>
                ) : milestone ? (
                  "Update Milestone"
                ) : (
                  "Add Milestone"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
