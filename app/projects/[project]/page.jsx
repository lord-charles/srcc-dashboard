import DashboardProvider from "@/app/dashboard-provider";
import { Header } from "@/components/header";
import ProjectDetails from "@/components/projects/project-details";
import { handleUnauthorized } from "@/services/dashboard.service";
import { getProjectById } from "@/services/projects-service";
import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

async function Page({ params }) {
  const projectId = await params.project;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  try {
    const result = await getProjectById(projectId);

    if (!result.success || !result.data) {
      return (
        <DashboardProvider>
          <Header />
          <div className="flex items-center justify-center h-screen">
            <p className="text-xl text-gray-600">
              Project not found: {result.error || "incomplete details"}
            </p>
          </div>
        </DashboardProvider>
      );
    }

    const project = result.data;
    const userId = session.user.id;
    const roles = session.user.roles || [];

    const hasAdminAccess = roles.some(
      (r) => r === "admin" || r === "super_admin"
    );

    if (!hasAdminAccess) {
      const pmId = project.projectManagerId?._id || project.projectManagerId;
      const isPm = pmId === userId;

      const isAssistantPm = project.assistantProjectManagers?.some(
        (apm) => (apm?.userId?._id || apm?.userId || apm) === userId
      );

      const isCoachManager = project.coachManagers?.some(
        (cm) => (cm?.userId?._id || cm?.userId || cm) === userId
      );

      const isCoachAssistant = project.coachAssistants?.some(
        (ca) => (ca?.userId?._id || ca?.userId || ca) === userId
      );

      if (!isPm && !isAssistantPm && !isCoachManager && !isCoachAssistant) {
        redirect("/unauthorized");
      }
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
