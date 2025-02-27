"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AddTeamMemberDialog } from "./add-team-member-dialog";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types/user";
import { updateProjectManager } from "@/services/projects-service";
import { useToast } from "@/hooks/use-toast";

interface AddToProjectHeaderProps {
  selectedUser: User | null;
}

export function AddToProjectHeader({ selectedUser }: AddToProjectHeaderProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);

  const projectId = searchParams.get("projectId");
  const projectName = searchParams.get("projectName");
  const returnUrl = searchParams.get("returnUrl");
  const isProjectManager = searchParams.get("isProjectManager") === "true";

  if (!projectId || !projectName) return null;

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
      } else {
        setShowDialog(true);
      }
    } catch (error) {
      console.error("Failed to update project manager:", error);
    }
  };

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
                {isProjectManager ? "Assign Project Manager" : "Add Members"} to{" "}
                {projectName}
              </h2>
              <p className="text-sm text-gray-400">
                Select a user from the list below to{" "}
                {isProjectManager
                  ? "assign them as project manager"
                  : "add them to the project"}
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
                {isProjectManager
                  ? "Assign as Project Manager"
                  : "Add to Project"}
              </Button>
            </div>
          )}
        </div>
      </Card>
      {!isProjectManager && (
        <AddTeamMemberDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          projectId={projectId}
          projectName={projectName}
          user={selectedUser!}
          returnUrl={returnUrl || undefined}
        />
      )}
    </>
  );
}
