"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { addMilestone, updateMilestone } from "@/services/projects-service";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { ProjectMilestone } from "@/types/project";
import { ScrollArea } from "@/components/ui/scroll-area";

const milestoneSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  startDate: z.string().optional().nullable(),
  dueDate: z.string().min(1, "Due date is required"),
  completed: z.boolean(),
  completionDate: z.string().optional().nullable(),
  budget: z.coerce.number(),
  actualCost: z.coerce
    .number()
    .min(0, "Actual cost must be a positive number")
    .optional()
    .nullable(),
  percentage: z.coerce
    .number()
    .min(0, "Percentage must be at least 0")
    .max(100, "Percentage cannot exceed 100")
    .optional()
    .nullable(),
});

type MilestoneFormData = z.infer<typeof milestoneSchema>;

interface MilestoneDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  milestone: ProjectMilestone | undefined;
}

export function MilestoneDrawer({
  isOpen,
  onClose,
  projectId,
  milestone,
}: MilestoneDrawerProps) {
  const { toast } = useToast();

  const form = useForm<MilestoneFormData>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: "",
      dueDate: "",
      completed: false,
      completionDate: null,
      budget: 0,
      actualCost: null,
      percentage: null,
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
        startDate: milestone.startDate
          ? format(new Date(milestone.startDate), "yyyy-MM-dd")
          : "",
        dueDate: format(new Date(milestone.dueDate), "yyyy-MM-dd"),
        completed: milestone.completed,
        completionDate: milestone.completionDate
          ? format(new Date(milestone.completionDate), "yyyy-MM-dd")
          : null,
        budget: milestone.budget,
        actualCost: milestone.actualCost || null,
        percentage: milestone.percentage || null,
      });
    } else {
      reset({
        title: "",
        description: "",
        startDate: "",
        dueDate: "",
        completed: false,
        completionDate: null,
        budget: 0,
        actualCost: null,
        percentage: null,
      });
    }
  }, [milestone, reset]);

  const onSubmit = async (data: MilestoneFormData) => {
    try {
      // Convert null values to undefined for API compatibility
      const submitData = {
        ...data,
        startDate: data.startDate || undefined,
        completionDate: data.completionDate || undefined,
        actualCost: data.actualCost || undefined,
        percentage: data.percentage || undefined,
      };

      if (milestone?._id) {
        await updateMilestone(projectId, milestone._id, submitData);
        toast({
          title: "Success",
          description: "Milestone updated successfully",
        });
      } else {
        await addMilestone(projectId, submitData as any);
        toast({
          title: "Success",
          description: "Milestone added successfully",
        });
      }
      onClose();
      // Delay refresh to ensure side sheet closes first
      setTimeout(() => location.reload(), 100);
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
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-[480px] flex flex-col h-full">
        {/* Header */}
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="text-lg font-semibold">
            {milestone ? "Edit Milestone" : "New Milestone"}
          </SheetTitle>
          <SheetDescription className="text-xs">
            {milestone
              ? "Update milestone details"
              : "Create a new project milestone"}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-4 px-4 py-4">
          <Form {...form}>
            <form
              id="milestone-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Milestone title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="h-24 resize-none"
                        placeholder="Short description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Start</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Due</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Budget + Weight */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Budget</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} placeholder="KES" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Weight %</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} placeholder="0–100" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Completed */}
              <FormField
                control={form.control}
                name="completed"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between border rounded-md px-3 py-2">
                    <FormLabel className="text-sm">Completed</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Conditional Fields */}
              {isCompleted && (
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="completionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Completion</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="actualCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Actual Cost</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} placeholder="KES" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </form>
          </Form>
        </ScrollArea>

        {/* Footer */}
        <SheetFooter className="pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="milestone-form"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <Spinner className="h-4 w-4" />
            ) : milestone ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
