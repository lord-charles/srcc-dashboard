import DashboardProvider from "@/app/dashboard-provider";
import { Header } from "@/components/header";
import { LpoForm } from "@/components/projects/sections/lpo-form";
import { getProjectById } from "@/services/projects-service";
import { handleUnauthorized } from "@/services/dashboard.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewLpoPage({
  params,
}: {
  params: Promise<{ project: string }>;
}) {
  const { project: projectId } = await params;
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
          <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Project Not Found
            </h1>
            <p className="text-gray-600">
              The project you are trying to create an LPO for does not exist.
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
        (apm: any) => (apm?.userId?._id || apm?.userId || apm) === userId
      );

      const isCoachManager = project.coachManagers?.some(
        (cm: any) => (cm?.userId?._id || cm?.userId || cm) === userId
      );

      const isCoachAssistant = project.coachAssistants?.some(
        (ca: any) => (ca?.userId?._id || ca?.userId || ca) === userId
      );

      if (!isPm && !isAssistantPm && !isCoachManager && !isCoachAssistant) {
        redirect("/unauthorized");
      }
    }

    return (
      <DashboardProvider>
        <Header />
        <div className="p-4">
          <LpoForm projectId={project._id} projectCurrency={project.currency} />
        </div>
      </DashboardProvider>
    );
  } catch (error) {
    console.error("Failed to fetch project details:", error);
    await handleUnauthorized();
    return null;
  }
}
