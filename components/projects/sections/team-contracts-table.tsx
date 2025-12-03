"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Edit,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { Contract } from "@/types/project";
import { useToast } from "@/hooks/use-toast";
import { EditContractDialog } from "@/components/contracts/edit-contract-dialog";
import { ContractFormValues } from "@/components/contracts/create-contract-dialog";
import { updateContract, deleteContract } from "@/services/contracts.service";
import { Spinner } from "@/components/ui/spinner";

interface ContractsTableProps {
  contracts: Contract[];
}

const ContractsTable = ({ contracts }: ContractsTableProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditContractDialog, setShowEditContractDialog] = useState(false);
  const [isUpdatingContract, setIsUpdatingContract] = useState(false);
  const [isDeletingContract, setIsDeletingContract] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const itemsPerPage = 10;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-50 text-green-700 border-green-200";
      case "draft":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "suspended":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "terminated":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const filteredContracts = useMemo(() => {
    return contracts.filter(
      (contract) =>
        contract.contractNumber
          .toLowerCase()
          .includes(searchTerm?.toLowerCase()) ||
        contract?.description
          ?.toLowerCase()
          .includes(searchTerm?.toLowerCase()) ||
        contract?.contractedUserId?.firstName
          ?.toLowerCase()
          .includes(searchTerm?.toLowerCase()) ||
        contract?.contractedUserId?.lastName
          ?.toLowerCase()
          .includes(searchTerm?.toLowerCase())
    );
  }, [contracts, searchTerm]);

  const paginatedContracts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredContracts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredContracts, currentPage]);

  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);

  const handleEditContract = (contract: Contract) => {
    setSelectedContract(contract);
    setShowEditContractDialog(true);
  };

  const handleUpdateContract = async (values: ContractFormValues) => {
    if (!selectedContract) return;

    try {
      setIsUpdatingContract(true);

      const formatDateToISO = (dateString: string) => {
        if (dateString.includes("T")) return dateString;
        return new Date(dateString).toISOString();
      };

      const contractData = {
        description: values.description,
        contractValue: values.contractValue,
        currency: values.currency,
        startDate: formatDateToISO(values.startDate),
        endDate: formatDateToISO(values.endDate),
        projectId: selectedContract.projectId,
        contractedUserId: selectedContract.contractedUserId._id,
        status: values.status,
      };

      const result = await updateContract(selectedContract._id, contractData);

      if (result) {
        toast({
          title: "Contract updated",
          description: "Contract has been updated successfully",
        });

        // Delay reload to ensure any dialogs close first
        setTimeout(() => window.location.reload(), 100);
      }
    } catch (error) {
      console.error("Failed to update contract:", error);
      toast({
        title: "Failed to update contract",
        description:
          typeof error === "string"
            ? error
            : "An error occurred while updating the contract",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingContract(false);
      setShowEditContractDialog(false);
    }
  };

  const handleDeleteContract = async (contractId: string) => {
    try {
      setIsDeletingContract(true);

      const result = await deleteContract(contractId);

      if (result) {
        toast({
          title: "Contract deleted",
          description: "Contract has been deleted successfully",
        });

        // Delay reload to ensure any dialogs close first
        setTimeout(() => window.location.reload(), 100);
      }
    } catch (error) {
      console.error("Failed to delete contract:", error);
      toast({
        title: "Failed to delete contract",
        description:
          typeof error === "string"
            ? error
            : "An error occurred while deleting the contract",
        variant: "destructive",
      });
    } finally {
      setIsDeletingContract(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <Card className="w-full p-2">
      <div className="flex justify-between items-center pb-4">
        <div>
          <CardTitle>Team Member Contracts</CardTitle>
          <CardDescription>
            Manage all contracts for team members in this project
          </CardDescription>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="relative w-64">
            <Input
              type="text"
              placeholder="Search contracts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </div>
      <CardContent className="p-0">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract Number</TableHead>
                <TableHead>Team Member</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedContracts.length > 0 ? (
                paginatedContracts.map((contract) => (
                  <TableRow key={contract._id}>
                    <TableCell className="font-medium">
                      {contract.contractNumber}
                      <div className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">
                        {contract.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {`${contract.contractedUserId.firstName} ${contract.contractedUserId.lastName}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {contract.contractedUserId.email}
                      </div>
                    </TableCell>
                    <TableCell>{`${contract.contractValue.toLocaleString()} ${
                      contract.currency
                    }`}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusColor(contract.status)}
                      >
                        {contract.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(contract?.startDate)}
                      </div>
                      <div className="text-sm">
                        {formatDate(contract?.endDate)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedContract(contract)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Contract Details</DialogTitle>
                            </DialogHeader>
                            {selectedContract && (
                              <Tabs defaultValue="details" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                  <TabsTrigger value="details">
                                    Details
                                  </TabsTrigger>
                                  <TabsTrigger value="amendments">
                                    Amendments
                                  </TabsTrigger>
                                </TabsList>
                                <TabsContent value="details">
                                  <Card>
                                    <CardHeader>
                                      <CardTitle>
                                        {selectedContract.contractNumber}
                                      </CardTitle>
                                      <CardDescription>
                                        {selectedContract.description}
                                      </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <h4 className="font-semibold text-sm text-muted-foreground">
                                            Contracted User
                                          </h4>
                                          <p className="font-medium">{`${selectedContract.contractedUserId.firstName} ${selectedContract.contractedUserId.lastName}`}</p>
                                          <p className="text-sm text-muted-foreground">
                                            {
                                              selectedContract.contractedUserId
                                                .email
                                            }
                                          </p>
                                        </div>
                                        <div>
                                          <h4 className="font-semibold text-sm text-muted-foreground">
                                            Contract Value
                                          </h4>
                                          <p className="font-medium">{`${selectedContract.contractValue.toLocaleString()} ${
                                            selectedContract.currency
                                          }`}</p>
                                        </div>
                                        <div>
                                          <h4 className="font-semibold text-sm text-muted-foreground">
                                            Status
                                          </h4>
                                          <Badge
                                            variant="outline"
                                            className={getStatusColor(
                                              selectedContract.status
                                            )}
                                          >
                                            {selectedContract.status}
                                          </Badge>
                                        </div>
                                        <div>
                                          <h4 className="font-semibold text-sm text-muted-foreground">
                                            Duration
                                          </h4>
                                          <p className="font-medium">{`${formatDate(
                                            selectedContract.startDate
                                          )} - ${formatDate(
                                            selectedContract.endDate
                                          )}`}</p>
                                        </div>
                                        <div>
                                          <h4 className="font-semibold text-sm text-muted-foreground">
                                            Created At
                                          </h4>
                                          <p className="font-medium">
                                            {formatDate(
                                              selectedContract.createdAt
                                            )}
                                          </p>
                                        </div>
                                        <div>
                                          <h4 className="font-semibold text-sm text-muted-foreground">
                                            Last Updated
                                          </h4>
                                          <p className="font-medium">
                                            {formatDate(
                                              selectedContract.updatedAt
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex justify-end space-x-2">
                                        <Button
                                          variant="outline"
                                          onClick={() =>
                                            handleEditContract(selectedContract)
                                          }
                                        >
                                          <Edit className="h-4 w-4 mr-2" />
                                          Edit Contract
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </TabsContent>
                                <TabsContent value="amendments">
                                  <Card>
                                    <CardHeader>
                                      <CardTitle>Amendments History</CardTitle>
                                      <CardDescription>
                                        Record of changes made to this contract
                                      </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                      {selectedContract.amendments &&
                                      selectedContract.amendments.length > 0 ? (
                                        <div className="space-y-4">
                                          {selectedContract.amendments.map(
                                            (amendment, index) => (
                                              <div
                                                key={
                                                  amendment._id ||
                                                  `amendment-${index}`
                                                }
                                                className="border rounded-md p-4"
                                              >
                                                <div className="flex justify-between items-start">
                                                  <div>
                                                    <h4 className="font-medium">
                                                      {amendment.description ||
                                                        "Contract Amendment"}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                      {amendment.date
                                                        ? formatDate(
                                                            amendment.date
                                                          )
                                                        : "Date not recorded"}
                                                    </p>
                                                  </div>
                                                </div>
                                                {amendment.changedFields &&
                                                  amendment.changedFields
                                                    .length > 0 && (
                                                    <div className="mt-2">
                                                      <p className="text-sm font-medium">
                                                        Changed Fields:
                                                      </p>
                                                      <div className="flex flex-wrap gap-1 mt-1">
                                                        {amendment.changedFields.map(
                                                          (field) => (
                                                            <Badge
                                                              key={field}
                                                              variant="secondary"
                                                              className="text-xs"
                                                            >
                                                              {field}
                                                            </Badge>
                                                          )
                                                        )}
                                                      </div>
                                                    </div>
                                                  )}
                                              </div>
                                            )
                                          )}
                                        </div>
                                      ) : (
                                        <p className="text-center text-muted-foreground py-4">
                                          No amendments have been made to this
                                          contract
                                        </p>
                                      )}
                                    </CardContent>
                                  </Card>
                                </TabsContent>
                              </Tabs>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditContract(contract)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Dialog
                          open={deleteDialogOpen}
                          onOpenChange={setDeleteDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => setDeleteDialogOpen(true)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Contract</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete this contract?
                                This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="border rounded-md p-4">
                                <h4 className="font-medium">
                                  {contract.contractNumber}
                                </h4>
                                <p className="text-sm mt-1">
                                  {contract.description}
                                </p>
                                <div className="mt-2 flex items-center">
                                  <span className="text-sm font-medium mr-2">
                                    Contracted User:
                                  </span>
                                  <span className="text-sm">{`${contract.contractedUserId.firstName} ${contract.contractedUserId.lastName}`}</span>
                                </div>
                              </div>
                            </div>
                            <DialogFooter className="flex justify-between">
                              <DialogClose asChild>
                                <Button
                                  variant="outline"
                                  disabled={isDeletingContract}
                                >
                                  Cancel
                                </Button>
                              </DialogClose>
                              <Button
                                variant="destructive"
                                onClick={() =>
                                  handleDeleteContract(contract._id)
                                }
                                disabled={isDeletingContract}
                              >
                                {isDeletingContract ? (
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {contracts.length === 0
                      ? "No contracts found"
                      : "No matching contracts found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4">
          <div className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, filteredContracts.length)}
            </span>{" "}
            of <span className="font-medium">{filteredContracts.length}</span>{" "}
            contracts
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
      {selectedContract && (
        <EditContractDialog
          open={showEditContractDialog}
          onOpenChange={setShowEditContractDialog}
          onSubmit={handleUpdateContract}
          contract={selectedContract}
          isSubmitting={isUpdatingContract}
        />
      )}
    </Card>
  );
};

export default ContractsTable;
