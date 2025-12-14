"use client";

import React from "react";
import {
  Search,
  Filter,
  ChevronDown,
  SlidersHorizontal,
  Download,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ImprestFiltersProps {
  searchTerm: string;
  statusFilter: string[];
  paymentTypeFilter: string[];
  dateFilter: string;
  itemsPerPage: number;
  uniquePaymentTypes: string[];
  onSearchChange: (value: string) => void;
  onStatusFilter: (status: string) => void;
  onPaymentTypeFilter: (type: string) => void;
  onDateFilterChange: (filter: string) => void;
  onItemsPerPageChange: (items: number) => void;
  onExport: () => void;
  onResetFilters: () => void;
}

export function ImprestFilters({
  searchTerm,
  statusFilter,
  paymentTypeFilter,
  dateFilter,
  itemsPerPage,
  uniquePaymentTypes,
  onSearchChange,
  onStatusFilter,
  onPaymentTypeFilter,
  onDateFilterChange,
  onItemsPerPageChange,
  onExport,
  onResetFilters,
}: ImprestFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 py-4 px-2 border-b">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by reason, ID, or explanation..."
          className="pl-8 border-border/50 focus-visible:ring-primary/20 focus-visible:ring-offset-0"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-10 border-border/50 hover:bg-muted/50"
            >
              <Filter className="mr-2 h-4 w-4 text-primary" />
              Filter
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 border-border/50 shadow-lg scale-90"
          >
            <DropdownMenuLabel className="flex items-center gap-2 text-primary">
              <Filter className="h-4 w-4" />
              Filter Options
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={statusFilter.includes("pending_hod")}
              onCheckedChange={() => onStatusFilter("pending_hod")}
              className="focus:bg-amber-50 dark:focus:bg-amber-950/30"
            >
              <span className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                Pending HOD
              </span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter.includes("pending_accountant")}
              onCheckedChange={() => onStatusFilter("pending_accountant")}
              className="focus:bg-amber-50 dark:focus:bg-amber-950/30"
            >
              <span className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                Pending Accountant
              </span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter.includes("approved")}
              onCheckedChange={() => onStatusFilter("approved")}
              className="focus:bg-emerald-50 dark:focus:bg-emerald-950/30"
            >
              <span className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                Approved
              </span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter.includes("disbursed")}
              onCheckedChange={() => onStatusFilter("disbursed")}
              className="focus:bg-blue-50 dark:focus:bg-blue-950/30"
            >
              <span className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                Disbursed
              </span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter.includes("rejected")}
              onCheckedChange={() => onStatusFilter("rejected")}
              className="focus:bg-rose-50 dark:focus:bg-rose-950/30"
            >
              <span className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-rose-500" />
                Rejected
              </span>
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Filter by Payment Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {uniquePaymentTypes.map((type) => (
              <DropdownMenuCheckboxItem
                key={type}
                checked={paymentTypeFilter.includes(type)}
                onCheckedChange={() => onPaymentTypeFilter(type)}
              >
                {type}
              </DropdownMenuCheckboxItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Filter by Date</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={dateFilter === "all"}
              onCheckedChange={() => onDateFilterChange("all")}
            >
              All Time
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={dateFilter === "last7days"}
              onCheckedChange={() => onDateFilterChange("last7days")}
            >
              Last 7 Days
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={dateFilter === "last30days"}
              onCheckedChange={() => onDateFilterChange("last30days")}
            >
              Last 30 Days
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={dateFilter === "last90days"}
              onCheckedChange={() => onDateFilterChange("last90days")}
            >
              Last 90 Days
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-10 border-border/50 hover:bg-muted/50"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4 text-primary" />
              Options
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="border-border/50 shadow-lg"
          >
            <DropdownMenuItem onClick={onExport} className="focus:bg-primary/5">
              <Download className="mr-2 h-4 w-4 text-primary" />
              Export Data
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onResetFilters}
              className="focus:bg-primary/5"
            >
              <RefreshCw className="mr-2 h-4 w-4 text-primary" />
              Reset Filters
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="flex items-center gap-2 text-primary">
              <SlidersHorizontal className="h-4 w-4" />
              Display Options
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={itemsPerPage === 5}
              onCheckedChange={() => onItemsPerPageChange(5)}
            >
              5 items per page
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={itemsPerPage === 10}
              onCheckedChange={() => onItemsPerPageChange(10)}
            >
              10 items per page
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={itemsPerPage === 20}
              onCheckedChange={() => onItemsPerPageChange(20)}
            >
              20 items per page
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
