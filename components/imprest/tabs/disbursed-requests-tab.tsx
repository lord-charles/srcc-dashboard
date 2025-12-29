"use client";

import React, { useState } from "react";
import {
  Eye,
  MoreHorizontal,
  ChevronDown,
  CreditCard,
  Download,
  CheckCircle,
  AlertTriangle,
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
import { ImprestAccountabilitySection } from "../imprest-accountability-section";
import { AcknowledgmentDialog } from "../acknowledgment-dialog";
import { formatCurrency, formatDate } from "../utils";

interface DisbursedRequestsTabProps {
  disbursedItems: Imprest[];
  expandedRows: Record<string, boolean>;
  sortConfig: { key: keyof Imprest; direction: "asc" | "desc" };
  disbursedPage: number;
  disbursedTotalPages: number;
  disbursedIndexOfFirstItem: number;
  disbursedIndexOfLastItem: number;
  onToggleRowExpansion: (id: string) => void;
  onSort: (key: keyof Imprest) => void;
  onViewDetails: (imprest: Imprest) => void;
  onSetDisbursedPage: (page: number) => void;
  onAcknowledgeReceipt: (
    id: string,
    received: boolean,
    comments?: string
  ) => Promise<void>;
}

export function DisbursedRequestsTab({
  disbursedItems,
  expandedRows,
  sortConfig,
  disbursedPage,
  disbursedTotalPages,
  disbursedIndexOfFirstItem,
  disbursedIndexOfLastItem,
  onToggleRowExpansion,
  onSort,
  onViewDetails,
  onSetDisbursedPage,
  onAcknowledgeReceipt,
}: DisbursedRequestsTabProps) {
  const [acknowledgmentImprest, setAcknowledgmentImprest] =
    useState<Imprest | null>(null);
  const [isAcknowledgmentDialogOpen, setIsAcknowledgmentDialogOpen] =
    useState(false);

  const handleAcknowledgeClick = (imprest: Imprest) => {
    setAcknowledgmentImprest(imprest);
    setIsAcknowledgmentDialogOpen(true);
  };

  const handleAcknowledgeReceipt = async (
    id: string,
    received: boolean,
    comments?: string
  ) => {
    await onAcknowledgeReceipt(id, received, comments);
    setAcknowledgmentImprest(null);
    setIsAcknowledgmentDialogOpen(false);
  };
  if (disbursedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <div className="p-4 rounded-full bg-primary/5">
          <CreditCard className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-medium">No Disbursed Requests</h3>
        <p className="text-sm text-muted-foreground">
          You don&apos;t have any disbursed imprest requests yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md">
      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border-b border-blue-200 dark:border-blue-800/50">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-700 dark:text-blue-400">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium text-blue-800 dark:text-blue-400">
              Disbursed Requests
            </h3>
            <p className="text-sm text-blue-700/80 dark:text-blue-300/80 mt-0.5">
              These requests have been disbursed and you can collect the cash.
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
                <ChevronDown
                  className={`h-3 w-3 ${
                    sortConfig.key === "amount" ? "text-primary" : "opacity-40"
                  }`}
                />
              </Button>
            </TableHead>
            <TableHead className="hidden md:table-cell">Request Date</TableHead>
            <TableHead className="hidden lg:table-cell">Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {disbursedItems.map((imprest) => (
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
                  {formatDate(imprest.requestDate)}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {formatDate(imprest.dueDate)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <StatusBadge status={imprest.status} />
                    {imprest.status === "pending_acknowledgment" && (
                      <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Awaiting acknowledgment</span>
                      </div>
                    )}
                    {imprest.acknowledgment && (
                      <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="h-3 w-3" />
                        <span>
                          Receipt{" "}
                          {imprest.acknowledgment.received
                            ? "confirmed"
                            : "disputed"}
                        </span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {imprest.status === "pending_acknowledgment" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-20 group-hover:opacity-100 transition-opacity hover:bg-amber-100 hover:text-amber-700 rounded-full"
                        onClick={() => handleAcknowledgeClick(imprest)}
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

              {expandedRows[imprest._id] && (
                <ImprestAccountabilitySection imprest={imprest} />
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between px-6 py-4 border-t">
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium">{disbursedIndexOfFirstItem + 1}</span>{" "}
          to{" "}
          <span className="font-medium">
            {Math.min(disbursedIndexOfLastItem, disbursedItems.length)}
          </span>{" "}
          of <span className="font-medium">{disbursedItems.length}</span>{" "}
          results
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() =>
                  onSetDisbursedPage(Math.max(disbursedPage - 1, 1))
                }
                isActive={disbursedPage === 1}
                aria-disabled={disbursedPage === 1}
                className={
                  disbursedPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            {Array.from(
              { length: Math.min(disbursedTotalPages, 5) },
              (_, i) => {
                const pageNumber = i + 1;
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => onSetDisbursedPage(pageNumber)}
                      isActive={disbursedPage === pageNumber}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
            )}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  onSetDisbursedPage(
                    Math.min(disbursedPage + 1, disbursedTotalPages)
                  )
                }
                isActive={disbursedPage === disbursedTotalPages}
                aria-disabled={disbursedPage === disbursedTotalPages}
                className={
                  disbursedPage === disbursedTotalPages
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
        onAcknowledge={handleAcknowledgeReceipt}
      />
    </div>
  );
}
