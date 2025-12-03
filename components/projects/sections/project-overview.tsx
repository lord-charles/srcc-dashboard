import {
  BarChart,
  Calendar,
  Users,
  AlertTriangle,
  Briefcase,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ProjectData {
  _id: string;
  name: string;
  description: string;
  totalBudget: number;
  totalProjectValue: number;
  currency: string;
  contractStartDate: string;
  contractEndDate: string;
  client: string;
  status: string;
  projectManagerId?: { firstName: string; lastName: string };
  teamMembers: Array<any>;
  riskLevel: string;
  amountSpent: number;
  milestones: Array<{ completed: boolean }>;
  procurementMethod: string;
}

interface ProjectOverviewProps {
  projectData: ProjectData;
}

const calculateProgress = (start: string, end: string) => {
  const now = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);
  const total = endDate.getTime() - startDate.getTime();
  const elapsed = now.getTime() - startDate.getTime();
  return Math.min(Math.max(Math.round((elapsed / total) * 100), 0), 100);
};

export default function ProjectOverview({ projectData }: ProjectOverviewProps) {
  const router = useRouter();
  const progress = calculateProgress(
    projectData.contractStartDate,
    projectData.contractEndDate
  );
  const budgetUtilization =
    projectData.totalBudget > 0
      ? (projectData.amountSpent / projectData.totalBudget) * 100
      : 0;
  const milestoneCompletion =
    projectData.milestones.length > 0
      ? (projectData.milestones.filter((m) => m.completed).length /
          projectData.milestones.length) *
        100
      : 0;

  return (
    <div className="space-y-2">
      <Card>
        <div className="pb-3 px-4 pt-5">
          <CardTitle>Project Details</CardTitle>
        </div>
        <div className="p-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="flex items-center space-x-2 p-4">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Client</p>
                <p className="text-sm text-muted-foreground">
                  {projectData.client}
                </p>
              </div>
            </Card>

            <Card className="flex items-center space-x-2 p-4">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div className="flex items-center justify-between flex-1">
                <div>
                  <p className="text-sm font-medium">Project Manager</p>
                  <p className="text-sm text-muted-foreground">
                    {projectData.projectManagerId
                      ? `${projectData.projectManagerId.firstName} ${projectData.projectManagerId.lastName}`
                      : "Not assigned"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => {
                    const params = new URLSearchParams({
                      projectId: projectData._id,
                      projectName: projectData.name,
                      returnUrl: `${window.location.pathname}`,
                      isProjectManager: "true",
                    });
                    router.push(`/users?${params.toString()}`);
                  }}
                >
                  <UserPlus className="h-4 w-4" />
                  {projectData.projectManagerId ? "Change" : "Assign"}
                </Button>
              </div>
            </Card>

            <Card className="flex items-center space-x-2 p-4">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Procurement Method</p>
                <p className="text-sm text-muted-foreground">
                  {projectData.procurementMethod}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center">
              <BarChart className="h-5 w-5 text-muted-foreground mr-2" />
              <div className="flex-grow">
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span>Overall Progress</span>
                  <span>
                    {isNaN(
                      (progress + budgetUtilization + milestoneCompletion) / 3
                    )
                      ? "0.0"
                      : (
                          (progress + budgetUtilization + milestoneCompletion) /
                          3
                        ).toFixed(1)}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    isNaN(
                      (progress + budgetUtilization + milestoneCompletion) / 3
                    )
                      ? 0
                      : (progress + budgetUtilization + milestoneCompletion) / 3
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium">Timeline</p>
                <p className="text-muted-foreground">
                  {isNaN(progress) ? "0" : progress}% completed
                </p>
              </div>
              <div>
                <p className="font-medium">Budget</p>
                <p className="text-muted-foreground">
                  {isNaN(budgetUtilization)
                    ? "0.0"
                    : budgetUtilization.toFixed(1)}
                  % utilized
                </p>
              </div>
              <div>
                <p className="font-medium">Milestones</p>
                <p className="text-muted-foreground">
                  {isNaN(milestoneCompletion)
                    ? "0.0"
                    : milestoneCompletion.toFixed(1)}
                  % completed
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
