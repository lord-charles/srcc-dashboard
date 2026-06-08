import DashboardProvider from "@/app/dashboard-provider";
import { Header } from "@/components/header";
import { DispatchLpoForm } from "@/components/projects/sections/dispatch-lpo-form";
import { getProjectById } from "@/services/projects-service";
import { getLpoById } from "@/services/lpo.service";
import { handleUnauthorized } from "@/services/dashboard.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DispatchLpoPage({
  params,
}: {
  params: Promise<{ project: string; lpoId: string }>;
}) {
  const { project: projectId, lpoId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  try {
    const projectResult = await getProjectById(projectId);
    const lpoResult = await getLpoById(lpoId);

    if (!projectResult.success || !projectResult.data || !lpoResult.success || !lpoResult.data) {
      return (
        <DashboardProvider>
          <Header />
          <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
            <h1 className="text-2xl font-bold text-gray-800">
              LPO or Project Not Found
            </h1>
            <p className="text-gray-600">
              The LPO document or associated project you are trying to view does not exist.
            </p>
          </div>
        </DashboardProvider>
      );
    }

    const project = projectResult.data;
    const lpo = lpoResult.data;

    return (
      <DashboardProvider>
        <Header />
          <DispatchLpoForm lpo={lpo} projectId={project._id} projectCurrency={project.currency} />
      </DashboardProvider>
    );
  } catch (error) {
    console.error("Failed to load LPO details for dispatch:", error);
    await handleUnauthorized();
    return null;
  }
}
