import DashboardProvider from "@/app/dashboard-provider";
import { ContractRegistrationForm } from "@/components/contracts/new-contract";
import React from "react";

const page = () => {
  return (
    <DashboardProvider>
      <ContractRegistrationForm />
    </DashboardProvider>
  );
};

export default page;
