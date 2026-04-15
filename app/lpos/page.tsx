import LposModule from "@/components/lpos/budget-table/lpos";
import DashboardProvider from "../dashboard-provider";
import { Header } from "@/components/header";
import { getAllLpos } from "@/services/lpo.service";
import { Lpo } from "@/types/lpo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LposPage() {
  const result = await getAllLpos();
  
  // Type safe data extraction
  const lpos: Lpo[] = (result.success && result.data) ? result.data : [];

  return (
    <DashboardProvider>
      <Header />
      <LposModule initialData={lpos} />
    </DashboardProvider>
  );
}
