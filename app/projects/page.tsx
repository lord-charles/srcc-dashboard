import { Header } from "@/components/header";
import { Suspense } from "react";
import DashboardProvider from "../dashboard-provider";
import { getAllEmployees } from "@/services/employees.service";
import ProjectsModule from "@/components/projects/projects";

// Disable caching for this page
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProjectsPage() {
  // const employeesData = await getAllEmployees();

  return (
    <DashboardProvider>
      <Header />
      <Suspense fallback={<div>Loading projects...</div>}>
        <ProjectsModule />
      </Suspense>
    </DashboardProvider>
  );
}
