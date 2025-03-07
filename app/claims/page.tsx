import ClaimsModule from "@/components/claims/claims";
import DashboardProvider from "../dashboard-provider";
import { Header } from "@/components/header";
import { getAllClaims } from "@/services/contracts.service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ClaimsPage() {
  const initialData = await getAllClaims();
  return (
    <DashboardProvider>
      <Header />
      <ClaimsModule initialData={initialData} />
    </DashboardProvider>
  );
}
