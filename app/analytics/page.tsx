import { Header } from "../../components/header";
import DashboardProvider from "../dashboard-provider";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { BarChart3, Bell, LineChart, PieChart } from "lucide-react"
import Link from "next/link"


export default async function DashboardPage() {
  // const [
  //   dashboardStats,
  //   overViewCharts,
  //   detailedStats,
  //   monthlyTrends,
  //   recentAdvancesStats,
  //   recentAdvances,
  //   systemLogs,
  // ] = await Promise.all([
  //   getDashboardStats(),
  //   getOverviewCharts(),
  //   getDetailedStats(),
  //   getMonthlyTrends(),
  //   getRecentAdvanceStats(),
  //   getRecentAdvances(),
  //   getSystemLogs(),
  // ]);

  return (
    <DashboardProvider>
      <Header />


    <div className="flex min-h-[80vh] w-full items-center justify-center p-4 md:p-8">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold">Analytics Dashboard Coming Soon</CardTitle>
          <CardDescription className="text-base mt-2">
            We&lsquo;re building a powerful analytics platform to help you track and visualize your data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
              <LineChart className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium">Performance Metrics</h3>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
              <PieChart className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium">Data Visualization</h3>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
              <Bell className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium">Custom Alerts</h3>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-medium mb-4">Get notified when we launch</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input type="email" placeholder="Enter your email" className="flex-1" />
              <Button>Notify Me</Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">Expected launch: Q2 2025</p>
          <Link href="/">
            <Button variant="outline">Return to Dashboard</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>



    </DashboardProvider>
  );
}
