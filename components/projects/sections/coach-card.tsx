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
  getCoachContracts: (coachId: string, milestoneId: string) => Contract[];
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
  getCoachContracts,
  isDeleting,
}) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0)}${lastName?.charAt(0)}`?.toUpperCase();
  };

  const contracts = getCoachContracts(coach.userId?._id, coach.milestoneId);

  const getContractStatusLabel = (status: Contract["status"]) =>
    status
      .replace(/^pending_/, "Pending ")
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const getContractStatusStyle = (status: Contract["status"]) =>
    status.startsWith("pending_")
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : status === "active"
        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
        : status === "rejected" || status === "terminated"
          ? "border-rose-200 bg-rose-50 text-rose-800"
          : "border-slate-200 bg-slate-50 text-slate-700";

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
          {contracts.length > 0 ? (
            <div className="mb-2 flex min-w-56 flex-col gap-1.5">
              {contracts.map((contract) => (
                <div
                  key={contract._id}
                  className="rounded-md border bg-background px-2.5 py-2 text-left"
                >
                  <div className="flex items-center justify-between gap-3">
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto justify-start p-0 text-xs font-semibold"
                      onClick={() => onEditContract(contract)}
                    >
                      <FileSignature className="mr-1.5 h-3.5 w-3.5" />
                      {contract.contractNumber || "View contract"}
                    </Button>
                    <Badge
                      variant="outline"
                      className={getContractStatusStyle(contract.status)}
                    >
                      {getContractStatusLabel(contract.status)}
                    </Badge>
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {contract.contractValue.toLocaleString()} {contract.currency}
                  </div>
                </div>
              ))}
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
          {contracts.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 h-7 text-xs"
              onClick={onCreateContract}
            >
              <FileSignature className="h-3 w-3 mr-1" />
              Add contract
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
