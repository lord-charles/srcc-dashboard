"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Loader2, AlertCircle } from "lucide-react";
import { getProjectConfig } from "@/services/system-config.service";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { updateProjectDetails } from "@/services/projects-service";

interface ProjectUpdateDrawerProps {
  projectData: any;
  trigger?: React.ReactNode;
}

export function ProjectUpdateDrawer({
  projectData,
  trigger,
}: ProjectUpdateDrawerProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const config = await getProjectConfig();
        if (config && config.data.data.departments) {
          setDepartments(config.data.data.departments);
        }
      } catch (error) {
        console.error("Failed to fetch departments", error);
      } finally {
        setLoadingDepartments(false);
      }
    };

    if (open) {
      fetchDepartments();
    }
  }, [open]);

  const { toast } = useToast();
  const router = useRouter();

  const formatDateForInput = (date: string | Date | undefined) => {
    if (!date) return "";
    try {
      const d = new Date(date);
      return format(d, "yyyy-MM-dd");
    } catch {
      return "";
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      department: projectData.department || "",
      description: projectData.description || "",
      currency: projectData.currency || "KES",
      contractStartDate: formatDateForInput(projectData.contractStartDate),
      contractEndDate: formatDateForInput(projectData.contractEndDate),
      totalProjectValue: projectData.totalProjectValue || 0,
      client: projectData.client || "",
      status: projectData.status || "draft",
      procurementMethod: projectData.procurementMethod || "",
      reportingFrequency: projectData.reportingFrequency || "Monthly",
      actualCompletionDate: formatDateForInput(
        projectData.actualCompletionDate,
      ),
      amountSpent: projectData.amountSpent || 0,
      reason: "",
      riskFactors: projectData.riskAssessment?.factors?.join(", ") || "",
      riskMitigationStrategies:
        projectData.riskAssessment?.mitigationStrategies?.join(", ") || "",
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const updatePayload: any = {
        department: data.department,
        description: data.description,
        currency: data.currency,
        totalProjectValue: Number(data.totalProjectValue),
        client: data.client,
        status: data.status,
        procurementMethod: data.procurementMethod,
        reportingFrequency: data.reportingFrequency,
        amountSpent: Number(data.amountSpent),
        reason: data.reason,
      };

      if (data.contractStartDate) {
        updatePayload.contractStartDate = new Date(
          data.contractStartDate,
        ).toISOString();
      }
      if (data.contractEndDate) {
        updatePayload.contractEndDate = new Date(
          data.contractEndDate,
        ).toISOString();
      }
      if (data.actualCompletionDate) {
        updatePayload.actualCompletionDate = new Date(
          data.actualCompletionDate,
        ).toISOString();
      }

      // Handle risk assessment
      if (data.riskFactors || data.riskMitigationStrategies) {
        updatePayload.riskAssessment = {
          factors: data.riskFactors
            ? data.riskFactors.split(",").map((f: string) => f.trim())
            : [],
          mitigationStrategies: data.riskMitigationStrategies
            ? data.riskMitigationStrategies
                .split(",")
                .map((s: string) => s.trim())
            : [],
        };
      }

      await updateProjectDetails(projectData._id, updatePayload);

      toast({
        title: "Success",
        description: "Project details updated successfully",
      });

      setOpen(false);
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update project details",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || <Button variant="outline">Update Project Details</Button>}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Update Project Details</SheetTitle>
          <SheetDescription>
            Update non-critical project information. All changes will be tracked
            in the audit trail.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-6">
          {/* Audit Trail Alert */}
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Update History Tracking</AlertTitle>
            <AlertDescription>
              All changes you make will be saved in the project&apos;s update
              history, including what was changed, when, and by whom.
            </AlertDescription>
          </Alert>

          {/* Department */}
          <div className="space-y-2">
            <Label htmlFor="department">Department/School</Label>
            <Select
              value={watch("department")}
              onValueChange={(value) => setValue("department", value)}
              disabled={loadingDepartments}
            >
              <SelectTrigger>
                {loadingDepartments ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading departments...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Select Department" />
                )}
              </SelectTrigger>
              <SelectContent>
                {departments.length === 0 && !loadingDepartments ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    No departments configured
                  </div>
                ) : (
                  departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              rows={4}
              placeholder="Project description"
            />
          </div>

          {/* Client */}
          <div className="space-y-2">
            <Label htmlFor="client">Client</Label>
            <Input
              id="client"
              {...register("client")}
              placeholder="Client name"
            />
          </div>

          {/* Currency and Total Project Value */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={watch("currency")}
                onValueChange={(value) => setValue("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KES">KES</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalProjectValue">Total Project Value</Label>
              <Input
                id="totalProjectValue"
                type="number"
                step="0.01"
                {...register("totalProjectValue")}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Contract Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contractStartDate">Contract Start Date</Label>
              <Input
                id="contractStartDate"
                type="date"
                {...register("contractStartDate")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractEndDate">Contract End Date</Label>
              <Input
                id="contractEndDate"
                type="date"
                {...register("contractEndDate")}
              />
            </div>
          </div>

          {/* Status and Procurement Method */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(value) => setValue("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending_approval">
                    Pending Approval
                  </SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="procurementMethod">Procurement Method</Label>
              <Input
                id="procurementMethod"
                {...register("procurementMethod")}
                placeholder="e.g., Public Procurement"
              />
            </div>
          </div>

          {/* Reporting Frequency and Amount Spent */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportingFrequency">Reporting Frequency</Label>
              <Select
                value={watch("reportingFrequency")}
                onValueChange={(value) => setValue("reportingFrequency", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Biweekly">Biweekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amountSpent">Amount Spent</Label>
              <Input
                id="amountSpent"
                type="number"
                step="0.01"
                {...register("amountSpent")}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Actual Completion Date */}
          <div className="space-y-2">
            <Label htmlFor="actualCompletionDate">
              Actual Completion Date (Optional)
            </Label>
            <Input
              id="actualCompletionDate"
              type="date"
              {...register("actualCompletionDate")}
            />
          </div>

          {/* Risk Assessment */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Risk Assessment</h3>
            <div className="space-y-2">
              <Label htmlFor="riskFactors">
                Risk Factors (comma-separated)
              </Label>
              <Textarea
                id="riskFactors"
                {...register("riskFactors")}
                rows={3}
                placeholder="e.g., Budget constraints, Timeline delays"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="riskMitigationStrategies">
                Mitigation Strategies (comma-separated)
              </Label>
              <Textarea
                id="riskMitigationStrategies"
                {...register("riskMitigationStrategies")}
                rows={3}
                placeholder="e.g., Regular monitoring, Contingency planning"
              />
            </div>
          </div>

          {/* Reason for Update */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Update (Optional)</Label>
            <Textarea
              id="reason"
              {...register("reason")}
              rows={2}
              placeholder="Explain why these changes are being made..."
            />
          </div>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Project
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
