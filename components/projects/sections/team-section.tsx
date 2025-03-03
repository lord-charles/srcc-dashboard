"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { deleteTeamMember, createContract } from "@/services/projects-service";
import { updateContract } from "@/services/contracts.service";
import type { Project, TeamMember, Contract } from "@/types/project";
import {
  CalendarDays,
  Trash2,
  UserPlus,
  Pencil,
  FileSignature,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  CreateContractDialog,
  ContractFormValues,
} from "@/components/contracts/create-contract-dialog";
import { EditContractDialog } from "@/components/contracts/edit-contract-dialog";

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
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isCreatingContract, setIsCreatingContract] = useState(false);
  const [showContractDialog, setShowContractDialog] = useState(false);
  const [contractMemberId, setContractMemberId] = useState<string>("");
  const [showEditContractDialog, setShowEditContractDialog] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null
  );
  const [isUpdatingContract, setIsUpdatingContract] = useState(false);

  const getMemberContract = (memberId: string) => {
    if (
      !projectData?.teamMemberContracts ||
      projectData.teamMemberContracts.length === 0
    ) {
      return null;
    }

    return projectData.teamMemberContracts.find(
      (contract) => contract?.contractedUserId._id === memberId
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
        status: values.status,
      };

      const result = await createContract(contractData);

      if (result) {
        toast({
          title: "Contract created",
          description: "Contract has been created successfully",
        });

        router.refresh();
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
    }
  };

  const handleOpenContractDialog = (memberId: string) => {
    setContractMemberId(memberId);
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

      const contractData = {
        description: values.description,
        contractValue: values.contractValue,
        currency: values.currency,
        startDate: values.startDate,
        endDate: values.endDate,
        projectId: projectData._id,
        contractedUserId: selectedContract.contractedUserId,
        status: values.status,
      };

      const result = await updateContract(selectedContract._id, contractData);

      if (result) {
        toast({
          title: "Contract updated",
          description: "Contract has been updated successfully",
        });

        router.refresh();
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
      await deleteTeamMember(projectId, memberId);
      toast({
        title: "Team member removed",
        description: "The team member has been removed from the project.",
      });
      router.refresh();
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold">Team Members</CardTitle>
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
      </CardHeader>
      <CardContent>
        <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
          {teamMembers.map((member) => (
            <div
              key={member._id}
              className="flex items-center justify-between space-x-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center space-x-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${member.userId?.email}`}
                    alt={`${member.userId?.firstName} ${member.userId?.lastName}`}
                  />
                  <AvatarFallback>
                    {getInitials(
                      member.userId?.firstName,
                      member.userId?.lastName
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-sm font-medium leading-none">
                    {member.userId?.firstName} {member.userId?.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {member.userId?.email}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {member.responsibilities.map((responsibility) => (
                      <Badge
                        key={responsibility}
                        variant="secondary"
                        className="text-xs"
                      >
                        {responsibility}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="mb-2">
                  {getMemberContract(member.userId?._id) ? (
                    <div className="flex items-center">
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 flex gap-1 items-center cursor-pointer hover:bg-green-100"
                        onClick={() =>
                          handleEditContract(
                            getMemberContract(member.userId?._id)!
                          )
                        }
                      >
                        <FileSignature className="h-3 w-3" />
                        {getMemberContract(member.userId?._id)?.contractNumber}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="ml-2 text-xs cursor-pointer hover:bg-gray-100"
                        style={{
                          backgroundColor:
                            getMemberContract(member.userId?._id)?.status ===
                            "active"
                              ? "rgb(240, 253, 244)"
                              : getMemberContract(member.userId?._id)
                                  ?.status === "draft"
                              ? "rgb(240, 249, 255)"
                              : getMemberContract(member.userId?._id)
                                  ?.status === "pending_signature"
                              ? "rgb(254, 249, 195)"
                              : getMemberContract(member.userId?._id)
                                  ?.status === "suspended"
                              ? "rgb(254, 242, 242)"
                              : getMemberContract(member.userId?._id)
                                  ?.status === "terminated"
                              ? "rgb(249, 250, 251)"
                              : "rgb(249, 250, 251)",
                          color:
                            getMemberContract(member.userId?._id)?.status ===
                            "active"
                              ? "rgb(22, 101, 52)"
                              : getMemberContract(member.userId?._id)
                                  ?.status === "draft"
                              ? "rgb(3, 105, 161)"
                              : getMemberContract(member.userId?._id)
                                  ?.status === "pending_signature"
                              ? "rgb(161, 98, 7)"
                              : getMemberContract(member.userId?._id)
                                  ?.status === "suspended"
                              ? "rgb(185, 28, 28)"
                              : getMemberContract(member.userId?._id)
                                  ?.status === "terminated"
                              ? "rgb(107, 114, 128)"
                              : "rgb(107, 114, 128)",
                          borderColor:
                            getMemberContract(member.userId?._id)?.status ===
                            "active"
                              ? "rgb(187, 247, 208)"
                              : getMemberContract(member.userId?._id)
                                  ?.status === "draft"
                              ? "rgb(186, 230, 253)"
                              : getMemberContract(member.userId?._id)
                                  ?.status === "pending_signature"
                              ? "rgb(254, 240, 138)"
                              : getMemberContract(member.userId?._id)
                                  ?.status === "suspended"
                              ? "rgb(254, 202, 202)"
                              : getMemberContract(member.userId?._id)
                                  ?.status === "terminated"
                              ? "rgb(229, 231, 235)"
                              : "rgb(229, 231, 235)",
                        }}
                        onClick={() =>
                          handleEditContract(
                            getMemberContract(member.userId?._id)!
                          )
                        }
                      >
                        {getMemberContract(member.userId?._id)?.status}
                      </Badge>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-200 bg-blue-50"
                      onClick={() =>
                        handleOpenContractDialog(member.userId?._id)
                      }
                    >
                      <FileSignature className="h-3 w-3 mr-1" />
                      Award Contract
                    </Button>
                  )}
                </div>
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
                          <span className="sr-only">Member since</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Member since: {formatDate(member.startDate)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setSelectedMember(member);
                      setShowEditDialog(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit team member</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive/90"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove team member</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          remove {member.userId?.firstName}{" "}
                          {member.userId?.lastName} from the project.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            handleDeleteTeamMember(member.userId?._id)
                          }
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Removing..." : "Remove"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
          {teamMembers.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              No team members added yet. Click &quot;Add Member&quot; to get
              started.
            </p>
          )}
        </div>
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
              (member) => member.userId?._id === contractMemberId
            )?.userId?.lastName || ""
        }
        isSubmitting={isCreatingContract}
      />
      {selectedContract && (
        <EditContractDialog
          open={showEditContractDialog}
          onOpenChange={setShowEditContractDialog}
          onSubmit={handleUpdateContract}
          contract={selectedContract}
          isSubmitting={isUpdatingContract}
        />
      )}
    </Card>
  );
};

export default TeamSection;
