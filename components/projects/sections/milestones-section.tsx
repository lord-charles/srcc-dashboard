"use client";

import { useState } from "react";
import type React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  MilestoneIcon,
  Pencil,
  AlertTriangle,
} from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { MilestoneDrawer } from "../milestone-drawer";
import { Project, ProjectMilestone } from "@/types/project";
import { useToast } from "@/hooks/use-toast";

interface MilestonesSectionProps {
  milestones: ProjectMilestone[];
  currency: string;
  projectId: string;
  projectData: Project;
}

export const MilestonesSection: React.FC<MilestonesSectionProps> = ({
  milestones,
  currency,
  projectId,
  projectData,
}) => {
  const [editMilestone, setEditMilestone] = useState<
    ProjectMilestone | undefined
  >();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency || "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return "Invalid date";
      return format(date, "MMM d, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  const getMilestoneStatusColor = (completed: boolean) => {
    return completed ? "bg-green-500 text-white" : "bg-yellow-500 text-white";
  };

  const handleAddMilestone = () => {
    setEditMilestone(undefined);
    setIsDrawerOpen(true);
  };

  const handleEditMilestone = (milestone: ProjectMilestone) => {
    setEditMilestone(milestone);
    setIsDrawerOpen(true);
  };

  const totalMilestoneBudget = milestones.reduce(
    (sum, milestone) => sum + (milestone.budget || 0),
    0,
  );
  const completedMilestones = milestones.filter((m) => m.completed).length;
  const progressPercentage =
    milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0;

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">
            Project Milestones
          </CardTitle>
          <Button variant="outline" onClick={handleAddMilestone}>
            Add Milestone
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm font-medium">
                {isNaN(progressPercentage)
                  ? "0"
                  : progressPercentage.toFixed(0)}
                %
              </span>
            </div>
            <Progress
              value={isNaN(progressPercentage) ? 0 : progressPercentage}
              className="h-2"
            />
          </div>
          <div className="flex justify-between items-center mb-4 text-sm">
            <div>
              <span className="font-medium">Total Milestones:</span>{" "}
              {milestones.length}
            </div>
            <div>
              <span className="font-medium">Completed:</span>{" "}
              {completedMilestones}
            </div>
            <div>
              <span className="font-medium">Budget Allocated:</span>{" "}
              {formatCurrency(totalMilestoneBudget)}
            </div>
          </div>
          <Separator className="my-4" />
          <div className="space-y-4">
            {milestones.map((milestone) => (
              <Card key={milestone._id} className="overflow-hidden">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-2 rounded-full ${getMilestoneStatusColor(
                        milestone.completed,
                      )}`}
                    >
                      {milestone.completed ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Clock className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{milestone.title}</h4>
                        {(!milestone.percentage || !milestone.startDate) && (
                          <Badge
                            variant="destructive"
                            className="h-5 gap-1 px-2 text-[10px] uppercase tracking-wider"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            Missing Info
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={milestone.completed ? "default" : "secondary"}
                    >
                      {milestone.completed ? "Completed" : "In Progress"}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEditMilestone(milestone)}
                      className="hover:text-primary transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-muted-foreground leading-none mb-1">
                        Timeline
                      </span>
                      <span>
                        {milestone.startDate
                          ? formatDate(milestone.startDate)
                          : "N/A"}{" "}
                        - {formatDate(milestone.dueDate)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-muted-foreground leading-none mb-1">
                        Budget
                      </span>
                      <span>
                        {formatCurrency(milestone.budget)}
                        {milestone.actualCost && (
                          <span className="text-muted-foreground">
                            {" "}
                            / {formatCurrency(milestone.actualCost)}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MilestoneIcon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-muted-foreground leading-none mb-1">
                        Project Weight
                      </span>
                      <span className="font-medium text-primary">
                        {milestone.percentage
                          ? `${milestone.percentage}%`
                          : "Not set"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-1 bg-muted-foreground/20 rounded-full" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-muted-foreground leading-none mb-1">
                        Budget Ratio
                      </span>
                      <span>
                        {(() => {
                          const totalBudget =
                            projectData?.budgetId?.totalExternalBudget || 0;
                          const percentage =
                            totalBudget > 0
                              ? ((milestone?.budget || 0) / totalBudget) * 100
                              : 0;
                          return isNaN(percentage)
                            ? "0.0"
                            : percentage.toFixed(1);
                        })()}
                        % of budget
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {milestones.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No milestones have been set yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <MilestoneDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        projectId={projectId}
        milestone={editMilestone}
      />
    </>
  );
};

export default MilestonesSection;
