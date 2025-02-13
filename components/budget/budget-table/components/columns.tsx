"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { Budget } from "@/types/budget";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const customIncludesStringFilter = (
  row: Row<Budget>,
  columnId: string,
  filterValue: string
) => {
  const value = row.getValue(columnId) as string;
  return value?.toLowerCase().includes((filterValue as string).toLowerCase());
};

export const columns: ColumnDef<Budget>[] = [
  {
    accessorKey: "projectName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Project Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("projectName")}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.budgetCategory}
          </span>
        </div>
      );
    },
  },
  {
    id: "combinedName",
    header: "Name",
    accessorFn: (row) => {
      const budget = row;
      if (typeof budget === "object" && budget !== null) {
        return `${budget?.projectName || ""} ${budget?.budgetCategory || ""}`;
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
    accessorKey: "totalPlannedCost",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Planned Cost" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalPlannedCost")) || 0;
      const currency = row.original.currency || "USD";
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        maximumFractionDigits: 0,
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "totalActualCost",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actual Cost" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalActualCost")) || 0;
      const currency = row.original.currency || "USD";
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        maximumFractionDigits: 0,
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "budgetStartDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Duration" />
    ),
    cell: ({ row }) => {
      const startDate = new Date(row.getValue("budgetStartDate"));
      const endDate = new Date(row.original.budgetEndDate);
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
    accessorKey: "budgetCategory",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("budgetCategory")}</div>;
    },
    enableHiding: true,
  },
  {
    accessorKey: "progress",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Progress" />
    ),
    cell: ({ row }) => {
      const planned = parseFloat(String(row.original.totalPlannedCost)) || 0;
      const actual = parseFloat(String(row.original.totalActualCost)) || 0;
      const percentage = planned > 0 ? Math.round((actual / planned) * 100) : 0;
      
      return (
        <div className="flex flex-col">
          <span className="font-medium">{percentage}%</span>
          <span className="text-xs text-muted-foreground">
            Budget utilization
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
