"use client";

import type * as React from "react";
import { useState, useEffect, useMemo } from "react";
import {
  CheckIcon,
  ChevronsUpDown,
  Filter,
  History,
  Info,
  Keyboard,
  Search,
  StarIcon,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { BUDGET_CODES } from "@/lib/budget";
import { Command } from "cmdk";

interface BudgetCode {
  code: string;
  name: string;
}

const BUDGET_CATEGORIES = {
  "1": "Administrative",
  "2": "Operational",
};

interface BudgetCodeSelectorProps {
  selectedCode: string | null;
  onSelect: (code: string, name: string) => void;
  categoryIndex?: number;
  handleCategoryChange?: (
    index: number,
    field: string,
    value: string,
    type: string
  ) => void;
}

export function BudgetCodeSelector({
  selectedCode,
  onSelect,
  categoryIndex = 0,
  handleCategoryChange,
}: BudgetCodeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentSelections, setRecentSelections] = useState<string[]>([]);
  const [filterOptions, setFilterOptions] = useState({
    onlyFavorites: false,
    categoryFilter: "",
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const itemsPerPage = 5;

  // Get the selected budget code details
  const selectedBudgetCode = useMemo(() => {
    return BUDGET_CODES.find(
      (code): code is BudgetCode =>
        typeof code?.code === "string" && code.code === selectedCode
    );
  }, [selectedCode]);

  // Filter budget codes based on search query and filter options
  const filteredBudgetCodes = useMemo(() => {
    let filtered = BUDGET_CODES.filter(
      (code): code is BudgetCode =>
        typeof code?.code === "string" && typeof code?.name === "string"
    );

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (code) =>
          code.code.toLowerCase().includes(query) ||
          code.name.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filterOptions.categoryFilter) {
      filtered = filtered.filter((code) =>
        code.code.startsWith(filterOptions.categoryFilter)
      );
    }

    // Apply favorites filter
    if (filterOptions.onlyFavorites) {
      filtered = filtered.filter((code) => favorites.includes(code.code));
    }

    // Handle different tabs
    if (activeTab === "favorites") {
      filtered = filtered.filter((code) => favorites.includes(code.code));
    } else if (activeTab === "recent") {
      filtered = filtered.filter((code) =>
        recentSelections.includes(code.code)
      );
    }

    return filtered;
  }, [searchQuery, filterOptions, favorites, recentSelections, activeTab]);

  // Calculate pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredBudgetCodes.length / itemsPerPage)
  );
  const currentBudgetCodes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBudgetCodes.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBudgetCodes, currentPage]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredBudgetCodes]);

  // Memoize handlers for better performance
  const handleSearchChange = useMemo(
    () => (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  const handleFilterChange = useMemo(
    () => (value: string) =>
      setFilterOptions((prev) => ({
        ...prev,
        categoryFilter: value,
      })),
    []
  );

  const handleFavoriteToggle = useMemo(
    () => (checked: boolean) =>
      setFilterOptions((prev) => ({
        ...prev,
        onlyFavorites: checked,
      })),
    []
  );

  // Debounce search for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle errors gracefully
  const handleStorageError = (error: unknown, context: string) => {
    console.error(`Failed to handle ${context}:`, error);
    // You could also send this to your error tracking service
  };

  // Save to localStorage with error handling
  const saveToStorage = (key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      handleStorageError(error, `saving ${key}`);
    }
  };

  // Handle selection of a budget code
  const handleSelect = (code: string, name: string) => {
    // Update parent component
    if (handleCategoryChange && categoryIndex !== undefined) {
      handleCategoryChange(categoryIndex, "name", code, "internal");
      handleCategoryChange(categoryIndex, "description", name, "internal");
    } else if (onSelect) {
      onSelect(code, name);
    }

    // Add to recent selections
    setRecentSelections((prev) => {
      const newRecent = [code, ...prev.filter((c) => c !== code)].slice(0, 5);
      saveToStorage("recentBudgetCodes", newRecent);
      return newRecent;
    });

    setOpen(false);
  };

  // Toggle favorite status
  const toggleFavorite = (code: string, event: React.MouseEvent) => {
    event.stopPropagation();

    setFavorites((prev) => {
      const newFavorites = prev.includes(code)
        ? prev.filter((c) => c !== code)
        : [...prev, code];
      saveToStorage("favoriteBudgetCodes", newFavorites);
      return newFavorites;
    });
  };

  // Get category name from code
  const getCategoryName = (code: string | undefined) => {
    if (!code) return "Other";
    const firstDigit = code.charAt(0);
    return (
      BUDGET_CATEGORIES[firstDigit as keyof typeof BUDGET_CATEGORIES] || "Other"
    );
  };

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      // Escape to close
      if (e.key === "Escape") {
        setOpen(false);
      }

      // Ctrl+F to focus search
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        document.getElementById("budget-search")?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Load favorites and recent selections from localStorage
  useEffect(() => {
    const storedFavorites = localStorage.getItem("favoriteBudgetCodes");
    const storedRecent = localStorage.getItem("recentBudgetCodes");

    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites));
      } catch (e) {
        console.error("Failed to parse stored favorites");
      }
    }

    if (storedRecent) {
      try {
        setRecentSelections(JSON.parse(storedRecent));
      } catch (e) {
        console.error("Failed to parse stored recent selections");
      }
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between group transition-all duration-200 border-primary/20 hover:border-primary"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {selectedBudgetCode ? (
              <>
                <Badge
                  variant="outline"
                  className="bg-primary/5 hover:bg-primary/10"
                >
                  {selectedBudgetCode.code}
                </Badge>
                <span className="truncate">{selectedBudgetCode.name}</span>
              </>
            ) : (
              <span className="text-muted-foreground">
                Select budget code...
              </span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[800px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">
                Select Budget Code
              </DialogTitle>
              <DialogDescription className="mt-1">
                Choose a budget code from the list below
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Keyboard className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <div className="text-xs space-y-1">
                      <div className="flex items-center justify-between gap-4">
                        <span>Search:</span>
                        <Command className="px-2 py-0.5  rounded text-xs">
                          Ctrl + F
                        </Command>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span>Close dialog:</span>
                        <Command className="px-2 py-0.5  rounded text-xs">
                          Esc
                        </Command>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="relative">
                <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "gap-1.5",
                        (filterOptions.onlyFavorites ||
                          filterOptions.categoryFilter) &&
                          "bg-primary/10 text-primary border-primary/30"
                      )}
                    >
                      <Filter className="h-3.5 w-3.5" />
                      <span>Filter</span>
                      {(filterOptions.onlyFavorites ||
                        filterOptions.categoryFilter) && (
                        <Badge variant="secondary" className="h-5 px-1 ml-1">
                          {(filterOptions.onlyFavorites ? 1 : 0) +
                            (filterOptions.categoryFilter ? 1 : 0)}
                        </Badge>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[300px]">
                    <DialogHeader>
                      <DialogTitle>Filter Options</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="favorites-only"
                          checked={filterOptions.onlyFavorites}
                          onCheckedChange={handleFavoriteToggle}
                        />
                        <label
                          htmlFor="favorites-only"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          Favorites only
                        </label>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Category</label>
                        <Select
                          value={filterOptions.categoryFilter || "all"}
                          onValueChange={(value) =>
                            setFilterOptions((prev) => ({
                              ...prev,
                              categoryFilter: value === "all" ? "" : value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {Object.entries(BUDGET_CATEGORIES).map(
                              ([prefix, name]) => (
                                <SelectItem key={prefix} value={prefix}>
                                  {name}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setFilterOptions({
                            onlyFavorites: false,
                            categoryFilter: "",
                          })
                        }
                        disabled={
                          !filterOptions.onlyFavorites &&
                          !filterOptions.categoryFilter
                        }
                      >
                        Reset
                      </Button>
                      <Button size="sm" onClick={() => setIsFilterOpen(false)}>
                        Apply
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="budget-search"
                placeholder="Search by code or description..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-9 pr-4"
                autoComplete="off"
                aria-label="Search budget codes"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="px-6"
        >
          <TabsList className="w-full justify-start h-9 mb-2">
            <TabsTrigger value="all" className="relative">
              All
              <Badge variant="secondary" className="ml-1.5 text-xs py-0">
                {BUDGET_CODES.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="relative">
              <StarIcon className="mr-1.5 h-3.5 w-3.5" />
              Favorites
              <Badge variant="secondary" className="ml-1.5 text-xs py-0">
                {favorites.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="recent" className="relative">
              <History className="mr-1.5 h-3.5 w-3.5" />
              Recent
              <Badge variant="secondary" className="ml-1.5 text-xs py-0">
                {recentSelections.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="px-6 pb-6">
          <div className="rounded-md border overflow-hidden">
            <ScrollArea className="h-[320px]">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="w-[100px]">Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[100px]">Category</TableHead>
                    <TableHead className="w-[120px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentBudgetCodes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Search className="h-8 w-8 mb-2 opacity-20" />
                          <p>No budget codes found</p>
                          <p className="text-sm">
                            Try adjusting your search or filters
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentBudgetCodes.map((code, index) => (
                      <TableRow
                        key={index}
                        className={cn(
                          "group cursor-pointer transition-colors",
                          selectedCode === code.code && "bg-primary/5"
                        )}
                        onClick={() => handleSelect(code.code, code.name)}
                      >
                        <TableCell className="font-medium">
                          <Badge
                            variant={
                              selectedCode === code.code ? "default" : "outline"
                            }
                            className={cn(
                              "transition-colors",
                              selectedCode === code.code
                                ? "bg-primary text-primary-foreground"
                                : "bg-background group-hover:bg-primary/10"
                            )}
                          >
                            {code.code}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {code.name}
                            {selectedCode === code.code && (
                              <CheckIcon className="ml-2 h-4 w-4 text-primary" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="bg-secondary/40"
                          >
                            {getCategoryName(code.code)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) =>
                                      toggleFavorite(code.code, e)
                                    }
                                  >
                                    <StarIcon
                                      className={cn(
                                        "h-4 w-4",
                                        favorites.includes(code.code)
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-muted-foreground"
                                      )}
                                    />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                  {favorites.includes(code.code)
                                    ? "Remove from favorites"
                                    : "Add to favorites"}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <Button
                              variant="default"
                              size="sm"
                              className={cn(
                                "opacity-0 group-hover:opacity-100 transition-opacity",
                                selectedCode === code.code && "opacity-100"
                              )}
                              onClick={() => handleSelect(code.code, code.name)}
                            >
                              Select
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {currentBudgetCodes.length} of{" "}
              {filteredBudgetCodes.length} codes
            </div>

            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      className={cn(
                        "cursor-pointer",
                        currentPage <= 1 && "pointer-events-none opacity-50"
                      )}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current page
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNumber)}
                          isActive={currentPage === pageNumber}
                          className="cursor-pointer"
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <PaginationEllipsis />
                  )}

                  {totalPages > 5 && currentPage < totalPages - 1 && (
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => setCurrentPage(totalPages)}
                        isActive={currentPage === totalPages}
                        className="cursor-pointer"
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      className={cn(
                        "cursor-pointer",
                        currentPage >= totalPages &&
                          "pointer-events-none opacity-50"
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/30">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center text-sm text-muted-foreground">
              <Info className="h-4 w-4 mr-2" />
              <span>
                Press{" "}
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs mx-1">
                  Tab
                </kbd>{" "}
                to navigate
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedCode) {
                    const code = BUDGET_CODES.find(
                      (c) => c?.code === selectedCode
                    );
                    if (code?.code && code?.name) {
                      handleSelect(code.code, code.name);
                    }
                  }
                }}
                disabled={!selectedCode}
              >
                Confirm Selection
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
