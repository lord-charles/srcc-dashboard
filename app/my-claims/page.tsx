
import { ClaimingInfo } from "./claims/claiming-info"
import { getMyClaims } from "@/services/claims.service";
import { ClaimsStatCards } from "./claims/stat-cards";
import { ClaimsTable } from "./claims/claims-table";
import DashboardProvider from "../dashboard-provider";
import { Header } from "@/components/header";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MyClaimsPage() {
  const initialData = await getMyClaims();
  return (
    <DashboardProvider>
      <Header />

      <div className="space-y-4 p-2">

        <ClaimingInfo />

        <ClaimsStatCards claims={initialData} />

        <ClaimsTable claims={initialData} />
      </div>
    </DashboardProvider>
  )
}