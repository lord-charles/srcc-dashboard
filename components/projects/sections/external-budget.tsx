import React, { useEffect } from "react";
import ImprovedBudgetApprovalComponent from "./budget-approval";
import { Badge } from "@/components/ui/badge";
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
import {
  Pencil,
  Plus,
  Send,
  Trash,
  Loader2,
  Check,
  ChevronsUpDown,
} from "lucide-react";
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
import { Budget, BudgetCategory, BudgetItem, TeamMember } from "@/types/project";

interface ExternalBudgetProps {
  hasExternalBudget: boolean;
  budget: Budget;
  handleCreateExternalBudget: () => void;
  handleUpdateExternalBudget: () => void;
  isExternalDrawerOpen: boolean;
  setIsExternalDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleDrawerOpen: (type: "internal" | "external") => void;
  getDrawerTitle: any
  externalFormState: any;
  currency: string;
  handleRemoveCategory: any;
  handleCategoryChange: any;
  handleRemoveItem: any;
  handleItemChange: any;
  handleAddItem: any;
  setExternalFormState: any
  handleAddCategory: (type: "internal" | "external") => void;
  isEditMode: boolean;
  isSubmittingExternal: boolean;
}

export const ExternalBudget = ({
  hasExternalBudget,
  budget,
  handleCreateExternalBudget,
  handleUpdateExternalBudget,
  isExternalDrawerOpen,
  setIsExternalDrawerOpen,
  handleDrawerOpen,
  getDrawerTitle,
  externalFormState,
  currency,
  handleRemoveCategory,
  handleCategoryChange,
  handleRemoveItem,
  handleItemChange,
  handleAddItem,
  setExternalFormState,
  handleAddCategory,
  isEditMode,
  isSubmittingExternal,
}: ExternalBudgetProps) => {
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

  return (
    <div>
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
                Add external budget categories and items. All amounts should be
                in {currency}.
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-6">
                  {externalFormState.categories.map(
                    (category: any, categoryIndex: any) => (
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
                              {category.items.map(
                                (item: any, itemIndex: any) => (
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
                                            Estimated Amount ({currency}) *
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
                                )
                              )}
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
                          setExternalFormState((prev: any) => ({
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
      <div>
        {hasExternalBudget ? (
          <div className="space-y-4">
            {renderBudgetItems(budget.externalCategories)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">No External Budget</h3>
              <p className="text-sm text-muted-foreground">
                Create an external budget to track vendor and service expenses
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
