"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AddTeamMemberDialog } from "./add-team-member-dialog";
import { AddAssistantPMDialog } from "./add-assistant-pm-dialog";
import { AddCoachDialog } from "./add-coach-dialog";
import { AddCoachManagerDialog } from "./add-coach-manager-dialog";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types/user";
import { updateProjectManager, getProject } from "@/services/projects-service";
import { useToast } from "@/hooks/use-toast";

interface AddToProjectHeaderProps {
  selectedUser: User | null;
}

export function AddToProjectHeader({ selectedUser }: AddToProjectHeaderProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [showAssistantPMDialog, setShowAssistantPMDialog] = useState(false);

  const projectId = searchParams.get("projectId");
  const projectName = searchParams.get("projectName");
  const returnUrl = searchParams.get("returnUrl");
  const isProjectManager = searchParams.get("isProjectManager") === "true";
  const isAssistantPM = searchParams.get("isAssistantPM") === "true";
  const isCoach = searchParams.get("isCoach") === "true";
  const isCoachManager = searchParams.get("isCoachManager") === "true";

  const [showCoachDialog, setShowCoachDialog] = useState(false);
  const [showCoachManagerDialog, setShowCoachManagerDialog] = useState(false);
  const [milestones, setMilestones] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      if (isCoach && projectId) {
        try {
          const proj = await getProject(projectId);
          setMilestones(proj?.milestones || []);
        } catch {}
      }
    };
    load();
  }, [isCoach, projectId]);

  const handleAddUser = async () => {
    if (!selectedUser || !projectId) return;

    try {
      if (isProjectManager) {
        await updateProjectManager(projectId, selectedUser._id);
        toast({
          title: "Success",
          description: "Project manager assigned successfully",
        });
        if (returnUrl) router.push(returnUrl);
      } else if (isAssistantPM) {
        setShowAssistantPMDialog(true);
      } else if (isCoachManager) {
        setShowCoachManagerDialog(true);
      } else if (isCoach) {
        setShowCoachDialog(true);
      } else {
        setShowDialog(true);
      }
    } catch (error) {
      console.error("Failed to update project manager:", error);
    }
  };

  const getActionText = () => {
    if (isProjectManager) return "Assign Project Manager";
    if (isAssistantPM) return "Add Assistant PM";
    if (isCoachManager) return "Add Coach Manager";
    if (isCoach) return "Add Coach";
    return "Add Members";
  };

  const getButtonText = () => {
    if (isProjectManager) return "Assign as Project Manager";
    if (isAssistantPM) return "Add as Assistant PM";
    if (isCoachManager) return "Add as Coach Manager";
    if (isCoach) return "Add as Coach";
    return "Add to Project";
  };

  const getDescription = () => {
    if (isProjectManager) return "assign them as project manager";
    if (isAssistantPM) return "add them as an assistant project manager";
    if (isCoachManager) return "add them as a coach manager";
    if (isCoach) return "add them as a coach to a milestone with a rate";
    return "add them to the project";
  };

  if (!projectId || !projectName) return null;

  return (
    <>
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => returnUrl && router.push(returnUrl)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Project
            </Button>
            <div>
              <h2 className="text-lg font-semibold">
                {getActionText()} to {projectName}
              </h2>
              <p className="text-sm text-gray-400">
                Select a user from the list below to {getDescription()}
              </p>
            </div>
          </div>
          {selectedUser && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 text-blue-700 rounded-full h-8 w-8 flex items-center justify-center font-semibold">
                  {selectedUser.firstName[0]}
                  {selectedUser.lastName[0]}
                </div>
                <Badge variant="secondary" className="text-sm">
                  {selectedUser.firstName} {selectedUser.lastName}
                </Badge>
              </div>
              <Button onClick={handleAddUser}>
                <UserPlus className="h-4 w-4 mr-2" />
                {getButtonText()}
              </Button>
            </div>
          )}
        </div>
      </Card>
      {!isProjectManager && !isAssistantPM && (
        <AddTeamMemberDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          projectId={projectId}
          projectName={projectName}
          user={selectedUser!}
          returnUrl={returnUrl || undefined}
        />
      )}
      {isCoachManager && selectedUser && (
        <AddCoachManagerDialog
          open={showCoachManagerDialog}
          onOpenChange={setShowCoachManagerDialog}
          projectId={projectId}
          user={selectedUser as any}
          returnUrl={returnUrl || undefined}
        />
      )}
      {isCoach && selectedUser && (
        <AddCoachDialog
          open={showCoachDialog}
          onOpenChange={setShowCoachDialog}
          projectId={projectId}
          milestones={milestones as any}
          user={selectedUser as any}
          returnUrl={returnUrl || undefined}
        />
      )}
      {isAssistantPM && selectedUser && (
        <AddAssistantPMDialog
          open={showAssistantPMDialog}
          onOpenChange={setShowAssistantPMDialog}
          projectId={projectId}
          projectName={projectName}
          user={selectedUser}
          returnUrl={returnUrl || undefined}
        />
      )}
    </>
  );
}
