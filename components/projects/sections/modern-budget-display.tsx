"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pencil,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  ClipboardCheck,
  DollarSign,
} from "lucide-react";
import { Budget } from "@/types/project";
import * as z from "zod";
import {
  createInternalBudget,
  createExternalBudget,
  updateInternalBudget,
  updateExternalBudget,
} from "@/services/budget.service";
import { useToast } from "@/hooks/use-toast";

import { InternalBudget } from "./internal-budget";
import { ExternalBudget } from "./external-budget";
import { useRouter } from "next/navigation";
import { TeamSectionProps } from "./team-section";

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
  teamMembers: TeamSectionProps[];
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
  teamMembers,
}) => {
  const [activeTab, setActiveTab] = useState<BudgetTab>("internal");
  const [isInternalDrawerOpen, setIsInternalDrawerOpen] = useState(false);
  const [isExternalDrawerOpen, setIsExternalDrawerOpen] = useState(false);
  const [isSubmittingInternal, setIsSubmittingInternal] = useState(false);
  const [isSubmittingExternal, setIsSubmittingExternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    return categories?.reduce(
      (acc, category) =>
        acc +
        category.items?.reduce(
          (itemAcc, item) => itemAcc + (Number(item?.estimatedAmount) || 0),
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
      for (const category of formState?.categories) {
        console.log("Validating category:", category);

        if (!category?.name?.trim()) {
          throw new Error(`Category name is required`);
        }
        if (!category?.description?.trim()) {
          throw new Error(`Category description is required`);
        }

        for (const [index, item] of category?.items?.entries() || []) {
          console.log(`Validating item ${index}:`, item);

          if (!item?.name?.trim()) {
            throw new Error(
              `Item name is required in category "${category?.name}"`
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
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
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
              <InternalBudget
                hasInternalBudget={hasInternalBudget}
                status={budget?.status}
                budgetId={budget?._id.toString()}
                budget={budget}
                setIsSubmitting={setIsSubmitting}
                isSubmitting={isSubmitting}
                handleCreateInternalBudget={handleCreateInternalBudget}
                handleUpdateInternalBudget={handleUpdateInternalBudget}
                isInternalDrawerOpen={isInternalDrawerOpen}
                setIsInternalDrawerOpen={setIsInternalDrawerOpen}
                handleDrawerOpen={handleDrawerOpen}
                getDrawerTitle={getDrawerTitle}
                internalFormState={internalFormState}
                currency={currency}
                handleRemoveCategory={handleRemoveCategory}
                handleCategoryChange={handleCategoryChange}
                handleRemoveItem={handleRemoveItem}
                setInternalFormState={setInternalFormState}
                handleAddCategory={handleAddCategory}
                isEditMode={isEditMode}
                isSubmittingInternal={isSubmittingInternal}
                handleAddItem={handleAddItem}
                handleItemChange={handleItemChange}
                handleDrawerClose={() => setIsInternalDrawerOpen(false)}
                handleDeleteCategory={handleRemoveCategory}
                handleDeleteItem={handleRemoveItem}
                teamMembers={teamMembers}
              />
            </TabsContent>

            <TabsContent value="external">
              <ExternalBudget
                hasExternalBudget={hasExternalBudget}
                budget={budget}
                handleCreateExternalBudget={handleCreateExternalBudget}
                handleUpdateExternalBudget={handleUpdateExternalBudget}
                isExternalDrawerOpen={isExternalDrawerOpen}
                setIsExternalDrawerOpen={setIsExternalDrawerOpen}
                handleDrawerOpen={handleDrawerOpen}
                getDrawerTitle={getDrawerTitle}
                externalFormState={externalFormState}
                currency={currency}
                handleRemoveCategory={handleRemoveCategory}
                handleCategoryChange={handleCategoryChange}
                handleRemoveItem={handleRemoveItem}
                handleItemChange={handleItemChange}
                handleAddItem={handleAddItem}
                setExternalFormState={setExternalFormState}
                handleAddCategory={handleAddCategory}
                isEditMode={isEditMode}
                isSubmittingExternal={isSubmittingExternal}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModernBudgetDisplay;
export const getStatusInfo = (status: string) => {
  switch (status.toLowerCase()) {
    case "approved":
      return { color: "bg-green-500", icon: CheckCircle };
    case "rejected":
      return { color: "bg-red-500", icon: XCircle };
    case "submitted_for_approval":
      return { color: "bg-blue-500", icon: Clock };
    case "updated":
      return { color: "bg-yellow-500", icon: Clock };
    case "pending_approval":
      return { color: "bg-yellow-500", icon: Clock };
    case "revision_requested":
      return { color: "bg-orange-500", icon: AlertCircle };
    case "draft":
      return { color: "bg-gray-400", icon: Pencil };
    case "pending_checker_approval":
      return { color: "bg-purple-500", icon: Eye };
    case "pending_manager_approval":
      return { color: "bg-teal-500", icon: ClipboardCheck };
    case "pending_finance_approval":
      return { color: "bg-indigo-500", icon: DollarSign };
    default:
      return { color: "bg-gray-500", icon: XCircle };
  }
};
