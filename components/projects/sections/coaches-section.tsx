"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CoachAssignment,
  Project,
  ProjectMilestone,
  Contract,
} from "@/types/project";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  deleteCoach,
  deleteCoachManager,
  deleteCoachAssistant,
  createContract,
  updateCoach,
} from "@/services/projects-service";
import {
  updateContract,
  getContractTemplates,
} from "@/services/contracts.service";
import { CoachCard } from "./coach-card";
import {
  CreateContractDialog,
  ContractFormValues,
} from "@/components/contracts/create-contract-dialog";
import { EditContractDialog } from "@/components/contracts/edit-contract-dialog";

interface CoachesSectionProps {
  projectId: string;
  projectData: Project;
}

function groupCoachesByMilestone(
  coaches: CoachAssignment[] = [],
  milestones: ProjectMilestone[] = [],
) {
  const byId = new Map<string, ProjectMilestone>();
  milestones.forEach((m) => byId.set(m._id, m));
  const grouped = new Map<
    string,
    { milestone: ProjectMilestone | null; coaches: CoachAssignment[] }
  >();
  coaches.forEach((c) => {
    const key = c.milestoneId || "unknown";
    if (!grouped.has(key))
      grouped.set(key, { milestone: byId.get(key) || null, coaches: [] });
    grouped.get(key)!.coaches.push(c);
  });
  return Array.from(grouped.entries()).map(([id, data]) => ({ id, ...data }));
}

export const CoachesSection: React.FC<CoachesSectionProps> = ({
  projectId,
  projectData,
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showContractDialog, setShowContractDialog] = useState(false);
  const [contractCoachId, setContractCoachId] = useState<string>("");
  const [contractMilestoneId, setContractMilestoneId] = useState<string>("");
  const [showEditContractDialog, setShowEditContractDialog] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null,
  );
  const [isCreatingContract, setIsCreatingContract] = useState(false);
  const [isUpdatingContract, setIsUpdatingContract] = useState(false);
  const [templates, setTemplates] = useState<
    Array<{
      _id: string;
      name: string;
      version?: string;
      contentType: string;
      content: string;
      variables?: string[];
    }>
  >([]);

  // Fetch contract templates on mount (only coach templates for coaches)
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await getContractTemplates({ active: true });
        // Filter to only coach templates for coaches
        const filteredData = (data || []).filter(
          (t: any) => t.category === "coach",
        );
        setTemplates(filteredData);
      } catch (error) {
        console.error("Failed to fetch contract templates:", error);
      }
    };
    fetchTemplates();
  }, []);

  const groups = groupCoachesByMilestone(
    projectData.coaches || [],
    projectData.milestones || [],
  );

  const getCoachContract = (
    coachId: string,
    milestoneId: string,
  ): Contract | null => {
    if (
      !projectData?.teamMemberContracts ||
      projectData.teamMemberContracts.length === 0
    ) {
      return null;
    }

    // 1. Try exact match (milestoneId matches and type is 'coach')
    const exactMatch = projectData.teamMemberContracts.find(
      (contract) =>
        contract?.contractedUserId?._id === coachId &&
        contract?.milestoneId === milestoneId &&
        contract?.type === "coach",
    );
    if (exactMatch) return exactMatch;

    // 2. Fallback for legacy contracts (no milestoneId)
    // If we are looking for a specific milestone contract, and haven't found one,
    // check if this is the earliest milestone for the coach.
    if (milestoneId) {
      const coachMilestoneIds =
        projectData.coaches
          ?.filter((c) => c.userId?._id === coachId && c.milestoneId)
          ?.map((c) => c.milestoneId as string) || [];

      if (coachMilestoneIds.length > 0) {
        // Find if milestoneId is the first one in the project's milestones list among coach's assignments
        const projectMilestoneIds = (projectData.milestones || []).map(
          (m) => m._id,
        );
        const coachOrderedMilestones = projectMilestoneIds.filter((id) =>
          coachMilestoneIds.includes(id),
        );

        if (coachOrderedMilestones[0] === milestoneId) {
          // Return the contract that has no milestoneId
          return (
            projectData.teamMemberContracts.find(
              (contract) =>
                contract?.contractedUserId?._id === coachId &&
                !contract?.milestoneId &&
                contract?.type === "coach",
            ) || null
          );
        }
      }
    }

    return null;
  };

  const handleCreateContractSubmit = async (values: ContractFormValues) => {
    try {
      setIsCreatingContract(true);

      const coach = projectData.coaches?.find(
        (c) =>
          c.userId._id === contractCoachId &&
          c.milestoneId === contractMilestoneId,
      );
      if (!coach) {
        throw new Error("Coach not found");
      }

      // Use coach's embedded contract data as defaults if values are not provided
      const contractData = {
        description:
          values.description ||
          `Coach Contract for ${projectData.name} - ${coach.userId.firstName} ${coach.userId.lastName}`,
        contractValue: values.contractValue || coach.contract.rate,
        currency: values.currency || coach.contract.currency,
        startDate: values.startDate.toString().split("T")[0],
        endDate: values.endDate.toString().split("T")[0],
        projectId: projectData._id,
        milestoneId: contractMilestoneId,
        contractedUserId: contractCoachId,
        type: "coach",
        status: values.status,
        ...(values.templateId ? { templateId: values.templateId } : {}),
        ...(values.editedTemplateContent
          ? { editedTemplateContent: values.editedTemplateContent }
          : {}),
        ...(values.attachments && values.attachments.length
          ? { attachments: values.attachments }
          : {}),
      };

      const result = await createContract(contractData);

      if (result) {
        toast({
          title: "Coach contract created",
          description: "Coach contract has been created successfully",
        });

        // Delay reload to ensure any dialogs close first
        setTimeout(() => window.location.reload(), 100);
      }
    } catch (error) {
      console.error("Failed to create coach contract:", error);
      toast({
        title: "Failed to create coach contract",
        description: "An error occurred while creating the contract",
        variant: "destructive",
      });
    } finally {
      setIsCreatingContract(false);
      setShowContractDialog(false);
    }
  };

  const handleOpenContractDialog = (coachId: string, milestoneId: string) => {
    setContractCoachId(coachId);
    setContractMilestoneId(milestoneId);
    setShowContractDialog(true);
  };

  const handleEditContract = (contract: Contract) => {
    setSelectedContract(contract);
    setShowEditContractDialog(true);
  };

  const handleUpdateContract = async (values: ContractFormValues) => {
    if (!selectedContract) return;

    try {
      setIsUpdatingContract(true);

      const contractData: any = {
        description: values.description,
        contractValue: values.contractValue,
        currency: values.currency,
        startDate: values.startDate,
        endDate: values.endDate,
        projectId: projectData._id,
        milestoneId: values.milestoneId === "none" ? null : values.milestoneId,
        contractedUserId: selectedContract.contractedUserId,
        status: values.status,
      };

      // Add template fields if provided (and not "none")
      if (values.templateId && values.templateId !== "none") {
        contractData.templateId = values.templateId;
      }
      if (values.editedTemplateContent) {
        contractData.editedTemplateContent = values.editedTemplateContent;
      }

      const result = await updateContract(selectedContract._id, contractData);

      if (result) {
        // Synchronize milestone transition if it's a project-wide coach getting assigned a milestone
        if (
          !selectedContract.milestoneId &&
          values.milestoneId &&
          values.milestoneId !== "none"
        ) {
          const coachAssignment = projectData.coaches?.find(
            (c) =>
              ((c.userId as any)?._id || c.userId) ===
              ((selectedContract.contractedUserId as any)?._id ||
                selectedContract.contractedUserId),
          );

          if (coachAssignment) {
            const coachUserId =
              (coachAssignment.userId as any)?._id || coachAssignment.userId;
            await updateCoach(
              projectData._id,
              coachAssignment.milestoneId || "",
              coachUserId,
              {
                milestoneId: values.milestoneId,
              },
            );
          }
        }

        toast({
          title: "Coach contract updated",
          description: "Coach contract has been updated successfully",
        });

        // Delay reload to ensure any dialogs close first
        setTimeout(() => window.location.reload(), 100);
      }
    } catch (error) {
      console.error("Failed to update coach contract:", error);
      toast({
        title: "Failed to update coach contract",
        description:
          typeof error === "string"
            ? error
            : "An error occurred while updating the contract",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingContract(false);
      setShowEditContractDialog(false);
    }
  };
  const goToAddCoach = () => {
    const params = new URLSearchParams({
      projectId: projectData._id,
      projectName: projectData.name,
      returnUrl: `${window.location.pathname}?tab=team`,
      isCoach: "true",
    });
    router.push(`/users?${params.toString()}`);
  };

  const handleRemoveCoach = async (coach: any) => {
    try {
      setIsDeleting(true);
      const userId =
        typeof coach.userId === "string"
          ? coach.userId
          : coach.userId?._id || "";
      if (!userId || !coach.milestoneId)
        throw new Error("Missing coach identifiers");
      await deleteCoach(projectId, String(coach.milestoneId), String(userId));
      toast({
        title: "Coach removed",
        description: "Coach has been removed from the milestone.",
      });
      setTimeout(() => window.location.reload(), 100);
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to remove coach",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRemoveCoachManager = async (manager: any) => {
    try {
      const userId =
        typeof manager.userId === "string"
          ? manager.userId
          : manager.userId?._id || "";
      if (!userId) throw new Error("Missing manager user");
      await deleteCoachManager(projectId, String(userId));
      toast({
        title: "Coach manager removed",
        description: "Coach manager has been removed.",
      });
      setTimeout(() => window.location.reload(), 100);
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to remove coach manager",
        variant: "destructive",
      });
    }
  };

  const handleRemoveCoachAssistant = async (assistant: any) => {
    try {
      const userId =
        typeof assistant.userId === "string"
          ? assistant.userId
          : assistant.userId?._id || "";
      if (!userId) throw new Error("Missing assistant user");
      await deleteCoachAssistant(projectId, String(userId));
      toast({
        title: "Coach assistant removed",
        description: "Coach assistant has been removed.",
      });
      setTimeout(() => window.location.reload(), 100);
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to remove coach assistant",
        variant: "destructive",
      });
    }
  };

  const goToAddCoachManager = () => {
    const params = new URLSearchParams({
      projectId: projectData._id,
      projectName: projectData.name,
      returnUrl: `${window.location.pathname}?tab=team`,
      isCoachManager: "true",
    });
    router.push(`/users?${params.toString()}`);
  };

  const goToAddCoachAssistant = () => {
    const params = new URLSearchParams({
      projectId: projectData._id,
      projectName: projectData.name,
      returnUrl: `${window.location.pathname}?tab=team`,
      isCoachAssistant: "true",
    });
    router.push(`/users?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          Coaches by Milestone
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={goToAddCoachAssistant}>
            Add Coach Assistant
          </Button>
          <Button size="sm" variant="outline" onClick={goToAddCoachManager}>
            Add Coach Manager
          </Button>
          <Button size="sm" onClick={goToAddCoach}>
            Add Coach
          </Button>
        </div>
      </div>

      {/* Coach Managers */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Coach Managers</h3>
          <Button size="sm" variant="outline" onClick={goToAddCoachManager}>
            Add
          </Button>
        </div>
        {!projectData.coachManagers ||
        projectData.coachManagers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No coach managers yet.
          </p>
        ) : (
          <div className="grid gap-2">
            {projectData.coachManagers.map((m: any) => {
              const u: any = m.userId;
              const displayName =
                u && typeof u === "object" && "firstName" in u
                  ? `${u.firstName} ${u.lastName}`
                  : typeof u === "string"
                    ? u
                    : u?._id || "Unknown";
              const initials =
                u && typeof u === "object" && "firstName" in u
                  ? `${u.firstName?.[0] || ""}${u.lastName?.[0] || ""}`
                  : typeof displayName === "string"
                    ? displayName.slice(0, 2).toUpperCase()
                    : "CM";
              const assigned = m.assignedDate
                ? new Date(m.assignedDate)
                : undefined;
              return (
                <div
                  key={m._id || displayName}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={`https://avatar.vercel.sh/${u?.email}`}
                        alt={`${u?.firstName} ${u?.lastName}`}
                      />
                      <AvatarFallback>
                        <AvatarFallback>{initials}</AvatarFallback>
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="text-sm font-medium">{displayName}</div>
                      {assigned && (
                        <div className="text-xs text-muted-foreground">
                          Assigned {assigned.toLocaleDateString()}
                        </div>
                      )}
                      {Array.isArray(m.responsibilities) &&
                        m.responsibilities.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {m.responsibilities.map((r: string) => (
                              <Badge
                                key={r}
                                variant="secondary"
                                className="text-[10px]"
                              >
                                {r}
                              </Badge>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={goToAddCoachManager}
                    >
                      Change
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Remove coach manager?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveCoachManager(m)}
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Coach Assistants */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Coach Assistants</h3>
          <Button size="sm" variant="outline" onClick={goToAddCoachAssistant}>
            Add
          </Button>
        </div>
        {!projectData.coachAssistants ||
        projectData.coachAssistants.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No coach assistants yet.
          </p>
        ) : (
          <div className="grid gap-2">
            {projectData.coachAssistants.map((m: any) => {
              const u: any = m.userId;
              const displayName =
                u && typeof u === "object" && "firstName" in u
                  ? `${u.firstName} ${u.lastName}`
                  : typeof u === "string"
                    ? u
                    : u?._id || "Unknown";
              const initials =
                u && typeof u === "object" && "firstName" in u
                  ? `${u.firstName?.[0] || ""}${u.lastName?.[0] || ""}`
                  : typeof displayName === "string"
                    ? displayName.slice(0, 2).toUpperCase()
                    : "CA";
              const assigned = m.assignedDate
                ? new Date(m.assignedDate)
                : undefined;
              return (
                <div
                  key={m._id || displayName}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={`https://avatar.vercel.sh/${u?.email}`}
                        alt={`${u?.firstName} ${u?.lastName}`}
                      />
                      <AvatarFallback>
                        <AvatarFallback>{initials}</AvatarFallback>
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="text-sm font-medium">{displayName}</div>
                      {assigned && (
                        <div className="text-xs text-muted-foreground">
                          Assigned {assigned.toLocaleDateString()}
                        </div>
                      )}
                      {Array.isArray(m.responsibilities) &&
                        m.responsibilities.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {m.responsibilities.map((r: string) => (
                              <Badge
                                key={r}
                                variant="secondary"
                                className="text-[10px]"
                              >
                                {r}
                              </Badge>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={goToAddCoachAssistant}
                    >
                      Change
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Remove coach assistant?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveCoachAssistant(m)}
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {groups.length === 0 && (
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            No coaches assigned yet.
          </p>
        </Card>
      )}

      {groups.length > 0 && (
        <div className="space-y-6">
          {groups.map((g) => (
            <Card key={g.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold">
                    {g.milestone ? g.milestone.title : "Unknown Milestone"}
                  </h3>
                  {g.milestone && (
                    <p className="text-xs text-muted-foreground">
                      Due {new Date(g.milestone.dueDate).toLocaleDateString()} •
                      Budget {g.milestone.budget.toLocaleString()}{" "}
                      {projectData.currency}
                    </p>
                  )}
                </div>
              </div>
              <Separator className="my-3" />
              <div className="grid gap-3">
                {g.coaches.map((c) => (
                  <CoachCard
                    key={c._id}
                    coach={c}
                    projectData={projectData}
                    milestone={g.milestone || undefined}
                    onDelete={() => handleRemoveCoach(c)}
                    onCreateContract={() =>
                      handleOpenContractDialog(c.userId._id, c.milestoneId)
                    }
                    onEditContract={(contract) => handleEditContract(contract)}
                    getCoachContract={getCoachContract}
                    isDeleting={isDeleting}
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Contract Dialogs */}
      <CreateContractDialog
        open={showContractDialog}
        onOpenChange={setShowContractDialog}
        onSubmit={handleCreateContractSubmit}
        projectName={projectData?.name}
        teamMemberName={(() => {
          const coach = projectData.coaches?.find(
            (c) =>
              c.userId._id === contractCoachId &&
              c.milestoneId === contractMilestoneId,
          );
          return coach
            ? `${coach.userId.firstName} ${coach.userId.lastName}`
            : "";
        })()}
        teamMemberEmail={(() => {
          const coach = projectData.coaches?.find(
            (c) =>
              c.userId._id === contractCoachId &&
              c.milestoneId === contractMilestoneId,
          );
          return coach?.userId.email || "";
        })()}
        internalCategories={projectData?.budgetId?.internalCategories || []}
        milestones={
          projectData?.milestones?.filter(
            (m) => m._id === contractMilestoneId,
          ) || []
        }
        isSubmitting={isCreatingContract}
        templates={templates}
        isCoach={true}
        coachContractData={(() => {
          const coach = projectData.coaches?.find(
            (c) =>
              c.userId._id === contractCoachId &&
              c.milestoneId === contractMilestoneId,
          );
          return coach?.contract;
        })()}
      />

      {selectedContract && (
        <EditContractDialog
          open={showEditContractDialog}
          onOpenChange={setShowEditContractDialog}
          onSubmit={handleUpdateContract}
          contract={selectedContract}
          isSubmitting={isUpdatingContract}
          templates={templates}
          milestones={projectData.milestones}
        />
      )}
    </div>
  );
};
