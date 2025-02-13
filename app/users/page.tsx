import { Header } from "@/components/header";
import { Suspense } from "react";
import DashboardProvider from "../dashboard-provider";
import { getAllEmployees } from "@/services/employees.service";
import EmployeeModule from "@/components/users/employees";

// Disable caching for this page
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EmployeesPage() {
  const employeesData = await getAllEmployees();

  return (
    <DashboardProvider>
      <Header />
      <Suspense fallback={<div>Loading employees...</div>}>
        <EmployeeModule initialData={employeesData} />
      </Suspense>
    </DashboardProvider>
  );
}
