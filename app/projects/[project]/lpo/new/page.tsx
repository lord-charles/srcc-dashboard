import DashboardProvider from "@/app/dashboard-provider";
import { Header } from "@/components/header";
import { LpoForm } from "@/components/projects/sections/lpo-form";
import { getProjectById } from "@/services/projects-service";
import { handleUnauthorized } from "@/services/dashboard.service";

export const dynamic = "force-dynamic";

export default async function NewLpoPage({
  params,
}: {
  params: Promise<{ project: string }>;
}) {
  const { project: projectId } = await params;

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

    return (
      <DashboardProvider>
        <Header />
        <div className="py-4">
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
