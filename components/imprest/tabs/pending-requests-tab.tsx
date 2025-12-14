"use client";

import React from "react";
import {
  Eye,
  MoreHorizontal,
  ChevronDown,
  CreditCard,
  Calendar,
  Clock,
  X,
  Bell,
  Check,
  CheckCircle,
  Plus,
} from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Imprest } from "../imprest-dashboard";
import { ApprovalTimeline } from "../approval-timeline";
import { formatCurrency, formatDate } from "../utils";

interface PendingRequestsTabProps {
  pendingItems: Imprest[];
  expandedRows: Record<string, boolean>;
  sortConfig: { key: keyof Imprest; direction: "asc" | "desc" };
  pendingPage: number;
  pendingTotalPages: number;
  pendingIndexOfFirstItem: number;
  pendingIndexOfLastItem: number;
  onToggleRowExpansion: (id: string) => void;
  onSort: (key: keyof Imprest) => void;
  onViewDetails: (imprest: Imprest) => void;
  onSetPendingPage: (page: number) => void;
  onNewImprestModalOpen: () => void;
}

export function PendingRequestsTab({
  pendingItems,
  expandedRows,
  sortConfig,
  pendingPage,
  pendingTotalPages,
  pendingIndexOfFirstItem,
  pendingIndexOfLastItem,
  onToggleRowExpansion,
  onSort,
  onViewDetails,
  onSetPendingPage,
  onNewImprestModalOpen,
}: PendingRequestsTabProps) {
  if (pendingItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="h-16 w-16 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-4 border border-amber-200 dark:border-amber-800/50 shadow-sm text-amber-500">
          <CheckCircle className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-medium">No pending requests</h3>
        <p className="text-sm text-muted-foreground mt-1">
          You don&apos;t have any imprest applications awaiting approval.
        </p>
        <Button
          variant="outline"
          className="mt-4 border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:hover:bg-amber-900/30 dark:text-amber-400"
          onClick={onNewImprestModalOpen}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Request
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-md">
      <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/50">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-full text-amber-700 dark:text-amber-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium text-amber-800 dark:text-amber-400">
              Pending Approval
            </h3>
            <p className="text-sm text-amber-700/80 dark:text-amber-300/80 mt-0.5">
              These requests are awaiting approval from either your HOD or the
              accountant.
            </p>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="w-[40px]"></TableHead>
            <TableHead className="w-[180px]">
              <Button
                variant="ghost"
                onClick={() => onSort("paymentReason")}
                className="flex items-center gap-1 font-medium hover:bg-transparent"
              >
                Payment Reason
                <ChevronDown
                  className={`h-3 w-3 ${
                    sortConfig.key === "paymentReason"
                      ? "text-amber-500"
                      : "opacity-40"
                  }`}
                />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => onSort("amount")}
                className="flex items-center gap-1 font-medium hover:bg-transparent"
              >
                Amount
                <ChevronDown
                  className={`h-3 w-3 ${
                    sortConfig.key === "amount"
                      ? "text-amber-500"
                      : "opacity-40"
                  }`}
                />
              </Button>
            </TableHead>
            <TableHead className="hidden md:table-cell">
              <Button
                variant="ghost"
                onClick={() => onSort("requestDate")}
                className="flex items-center gap-1 font-medium hover:bg-transparent"
              >
                Request Date
                <ChevronDown
                  className={`h-3 w-3 ${
                    sortConfig.key === "requestDate"
                      ? "text-amber-500"
                      : "opacity-40"
                  }`}
                />
              </Button>
            </TableHead>
            <TableHead className="hidden lg:table-cell">
              <Button
                variant="ghost"
                onClick={() => onSort("dueDate")}
                className="flex items-center gap-1 font-medium hover:bg-transparent"
              >
                Due Date
                <ChevronDown
                  className={`h-3 w-3 ${
                    sortConfig.key === "dueDate"
                      ? "text-amber-500"
                      : "opacity-40"
                  }`}
                />
              </Button>
            </TableHead>
            <TableHead>Approval Stage</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingItems.map((imprest) => (
            <React.Fragment key={imprest._id}>
              <TableRow className="group hover:bg-amber-50/30 dark:hover:bg-amber-950/10 transition-colors">
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-amber-100/50 dark:hover:bg-amber-900/20"
                    onClick={() => onToggleRowExpansion(imprest._id)}
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        expandedRows[imprest._id] ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                </TableCell>
                <TableCell className="font-medium">
                  <div>
                    <div className="font-medium truncate max-w-[180px]">
                      {imprest.paymentReason}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {imprest.paymentType}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <CreditCard className="mr-1 h-4 w-4 text-amber-500" />
                    <span className="font-medium">
                      {formatCurrency(imprest.amount, imprest.currency)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(imprest.requestDate)}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(imprest.dueDate)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        imprest.hodApproval ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                    <span className="text-sm">
                      {imprest.hodApproval ? "Accountant Review" : "HOD Review"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-20 group-hover:opacity-100 transition-opacity hover:bg-amber-100/50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-400 rounded-full"
                      onClick={() => onViewDetails(imprest)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View Details</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>

              {expandedRows[imprest._id] && (
                <TableRow>
                  <TableCell colSpan={7} className="p-0 border-t-0">
                    <div className="bg-amber-50/30 dark:bg-amber-950/10 p-4 border-t border-amber-200/30 dark:border-amber-800/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-background rounded-lg p-4 shadow-sm border border-border/50">
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-amber-500" />
                            Explanation
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {imprest.explanation}
                          </p>
                        </div>
                        <div className="bg-background rounded-lg p-4 shadow-sm border border-border/50">
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-amber-500" />
                            Approval Status
                          </h4>
                          <ApprovalTimeline imprest={imprest} />
                        </div>
                      </div>
                      <div className="flex justify-end mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-8 border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:hover:bg-amber-900/30 dark:text-amber-400"
                        >
                          <Bell className="mr-1.5 h-3.5 w-3.5" />
                          Send Reminder
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-t gap-4">
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium">{pendingIndexOfFirstItem + 1}</span> to{" "}
          <span className="font-medium">
            {Math.min(pendingIndexOfLastItem, pendingItems.length)}
          </span>{" "}
          of <span className="font-medium">{pendingItems.length}</span> pending
          requests
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onSetPendingPage(Math.max(pendingPage - 1, 1))}
                isActive={pendingPage === 1}
                aria-disabled={pendingPage === 1}
                className={
                  pendingPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {Array.from({ length: Math.min(pendingTotalPages, 5) }, (_, i) => {
              const pageNumber = i + 1;
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    onClick={() => onSetPendingPage(pageNumber)}
                    isActive={pendingPage === pageNumber}
                    className={
                      pendingPage === pageNumber
                        ? "bg-amber-500 text-white hover:bg-amber-600 hover:text-white"
                        : ""
                    }
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            {pendingTotalPages > 5 && (
              <>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    onClick={() => onSetPendingPage(pendingTotalPages)}
                    isActive={pendingPage === pendingTotalPages}
                    className={
                      pendingPage === pendingTotalPages
                        ? "bg-amber-500 text-white hover:bg-amber-600 hover:text-white"
                        : ""
                    }
                  >
                    {pendingTotalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  onSetPendingPage(Math.min(pendingPage + 1, pendingTotalPages))
                }
                isActive={pendingPage === pendingTotalPages}
                aria-disabled={pendingPage === pendingTotalPages}
                className={
                  pendingPage === pendingTotalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
