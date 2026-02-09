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
} from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditMilestoneDialog } from "../edit-milestone-dialog";
import { deleteMilestone } from "@/services/projects-service";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Project, ProjectMilestone } from "@/types/project";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingMilestone, setDeletingMilestone] = useState<
    ProjectMilestone | undefined
  >();
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
    setIsDialogOpen(true);
  };

  const handleEditMilestone = (milestone: ProjectMilestone) => {
    setEditMilestone(milestone);
    setIsDialogOpen(true);
  };

  const handleDeleteMilestone = async (milestone: ProjectMilestone) => {
    try {
      await deleteMilestone(projectId, milestone._id);
      toast({
        title: "Success",
        description: "Milestone deleted successfully",
      });
      // Delay reload to ensure dialog closes first
      setTimeout(() => window.location.reload(), 100);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete milestone",
        variant: "destructive",
      });
    }
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
                      <h4 className="font-semibold">{milestone.title}</h4>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEditMilestone(milestone)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => setDeletingMilestone(milestone)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-3 gap-4 p-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(milestone.dueDate)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
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
                  <div className="flex items-center space-x-2">
                    <MilestoneIcon className="h-4 w-4 text-muted-foreground" />
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
                      % of total budget
                    </span>
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

      <EditMilestoneDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        projectId={projectId}
        milestone={editMilestone}
      />

      <AlertDialog
        open={!!deletingMilestone}
        onOpenChange={() => setDeletingMilestone(undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Milestone</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this milestone? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deletingMilestone) {
                  handleDeleteMilestone(deletingMilestone);
                  setDeletingMilestone(undefined);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MilestonesSection;
