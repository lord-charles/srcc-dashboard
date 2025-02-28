"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { Budget } from "@/types/budget";
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
import { User } from "lucide-react";

const customIncludesStringFilter = (
  row: Row<Budget>,
  columnId: string,
  filterValue: string
) => {
  const value = row.getValue(columnId) as string;
  return value?.toLowerCase().includes((filterValue as string).toLowerCase());
};

const truncateText = (text: string, length: number) => {
  if (!text) return '-';
  return text.length > length ? `${text.substring(0, length)}...` : text;
};

const TooltipWrapper = ({ content, children }: { content: string, children: React.ReactNode }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent>
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const columns: ColumnDef<Budget>[] = [
  {
    accessorKey: "projectId.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Project Name" />
    ),
    cell: ({ row }) => {
      const projectName = row.original?.projectId?.name || 'Untitled Project';
      const description = row.original?.projectId?.description || 'No description';

      return (
        <div className="flex flex-col">
          <TooltipWrapper content={projectName}>
            <span className="font-medium text-primary hover:text-primary/80 cursor-default">
              {truncateText(projectName, 30)}
            </span>
          </TooltipWrapper>
          <TooltipWrapper content={description}>
            <span className="text-xs text-muted-foreground cursor-default">
              {truncateText(description, 40)}
            </span>
          </TooltipWrapper>
        </div>
      );
    },
  },
  {
    id: "combinedName",
    header: "Name",
    accessorFn: (row) => {
      if (!row?.projectId) return "";
      return `${row.projectId.name || ""} ${row.projectId.description || ""} v${row.version || ""}`.trim();
    },
    filterFn: customIncludesStringFilter,
    enableHiding: true,
    enableSorting: false,
    size: 0,
    cell: () => null,
  },
  {
    accessorKey: "createdBy",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created By" />
    ),
    cell: ({ row }) => {
      const createdBy = row.original.createdBy;
      if (!createdBy) return <div>-</div>;

      const initials = `${createdBy.firstName?.[0] || ''}${createdBy.lastName?.[0] || ''}`.toUpperCase();
      const fullName = `${createdBy.firstName || ''} ${createdBy.lastName || ''}`.trim();

      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {initials || <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <TooltipWrapper content={createdBy.email}>
              <span className="font-medium text-sm">{truncateText(fullName, 20)}</span>
            </TooltipWrapper>
            <span className="text-xs text-muted-foreground">
              {format(new Date(row.original.createdAt), "MMM d, yyyy")}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "totalBudget",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Budget" />
    ),
    cell: ({ row }) => {
      const budget = row.original;
      const total = (budget.totalInternalBudget || 0) + (budget.totalExternalBudget || 0);
      return (
        <div className="font-medium">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: budget.currency || "KES",
            maximumFractionDigits: 0,
          }).format(total)}
        </div>
      );
    },
  },
  {
    accessorKey: "totalSpent",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Spent" />
    ),
    cell: ({ row }) => {
      const budget = row.original;
      const total = (budget.totalInternalSpent || 0) + (budget.totalExternalSpent || 0);
      const totalBudget = (budget.totalInternalBudget || 0) + (budget.totalExternalBudget || 0);
      const percentage = totalBudget > 0 ? (total / totalBudget) * 100 : 0;
      const isOverBudget = percentage > 100;

      return (
        <div className="flex flex-col">
          <span className={`font-medium ${isOverBudget ? 'text-red-600' : ''}`}>
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: budget.currency || "KES",
              maximumFractionDigits: 0,
            }).format(total)}
          </span>
          <span className={`text-xs ${isOverBudget ? 'text-red-600' : 'text-muted-foreground'}`}>
            {percentage.toFixed(1)}% of budget
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "dates",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Duration" />
    ),
    cell: ({ row }) => {
      const budget = row.original;
      const allDates = [
        ...budget.internalCategories?.flatMap(cat =>
          cat.items?.flatMap(item => [item.startDate, item.endDate])
        ) || [],
        ...budget.externalCategories?.flatMap(cat =>
          cat.items?.flatMap(item => [item.startDate, item.endDate])
        ) || [],
      ].filter(date => date) as string[];

      if (allDates.length === 0) return <div className="text-muted-foreground text-sm">No dates set</div>;

      const dates = allDates.map(date => new Date(date));
      const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
      const latest = new Date(Math.max(...dates.map(d => d.getTime())));

      const duration = Math.ceil((latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24));

      return (
        <div className="flex flex-col">
          <span className="font-medium">{format(earliest, "MMM d, yyyy")}</span>
          <span className="text-xs text-muted-foreground">
            {duration} days · ends {format(latest, "MMM d, yyyy")}
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
      const displayStatus = status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
      const getStatusColor = (status: string) => {
        switch (status) {
          case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
          case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
          case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
          case 'revision_requested': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
          case 'pending_checker_approval': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
          case 'pending_manager_approval': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
          case 'pending_finance_approval': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
          default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
        }
      };

      return (
        <Badge className={`${getStatusColor(status)} font-medium`}>
          {displayStatus}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "version",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Version" />
    ),
    cell: ({ row }) => {
      const version = row.getValue("version");
      return (
        <div className="font-medium">
          <Badge variant="outline" className="font-mono">
            v {`${version}` || '1'}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "progress",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Progress" />
    ),
    cell: ({ row }) => {
      const budget = row.original;
      const planned = (budget.totalInternalBudget || 0) + (budget.totalExternalBudget || 0);
      const actual = (budget.totalInternalSpent || 0) + (budget.totalExternalSpent || 0);
      const percentage = planned > 0 ? Math.round((actual / planned) * 100) : 0;

      const getProgressColor = (percentage: number) => {
        if (percentage > 100) return 'text-red-600';
        if (percentage > 90) return 'text-yellow-600';
        if (percentage > 70) return 'text-blue-600';
        return 'text-green-600';
      };

      return (
        <div className="flex flex-col">
          <span className={`font-medium ${getProgressColor(percentage)}`}>
            {percentage}%
          </span>
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
