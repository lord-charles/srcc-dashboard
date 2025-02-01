"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

// Payment Methods Chart
const paymentMethodConfig = {
  value: {
    label: "Count",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function PaymentMethodsChart({
  data,
}: {
  data: Array<{ name: string; value: number }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferred Payment Methods</CardTitle>
        <CardDescription>
          Distribution of payment method preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={paymentMethodConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart accessibilityLayer data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis axisLine={false} tickLine={false} />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value) => value.toString()}
                  />
                }
              />
              <Bar dataKey="value" radius={8}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Most preferred payment method:{" "}
          {
            data.reduce((prev, current) =>
              prev.value > current.value ? prev : current
            ).name
          }
        </div>
      </CardFooter>
    </Card>
  );
}

// Repayment Performance Chart
const repaymentConfig = {
  amount: {
    label: "Amount",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function RepaymentPerformanceChart({
  totalAdvanceAmount,
  totalRepaidAmount,
}: {
  totalAdvanceAmount: number;
  totalRepaidAmount: number;
}) {
  const data = [
    { name: "Advanced", amount: totalAdvanceAmount },
    { name: "Repaid", amount: totalRepaidAmount },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Repayment Performance</CardTitle>
        <CardDescription>Total advanced vs repaid amounts</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={repaymentConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart accessibilityLayer data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis axisLine={false} tickLine={false} />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value) => `KES ${value.toLocaleString()}`}
                  />
                }
              />
              <Bar dataKey="amount" radius={8}>
                <Cell fill="#0088FE" />
                <Cell fill="#00C49F" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Repayment rate:{" "}
          {((totalRepaidAmount / totalAdvanceAmount) * 100).toFixed(1)}%
        </div>
      </CardFooter>
    </Card>
  );
}
