"use client";

import React from "react";
import {
  Eye,
  MoreHorizontal,
  ChevronDown,
  CreditCard,
  Calendar,
  X,
  AlertCircle,
  AlertTriangle,
  ThumbsUp,
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
import { formatCurrency, formatDate } from "../utils";

interface RejectedRequestsTabProps {
  rejectedItems: Imprest[];
  expandedRows: Record<string, boolean>;
  sortConfig: { key: keyof Imprest; direction: "asc" | "desc" };
  rejectedPage: number;
  rejectedTotalPages: number;
  rejectedIndexOfFirstItem: number;
  rejectedIndexOfLastItem: number;
  onToggleRowExpansion: (id: string) => void;
  onSort: (key: keyof Imprest) => void;
  onViewDetails: (imprest: Imprest) => void;
  onSetRejectedPage: (page: number) => void;
  onNewImprestModalOpen: () => void;
}

export function RejectedRequestsTab({
  rejectedItems,
  expandedRows,
  sortConfig,
  rejectedPage,
  rejectedTotalPages,
  rejectedIndexOfFirstItem,
  rejectedIndexOfLastItem,
  onToggleRowExpansion,
  onSort,
  onViewDetails,
  onSetRejectedPage,
  onNewImprestModalOpen,
}: RejectedRequestsTabProps) {
  if (rejectedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="h-16 w-16 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mb-4 border border-rose-200 dark:border-rose-800/50 shadow-sm text-rose-500">
          <ThumbsUp className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-medium">No rejected requests</h3>
        <p className="text-sm text-muted-foreground mt-1">
          You don&apos;t have any rejected imprest applications. That&apos;s
          good news!
        </p>
        <Button
          variant="outline"
          className="mt-4 border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:hover:bg-rose-900/30 dark:text-rose-400"
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
      <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border-b border-rose-200 dark:border-rose-800/50">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-rose-100 dark:bg-rose-900/50 rounded-full text-rose-700 dark:text-rose-400">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium text-rose-800 dark:text-rose-400">
              Rejected Requests
            </h3>
            <p className="text-sm text-rose-700/80 dark:text-rose-300/80 mt-0.5">
              These requests were not approved. Review the feedback and consider
              resubmitting if necessary.
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
                      ? "text-rose-500"
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
                    sortConfig.key === "amount" ? "text-rose-500" : "opacity-40"
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
                      ? "text-rose-500"
                      : "opacity-40"
                  }`}
                />
              </Button>
            </TableHead>
            <TableHead className="hidden lg:table-cell">
              Rejected Date
            </TableHead>
            <TableHead>Rejection Reason</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rejectedItems.map((imprest) => (
            <React.Fragment key={imprest._id}>
              <TableRow className="group hover:bg-rose-50/30 dark:hover:bg-rose-950/10 transition-colors">
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-rose-100/50 dark:hover:bg-rose-900/20"
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
                    <CreditCard className="mr-1 h-4 w-4 text-rose-500" />
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
                  {imprest.rejection && (
                    <div className="flex items-center">
                      <X className="mr-1 h-4 w-4 text-rose-500" />
                      <span>{formatDate(imprest.rejection.rejectedAt)}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px] truncate text-sm text-rose-700 dark:text-rose-400">
                    {imprest.rejection?.reason || "No reason provided"}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-20 group-hover:opacity-100 transition-opacity hover:bg-rose-100/50 dark:hover:bg-rose-900/20 hover:text-rose-700 dark:hover:text-rose-400 rounded-full"
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
                    <div className="bg-rose-50/30 dark:bg-rose-950/10 p-4 border-t border-rose-200/30 dark:border-rose-800/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-background rounded-lg p-4 shadow-sm border border-border/50">
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-rose-500" />
                            Explanation
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {imprest.explanation}
                          </p>
                          {imprest.rejection && (
                            <div className="text-sm mt-4">
                              <div className="flex flex-col space-y-1">
                                <div className="font-medium text-xs text-muted-foreground">
                                  Rejected At:
                                </div>
                                <p className="mt-1 bg-rose-50/50 dark:bg-rose-950/30 p-2 rounded-md border border-rose-200/50 dark:border-rose-800/30 text-rose-700 dark:text-rose-400">
                                  {formatDate(imprest.rejection.rejectedAt)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="bg-background rounded-lg p-4 shadow-sm border border-border/50">
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-rose-500" />
                            Rejection Reason
                          </h4>
                          <div className="space-y-3">
                            {imprest.hodApproval && (
                              <div className="text-sm">
                                <div className="font-medium text-xs text-muted-foreground">
                                  HOD Feedback:
                                </div>
                                <p className="mt-1 bg-rose-50/50 dark:bg-rose-950/30 p-2 rounded-md border border-rose-200/50 dark:border-rose-800/30 text-rose-700 dark:text-rose-400">
                                  {imprest.hodApproval.comments ||
                                    "No specific feedback provided"}
                                </p>
                              </div>
                            )}
                            {imprest.accountantApproval && (
                              <div className="text-sm">
                                <div className="font-medium text-xs text-muted-foreground">
                                  Accountant Feedback:
                                </div>
                                <p className="mt-1 bg-rose-50/50 dark:bg-rose-950/30 p-2 rounded-md border border-rose-200/50 dark:border-rose-800/30 text-rose-700 dark:text-rose-400">
                                  {imprest.accountantApproval.comments ||
                                    "No specific feedback provided"}
                                </p>
                              </div>
                            )}
                            {imprest.rejection && (
                              <div className="text-sm space-y-2">
                                <div className="flex flex-col space-y-1">
                                  <div className="font-medium text-xs text-muted-foreground">
                                    Rejection Reason:
                                  </div>
                                  <p className="mt-1 bg-rose-50/50 dark:bg-rose-950/30 p-2 rounded-md border border-rose-200/50 dark:border-rose-800/30 text-rose-700 dark:text-rose-400">
                                    {imprest.rejection.reason}
                                  </p>
                                </div>
                                <div className="flex flex-col space-y-1">
                                  <div className="font-medium text-xs text-muted-foreground">
                                    Rejected By:
                                  </div>
                                  <p className="mt-1 bg-rose-50/50 dark:bg-rose-950/30 p-2 rounded-md border border-rose-200/50 dark:border-rose-800/30 text-rose-700 dark:text-rose-400">
                                    {imprest.rejection.rejectedBy.firstName}{" "}
                                    {imprest.rejection.rejectedBy.lastName} (
                                    {imprest.rejection.rejectedBy.email})
                                  </p>
                                </div>
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
          <span className="font-medium">{rejectedIndexOfFirstItem + 1}</span> to{" "}
          <span className="font-medium">
            {Math.min(rejectedIndexOfLastItem, rejectedItems.length)}
          </span>{" "}
          of <span className="font-medium">{rejectedItems.length}</span>{" "}
          rejected requests
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onSetRejectedPage(Math.max(rejectedPage - 1, 1))}
                isActive={rejectedPage === 1}
                aria-disabled={rejectedPage === 1}
                className={
                  rejectedPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {Array.from({ length: Math.min(rejectedTotalPages, 5) }, (_, i) => {
              const pageNumber = i + 1;
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    onClick={() => onSetRejectedPage(pageNumber)}
                    isActive={rejectedPage === pageNumber}
                    className={
                      rejectedPage === pageNumber
                        ? "bg-rose-500 text-white hover:bg-rose-600 hover:text-white"
                        : ""
                    }
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            {rejectedTotalPages > 5 && (
              <>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    onClick={() => onSetRejectedPage(rejectedTotalPages)}
                    isActive={rejectedPage === rejectedTotalPages}
                    className={
                      rejectedPage === rejectedTotalPages
                        ? "bg-rose-500 text-white hover:bg-rose-600 hover:text-white"
                        : ""
                    }
                  >
                    {rejectedTotalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  onSetRejectedPage(
                    Math.min(rejectedPage + 1, rejectedTotalPages)
                  )
                }
                isActive={rejectedPage === rejectedTotalPages}
                aria-disabled={rejectedPage === rejectedTotalPages}
                className={
                  rejectedPage === rejectedTotalPages
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
