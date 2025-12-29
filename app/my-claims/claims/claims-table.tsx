"use client";

import { useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  Eye,
  Filter,
  Search,
  FileDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ClaimDetailsDialog } from "./claim-details";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Claim } from "@/types/claim";

interface ClaimsTableProps {
  claims: Claim[];
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case "approved":
    case "paid":
      return "success";
    case "rejected":
    case "cancelled":
      return "destructive";
    case "draft":
      return "secondary";
    case "revision_requested":
      return "warning";
    case "pending_checker_approval":
    case "pending_reviewer_approval":
    case "pending_approver_approval":
    case "pending_srcc_checker_approval":
    case "pending_srcc_finance_approval":
    case "pending_director_approval":
    case "pending_academic_director_approval":
    case "pending_finance_approval":
      return "warning";
    default:
      return "secondary";
  }
};

const formatStatusLabel = (status: string) => {
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

export function ClaimsTable({ claims }: ClaimsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

  const columns: ColumnDef<Claim>[] = [
    {
      accessorFn: (row) => row.contractId?.contractNumber,
      id: "contractNumber",
      header: "Contract Number",
      cell: ({ row }) => (
        <div className="font-medium text-blue-700">
          {row.original.contractId?.contractNumber}
        </div>
      ),
    },
    {
      accessorKey: "projectId.name",
      header: "Project Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.projectId?.name}</div>
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {formatCurrency(row.original?.amount, row.original?.currency)}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant={getStatusVariant(status)} className="font-medium">
            {formatStatusLabel(status)}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        const status = row.getValue(id) as string;
        return value.some((val: string) => {
          if (val === "pending") {
            return status.toLowerCase().includes("pending");
          }
          return status.toLowerCase() === val.toLowerCase();
        });
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedClaim(row.original)}
                  className="rounded-full hover:bg-blue-100 hover:text-blue-700"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View claim details</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
  ];

  const table = useReactTable({
    data: claims,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const statusOptions = [
    "draft",
    "pending_checker_approval",
    "pending_reviewer_approval",
    "pending_approver_approval",
    "pending_srcc_checker_approval",
    "pending_srcc_finance_approval",
    "pending_director_approval",
    "pending_academic_director_approval",
    "pending_finance_approval",
    "approved",
    "rejected",
    "paid",
    "cancelled",
    "revision_requested",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Claims History</CardTitle>
          <CardDescription>
            View and manage all your submitted claims. Click on a claim to see
            more details.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-6 py-3 border-b">
            <div className="flex items-center gap-2 w-full max-w-sm">
              <div className="relative w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contract numbers..."
                  value={
                    (table
                      .getColumn("contractNumber")
                      ?.getFilterValue() as string) ?? ""
                  }
                  onChange={(event) =>
                    table
                      .getColumn("contractNumber")
                      ?.setFilterValue(event.target.value)
                  }
                  className="pl-8 w-full"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-auto h-9">
                    <Filter className="mr-2 h-4 w-4" />
                    Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[250px]">
                  {statusOptions.map((status) => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={
                        (table
                          .getColumn("status")
                          ?.getFilterValue() as string[]) === undefined
                          ? false
                          : (
                              table
                                .getColumn("status")
                                ?.getFilterValue() as string[]
                            ).includes(status)
                      }
                      onCheckedChange={(value) => {
                        const filterValues =
                          (table
                            .getColumn("status")
                            ?.getFilterValue() as string[]) || [];
                        if (value) {
                          table
                            .getColumn("status")
                            ?.setFilterValue([...filterValues, status]);
                        } else {
                          table
                            .getColumn("status")
                            ?.setFilterValue(
                              filterValues.filter((val) => val !== status)
                            );
                        }
                      }}
                    >
                      {formatStatusLabel(status)}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-auto h-9">
                    Columns <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.id === "contractId.contractNumber"
                            ? "Contract Number"
                            : column.id === "projectId.name"
                            ? "Project Name"
                            : column.id === "createdAt"
                            ? "Date Created"
                            : column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="rounded-md">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="bg-muted/50 hover:bg-muted/50"
                  >
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Search className="h-8 w-8 mb-2 opacity-50" />
                        <p>No claims found</p>
                        <p className="text-sm">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end p-4 border-t">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} claim(s) total
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedClaim && (
        <ClaimDetailsDialog
          claim={selectedClaim}
          open={!!selectedClaim}
          onOpenChange={() => setSelectedClaim(null)}
        />
      )}
    </motion.div>
  );
}
