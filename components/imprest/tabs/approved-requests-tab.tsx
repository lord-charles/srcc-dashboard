"use client";

import React from "react";
import {
  Eye,
  MoreHorizontal,
  ChevronDown,
  CreditCard,
  Calendar,
  Check,
  MessageSquare,
  FileCheck,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Imprest } from "../imprest-dashboard";
import { formatCurrency, formatDate } from "../utils";

interface ApprovedRequestsTabProps {
  approvedItems: Imprest[];
  expandedRows: Record<string, boolean>;
  sortConfig: { key: keyof Imprest; direction: "asc" | "desc" };
  approvedPage: number;
  approvedTotalPages: number;
  approvedIndexOfFirstItem: number;
  approvedIndexOfLastItem: number;
  onToggleRowExpansion: (id: string) => void;
  onSort: (key: keyof Imprest) => void;
  onViewDetails: (imprest: Imprest) => void;
  onSetApprovedPage: (page: number) => void;
  onNewImprestModalOpen: () => void;
}

export function ApprovedRequestsTab({
  approvedItems,
  expandedRows,
  sortConfig,
  approvedPage,
  approvedTotalPages,
  approvedIndexOfFirstItem,
  approvedIndexOfLastItem,
  onToggleRowExpansion,
  onSort,
  onViewDetails,
  onSetApprovedPage,
  onNewImprestModalOpen,
}: ApprovedRequestsTabProps) {
  if (approvedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4 border border-emerald-200 dark:border-emerald-800/50 shadow-sm text-emerald-500">
          <FileCheck className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-medium">No approved requests</h3>
        <p className="text-sm text-muted-foreground mt-1">
          You don&apos;t have any approved imprest applications yet.
        </p>
        <Button
          variant="outline"
          className="mt-4 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/30 dark:text-emerald-400"
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
      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-800/50">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-full text-emerald-700 dark:text-emerald-400">
            <Check className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium text-emerald-800 dark:text-emerald-400">
              Approved Requests
            </h3>
            <p className="text-sm text-emerald-700/80 dark:text-emerald-300/80 mt-0.5">
              These requests have been fully approved and processed.
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
                      ? "text-emerald-500"
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
                      ? "text-emerald-500"
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
                      ? "text-emerald-500"
                      : "opacity-40"
                  }`}
                />
              </Button>
            </TableHead>
            <TableHead className="hidden lg:table-cell">
              Approved Date
            </TableHead>
            <TableHead>Approved By</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {approvedItems.map((imprest) => (
            <React.Fragment key={imprest._id}>
              <TableRow className="group hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10 transition-colors">
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20"
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
                    <CreditCard className="mr-1 h-4 w-4 text-emerald-500" />
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
                  {imprest.accountantApproval && (
                    <div className="flex items-center">
                      <Check className="mr-1 h-4 w-4 text-emerald-500" />
                      <span>
                        {formatDate(imprest.accountantApproval.approvedAt)}
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {imprest.accountantApproval && (
                    <div className="flex items-center gap-1.5">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                          {imprest.accountantApproval.approvedBy.firstName.charAt(
                            0
                          )}
                          {imprest.accountantApproval.approvedBy.lastName.charAt(
                            0
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">
                        {imprest.accountantApproval.approvedBy.firstName}{" "}
                        {imprest.accountantApproval.approvedBy.lastName}
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-20 group-hover:opacity-100 transition-opacity hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-full"
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
                    <div className="bg-emerald-50/30 dark:bg-emerald-950/10 p-4 border-t border-emerald-200/30 dark:border-emerald-800/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-background rounded-lg p-4 shadow-sm border border-border/50">
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-emerald-500" />
                            Explanation
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {imprest.explanation}
                          </p>
                        </div>
                        <div className="bg-background rounded-lg p-4 shadow-sm border border-border/50">
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-emerald-500" />
                            Approval Comments
                          </h4>
                          <div className="space-y-3">
                            {imprest.hodApproval && (
                              <div className="text-sm">
                                <div className="font-medium text-xs text-muted-foreground">
                                  HOD Comment:
                                </div>
                                <p className="mt-1 bg-muted/20 p-2 rounded-md">
                                  {imprest.hodApproval.comments ||
                                    "No comments provided"}
                                </p>
                              </div>
                            )}
                            {imprest.accountantApproval && (
                              <div className="text-sm">
                                <div className="font-medium text-xs text-muted-foreground">
                                  Accountant Comment:
                                </div>
                                <p className="mt-1 bg-muted/20 p-2 rounded-md">
                                  {imprest.accountantApproval.comments ||
                                    "No comments provided"}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
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
          <span className="font-medium">{approvedIndexOfFirstItem + 1}</span> to{" "}
          <span className="font-medium">
            {Math.min(approvedIndexOfLastItem, approvedItems.length)}
          </span>{" "}
          of <span className="font-medium">{approvedItems.length}</span>{" "}
          approved requests
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onSetApprovedPage(Math.max(approvedPage - 1, 1))}
                isActive={approvedPage === 1}
                aria-disabled={approvedPage === 1}
                className={
                  approvedPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {Array.from({ length: Math.min(approvedTotalPages, 5) }, (_, i) => {
              const pageNumber = i + 1;
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    onClick={() => onSetApprovedPage(pageNumber)}
                    isActive={approvedPage === pageNumber}
                    className={
                      approvedPage === pageNumber
                        ? "bg-emerald-500 text-white hover:bg-emerald-600 hover:text-white"
                        : ""
                    }
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            {approvedTotalPages > 5 && (
              <>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    onClick={() => onSetApprovedPage(approvedTotalPages)}
                    isActive={approvedPage === approvedTotalPages}
                    className={
                      approvedPage === approvedTotalPages
                        ? "bg-emerald-500 text-white hover:bg-emerald-600 hover:text-white"
                        : ""
                    }
                  >
                    {approvedTotalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  onSetApprovedPage(
                    Math.min(approvedPage + 1, approvedTotalPages)
                  )
                }
                isActive={approvedPage === approvedTotalPages}
                aria-disabled={approvedPage === approvedTotalPages}
                className={
                  approvedPage === approvedTotalPages
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
