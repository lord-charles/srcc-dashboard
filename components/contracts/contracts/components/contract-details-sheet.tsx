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
      draft: ["active", "terminated"],
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
              Created on{" "}
              {contract?.createdAt
                ? format(new Date(contract.createdAt), "PPP")
                : "N/A"}
            </div>
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Contract Information */}
          <Card className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950 dark:to-slate-950">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">
                Contract Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">
                    Contract Number
                  </span>
                  <p className="font-medium">{contract.contractNumber}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Project</span>
                  <p className="font-medium">
                    {contract.projectId?.name || "N/A"}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-muted-foreground">
                    Description
                  </span>
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
                  <span className="text-sm text-muted-foreground">
                    Contract Value
                  </span>
                  <p className="font-medium">
                    {formatCurrency(contract.contractValue, contract.currency)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Currency
                  </span>
                  <p className="font-medium">{contract.currency}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Start Date
                  </span>
                  <p className="font-medium">
                    {format(new Date(contract.startDate), "PPP")}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    End Date
                  </span>
                  <p className="font-medium">
                    {format(new Date(contract.endDate), "PPP")}
                  </p>
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

          {/* Contractor Information */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">
                Contractor Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Name</span>
                  <p className="font-medium">
                    {contract.contractedUserId?.firstName}{" "}
                    {contract.contractedUserId?.lastName}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Email</span>
                  <p className="font-medium">
                    {contract.contractedUserId?.email}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Phone</span>
                  <p className="font-medium">
                    {contract.contractedUserId?.phoneNumber}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amendments */}
          {contract.amendments && contract.amendments.length > 0 && (
            <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950 dark:to-cyan-950">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Amendments</h3>
                <div className="space-y-4">
                  {contract.amendments.map((amendment, index) => (
                    <div
                      key={amendment._id || index}
                      className="border-b pb-4 last:border-0 last:pb-0"
                    >
                      <h4 className="font-medium">Amendment {index + 1}</h4>
                      <p className="text-sm mt-1">
                        {amendment.description || "No description"}
                      </p>
                      {amendment.date && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          Date: {format(new Date(amendment.date), "PPP")}
                        </div>
                      )}
                      {amendment.changedFields &&
                        amendment.changedFields.length > 0 && (
                          <div className="mt-2 text-sm">
                            <span className="text-muted-foreground">
                              Changed fields:{" "}
                            </span>
                            {amendment.changedFields.join(", ")}
                          </div>
                        )}
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
