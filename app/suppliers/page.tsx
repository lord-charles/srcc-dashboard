import { Header } from "@/components/header";
import { Suspense } from "react";
import DashboardProvider from "../dashboard-provider";
import { getSuppliers } from "@/services/suppliers.service";
import SuppliersModule from "@/components/suppliers/suppliers";

// Disable caching for this page
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SuppliersPage() {
  const suppliersData = await getSuppliers();
  return (
    <DashboardProvider>
      <Header />
      <Suspense fallback={<div>Loading suppliers...</div>}>
        <SuppliersModule initialData={suppliersData?.data || []} />
      </Suspense>
    </DashboardProvider>
  );
}
