import { Header } from "@/components/header";
import DashboardProvider from "../../../dashboard-provider";
import { SupplierRegistrationComponent } from "@/components/suppliers/supplier-registration";
import { getSupplierById } from "@/services/suppliers.service";

export const dynamic = "force-dynamic";

export default async function EditSupplierPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const result = await getSupplierById(id);

  if (!result.success || !result.data) {
    return <div>Supplier not found or error loading supplier</div>;
  }

  const supplierData = result.data;

  return (
    <DashboardProvider>
      <SupplierRegistrationComponent initialData={supplierData} isEditing={true} />
    </DashboardProvider>
  );
}
