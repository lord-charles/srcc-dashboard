"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMonthlyTrends } from "@/services/dashboard.service";
import { useState, useEffect } from "react";
import { MonthlyTrends } from "@/types/dashboard";

const chartConfig = {
  trends: {
    label: "Monthly Trends",
  },
  totalRequests: {
    label: "Total Requests",
    color: "hsl(var(--chart-1))",
  },
  approvedRequests: {
    label: "Approved Requests",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

interface MonthlyTrendsChartProps {
  monthlyTrends: MonthlyTrends[];
}

export function MonthlyTrendsChart({ monthlyTrends }: MonthlyTrendsChartProps) {
  const [timeRange, setTimeRange] = useState("6m");
  const [monthlyTrendsData, setMonthlyTrendsData] = useState<MonthlyTrends[]>(
    []
  );
  useEffect(() => {
    const fetchData = async () => {
      const months = timeRange === "6m" ? 6 : 12;
      const data = await getMonthlyTrends(months);
      setMonthlyTrendsData(data);
    };

    fetchData();
  }, [timeRange]);

  const totals = React.useMemo(
    () => ({
      requests: monthlyTrendsData.reduce(
        (acc, curr) => acc + curr.totalRequests,
        0
      ),
      approvals: monthlyTrendsData.reduce(
        (acc, curr) => acc + curr.approvedRequests,
        0
      ),
    }),
    [monthlyTrendsData]
  );

  const averageApprovalRate = React.useMemo(
    () => Math.round((totals.approvals / totals.requests) * 100),
    [totals]
  );

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b pb-3 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Monthly Trends</CardTitle>
          <CardDescription>
            Advance requests and approvals over time
          </CardDescription>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Avg. Approval Rate</p>
          <p className="text-2xl font-bold">{averageApprovalRate}%</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select time range"
          >
            <SelectValue placeholder="Last 6 months" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6m">Last 6 months</SelectItem>
            <SelectItem value="12m">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[348px] w-full"
        >
          <AreaChart data={monthlyTrendsData}>
            <defs>
              <linearGradient id="fillRequests" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillApproved" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-2))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-2))"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  year: "2-digit",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[200px]"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    });
                  }}
                  formatter={(value) => value.toString()}
                />
              }
            />
            <Area
              dataKey="approvedRequests"
              type="monotone"
              fill="url(#fillApproved)"
              stroke="hsl(var(--chart-2))"
              stackId="1"
            />
            <Area
              dataKey="totalRequests"
              type="monotone"
              fill="url(#fillRequests)"
              stroke="hsl(var(--chart-1))"
              stackId="2"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
