import DashboardProvider from "@/app/dashboard-provider";
import { Header } from "@/components/header";
import ImprestDashboard from "@/components/imprest/imprest-dashboard";
import { getMyImprests } from "@/services/imprest.service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ImprestPage() {
  const initialData = await getMyImprests();
  return (
    <DashboardProvider>
      <Header />
      <ImprestDashboard initialData={initialData} />
    </DashboardProvider>
  );
}
