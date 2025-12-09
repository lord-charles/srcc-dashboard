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
import { useToast } from "@/hooks/use-toast";
import { FileText, Trash, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Claim } from "@/types/claim";
import { ClaimDetailsDrawer } from "./claim-details-drawer";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const claim = row.original as Claim;
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const { deleteClaim } = await import("@/services/claims.service");
      await deleteClaim(claim._id);

      toast({
        title: "Claim Deleted",
        description: "The claim has been successfully deleted.",
      });

      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description:
          error.message ||
          "Failed to delete claim. Only draft or cancelled claims can be deleted.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
  };

  const handleCancel = async () => {
    try {
      setIsCancelling(true);
      const { cancelClaim } = await import("@/services/claims.service");
      await cancelClaim(claim._id);

      toast({
        title: "Claim Cancelled",
        description:
          "The claim has been successfully cancelled. The claim creator has been notified.",
      });

      setIsCancelDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Cancel Failed",
        description:
          error.message ||
          "Failed to cancel claim. Only draft or pending claims can be cancelled.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
  };

  // Determine which actions are available based on claim status
  // const canCancel = [
  //   "draft",
  //   "pending_checker_approval",
  //   "pending_reviewer_approval",
  //   "pending_approver_approval",
  //   "pending_srcc_checker_approval",
  //   "pending_srcc_finance_approval",
  //   "pending_director_approval",
  //   "pending_academic_director_approval",
  //   "pending_finance_approval",
  // ].includes(claim.status);
  // const canDelete = ["draft", "cancelled"].includes(claim.status);

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

          {/* {canCancel && ( */}
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => setIsCancelDialogOpen(true)}
              className="text-orange-600 focus:text-orange-600"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Claim
            </DropdownMenuItem>
          </>
          {/* )} */}

          {/* {canDelete && ( */}
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => setIsDeleteDialogOpen(true)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Claim
            </DropdownMenuItem>
          </>
          {/* )} */}
        </DropdownMenuContent>
      </DropdownMenu>

      <ClaimDetailsDrawer
        claim={claim}
        trigger={
          <Button variant="ghost" className="hidden">
            Open Details
          </Button>
        }
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false), location.reload();
        }}
      />

      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Claim</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this claim? The claim creator will
              be notified via email and SMS. Cancelled claims can be deleted but
              cannot be resubmitted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isCancelling}>
                No, Keep Claim
              </Button>
            </DialogClose>
            <Button
              variant="default"
              onClick={handleCancel}
              disabled={isCancelling}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isCancelling ? (
                <>
                  <Spinner className="mr-2" />
                  Cancelling...
                </>
              ) : (
                "Yes, Cancel Claim"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Claim</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this claim? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isDeleting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Spinner className="mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
