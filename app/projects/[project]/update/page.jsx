import DashboardProvider from "@/app/dashboard-provider";
import { Header } from "@/components/header";
import { getEmployeeById } from "@/services/employees.service";
import React from "react";

async function Page({ params }) {
  const resolvedParams = await params;
  const employeeId = resolvedParams.employee;

  if (!employeeId) {
    return (
      <DashboardProvider>
        <Header />
        <div className="flex items-center justify-center h-screen">
          <p className="text-xl text-gray-600">Invalid employee parameter</p>
        </div>
      </DashboardProvider>
    );
  }

  const employee = await getEmployeeById(employeeId);

  if (!employee) {
    return (
      <DashboardProvider>
        <Header />
        <div className="flex items-center justify-center h-screen">
          <p className="text-xl text-gray-600">
            Employee not found or has incomplete details
          </p>
        </div>
      </DashboardProvider>
    );
  }

  return (
    <DashboardProvider>
      <Header />
      <UpdateProjectComponent project={employee} />
    </DashboardProvider>
  );
}

export default Page;
