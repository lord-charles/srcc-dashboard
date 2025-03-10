"use client";

import { useState } from "react";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import { columns } from "./columns";
import { Claim } from "@/types/claim";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";

interface DataTableProps {
  data: Claim[];
}

export function DataTable({ data }: DataTableProps) {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  // Calculate summary statistics
  const totalClaims = data.length;
  const totalAmount = data.reduce((sum, claim) => sum + (claim.amount || 0), 0);
  const pendingClaims = data.filter(claim => claim.status?.includes("pending")).length;
  const approvedClaims = data.filter(claim => claim.status === "approved").length;
  const currency = data[0]?.currency || "KES";

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">Total Claims</span>
            <span className="text-2xl font-bold">{totalClaims}</span>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">Total Amount</span>
            <span className="text-2xl font-bold">
              {formatCurrency(totalAmount, currency)}
            </span>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">Pending Claims</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{pendingClaims}</span>
              <span className="text-sm text-muted-foreground">
                ({((pendingClaims / totalClaims) * 100).toFixed(1)}%)
              </span>
            </div>
            <Progress 
              value={(pendingClaims / totalClaims) * 100} 
              className="h-2 mt-2 bg-muted [&>div]:bg-yellow-600"
            />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">Approved Claims</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{approvedClaims}</span>
              <span className="text-sm text-muted-foreground">
                ({((approvedClaims / totalClaims) * 100).toFixed(1)}%)
              </span>
            </div>
            <Progress 
              value={(approvedClaims / totalClaims) * 100} 
              className="h-2 mt-2 bg-muted [&>div]:bg-green-600"
            />
          </div>
        </Card>
      </div>

      {/* Claims Table */}
      <div className="space-y-4">
        <DataTableToolbar table={table} />
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
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
                    No claims found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
