"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { Contract } from "@/types/contract";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const customIncludesStringFilter = (
  row: Row<Contract>,
  columnId: string,
  filterValue: string
) => {
  const value = row.getValue(columnId) as string;
  return value?.toLowerCase().includes((filterValue as string).toLowerCase());
};

export const columns: ColumnDef<Contract>[] = [
  {
    accessorKey: "contractNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contract Number" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("contractNumber")}</span>
          <span className="text-xs text-muted-foreground line-clamp-1">
            {row.original.projectId?.name || ""}
          </span>
        </div>
      );
    },
  },
  {
    id: "combinedName",
    header: "Name",
    accessorFn: (row) => {
      const contract = row;
      if (typeof contract === "object" && contract !== null) {
        return `${contract?.description || ""} ${
          contract?.contractNumber || ""
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
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("description")}</span>
          <span className="text-xs text-muted-foreground line-clamp-1">
            {row.original.contractedUserId?.firstName}{" "}
            {row.original.contractedUserId?.lastName}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "contractValue",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contract Value" />
    ),
    cell: ({ row }) => {
      const amount = row.getValue("contractValue") as number;
      const currency = row.original.currency;
      const formatted = new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: currency,
        maximumFractionDigits: 0,
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Duration" />
    ),
    cell: ({ row }) => {
      const startDate = new Date(row.getValue("startDate"));
      const endDate = new Date(row.original.endDate);
      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {format(startDate, "MMM d, yyyy")}
          </span>
          <span className="text-xs text-muted-foreground">
            to {format(endDate, "MMM d, yyyy")}
          </span>
        </div>
      );
    },
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
            status === "active"
              ? "bg-green-100 text-green-800"
              : status === "completed"
              ? "bg-blue-100 text-blue-800"
              : status === "terminated"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "amendments",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amendments" />
    ),
    cell: ({ row }) => {
      const amendments = row.original.amendments || [];
      const count = amendments.length;

      return (
        <div className="flex flex-col">
          <span className="font-medium">{count}</span>
          <span className="text-xs text-muted-foreground">
            {count === 1 ? "amendment" : "amendments"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
