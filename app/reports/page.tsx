import DashboardProvider from "../dashboard-provider";
import { Header } from "@/components/header";

export default function Reports() {
  return (
    <DashboardProvider>
      <Header />
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Coming soon</h3>
        </div>
      </div>
    </DashboardProvider>
  );
}
