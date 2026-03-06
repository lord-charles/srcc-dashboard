"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  addTeamMember,
  addTeamMemberToMilestone,
} from "@/services/projects-service";
import { Loader2, X, Plus, Calendar, User, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProjectMilestone } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold">
            Add Team Member
          </SheetTitle>
          <SheetDescription className="text-base">
            Assign {user?.firstName} {user?.lastName} to {projectName}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Member Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Member Information</span>
            </div>
            <div className="space-y-3 pl-6">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  value={user?.email}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Assignment Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span>Assignment Details</span>
            </div>
            <div className="space-y-4 pl-6">
              {milestones.length > 0 && (
                <div className="space-y-1.5">
                  <Label htmlFor="milestone" className="text-sm font-medium">
                    Milestone Assignment
                  </Label>
                  <select
                    id="milestone"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={selectedMilestoneId}
                    onChange={(e) => setSelectedMilestoneId(e.target.value)}
                  >
                    <option value="">
                      Project-wide (No specific milestone)
                    </option>
                    {milestones.map((milestone) => (
                      <option key={milestone._id} value={milestone._id}>
                        {milestone.title}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Assign to a specific milestone or leave blank for
                    project-wide access
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="start-date"
                    className="text-sm font-medium flex items-center gap-1.5"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    Start Date
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={
                      startDate ? startDate.toISOString().split("T")[0] : ""
                    }
                    onChange={(e) =>
                      setStartDate(
                        e.target.value ? new Date(e.target.value) : undefined,
                      )
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="end-date"
                    className="text-sm font-medium flex items-center gap-1.5"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    End Date
                  </Label>
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
              </div>
            </div>
          </div>

          <Separator />

          {/* Responsibilities */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span>Responsibilities</span>
            </div>
            <div className="space-y-3 pl-6">
              <div className="space-y-1.5">
                <Label htmlFor="responsibility" className="text-sm font-medium">
                  Add Responsibilities
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="responsibility"
                    placeholder="e.g., Frontend Development"
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
                    size="icon"
                    variant="secondary"
                    onClick={() => {
                      const v = respInput.trim();
                      if (v && !responsibilities.includes(v)) {
                        setResponsibilities((prev) => [...prev, v]);
                        setRespInput("");
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Examples: Frontend Development, UI/UX Design, Code Review
                </p>
              </div>

              {responsibilities.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Added Responsibilities
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {responsibilities.map((r) => (
                      <Badge
                        key={r}
                        variant="secondary"
                        className="pl-2.5 pr-1 py-1 gap-1.5"
                      >
                        <span>{r}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() =>
                            setResponsibilities((prev) =>
                              prev.filter((x) => x !== r),
                            )
                          }
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <SheetFooter className="mt-8 gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1 sm:flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddMember}
            disabled={isLoading}
            className="flex-1 sm:flex-1"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add to {selectedMilestoneId ? "Milestone" : "Project"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
