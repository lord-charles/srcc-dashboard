"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { Advance } from "@/types/advance";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types/user";

const customIncludesStringFilter = (
  row: Row<Advance>,
  columnId: string,
  filterValue: string
) => {
  const value = row.getValue(columnId) as string;
  return value?.toLowerCase().includes((filterValue as string).toLowerCase());
};

export const columns: ColumnDef<Advance>[] = [
  {
    accessorKey: "employee",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Employee" />
    ),
    cell: ({ row }) => {
      const employee = row.getValue("employee") as User;
      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {employee?.firstName} {employee?.lastName}
          </span>
          <span className="text-xs text-muted-foreground">
            {employee?.employeeId}
          </span>
        </div>
      );
    },
  },
  {
    id: "combinedName",
    header: "Name",
    accessorFn: (row) => {
      const employee = row?.employee;
      if (typeof employee === "object" && employee !== null) {
        return `${employee?.firstName || ""} ${employee?.lastName || ""}`;
      }
      return "";
    },
    filterFn: customIncludesStringFilter,
    enableHiding: true, // Allow this column to be hidden
    enableSorting: false, // Prevent sorting if not needed
    size: 0, // Set minimal size
    cell: () => null, // This ensures nothing renders in the cell
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number;
      const formatted = new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "purpose",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Purpose" />
    ),
    cell: ({ row }) => <div>{row.getValue("purpose")}</div>,
  },

  {
    accessorKey: "totalRepayment",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Repayment" />
    ),
    cell: ({ row }) => {
      const amount = Math.ceil(row.getValue("totalRepayment") as number);
      const formatted = new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "installmentAmount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fee" />
    ),
    cell: ({ row }) => {
      const amount = row.getValue("installmentAmount") as number;
      const formatted = new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "amountRepaid",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount Repaid" />
    ),
    cell: ({ row }) => {
      const amount = row.getValue("amountRepaid") as number;
      const formatted = new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "requestedDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Requested Date" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <div>
          {row.getValue("requestedDate")
            ? format(new Date(row.getValue("requestedDate")), "PPP")
            : "N/A"}
        </div>
      </div>
    ),
  },

  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          className={
            status === "approved"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              : status === "declined"
              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
              : status === "repaying"
              ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
              : status === "repaid"
              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
              : status === "disbursed"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" // pending
          }
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
