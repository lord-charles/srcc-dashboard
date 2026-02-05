"use client";

import React from "react";
import { useState } from "react";
import {
  Plus,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { NewImprestDrawer } from "./new-imprest-drawer";
import {
  createImprest,
  getMyImprest,
  acknowledgeImprestReceipt,
} from "@/services/imprest.service";
import { FormValues } from "./new-imprest-drawer";
import { MyImprestStats } from "./my-imprest-stats";
import { ImprestFilters } from "./imprest-filters";
import { ImprestDetailView } from "./imprest-detail-view";
import { AcknowledgmentDialog } from "./acknowledgment-dialog";
import { AllRequestsTab } from "./tabs/all-requests-tab";
import { PendingRequestsTab } from "./tabs/pending-requests-tab";
import { ApprovedRequestsTab } from "./tabs/approved-requests-tab";
import { DisbursedRequestsTab } from "./tabs/disbursed-requests-tab";
import { RejectedRequestsTab } from "./tabs/rejected-requests-tab";

// Type definitions
export type ApprovalInfo = {
  approvedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  approvedAt: string;
  comments: string;
};

interface ImprestRejection {
  rejectedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  rejectedAt: string;
  reason: string;
}

export type RequestedBy = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
};

export type Imprest = {
  _id: string;
  employeeName: string;
  department: string;
  requestDate: string;
  dueDate: string;
  paymentReason: string;
  currency: string;
  amount: number;
  paymentType: string;
  explanation: string;
  status: string;
  requestedBy: RequestedBy;
  createdAt: string;
  updatedAt: string;
  rejection?: ImprestRejection;
  __v: number;
  hodApproval?: ApprovalInfo;
  accountantApproval?: ApprovalInfo;
  disbursement?: {
    disbursedBy: string;
    disbursedAt: string;
    amount: number;
    comments?: string;
  };
  acknowledgment?: {
    acknowledgedBy: string;
    acknowledgedAt: string;
    received: boolean;
    comments?: string;
  };
  accounting?: {
    verifiedBy: string;
    verifiedAt: string;
    receipts: {
      description: string;
      amount: number;
      receiptUrl: string;
      uploadedAt: string;
    }[];
    totalAmount: number;
    balance: number;
    comments?: string;
  };
};

export default function ImprestDashboard({
  initialData,
}: {
  initialData: any;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Imprest;
    direction: "asc" | "desc";
  }>({
    key: "createdAt",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedImprest, setSelectedImprest] = useState<Imprest | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState("all");
  const [pendingPage, setPendingPage] = useState(1);
  const [approvedPage, setApprovedPage] = useState(1);
  const [rejectedPage, setRejectedPage] = useState(1);
  const [disbursedPage, setDisbursedPage] = useState(1);
  const [imprestData, setImprestData] = useState<Imprest[]>(initialData);
  const [acknowledgmentImprest, setAcknowledgmentImprest] =
    useState<Imprest | null>(null);
  const [isAcknowledgmentDialogOpen, setIsAcknowledgmentDialogOpen] =
    useState(false);

  const { toast } = useToast();
  const [isNewImprestModalOpen, setIsNewImprestModalOpen] = useState(false);

  const handleCreateImprest = async (data: FormValues) => {
    try {
      await createImprest(data);

      toast({
        title: "Success",
        description: "Imprest request created successfully",
      });

      const updatedData = await getMyImprest();
      setImprestData(updatedData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create imprest request",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Get unique payment types for filtering
  const uniquePaymentTypes = Array.from(
    new Set(imprestData.map((item) => item.paymentType)),
  );

  // Status filter handler
  const handleStatusFilter = (status: string) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const handlePaymentTypeFilter = (type: string) => {
    setPaymentTypeFilter((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  // Filter function with enhanced filtering options
  const filteredData = imprestData.filter((imprest) => {
    const matchesSearch =
      imprest.paymentReason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imprest.explanation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imprest.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imprest._id.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilter.length === 0 || statusFilter.includes(imprest.status);

    // Payment type filter
    const matchesPaymentType =
      paymentTypeFilter.length === 0 ||
      paymentTypeFilter.includes(imprest.paymentType);

    // Date filter
    let matchesDate = true;
    const currentDate = new Date();
    const requestDate = new Date(imprest.requestDate);

    if (dateFilter === "last7days") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(currentDate.getDate() - 7);
      matchesDate = requestDate >= sevenDaysAgo;
    } else if (dateFilter === "last30days") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(currentDate.getDate() - 30);
      matchesDate = requestDate >= thirtyDaysAgo;
    } else if (dateFilter === "last90days") {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(currentDate.getDate() - 90);
      matchesDate = requestDate >= ninetyDaysAgo;
    }

    // Tab filter
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" &&
        (imprest.status === "pending_hod" ||
          imprest.status === "pending_accountant")) ||
      (activeTab === "approved" && imprest.status === "approved") ||
      (activeTab === "rejected" && imprest.status === "rejected") ||
      (activeTab === "disbursed" &&
        (imprest.status === "disbursed" ||
          imprest.status === "pending_acknowledgment"));

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPaymentType &&
      matchesDate &&
      matchesTab
    );
  });

  // Sort function
  const sortedData = [...filteredData].sort((a, b) => {
    const { key, direction } = sortConfig;

    // Handle date fields
    if (
      key === "requestDate" ||
      key === "dueDate" ||
      key === "createdAt" ||
      key === "updatedAt"
    ) {
      const dateA = new Date(a[key] || "").getTime();
      const dateB = new Date(b[key] || "").getTime();
      return direction === "asc" ? dateA - dateB : dateB - dateA;
    }

    // Handle numeric fields
    if (key === "amount") {
      const valueA = a[key] || 0;
      const valueB = b[key] || 0;
      return direction === "asc" ? valueA - valueB : valueB - valueA;
    }

    // Handle string fields with null checks
    const valueA = a[key] || "";
    const valueB = b[key] || "";
    if (valueA < valueB) return direction === "asc" ? -1 : 1;
    if (valueA > valueB) return direction === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Sort handler
  const handleSort = (key: keyof Imprest) => {
    let direction: "asc" | "desc" = "asc";

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter([]);
    setDateFilter("all");
    setPaymentTypeFilter([]);
    setSortConfig({ key: "createdAt", direction: "desc" });
    setActiveTab("all");

    toast({
      title: "Filters reset",
      description: "All filters have been reset to default values.",
    });
  };

  // Toggle row expansion
  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Calculate summary statistics
  const pendingCount = imprestData.filter(
    (item) =>
      item.status === "pending_hod" || item.status === "pending_accountant",
  ).length;
  const approvedCount = imprestData.filter(
    (item) => item.status === "approved",
  ).length;
  const disbursedCount = imprestData.filter(
    (item) =>
      item.status === "disbursed" || item.status === "pending_acknowledgment",
  ).length;
  const rejectedCount = imprestData.filter(
    (item) => item.status === "rejected",
  ).length;

  // Export data function
  const handleExport = () => {
    toast({
      title: "Export initiated",
      description: "Your data is being prepared for export.",
    });
  };

  const handleViewDetails = (imprest: Imprest) => {
    setSelectedImprest(imprest);
  };

  const handleCloseDetails = () => {
    setSelectedImprest(null);
  };

  // Add these computed values
  const pendingItems = sortedData.filter(
    (item) =>
      item.status === "pending_hod" || item.status === "pending_accountant",
  );
  const approvedItems = sortedData.filter((item) => item.status === "approved");
  const rejectedItems = sortedData.filter((item) => item.status === "rejected");
  const disbursedItems = sortedData.filter(
    (item) =>
      item.status === "disbursed" || item.status === "pending_acknowledgment",
  );

  const pendingTotalPages = Math.ceil(pendingItems.length / itemsPerPage);
  const approvedTotalPages = Math.ceil(approvedItems.length / itemsPerPage);
  const rejectedTotalPages = Math.ceil(rejectedItems.length / itemsPerPage);
  const disbursedTotalPages = Math.ceil(disbursedItems.length / itemsPerPage);

  const pendingIndexOfLastItem = pendingPage * itemsPerPage;
  const pendingIndexOfFirstItem = pendingIndexOfLastItem - itemsPerPage;

  const approvedIndexOfLastItem = approvedPage * itemsPerPage;
  const approvedIndexOfFirstItem = approvedIndexOfLastItem - itemsPerPage;

  const rejectedIndexOfLastItem = rejectedPage * itemsPerPage;
  const rejectedIndexOfFirstItem = rejectedIndexOfLastItem - itemsPerPage;

  const disbursedIndexOfLastItem = disbursedPage * itemsPerPage;
  const disbursedIndexOfFirstItem = disbursedIndexOfLastItem - itemsPerPage;

  const handleAcknowledgeReceipt = async (
    id: string,
    received: boolean,
    comments?: string,
  ) => {
    try {
      await acknowledgeImprestReceipt(id, { received, comments });

      toast({
        title: received ? "Receipt Confirmed" : "Non-Receipt Reported",
        description: received
          ? "You have successfully confirmed receipt of the funds. You can now proceed with your expenses."
          : "Your report has been submitted and will be investigated by the administration.",
      });

      // Refresh the data
      const updatedData = await getMyImprest();
      setImprestData(updatedData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to acknowledge receipt",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Calculate items requiring attention
  const itemsRequiringAttention = imprestData.filter(
    (item) =>
      item.status === "pending_acknowledgment" ||
      item.status === "resolved_dispute",
  );

  // Handle acknowledgment from banner
  const handleBannerAcknowledge = (imprest: Imprest) => {
    setAcknowledgmentImprest(imprest);
    setIsAcknowledgmentDialogOpen(true);
  };

  return (
    <div className="p-3 space-y-8">
      <MyImprestStats imprests={initialData} />

      {/* Attention Required Banner */}
      {itemsRequiringAttention.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-full">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 dark:text-amber-400 mb-1">
                  Action Required
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                  You have {itemsRequiringAttention.length} imprest request
                  {itemsRequiringAttention.length > 1 ? "s" : ""} that require
                  {itemsRequiringAttention.length === 1 ? "s" : ""} your
                  attention.
                </p>
                <div className="space-y-2">
                  {itemsRequiringAttention.slice(0, 3).map((item) => (
                    <div
                      key={item._id}
                      className="flex flex-col sm:flex-row items-start sm:items-center  p-3 bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-800"
                    >
                      <div className="flex-1 min-w-0 flex items-center gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          {item.status === "pending_acknowledgment" ? (
                            <Clock className="h-4 w-4 text-amber-600" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-purple-600" />
                          )}
                          <span className="font-medium text-sm truncate max-w-[140px] sm:max-w-[200px]">
                            {item.paymentReason}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            item.status === "pending_acknowledgment"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-purple-50 text-purple-700 border-purple-200"
                          }
                        >
                          {item.status === "pending_acknowledgment"
                            ? "Acknowledge Receipt"
                            : "Resolved Dispute"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2 sm:mt-0 sm:ml-4 flex-shrink-0">
                    
                        {item.status === "pending_acknowledgment" ? (
                          <Button
                            size="sm"
                            onClick={() => handleBannerAcknowledge(item)}
                            className="text-xs bg-amber-600 hover:bg-amber-700 text-white whitespace-nowrap min-w-[88px]"
                          >
                            Acknowledge
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setActiveTab("disbursed");
                              handleViewDetails(item);
                            }}
                            className="text-xs whitespace-nowrap"
                          >
                            View Details
                          </Button>
                        )}    <span className="text-sm font-medium flex-shrink-0">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: item.currency,
                          }).format(item.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {itemsRequiringAttention.length > 3 && (
                    <div className="text-center pt-2">
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setActiveTab("disbursed")}
                        className="text-amber-700 dark:text-amber-400"
                      >
                        View all {itemsRequiringAttention.length} items
                        requiring attention
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/*  Main Content Card */}
      <Card className="w-full border-border/50 shadow-sm">
        <div className="pb-3 p-4 ">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                My Imprest Applications
              </CardTitle>
              <CardDescription>
                View and manage your imprest applications and track their
                approval status
              </CardDescription>
            </div>
            <Button
              className="md:self-start bg-primary hover:bg-primary/90 shadow-md"
              onClick={() => setIsNewImprestModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Application
            </Button>
          </div>
        </div>

        <CardContent className="p-0">
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="px-0 border-b">
              <TabsList className="w-full justify-start h-12 bg-transparent p-0 mb-[-1px]">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12 px-4 font-medium"
                >
                  All Requests
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12 px-4 font-medium"
                >
                  Pending
                  {pendingCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                    >
                      {pendingCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="approved"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12 px-4 font-medium"
                >
                  Approved
                  {approvedCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    >
                      {approvedCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="disbursed"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12 px-4 font-medium"
                >
                  Disbursed
                  {disbursedCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    >
                      {disbursedCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="rejected"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12 px-4 font-medium"
                >
                  Rejected
                  {rejectedCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                    >
                      {rejectedCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* All Requests Tab */}
            <TabsContent value="all" className="m-0">
              <ImprestFilters
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                paymentTypeFilter={paymentTypeFilter}
                dateFilter={dateFilter}
                itemsPerPage={itemsPerPage}
                uniquePaymentTypes={uniquePaymentTypes}
                onSearchChange={setSearchTerm}
                onStatusFilter={handleStatusFilter}
                onPaymentTypeFilter={handlePaymentTypeFilter}
                onDateFilterChange={setDateFilter}
                onItemsPerPageChange={setItemsPerPage}
                onExport={handleExport}
                onResetFilters={resetFilters}
              />

              <AllRequestsTab
                currentItems={currentItems}
                expandedRows={expandedRows}
                sortConfig={sortConfig}
                currentPage={currentPage}
                totalPages={totalPages}
                indexOfFirstItem={indexOfFirstItem}
                indexOfLastItem={indexOfLastItem}
                sortedDataLength={sortedData.length}
                onToggleRowExpansion={toggleRowExpansion}
                onSort={handleSort}
                onViewDetails={handleViewDetails}
                onSetCurrentPage={setCurrentPage}
                onAcknowledgeReceipt={handleAcknowledgeReceipt}
              />
            </TabsContent>

            {/* Pending Requests Tab */}
            <TabsContent value="pending" className="m-0">
              <PendingRequestsTab
                pendingItems={pendingItems.slice(
                  pendingIndexOfFirstItem,
                  pendingIndexOfLastItem,
                )}
                expandedRows={expandedRows}
                sortConfig={sortConfig}
                pendingPage={pendingPage}
                pendingTotalPages={pendingTotalPages}
                pendingIndexOfFirstItem={pendingIndexOfFirstItem}
                pendingIndexOfLastItem={pendingIndexOfLastItem}
                onToggleRowExpansion={toggleRowExpansion}
                onSort={handleSort}
                onViewDetails={handleViewDetails}
                onSetPendingPage={setPendingPage}
                onNewImprestModalOpen={() => setIsNewImprestModalOpen(true)}
              />
            </TabsContent>

            {/* Approved Requests Tab */}
            <TabsContent value="approved" className="m-0">
              <ApprovedRequestsTab
                approvedItems={approvedItems.slice(
                  approvedIndexOfFirstItem,
                  approvedIndexOfLastItem,
                )}
                expandedRows={expandedRows}
                sortConfig={sortConfig}
                approvedPage={approvedPage}
                approvedTotalPages={approvedTotalPages}
                approvedIndexOfFirstItem={approvedIndexOfFirstItem}
                approvedIndexOfLastItem={approvedIndexOfLastItem}
                onToggleRowExpansion={toggleRowExpansion}
                onSort={handleSort}
                onViewDetails={handleViewDetails}
                onSetApprovedPage={setApprovedPage}
                onNewImprestModalOpen={() => setIsNewImprestModalOpen(true)}
              />
            </TabsContent>

            {/* Disbursed Requests Tab */}
            <TabsContent value="disbursed" className="m-0">
              <DisbursedRequestsTab
                disbursedItems={disbursedItems.slice(
                  disbursedIndexOfFirstItem,
                  disbursedIndexOfLastItem,
                )}
                expandedRows={expandedRows}
                sortConfig={sortConfig}
                disbursedPage={disbursedPage}
                disbursedTotalPages={disbursedTotalPages}
                disbursedIndexOfFirstItem={disbursedIndexOfFirstItem}
                disbursedIndexOfLastItem={disbursedIndexOfLastItem}
                onToggleRowExpansion={toggleRowExpansion}
                onSort={handleSort}
                onViewDetails={handleViewDetails}
                onSetDisbursedPage={setDisbursedPage}
                onAcknowledgeReceipt={handleAcknowledgeReceipt}
              />
            </TabsContent>

            {/* Rejected Requests Tab */}
            <TabsContent value="rejected" className="m-0">
              <RejectedRequestsTab
                rejectedItems={rejectedItems.slice(
                  rejectedIndexOfFirstItem,
                  rejectedIndexOfLastItem,
                )}
                expandedRows={expandedRows}
                sortConfig={sortConfig}
                rejectedPage={rejectedPage}
                rejectedTotalPages={rejectedTotalPages}
                rejectedIndexOfFirstItem={rejectedIndexOfFirstItem}
                rejectedIndexOfLastItem={rejectedIndexOfLastItem}
                onToggleRowExpansion={toggleRowExpansion}
                onSort={handleSort}
                onViewDetails={handleViewDetails}
                onSetRejectedPage={setRejectedPage}
                onNewImprestModalOpen={() => setIsNewImprestModalOpen(true)}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <NewImprestDrawer
        open={isNewImprestModalOpen}
        onOpenChange={setIsNewImprestModalOpen}
        onSubmit={handleCreateImprest}
      />

      {/* Detail View Dialog */}
      <ImprestDetailView
        imprest={selectedImprest}
        onClose={handleCloseDetails}
      />

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
