"use client";

import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Download, AlertCircle } from "lucide-react";
import { Imprest } from "@/types/imprest";
import { ImprestDetailsDrawer } from "./imprest-details-drawer";
import { useToast } from "@/hooks/use-toast";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  onAction?: () => void;
}

export function DataTableRowActions<TData>({
  row,
  onAction,
}: DataTableRowActionsProps<TData>) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const imprest = row.original as Imprest;
  const { toast } = useToast();

  const handleDownloadReceipts = () => {
    toast({
      title: "Coming Soon",
      description: "Receipt download functionality will be available soon.",
    });
  };

  const handleMarkOverdue = () => {
    toast({
      title: "Coming Soon",
      description: "Mark as overdue functionality will be available soon.",
    });
  };

  const hasReceipts =
    imprest.status === "accounted" &&
    imprest.accounting?.receipts &&
    imprest.accounting.receipts.length > 0;
  const canMarkOverdue =
    imprest.status === "disbursed" && new Date(imprest.dueDate) < new Date();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={() => setIsDetailsOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>

          {hasReceipts && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDownloadReceipts}>
                <Download className="mr-2 h-4 w-4" />
                Download Receipts
              </DropdownMenuItem>
            </>
          )}

          {canMarkOverdue && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleMarkOverdue}>
                <AlertCircle className="mr-2 h-4 w-4" />
                Mark as Overdue
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ImprestDetailsDrawer
        imprest={imprest}
        trigger={
          <Button variant="ghost" className="hidden">
            Open Detailsh
          </Button>
        }
        open={isDetailsOpen}
        onOpenChange={() => {
          setIsDetailsOpen(!isDetailsOpen), location.reload();
        }}
        onClose={() => {
          setIsDetailsOpen(false), location.reload();
        }}
      />
    </>
  );
}
