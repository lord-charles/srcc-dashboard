"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { Imprest, ImprestStatus } from "@/types/imprest";
import { formatDate } from "@/lib/utils";

const getStatusColor = (status: ImprestStatus) => {
  switch (status) {
    case "pending_hod":
      return "bg-yellow-500";
    case "pending_accountant":
      return "bg-orange-500";
    case "pending_accounting_approval":
      return "bg-orange-500";
    case "approved":
      return "bg-green-500";
    case "rejected":
      return "bg-red-500";
    case "disbursed":
      return "bg-blue-500";
    case "pending_acknowledgment":
      return "bg-amber-500";
    case "disputed":
      return "bg-red-600";
    case "resolved_dispute":
      return "bg-purple-500";
    case "accounted":
      return "bg-emerald-500";
    case "overdue":
      return "bg-red-700";
    default:
      return "bg-gray-500";
  }
};

export const columns: ColumnDef<Imprest>[] = [
  {
    accessorFn: (row) =>
      `${row.requestedBy.firstName} ${row.requestedBy.lastName}`,
    id: "employeeName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Employee" />
    ),
    cell: ({ row }) => {
      const employee = row.original.requestedBy;
      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {employee?.firstName} {employee?.lastName}
          </span>
          <span className="text-xs text-muted-foreground">
            {employee?.email || "No Email"}
          </span>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => {
      const amount = row.original.amount;
      const currency = row.original.currency;
      return (
        <div className="font-medium">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
          }).format(amount)}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "paymentReason",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Purpose" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.paymentReason}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.paymentType}
          </span>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "requestDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Request Date" />
    ),
    cell: ({ row }) => formatDate(row.original.requestDate),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Due Date" />
    ),
    cell: ({ row }) => formatDate(row.original.dueDate),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge className={`${getStatusColor(status)}`}>
          {status
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </Badge>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
