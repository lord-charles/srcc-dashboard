"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Edit,
  Plus,
  Check,
  Loader2,
  Trash,
  Pencil,
  Send,
} from "lucide-react";
import { Budget } from "@/types/project";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import * as z from "zod";
import {
  createInternalBudget,
  createExternalBudget,
  updateInternalBudget,
  updateExternalBudget,
  submitBudget,
} from "@/services/budget.service";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import BudgetApprovalComponent, { getStatusInfo } from "./budget-approval";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const budgetItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  estimatedAmount: z.number().min(0, "Amount must be positive"),
  frequency: z.string().min(1, "Frequency is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

const budgetCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  items: z.array(budgetItemSchema).min(1, "At least one item is required"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
});

const internalBudgetSchema = z.object({
  projectId: z.string(),
  internalCategories: z
    .array(budgetCategorySchema)
    .min(1, "At least one category is required"),
  currency: z.string(),
  totalInternalBudget: z.number().min(0),
  notes: z.string(),
});

const externalBudgetSchema = z.object({
  projectId: z.string(),
  externalCategories: z
    .array(budgetCategorySchema)
    .min(1, "At least one category is required"),
  currency: z.string(),
  totalExternalBudget: z.number().min(0),
  notes: z.string(),
});

type BudgetTab = "internal" | "external";

interface BudgetItem {
  name: string;
  description: string;
  estimatedAmount: number;
  frequency: string;
  startDate: string;
  endDate: string;
}

interface BudgetCategory {
  name: string;
  description: string;
  items: BudgetItem[];
  tags: string[];
}

interface BudgetFormState {
  categories: BudgetCategory[];
  totalBudget: number;
  notes: string;
}

interface ModernBudgetDisplayProps {
  budget: Budget;
  currency: string;
  projectId: string;
}

const initialItemState = {
  name: "",
  description: "",
  estimatedAmount: 0,
  frequency: "monthly" as const,
  startDate: "",
  endDate: "",
};

const initialCategoryState = (type: "internal" | "external") => ({
  name: "",
  description: "",
  items: [initialItemState],
  tags:
    type === "internal"
      ? ["internal", "operational"]
      : ["external", "infrastructure"],
});

const initialFormState = (type: "internal" | "external") => ({
  categories: [initialCategoryState(type)],
  totalBudget: 0,
  notes: "",
});

type StatusConfigKey = "pending" | "approved" | "rejected" | "draft";

const ModernBudgetDisplay: React.FC<ModernBudgetDisplayProps> = ({
  budget,
  currency,
  projectId,
}) => {
  const [activeTab, setActiveTab] = useState<BudgetTab>("internal");
  const [isInternalDrawerOpen, setIsInternalDrawerOpen] = useState(false);
  const [isExternalDrawerOpen, setIsExternalDrawerOpen] = useState(false);
  const [isSubmittingInternal, setIsSubmittingInternal] = useState(false);
  const [isSubmittingExternal, setIsSubmittingExternal] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [internalFormState, setInternalFormState] = useState<BudgetFormState>(
    initialFormState("internal")
  );
  const [externalFormState, setExternalFormState] = useState<BudgetFormState>(
    initialFormState("external")
  );

  const [isEditMode, setIsEditMode] = useState(false);

  const hasInternalBudget = budget?.internalCategories?.length > 0;
  const hasExternalBudget = budget?.externalCategories?.length > 0;

  const populateFormState = (type: "internal" | "external") => {
    if (!budget) return;

    const categories =
      type === "internal"
        ? budget.internalCategories
        : budget.externalCategories;
    const totalBudget =
      type === "internal"
        ? budget.totalInternalBudget
        : budget.totalExternalBudget;

    if (type === "internal") {
      setInternalFormState({
        categories: categories || [initialCategoryState("internal")],
        totalBudget: totalBudget || 0,
        notes: budget.notes || "",
      });
    } else {
      setExternalFormState({
        categories: categories || [initialCategoryState("external")],
        totalBudget: totalBudget || 0,
        notes: budget.notes || "",
      });
    }
  };

  const getBudgetStatusBadge = (status: string) => {
    const statusConfig: Record<
      StatusConfigKey,
      { variant: string; label: string }
    > = {
      pending: { variant: "warning", label: "Pending" },
      approved: { variant: "success", label: "Approved" },
      rejected: { variant: "destructive", label: "Rejected" },
      draft: { variant: "secondary", label: "Draft" },
    };

    const config =
      statusConfig[status.toLowerCase() as StatusConfigKey] ||
      statusConfig.draft;

    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const handleDrawerOpen = (type: "internal" | "external") => {
    if (type === "internal") {
      if (hasInternalBudget) {
        populateFormState("internal");
        setIsEditMode(true);
      } else {
        setInternalFormState(initialFormState("internal"));
        setIsEditMode(false);
      }
      setIsInternalDrawerOpen(true);
    } else {
      if (hasExternalBudget) {
        populateFormState("external");
        setIsEditMode(true);
      } else {
        setExternalFormState(initialFormState("external"));
        setIsEditMode(false);
      }
      setIsExternalDrawerOpen(true);
    }
  };

  useEffect(() => {
    if (!isInternalDrawerOpen && !isSubmittingInternal) {
      setInternalFormState(initialFormState("internal"));
    }
  }, [isInternalDrawerOpen]);

  useEffect(() => {
    if (!isExternalDrawerOpen && !isSubmittingExternal) {
      setExternalFormState(initialFormState("external"));
    }
  }, [isExternalDrawerOpen]);

  const calculateTotalAmount = (categories: BudgetCategory[]) => {
    return categories.reduce(
      (acc, category) =>
        acc +
        category.items.reduce(
          (itemAcc, item) => itemAcc + (Number(item.estimatedAmount) || 0),
          0
        ),
      0
    );
  };

  useEffect(() => {
    const total = calculateTotalAmount(internalFormState.categories);
    setInternalFormState((prev) => ({ ...prev, totalBudget: total }));
  }, [internalFormState.categories]);

  useEffect(() => {
    const total = calculateTotalAmount(externalFormState.categories);
    setExternalFormState((prev) => ({ ...prev, totalBudget: total }));
  }, [externalFormState.categories]);

  const validateBudgetData = (
    formState: BudgetFormState,
    isInternal: boolean
  ) => {
    try {
      console.log("Validating form state:", formState);

      // Validate required fields
      for (const category of formState.categories) {
        console.log("Validating category:", category);

        if (!category.name?.trim()) {
          throw new Error(`Category name is required`);
        }
        if (!category.description?.trim()) {
          throw new Error(`Category description is required`);
        }

        for (const [index, item] of category.items.entries()) {
          console.log(`Validating item ${index}:`, item);

          if (!item.name?.trim()) {
            throw new Error(
              `Item name is required in category "${category.name}"`
            );
          }
          if (!item.description?.trim()) {
            throw new Error(
              `Item description is required in category "${category.name}"`
            );
          }
          if (!item.estimatedAmount || item.estimatedAmount <= 0) {
            throw new Error(
              `Item amount must be greater than 0 in category "${category.name}"`
            );
          }
          if (!item.startDate) {
            throw new Error(
              `Start date is required for item "${item.name}" in category "${category.name}"`
            );
          }
          if (!item.endDate) {
            throw new Error(
              `End date is required for item "${item.name}" in category "${category.name}"`
            );
          }
          if (new Date(item.startDate) > new Date(item.endDate)) {
            throw new Error(
              `Start date must be before end date for item "${item.name}" in category "${category.name}"`
            );
          }
        }
      }

      const categories = formState.categories.map((category) => ({
        ...category,
        items: category.items.map((item) => ({
          ...item,
          estimatedAmount: Number(item.estimatedAmount),
        })),
      }));

      const data = {
        projectId,
        [isInternal ? "internalCategories" : "externalCategories"]: categories,
        currency,
        [isInternal ? "totalInternalBudget" : "totalExternalBudget"]:
          formState.totalBudget,
        notes: formState.notes?.trim() || "",
      };

      console.log("Final validated data:", data);

      // Validate using zod schema
      const schema = isInternal ? internalBudgetSchema : externalBudgetSchema;
      return schema.parse(data);
    } catch (error) {
      console.error("Validation error:", error);
      if (error instanceof z.ZodError) {
        console.error("Zod validation errors:", error.errors);
        throw new Error(error.errors[0].message);
      }
      throw error;
    }
  };

  const handleCreateInternalBudget = async () => {
    try {
      setIsSubmittingInternal(true);
      console.log("Creating internal budget with state:", internalFormState);

      const validatedData = validateBudgetData(internalFormState, true);
      console.log("Validated internal budget data:", validatedData);

      await createInternalBudget(validatedData);

      setIsInternalDrawerOpen(false);
      toast({
        title: "Success",
        description: "Internal budget created successfully",
      });

      // Reset form
      setInternalFormState(initialFormState("internal"));
      window.location.reload();
    } catch (error) {
      console.error("Error creating internal budget:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create internal budget",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingInternal(false);
    }
  };

  const handleUpdateInternalBudget = async () => {
    try {
      setIsSubmittingInternal(true);
      console.log("Updating internal budget with state:", internalFormState);

      const validatedData = validateBudgetData(internalFormState, true);
      console.log("Validated internal budget data:", validatedData);

      await updateInternalBudget(validatedData, budget._id);

      setIsInternalDrawerOpen(false);
      toast({
        title: "Success",
        description: "Internal budget updated successfully",
      });

      // Reset form
      setInternalFormState(initialFormState("internal"));
      // window.location.reload();
      router.refresh();
    } catch (error) {
      console.error("Error updating internal budget:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update internal budget",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingInternal(false);
    }
  };

  const handleCreateExternalBudget = async () => {
    try {
      setIsSubmittingExternal(true);
      console.log("Creating external budget with state:", externalFormState);

      const validatedData = validateBudgetData(externalFormState, false);
      console.log("Validated external budget data:", validatedData);

      await createExternalBudget(validatedData);

      setIsExternalDrawerOpen(false);
      toast({
        title: "Success",
        description: "External budget created successfully",
      });

      // Reset form
      setExternalFormState(initialFormState("external"));
      // window.location.reload();
      router.refresh();
    } catch (error) {
      console.error("Error creating external budget:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create external budget",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingExternal(false);
    }
  };

  const handleUpdateExternalBudget = async () => {
    try {
      setIsSubmittingExternal(true);
      console.log("Updating external budget with state:", externalFormState);

      const validatedData = validateBudgetData(externalFormState, false);
      console.log("Validated external budget data:", validatedData);

      await updateExternalBudget(validatedData, budget._id);

      setIsExternalDrawerOpen(false);
      toast({
        title: "Success",
        description: "External budget updated successfully",
      });

      // Reset form
      setExternalFormState(initialFormState("external"));
    } catch (error) {
      console.error("Error updating external budget:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update external budget",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingExternal(false);
      window.location.reload();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const renderBudgetItems = (categories: BudgetCategory[] = []) => {
    return (
      <div className="space-y-4">
        {categories.map((category, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{category.name}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex justify-between items-center p-2 rounded-lg bg-muted"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(item.estimatedAmount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.frequency}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const handleRemoveCategory = (
    index: number,
    type: "internal" | "external"
  ) => {
    if (type === "internal") {
      setInternalFormState((prev) => ({
        ...prev,
        categories: prev.categories.filter((_, i) => i !== index),
      }));
    } else {
      setExternalFormState((prev) => ({
        ...prev,
        categories: prev.categories.filter((_, i) => i !== index),
      }));
    }
  };

  const handleRemoveItem = (
    categoryIndex: number,
    itemIndex: number,
    type: "internal" | "external"
  ) => {
    if (type === "internal") {
      setInternalFormState((prev) => {
        const newCategories = [...prev.categories];
        newCategories[categoryIndex].items = newCategories[
          categoryIndex
        ].items.filter((_, i) => i !== itemIndex);
        return { ...prev, categories: newCategories };
      });
    } else {
      setExternalFormState((prev) => {
        const newCategories = [...prev.categories];
        newCategories[categoryIndex].items = newCategories[
          categoryIndex
        ].items.filter((_, i) => i !== itemIndex);
        return { ...prev, categories: newCategories };
      });
    }
  };

  const handleAddItem = (
    categoryIndex: number,
    type: "internal" | "external"
  ) => {
    const newItem: BudgetItem = {
      name: "",
      description: "",
      estimatedAmount: 0,
      frequency: "monthly",
      startDate: "",
      endDate: "",
    };

    if (type === "internal") {
      setInternalFormState((prev) => {
        const newCategories = [...prev.categories];
        newCategories[categoryIndex].items.push(newItem);
        return { ...prev, categories: newCategories };
      });
    } else {
      setExternalFormState((prev) => {
        const newCategories = [...prev.categories];
        newCategories[categoryIndex].items.push(newItem);
        return { ...prev, categories: newCategories };
      });
    }
  };

  const handleAddCategory = (type: "internal" | "external") => {
    const newCategory: BudgetCategory = {
      name: "",
      description: "",
      items: [
        {
          name: "",
          description: "",
          estimatedAmount: 0,
          frequency: "monthly",
          startDate: "",
          endDate: "",
        },
      ],
      tags:
        type === "internal"
          ? ["internal", "operational"]
          : ["external", "infrastructure"],
    };

    if (type === "internal") {
      setInternalFormState((prev) => ({
        ...prev,
        categories: [...prev.categories, newCategory],
      }));
    } else {
      setExternalFormState((prev) => ({
        ...prev,
        categories: [...prev.categories, newCategory],
      }));
    }
  };

  const handleCategoryChange = (
    index: number,
    field: keyof Pick<BudgetCategory, "name" | "description">,
    value: string,
    type: "internal" | "external"
  ) => {
    if (type === "internal") {
      setInternalFormState((prev) => {
        const newCategories = [...prev.categories];
        newCategories[index] = {
          ...newCategories[index],
          [field]: value,
        };
        return { ...prev, categories: newCategories };
      });
    } else {
      setExternalFormState((prev) => {
        const newCategories = [...prev.categories];
        newCategories[index] = {
          ...newCategories[index],
          [field]: value,
        };
        return { ...prev, categories: newCategories };
      });
    }
  };

  const handleItemChange = (
    categoryIndex: number,
    itemIndex: number,
    field: keyof Pick<
      BudgetItem,
      | "name"
      | "description"
      | "estimatedAmount"
      | "frequency"
      | "startDate"
      | "endDate"
    >,
    value: string | number,
    type: "internal" | "external"
  ) => {
    if (type === "internal") {
      setInternalFormState((prev) => {
        const newCategories = [...prev.categories];
        newCategories[categoryIndex].items[itemIndex] = {
          ...newCategories[categoryIndex].items[itemIndex],
          [field]: value,
        };
        return { ...prev, categories: newCategories };
      });
    } else {
      setExternalFormState((prev) => {
        const newCategories = [...prev.categories];
        newCategories[categoryIndex].items[itemIndex] = {
          ...newCategories[categoryIndex].items[itemIndex],
          [field]: value,
        };
        return { ...prev, categories: newCategories };
      });
    }
  };

  const getDrawerTitle = (type: "internal" | "external") => {
    return `${isEditMode ? "Edit" : "Create"} ${
      type === "internal" ? "Internal" : "External"
    } Budget`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex gap-4 items-baseline">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Currency
              </p>
              <CardDescription className="text-2xl font-bold">
                {currency}
              </CardDescription>
            </div>
            {budget && (
              <div className="items-center flex flex-col">
                <p className="text-sm font-medium text-muted-foreground">
                  Version
                </p>
                <CardDescription className="text-2xl font-bold">
                  {budget.version}
                </CardDescription>
              </div>
            )}
          </div>
          {budget && (
            <div className="flex items-center gap-4">
              {(budget as any).internalStatus &&
                getBudgetStatusBadge((budget as any).internalStatus)}
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Budget
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    (budget.totalInternalBudget || 0) +
                      (budget.totalExternalBudget || 0)
                  )}
                </p>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="internal"
            className="w-full"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as BudgetTab)}
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger
                value="internal"
                className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
              >
                Internal Budget
              </TabsTrigger>
              <TabsTrigger
                value="external"
                className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
              >
                External Budget
              </TabsTrigger>
            </TabsList>

            <TabsContent value="internal">
              <div className="items-center mb-4">
                <div className="flex items-center justify-between p-2">
                  <h2 className="text-xl font-semibold">Internal Budget</h2>
                  <div className="flex items-center gap-4">
                    {budget.status && (
                      <Badge
                        variant={
                          (budget?.status === "approved"
                            ? "success"
                            : budget?.status === "draft" ||
                              budget?.status === "revision_requested"
                            ? "warning"
                            : "secondary") as "default"
                        }
                        className={`${
                          getStatusInfo(budget?.status).color
                        } px-3 py-1 text-sm font-medium rounded-full`}
                      >
                        {hasInternalBudget
                          ? budget?.status?.replace("_", " ").toUpperCase()
                          : "NO BUDGET"}
                      </Badge>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          disabled={
                            !hasInternalBudget ||
                            (budget?.status !== "draft" &&
                              budget?.status !== "revision_requested")
                          }
                          className="relative group"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Submit for Approval
                          {(!hasInternalBudget ||
                            (budget?.status !== "draft" &&
                              budget?.status !== "revision_requested")) && (
                            <span className="invisible group-hover:visible absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                              {!hasInternalBudget
                                ? "Create a budget first"
                                : "Can only submit draft or revision requested budgets"}
                            </span>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Submit Budget for Approval
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to submit this budget for
                            approval? This will notify the relevant approvers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={async () => {
                              try {
                                await submitBudget(budget?._id);
                                toast({
                                  title: "Success",
                                  description: "Budget submitted for approval",
                                });
                                router.refresh();
                              } catch (error: any) {
                                toast({
                                  title: "Error",
                                  description:
                                    error.message || "Failed to submit budget",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            Submit
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Drawer
                      open={isInternalDrawerOpen}
                      onOpenChange={setIsInternalDrawerOpen}
                    >
                      <DrawerTrigger asChild>
                        <Button onClick={() => handleDrawerOpen("internal")}>
                          {hasInternalBudget ? (
                            <Pencil className="h-4 w-4 mr-2" />
                          ) : (
                            <Plus className="h-4 w-4 mr-2" />
                          )}
                          {hasInternalBudget
                            ? "Edit Internal Budget"
                            : "Add Internal Budget"}
                        </Button>
                      </DrawerTrigger>
                      <DrawerContent className="h-[90vh] flex flex-col">
                        <DrawerHeader>
                          <DrawerTitle>
                            {getDrawerTitle("internal")}
                          </DrawerTitle>
                          <DrawerDescription>
                            Add internal budget categories and items. All
                            amounts should be in {currency}.
                          </DrawerDescription>
                        </DrawerHeader>
                        <div className="flex-1 overflow-hidden">
                          <ScrollArea className="h-full">
                            <div className="p-4 space-y-6">
                              {internalFormState.categories.map(
                                (category, categoryIndex) => (
                                  <Card key={categoryIndex} className="p-4">
                                    <div className="space-y-4">
                                      <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold">
                                          Category {categoryIndex + 1}
                                        </h3>
                                        {categoryIndex > 0 && (
                                          <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                              handleRemoveCategory(
                                                categoryIndex,
                                                "internal"
                                              )
                                            }
                                          >
                                            <Trash className="h-4 w-4" />
                                          </Button>
                                        )}
                                      </div>

                                      <div className="grid gap-4">
                                        <div className="grid gap-2">
                                          <Label
                                            htmlFor={`internal-category-name-${categoryIndex}`}
                                          >
                                            Category Name *
                                          </Label>
                                          <Input
                                            id={`internal-category-name-${categoryIndex}`}
                                            placeholder="e.g., Human Resources"
                                            value={category.name}
                                            onChange={(e) =>
                                              handleCategoryChange(
                                                categoryIndex,
                                                "name",
                                                e.target.value,
                                                "internal"
                                              )
                                            }
                                          />
                                        </div>

                                        <div className="grid gap-2">
                                          <Label
                                            htmlFor={`internal-category-desc-${categoryIndex}`}
                                          >
                                            Category Description *
                                          </Label>
                                          <Textarea
                                            id={`internal-category-desc-${categoryIndex}`}
                                            placeholder="e.g., All HR related expenses"
                                            value={category.description}
                                            onChange={(e) =>
                                              handleCategoryChange(
                                                categoryIndex,
                                                "description",
                                                e.target.value,
                                                "internal"
                                              )
                                            }
                                          />
                                        </div>

                                        <div className="space-y-4">
                                          {category.items.map(
                                            (item, itemIndex) => (
                                              <Card
                                                key={itemIndex}
                                                className="p-4"
                                              >
                                                <div className="space-y-4">
                                                  <div className="flex items-center justify-between">
                                                    <h4 className="text-md font-medium">
                                                      Item {itemIndex + 1}
                                                    </h4>
                                                    {itemIndex > 0 && (
                                                      <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() =>
                                                          handleRemoveItem(
                                                            categoryIndex,
                                                            itemIndex,
                                                            "internal"
                                                          )
                                                        }
                                                      >
                                                        <Trash className="h-4 w-4" />
                                                      </Button>
                                                    )}
                                                  </div>

                                                  <div className="grid gap-4">
                                                    <div className="grid gap-2">
                                                      <Label
                                                        htmlFor={`internal-item-name-${categoryIndex}-${itemIndex}`}
                                                      >
                                                        Item Name *
                                                      </Label>
                                                      <Input
                                                        id={`internal-item-name-${categoryIndex}-${itemIndex}`}
                                                        placeholder="e.g., Software Development Team"
                                                        value={item.name}
                                                        onChange={(e) =>
                                                          handleItemChange(
                                                            categoryIndex,
                                                            itemIndex,
                                                            "name",
                                                            e.target.value,
                                                            "internal"
                                                          )
                                                        }
                                                      />
                                                    </div>

                                                    <div className="grid gap-2">
                                                      <Label
                                                        htmlFor={`internal-item-desc-${categoryIndex}-${itemIndex}`}
                                                      >
                                                        Item Description *
                                                      </Label>
                                                      <Textarea
                                                        id={`internal-item-desc-${categoryIndex}-${itemIndex}`}
                                                        placeholder="e.g., Monthly salary allocation"
                                                        value={item.description}
                                                        onChange={(e) =>
                                                          handleItemChange(
                                                            categoryIndex,
                                                            itemIndex,
                                                            "description",
                                                            e.target.value,
                                                            "internal"
                                                          )
                                                        }
                                                      />
                                                    </div>

                                                    <div className="grid gap-2">
                                                      <Label
                                                        htmlFor={`internal-item-amount-${categoryIndex}-${itemIndex}`}
                                                      >
                                                        Estimated Amount (
                                                        {currency}) *
                                                      </Label>
                                                      <Input
                                                        id={`internal-item-amount-${categoryIndex}-${itemIndex}`}
                                                        type="number"
                                                        placeholder="e.g., 500000"
                                                        value={
                                                          item.estimatedAmount
                                                        }
                                                        onChange={(e) =>
                                                          handleItemChange(
                                                            categoryIndex,
                                                            itemIndex,
                                                            "estimatedAmount",
                                                            Number(
                                                              e.target.value
                                                            ),
                                                            "internal"
                                                          )
                                                        }
                                                      />
                                                    </div>

                                                    <div className="grid gap-2">
                                                      <Label
                                                        htmlFor={`internal-item-frequency-${categoryIndex}-${itemIndex}`}
                                                      >
                                                        Frequency *
                                                      </Label>
                                                      <Select
                                                        value={item.frequency}
                                                        onValueChange={(
                                                          value
                                                        ) =>
                                                          handleItemChange(
                                                            categoryIndex,
                                                            itemIndex,
                                                            "frequency",
                                                            value,
                                                            "internal"
                                                          )
                                                        }
                                                      >
                                                        <SelectTrigger>
                                                          <SelectValue placeholder="Select frequency" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                          <SelectItem value="monthly">
                                                            Monthly
                                                          </SelectItem>
                                                          <SelectItem value="quarterly">
                                                            Quarterly
                                                          </SelectItem>
                                                          <SelectItem value="annually">
                                                            Annually
                                                          </SelectItem>
                                                          <SelectItem value="one-time">
                                                            One-time
                                                          </SelectItem>
                                                        </SelectContent>
                                                      </Select>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                      <div className="grid gap-2">
                                                        <Label
                                                          htmlFor={`internal-item-start-${categoryIndex}-${itemIndex}`}
                                                        >
                                                          Start Date *
                                                        </Label>
                                                        <Input
                                                          id={`internal-item-start-${categoryIndex}-${itemIndex}`}
                                                          type="date"
                                                          value={item.startDate}
                                                          className="z-50"
                                                          onChange={(e) =>
                                                            handleItemChange(
                                                              categoryIndex,
                                                              itemIndex,
                                                              "startDate",
                                                              e.target.value,
                                                              "internal"
                                                            )
                                                          }
                                                        />
                                                      </div>
                                                      <div className="grid gap-2">
                                                        <Label
                                                          htmlFor={`internal-item-end-${categoryIndex}-${itemIndex}`}
                                                        >
                                                          End Date *
                                                        </Label>
                                                        <Input
                                                          id={`internal-item-end-${categoryIndex}-${itemIndex}`}
                                                          type="date"
                                                          value={item.endDate}
                                                          className="z-50"
                                                          onChange={(e) =>
                                                            handleItemChange(
                                                              categoryIndex,
                                                              itemIndex,
                                                              "endDate",
                                                              e.target.value,
                                                              "internal"
                                                            )
                                                          }
                                                        />
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              </Card>
                                            )
                                          )}
                                        </div>

                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          className="w-full"
                                          onClick={() =>
                                            handleAddItem(
                                              categoryIndex,
                                              "internal"
                                            )
                                          }
                                        >
                                          <Plus className="h-4 w-4 mr-2" />
                                          Add Item
                                        </Button>
                                      </div>
                                    </div>
                                  </Card>
                                )
                              )}

                              <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => handleAddCategory("internal")}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Category
                              </Button>

                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <Label>Total Budget</Label>
                                  <p className="text-lg font-semibold">
                                    {currency}{" "}
                                    {internalFormState.totalBudget.toLocaleString()}
                                  </p>
                                </div>

                                <div className="grid gap-2">
                                  <Label htmlFor="internal-notes">Notes</Label>
                                  <Textarea
                                    id="internal-notes"
                                    placeholder="Add any additional notes about this budget"
                                    value={internalFormState.notes}
                                    onChange={(e) =>
                                      setInternalFormState((prev) => ({
                                        ...prev,
                                        notes: e.target.value,
                                      }))
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          </ScrollArea>
                        </div>
                        <DrawerFooter className="border-t">
                          <Button
                            onClick={
                              isEditMode
                                ? handleUpdateInternalBudget
                                : handleCreateInternalBudget
                            }
                            className="w-full"
                            disabled={isSubmittingInternal}
                          >
                            {isSubmittingInternal ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {isEditMode ? "Updating..." : "Creating..."}
                              </>
                            ) : isEditMode ? (
                              "Update Budget"
                            ) : (
                              "Create Budget"
                            )}
                          </Button>
                          <DrawerClose asChild>
                            <Button variant="outline" className="w-full">
                              Cancel
                            </Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </DrawerContent>
                    </Drawer>
                  </div>
                </div>
                {hasInternalBudget ? (
                  <div className="space-y-4">
                    {renderBudgetItems(budget.internalCategories)}
                    <BudgetApprovalComponent
                      auditTrail={budget.auditTrail}
                      createdBy={budget.createdBy}
                      updatedBy={budget.updatedBy}
                      status={budget.status}
                      currentLevelDeadline={budget.currentLevelDeadline}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <div className="text-center space-y-2">
                      <h3 className="text-lg font-semibold">
                        No Internal Budget
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Create an internal budget to track your project expenses
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="external">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">External Budget</h2>
                <Drawer
                  open={isExternalDrawerOpen}
                  onOpenChange={setIsExternalDrawerOpen}
                >
                  <DrawerTrigger asChild>
                    <Button onClick={() => handleDrawerOpen("external")}>
                      {hasExternalBudget ? (
                        <Pencil className="h-4 w-4 mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      {hasExternalBudget
                        ? "Edit External Budget"
                        : "Add External Budget"}
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="h-[90vh] flex flex-col">
                    <DrawerHeader>
                      <DrawerTitle>{getDrawerTitle("external")}</DrawerTitle>
                      <DrawerDescription>
                        Add external budget categories and items. All amounts
                        should be in {currency}.
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="flex-1 overflow-hidden">
                      <ScrollArea className="h-full">
                        <div className="p-4 space-y-6">
                          {externalFormState.categories.map(
                            (category, categoryIndex) => (
                              <Card key={categoryIndex} className="p-4">
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">
                                      Category {categoryIndex + 1}
                                    </h3>
                                    {categoryIndex > 0 && (
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                          handleRemoveCategory(
                                            categoryIndex,
                                            "external"
                                          )
                                        }
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>

                                  <div className="grid gap-4">
                                    <div className="grid gap-2">
                                      <Label
                                        htmlFor={`external-category-name-${categoryIndex}`}
                                      >
                                        Category Name *
                                      </Label>
                                      <Input
                                        id={`external-category-name-${categoryIndex}`}
                                        placeholder="e.g., Human Resources"
                                        value={category.name}
                                        onChange={(e) =>
                                          handleCategoryChange(
                                            categoryIndex,
                                            "name",
                                            e.target.value,
                                            "external"
                                          )
                                        }
                                      />
                                    </div>

                                    <div className="grid gap-2">
                                      <Label
                                        htmlFor={`external-category-desc-${categoryIndex}`}
                                      >
                                        Category Description *
                                      </Label>
                                      <Textarea
                                        id={`external-category-desc-${categoryIndex}`}
                                        placeholder="e.g., All HR related expenses"
                                        value={category.description}
                                        onChange={(e) =>
                                          handleCategoryChange(
                                            categoryIndex,
                                            "description",
                                            e.target.value,
                                            "external"
                                          )
                                        }
                                      />
                                    </div>

                                    <div className="space-y-4">
                                      {category.items.map((item, itemIndex) => (
                                        <Card key={itemIndex} className="p-4">
                                          <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                              <h4 className="text-md font-medium">
                                                Item {itemIndex + 1}
                                              </h4>
                                              {itemIndex > 0 && (
                                                <Button
                                                  variant="destructive"
                                                  size="sm"
                                                  onClick={() =>
                                                    handleRemoveItem(
                                                      categoryIndex,
                                                      itemIndex,
                                                      "external"
                                                    )
                                                  }
                                                >
                                                  <Trash className="h-4 w-4" />
                                                </Button>
                                              )}
                                            </div>

                                            <div className="grid gap-4">
                                              <div className="grid gap-2">
                                                <Label
                                                  htmlFor={`external-item-name-${categoryIndex}-${itemIndex}`}
                                                >
                                                  Item Name *
                                                </Label>
                                                <Input
                                                  id={`external-item-name-${categoryIndex}-${itemIndex}`}
                                                  placeholder="e.g., Software Development Team"
                                                  value={item.name}
                                                  onChange={(e) =>
                                                    handleItemChange(
                                                      categoryIndex,
                                                      itemIndex,
                                                      "name",
                                                      e.target.value,
                                                      "external"
                                                    )
                                                  }
                                                />
                                              </div>

                                              <div className="grid gap-2">
                                                <Label
                                                  htmlFor={`external-item-desc-${categoryIndex}-${itemIndex}`}
                                                >
                                                  Item Description *
                                                </Label>
                                                <Textarea
                                                  id={`external-item-desc-${categoryIndex}-${itemIndex}`}
                                                  placeholder="e.g., Monthly salary allocation"
                                                  value={item.description}
                                                  onChange={(e) =>
                                                    handleItemChange(
                                                      categoryIndex,
                                                      itemIndex,
                                                      "description",
                                                      e.target.value,
                                                      "external"
                                                    )
                                                  }
                                                />
                                              </div>

                                              <div className="grid gap-2">
                                                <Label
                                                  htmlFor={`external-item-amount-${categoryIndex}-${itemIndex}`}
                                                >
                                                  Estimated Amount ({currency})
                                                  *
                                                </Label>
                                                <Input
                                                  id={`external-item-amount-${categoryIndex}-${itemIndex}`}
                                                  type="number"
                                                  placeholder="e.g., 500000"
                                                  value={item.estimatedAmount}
                                                  onChange={(e) =>
                                                    handleItemChange(
                                                      categoryIndex,
                                                      itemIndex,
                                                      "estimatedAmount",
                                                      Number(e.target.value),
                                                      "external"
                                                    )
                                                  }
                                                />
                                              </div>

                                              <div className="grid gap-2">
                                                <Label
                                                  htmlFor={`external-item-frequency-${categoryIndex}-${itemIndex}`}
                                                >
                                                  Frequency *
                                                </Label>
                                                <Select
                                                  value={item.frequency}
                                                  onValueChange={(value) =>
                                                    handleItemChange(
                                                      categoryIndex,
                                                      itemIndex,
                                                      "frequency",
                                                      value,
                                                      "external"
                                                    )
                                                  }
                                                >
                                                  <SelectTrigger>
                                                    <SelectValue placeholder="Select frequency" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="monthly">
                                                      Monthly
                                                    </SelectItem>
                                                    <SelectItem value="quarterly">
                                                      Quarterly
                                                    </SelectItem>
                                                    <SelectItem value="annually">
                                                      Annually
                                                    </SelectItem>
                                                    <SelectItem value="one-time">
                                                      One-time
                                                    </SelectItem>
                                                  </SelectContent>
                                                </Select>
                                              </div>

                                              <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                  <Label
                                                    htmlFor={`external-item-start-${categoryIndex}-${itemIndex}`}
                                                  >
                                                    Start Date *
                                                  </Label>
                                                  <Input
                                                    id={`external-item-start-${categoryIndex}-${itemIndex}`}
                                                    type="date"
                                                    value={item.startDate}
                                                    onChange={(e) =>
                                                      handleItemChange(
                                                        categoryIndex,
                                                        itemIndex,
                                                        "startDate",
                                                        e.target.value,
                                                        "external"
                                                      )
                                                    }
                                                  />
                                                </div>
                                                <div className="grid gap-2">
                                                  <Label
                                                    htmlFor={`external-item-end-${categoryIndex}-${itemIndex}`}
                                                  >
                                                    End Date *
                                                  </Label>
                                                  <Input
                                                    id={`external-item-end-${categoryIndex}-${itemIndex}`}
                                                    type="date"
                                                    value={item.endDate}
                                                    onChange={(e) =>
                                                      handleItemChange(
                                                        categoryIndex,
                                                        itemIndex,
                                                        "endDate",
                                                        e.target.value,
                                                        "external"
                                                      )
                                                    }
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </Card>
                                      ))}
                                    </div>

                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="w-full"
                                      onClick={() =>
                                        handleAddItem(categoryIndex, "external")
                                      }
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add Item
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            )
                          )}

                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => handleAddCategory("external")}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Category
                          </Button>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label>Total Budget</Label>
                              <p className="text-lg font-semibold">
                                {currency}{" "}
                                {externalFormState.totalBudget.toLocaleString()}
                              </p>
                            </div>

                            <div className="grid gap-2">
                              <Label htmlFor="external-notes">Notes</Label>
                              <Textarea
                                id="external-notes"
                                placeholder="Add any additional notes about this budget"
                                value={externalFormState.notes}
                                onChange={(e) =>
                                  setExternalFormState((prev) => ({
                                    ...prev,
                                    notes: e.target.value,
                                  }))
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </ScrollArea>
                    </div>
                    <DrawerFooter className="border-t">
                      <Button
                        onClick={
                          isEditMode
                            ? handleUpdateExternalBudget
                            : handleCreateExternalBudget
                        }
                        className="w-full"
                        disabled={isSubmittingExternal}
                      >
                        {isSubmittingExternal ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isEditMode ? "Updating..." : "Creating..."}
                          </>
                        ) : isEditMode ? (
                          "Update Budget"
                        ) : (
                          "Create Budget"
                        )}
                      </Button>
                      <DrawerClose asChild>
                        <Button variant="outline" className="w-full">
                          Cancel
                        </Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </div>
              {hasExternalBudget ? (
                <div className="space-y-4">
                  {renderBudgetItems(budget.externalCategories)}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">
                      No External Budget
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Create an external budget to track vendor and service
                      expenses
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModernBudgetDisplay;
