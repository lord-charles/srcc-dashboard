"use client"

import { ChevronLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { DatePicker } from "@/components/ui/date-picker"
import { Textarea } from "@/components/ui/textarea"
import * as z from "zod"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useToast } from "@/hooks/use-toast"
import { createBudget } from "@/services/budget.service"

// Define the validation schema
const budgetSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  projectValue: z.number().positive("Project value must be positive"),
  budgetStartDate: z.date(),
  budgetEndDate: z.date(),
  budgetCategory: z.string().min(1, "Budget category is required"),
  currency: z.enum(["KES", "USD", "EUR", "GBP"]).default("KES"),
  totalPlannedCost: z.number().positive("Total planned cost must be positive"),
  totalActualCost: z.number().nonnegative("Total actual cost must be non-negative"),
  status: z.enum(["active", "completed", "pending"]),
  notes: z.string().optional(),
  budgetItems: z.array(
    z.object({
      itemName: z.string().min(1, "Item name is required"),
      plannedCost: z.number().positive("Planned cost must be positive"),
      actualCost: z.number().nonnegative("Actual cost must be non-negative"),
      description: z.string().optional(),
      dateIncurred: z.date(),
    }),
  ),
})

type BudgetFormData = z.infer<typeof budgetSchema>

export default function BudgetForm() {
  const { toast } = useToast()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      currency: "KES",
      status: "active",
      budgetItems: [{ itemName: "", plannedCost: 0, actualCost: 0, description: "", dateIncurred: new Date() }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "budgetItems",
  })

  const onSubmit = async (data: BudgetFormData) => {
    try {
      const result = await createBudget({
        ...data,
        budgetStartDate: data.budgetStartDate.toISOString(),
        budgetEndDate: data.budgetEndDate.toISOString(),
        projectId: "65be1234c52d3e001234abce", // You might want to get this from context or props
        budgetOwner: "65be1234c52d3e001234abcf", // You might want to get this from auth context
      });

      if (!result) {
        throw new Error("Failed to create budget");
      }
      
      toast({
        title: "Success",
        description: "Budget created successfully",
      });
      
      router.push("/budget");
    } catch (error: any) {
      console.error("Budget creation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create budget",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 container mx-auto py-6 space-y-8">
        {/* Header section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => router.back()}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Badge variant="outline" className="rounded-sm px-1 font-normal">
              New Budget
            </Badge>
          </div>
          <Button type="submit" className="bg-primary" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Budget"}
          </Button>
        </div>

        {/* Main content */}
        <div className="grid gap-4 md:grid-cols-2 lg:gap-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Information</CardTitle>
              <CardDescription>Enter the basic budget details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    {...register("projectName")}
                    className={errors.projectName ? "border-red-500" : ""}
                  />
                  {errors.projectName && <p className="text-sm text-red-500">{errors.projectName.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectValue">Project Value</Label>
                    <Input
                      id="projectValue"
                      type="number"
                      {...register("projectValue", { valueAsNumber: true })}
                      className={errors.projectValue ? "border-red-500" : ""}
                    />
                    {errors.projectValue && <p className="text-sm text-red-500">{errors.projectValue.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
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
                    <Label htmlFor="budgetStartDate">Start Date</Label>
                    <Controller
                      name="budgetStartDate"
                      control={control}
                      render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budgetEndDate">End Date</Label>
                    <Controller
                      name="budgetEndDate"
                      control={control}
                      render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budgetCategory">Budget Category</Label>
                  <Input
                    id="budgetCategory"
                    {...register("budgetCategory")}
                    className={errors.budgetCategory ? "border-red-500" : ""}
                  />
                  {errors.budgetCategory && <p className="text-sm text-red-500">{errors.budgetCategory.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
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
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget Details */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Details</CardTitle>
              <CardDescription>Enter the detailed budget information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalPlannedCost">Total Planned Cost</Label>
                    <Input
                      id="totalPlannedCost"
                      type="number"
                      {...register("totalPlannedCost", { valueAsNumber: true })}
                      className={errors.totalPlannedCost ? "border-red-500" : ""}
                    />
                    {errors.totalPlannedCost && (
                      <p className="text-sm text-red-500">{errors.totalPlannedCost.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalActualCost">Total Actual Cost</Label>
                    <Input
                      id="totalActualCost"
                      type="number"
                      {...register("totalActualCost", { valueAsNumber: true })}
                      className={errors.totalActualCost ? "border-red-500" : ""}
                    />
                    {errors.totalActualCost && <p className="text-sm text-red-500">{errors.totalActualCost.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" {...register("notes")} className={errors.notes ? "border-red-500" : ""} />
                  {errors.notes && <p className="text-sm text-red-500">{errors.notes.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget Items */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Items</CardTitle>
            <CardDescription>Add individual budget items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-4 p-4 border rounded-md">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`budgetItems.${index}.itemName`}>Item Name</Label>
                      <Input {...register(`budgetItems.${index}.itemName`)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`budgetItems.${index}.dateIncurred`}>Date Incurred</Label>
                      <Controller
                        name={`budgetItems.${index}.dateIncurred`}
                        control={control}
                        render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`budgetItems.${index}.plannedCost`}>Planned Cost</Label>
                      <Input type="number" {...register(`budgetItems.${index}.plannedCost`, { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`budgetItems.${index}.actualCost`}>Actual Cost</Label>
                      <Input type="number" {...register(`budgetItems.${index}.actualCost`, { valueAsNumber: true })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`budgetItems.${index}.description`}>Description</Label>
                    <Textarea {...register(`budgetItems.${index}.description`)} />
                  </div>
                  <Button type="button" variant="destructive" onClick={() => remove(index)}>
                    Remove Item
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({ itemName: "", plannedCost: 0, actualCost: 0, description: "", dateIncurred: new Date() })
                }
              >
                Add Budget Item
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
