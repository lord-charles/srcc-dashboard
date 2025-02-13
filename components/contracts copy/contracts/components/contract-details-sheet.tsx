"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Contract } from "@/types/contract";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface ContractDetailsSheetProps {
  contract: Contract;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (newStatus: string) => void;
}

const formatCurrency = (amount: number, currency: string = "KES") => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

export function ContractDetailsSheet({
  contract,
  open,
  onOpenChange,
  onStatusChange,
}: ContractDetailsSheetProps) {
  const [newStatus, setNewStatus] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "terminated":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const validateStatusTransition = (
    currentStatus: string,
    newStatus: string
  ) => {
    const validTransitions: { [key: string]: string[] } = {
      pending: ["active", "terminated"],
      active: ["completed", "terminated"],
      completed: [],
      terminated: [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  };

  const handleStatusChange = () => {
    if (newStatus && validateStatusTransition(contract.status, newStatus)) {
      onStatusChange(newStatus);
      toast({
        title: "Status Updated",
        description: `Contract status changed from ${contract.status} to ${newStatus}`,
      });
    } else {
      toast({
        title: "Invalid Status Transition",
        description: `Cannot transition contract from ${contract.status} to ${newStatus}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold">
            Contract Details
          </SheetTitle>
          <SheetDescription>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              Created on {contract?.createdAt ? format(new Date(contract.createdAt), "PPP") : "N/A"}
            </div>
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Status Change Section */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Update Status</h3>
              <div className="flex items-center space-x-4">
                <Select onValueChange={setNewStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    {["pending", "active", "completed", "terminated"].map(
                      (status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <Button onClick={handleStatusChange} disabled={!newStatus}>
                  Update Status
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contract Information */}
          <Card className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950 dark:to-slate-950">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">
                Contract Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Contract Number</span>
                  <p className="font-medium">{contract.contractNumber}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Reference Number</span>
                  <p className="font-medium">{contract.procurementReferenceNumber}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-muted-foreground">Title</span>
                  <p className="font-medium">{contract.title}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-muted-foreground">Description</span>
                  <p className="font-medium">{contract.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contract Details */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Financial Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Contract Value</span>
                  <p className="font-medium">
                    {formatCurrency(contract.contractValue, contract.currency)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Performance Security</span>
                  <p className="font-medium">
                    {contract.requiresPerformanceSecurity
                      ? formatCurrency(
                          contract.performanceSecurityAmount,
                          contract.currency
                        )
                      : "Not Required"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Start Date</span>
                  <p className="font-medium">
                    {format(new Date(contract.startDate), "PPP")}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">End Date</span>
                  <p className="font-medium">
                    {format(new Date(contract.endDate), "PPP")}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Procurement Method</span>
                  <p className="font-medium">{contract.procurementMethod}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className={getStatusColor(contract.status)}>
                    {contract.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deliverables */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Deliverables</h3>
              <div className="space-y-4">
                {contract.deliverables.map((deliverable) => (
                  <div
                    key={deliverable._id}
                    className="border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{deliverable.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {deliverable.description}
                        </p>
                        <div className="mt-2">
                          <span className="text-sm text-muted-foreground">
                            Due: {format(new Date(deliverable.dueDate), "PPP")}
                          </span>
                        </div>
                      </div>
                      <Badge
                        className={
                          deliverable.completed
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {deliverable.completed ? "Completed" : "Pending"}
                      </Badge>
                    </div>
                    {deliverable.acceptanceCriteria.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm text-muted-foreground">
                          Acceptance Criteria:
                        </span>
                        <ul className="list-disc list-inside text-sm">
                          {deliverable.acceptanceCriteria.map((criteria, index) => (
                            <li key={index}>{criteria}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Schedule */}
          <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Payment Schedule</h3>
              <div className="space-y-4">
                {contract.paymentSchedule.map((payment) => (
                  <div
                    key={payment._id}
                    className="border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{payment.milestone}</h4>
                        <div className="mt-1">
                          <span className="text-sm text-muted-foreground">
                            Amount:{" "}
                            {formatCurrency(payment.amount, contract.currency)}
                          </span>
                        </div>
                        <div className="mt-1">
                          <span className="text-sm text-muted-foreground">
                            Due: {format(new Date(payment.dueDate), "PPP")}
                          </span>
                        </div>
                      </div>
                      <Badge
                        className={
                          payment.paid
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {payment.paid ? "Paid" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Amendments */}
          {contract.amendments.length > 0 && (
            <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950 dark:to-cyan-950">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Amendments</h3>
                <div className="space-y-4">
                  {contract.amendments.map((amendment) => (
                    <div
                      key={amendment._id}
                      className="border-b pb-4 last:border-0 last:pb-0"
                    >
                      <h4 className="font-medium">
                        Amendment {amendment.amendmentNumber}
                      </h4>
                      <p className="text-sm mt-1">{amendment.description}</p>
                      <div className="mt-2 text-sm text-muted-foreground">
                        Date: {format(new Date(amendment.date), "PPP")}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
