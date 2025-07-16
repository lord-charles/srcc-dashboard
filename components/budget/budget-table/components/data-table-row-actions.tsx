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
import { Budget } from "@/types/budget";
import { BudgetDrawer } from "../../budget-drawer-details";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";

interface DataTableRowActionsProps {
  row: Row<Budget>;
}

export function DataTableRowActions({
  row,
}: DataTableRowActionsProps) {
  const [open, setOpen] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  return (
    <div className="relative">
      <DropdownMenu open={open} onOpenChange={setOpen}>
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
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setShowDrawer(true);
              setOpen(false);
            }}
          >
            View Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <Link href={`/projects/${row.original.projectId?._id}?tab=budget`}>
            <DropdownMenuItem>Edit Budget</DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>

      {showDrawer && (
        <BudgetDrawer
          budget={row.original}
          trigger={<div style={{ display: 'none' }} />}
          onClose={() => setShowDrawer(false)}
        />
      )}
    </div>
  );
}