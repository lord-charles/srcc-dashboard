"use client";

import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Cross2Icon } from "@radix-ui/react-icons";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableViewOptions } from "./data-table-view-options";
import { Claim } from "@/types/claim";
import { Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

const statuses = [
  {
    value: "pending_finance",
    label: "Pending Finance",
  },
  {
    value: "pending_md",
    label: "Pending MD",
  },
  {
    value: "approved",
    label: "Approved",
  },
  {
    value: "rejected",
    label: "Rejected",
  },
];

const amounts = [
  {
    value: "0-100000",
    label: "0 - 100,000",
  },
  {
    value: "100000-500000",
    label: "100,000 - 500,000",
  },
  {
    value: "500000-1000000",
    label: "500,000 - 1,000,000",
  },
  {
    value: "1000000+",
    label: "1,000,000+",
  },
];

// function downloadCSV(data: any[], filename: string) {
//   const headers = Object.keys(data[0]);
//   const csvRows = [
//     headers.join(','),
//     ...data.map(row => 
//       headers.map(header => {
//         const value = row[header];
//         // Handle values that need quotes (contain commas, quotes, or newlines)
//         if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
//           return `"${value.replace(/"/g, '""')}"`;
//         }
//         return value;
//       }).join(',')
//     )
//   ];
  
//   const csvContent = csvRows.join('\n');
//   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//   const link = document.createElement('a');
  
//   if (navigator.msSaveBlob) { // IE 10+
//     navigator.msSaveBlob(blob, filename);
//   } else {
//     const url = URL.createObjectURL(blob);
//     link.href = url;
//     link.download = filename;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
//   }
// }

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  const handleExport = () => {
    const rows = table.getFilteredRowModel().rows;
    const data = rows.map((row) => {
      const claim = row.original as Claim;
      return {
        "Contract Number": claim.contractId?.contractNumber || "N/A",
        "Project": claim.projectId?.name || "N/A",
        "Claimant": claim.claimantId 
          ? `${claim.claimantId.firstName} ${claim.claimantId.lastName}`
          : "N/A",
        "Amount": formatCurrency(claim.amount || 0, claim.currency),
        "Status": claim.status?.split("_").map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(" ") || "Unknown",
        "Milestones": claim.milestones?.map(m => m.title).join(", ") || "None",
        "Created": new Date(claim.createdAt).toLocaleDateString(),
      };
    });

    // downloadCSV(data, `claims_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search claims..."
          value={(table.getColumn("combinedName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("combinedName")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statuses}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={handleExport}
        >
          Export <Download className="ml-2 h-4 w-4" />
        </Button>
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
