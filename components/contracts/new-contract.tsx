"use client"

import { ChevronLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { DatePicker } from "@/components/ui/date-picker"
import { Header } from "../header"
import * as z from "zod"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useToast } from "@/hooks/use-toast"
import { FileUpload } from "@/components/ui/file-upload"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { createContract } from "@/services/contracts.service"
import { Project } from "@/types/project"
import { useEffect } from "react"
import { getProjectById } from "@/services/projects-service"

// Define the validation schema
const contractSchema = z.object({
  contractNumber: z.string().min(1, "Contract number is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  contractingAuthorityId: z.string().min(1, "Contracting authority ID is required"),
  contractorId: z.string().min(1, "Contractor ID is required"),
  contractValue: z.number().positive("Contract value must be positive"),
  currency: z.enum(["KES", "USD", "EUR", "GBP"]).default("KES"),
  startDate: z.date(),
  endDate: z.date(),
  status: z.enum(["active", "inactive", "completed", "terminated"]),
  procurementMethod: z.enum(["Open Tender", "Restricted Tender", "Direct Procurement", "Request for Quotation"]),
  procurementReferenceNumber: z.string().min(1, "Procurement reference number is required"),
  terms: z.array(
    z.object({
      clause: z.string().min(1, "Clause is required"),
      description: z.string().min(1, "Description is required"),
    }),
  ),
  deliverables: z.array(
    z.object({
      title: z.string().min(1, "Title is required"),
      description: z.string().min(1, "Description is required"),
      dueDate: z.date(),
      completed: z.boolean(),
      acceptanceCriteria: z.array(z.string()).default([""]),
    }),
  ),
  paymentSchedule: z.array(
    z.object({
      milestone: z.string().min(1, "Milestone is required"),
      amount: z.number().positive("Amount must be positive"),
      dueDate: z.date(),
      paid: z.boolean(),
      paymentDate: z.date().optional(),
    }),
  ),
  requiresPerformanceSecurity: z.boolean().default(false),
  performanceSecurityAmount: z.union([
    z.number().positive("Performance security amount must be positive"),
    z.null()
  ]).optional().default(null),
  amendments: z.array(
    z.object({
      amendmentNumber: z.string().min(1, "Amendment number is required"),
      description: z.string().min(1, "Description is required"),
      date: z.date(),
      approvedBy: z.string().min(1, "Approved by is required"),
    }),
  ),
  createdBy: z.string().optional(),
  contractManagerId: z.string().optional(),
})

type ContractFormData = z.infer<typeof contractSchema>

export function ContractRegistrationForm() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // State for file uploads
  const [contractDocument, setContractDocument] = useState<File[]>([])
  const [termsAndConditions, setTermsAndConditions] = useState<File[]>([])

  const projectId = searchParams.get("projectId")

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      status: "active",
      currency: "KES",
      procurementMethod: "Open Tender",
      terms: [{ clause: "", description: "" }],
      deliverables: [{
        title: "",
        description: "",
        dueDate: new Date(),
        completed: false,
        acceptanceCriteria: [""]
      }],
      paymentSchedule: [{ milestone: "", amount: 0, dueDate: new Date(), paid: false }],
      amendments: [],
      contractorId: "507f1f77bcf86cd799439011",
      createdBy: "507f1f77bcf86cd799439011",
      contractManagerId: "507f1f77bcf86cd799439011",
      contractingAuthorityId: "507f1f77bcf86cd799439011",
      requiresPerformanceSecurity: false,
      performanceSecurityAmount: null,
    },
    mode: "onChange",
  })

  // Fetch project data
  useEffect(() => {
    async function fetchProjectData() {
      if (!projectId) {
        setIsLoading(false)
        return
      }

      try {
        const projectData = await getProjectById(projectId)
        setProject(projectData)

      } catch (error) {
        console.error("Error fetching project:", error)
        toast({
          title: "Error",
          description: "Failed to fetch project details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjectData()
  }, [projectId, toast])

  useEffect(() => {
    if (project) {
      // Pre-populate form with project data
      setValue("title", `Contract for ${project.name}`)
      setValue("description", project.description)
      setValue("contractValue", project.totalProjectValue)
      setValue("currency", project.currency)
      setValue("startDate", new Date(project.contractStartDate))
      setValue("endDate", new Date(project.contractEndDate))
      setValue("procurementMethod", project.procurementMethod)
      setValue("status", "active")

      // Generate a contract number based on project data
      const contractNumber = `CNT-${project._id.slice(-6)}-${new Date().getFullYear()}`
      setValue("contractNumber", contractNumber)
    }
  }, [project, setValue])

  // Log form errors whenever they change
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log('Form Validation Errors:', errors);
      // Show toast with first error
      const firstError = Object.entries(errors)[0];
      const [fieldName, error] = firstError;
      toast({
        title: `Error in ${fieldName}`,
        description: error.message as string,
        variant: "destructive",
      });
    }
  }, [errors, toast]);

  // Initialize field arrays
  const {
    fields: termsFields,
    append: appendTerm,
    remove: removeTerm,
  } = useFieldArray({
    control,
    name: "terms",
  })

  const {
    fields: deliverablesFields,
    append: appendDeliverable,
    remove: removeDeliverable,
  } = useFieldArray({
    control,
    name: "deliverables",
  })

  const {
    fields: paymentScheduleFields,
    append: appendPaymentSchedule,
    remove: removePaymentSchedule,
  } = useFieldArray({
    control,
    name: "paymentSchedule",
  })

  const {
    fields: amendmentsFields,
    append: appendAmendment,
    remove: removeAmendment,
  } = useFieldArray({
    control,
    name: "amendments",
  })

  const onSubmit = async (data: ContractFormData) => {
    console.log("Form submission started", data);

    // Log any validation errors
    if (Object.keys(errors).length > 0) {
      console.log('Form Validation Errors:', errors);
      return;
    }

    // Check for required fields
    const requiredFields = {
      contractNumber: "Contract Number",
      title: "Title",
      description: "Description",
      contractValue: "Contract Value",
      currency: "Currency",
      startDate: "Start Date",
      endDate: "End Date",
      status: "Contract Status",
      procurementMethod: "Procurement Method",
      procurementReferenceNumber: "Procurement Reference Number"
    };

    const missingFields = Object.entries(requiredFields).filter(
      ([key]) => !data[key as keyof ContractFormData]
    );

    if (missingFields.length > 0) {
      const missingFieldNames = missingFields.map(([_, name]) => name).join(", ");
      toast({
        title: "Required Fields Missing",
        description: `Please fill in the following required fields: ${missingFieldNames}`,
        variant: "destructive",
      });
      return;
    }

    // Validate dates
    if (new Date(data.startDate) > new Date(data.endDate)) {
      toast({
        title: "Invalid Dates",
        description: "Start Date cannot be after End Date",
        variant: "destructive",
      });
      return;
    }

    try {
      // Show loading state
      toast({
        title: "Creating Contract",
        description: "Please wait while we create your contract...",
      });

      // Format dates to ISO string
      const formattedData = {
        ...data,
        startDate: new Date(data.startDate).toISOString().split('T')[0],
        endDate: new Date(data.endDate).toISOString().split('T')[0],
        deliverables: data.deliverables.map(d => ({
          ...d,
          dueDate: new Date(d.dueDate).toISOString().split('T')[0]
        })),
        paymentSchedule: data.paymentSchedule.map(p => ({
          ...p,
          dueDate: new Date(p.dueDate).toISOString().split('T')[0],
          paymentDate: p.paymentDate ? new Date(p.paymentDate).toISOString().split('T')[0] : undefined
        }))
      };

      console.log("Formatted data:", formattedData);

      // Validate terms
      if (!data.terms.length || !data.terms[0].clause || !data.terms[0].description) {
        toast({
          title: "Terms Required",
          description: "Please add at least one contract term with clause and description",
          variant: "destructive",
        });
        return;
      }

      // Validate deliverables
      if (!data.deliverables.length || !data.deliverables[0].title || !data.deliverables[0].description) {
        toast({
          title: "Deliverables Required",
          description: "Please add at least one deliverable with title and description",
          variant: "destructive",
        });
        return;
      }

      // Validate payment schedule
      if (!data.paymentSchedule.length || !data.paymentSchedule[0].milestone || !data.paymentSchedule[0].amount) {
        toast({
          title: "Payment Schedule Required",
          description: "Please add at least one payment schedule with milestone and amount",
          variant: "destructive",
        });
        return;
      }

      // Submit the data
      const result = await createContract(formattedData);
      console.log("API Response:", result);

      if (!result) {
        throw new Error("Failed to create contract");
      }

      toast({
        title: "Success",
        description: "Contract created successfully",
      });

      // Redirect after success
      router.push("/contracts");
    } catch (error) {
      console.error("Contract creation error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create contract",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 container mx-auto py-6 space-y-8">
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-6">
              <div className="flex flex-col items-center space-y-2">
                <svg
                  className="animate-spin h-6 w-6 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <p className="text-sm text-muted-foreground">Loading project details...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Header section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => router.back()}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Badge variant="outline" className="rounded-sm px-1 font-normal">
                  New Contract Registration
                </Badge>
              </div>
              <Button type="submit" className="bg-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="mr-2">Creating...</span>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </>
                ) : (
                  "Create Contract"
                )}
              </Button>
            </div>

            {/* Main content */}
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 lg:gap-4">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contract Information</CardTitle>
                  <CardDescription>Basic contract details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contractNumber">Contract Number *</Label>
                      <Input
                        id="contractNumber"
                        {...register("contractNumber")}
                        className={errors.contractNumber ? "border-red-500" : ""}
                      />
                      {errors.contractNumber && <p className="text-sm text-red-500">{errors.contractNumber.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input id="title" {...register("title")} className={errors.title ? "border-red-500" : ""} />
                      {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        {...register("description")}
                        className={errors.description ? "border-red-500" : ""}
                      />
                      {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                    </div>

                    {/* <div className="space-y-2">
                      <Label htmlFor="contractingAuthorityId">Contracting Authority ID *</Label>
                      <Input
                        id="contractingAuthorityId"
                        {...register("contractingAuthorityId")}
                        className={errors.contractingAuthorityId ? "border-red-500" : ""}
                      />
                      {errors.contractingAuthorityId && (
                        <p className="text-sm text-red-500">{errors.contractingAuthorityId.message}</p>
                      )}
                    </div> */}

                    {/* <div className="space-y-2">
                      <Label htmlFor="contractorId">Contractor ID *</Label>
                      <Input
                        id="contractorId"
                        {...register("contractorId")}
                        className={errors.contractorId ? "border-red-500" : ""}
                      />
                      {errors.contractorId && <p className="text-sm text-red-500">{errors.contractorId.message}</p>}
                    </div> */}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contractValue">Contract Value *</Label>
                        <Input
                          id="contractValue"
                          type="number"
                          {...register("contractValue", { valueAsNumber: true })}
                          className={errors.contractValue ? "border-red-500" : ""}
                        />
                        {errors.contractValue && <p className="text-sm text-red-500">{errors.contractValue.message}</p>}
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date *</Label>
                        <Controller
                          name="startDate"
                          control={control}
                          render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date *</Label>
                        <Controller
                          name="endDate"
                          control={control}
                          render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contract Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Contract Details</CardTitle>
                  <CardDescription>Additional contract information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Contract Status *</Label>
                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="terminated">Terminated</SelectItem>
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
                      <Label htmlFor="procurementReferenceNumber">Procurement Reference Number *</Label>
                      <Input
                        id="procurementReferenceNumber"
                        {...register("procurementReferenceNumber")}
                        className={errors.procurementReferenceNumber ? "border-red-500" : ""}
                      />
                      {errors.procurementReferenceNumber && (
                        <p className="text-sm text-red-500">{errors.procurementReferenceNumber.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Controller
                          name="requiresPerformanceSecurity"
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              id="requiresPerformanceSecurity"
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                if (!checked) {
                                  // Reset performance security amount when unchecked
                                  setValue('performanceSecurityAmount', null);
                                }
                              }}
                            />
                          )}
                        />
                        <Label htmlFor="requiresPerformanceSecurity">Requires Performance Security</Label>
                      </div>

                      {watch("requiresPerformanceSecurity") && (
                        <div>
                          <Label htmlFor="performanceSecurityAmount">Performance Security Amount</Label>
                          <Controller
                            name="performanceSecurityAmount"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                              <Input
                                id="performanceSecurityAmount"
                                type="number"
                                placeholder="Enter amount"
                                value={value === null ? '' : value}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  onChange(val === '' ? null : Number(val));
                                }}
                                min="0"
                                step="0.01"
                              />
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Terms, Deliverables, Payment Schedule, and Amendments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              {/* Terms */}
              <Card>
                <CardHeader>
                  <CardTitle>Contract Terms</CardTitle>
                  <CardDescription>Define the terms of the contract</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {termsFields.map((field, index) => (
                      <div key={field.id} className="space-y-2">
                        <Input {...register(`terms.${index}.clause`)} placeholder="Clause" />
                        <Textarea {...register(`terms.${index}.description`)} placeholder="Description" />
                        <Button type="button" variant="destructive" onClick={() => removeTerm(index)}>
                          Remove Term
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={() => appendTerm({ clause: "", description: "" })}>
                      Add Term
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Deliverables */}
              <Card>
                <CardHeader>
                  <CardTitle>Deliverables</CardTitle>
                  <CardDescription>Define the deliverables for this contract</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {deliverablesFields.map((field, index) => (
                      <div key={field.id} className="space-y-2">
                        <Input {...register(`deliverables.${index}.title`)} placeholder="Title" />
                        <Textarea {...register(`deliverables.${index}.description`)} placeholder="Description" />
                        <Controller
                          name={`deliverables.${index}.dueDate`}
                          control={control}
                          render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />}
                        />
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`deliverables.${index}.completed`}
                            {...register(`deliverables.${index}.completed`)}
                          />
                          <Label htmlFor={`deliverables.${index}.completed`}>Completed</Label>
                        </div>
                        <div className="space-y-2">
                          <Label>Acceptance Criteria</Label>
                          <Input
                            {...register(`deliverables.${index}.acceptanceCriteria.0`)}
                            placeholder="Enter acceptance criteria"
                          />
                        </div>
                        <Button type="button" variant="destructive" onClick={() => removeDeliverable(index)}>
                          Remove Deliverable
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        appendDeliverable({
                          title: "",
                          description: "",
                          dueDate: new Date(),
                          completed: false,
                          acceptanceCriteria: [""]
                        })
                      }
                    >
                      Add Deliverable
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Schedule</CardTitle>
                  <CardDescription>Define the payment schedule for this contract</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paymentScheduleFields.map((field, index) => (
                      <div key={field.id} className="space-y-2">
                        <Input {...register(`paymentSchedule.${index}.milestone`)} placeholder="Milestone" />
                        <Input
                          type="number"
                          {...register(`paymentSchedule.${index}.amount`, { valueAsNumber: true })}
                          placeholder="Amount"
                        />
                        <Controller
                          name={`paymentSchedule.${index}.dueDate`}
                          control={control}
                          render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />}
                        />
                        <div className="flex items-center space-x-2">
                          <Checkbox id={`paymentSchedule.${index}.paid`} {...register(`paymentSchedule.${index}.paid`)} />
                          <Label htmlFor={`paymentSchedule.${index}.paid`}>Paid</Label>
                        </div>
                        <Button type="button" variant="destructive" onClick={() => removePaymentSchedule(index)}>
                          Remove Payment Schedule
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => appendPaymentSchedule({ milestone: "", amount: 0, dueDate: new Date(), paid: false })}
                    >
                      Add Payment Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Amendments */}
              {/* <Card>
                <CardHeader>
                  <CardTitle>Amendments</CardTitle>
                  <CardDescription>Add any amendments to the contract</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {amendmentsFields.map((field, index) => (
                      <div key={field.id} className="space-y-2">
                        <Input {...register(`amendments.${index}.amendmentNumber`)} placeholder="Amendment Number" />
                        <Textarea {...register(`amendments.${index}.description`)} placeholder="Description" />
                        <Controller
                          name={`amendments.${index}.date`}
                          control={control}
                          render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />}
                        />
                        <Input {...register(`amendments.${index}.approvedBy`)} placeholder="Approved By" />
                        <Button type="button" variant="destructive" onClick={() => removeAmendment(index)}>
                          Remove Amendment
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        appendAmendment({ amendmentNumber: "", description: "", date: new Date(), approvedBy: "" })
                      }
                    >
                      Add Amendment
                    </Button>
                  </div>
                </CardContent>
              </Card> */}
            </div>

            {/* File Uploads */}
            {/* <Card className="mt-8">
              <CardHeader>
                <CardTitle>Contract Documents</CardTitle>
                <CardDescription>Upload required contract documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Contract Document *</Label>
                    <FileUpload
                      onChange={(files) => {
                        console.log("Contract document updated:", files)
                        setContractDocument(files)
                      }}
                    />
                    {contractDocument[0] && (
                      <p className="text-xs text-muted-foreground">Selected: {contractDocument[0].name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Terms and Conditions *</Label>
                    <FileUpload
                      onChange={(files) => {
                        console.log("Terms and conditions updated:", files)
                        setTermsAndConditions(files)
                      }}
                    />
                    {termsAndConditions[0] && (
                      <p className="text-xs text-muted-foreground">Selected: {termsAndConditions[0].name}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card> */}

            {/* Submit Button */}
            {/* <div className="mt-8 flex justify-end">
              <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                {isSubmitting ? "Creating Contract..." : "Create Contract"}
              </Button>
            </div> */}
          </>
        )}
      </form>
    </div>
  )
}
