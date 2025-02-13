"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { Project } from "@/types/project";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AlertTriangle, CheckCircle } from "lucide-react";

const customIncludesStringFilter = (
  row: Row<Project>,
  columnId: string,
  filterValue: string
) => {
  const value = row.getValue(columnId) as string;
  return value?.toLowerCase().includes((filterValue as string).toLowerCase());
};

export const columns: ColumnDef<Project>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "combinedSearch",
    header: "Search",
    accessorFn: (row) =>
      `${row.name || ""} ${row.description || ""} ${row.client || ""} ${
        row.projectManager || ""
      }`,
    filterFn: customIncludesStringFilter,
    enableHiding: true,
    enableSorting: false,
    size: 0,
    cell: () => null,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Project Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("name")}</span>
          <span className="text-sm text-muted-foreground">
            {row.original.description.split(" ").slice(0, 6).join(" ")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "client",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("client")}</span>
          <span className="text-sm text-muted-foreground">
            {row.original.client}
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
              : status === "on-hold"
              ? "bg-yellow-100 text-yellow-800"
              : status === "completed"
              ? "bg-blue-100 text-blue-800"
              : "bg-red-100 text-red-800"
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
    accessorKey: "budget",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Budget" />
    ),
    cell: ({ row }) => {
      const spent = row.original.amountSpent;
      const total = row.original.totalBudget;
      const currency = row.original.currency;
      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {formatCurrency(spent, currency)} / {formatCurrency(total, currency)}
          </span>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
            <div
              className="bg-blue-600 h-1.5 rounded-full"
              style={{ width: `${(spent / total) * 100}%` }}
            />
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "riskLevel",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Risk Level" />
    ),
    cell: ({ row }) => {
      const risk = row.getValue("riskLevel") as string;
      return (
        <div className="flex items-center gap-2">
          {risk === "High" ? (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          ) : risk === "Medium" ? (
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          <span>{risk}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "duration",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Duration" />
    ),
    cell: ({ row }) => {
      const start = new Date(row.original.contractStartDate);
      const end = new Date(row.original.contractEndDate);
      const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                    (end.getMonth() - start.getMonth());
      return (
        <div className="flex flex-col">
          <span>{months} months</span>
          <span className="text-sm text-muted-foreground">
            {formatDate(start.toISOString())} - {formatDate(end.toISOString())}
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
