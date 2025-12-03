"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { Project } from "@/types/project";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useSession } from "next-auth/react";
// no icon imports needed for Created By column

const customIncludesStringFilter = (
  row: Row<Project>,
  columnId: string,
  filterValue: string
) => {
  const value = row.getValue(columnId) as string;
  return value?.toLowerCase().includes((filterValue as string).toLowerCase());
};

const shouldShowActions = (roles: string[] | undefined): boolean => {
  if (!roles || roles.length === 0) return false;
  // Hide actions if user only has consultant role
  if (roles.length === 1 && roles[0] === "consultant") return false;
  return true;
};

export const getColumns = (
  roles: string[] | undefined
): ColumnDef<Project>[] => {
  const baseColumns: ColumnDef<Project>[] = [
    // {
    //   id: "select",
    //   header: ({ table }) => (
    //     <Checkbox
    //       checked={table.getIsAllPageRowsSelected()}
    //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //       aria-label="Select all"
    //       className="translate-y-[2px]"
    //     />
    //   ),
    //   cell: ({ row }) => (
    //     <Checkbox
    //       checked={row.getIsSelected()}
    //       onCheckedChange={(value) => row.toggleSelected(!!value)}
    //       aria-label="Select row"
    //       className="translate-y-[2px]"
    //     />
    //   ),
    //   enableSorting: false,
    //   enableHiding: false,
    // },
    {
      id: "combinedSearch",
      header: "Search",
      accessorFn: (row) =>
        `${row.name || ""} ${row.description || ""} ${row.client || ""} ${
          row.projectManagerId.firstName || ""
        } ${row.projectManagerId.lastName || ""}`,
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

    // {
    //   accessorKey: "budget",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="Budget" />
    //   ),
    //   cell: ({ row }) => {
    //     const spent = row.original.amountSpent;
    //     const total = row.original.totalBudget;
    //     const currency = row.original.currency;
    //     return (
    //       <div className="flex flex-col">
    //         <span className="font-medium">
    //           {formatCurrency(spent, currency)} / {formatCurrency(total, currency)}
    //         </span>
    //         <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
    //           <div
    //             className="bg-blue-600 h-1.5 rounded-full"
    //             style={{ width: `${(spent / total) * 100}%` }}
    //           />
    //         </div>
    //       </div>
    //     );
    //   },
    // },
    {
      accessorKey: "createdBy",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created By" />
      ),
      cell: ({ row }) => {
        const createdBy = row.original.createdBy as Project["createdBy"];
        const firstName = (createdBy as any)?.firstName || "";
        const lastName = (createdBy as any)?.lastName || "";
        const email = (createdBy as any)?.email || "";
        const fullName = `${firstName} ${lastName}`.trim() || "-";
        return (
          <div className="flex flex-col">
            <span className="font-medium">{fullName}</span>
            <span className="text-sm text-muted-foreground">{email || ""}</span>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "duration",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Duration" />
      ),
      cell: ({ row }) => {
        const start = new Date(row.original.contractStartDate);
        const end = new Date(row.original.contractEndDate);
        const months =
          (end.getFullYear() - start.getFullYear()) * 12 +
          (end.getMonth() - start.getMonth());
        return (
          <div className="flex flex-col">
            <span>{months} months</span>
            <span className="text-sm text-muted-foreground">
              {formatDate(start.toISOString())} -{" "}
              {formatDate(end.toISOString())}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "department",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="School" />
      ),
      cell: ({ row }) => {
        const department = row.getValue("department") as string;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{department}</span>
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
  ];

  // Conditionally add actions column
  if (shouldShowActions(roles)) {
    baseColumns.push({
      accessorKey: "actions",
      cell: ({ row }) => <DataTableRowActions row={row} />,
    });
  }

  return baseColumns;
};

// Default export for backward compatibility
export const columns: ColumnDef<Project>[] = getColumns(undefined);
