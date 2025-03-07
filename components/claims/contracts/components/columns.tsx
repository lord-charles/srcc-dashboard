"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Claim, ClaimStatus } from "@/types/claim";

const formatCurrency = (amount: number, currency: string = "KES") => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getStatusColor = (status: ClaimStatus) => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "draft":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-yellow-100 text-yellow-800";
  }
};

const customIncludesStringFilter = (
  row: Row<Claim>,
  columnId: string,
  filterValue: string
) => {
  const value = row.getValue(columnId) as string;
  return value?.toLowerCase().includes((filterValue as string).toLowerCase());
};
 

const formatStatus = (status: string) => {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const columns: ColumnDef<Claim>[] = [
  {
    accessorKey: "contractId.contractNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contract Number" />
    ),
    cell: ({ row }) => {
      const contract = row.original?.contractId;
      const project = row.original?.projectId;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{contract?.contractNumber || "N/A"}</span>
          <span className="text-xs text-muted-foreground line-clamp-1">
            {project?.name || "No Project"}
          </span>
        </div>
      );
    },
  },
  {
    id: "combinedName",
    header: "Name",
    accessorFn: (row) => {
      const claim = row;
      if (typeof claim === "object" && claim !== null) {
        return `${claim?.claimantId?.firstName || ""} ${
          claim?.claimantId?.lastName || ""
        }`;
      }
      return "";
    },
    filterFn: customIncludesStringFilter,
    enableHiding: true,
    enableSorting: false,
    size: 0,
    cell: () => null,
  },
  {
    id: "claimant",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Claimant" />
    ),
    cell: ({ row }) => {
      const claimant = row.original?.claimantId;
      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {claimant ? `${claimant?.firstName} ${claimant?.lastName}` : "N/A"}
          </span>
          <span className="text-xs text-muted-foreground line-clamp-1">
            {claimant?.email || "No email"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number;
      const currency = row.original.currency || "KES";
      const totalMaxAmount = row.original.milestones?.reduce(
        (sum, m) => sum + (m.maxClaimableAmount || 0),
        0
      ) || 0;
      const percentage = totalMaxAmount > 0 
        ? ((amount / totalMaxAmount) * 100).toFixed(1)
        : "0.0";

      return (
        <div className="flex flex-col">
          <span className="font-medium">{formatCurrency(amount, currency)}</span>
          <span className="text-xs text-muted-foreground">
            {percentage}% of total claimable
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "milestones",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Milestones" />
    ),
    cell: ({ row }) => {
      const milestones = row.original.milestones || [];
      const currency = row.original.currency || "KES";
      
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col cursor-help">
                <span className="font-medium">{milestones.length} milestone{milestones.length !== 1 ? 's' : ''}</span>
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {milestones.map(m => m.title).join(", ") || "No milestones"}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="w-80 p-2">
              <div className="space-y-2">
                {milestones.map((m) => (
                  <div key={m._id} className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-medium">{m.title}</div>
                    <div className="text-right">
                      {formatCurrency(m.currentClaim, currency)}
                      <div className="text-xs text-muted-foreground">
                        of {formatCurrency(m.maxClaimableAmount, currency)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as ClaimStatus;
      return (
        <Badge className={getStatusColor(status)}>
          {formatStatus(status)}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdAt")
        ? new Date(row.getValue("createdAt") as string)
        : null;

      if (!date) return <span className="text-muted">No date</span>;

      return (
        <div className="flex flex-col">
          <span className="font-medium">{format(date, "MMM d, yyyy")}</span>
          <span className="text-xs text-muted-foreground">
            {format(date, "h:mm a")}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
