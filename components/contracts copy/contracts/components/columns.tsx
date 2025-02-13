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
          <span className="text-xs text-muted-foreground">
            {row.original.procurementReferenceNumber}
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
        return `${contract?.description || ""} ${contract?.contractNumber || ""}`;
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
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("description")}</span>
          <span className="text-xs text-muted-foreground line-clamp-1">
            {row.original.description}
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
          <span className="font-medium">{format(startDate, "MMM d, yyyy")}</span>
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
    accessorKey: "deliverables",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Progress" />
    ),
    cell: ({ row }) => {
      const deliverables = row.original.deliverables;
      const completed = deliverables.filter((d) => d.completed).length;
      const total = deliverables.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return (
        <div className="flex flex-col">
          <span className="font-medium">{percentage}%</span>
          <span className="text-xs text-muted-foreground">
            {completed}/{total} deliverables
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
