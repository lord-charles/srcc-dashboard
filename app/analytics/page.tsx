import { Header } from "../../components/header";
import DashboardProvider from "../dashboard-provider";
;

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
      <div>coming soon</div>
    </DashboardProvider>
  );
}
