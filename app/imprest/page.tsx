import DashboardProvider from "../dashboard-provider";
import { Header } from "@/components/header";
import ImprestModule from "@/components/imprest/imprest";
import { getAllImprests } from "@/services/imprest.service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ImprestPage() {
  const initialData = await getAllImprests();
  return (
    <DashboardProvider>
      <Header />
      <ImprestModule initialData={initialData} />
    </DashboardProvider>
  );
}
