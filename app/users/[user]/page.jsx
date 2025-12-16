import DashboardProvider from "@/app/dashboard-provider";
import { Header } from "@/components/header";
import { getEmployeeById } from "@/services/employees.service";
import React from "react";
import EmployeeDetailsPage from "@/components/users/employee-details";



async function Page({ params }) {
  const userId = params.user; // Extract the employee ID from the params
  try {
    const employee = await getEmployeeById(userId); // Fetch employee details

    if (!employee) {
      return (
        <DashboardProvider>
          <Header />
          <div className="flex items-center justify-center h-screen">
            <p className="text-xl text-gray-600">
              User not found or has incomplete details
            </p>
          </div>
        </DashboardProvider>
      );
    }

    return (
      <DashboardProvider>
        <Header />
        <EmployeeDetailsPage employee={employee} />
      </DashboardProvider>
    );
  } catch (error) {
    // Handle any potential errors from the fetch operation
    return (
      <DashboardProvider>
        <Header />
        <div className="flex items-center justify-center h-screen">
          <p className="text-xl text-red-600">
            Something went wrong while fetching the employee details.
          </p>
        </div>
      </DashboardProvider>
    );
  }
}

export default Page;
