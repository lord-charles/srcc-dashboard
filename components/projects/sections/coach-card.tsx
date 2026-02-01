"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { CalendarDays, Trash2, Pencil, FileSignature } from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  CoachAssignment,
  Project,
  ProjectMilestone,
  Contract,
} from "@/types/project";

interface CoachCardProps {
  coach: CoachAssignment;
  projectData: Project;
  milestone?: ProjectMilestone;
  onEdit?: () => void;
  onDelete: () => void;
  onCreateContract: () => void;
  onEditContract: (contract: Contract) => void;
  getCoachContract: (coachId: string, milestoneId: string) => Contract | null;
  isDeleting: boolean;
}

export const CoachCard: React.FC<CoachCardProps> = ({
  coach,
  projectData,
  milestone,
  onEdit,
  onDelete,
  onCreateContract,
  onEditContract,
  getCoachContract,
  isDeleting,
}) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0)}${lastName?.charAt(0)}`?.toUpperCase();
  };

  const contract = getCoachContract(coach.userId?._id, coach.milestoneId);

  return (
    <div className="flex items-center justify-between space-x-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
      <div className="flex items-center space-x-4">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={`https://avatar.vercel.sh/${coach.userId?.email}`}
            alt={`${coach.userId?.firstName} ${coach.userId?.lastName}`}
          />
          <AvatarFallback>
            {getInitials(coach.userId?.firstName, coach.userId?.lastName)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-sm font-medium leading-none">
            {coach.userId?.firstName} {coach.userId?.lastName}
          </h3>
          <p className="text-xs text-muted-foreground">{coach.userId?.email}</p>
          {milestone && (
            <p className="text-xs text-green-600 font-medium">
              📍 {milestone.title}
            </p>
          )}
          <div className="mt-1 flex flex-wrap gap-0.5">
            {coach.responsibilities.map((responsibility) => (
              <Badge
                key={responsibility}
                variant="secondary"
                className="text-[8px]"
              >
                {responsibility}
              </Badge>
            ))}
          </div>
          {/* Show embedded contract info */}
          <div className="mt-1">
            <Badge variant="outline" className="text-[10px]">
              {coach.contract.rate.toLocaleString()} {coach.contract.currency}{" "}
              {coach.contract.rateUnit === "per_session"
                ? "/ session"
                : "/ hour"}
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div className="mb-2">
          {contract ? (
            <div className="">
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200 flex gap-1 items-center cursor-pointer hover:bg-green-100"
                onClick={() => onEditContract(contract)}
              >
                <FileSignature className="h-3 w-3" />
                <div className="text-[8px]">{contract.contractNumber}</div>
              </Badge>
              <Badge
                variant="outline"
                className="ml-2 text-xs cursor-pointer hover:bg-gray-100"
                style={{
                  backgroundColor:
                    contract.status === "active"
                      ? "rgb(240, 253, 244)"
                      : contract.status === "draft"
                        ? "rgb(240, 249, 255)"
                        : contract.status === "pending_signature"
                          ? "rgb(254, 249, 195)"
                          : contract.status === "suspended"
                            ? "rgb(254, 242, 242)"
                            : contract.status === "terminated"
                              ? "rgb(249, 250, 251)"
                              : "rgb(249, 250, 251)",
                  color:
                    contract.status === "active"
                      ? "rgb(22, 101, 52)"
                      : contract.status === "draft"
                        ? "rgb(3, 105, 161)"
                        : contract.status === "pending_signature"
                          ? "rgb(161, 98, 7)"
                          : contract.status === "suspended"
                            ? "rgb(185, 28, 28)"
                            : contract.status === "terminated"
                              ? "rgb(107, 114, 128)"
                              : "rgb(107, 114, 128)",
                  borderColor:
                    contract.status === "active"
                      ? "rgb(187, 247, 208)"
                      : contract.status === "draft"
                        ? "rgb(186, 230, 253)"
                        : contract.status === "pending_signature"
                          ? "rgb(254, 240, 138)"
                          : contract.status === "suspended"
                            ? "rgb(254, 202, 202)"
                            : contract.status === "terminated"
                              ? "rgb(229, 231, 235)"
                              : "rgb(229, 231, 235)",
                }}
                onClick={() => onEditContract(contract)}
              >
                <div className="text-[8px]">{contract.status}</div>
              </Badge>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-200 bg-blue-50"
              onClick={onCreateContract}
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
                  <span className="sr-only">Coach since</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Coach since:{" "}
                  {coach.startDate ? formatDate(coach.startDate) : "N/A"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit coach</span>
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive/90"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove coach</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently remove{" "}
                  {coach.userId?.firstName} {coach.userId?.lastName} from this
                  milestone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
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
  );
};
