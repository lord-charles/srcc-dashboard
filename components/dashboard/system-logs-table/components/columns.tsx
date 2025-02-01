"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "./data-table-column-header";
import { SystemLog } from "@/types/dashboard";
import { format, formatDistanceToNow } from "date-fns";

export const columns: ColumnDef<SystemLog>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
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
    accessorKey: "timestamp",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Timestamp" />
    ),
    cell: ({ row }) => <div>{row.getValue("timestamp")}</div>,
  },
  {
    accessorKey: "event",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Event" />
    ),
    cell: ({ row }) => <div>{row.getValue("event")}</div>,
  },
  {
    accessorKey: "details",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Details" />
    ),
    cell: ({ row }) => (
      <div className="truncate">{row.getValue("details")}</div>
    ),
  },
  {
    accessorKey: "severity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Severity" />
    ),
    cell: ({ row }) => {
      const severity = row.getValue("severity") as SystemLog["severity"];
      return (
        <Badge
          variant={
            (severity === "error"
              ? "destructive"
              : severity === "warn"
              ? "warning"
              : "secondary") as "default"
          }
        >
          {severity}
        </Badge>
      );
    },
  },
  {
    accessorKey: "userId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User ID" />
    ),
    cell: ({ row }) => <div>{row.getValue("userId")}</div>,
  },
  {
    accessorKey: "ipAddress",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="IP Address" />
    ),
    cell: ({ row }) => <div>{row.getValue("ipAddress")}</div>,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string;
      const formattedDate = format(new Date(createdAt), "PPpp");
      const timeAgo = formatDistanceToNow(new Date(createdAt), {
        addSuffix: true,
      });

      return (
        <div className="flex flex-col">
          <span className="text-xs">{formattedDate}</span>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
      );
    },
  },
];
