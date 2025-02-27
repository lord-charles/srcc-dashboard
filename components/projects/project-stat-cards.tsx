import {
  Calendar,
  DollarSign,
  Users,
  AlertTriangle,
  FileText,
  Clock,
  Briefcase,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/types/project";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const calculateProgress = (start: string, end: string) => {
  const now = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);
  const total = endDate.getTime() - startDate.getTime();
  const elapsed = now.getTime() - startDate.getTime();
  return Math.min(Math.max(Math.round((elapsed / total) * 100), 0), 100);
};

const calculateTotalMilestoneBudget = (
  milestones: Array<{ budget: number }>
) => {
  return milestones.reduce((total, milestone) => total + milestone.budget, 0);
};

export function ProjectStatCards({ projectData }: { projectData: Project }) {
  const progress = calculateProgress(
    projectData.contractStartDate,
    projectData.contractEndDate
  );
  const totalMilestoneBudget = calculateTotalMilestoneBudget(
    projectData.milestones
  );
  const budgetUtilization =
    (projectData.amountSpent / projectData.totalBudget) * 100;
  const projectValueProgress =
    (projectData.amountSpent / projectData.totalProjectValue) * 100;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Project Overview
          </CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{projectData.name}</div>
          <p className="text-xs text-muted-foreground mt-2">
            Client: {projectData.client}
          </p>
          <div className="mt-2">
            <Badge
              variant={
                projectData.status === "active" ? "default" : "secondary"
              }
            >
              {projectData.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Project Timeline
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{progress}%</div>
          <Progress value={progress} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {formatDate(projectData.contractStartDate)} -{" "}
            {formatDate(projectData.contractEndDate)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Budget Overview</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(projectData.amountSpent, projectData.currency)}
          </div>
          <Progress value={budgetUtilization} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            of{" "}
            {formatCurrency(
              (projectData.budgetId.totalInternalBudget || 0) +
                (projectData.budgetId.totalExternalBudget || 0),
              projectData.currency
            )}{" "}
            total budget
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Milestones & Invoices
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {projectData.milestones.filter((m) => m.completed).length}/
            {projectData.milestones.length}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Milestones completed
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Milestone Budget:{" "}
            {formatCurrency(totalMilestoneBudget, projectData.currency)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Invoices: {projectData.invoices.length} (
            {
              projectData.invoices.filter(
                (i) => i.status === "pending_approval"
              ).length
            }{" "}
            pending)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Team & Risk</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {projectData.teamMembers.length}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Team members</p>
          <div className="mt-2 flex items-center">
            <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
            <span className="text-sm font-medium">
              Risk Level: {projectData.riskLevel}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Project Details</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium">
            Procurement: {projectData.procurementMethod}
          </p>
          <p className="text-xs text-muted-foreground mt-2">Key Documents:</p>
          <ul className="text-xs text-muted-foreground mt-1 list-disc list-inside">
            <li>Project Proposal</li>
            <li>Signed Contract</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
