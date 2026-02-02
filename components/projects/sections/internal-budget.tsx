import React, { useState, useEffect } from "react";
import ImprovedBudgetApprovalComponent from "./budget-approval";
import { Badge } from "@/components/ui/badge";
import { BUDGET_CODES } from "@/lib/budget";
import BudgetVisualization from "./components/budget-visualization";
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
import { getStatusInfo } from "./modern-budget-display";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, Pencil, Plus, Send, Trash } from "lucide-react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { submitBudget } from "@/services/budget.service";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Budget, BudgetCategory, TeamMember } from "@/types/project";
import { BudgetCodeSelector } from "./budget-code-dialog";
import { TeamSectionProps } from "./team-section";
import { formatDateForInput } from "@/lib/date-utils";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

interface InternalBudgetProps {
  hasInternalBudget: boolean;
  status: string;
  budgetId: string;
  budget: Budget;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  isSubmitting: boolean;
  handleCreateInternalBudget: () => void;
  handleUpdateInternalBudget: () => void;
  isInternalDrawerOpen: boolean;
  setIsInternalDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleDrawerOpen: any;
  getDrawerTitle: any;
  handleDrawerClose: any;
  handleCategoryChange: any;
  handleDeleteCategory: any;
  handleItemChange: any;
  handleDeleteItem: any;
  internalFormState: any;
  currency: string;
  handleRemoveCategory: any;
  handleRemoveItem: any;
  handleAddItem: any;
  setInternalFormState: any;
  handleAddCategory: any;
  isEditMode: boolean;
  isSubmittingInternal: boolean;
  teamMembers: TeamMember[];
  milestones: any[];
}

export const InternalBudget = ({
  hasInternalBudget,
  budget,
  setIsSubmitting,
  isSubmitting,
  handleCreateInternalBudget,
  handleUpdateInternalBudget,
  isInternalDrawerOpen,
  setIsInternalDrawerOpen,
  handleDrawerOpen,
  getDrawerTitle,
  internalFormState,
  currency,
  handleRemoveCategory,
  handleCategoryChange,
  handleRemoveItem,
  handleItemChange,
  handleAddItem,
  setInternalFormState,
  handleAddCategory,
  isEditMode,
  isSubmittingInternal,
  teamMembers,
  milestones,
}: InternalBudgetProps) => {
  const { toast } = useToast();

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
        {categories &&
          categories.map((category, index) => (
            <Collapsible key={index} defaultOpen={true} className="space-y-2">
              <Card>
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                      <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                      <CardTitle>{category.name}</CardTitle>
                    </CollapsibleTrigger>
                    <Badge variant="outline">{category.description}</Badge>
                  </div>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent>
                    <div className="space-y-2">
                      {category.items &&
                        category.items.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="flex justify-between items-center p-2 rounded-lg bg-muted"
                          >
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.description}
                              </p>
                              {item.milestoneId && (
                                <Badge
                                  variant="secondary"
                                  className="mt-1 text-[10px] h-4"
                                >
                                  Milestone:{" "}
                                  {milestones?.find(
                                    (m) => m._id === item.milestoneId,
                                  )?.title || "Unknown"}
                                </Badge>
                              )}
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
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
      </div>
    );
  };

  return (
    <div className="items-center mb-4">
      <div className="flex items-center justify-between p-2">
        <h2 className="text-xl font-semibold">Internal Budget</h2>
        <div className="flex items-center gap-4">
          {budget?.status && (
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
          <Dialog>
            <DialogTrigger asChild>
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
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Budget for Approval</DialogTitle>
                <DialogDescription>
                  Are you sure you want to submit this budget for approval? This
                  will notify the relevant approvers.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  onClick={async (e) => {
                    const target = e.target as HTMLButtonElement;
                    target.disabled = true;
                    setIsSubmitting(true);
                    try {
                      await submitBudget(budget?._id);
                      toast({
                        title: "Success",
                        description: "Budget submitted for approval",
                      });
                      window.location.reload();
                      const closeButton = document.querySelector(
                        "[data-dialog-close]",
                      ) as HTMLButtonElement;
                      if (closeButton) closeButton.click();
                    } catch (error: any) {
                      toast({
                        title: "Error",
                        description: error.message || "Failed to submit budget",
                        variant: "destructive",
                      });
                    } finally {
                      target.disabled = false;
                      setIsSubmitting(false);
                    }
                  }}
                >
                  <div className="flex items-center space-x-2">
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <Spinner className="h-4 w-4" />
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Send className="h-4 w-4 mr-2" />
                        <span>Submit</span>
                      </div>
                    )}
                  </div>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Drawer
            open={isInternalDrawerOpen}
            onOpenChange={(open) => {
              setIsInternalDrawerOpen(open);
            }}
          >
            <DrawerTrigger asChild>
              <Button
                onClick={() => {
                  setIsInternalDrawerOpen(true);
                  handleDrawerOpen("internal");
                }}
              >
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
            <DrawerContent className="h-[100vh]">
              <div className="flex-1">
                <ResizablePanelGroup direction="horizontal">
                  <ResizablePanel defaultSize={40} minSize={20}>
                    <div className="pl-6">
                      <DrawerTitle>{getDrawerTitle("internal")}</DrawerTitle>
                      <DrawerDescription>
                        Add internal budget categories and items. All amounts
                        should be in {currency}.
                      </DrawerDescription>
                    </div>
                    <ScrollArea className="h-[calc(97vh-90px)]">
                      <div className="p-6 space-y-6">
                        {internalFormState.categories &&
                          internalFormState.categories.map(
                            (category: any, categoryIndex: number) => (
                              <Collapsible
                                key={categoryIndex}
                                defaultOpen={true}
                                className="space-y-2"
                              >
                                <Card className="p-4">
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                        <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                                        <h3 className="text-lg font-semibold">
                                          Category {categoryIndex + 1}
                                        </h3>
                                      </CollapsibleTrigger>
                                      {categoryIndex > 0 && (
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() =>
                                            handleRemoveCategory(
                                              categoryIndex,
                                              "internal",
                                            )
                                          }
                                        >
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>

                                    <CollapsibleContent className="space-y-4">
                                      <div className="grid gap-4">
                                        <div className="grid gap-2">
                                          <Label
                                            htmlFor={`internal-category-name-${categoryIndex}`}
                                          >
                                            Budget Code *
                                          </Label>
                                          <BudgetCodeSelector
                                            selectedCode={category.name}
                                            onSelect={(
                                              code: string,
                                              name: string,
                                            ) => {
                                              handleCategoryChange(
                                                categoryIndex,
                                                "name",
                                                code,
                                                "internal",
                                              );
                                              handleCategoryChange(
                                                categoryIndex,
                                                "description",
                                                name,
                                                "internal",
                                              );
                                            }}
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
                                                "internal",
                                              )
                                            }
                                            readOnly={
                                              category.name &&
                                              BUDGET_CODES &&
                                              BUDGET_CODES.some(
                                                (code) =>
                                                  code?.code === category?.name,
                                              )
                                            }
                                          />
                                        </div>

                                        <div className="space-y-4">
                                          {category.items &&
                                            category.items.map(
                                              (
                                                item: any,
                                                itemIndex: number,
                                              ) => (
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
                                                              "internal",
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
                                                          {category.name ===
                                                            "2257" ||
                                                          category.name ===
                                                            "2237"
                                                            ? "Team Member *"
                                                            : "Item Name *"}
                                                        </Label>
                                                        {category.name ===
                                                          "2257" ||
                                                        category.name ===
                                                          "2237" ? (
                                                          <>
                                                            <Select
                                                              value={item.name}
                                                              onValueChange={(
                                                                value,
                                                              ) =>
                                                                handleItemChange(
                                                                  categoryIndex,
                                                                  itemIndex,
                                                                  "name",
                                                                  value,
                                                                  "internal",
                                                                )
                                                              }
                                                            >
                                                              <SelectTrigger>
                                                                <SelectValue placeholder="Select team member" />
                                                              </SelectTrigger>
                                                              <SelectContent>
                                                                {!teamMembers?.length ? (
                                                                  <div className="p-4 text-center">
                                                                    <p className="text-sm text-muted-foreground mb-2">
                                                                      No team
                                                                      members
                                                                      found
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                      Please
                                                                      navigate
                                                                      to the
                                                                      Team
                                                                      section to
                                                                      add
                                                                      project
                                                                      members
                                                                      before
                                                                      allocating
                                                                      salaries.
                                                                    </p>
                                                                  </div>
                                                                ) : (
                                                                  teamMembers?.map(
                                                                    (
                                                                      member: any,
                                                                    ) => (
                                                                      <SelectItem
                                                                        key={
                                                                          member._id
                                                                        }
                                                                        value={`${member?.userId?.firstName} ${member?.userId?.lastName} (${member?.userId?.email})`}
                                                                      >
                                                                        {
                                                                          member
                                                                            ?.userId
                                                                            ?.firstName
                                                                        }{" "}
                                                                        {
                                                                          member
                                                                            ?.userId
                                                                            ?.lastName
                                                                        }{" "}
                                                                        (
                                                                        {
                                                                          member
                                                                            ?.userId
                                                                            ?.email
                                                                        }
                                                                        )
                                                                      </SelectItem>
                                                                    ),
                                                                  )
                                                                )}
                                                              </SelectContent>
                                                            </Select>
                                                            {!teamMembers?.length && (
                                                              <div className="flex items-center space-x-1">
                                                                <Info className="h-4 w-4 text-yellow-600" />
                                                                <p className="text-xs text-yellow-600 mt-1">
                                                                  Team members
                                                                  must be added
                                                                  before
                                                                  allocating
                                                                  salaries
                                                                </p>
                                                              </div>
                                                            )}
                                                          </>
                                                        ) : (
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
                                                                "internal",
                                                              )
                                                            }
                                                          />
                                                        )}
                                                      </div>
                                                      {category.name ===
                                                        "2237" && (
                                                        <div className="grid gap-2">
                                                          <Label
                                                            htmlFor={`internal-item-milestone-${categoryIndex}-${itemIndex}`}
                                                          >
                                                            Milestone
                                                          </Label>
                                                          <Select
                                                            value={
                                                              item.milestoneId
                                                            }
                                                            onValueChange={(
                                                              value,
                                                            ) =>
                                                              handleItemChange(
                                                                categoryIndex,
                                                                itemIndex,
                                                                "milestoneId",
                                                                value,
                                                                "internal",
                                                              )
                                                            }
                                                          >
                                                            <SelectTrigger>
                                                              <SelectValue placeholder="Select milestone" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                              {milestones?.map(
                                                                (
                                                                  milestone: any,
                                                                ) => (
                                                                  <SelectItem
                                                                    key={
                                                                      milestone._id
                                                                    }
                                                                    value={
                                                                      milestone._id
                                                                    }
                                                                  >
                                                                    {
                                                                      milestone.title
                                                                    }
                                                                  </SelectItem>
                                                                ),
                                                              )}
                                                            </SelectContent>
                                                          </Select>
                                                        </div>
                                                      )}

                                                      <div className="grid gap-2">
                                                        <Label
                                                          htmlFor={`internal-item-desc-${categoryIndex}-${itemIndex}`}
                                                        >
                                                          Item Description *
                                                        </Label>
                                                        <Textarea
                                                          id={`internal-item-desc-${categoryIndex}-${itemIndex}`}
                                                          placeholder="e.g., Monthly salary allocation"
                                                          value={
                                                            item.description
                                                          }
                                                          onChange={(e) =>
                                                            handleItemChange(
                                                              categoryIndex,
                                                              itemIndex,
                                                              "description",
                                                              e.target.value,
                                                              "internal",
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
                                                                e.target.value,
                                                              ),
                                                              "internal",
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
                                                            value,
                                                          ) =>
                                                            handleItemChange(
                                                              categoryIndex,
                                                              itemIndex,
                                                              "frequency",
                                                              value,
                                                              "internal",
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
                                                            value={formatDateForInput(
                                                              item.startDate,
                                                            )}
                                                            className="z-50"
                                                            onChange={(e) =>
                                                              handleItemChange(
                                                                categoryIndex,
                                                                itemIndex,
                                                                "startDate",
                                                                e.target.value,
                                                                "internal",
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
                                                            value={formatDateForInput(
                                                              item.endDate,
                                                            )}
                                                            className="z-50"
                                                            onChange={(e) =>
                                                              handleItemChange(
                                                                categoryIndex,
                                                                itemIndex,
                                                                "endDate",
                                                                e.target.value,
                                                                "internal",
                                                              )
                                                            }
                                                          />
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </Card>
                                              ),
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
                                              "internal",
                                            )
                                          }
                                        >
                                          <Plus className="h-4 w-4 mr-2" />
                                          Add Item
                                        </Button>
                                      </div>
                                    </CollapsibleContent>
                                  </div>
                                </Card>
                              </Collapsible>
                            ),
                          )}

                        <Button
                          onClick={() => handleAddCategory("internal")}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Category
                        </Button>
                      </div>
                    </ScrollArea>
                    <DrawerFooter className="">
                      <div className="flex justify-between gap-4 ">
                        <DrawerClose asChild>
                          <Button variant="outline" className="w-full">
                            Cancel
                          </Button>
                        </DrawerClose>
                        <Button
                          onClick={
                            hasInternalBudget
                              ? handleUpdateInternalBudget
                              : handleCreateInternalBudget
                          }
                          disabled={isSubmittingInternal}
                          className="w-full"
                        >
                          {isSubmittingInternal ? (
                            <Spinner className="mr-2 h-4 w-4" />
                          ) : (
                            <Send className="mr-2 h-4 w-4" />
                          )}
                          {hasInternalBudget
                            ? "Update Budget"
                            : "Create Budget"}
                        </Button>
                      </div>
                    </DrawerFooter>
                  </ResizablePanel>

                  <ResizableHandle withHandle />

                  <ResizablePanel
                    defaultSize={60}
                    minSize={20}
                    className="hidden md:block"
                  >
                    <div className="px-6 space-x-2 pt-3 flex items-center justify-end">
                      <DrawerTitle>Smart budget Live Preview</DrawerTitle>
                      <Badge variant="outline" className="px-3 py-1">
                        Preview
                      </Badge>
                    </div>
                    <ScrollArea className="h-[calc(97vh-50px)]">
                      <div className="ml-2 p-2">
                        {internalFormState.categories?.length > 0 ? (
                          <BudgetVisualization
                            formState={internalFormState}
                            currency={currency}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-[400px] border-2 border-dashed rounded-lg">
                            <div className="text-center space-y-2 p-4">
                              <p className="text-lg font-medium text-muted-foreground">
                                No Budget Data
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Add budget categories and items to see analytics
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      {hasInternalBudget ? (
        <div className="space-y-4">
          {renderBudgetItems(budget.internalCategories)}
          <ImprovedBudgetApprovalComponent
            auditTrail={budget.auditTrail}
            createdBy={budget.createdBy}
            updatedBy={budget.updatedBy}
            status={budget.status}
            currentLevelDeadline={budget.currentLevelDeadline}
            budgetId={budget._id.toString()}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">No Internal Budget</h3>
            <p className="text-sm text-muted-foreground">
              Create an internal budget to track your project expenses
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
