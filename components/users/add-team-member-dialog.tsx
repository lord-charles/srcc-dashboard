"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  addTeamMember,
  addTeamMemberToMilestone,
} from "@/services/projects-service";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProjectMilestone } from "@/types/project";

interface AddTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName?: string;
  milestones?: ProjectMilestone[];
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  returnUrl?: string;
}

export function AddTeamMemberDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  milestones = [],
  user,
  returnUrl,
}: AddTeamMemberDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
  );
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>("");
  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [respInput, setRespInput] = useState("");

  const handleAddMember = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Missing dates",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
      return;
    }

    if (endDate < startDate) {
      toast({
        title: "Invalid dates",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const memberData = {
        userId: user?._id,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        responsibilities:
          responsibilities.length > 0 ? responsibilities : ["team_member"],
      };

      if (selectedMilestoneId) {
        await addTeamMemberToMilestone(
          projectId,
          selectedMilestoneId,
          memberData,
        );
        toast({
          title: "Success",
          description: `Added ${user?.firstName} ${user?.lastName} to milestone in ${projectName}`,
        });
      } else {
        await addTeamMember(projectId, memberData);
        toast({
          title: "Success",
          description: `Added ${user?.firstName} ${user?.lastName} to ${projectName}`,
        });
      }

      onOpenChange(false);
      if (returnUrl) {
        router.push(returnUrl);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add team member",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Add {user?.firstName} {user?.lastName} to project {projectName}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email} disabled />
          </div>

          {milestones.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="milestone">Milestone (Optional)</Label>
              <select
                id="milestone"
                className="border rounded h-9 px-2"
                value={selectedMilestoneId}
                onChange={(e) => setSelectedMilestoneId(e.target.value)}
              >
                <option value="">Project-wide (No specific milestone)</option>
                {milestones.map((milestone) => (
                  <option key={milestone._id} value={milestone._id}>
                    {milestone.title}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Select a milestone to assign this member to specific project
                phases, or leave blank for project-wide assignment.
              </p>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate ? startDate.toISOString().split("T")[0] : ""}
              onChange={(e) =>
                setStartDate(
                  e.target.value ? new Date(e.target.value) : undefined,
                )
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate ? endDate.toISOString().split("T")[0] : ""}
              onChange={(e) =>
                setEndDate(
                  e.target.value ? new Date(e.target.value) : undefined,
                )
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="responsibility">Responsibilities</Label>
            <div className="flex gap-2">
              <Input
                id="responsibility"
                placeholder="Add a responsibility and press Enter"
                value={respInput}
                onChange={(e) => setRespInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const v = respInput.trim();
                    if (v && !responsibilities.includes(v)) {
                      setResponsibilities((prev) => [...prev, v]);
                      setRespInput("");
                    }
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => {
                  const v = respInput.trim();
                  if (v && !responsibilities.includes(v)) {
                    setResponsibilities((prev) => [...prev, v]);
                    setRespInput("");
                  }
                }}
              >
                Add
              </Button>
            </div>
            {responsibilities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {responsibilities.map((r) => (
                  <div
                    key={r}
                    className="flex items-center gap-2 rounded border px-2 py-1 text-sm"
                  >
                    <span>{r}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setResponsibilities((prev) =>
                          prev.filter((x) => x !== r),
                        )
                      }
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Examples: Frontend Development, UI/UX Design, Code Review
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddMember} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add to {selectedMilestoneId ? "Milestone" : "Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
