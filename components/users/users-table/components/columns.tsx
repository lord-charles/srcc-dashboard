"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { User } from "@/types/user";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const customIncludesStringFilter = (
  row: Row<User>,
  columnId: string,
  filterValue: string
) => {
  const value = row.getValue(columnId) as string;
  return value?.toLowerCase().includes((filterValue as string).toLowerCase());
};

export const columns: ColumnDef<User>[] = [

  {
    id: "combinedName",
    header: "Name",
    accessorFn: (row) =>
      `${row.firstName || ""} ${row.lastName || ""} ${row.phoneNumber || ""} ${row.email || ""
      } ${row.position || ""} ${row.department || ""}`,
    filterFn: customIncludesStringFilter,
    enableHiding: true, // Allow this column to be hidden
    enableSorting: false, // Prevent sorting if not needed
    size: 0, // Set minimal size
    cell: () => null, // This ensures nothing renders in the cell
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 text-blue-700 rounded-full h-8 w-8 flex items-center justify-center font-semibold">
            {row.original.firstName[0]}{row.original.lastName[0]}
          </div>
          <div className="flex flex-col">
            <span className="font-medium">
              {row.original.firstName} {row.original.lastName}
            </span>
            <span className="text-sm text-muted-foreground">
              {row.original.email}
            </span>
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "employeeId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Employee ID" />
    ),
    cell: ({ row }) => <div>{row.getValue("employeeId")}</div>,
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "phoneNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone Number" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span>{row.original.phoneNumber}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "position",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Position" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span>{row.original.position}</span>
          <span className="text-sm text-muted-foreground">
            {row.original.department}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },

  {
    accessorKey: "employmentType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Employment Type" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          {row.getValue("employmentType")}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "baseSalary",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Base Salary" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("baseSalary"));
      const formatted = new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  // {
  //   accessorKey: "employmentStartDate",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Start Date" />
  //   ),
  //   cell: ({ row }) => {
  //     return (
  //       <div className="flex flex-col">
  //         {format(new Date(row.getValue("employmentStartDate")), "PPP")}
  //       </div>
  //     );
  //   },
  // },
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
              : status === "inactive"
                ? "bg-yellow-100 text-yellow-800"
                : status === "suspended"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
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
    accessorKey: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
