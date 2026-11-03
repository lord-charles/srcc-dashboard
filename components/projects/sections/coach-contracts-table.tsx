"use client";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileSignature, Trash2 } from "lucide-react";
import type { CoachAssignment, Contract } from "@/types/project";

interface CoachContractsTableProps {
  coaches: CoachAssignment[];
  getContracts: (coachId: string, milestoneId: string) => Contract[];
  onCreateContract: (coach: CoachAssignment) => void;
  onEditContract: (contract: Contract) => void;
  onDeleteCoach: (coach: CoachAssignment) => void;
  isDeleting: boolean;
}

const statusLabel = (status: Contract["status"]) =>
  status.replace(/^pending_/, "Pending ").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const statusClass = (status: Contract["status"]) =>
  status.startsWith("pending_")
    ? "border-amber-200 bg-amber-50 text-amber-800"
    : status === "active"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : status === "rejected" || status === "terminated"
        ? "border-rose-200 bg-rose-50 text-rose-800"
        : "border-slate-200 bg-slate-50 text-slate-700";

export function CoachContractsTable({
  coaches,
  getContracts,
  onCreateContract,
  onEditContract,
  onDeleteCoach,
  isDeleting,
}: CoachContractsTableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-md border">
      <Table className="min-w-[760px]">
        <TableHeader>
          <TableRow>
            <TableHead>Coach</TableHead>
            <TableHead>Responsibilities</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead>Contracts</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coaches.map((coach) => {
            const user = coach.userId;
            const contracts = getContracts(user?._id, coach.milestoneId);
            return (
              <TableRow key={coach._id} className="align-top">
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage src={`https://avatar.vercel.sh/${user?.email || ""}`} alt={`${user?.firstName || ""} ${user?.lastName || ""}`.trim()} />
                      <AvatarFallback>{`${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-medium">{user?.firstName} {user?.lastName}</div>
                      <div className="max-w-[190px] truncate text-xs text-muted-foreground">{user?.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex max-w-[190px] flex-wrap gap-1">
                    {coach.responsibilities?.length ? coach.responsibilities.map((item) => (
                      <Badge key={item} variant="secondary" className="text-[10px]">{item}</Badge>
                    )) : <span className="text-sm text-muted-foreground">—</span>}
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap py-4">
                  <Badge variant="outline">
                    {coach.contract.rate.toLocaleString()} {coach.contract.currency} / {coach.contract.rateUnit === "per_session" ? "session" : "hour"}
                  </Badge>
                </TableCell>
                <TableCell className="py-3">
                  {contracts.length ? (
                    <div className="max-h-40 max-w-[380px] space-y-1.5 overflow-y-auto pr-1">
                      {contracts.map((contract) => (
                        <div key={contract._id} className="rounded-md border bg-muted/20 px-2.5 py-2">
                          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                            <Button variant="link" size="sm" className="h-auto justify-start p-0 text-xs font-semibold" onClick={() => onEditContract(contract)}>
                              <FileSignature className="mr-1.5 h-3.5 w-3.5" />{contract.contractNumber || "View contract"}
                            </Button>
                            <Badge variant="outline" className={statusClass(contract.status)}>{statusLabel(contract.status)}</Badge>
                          </div>
                          <div className="mt-1 text-[11px] text-muted-foreground">{contract.contractValue.toLocaleString()} {contract.currency}</div>
                        </div>
                      ))}
                    </div>
                  ) : <span className="text-sm text-muted-foreground">No contracts yet</span>}
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button variant="outline" size="sm" className="whitespace-nowrap" onClick={() => onCreateContract(coach)}>
                      <FileSignature className="mr-1.5 h-3.5 w-3.5" />{contracts.length ? "Add contract" : "Award contract"}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/90" aria-label={`Remove ${user?.firstName || "coach"}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove coach?</AlertDialogTitle>
                          <AlertDialogDescription>This will remove {user?.firstName} {user?.lastName} from this milestone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDeleteCoach(coach)} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
