"use client";

import type React from "react";
import { useState, useMemo, useEffect } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Receipt,
  MoreHorizontal,
} from "lucide-react";
import { Contract } from "@/types/project";
import { useToast } from "@/hooks/use-toast";
import { EditContractDialog } from "@/components/contracts/edit-contract-dialog";
import { ContractFormValues } from "@/components/contracts/create-contract-dialog";
import {
  updateContract,
  deleteContract,
  getContractTemplates,
} from "@/services/contracts.service";
import { Spinner } from "@/components/ui/spinner";
import { CreateClaimOnBehalfDialog } from "@/components/contracts/create-claim-on-behalf-dialog";

interface ContractsTableProps {
  contracts: Contract[];
  projectId: string;
  projectMilestones: Array<{
    _id: string;
    title: string;
    description: string;
    budget: number;
  }>;
}

const ContractsTable = ({
  contracts,
  projectId,
  projectMilestones,
}: ContractsTableProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null,
  );
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(
    null,
  );
  const [contractForClaim, setContractForClaim] = useState<Contract | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditContractDialog, setShowEditContractDialog] = useState(false);
  const [showCreateClaimDialog, setShowCreateClaimDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isUpdatingContract, setIsUpdatingContract] = useState(false);
  const [isDeletingContract, setIsDeletingContract] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const itemsPerPage = 10;
  const [templates, setTemplates] = useState<
    Array<{
      _id: string;
      name: string;
      version?: string;
      contentType: string;
      content: string;
      variables?: string[];
    }>
  >([]);

  // Fetch contract templates on mount (excluding coach templates for team members)
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await getContractTemplates({ active: true });
        // Filter out coach templates for team members
        const filteredData = (data || []).filter(
          (t: any) => t.category !== "coach",
        );
        setTemplates(filteredData);
      } catch (error) {
        console.error("Failed to fetch contract templates:", error);
      }
    };
    fetchTemplates();
  }, []);

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
          .includes(searchTerm?.toLowerCase()),
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

  const handleViewContract = (contract: Contract) => {
    setSelectedContract(contract);
    setShowViewDialog(true);
  };

  const formatDateToISO = (dateString: string) => {
    if (dateString.includes("T")) return dateString;
    return new Date(dateString).toISOString();
  };

  const handleUpdateContract = async (values: ContractFormValues) => {
    if (!selectedContract) return;

    try {
      setIsUpdatingContract(true);

      const contractData: any = {
        description: values.description,
        contractValue: values.contractValue,
        currency: values.currency,
        startDate: formatDateToISO(values.startDate),
        endDate: formatDateToISO(values.endDate),
        projectId: selectedContract.projectId,
        contractedUserId: selectedContract.contractedUserId._id,
        status: values.status,
      };

      // Add template fields if provided (and not "none")
      if (values.templateId && values.templateId !== "none") {
        contractData.templateId = values.templateId;
      }
      if (values.editedTemplateContent) {
        contractData.editedTemplateContent = values.editedTemplateContent;
      }

      const result = await updateContract(selectedContract._id, contractData);

      if (result) {
        toast({
          title: "Contract updated",
          description: "Contract has been updated successfully",
        });

        // Refresh the contracts data
        setRefreshTrigger((prev) => prev + 1);
        // Optionally call a refresh function if passed as prop
        if (typeof window !== "undefined" && window.location?.reload) {
          setTimeout(() => window.location.reload(), 100);
        }
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

  const handleDeleteContract = async () => {
    if (!contractToDelete) return;

    try {
      setIsDeletingContract(true);

      const result = await deleteContract(contractToDelete._id);

      if (result) {
        toast({
          title: "Contract deleted",
          description: "Contract has been deleted successfully",
        });

        // Refresh the contracts data
        setRefreshTrigger((prev) => prev + 1);
        // Optionally call a refresh function if passed as prop
        if (typeof window !== "undefined" && window.location?.reload) {
          setTimeout(() => window.location.reload(), 100);
        }
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
      setContractToDelete(null);
    }
  };

  const handleOpenDeleteDialog = (contract: Contract) => {
    setContractToDelete(contract);
    setDeleteDialogOpen(true);
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setContractForClaim(contract);
                              setShowCreateClaimDialog(true);
                            }}
                          >
                            <Receipt className="mr-2 h-4 w-4" />
                            Create Claim
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleViewContract(contract)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditContract(contract)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => handleOpenDeleteDialog(contract)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
          templates={templates}
        />
      )}

      {/* View Contract Details Dialog */}
      <Dialog
        open={showViewDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowViewDialog(false);
            setSelectedContract(null);
            // Refresh data when dialog closes
            setRefreshTrigger((prev) => prev + 1);
            if (typeof window !== "undefined" && window.location?.reload) {
              setTimeout(() => window.location.reload(), 100);
            }
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Contract Details</DialogTitle>
          </DialogHeader>
          {selectedContract && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="amendments">Amendments</TabsTrigger>
              </TabsList>
              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedContract.contractNumber}</CardTitle>
                    <CardDescription>
                      {selectedContract.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">
                          Contract Value
                        </h4>
                        <p className="text-lg font-medium">
                          {selectedContract.contractValue.toLocaleString()}{" "}
                          {selectedContract.currency}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">
                          Status
                        </h4>
                        <Badge
                          variant="outline"
                          className={getStatusColor(selectedContract.status)}
                        >
                          {selectedContract.status}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">
                          Start Date
                        </h4>
                        <p className="text-sm">
                          {formatDate(selectedContract.startDate)}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">
                          End Date
                        </h4>
                        <p className="text-sm">
                          {formatDate(selectedContract.endDate)}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                        Team Member
                      </h4>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {selectedContract.contractedUserId.firstName.charAt(
                              0,
                            )}
                            {selectedContract.contractedUserId.lastName.charAt(
                              0,
                            )}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {selectedContract.contractedUserId.firstName}{" "}
                            {selectedContract.contractedUserId.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {selectedContract.contractedUserId.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                        Description
                      </h4>
                      <p className="text-sm">{selectedContract.description}</p>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowEditContractDialog(true);
                          setShowViewDialog(false);
                        }}
                      >
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
                        {selectedContract.amendments.map((amendment, index) => (
                          <div
                            key={amendment._id || `amendment-${index}`}
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
                                    ? formatDate(amendment.date)
                                    : "Date not recorded"}
                                </p>
                              </div>
                            </div>
                            {amendment.changedFields &&
                              amendment.changedFields.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-sm font-medium">
                                    Changed Fields:
                                  </p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {amendment.changedFields.map((field) => (
                                      <Badge
                                        key={field}
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {field}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        No amendments have been made to this contract
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Claim on Behalf Dialog */}
      {contractForClaim && (
        <CreateClaimOnBehalfDialog
          open={showCreateClaimDialog}
          onOpenChange={setShowCreateClaimDialog}
          contract={contractForClaim}
          projectMilestones={projectMilestones}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contract</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this contract? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          {contractToDelete && (
            <div className="space-y-4">
              <div className="border rounded-md p-4">
                <h4 className="font-medium">
                  {contractToDelete.contractNumber}
                </h4>
                <p className="text-sm mt-1">{contractToDelete.description}</p>
                <div className="mt-2 flex items-center">
                  <span className="text-sm font-medium mr-2">
                    Contracted User:
                  </span>
                  <span className="text-sm">{`${contractToDelete.contractedUserId.firstName} ${contractToDelete.contractedUserId.lastName}`}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between">
            <Button
              variant="destructive"
              onClick={handleDeleteContract}
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
    </Card>
  );
};

export default ContractsTable;
