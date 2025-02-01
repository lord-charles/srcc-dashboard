"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { DashboardStatCards } from "./statcards";
import { RecentAdvances } from "./recent-advances";
import { SystemLogs } from "./system-logs";
import { AdvanceApplicationsChart } from "./advance-applications-chart";
import { MonthlyTrendsChart } from "./monthly-trends-chart";
import { PaymentMethodsChart, RepaymentPerformanceChart } from "./charts";
import {
  ChartDataResponse,
  DashboardStats,
  RecentAdvanceStats,
  DetailedStats,
  MonthlyTrends,
  SystemLog,
} from "@/types/dashboard";
import { PaginatedAdvances } from "@/types/advance";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const DashboardComponent = ({
  stats,
  overViewCharts,
  detailedStats,
  monthlyTrends,
  recentAdvancesStats,
  recentAdvances,
  systemLogs,
}: {
  stats: DashboardStats;
  overViewCharts: ChartDataResponse;
  detailedStats: DetailedStats;
  monthlyTrends: MonthlyTrends[];
  recentAdvancesStats: RecentAdvanceStats;
  recentAdvances: PaginatedAdvances;
  systemLogs: SystemLog[];
}) => {
  return (
    <div className=" p-4 space-y-6  min-h-screen">
      <DashboardStatCards stats={stats} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Stats</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="recent">Recent Advances</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-[400px]">
              <AdvanceApplicationsChart data={overViewCharts.lineChart} />
            </div>
            <Card>
              <CardHeader className="border-b pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Advance Status Distribution</CardTitle>
                  <CardDescription>
                    Current status of all advances
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    Total Applications
                  </p>
                  <p className="text-2xl font-bold">
                    {overViewCharts.pieChart.reduce(
                      (acc, curr) => acc + curr.value,
                      0
                    )}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="h-[348px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={overViewCharts.pieChart}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {overViewCharts.pieChart.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="detailed" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PaymentMethodsChart data={detailedStats.paymentMethods} />

            <RepaymentPerformanceChart
              totalAdvanceAmount={detailedStats.totals.totalAdvanceAmount}
              totalRepaidAmount={detailedStats.totals.totalRepaidAmount}
            />
          </div>
        </TabsContent>
        <TabsContent value="trends" className="space-y-4">
          <div className="col-span-1 md:col-span-2">
            <MonthlyTrendsChart monthlyTrends={monthlyTrends} />
          </div>
        </TabsContent>
        <TabsContent value="recent" className="space-y-4">
          <RecentAdvances
            recentAdvancesStats={recentAdvancesStats}
            recentAdvances={recentAdvances}
          />
        </TabsContent>
      </Tabs>

      <SystemLogs systemLogs={systemLogs} />
    </div>
  );
};

export default DashboardComponent;
