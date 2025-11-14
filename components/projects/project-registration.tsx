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
import { Textarea } from "@/components/ui/textarea";
import { createProject } from "@/services/projects-service";
import { cloudinaryService } from "@/lib/cloudinary-service";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "../ui/file-upload";

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
  const [projectProposalUrl, setProjectProposalUrl] = useState<string>("");
  const [signedContractUrl, setSignedContractUrl] = useState<string>("");
  const [executionMemoUrl, setExecutionMemoUrl] = useState<string>("");
  const [signedBudgetUrl, setSignedBudgetUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);


  // Replace react-hook-form with pure React state
  const [formData, setFormData] = useState<Partial<ProjectFormData>>({
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
    }
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log('Form Errors:', errors);
  console.log('Current form values:', formData);

  // Handle milestone management
  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [...(prev.milestones || []), {
        title: '',
        description: '',
        dueDate: new Date(),
        completed: false,
        budget: 0
      }]
    }));
  };

  const removeMilestone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones?.filter((_, i) => i !== index) || []
    }));
  };

  const updateMilestone = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones?.map((milestone, i) => 
        i === index ? { ...milestone, [field]: value } : milestone
      ) || []
    }));
  };


  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = "Project name must be at least 2 characters";
    }
    if (!formData.description || formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }
    if (!formData.totalProjectValue || formData.totalProjectValue <= 0) {
      newErrors.totalProjectValue = "Project value must be a positive number";
    }
    if (!formData.client || formData.client.length < 2) {
      newErrors.client = "Client name must be at least 2 characters";
    }
    if (!formData.contractStartDate) {
      newErrors.contractStartDate = "Start date is required";
    }
    if (!formData.contractEndDate) {
      newErrors.contractEndDate = "End date is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the form errors before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('handleSubmit function called with data:', formData);



      if (!projectProposalUrl || !signedContractUrl || !executionMemoUrl || !signedBudgetUrl) {
        toast({
          title: "Missing Files",
          description: "Please upload all required project documents.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Creating Project",
        description: "Please wait while we process your request...",
      });

      const projectData = {
        ...formData,
        projectProposalUrl,
        signedContractUrl,
        executionMemoUrl,
        signedBudgetUrl,
      };

      const result = await createProject(projectData);
      console.log('API Response:', result);

      toast({
        title: "Project Created",
        description: "Project has been created successfully.",
      });

      // setTimeout(() => {
      //   router.push("/projects");
      // }, 2000);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <>
      <Header />
      <div className="px-4 flex min-h-screen w-full bg-card flex-col md:w-[87%] lg:w-full md:ml-[80px] lg:ml-0 sm:ml-0 overflow-x-hidden rounded-md">
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
              type="button"
              size="sm"
              className="font-bold bg-primary"
              disabled={isSubmitting || isUploading}
              onClick={handleSubmit}
            >
              {isSubmitting ? "Creating..." : isUploading ? "Uploading..." : "Create Project"}
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
                    value={formData.name || ''}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    className={errors.description ? "border-red-500" : ""}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client">Client *</Label>
                  <Input
                    id="client"
                    value={formData.client || ''}
                    onChange={(e) => updateFormData('client', e.target.value)}
                    className={errors.client ? "border-red-500" : ""}
                  />
                  {errors.client && (
                    <p className="text-sm text-red-500">{errors.client}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>School/Department *</Label>
                  <Select value={formData.department || 'SRCC'} onValueChange={(value) => updateFormData('department', value)}>
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
                  {errors.department && (
                    <p className="text-sm text-red-500">{errors.department}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalProjectValue">Total Project Value *</Label>
                  <Input
                    id="totalProjectValue"
                    type="number"
                    value={formData.totalProjectValue || ''}
                    onChange={(e) => updateFormData('totalProjectValue', parseFloat(e.target.value) || 0)}
                    className={errors.totalProjectValue ? "border-red-500" : ""}
                  />
                  {errors.totalProjectValue && (
                    <p className="text-sm text-red-500">{errors.totalProjectValue}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency *</Label>
                  <Select value={formData.currency || 'KES'} onValueChange={(value) => updateFormData('currency', value)}>
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contractStartDate">Start Date *</Label>
                    <DatePicker 
                      date={formData.contractStartDate} 
                      setDate={(date) => updateFormData('contractStartDate', date)} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contractEndDate">End Date *</Label>
                    <DatePicker 
                      date={formData.contractEndDate} 
                      setDate={(date) => updateFormData('contractEndDate', date)} 
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
                  <Select value={formData.status || 'active'} onValueChange={(value) => updateFormData('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending_approval">Pending Approval</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Reporting Frequency *</Label>
                  <Select value={formData.reportingFrequency || 'Monthly'} onValueChange={(value) => updateFormData('reportingFrequency', value)}>
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
                </div>

                <div className="space-y-2">
                  <Label>Procurement Method *</Label>
                  <Select value={formData.procurementMethod || 'Open Tender'} onValueChange={(value) => updateFormData('procurementMethod', value)}>
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
                  {errors.procurementMethod && (
                    <p className="text-sm text-red-500">{errors.procurementMethod}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Risk Assessment</Label>
                  <div className="grid gap-4">
                    <div>
                      <Label>Risk Factors</Label>
                      <Textarea
                        placeholder="Enter risk factors (one per line)"
                        value={formData.riskAssessment?.factors?.join('\n') || ''}
                        onChange={(e) => updateFormData('riskAssessment', {
                          ...formData.riskAssessment,
                          factors: e.target.value.split('\n')
                        })}
                      />
                    </div>
                    <div>
                      <Label>Mitigation Strategies</Label>
                      <Textarea
                        placeholder="Enter mitigation strategies (one per line)"
                        value={formData.riskAssessment?.mitigationStrategies?.join('\n') || ''}
                        onChange={(e) => updateFormData('riskAssessment', {
                          ...formData.riskAssessment,
                          mitigationStrategies: e.target.value.split('\n')
                        })}
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
                  onChange={async (files) => {
                    if (files.length > 0) {
                      setIsUploading(true);
                      try {
                        const url = await cloudinaryService.uploadFile(files[0]);
                        setProjectProposalUrl(url);
                        toast({ title: "Success", description: "Project proposal uploaded." });
                      } catch (error) {
                        toast({ title: "Upload Failed", description: "Could not upload file.", variant: "destructive" });
                      } finally {
                        setIsUploading(false);
                      }
                    }
                  }}
                />
                {projectProposalUrl && (
                  <a href={projectProposalUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                    View Uploaded Proposal
                  </a>
                )}
              </div>
              <div className="space-y-2">
                <Label>Signed Contract *</Label>
                <FileUpload
                  onChange={async (files) => {
                    if (files.length > 0) {
                      setIsUploading(true);
                      try {
                        const url = await cloudinaryService.uploadFile(files[0]);
                        setSignedContractUrl(url);
                        toast({ title: "Success", description: "Signed contract uploaded." });
                      } catch (error) {
                        toast({ title: "Upload Failed", description: "Could not upload file.", variant: "destructive" });
                      } finally {
                        setIsUploading(false);
                      }
                    }
                  }}
                />
                {signedContractUrl && (
                  <a href={signedContractUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                    View Uploaded Contract
                  </a>
                )}
              </div>
              <div className="space-y-2">
                <Label>Execution Memo *</Label>
                <FileUpload
                  onChange={async (files) => {
                    if (files.length > 0) {
                      setIsUploading(true);
                      try {
                        const url = await cloudinaryService.uploadFile(files[0]);
                        setExecutionMemoUrl(url);
                        toast({ title: "Success", description: "Execution memo uploaded." });
                      } catch (error) {
                        toast({ title: "Upload Failed", description: "Could not upload file.", variant: "destructive" });
                      } finally {
                        setIsUploading(false);
                      }
                    }
                  }}
                />
                {executionMemoUrl && (
                  <a href={executionMemoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                    View Uploaded Memo
                  </a>
                )}
              </div>
              <div className="space-y-2">
                <Label>Signed Budget *</Label>
                <FileUpload
                  onChange={async (files) => {
                    if (files.length > 0) {
                      setIsUploading(true);
                      try {
                        const url = await cloudinaryService.uploadFile(files[0]);
                        setSignedBudgetUrl(url);
                        toast({ title: "Success", description: "Signed budget uploaded." });
                      } catch (error) {
                        toast({ title: "Upload Failed", description: "Could not upload file.", variant: "destructive" });
                      } finally {
                        setIsUploading(false);
                      }
                    }
                  }}
                />
                {signedBudgetUrl && (
                  <a href={signedBudgetUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                    View Uploaded Budget
                  </a>
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
                {(formData.milestones || []).map((milestone, index) => (
                  <div key={index} className="p-4 border rounded-md relative">
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
                          value={milestone.title || ''}
                          onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                          placeholder="Enter milestone title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description *</Label>
                        <Textarea
                          value={milestone.description || ''}
                          onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                          placeholder="Enter milestone description"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label>Due Date *</Label>
                          <DatePicker 
                            date={milestone.dueDate} 
                            setDate={(date) => updateMilestone(index, 'dueDate', date)} 
                          />
                        </div>
                        <div>
                          <Label>Budget *</Label>
                          <Input
                            type="number"
                            value={milestone.budget || ''}
                            onChange={(e) => updateMilestone(index, 'budget', parseFloat(e.target.value) || 0)}
                            placeholder="Enter budget"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addMilestone}
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
            type="button"
            size="lg"
            className="w-full font-bold text-lg"
            disabled={isSubmitting || isUploading}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Creating..." : isUploading ? "Uploading..." : "Create Project"}
          </Button>
        </div>
      </div>
    </>
  );
}
