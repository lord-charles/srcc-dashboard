"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { Lpo } from "@/types/lpo";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, FileText, Building2, Truck, Calendar } from "lucide-react";

const customIncludesStringFilter = (
  row: Row<Lpo>,
  columnId: string,
  filterValue: string,
) => {
  const value = row.getValue(columnId) as string;
  return value?.toLowerCase().includes((filterValue as string).toLowerCase());
};

const truncateText = (text: string, length: number) => {
  if (!text) return "-";
  return text.length > length ? `${text.substring(0, length)}...` : text;
};

const TooltipWrapper = ({
  content,
  children,
}: {
  content: string;
  children: React.ReactNode;
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const columns: ColumnDef<Lpo>[] = [
  {
    accessorKey: "lpoNo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="LPO Number" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-md">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <span className="font-bold font-mono text-sm tracking-tight">
            {row.getValue("lpoNo")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "projectId.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Project" />
    ),
    cell: ({ row }) => {
      const projectName = row.original?.projectId?.name || "Unknown Project";

      return (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
          <TooltipWrapper content={projectName}>
            <span className="font-medium truncate max-w-[180px]">
              {truncateText(projectName, 30)}
            </span>
          </TooltipWrapper>
        </div>
      );
    },
  },
  {
    accessorKey: "supplierId.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Supplier" />
    ),
    cell: ({ row }) => {
      const supplierName = row.original?.supplierId?.name || "Unknown Supplier";

      return (
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
          <TooltipWrapper content={supplierName}>
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {truncateText(supplierName, 25)}
            </span>
          </TooltipWrapper>
        </div>
      );
    },
  },
  {
    accessorKey: "lpoDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            {format(new Date(row.getValue("lpoDate")), "MMM d, yyyy")}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Amount" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalAmount"));
      const currency = row.original.currency || "KES";

      return (
        <div className="font-bold text-base tracking-tight">
          {new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 0,
          }).format(amount)}
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
      const displayStatus =
        status?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) ||
        "Unknown";

      const getStatusColor = (status: string) => {
        switch (status) {
          case "finance_approved":
            return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
          case "hod_approved":
            return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800";
          case "rejected":
            return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800";
          case "draft":
            return "bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300 border-slate-200 dark:border-slate-800";
          case "submitted":
            return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800";
          default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
        }
      };

      return (
        <Badge
          className={`${getStatusColor(status)} font-bold px-2.5 py-0.5 border`}
        >
          {displayStatus}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
