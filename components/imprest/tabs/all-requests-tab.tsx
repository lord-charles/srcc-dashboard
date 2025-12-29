"use client";

import React, { useState } from "react";
import {
  Eye,
  MoreHorizontal,
  ChevronDown,
  CreditCard,
  Calendar,
  Clock,
  X,
  ArrowUpDown,
  Info,
  CheckCircle,
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
import { StatusBadge } from "../status-badge";
import { ApprovalTimeline } from "../approval-timeline";
import { ImprestAccountabilitySection } from "../imprest-accountability-section";
import { AcknowledgmentDialog } from "../acknowledgment-dialog";
import { formatCurrency, formatDate } from "../utils";

interface AllRequestsTabProps {
  currentItems: Imprest[];
  expandedRows: Record<string, boolean>;
  sortConfig: { key: keyof Imprest; direction: "asc" | "desc" };
  currentPage: number;
  totalPages: number;
  indexOfFirstItem: number;
  indexOfLastItem: number;
  sortedDataLength: number;
  onToggleRowExpansion: (id: string) => void;
  onSort: (key: keyof Imprest) => void;
  onViewDetails: (imprest: Imprest) => void;
  onSetCurrentPage: (page: number) => void;
  onAcknowledgeReceipt: (
    id: string,
    received: boolean,
    comments?: string
  ) => Promise<void>;
}

export function AllRequestsTab({
  currentItems,
  expandedRows,
  sortConfig,
  currentPage,
  totalPages,
  indexOfFirstItem,
  indexOfLastItem,
  sortedDataLength,
  onToggleRowExpansion,
  onSort,
  onViewDetails,
  onSetCurrentPage,
  onAcknowledgeReceipt,
}: AllRequestsTabProps) {
  const [acknowledgmentImprest, setAcknowledgmentImprest] =
    useState<Imprest | null>(null);
  const [isAcknowledgmentDialogOpen, setIsAcknowledgmentDialogOpen] =
    useState(false);

  const handleAcknowledge = (imprest: Imprest) => {
    setAcknowledgmentImprest(imprest);
    setIsAcknowledgmentDialogOpen(true);
  };

  if (currentItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4 border border-border/50 shadow-sm">
          <CreditCard className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No results found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          No imprest applications match your current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md">
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
                <ArrowUpDown
                  className={`h-3 w-3 ${
                    sortConfig.key === "paymentReason"
                      ? "text-primary"
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
                <ArrowUpDown
                  className={`h-3 w-3 ${
                    sortConfig.key === "amount" ? "text-primary" : "opacity-40"
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
                <ArrowUpDown
                  className={`h-3 w-3 ${
                    sortConfig.key === "requestDate"
                      ? "text-primary"
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
                <ArrowUpDown
                  className={`h-3 w-3 ${
                    sortConfig.key === "dueDate" ? "text-primary" : "opacity-40"
                  }`}
                />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => onSort("status")}
                className="flex items-center gap-1 font-medium hover:bg-transparent"
              >
                Status
                <ArrowUpDown
                  className={`h-3 w-3 ${
                    sortConfig.key === "status" ? "text-primary" : "opacity-40"
                  }`}
                />
              </Button>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((imprest) => (
            <React.Fragment key={imprest._id}>
              <TableRow className="group hover:bg-muted/20 transition-colors">
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-primary/10"
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
                    <CreditCard className="mr-1 h-4 w-4 text-primary" />
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
                  <StatusBadge status={imprest.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {imprest.status === "pending_acknowledgment" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-20 group-hover:opacity-100 transition-opacity hover:bg-amber-100 hover:text-amber-700 rounded-full"
                        onClick={() => handleAcknowledge(imprest)}
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span className="sr-only">Acknowledge Receipt</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-20 group-hover:opacity-100 transition-opacity hover:bg-primary/10 hover:text-primary rounded-full"
                      onClick={() => onViewDetails(imprest)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View Details</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>

              {expandedRows[imprest._id] &&
                (imprest.status === "disbursed" ? (
                  <ImprestAccountabilitySection imprest={imprest} />
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="p-0 border-t-0">
                      <div className="bg-muted/20 p-4 border-t border-border/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-background rounded-lg p-4 shadow-sm border border-border/50">
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                              <Info className="h-4 w-4 text-primary" />
                              Explanation
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {imprest.explanation}
                            </p>
                          </div>
                          <div className="bg-background rounded-lg p-4 shadow-sm border border-border/50">
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                              <Clock className="h-4 w-4 text-primary" />
                              Approval Timeline
                            </h4>
                            <ApprovalTimeline imprest={imprest} />
                          </div>
                        </div>
                        <div className="flex justify-end mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8"
                            onClick={() => onViewDetails(imprest)}
                          >
                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                            View Full Details
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-t gap-4">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
          <span className="font-medium">
            {Math.min(indexOfLastItem, sortedDataLength)}
          </span>{" "}
          of <span className="font-medium">{sortedDataLength}</span> results
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onSetCurrentPage(Math.max(currentPage - 1, 1))}
                isActive={currentPage === 1}
                aria-disabled={currentPage === 1}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNumber = i + 1;
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    onClick={() => onSetCurrentPage(pageNumber)}
                    isActive={currentPage === pageNumber}
                    className={
                      currentPage === pageNumber
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                        : ""
                    }
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            {totalPages > 5 && (
              <>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    onClick={() => onSetCurrentPage(totalPages)}
                    isActive={currentPage === totalPages}
                    className={
                      currentPage === totalPages
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                        : ""
                    }
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  onSetCurrentPage(Math.min(currentPage + 1, totalPages))
                }
                isActive={currentPage === totalPages}
                aria-disabled={currentPage === totalPages}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Acknowledgment Dialog */}
      <AcknowledgmentDialog
        imprest={acknowledgmentImprest}
        open={isAcknowledgmentDialogOpen}
        onOpenChange={setIsAcknowledgmentDialogOpen}
        onAcknowledge={onAcknowledgeReceipt}
      />
    </div>
  );
}
