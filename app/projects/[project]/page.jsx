import DashboardProvider from "@/app/dashboard-provider";
import { Header } from "@/components/header";
import ProjectDetails from "@/components/projects/project-details";
import { handleUnauthorized } from "@/services/dashboard.service";
import { getProjectById } from "@/services/projects-service";
import { redirect } from "next/navigation";
import React from "react";




async function Page({ params }) {
  const projectId = await params.project;

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
    await handleUnauthorized();
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
