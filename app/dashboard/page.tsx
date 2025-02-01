import DashboardComponent from "@/components/dashboard/dashboard";
import { Header } from "../../components/header";
import DashboardProvider from "../dashboard-provider";
import {
  getDashboardStats,
  getOverviewCharts,
  getDetailedStats,
  getMonthlyTrends,
  getRecentAdvanceStats,
  getRecentAdvances,
  getSystemLogs,
} from "@/services/dashboard.service";

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
      {/* <DashboardComponent
        stats={dashboardStats}
        overViewCharts={overViewCharts}
        detailedStats={detailedStats}
        monthlyTrends={monthlyTrends}
        recentAdvancesStats={recentAdvancesStats}
        recentAdvances={recentAdvances}
        systemLogs={systemLogs}
      /> */}
    </DashboardProvider>
  );
}
