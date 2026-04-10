import { Header } from "@/components/header";
import DashboardProvider from "../../dashboard-provider";
import { SupplierRegistrationComponent } from "@/components/suppliers/supplier-registration";

// Disable caching for this page
export const dynamic = "force-dynamic";

export default function NewSupplierPage() {
  return (
    <DashboardProvider>
      <SupplierRegistrationComponent />
    </DashboardProvider>
  );
}
