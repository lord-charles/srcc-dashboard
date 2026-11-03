"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditTeamMemberDialog } from "@/components/users/edit-team-member-dialog";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  deleteTeamMember,
  createContract,
  updateTeamMember,
} from "@/services/projects-service";
import {
  updateContract,
  getContractTemplates,
} from "@/services/contracts.service";
import type { Project, TeamMember, Contract } from "@/types/project";
import {
  CalendarDays,
  Trash2,
  UserPlus,
  Users,
  UserCog,
  UsersRound,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  CreateContractDialog,
  ContractFormValues,
} from "@/components/contracts/create-contract-dialog";
import { EditContractDialog } from "@/components/contracts/edit-contract-dialog";
import { CoachesSection } from "./coaches-section";
import { TeamMembersTable } from "./team-members-table";

export interface TeamSectionProps {
  teamMembers: TeamMember[];
  projectId: string;
  projectData: Project;
}

export const TeamSection: React.FC<TeamSectionProps> = ({
  teamMembers,
  projectId,
  projectData,
}) => {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("members");
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isCreatingContract, setIsCreatingContract] = useState(false);
  const [showContractDialog, setShowContractDialog] = useState(false);
  const [contractMemberId, setContractMemberId] = useState<string>("");
  const [selectedMemberMilestone, setSelectedMemberMilestone] = useState<
    string | undefined
  >(undefined);
  const [isOrganizationContract, setIsOrganizationContract] = useState(false);
  const [showEditContractDialog, setShowEditContractDialog] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null,
  );
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

  // Fetch contract templates on mount (excluding coach templates for team members)
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const result = await getContractTemplates({ active: true });
        if (result.success) {
          // Filter out coach templates for team members
          const filteredData = (result.data || []).filter(
            (t: any) => t.category !== "coach",
          );
          setTemplates(filteredData);
        }
      } catch (error) {
        console.error("Failed to fetch contract templates:", error);
      }
    };
    fetchTemplates();
  }, []);

  // Sync active tab with URL search params
  useEffect(() => {
    const tabFromUrl = searchParams.get("teamTab");
    if (tabFromUrl && ["members", "managers", "coaches"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("teamTab", value);
    router.replace(`${window.location.pathname}?${newSearchParams.toString()}`);
  };
  const isUserInInternalBudget = (email?: string): boolean => {
    if (!email) return false;
    const salaryCategory = projectData.budgetId.internalCategories?.find(
      (cat: any) => cat.name === "2237",
    );
    return (
      salaryCategory?.items?.some((item: any) => item.name.includes(email)) ??
      false
    );
  };

  const getNormalizedId = (value: any): string | undefined =>
    typeof value === "object" && value !== null
      ? value._id?.toString()
      : value?.toString();

  const getMemberAssignments = (memberId: string): TeamMember[] => {
    const normalizedMemberId = getNormalizedId(memberId);
    return teamMembers.filter(
      (member) => getNormalizedId(member.userId) === normalizedMemberId,
    );
  };

  const getMemberContracts = (
    memberId: string,
    milestoneId?: string,
  ): Contract[] => {
    const normalizedMemberId = getNormalizedId(memberId);
    const normalizedMilestoneId = getNormalizedId(milestoneId);
    return (projectData?.teamMemberContracts || []).filter(
      (contract) =>
        getNormalizedId(contract?.contractedUserId) === normalizedMemberId &&
        contract?.type !== "coach" &&
        getNormalizedId(contract?.milestoneId) === normalizedMilestoneId,
    );
  };

  const handleCreateContractSubmit = async (values: ContractFormValues) => {
    try {
      setIsCreatingContract(true);

      const contractData = {
        description: values.description,
        contractValue: values.contractValue,
        currency: values.currency,
        startDate: values.startDate.toString().split("T")[0],
        endDate: values.endDate.toString().split("T")[0],
        projectId: projectData._id,
        contractedUserId: contractMemberId,
        isOrganization: isOrganizationContract,
        status: values.status,
        // Use the milestone from the member's assignment, or allow override from form
        ...((values.milestoneId === "none"
          ? undefined
          : values.milestoneId || selectedMemberMilestone)
          ? {
              milestoneId:
                values.milestoneId === "none"
                  ? undefined
                  : values.milestoneId || selectedMemberMilestone,
            }
          : {}),
        ...(values.templateId ? { templateId: values.templateId } : {}),
        ...(values.editedTemplateContent
          ? { editedTemplateContent: values.editedTemplateContent }
          : {}),
        ...(values.attachments && values.attachments.length
          ? { attachments: values.attachments }
          : {}),
      };

      const result = await createContract(contractData);

      if (result.success) {
        toast({
          title: "Contract created",
          description: "Contract has been created successfully",
        });

        // Delay reload to ensure any dialogs close first
        setTimeout(() => window.location.reload(), 100);
      } else {
        toast({
          title: "Failed to create contract",
          description:
            result.error || "An error occurred while creating the contract",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to create contract:", error);
      toast({
        title: "Failed to create contract",
        description: "An error occurred while creating the contract",
        variant: "destructive",
      });
    } finally {
      setIsCreatingContract(false);
      setShowContractDialog(false);
      setSelectedMemberMilestone(undefined);
    }
  };

  const handleOpenContractDialog = (
    memberId: string,
    milestoneId?: string | any,
    isOrganization?: boolean,
  ) => {
    setContractMemberId(memberId);
    // Normalize and store the milestone ID (supporting embedded milestone objects)
    const normalizedMilestoneId =
      milestoneId && typeof milestoneId === "object" && "_id" in milestoneId
        ? (milestoneId as any)._id
        : (milestoneId as string | undefined);
    setSelectedMemberMilestone(normalizedMilestoneId);
    setIsOrganizationContract(isOrganization || false);
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

      if (result.success) {
        // Synchronize milestone transition if it's a project-wide member getting assigned a milestone
        if (
          !selectedContract.milestoneId &&
          values.milestoneId &&
          values.milestoneId !== "none"
        ) {
          const member = projectData.teamMembers?.find(
            (m) =>
              ((m.userId as any)?._id || m.userId) ===
              ((selectedContract.contractedUserId as any)?._id ||
                selectedContract.contractedUserId),
          );
          if (member) {
            const userId = (member.userId as any)?._id || member.userId;
            await updateTeamMember(projectData._id, userId, {
              userId: userId,
              milestoneId: values.milestoneId,
              startDate: member.startDate.toString(),
              endDate: member.endDate?.toString() || "",
              responsibilities: member.responsibilities,
            });
          }
        }

        toast({
          title: "Contract updated",
          description: "Contract has been updated successfully",
        });

        // Delay reload to ensure any dialogs close first
        setTimeout(() => window.location.reload(), 100);
      } else {
        toast({
          title: "Failed to update contract",
          description:
            result.error || "An error occurred while updating the contract",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to update contract:", error);
      toast({
        title: "Failed to update contract",
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

  const handleDeleteTeamMember = async (memberId: string) => {
    setIsDeleting(true);
    try {
      const result = await deleteTeamMember(projectId, memberId);
      if (result.success) {
        toast({
          title: "Team member removed",
          description: "The team member has been removed from the project.",
        });
        // Delay reload to ensure any dialogs close first
        setTimeout(() => window.location.reload(), 100);
      } else {
        toast({
          title: "Error",
          description:
            result.error || "Failed to remove team member. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting team member:", error);
      toast({
        title: "Error",
        description: "Failed to remove team member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0)}${lastName?.charAt(0)}`?.toUpperCase();
  };

  return (
    <Card className="w-full">
      <CardHeader className="p-4">
        <CardTitle className="text-2xl font-bold">Team Management</CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-0">
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team Members
            </TabsTrigger>
            <TabsTrigger value="managers" className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              Project Management
            </TabsTrigger>
            <TabsTrigger
              value="coaches"
              className="relative overflow-hidden rounded-none border border-border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
            >
              <UsersRound
                className="-ms-0.5 me-1.5 opacity-60"
                size={16}
                strokeWidth={2}
              />
              Coaches
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-2">
            <div className="flex justify-end mb-4">
              <Button
                variant="default"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => {
                  const params = new URLSearchParams({
                    projectId: projectData._id,
                    projectName: projectData.name,
                    returnUrl: `${window.location.pathname}?tab=team`,
                  });
                  router.push(`/users?${params.toString()}`);
                }}
              >
                <UserPlus className="h-4 w-4" />
                Add Member
              </Button>
            </div>
            <div className="space-y-6">
              {(() => {
                const coachIds = new Set(
                  (projectData.coaches || []).map((coach: any) =>
                    getNormalizedId(coach.userId),
                  ),
                );
                const eligibleTeamMembers = teamMembers.filter(
                  (member) =>
                    !coachIds.has(getNormalizedId(member.userId)),
                );
                const membersByUser = new Map<string, TeamMember[]>();
                eligibleTeamMembers.forEach((member) => {
                  const id = getNormalizedId(member.userId);
                  if (!id) return;
                  membersByUser.set(id, [...(membersByUser.get(id) || []), member]);
                });

                const scopes = new Map<string, { id?: string; title: string }>();
                scopes.set("__project_wide__", { title: "Project-wide Team Members" });
                (projectData.milestones || []).forEach((milestone: any) => {
                  const id = getNormalizedId(milestone._id);
                  if (id) scopes.set(id, { id, title: `${milestone.title} Team Members` });
                });
                // Preserve groups for contracts or assignments whose milestone is no longer in the project list.
                eligibleTeamMembers.forEach((assignment) => {
                  const id = getNormalizedId((assignment as any).milestoneId);
                  if (id && !scopes.has(id)) scopes.set(id, { id, title: "Other Milestone Team Members" });
                });
                (projectData.teamMemberContracts || []).forEach((contract: any) => {
                  if (contract.type === "coach") return;
                  const id = getNormalizedId(contract.milestoneId);
                  if (id && !scopes.has(id)) scopes.set(id, { id, title: "Other Milestone Team Members" });
                });

                const scopedTables = Array.from(scopes.entries()).flatMap(([key, scope]) => {
                  const rows = Array.from(membersByUser.entries()).flatMap(([memberId, assignments]) => {
                    const assignment = assignments.find(
                      (item) => getNormalizedId((item as any).milestoneId) === scope.id,
                    );
                    const contracts = getMemberContracts(memberId, scope.id);
                    if (!assignment && contracts.length === 0) return [];
                    return [{ member: assignment || assignments[0], assignment, contracts }];
                  });
                  return rows.length ? [{ key, scope, rows }] : [];
                });

                return scopedTables.length > 0 ? (
                  <div className="space-y-7">
                    {scopedTables.map(({ key, scope, rows }) => (
                      <section key={key} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{scope.title}</h3>
                          <Badge variant="secondary">{rows.length}</Badge>
                        </div>
                        <TeamMembersTable
                          rows={rows}
                          scopeMilestoneId={scope.id}
                          onEditAssignment={(assignment) => {
                            setSelectedMember(assignment);
                            setShowEditDialog(true);
                          }}
                          onDeleteMember={(member) => {
                            const memberId = getNormalizedId(member.userId);
                            if (memberId) handleDeleteTeamMember(memberId);
                          }}
                          onCreateContract={(member, milestoneId) => {
                            const memberId = getNormalizedId(member.userId);
                            if (memberId) {
                              handleOpenContractDialog(
                                memberId,
                                milestoneId,
                                member.isOrganization,
                              );
                            }
                          }}
                          onEditContract={handleEditContract}
                          isDeleting={isDeleting}
                        />
                      </section>
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No team members added yet. Click &quot;Add Member&quot; to get started.
                  </p>
                );
              })()}
            </div>
          </TabsContent>

          <TabsContent value="managers" className="space-y-4">
            <div className="space-y-6">
              {/* Project Manager Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Project Manager</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => {
                      const params = new URLSearchParams({
                        projectId: projectData._id,
                        projectName: projectData.name,
                        returnUrl: `${window.location.pathname}?tab=team`,
                        isProjectManager: "true",
                      });
                      router.push(`/users?${params.toString()}`);
                    }}
                  >
                    <UserPlus className="h-4 w-4" />
                    {projectData.projectManagerId ? "Change" : "Assign"} Manager
                  </Button>
                </div>
                {projectData.projectManagerId ? (
                  <div className="rounded-lg border p-4 bg-muted/30">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={`https://avatar.vercel.sh/${projectData.projectManagerId.email}`}
                          alt={`${projectData.projectManagerId.firstName} ${projectData.projectManagerId.lastName}`}
                        />
                        <AvatarFallback>
                          {getInitials(
                            projectData.projectManagerId.firstName,
                            projectData.projectManagerId.lastName,
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">
                          {projectData.projectManagerId.firstName}{" "}
                          {projectData.projectManagerId.lastName}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {projectData.projectManagerId.email}
                        </p>
                        <Badge variant="secondary" className="mt-2">
                          Project Manager
                        </Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <UserCog className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No project manager assigned yet
                    </p>
                  </div>
                )}
              </div>

              {/* Assistant Project Managers Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    Assistant Project Managers
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => {
                      const params = new URLSearchParams({
                        projectId: projectData._id,
                        projectName: projectData.name,
                        returnUrl: `${window.location.pathname}?tab=team`,
                        isAssistantPM: "true",
                      });
                      router.push(`/users?${params.toString()}`);
                    }}
                  >
                    <UserPlus className="h-4 w-4" />
                    Add Assistant
                  </Button>
                </div>
                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                  {projectData.assistantProjectManagers?.map((assistant) => (
                    <div
                      key={assistant._id}
                      className="flex items-center justify-between space-x-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={`https://avatar.vercel.sh/${assistant.userId?.email}`}
                            alt={`${assistant.userId?.firstName} ${assistant.userId?.lastName}`}
                          />
                          <AvatarFallback>
                            {getInitials(
                              assistant.userId?.firstName,
                              assistant.userId?.lastName,
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-sm font-medium leading-none">
                            {assistant.userId?.firstName}{" "}
                            {assistant.userId?.lastName}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {assistant.userId?.email}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-0.5">
                            {assistant.responsibilities?.map(
                              (responsibility) => (
                                <Badge
                                  key={responsibility}
                                  variant="secondary"
                                  className="text-[8px]"
                                >
                                  {responsibility}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <CalendarDays className="h-4 w-4" />
                                  <span className="sr-only">Assigned date</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Assigned: {formatDate(assistant.assignedDate)}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive/90"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">
                                  Remove assistant PM
                                </span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove {assistant.userId?.firstName}{" "}
                                  {assistant.userId?.lastName} as an assistant
                                  project manager.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={async () => {
                                    try {
                                      const { removeAssistantProjectManager } =
                                        await import("@/services/projects-service");
                                      const result =
                                        await removeAssistantProjectManager(
                                          projectId,
                                          assistant.userId._id,
                                        );
                                      if (result.success) {
                                        toast({
                                          title: "Assistant PM removed",
                                          description:
                                            "The assistant project manager has been removed successfully.",
                                        });
                                        setTimeout(
                                          () => window.location.reload(),
                                          100,
                                        );
                                      } else {
                                        toast({
                                          title: "Error",
                                          description:
                                            result.error ||
                                            "Failed to remove assistant project manager",
                                          variant: "destructive",
                                        });
                                      }
                                    } catch (error) {
                                      toast({
                                        title: "Error",
                                        description:
                                          "Failed to remove assistant project manager",
                                        variant: "destructive",
                                      });
                                    }
                                  }}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!projectData.assistantProjectManagers ||
                    projectData.assistantProjectManagers.length === 0) && (
                    <div className="col-span-full rounded-lg border border-dashed p-8 text-center">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No assistant project managers assigned yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="coaches">
            <CoachesSection
              projectId={projectData._id}
              projectData={projectData}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      {selectedMember && (
        <EditTeamMemberDialog
          open={showEditDialog}
          onOpenChange={(open) => {
            setShowEditDialog(open);
            if (!open) setSelectedMember(null);
          }}
          projectId={projectId}
          member={selectedMember}
        />
      )}
      <CreateContractDialog
        open={showContractDialog}
        onOpenChange={setShowContractDialog}
        onSubmit={handleCreateContractSubmit}
        projectName={projectData?.name}
        teamMemberName={
          teamMembers.find((member) => member.userId?._id === contractMemberId)
            ?.userId?.firstName +
            " " +
            teamMembers.find(
              (member) => member.userId?._id === contractMemberId,
            )?.userId?.lastName || ""
        }
        teamMemberEmail={
          teamMembers.find((member) => member.userId?._id === contractMemberId)
            ?.userId?.email || ""
        }
        internalCategories={projectData?.budgetId?.internalCategories || []}
        milestones={projectData?.milestones || []}
        isSubmitting={isCreatingContract}
        templates={templates}
        defaultMilestoneId={selectedMemberMilestone}
        budgetCurrency={projectData?.budgetId?.currency || projectData?.currency}
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
    </Card>
  );
};

export default TeamSection;
