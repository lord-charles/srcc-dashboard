"use client";

import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DatePicker } from "@/components/ui/date-picker";
import { Header } from "../header";
import * as z from "zod";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { Textarea } from "@/components/ui/textarea";
import { createProject } from "@/services/projects-service";

// Define the validation schema
const projectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  // totalBudget: z.coerce.number().min(0, "Budget must be a positive number"),
  totalProjectValue: z.coerce.number().min(0, "Project value must be a positive number"),
  currency: z.enum(["KES", "USD", "EUR", "GBP"]).default("KES"),
  contractStartDate: z.date(),
  contractEndDate: z.date(),
  client: z.string().min(2, "Client name must be at least 2 characters"),
  department: z.enum(["SBS", "SRCC", "SHSS", "SERC", "SIMS", "ILAB"]).default("ILAB"),
  status: z.enum(["draft", "pending_approval", "active", "on_hold", "completed", "cancelled"]).default("draft"),
  reportingFrequency: z.enum(["Weekly", "Biweekly", "Monthly", "Quarterly"]),
  riskLevel: z.enum(["Low", "Medium", "High"]),
  procurementMethod: z.enum(["Open Tender", "Restricted Tender", "Direct Procurement", "Request for Quotation"]),
  riskAssessment: z.object({
    factors: z.array(z.string()),
    mitigationStrategies: z.array(z.string()),
    // lastAssessmentDate: z.date(),
    // nextAssessmentDate: z.date()
  }),
  actualCompletionDate: z.date().optional(),
  milestones: z.array(z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    dueDate: z.date(),
    completed: z.boolean().default(false),
    completionDate: z.date().optional(),
    budget: z.number().min(0),
    actualCost: z.number().optional(),
  })).default([]),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export function NewProjectComponent() {
  const { toast } = useToast();
  const router = useRouter();

  // State for file uploads
  const [projectProposal, setProjectProposal] = useState<File[]>([]);
  const [signedContract, setSignedContract] = useState<File[]>([]);
  const [executionMemo, setExecutionMemo] = useState<File[]>([]);
  const [signedBudget, setSignedBudget] = useState<File[]>([]);


  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      status: "active",
      currency: "KES",
      department: "SRCC",
      reportingFrequency: "Monthly",
      riskLevel: "Medium",
      procurementMethod: "Open Tender",
      milestones: [],
      riskAssessment: {
        factors: [],
        mitigationStrategies: [],
        // lastAssessmentDate: new Date(),
        // nextAssessmentDate: new Date(),
      }
    },
    mode: "onChange",
  });

  console.log('Form Errors:', errors);

  // Debug form values
  const formValues = watch();
  console.log('Current form values:', formValues);

  // Initialize field arrays for milestones and team members
  const { fields: milestoneFields, append: appendMilestone, remove: removeMilestone } = useFieldArray({
    control,
    name: "milestones"
  });


  const onSubmit = async (data: ProjectFormData) => {
    try {
      console.log('onSubmit function called with data:', data);

      // Check if all required fields are present
      const requiredFields = [
        'name',
        'description',
        // 'totalBudget',
        'totalProjectValue',
        'currency',
        'contractStartDate',
        'contractEndDate',
        'client',
        'department',
        'status',
        'reportingFrequency',
        // 'riskLevel',
        'procurementMethod',
        // 'riskAssessment'
      ] as const

      const missingFields = requiredFields.filter(field => !data[field]);
      if (missingFields.length > 0) {
        console.log('Missing required fields:', missingFields);
        toast({
          title: "Missing Fields",
          description: `Please fill in all required fields: ${missingFields.join(', ')}`,
          variant: "destructive",
        });
        return;
      }

      // Validate files
      if (!projectProposal[0]) {
        console.log('Missing project proposal file');
        toast({
          title: "Missing File",
          description: "Project proposal is required",
          variant: "destructive",
        });
        return;
      }
      if (!signedContract[0]) {
        console.log('Missing signed contract file');
        toast({
          title: "Missing File",
          description: "Signed contract is required",
          variant: "destructive",
        });
        return;
      }
      if (!executionMemo[0]) {
        console.log('Missing execution memo file');
        toast({
          title: "Missing File",
          description: "Execution memo is required",
          variant: "destructive",
        });
        return;
      }
      if (!signedBudget[0]) {
        console.log('Missing signed budget file');
        toast({
          title: "Missing File",
          description: "Signed budget is required",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Creating Project",
        description: "Please wait while we process your request...",
      });

      // Prepare files object
      const files = {
        projectProposal,
        signedContract,
        executionMemo,
        signedBudget
      };

      console.log('Files prepared:', files);

      // Submit the data
      console.log('Calling createProject with data:', data);
      const result = await createProject(data, files);
      console.log('API Response:', result);

      toast({
        title: "Project Created",
        description: "Project has been created successfully.",
      });

      setTimeout(() => {
        router.push("/projects");
      }, 2000);
    } catch (error) {
      console.error('Error in onSubmit:', error);
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Header />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          console.log('Form submit event triggered');
          handleSubmit((data) => {
            console.log('Form is valid, data:', data);
            onSubmit(data);
          }, (errors) => {
            console.log('Form validation failed:', errors);
          })();
        }}
        className="px-4 flex min-h-screen w-full bg-card flex-col md:w-[87%] lg:w-full md:ml-[80px] lg:ml-0 sm:ml-0 overflow-x-hidden rounded-md"
      >
        {/* Header section */}
        <div className="flex items-center gap-4 py-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Badge variant="outline" className="rounded-sm px-1 font-normal">
            New Project Registration
          </Badge>
          <div className="items-center gap-2 md:ml-auto flex">
            <Button
              type="submit"
              size="sm"
              className="font-bold bg-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 lg:gap-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
              <CardDescription>Basic project details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    className={errors.description ? "border-red-500" : ""}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client">Client *</Label>
                  <Input
                    id="client"
                    {...register("client")}
                    className={errors.client ? "border-red-500" : ""}
                  />
                  {errors.client && (
                    <p className="text-sm text-red-500">{errors.client.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>School/Department *</Label>
                  <Controller
                    name="department"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select School/Department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ILAB">ILAB</SelectItem>
                          <SelectItem value="SBS">SBS</SelectItem>
                          <SelectItem value="SRCC">SRCC</SelectItem>
                          <SelectItem value="SHSS">SHSS</SelectItem>
                          <SelectItem value="SERC">SERC</SelectItem>
                          <SelectItem value="SIMS">SIMS</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.department && (
                    <p className="text-sm text-red-500">{errors.department.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalProjectValue">Total Project Value *</Label>
                  <Input
                    id="totalProjectValue"
                    type="number"
                    {...register("totalProjectValue", { valueAsNumber: true })}
                    className={errors.totalProjectValue ? "border-red-500" : ""}
                  />
                  {errors.totalProjectValue && (
                    <p className="text-sm text-red-500">{errors.totalProjectValue.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency *</Label>
                  <Controller
                    name="currency"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="KES">KES</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contractStartDate">Start Date *</Label>
                    <Controller
                      name="contractStartDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker date={field.value} setDate={field.onChange} />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contractEndDate">End Date *</Label>
                    <Controller
                      name="contractEndDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker date={field.value} setDate={field.onChange} />
                      )}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Additional project information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">


                <div className="space-y-2">
                  <Label>Project Status *</Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent defaultValue={'active'}>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="pending_approval">Pending Approval</SelectItem>
                          <SelectItem value="on_hold">On Hold</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Reporting Frequency *</Label>
                  <Controller
                    name="reportingFrequency"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Weekly">Weekly</SelectItem>
                          <SelectItem value="Biweekly">Biweekly</SelectItem>
                          <SelectItem value="Monthly">Monthly</SelectItem>
                          <SelectItem value="Quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Procurement Method *</Label>
                  <Controller
                    name="procurementMethod"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select procurement method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Open Tender">Open Tender</SelectItem>
                          <SelectItem value="Restricted Tender">Restricted Tender</SelectItem>
                          <SelectItem value="Direct Procurement">Direct Procurement</SelectItem>
                          <SelectItem value="Request for Quotation">Request for Quotation</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.procurementMethod && (
                    <p className="text-sm text-red-500">{errors.procurementMethod.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Risk Assessment</Label>
                  <div className="grid gap-4">
                    <div>
                      <Label>Risk Factors</Label>
                      <Controller
                        name="riskAssessment.factors"
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            placeholder="Enter risk factors (one per line)"
                            value={field.value?.join('\n')}
                            onChange={(e) => field.onChange(e.target.value.split('\n'))}
                          />
                        )}
                      />
                    </div>
                    <div>
                      <Label>Mitigation Strategies</Label>
                      <Controller
                        name="riskAssessment.mitigationStrategies"
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            placeholder="Enter mitigation strategies (one per line)"
                            value={field.value?.join('\n')}
                            onChange={(e) => field.onChange(e.target.value.split('\n'))}
                          />
                        )}
                      />
                    </div>

                  </div>
                </div>
              </div>
            </CardContent>
          </Card>


        </div>



        {/* upload documents */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Project Documents</CardTitle>
            <CardDescription>Upload required project documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label>Project Proposal *</Label>
                <FileUpload
                  onChange={(files) => {
                    console.log('Project proposal updated:', files);
                    setProjectProposal(files);
                  }}
                />
                {projectProposal[0] && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {projectProposal[0].name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Signed Contract *</Label>
                <FileUpload
                  onChange={(files) => {
                    console.log('Signed contract updated:', files);
                    setSignedContract(files);
                  }}
                />
                {signedContract[0] && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {signedContract[0].name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Execution Memo *</Label>
                <FileUpload
                  onChange={(files) => {
                    console.log('Execution memo updated:', files);
                    setExecutionMemo(files);
                  }}
                />
                {executionMemo[0] && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {executionMemo[0].name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Signed Budget *</Label>
                <FileUpload
                  onChange={(files) => {
                    console.log('Signed budget updated:', files);
                    setSignedBudget(files);
                  }}
                />
                {signedBudget[0] && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {signedBudget[0].name}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="p-2 mt-3">
          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle>Project Milestones</CardTitle>
              <CardDescription>Define project milestones and their details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {milestoneFields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-md relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={() => removeMilestone(index)}
                    >
                      ×
                    </Button>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Milestone Title *</Label>
                        <Input
                          {...register(`milestones.${index}.title`)}
                          placeholder="Enter milestone title"
                        />
                        {errors.milestones?.[index]?.title && (
                          <p className="text-sm text-red-500">{errors.milestones[index]?.title?.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Description *</Label>
                        <Textarea
                          {...register(`milestones.${index}.description`)}
                          placeholder="Enter milestone description"
                        />
                        {errors.milestones?.[index]?.description && (
                          <p className="text-sm text-red-500">{errors.milestones[index]?.description?.message}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label>Due Date *</Label>
                          <Controller
                            name={`milestones.${index}.dueDate`}
                            control={control}
                            render={({ field }) => (
                              <DatePicker date={field.value} setDate={field.onChange} />
                            )}
                          />
                          {errors.milestones?.[index]?.dueDate && (
                            <p className="text-sm text-red-500">{errors.milestones[index]?.dueDate?.message}</p>
                          )}
                        </div>
                        <div>
                          <Label>Budget *</Label>
                          <Input
                            type="number"
                            {...register(`milestones.${index}.budget`, { valueAsNumber: true })}
                            placeholder="Enter budget"
                          />
                          {errors.milestones?.[index]?.budget && (
                            <p className="text-sm text-red-500">{errors.milestones[index]?.budget?.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendMilestone({
                    title: '',
                    description: '',
                    dueDate: new Date(),
                    completed: false,
                    budget: 0
                  })}
                >
                  Add Milestone
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Assign team members to the project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMemberFields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-md relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={() => removeTeamMember(index)}
                    >
                      ×
                    </Button>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Name *</Label>
                        <Input
                          {...register(`teamMembers.${index}.name`)}
                          placeholder="Enter team member name"
                        />
                        {errors.teamMembers?.[index]?.name && (
                          <p className="text-sm text-red-500">{errors.teamMembers[index]?.name?.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Email *</Label>
                        <Input
                          type="email"
                          {...register(`teamMembers.${index}.email`)}
                          placeholder="Enter team member email"
                        />
                        {errors.teamMembers?.[index]?.email && (
                          <p className="text-sm text-red-500">{errors.teamMembers[index]?.email?.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Phone *</Label>
                        <Input
                          {...register(`teamMembers.${index}.phone`)}
                          placeholder="Enter team member phone"
                        />
                        {errors.teamMembers?.[index]?.phone && (
                          <p className="text-sm text-red-500">{errors.teamMembers[index]?.phone?.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Role *</Label>
                        <Input
                          {...register(`teamMembers.${index}.role`)}
                          placeholder="Enter team member role"
                        />
                        {errors.teamMembers?.[index]?.role && (
                          <p className="text-sm text-red-500">{errors.teamMembers[index]?.role?.message}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label>Start Date *</Label>
                          <Controller
                            name={`teamMembers.${index}.startDate`}
                            control={control}
                            render={({ field }) => (
                              <DatePicker date={field.value} setDate={field.onChange} />
                            )}
                          />
                          {errors.teamMembers?.[index]?.startDate && (
                            <p className="text-sm text-red-500">{errors.teamMembers[index]?.startDate?.message}</p>
                          )}
                        </div>
                        <div>
                          <Label>End Date (Optional)</Label>
                          <Controller
                            name={`teamMembers.${index}.endDate`}
                            control={control}
                            render={({ field }) => (
                              <DatePicker date={field.value} setDate={field.onChange} />
                            )}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Responsibilities</Label>
                        <Controller
                          name={`teamMembers.${index}.responsibilities`}
                          control={control}
                          render={({ field }) => (
                            <Textarea
                              placeholder="Enter responsibilities (one per line)"
                              value={field.value?.join('\n')}
                              onChange={(e) => field.onChange(e.target.value.split('\n'))}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendTeamMember({
                    name: '',
                    email: '',
                    phone: '',
                    role: '',
                    startDate: new Date(),
                    responsibilities: []
                  })}
                >
                  Add Team Member
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="space-y-2 p-2">
            <Label>Project Manager Details</Label>
            <div className="grid gap-2">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  {...register("projectManager.name")}
                  placeholder="Enter project manager name"
                  className={errors.projectManager?.name ? "border-red-500" : ""}
                />
                {errors.projectManager?.name && (
                  <p className="text-sm text-red-500">{errors.projectManager.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  {...register("projectManager.email")}
                  placeholder="Enter project manager email"
                  className={errors.projectManager?.email ? "border-red-500" : ""}
                />
                {errors.projectManager?.email && (
                  <p className="text-sm text-red-500">{errors.projectManager.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input
                  {...register("projectManager.phone")}
                  placeholder="Enter project manager phone"
                  className={errors.projectManager?.phone ? "border-red-500" : ""}
                />
                {errors.projectManager?.phone && (
                  <p className="text-sm text-red-500">{errors.projectManager.phone.message}</p>
                )}
              </div>

            </div>
          </Card> */}
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center justify-center gap-2 md:hidden mt-4 w-full">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full font-bold text-lg"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="lg"
            className="w-full font-bold text-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </form>
    </>
  );
}
