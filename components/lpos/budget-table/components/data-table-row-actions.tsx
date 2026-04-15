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
import { Lpo } from "@/types/lpo";
import { LpoDetailsDrawer } from "./lpo-details-drawer";
import Link from "next/link";
import { MoreHorizontal, FileText, ExternalLink, History } from "lucide-react";

interface DataTableRowActionsProps {
  row: Row<Lpo>;
}

export function DataTableRowActions({
  row,
}: DataTableRowActionsProps) {
  const [open, setOpen] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const lpo = row.original;

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
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setShowDrawer(true);
              setOpen(false);
            }}
          >
            <FileText className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <Link href={`/projects/${lpo.projectId?._id}?tab=lpo`}>
            <DropdownMenuItem>
              <ExternalLink className="mr-2 h-4 w-4" />
              Go to Project LPOs
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem disabled>
             <History className="mr-2 h-4 w-4" />
             View History
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showDrawer && (
        <LpoDetailsDrawer
          lpo={lpo}
          trigger={<div style={{ display: 'none' }} />}
          open={showDrawer}
          onOpenChange={setShowDrawer}
          onClose={() => {
            setShowDrawer(false);
          }}
        />
      )}
    </div>
  );
}