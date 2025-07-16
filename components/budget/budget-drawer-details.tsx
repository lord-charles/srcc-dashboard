"use client"

import React, { useState, useEffect } from "react"

import { format } from "date-fns"
import { Calendar, ChevronDown, ChevronUp, FileText, Info, Mail, Phone, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { Budget, BudgetCategory } from "@/types/budget"
import { ScrollArea } from "../ui/scroll-area"
import ImprovedBudgetApprovalComponent from "../projects/sections/budget-approval"
import { Input } from "../ui/input"

// Helper function to format currency with null check
const formatCurrency = (amount: number | null, currency: string | null) => {
  if (amount === null) return "N/A"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Helper function to format dates with null check
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A"
  try {
    return format(new Date(dateString), "MMM d, yyyy")
  } catch (error) {
    return "Invalid date"
  }
}

// Component for displaying user details
const UserDetails = ({ user, label, date }: { user: Budget["createdBy"] | Budget["updatedBy"] | null; label: string; date: string | null }) => {
  const [expanded, setExpanded] = useState(false)

  if (!user) return <div className="text-muted-foreground">No {label.toLowerCase()} information available</div>

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="flex items-center text-muted-foreground">
          <User className="h-3 w-3 mr-2" />
          {label}:{" "}
          <span className="font-medium ml-1">
            {user.firstName || "N/A"} {user.lastName || ""}
          </span>
        </p>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-1 ml-5">{date ? format(new Date(date), "PPpp") : "N/A"}</p>

      {expanded && (
        <div className="ml-5 mt-2 text-xs space-y-1">
          <p className="text-muted-foreground flex items-center">
            <Mail className="h-3 w-3 mr-1" />
            <span className="font-medium">{user.email || "N/A"}</span>
          </p>
          <p className="text-muted-foreground flex items-center">
            <Phone className="h-3 w-3 mr-1" />
            <span className="font-medium">{user.phoneNumber || "N/A"}</span>
          </p>
          <p className="text-muted-foreground">
            Employee ID: <span className="font-medium">{user.employeeId || "N/A"}</span>
          </p>
        </div>
      )}
    </div>
  )
}

// Component for displaying budget categories and items
const CategorySection = ({
  category,
  currency,
}: {
  category: BudgetCategory
  currency: string
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!category) return null

  // Calculate category totals with null checks
  const totalEstimated = category.items?.reduce((sum, item) => sum + (item?.estimatedAmount || 0), 0) || 0
  const totalActual = category.items?.reduce((sum, item) => sum + (item?.actualAmount || 0), 0) || 0
  const spendPercentage = totalEstimated > 0 ? (totalActual / totalEstimated) * 100 : 0

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{category.name || "Unnamed Category"}</CardTitle>
            <CardDescription>{category.description || "No description"}</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Collapse category" : "Expand category"}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          {category.tags && category.tags.length > 0 ? (
            category.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">No tags</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between text-sm mb-2">
          <div>
            <span className="text-muted-foreground">Estimated: </span>
            <span className="font-medium">{formatCurrency(totalEstimated, currency)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Actual: </span>
            <span className="font-medium">{formatCurrency(totalActual, currency)}</span>
          </div>
        </div>
        <Progress value={spendPercentage} className="h-2" />

        {isExpanded && (
          <div className="mt-4 overflow-auto">
            {category.items && category.items.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead className="text-right">Estimated</TableHead>
                    <TableHead className="text-right">Actual</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {category.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="font-medium">{item?.name || "Unnamed Item"}</div>
                        <div className="text-xs text-muted-foreground">{item?.description || "No description"}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          <span className="inline-flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(item?.startDate)} - {formatDate(item?.endDate)}
                          </span>
                        </div>
                        {item?.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {item?.frequency || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item?.estimatedAmount || 0, currency)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item?.actualAmount || 0, currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-4">No items in this category</p>
            )}
          </div>
        )}

      </CardContent>
    </Card>
  )
}

// Main Budget Drawer component
export function BudgetDrawer({
  budget,
  trigger,
  onClose,
}: {
  budget: Budget
  trigger: React.ReactNode
  onClose?: () => void
}) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open && onClose) {
      onClose();
    }
  }, [open, onClose]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className="h-[95vh] max-h-[95vh]">
        <div className="mx-auto w-full max-w-4xl h-full flex flex-col">
          <DrawerHeader className="flex-none">
            <DrawerTitle className="text-2xl flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Budget for {budget.projectId?.name || "Unnamed Project"}
            </DrawerTitle>
            <DrawerDescription>
              {budget.projectId?.description || "No description"} •
              <Badge variant="outline" className="ml-2">
                {budget.status || "No status"}
              </Badge>
              <Badge variant="outline" className="ml-2">
                v{budget.version || "1"}
              </Badge>
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-hidden px-4">
            <ScrollArea className="h-[85vh] w-full">
              <div className="pr-4 pb-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency((budget.totalInternalBudget || 0) + (budget.totalExternalBudget || 0), budget.currency)}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatCurrency((budget.totalInternalSpent || 0) + (budget.totalExternalSpent || 0), budget.currency)} spent
                      </p>
                      <Progress value={((budget.totalInternalSpent || 0) + (budget.totalExternalSpent || 0)) / ((budget.totalInternalBudget || 0) + (budget.totalExternalBudget || 0)) * 100} className="h-2 mt-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Internal Budget</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(budget.totalInternalBudget || 0, budget.currency)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatCurrency(budget.totalInternalSpent || 0, budget.currency)} spent
                      </p>
                      <Progress
                        value={
                          budget.totalInternalBudget && budget.totalInternalBudget > 0
                            ? ((budget.totalInternalSpent || 0) / budget.totalInternalBudget) * 100
                            : 0
                        }
                        className="h-2 mt-2"
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">External Budget</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(budget.totalExternalBudget || 0, budget.currency)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatCurrency(budget.totalExternalSpent || 0, budget.currency)} spent
                      </p>
                      <Progress
                        value={
                          budget.totalExternalBudget && budget.totalExternalBudget > 0
                            ? ((budget.totalExternalSpent || 0) / budget.totalExternalBudget) * 100
                            : 0
                        }
                        className="h-2 mt-2"
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Budget Details */}
                <Tabs defaultValue="internal" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="internal">Internal Categories</TabsTrigger>
                    <TabsTrigger value="external">External Categories</TabsTrigger>
                    <TabsTrigger value="internal-approval">Budget Approval</TabsTrigger>

                  </TabsList>

                  <TabsContent value="internal" className="space-y-4">
                    {budget.internalCategories && budget.internalCategories.length > 0 ? (
                      <div>



                        <div>
                          {budget.internalCategories.map((category, index) => (
                            <CategorySection key={index} category={category} currency={budget.currency} />
                          ))}
                        </div>


                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No internal categories found</p>
                    )}
                  </TabsContent>

                  <TabsContent value="internal-approval" className="space-y-4">
                    <ImprovedBudgetApprovalComponent
                      auditTrail={budget?.auditTrail}
                      createdBy={budget?.createdBy}
                      updatedBy={budget?.updatedBy}
                      status={budget?.status}
                      currentLevelDeadline={budget?.currentLevelDeadline}
                      budgetId={budget?._id}
                    />
                  </TabsContent>

                  <TabsContent value="external" className="space-y-4">
                    {budget.externalCategories && budget.externalCategories.length > 0 ? (
                      budget.externalCategories.map((category, index) => (
                        <CategorySection key={index} category={category} currency={budget.currency} />
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No external categories found</p>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Metadata */}
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Budget Information</h3>
                  <div className="bg-muted rounded-lg p-4 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <UserDetails user={budget.createdBy} label="Created by" date={budget.createdAt} />
                      <UserDetails user={budget.updatedBy} label="Updated by" date={budget.updatedAt} />
                    </div>

                    <div className="mt-3">
                      <p className="flex items-center text-muted-foreground">
                        <Info className="h-3 w-3 mr-2" />
                        Notes:
                      </p>
                      <p className="text-sm mt-1 ml-5">
                        {budget.notes ? (
                          budget.notes
                        ) : (
                          <span className="text-muted-foreground italic">No notes provided</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-[15vh]"></div>
            </ScrollArea>
          </div>

          <DrawerFooter className="flex-none">
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
