"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { FileSignature, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Contract, TeamMember } from "@/types/project";

export interface TeamMemberTableRow {
  member: TeamMember;
  assignment?: TeamMember;
  contracts: Contract[];
}

interface TeamMembersTableProps {
  rows: TeamMemberTableRow[];
  scopeMilestoneId?: string;
  onCreateContract: (member: TeamMember, milestoneId?: string) => void;
  onEditContract: (contract: Contract) => void;
  onEditAssignment: (assignment: TeamMember) => void;
  onDeleteMember: (member: TeamMember) => void;
  isDeleting: boolean;
}

const getInitials = (firstName?: string, lastName?: string) =>
  `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();

const getStatusLabel = (status: Contract["status"]) =>
  status
    .replace(/^pending_/, "Pending ")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const getStatusStyle = (status: Contract["status"]) =>
  status.startsWith("pending_")
    ? "border-amber-200 bg-amber-50 text-amber-800"
    : status === "active"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : status === "rejected" || status === "terminated"
        ? "border-rose-200 bg-rose-50 text-rose-800"
        : "border-slate-200 bg-slate-50 text-slate-700";

export function TeamMembersTable({
  rows,
  scopeMilestoneId,
  onCreateContract,
  onEditContract,
  onEditAssignment,
  onDeleteMember,
  isDeleting,
}: TeamMembersTableProps) {
  const scopeLabel = scopeMilestoneId ? "Milestone" : "Project-wide";

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden rounded-md border">
      <Table className="w-full min-w-[880px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Team Member</TableHead>
            <TableHead className="w-[190px]">Assignment</TableHead>
            <TableHead className="w-[130px]">Responsibilities</TableHead>
            <TableHead>Contracts</TableHead>
            <TableHead className="w-[180px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ member, assignment, contracts }) => {
            const user = member.userId;
            const responsibilities = assignment?.responsibilities?.length
              ? assignment.responsibilities
              : member.responsibilities || [];

            return (
              <TableRow key={`${user?._id || member._id}-${scopeMilestoneId || "project-wide"}`} className="align-top">
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage
                        src={`https://avatar.vercel.sh/${user?.email || ""}`}
                        alt={`${user?.firstName || ""} ${user?.lastName || ""}`.trim()}
                      />
                      <AvatarFallback>
                        {getInitials(user?.firstName, user?.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">
                          {user?.firstName} {user?.lastName}
                        </span>
                        {member.isOrganization && (
                          <Badge variant="outline" className="text-[10px]">
                            Organization
                          </Badge>
                        )}
                      </div>
                      <div className="max-w-[180px] truncate text-xs text-muted-foreground">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-start gap-1.5">
                    <div>
                      <Badge variant={assignment ? "outline" : "secondary"}>
                        {assignment
                          ? scopeMilestoneId
                            ? "Assigned"
                            : "Project-wide"
                          : "Contract only"}
                      </Badge>
                      {(assignment?.startDate || member.startDate) && (
                        <div className="mt-1 text-[10px] text-muted-foreground">
                          Since {formatDate(assignment?.startDate || member.startDate)}
                        </div>
                      )}
                    </div>
                    {assignment && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => onEditAssignment(assignment)}
                        aria-label={`Edit ${scopeLabel.toLowerCase()} assignment`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  {responsibilities.length ? (
                    <div className="flex max-w-[130px] flex-wrap gap-1">
                      {responsibilities.map((responsibility) => (
                        <Badge key={responsibility} variant="secondary" className="text-[10px]">
                          {responsibility}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="py-3">
                  {contracts.length ? (
                    <div className="max-w-[430px]">
                      {contracts.length > 1 && (
                        <div className="mb-2">
                          <Badge variant="outline">
                            {contracts.length} contracts
                          </Badge>
                        </div>
                      )}
                      <div className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
                        {contracts.map((contract) => (
                          <div
                            key={contract._id}
                            className="rounded-md border bg-muted/20 px-2.5 py-2"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto justify-start p-0 text-xs font-semibold"
                                onClick={() => onEditContract(contract)}
                              >
                                <FileSignature className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                                {contract.contractNumber || "View contract"}
                              </Button>
                              <Badge variant="outline" className={getStatusStyle(contract.status)}>
                                {getStatusLabel(contract.status)}
                              </Badge>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center justify-between gap-x-2 text-[11px] text-muted-foreground">
                              <span className="whitespace-nowrap">
                                {contract.contractValue.toLocaleString()} {contract.currency}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <span className="whitespace-nowrap text-sm text-muted-foreground">
                      No contracts yet
                    </span>
                  )}
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap"
                      onClick={() => onCreateContract(member, scopeMilestoneId)}
                    >
                      <FileSignature className="mr-1.5 h-3.5 w-3.5" />
                      {contracts.length ? "Add contract" : "Award contract"}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/90">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove team member</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove team member?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove {user?.firstName} {user?.lastName} from the project.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDeleteMember(member)}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isDeleting ? "Removing..." : "Remove"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
