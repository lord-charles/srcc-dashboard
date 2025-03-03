"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  PieChart,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import { ArrowUp, DollarSign, Calendar, TrendingUp, Activity, PieChart as PieChartIcon, BarChart as BarChartIcon, ChartBar, LayoutDashboard, Clock, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import type { BudgetCategory } from "@/types/project";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface BudgetVisualizationProps {
  formState: {
    categories: BudgetCategory[];
    totalBudget: number;
    notes: string;
  };
  currency: string;
  className?: string;
}

export default function BudgetVisualization({
  formState,
  currency,
  className
}: BudgetVisualizationProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Memoized calculations
  const { categoryData, frequencyData, topItems, monthlyBurnRate, projectedSpending, budgetUtilization, budgetTrends } = useMemo(() => {
    // Category totals calculation
    const categoryData = formState.categories.map((category) => {
      const total = category.items?.reduce((sum, item) => sum + (item.estimatedAmount || 0), 0) || 0;
      return {
        name: category.name,
        description: category.description,
        value: total,
        percentage: (total / (formState.totalBudget || 1)) * 100,
      };
    });

    // Frequency breakdown
    const frequencies: Record<string, number> = {
      monthly: 0,
      quarterly: 0,
      annually: 0,
      "one-time": 0,
    };

    formState.categories.forEach((category) => {
      category.items?.forEach((item) => {
        if (item.frequency && frequencies[item.frequency] !== undefined) {
          frequencies[item.frequency] += item.estimatedAmount || 0;
        }
      });
    });

    const frequencyData = Object.entries(frequencies).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace("-", " "),
      value,
      percentage: (value / (formState.totalBudget || 1)) * 100,
    }));

    // Top budget items
    const allItems = formState.categories.flatMap((category) =>
      (category.items || []).map((item) => ({
        name: item.name,
        category: category.description,
        amount: item.estimatedAmount || 0,
        frequency: item.frequency,
        startDate: item.startDate,
        endDate: item.endDate,
      }))
    );

    const topItems = allItems
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map(item => ({
        ...item,
        percentage: (item.amount / (formState.totalBudget || 1)) * 100,
      }));

    // Monthly burn rate calculation
    const monthlyBurnRate = formState.categories.reduce((total, category) => {
      return total + (category.items || []).reduce((sum, item) => {
        const amount = item.estimatedAmount || 0;
        switch (item.frequency) {
          case "monthly": return sum + amount;
          case "quarterly": return sum + amount / 3;
          case "annually": return sum + amount / 12;
          case "one-time": return sum + amount / 6;
          default: return sum;
        }
      }, 0);
    }, 0);

    // Calculate projected spending over 12 months
    const projectedSpending = Array.from({ length: 12 }, (_, month) => {
      const date = new Date();
      date.setMonth(date.getMonth() + month);
      
      const monthlyTotal = formState.categories.reduce((total, category) => {
        return total + (category.items || []).reduce((sum, item) => {
          if (!item.startDate || !item.endDate) return sum;
          
          const startDate = new Date(item.startDate);
          const endDate = new Date(item.endDate);
          if (date < startDate || date > endDate) return sum;

          const amount = item.estimatedAmount || 0;
          switch (item.frequency) {
            case "monthly": return sum + amount;
            case "quarterly": return sum + (month % 3 === 0 ? amount : 0);
            case "annually": return sum + (month === 0 ? amount : 0);
            case "one-time": return sum + (month === 0 ? amount : 0);
            default: return sum;
          }
        }, 0);
      }, 0);

      return {
        name: date.toLocaleString('default', { month: 'short' }),
        amount: monthlyTotal,
      };
    });

    // Calculate budget utilization
    const totalAllocated = categoryData.reduce((sum, cat) => sum + cat.value, 0);
    const budgetUtilization = {
      allocated: totalAllocated,
      remaining: Math.max(0, (formState.totalBudget || 0) - totalAllocated),
      percentage: Math.min(100, (totalAllocated / (formState.totalBudget || 1)) * 100),
    };

    // Calculate budget trends
    const budgetTrends = {
      monthOverMonth: projectedSpending[1]?.amount > projectedSpending[0]?.amount ? 
        ((projectedSpending[1].amount - projectedSpending[0].amount) / projectedSpending[0].amount * 100) : 0,
      topCategory: categoryData.length > 0 ? categoryData.reduce((prev, curr) => 
        prev.value > curr.value ? prev : curr) : null,
      averageItemSize: formState.totalBudget / (formState.categories.reduce((sum, cat) => 
        sum + (cat.items?.length || 0), 0) || 1),
      unusedBudget: budgetUtilization.remaining,
    };

    return {
      categoryData,
      frequencyData,
      topItems,
      monthlyBurnRate,
      projectedSpending,
      budgetUtilization,
      budgetTrends
    };
  }, [formState, currency]);

  // Chart colors and customization
  const COLORS = [
    "#2563eb", // Blue
    "#16a34a", // Green
    "#ea580c", // Orange
    "#9333ea", // Purple
    "#0891b2", // Cyan
    "#4f46e5", // Indigo
    "#c026d3", // Fuchsia
    "#059669", // Emerald
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const chartConfig = {
    layout: "vertical",
    stack: false,
    padding: {
      top: 16,
      right: 16,
      bottom: 16,
      left: 16,
    },
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(formState.totalBudget || 0)}</div>
            <Progress value={budgetUtilization.percentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {budgetUtilization.percentage.toFixed(1)}% allocated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Burn Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyBurnRate)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Projected monthly spending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryData.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active budget categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Items</CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formState.categories.reduce((sum, cat) => sum + (cat.items?.length || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total budget line items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Insights</CardTitle>
          <CardDescription>Key metrics and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Month-over-Month Change</span>
                <Badge variant={budgetTrends.monthOverMonth > 0 ? "default" : "secondary"}>
                  {budgetTrends.monthOverMonth > 0 ? "+" : ""}{budgetTrends.monthOverMonth.toFixed(1)}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Largest Category</span>
                <Badge variant="outline">{budgetTrends.topCategory?.name || "N/A"}</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average Item Size</span>
                <span className="font-medium">{formatCurrency(budgetTrends.averageItemSize)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Unused Budget</span>
                <span className="font-medium">{formatCurrency(budgetTrends.unusedBudget)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Visualization Area */}
      <Tabs defaultValue="overview">
        <ScrollArea>
          <TabsList className="mb-3 h-auto -space-x-px bg-background p-0 shadow-sm shadow-black/5 rtl:space-x-reverse">
            <TabsTrigger
              value="overview"
              className="relative overflow-hidden rounded-none border border-border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
            >
              <LayoutDashboard
                className="-ms-0.5 me-1.5 opacity-60"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="relative overflow-hidden rounded-none border border-border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
            >
              <ChartBar
                className="-ms-0.5 me-1.5 opacity-60"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              Categories
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="relative overflow-hidden rounded-none border border-border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
            >
              <Clock
                className="-ms-0.5 me-1.5 opacity-60"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              Timeline
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="relative overflow-hidden rounded-none border border-border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
            >
              <List
                className="-ms-0.5 me-1.5 opacity-60"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              Details
            </TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Budget allocation by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Frequency Breakdown</CardTitle>
                <CardDescription>Budget distribution by payment frequency</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <BarChart accessibilityLayer data={frequencyData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar dataKey="value" fill="var(--color-desktop)" radius={8} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 font-medium leading-none">
                  {frequencyData[0]?.name} has the highest allocation
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                  Distribution of budget across payment frequencies
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Details</CardTitle>
              <CardDescription>Detailed breakdown of budget categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium leading-none">Total Categories</h4>
                  <p className="text-sm text-muted-foreground">
                    {categoryData.length} active categories
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium leading-none text-right">Average per Category</h4>
                  <p className="text-sm text-muted-foreground text-right">
                    {formatCurrency(formState.totalBudget / categoryData.length)}
                  </p>
                </div>
              </div>
              <Separator className="my-4" />
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {categoryData.map((category, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{category.description}</h4>
                        <Badge variant="outline">{category.name}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-medium">{formatCurrency(category.value)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Percentage:</span>
                          <span className="font-medium">{category.percentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={category.percentage} className="mt-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Projected Spending</CardTitle>
                <CardDescription>12-month spending projection</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <AreaChart
                    accessibilityLayer
                    data={projectedSpending}
                    margin={{
                      left: 12,
                      right: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <defs>
                      <linearGradient id="fillAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="var(--color-desktop)"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-desktop)"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      dataKey="amount"
                      type="natural"
                      fill="url(#fillAmount)"
                      fillOpacity={0.4}
                      stroke="var(--color-desktop)"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
              <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2 font-medium leading-none">
                      {projectedSpending[0]?.amount > projectedSpending[1]?.amount ? "Trending down" : "Trending up"} this month
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-2 leading-none text-muted-foreground">
                      Next 12 months projection
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
                <CardDescription>Spending patterns analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Peak Spending</h4>
                    <div className="text-2xl font-bold">
                      {formatCurrency(Math.max(...projectedSpending.map(p => p.amount)))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Highest projected monthly spend
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium mb-2">Average Monthly</h4>
                    <div className="text-2xl font-bold">
                      {formatCurrency(projectedSpending.reduce((sum, p) => sum + p.amount, 0) / projectedSpending.length)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Average monthly projection
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium mb-2">Volatility</h4>
                    <div className="text-2xl font-bold">
                      {((Math.max(...projectedSpending.map(p => p.amount)) - 
                         Math.min(...projectedSpending.map(p => p.amount))) / 
                         (projectedSpending.reduce((sum, p) => sum + p.amount, 0) / projectedSpending.length) * 100).toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Monthly spending variation
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Budget Items</CardTitle>
              <CardDescription>Highest value budget allocations</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {topItems.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        </div>
                        <Badge>{item.frequency}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-medium">{formatCurrency(item.amount)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Percentage of Total:</span>
                          <span className="font-medium">{item.percentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={item.percentage} className="mt-2" />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-medium">
                            {item.startDate} - {item.endDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
