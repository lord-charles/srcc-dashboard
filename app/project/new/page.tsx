import DashboardProvider from "@/app/dashboard-provider";
import { NewProjectComponent } from "@/components/projects/project-registration";
import React from "react";

const page = () => {
  return (
    <DashboardProvider>
      <NewProjectComponent />
    </DashboardProvider>
  );
};

export default page;
