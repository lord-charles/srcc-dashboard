import DashboardProvider from "@/app/dashboard-provider";
import { Header } from "@/components/header";
import ProjectDetails from "@/components/projects/project-details";
import { getProjectById } from "@/services/projects-service";
import React from "react";




async function Page({ params }) {
  const projectId = params.project;

  try {
    const project = await getProjectById(projectId);

    if (!project) {
      return (
        <DashboardProvider>
          <Header />
          <div className="flex items-center justify-center h-screen">
            <p className="text-xl text-gray-600">
              Project not found or has incomplete details
            </p>
          </div>
        </DashboardProvider>
      );
    }

    return (
      <DashboardProvider>
        <Header />
        <ProjectDetails project={project} />
      </DashboardProvider>
    );
  } catch (error) {
    console.error("Failed to fetch project details:", error);
    return (
      <DashboardProvider>
        <Header />
        <div className="flex items-center justify-center h-screen">
          <p className="text-xl text-red-600">
            Something went wrong while fetching the project details.
          </p>
        </div>
      </DashboardProvider>
    );
  }
}

export default Page;
