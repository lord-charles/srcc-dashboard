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
import { FileText, Edit, Trash } from "lucide-react";
import { ContractDetailsDrawer } from "./contract-details-drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { deleteContract } from "@/services/contracts.service";
import { Spinner } from "@/components/ui/spinner";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const contract = row.original as Contract;
  const { toast } = useToast();
  const router = useRouter();



  const handleDeleteContract = async () => {
    try {
      setIsDeleting(true);
      await deleteContract(contract._id);

      toast({
        title: "Contract deleted",
        description: "The contract has been successfully deleted.",
      });

      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the contract. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
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
          <DropdownMenuItem
            onSelect={() =>
              router.push(`/projects/${contract.projectId._id}?tab=contracts`)
            }
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Contract
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => setIsDeleteDialogOpen(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete Contract
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ContractDetailsDrawer
        contract={contract}
        trigger={
          <Button
            variant="ghost"
            className="hidden"
          >
            Open Details
          </Button>
        }
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contract</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this contract? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border rounded-md p-4">
              <h4 className="font-medium">{contract.contractNumber}</h4>
              <p className="text-sm mt-1">{contract.description}</p>
              <div className="mt-2 flex items-center">
                <span className="text-sm font-medium mr-2">
                  Contracted User:
                </span>
                <span className="text-sm">
                  {contract.contractedUserId.firstName}{" "}
                  {contract.contractedUserId.lastName}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteContract}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="flex items-center space-x-2">
                  <Spinner />
                  <span>Deleting...</span>
                </div>
              ) : (
                "Delete Contract"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
