"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { searchSuppliers, Supplier } from "@/services/suppliers.service";
import Link from "next/link";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Check,
  ChevronsUpDown,
  Plus,
  Trash,
  Loader2,
  ArrowLeft,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { createLpo } from "@/services/lpo.service";
import { useRouter } from "next/navigation";

interface LpoFormProps {
  projectId: string;
  projectCurrency?: string;
}

export function LpoForm({ projectId, projectCurrency = "KES" }: LpoFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [suppliers, setSuppliers] = useState<Partial<Supplier>[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currency, setCurrency] = useState(projectCurrency || "KES");

  const [selectedSupplier, setSelectedSupplier] =
    useState<Partial<Supplier> | null>(null);
  const [lpoDate, setLpoDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [validityDays, setValidityDays] = useState("30");
  const [items, setItems] = useState([
    { description: "", noOfDays: 1, quantity: 1, rate: 0, total: 0 },
  ]);

  // Handle supplier search with debounce
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSuppliers([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoadingSuppliers(true);
      try {
        const results = await searchSuppliers(searchTerm);
        setSuppliers(results);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoadingSuppliers(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleItemChange = (
    index: number,
    field: string,
    value: string | number,
  ) => {
    const newItems = [...items];
    const item: any = { ...newItems[index], [field]: value };

    // Auto calculate row total
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    item.total = qty * rate;

    newItems[index] = item;
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      { description: "", noOfDays: 1, quantity: 1, rate: 0, total: 0 },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const subTotal = items.reduce((acc, curr) => acc + curr.total, 0);
  const vatAmount = subTotal * 0.16;
  const totalAmount = subTotal + vatAmount;

  const handleCancel = () => {
    router.push(`/projects/${projectId}?tab=financial&financialtab=lpos`);
  };

  const handleSubmit = async () => {
    if (!selectedSupplier?._id) {
      toast({
        title: "Validation Error",
        description: "Please select a supplier",
        variant: "destructive",
      });
      return;
    }

    const invalidItems = items.some((i) => !i.description.trim());
    if (invalidItems) {
      toast({
        title: "Validation Error",
        description: "All items must have a description",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const result = await createLpo({
      projectId,
      supplierId: selectedSupplier._id,
      lpoDate,
      currency,
      validityDays: Number(validityDays),
      items: items.map((i) => ({
        ...i,
        noOfDays: Number(i.noOfDays),
        quantity: Number(i.quantity),
        rate: Number(i.rate),
      })),
      subTotal,
      vatAmount,
      totalAmount,
    });

    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: "Success",
        description: "LPO Created and submitted for HOD approval",
      });
      router.push(`/projects/${projectId}?tab=financial&financialtab=lpos`);
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to create LPO",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-card rounded-xl border shadow-sm space-y-8">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Generate Local Purchase Order
            </h1>
            <p className="text-muted-foreground">
              Create a new purchase order for this project
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">
              Supplier Information
            </Label>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between font-normal h-12 text-base border-2 hover:border-primary/50 transition-colors"
                >
                  {selectedSupplier ? (
                    <span className="truncate font-medium">
                      {selectedSupplier.name}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Search and select supplier...
                    </span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="p-0 w-[var(--radix-popover-trigger-width)]"
                align="start"
              >
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Type name, email or KRA PIN..."
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                    className="h-12"
                  />
                  <CommandList className="max-h-[300px]">
                    {isLoadingSuppliers ? (
                      <div className="py-6 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <>
                        <CommandEmpty className="py-6 text-center text-sm">
                          {searchTerm.length < 2
                            ? "Type at least 2 characters to search..."
                            : "No supplier found."}
                        </CommandEmpty>
                        <CommandGroup>
                          {suppliers.map((sup) => (
                            <CommandItem
                              key={sup._id}
                              value={sup._id}
                              onSelect={() => {
                                setSelectedSupplier(sup);
                                setComboboxOpen(false);
                              }}
                              className="py-3 px-4 cursor-pointer hover:bg-muted"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 text-primary",
                                  selectedSupplier?._id === sup._id
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              <div className="flex flex-col gap-0.5">
                                <span className="font-semibold text-sm">
                                  {sup.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-2">
                                  <span>{sup.email}</span>
                                  <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                  <span>KRA PIN: {sup.kraPin}</span>
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1.5 ml-1">
              Supplier not found?{" "}
              <Link
                href="/suppliers/new"
                className="text-primary hover:underline font-semibold flex items-center gap-0.5 transition-all"
              >
                Register New <Plus className="w-3 h-3" />
              </Link>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">
                Currency
              </Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="h-12 border-2">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KES">Kenya Shillings (KES)</SelectItem>
                  <SelectItem value="USD">US Dollar (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                  <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">
                  LPO Date
                </Label>
                <Input
                  type="date"
                  value={lpoDate}
                  onChange={(e) => setLpoDate(e.target.value)}
                  className="h-12 border-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Validity (Days)
                </Label>
                <Input
                  type="number"
                  value={validityDays}
                  onChange={(e) => setValidityDays(e.target.value)}
                  className="h-12 border-2 text-center"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70 ml-1">
            Order Items
          </Label>
          <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-background">
            <div className="grid grid-cols-12 gap-2 bg-muted/60 p-4 border-b text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
              <div className="col-span-5">Description</div>
              <div className="col-span-1 text-center">Days</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Rate</div>
              <div className="col-span-2 text-right pr-2">Total</div>
            </div>

            <div className="divide-y divide-border/50">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 p-4 items-center bg-card hover:bg-muted/10 transition-colors group"
                >
                  <div className="col-span-5">
                    <Input
                      placeholder="Enter item description..."
                      className="h-10 text-sm border-transparent focus:border-primary/30 bg-muted/30 focus:bg-background transition-all"
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(idx, "description", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-1">
                    <Input
                      type="number"
                      min="1"
                      className="h-10 text-sm text-center border-transparent bg-muted/30"
                      value={item.noOfDays}
                      onChange={(e) =>
                        handleItemChange(idx, "noOfDays", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="1"
                      className="h-10 text-sm text-center border-transparent bg-muted/30"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(idx, "quantity", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="0"
                      className="h-10 text-sm text-right border-transparent bg-muted/30"
                      value={item.rate}
                      onChange={(e) =>
                        handleItemChange(idx, "rate", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-2 text-right font-bold text-sm flex justify-end items-center pr-2 gap-2">
                    <span className="text-primary/90">
                      {item.total.toLocaleString()}
                    </span>
                    {items.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive/40 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all rounded-full"
                        onClick={() => removeItemRow(idx)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-muted/20 flex justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={addItemRow}
                className="text-xs font-bold uppercase tracking-tighter border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition-all h-9"
              >
                <Plus className="w-4 h-4 mr-1.5 text-primary" /> Add Order Item
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-4">
          <div className="flex-1 max-w-sm">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-xs text-muted-foreground leading-relaxed">
                LPO will be automatically forwarded to the selected supplier
                once fully approved by HOD and Finance departments.
              </p>
            </div>
          </div>

          <div className="bg-muted/40 p-6 rounded-2xl w-full md:w-80 space-y-4 border shadow-inner">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium uppercase tracking-tight">
                Sub-Total
              </span>
              <span className="font-bold text-base">
                {subTotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium uppercase tracking-tight">
                VAT (16%)
              </span>
              <span className="font-bold text-base text-amber-600">
                {vatAmount.toLocaleString()}
              </span>
            </div>
            <div className="pt-4 border-t-2 border-dashed border-muted-foreground/20">
              <div className="flex justify-between items-end">
                <span className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">
                  Total Amount
                </span>
                <span className="font-black text-3xl text-primary tracking-tighter">
                  {currency} {totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-8 border-t">
          <Button
            variant="outline"
            className="h-12 px-8 font-semibold text-muted-foreground hover:bg-muted/50 border-2"
            onClick={handleCancel}
          >
            Discard
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-12 px-10 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Send className="w-5 h-5 mr-2" />
            )}
            Complete & Submit for Approval
          </Button>
        </div>
      </div>
    </div>
  );
}

import { Send } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
