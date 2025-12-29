import { Header } from "@/components/header";
import { Suspense } from "react";
import DashboardProvider from "../dashboard-provider";
import { getAllEmployees } from "@/services/employees.service";
import EmployeeModule from "@/components/users/employees";
import { getAllOrganizations } from "@/services/organization.service";

// Disable caching for this page
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EmployeesPage() {
  const [employeesData, organizationsData] = await Promise.all([
    getAllEmployees(),
    getAllOrganizations()
  ]);

  return (
    <DashboardProvider>
      <Header />


      <Suspense fallback={<div>Loading consultants...</div>}>
        <EmployeeModule
          initialData={employeesData}
          organizations={organizationsData}
        />
      </Suspense>
    </DashboardProvider>
  );
}
