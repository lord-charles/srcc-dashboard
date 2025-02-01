import DashboardProvider from "@/app/dashboard-provider";
import EmployeeDetailsPage from "@/components/employee/employee-details";
import { Header } from "@/components/header";
import { getEmployeeById } from "@/services/employees.service";
import React from "react";



async function Page({ params }) {
  // const employeeId = params.employee;

  try {
    // const employee = await getEmployeeById(employeeId); // Fetch employee details

    // if (!employee) {
    //   return (
    //     <DashboardProvider>
    //       <Header />
    //       <div className="flex items-center justify-center h-screen">
    //         <p className="text-xl text-gray-600">
    //           Employee not found or has incomplete details
    //         </p>
    //       </div>
    //     </DashboardProvider>
    //   );
    // }

    return (
      <DashboardProvider>
        <Header />
        {/* <EmployeeDetailsPage employee={employee} /> */}
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
