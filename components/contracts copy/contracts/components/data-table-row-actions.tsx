"use client";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Contract } from "@/types/contract";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { ContractDetailsSheet } from "./contract-details-sheet";
import { FileText, Edit, Trash } from "lucide-react";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const contract = row.original as Contract;
  const { toast } = useToast();
  const router = useRouter();

  const handleStatusChange = async (newStatus: string) => {
    try {
      // TODO: Implement contract status update API call
      toast({
        title: "Status Update",
        description: "This feature will be implemented soon.",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update contract status",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onSelect={() => setIsDetailsOpen(true)}>
            <FileText className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Edit className="mr-2 h-4 w-4" />
            Edit Contract
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600">
            <Trash className="mr-2 h-4 w-4" />
            Delete Contract
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ContractDetailsSheet
        contract={contract}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onStatusChange={handleStatusChange}
      />
    </>
  );
}
