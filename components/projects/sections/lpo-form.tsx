"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { searchSuppliers, Supplier } from "@/services/suppliers.service";
import Link from "next/link";
import { FileUpload } from "@/components/ui/file-upload";
import { cloudinaryService } from "@/lib/cloudinary-service";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Check,
  ChevronsUpDown,
  Plus,
  Trash2,
  Loader2,
  ArrowLeft,
  Send,
  Paperclip,
  X,
  FileText,
  Upload,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { createLpo } from "@/services/lpo.service";
import { useRouter } from "next/navigation";

interface LpoFormProps {
  projectId: string;
  projectCurrency?: string;
}

interface AttachmentItem {
  url: string;
  name: string;
  status: "uploading" | "done" | "error";
  progress?: number;
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
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);

  const [selectedSupplier, setSelectedSupplier] = useState<Partial<Supplier> | null>(null);
  const [lpoDate, setLpoDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [validityDays, setValidityDays] = useState("30");
  const [items, setItems] = useState([
    { description: "", noOfDays: 1, quantity: 1, rate: 0, total: 0, excludeVat: false },
  ]);

  const [includeVat, setIncludeVat] = useState(true);
  const [vatRateType, setVatRateType] = useState<"16" | "8" | "0" | "custom">("16");
  const [customVatRate, setCustomVatRate] = useState("16");

  useEffect(() => {
    if (searchTerm.length < 2) {
      setSuppliers([]);
      return;
    }
    const delay = setTimeout(async () => {
      setIsLoadingSuppliers(true);
      try {
        const results = await searchSuppliers(searchTerm);
        setSuppliers(results);
      } catch {
        // silent
      } finally {
        setIsLoadingSuppliers(false);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const handleItemChange = (index: number, field: string, value: string | number | boolean) => {
    const newItems = [...items];
    const item: any = { ...newItems[index], [field]: value };
    item.total = (Number(item.noOfDays) || 0) * (Number(item.quantity) || 0) * (Number(item.rate) || 0);
    newItems[index] = item;
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([...items, { description: "", noOfDays: 1, quantity: 1, rate: 0, total: 0, excludeVat: false }]);
  };

  const removeItemRow = (index: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };

  const resolvedVatRate = vatRateType === "custom" ? (Number(customVatRate) || 0) : Number(vatRateType);
  const subTotal = items.reduce((acc, curr) => acc + curr.total, 0);
  const vatableAmount = items.reduce((acc, curr) => acc + (curr.excludeVat ? 0 : curr.total), 0);
  const vatAmount = includeVat ? vatableAmount * (resolvedVatRate / 100) : 0;
  const totalAmount = subTotal + vatAmount;

  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleCancel = () => {
    router.push(`/projects/${projectId}?tab=financial&financialtab=lpos`);
  };

  const handleFileUpload = async (files: File[]) => {
    if (!files.length) return;

    for (const file of files) {
      // Add each file to state as uploading
      setAttachments((prev) => [
        ...prev,
        { url: "", name: file.name, status: "uploading" },
      ]);

      // Trigger Cloudinary upload in parallel without awaiting inside the loop
      cloudinaryService.uploadFile(file)
        .then((url) => {
          setAttachments((prev) =>
            prev.map((a) =>
              a.name === file.name && a.status === "uploading"
                ? { url, name: file.name, status: "done" }
                : a
            )
          );
          toast({ title: "Uploaded", description: `${file.name} uploaded successfully.` });
        })
        .catch(() => {
          setAttachments((prev) =>
            prev.map((a) =>
              a.name === file.name && a.status === "uploading"
                ? { ...a, status: "error" }
                : a
            )
          );
          toast({ title: "Upload failed", description: `Could not upload ${file.name}.`, variant: "destructive" });
        });
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedSupplier?._id) {
      toast({ title: "Missing supplier", description: "Please select a supplier.", variant: "destructive" });
      return;
    }
    if (items.some((i) => !i.description.trim())) {
      toast({ title: "Missing description", description: "All items need a description.", variant: "destructive" });
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
        excludeVat: !!i.excludeVat,
      })),
      subTotal,
      vatAmount,
      totalAmount,
      attachments: attachments.filter((a) => a.status === "done").map((a) => a.url),
    });

    setIsSubmitting(false);

    if (result.success) {
      toast({ title: "LPO Submitted", description: "Forwarded for HOD approval." });
      router.push(`/projects/${projectId}?tab=financial&financialtab=lpos`);
    } else {
      toast({ title: "Submission failed", description: result.error || "Please try again.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl space-y-4">

        {/* ── Header ── */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">New Local Purchase Order</h1>

          </div>
        </div>

        {/* ── Section 1: Order Details ── */}
        <Section title="Order Details" step={1}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Supplier */}
            <div className="md:col-span-1 space-y-1.5">
              <FieldLabel>Supplier</FieldLabel>
              <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                <PopoverTrigger asChild>
                  <button
                    role="combobox"
                    aria-expanded={comboboxOpen}
                    className={cn(
                      "w-full flex items-center justify-between px-3 h-10 rounded-lg border border-border bg-background text-sm transition-colors hover:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30",
                      !selectedSupplier && "text-muted-foreground"
                    )}
                  >
                    <span className="truncate">
                      {selectedSupplier ? selectedSupplier.name : "Search supplier..."}
                    </span>
                    <ChevronsUpDown className="w-4 h-4 shrink-0 opacity-40 ml-2" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Name, email or KRA PIN..."
                      value={searchTerm}
                      onValueChange={setSearchTerm}
                      className="h-10 text-sm"
                    />
                    <CommandList className="max-h-64">
                      {isLoadingSuppliers ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <>
                          <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                            {searchTerm.length < 2 ? "Type at least 2 characters..." : "No supplier found."}
                          </CommandEmpty>
                          <CommandGroup>
                            {suppliers.map((sup) => (
                              <CommandItem
                                key={sup._id}
                                value={sup._id}
                                onSelect={() => { setSelectedSupplier(sup); setComboboxOpen(false); }}
                                className="px-3 py-2.5 cursor-pointer"
                              >
                                <div className="flex items-center gap-2 w-full">
                                  <Check className={cn("w-4 h-4 text-primary shrink-0", selectedSupplier?._id === sup._id ? "opacity-100" : "opacity-0")} />
                                  <div>
                                    <p className="text-sm font-medium leading-none">{sup.name}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{sup.email} · {sup.kraPin}</p>
                                  </div>
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
              <p className="text-xs text-muted-foreground">
                Not listed?{" "}
                <Link href="/suppliers/new" className="text-primary hover:underline font-medium inline-flex items-center gap-0.5">
                  Register supplier <Plus className="w-3 h-3" />
                </Link>
              </p>
            </div>

            {/* Currency */}
            <div className="space-y-1.5">
              <FieldLabel>Currency</FieldLabel>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KES">KES — Kenya Shillings</SelectItem>
                  <SelectItem value="USD">USD — US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR — Euro</SelectItem>
                  <SelectItem value="GBP">GBP — British Pound</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date + Validity */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <FieldLabel>LPO Date</FieldLabel>
                <Input type="date" value={lpoDate} onChange={(e) => setLpoDate(e.target.value)} className="h-10 text-sm" />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Valid (Days)</FieldLabel>
                <Input type="number" value={validityDays} onChange={(e) => setValidityDays(e.target.value)} className="h-10 text-sm text-center" />
              </div>
            </div>
          </div>
        </Section>

        {/* ── Section 2: Line Items ── */}
        <Section title="Order Items" step={2}>
          <div className="rounded-lg border border-border overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-x-3 px-4 py-2.5 bg-muted/50 border-b border-border text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <div className="col-span-4">Description</div>
              <div className="col-span-1 text-center">Days</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Unit Rate</div>
              <div className="col-span-1 text-center">Ex. VAT</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-border/60">
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-x-3 px-4 py-3 items-center group hover:bg-muted/20 transition-colors">
                  <div className="col-span-4">
                    <Input
                      placeholder="Item description..."
                      className="h-9 text-sm border-transparent bg-transparent focus:bg-background focus:border-border transition-all placeholder:text-muted-foreground/50"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                    />
                  </div>
                  <div className="col-span-1">
                    <Input
                      type="number"
                      min="1"
                      className="h-9 text-sm text-center border-transparent bg-transparent focus:bg-background focus:border-border"
                      value={item.noOfDays}
                      onChange={(e) => handleItemChange(idx, "noOfDays", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="1"
                      className="h-9 text-sm text-center border-transparent bg-transparent focus:bg-background focus:border-border"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="0"
                      className="h-9 text-sm text-right border-transparent bg-transparent focus:bg-background focus:border-border"
                      value={item.rate}
                      onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
                      checked={item.excludeVat}
                      onChange={(e) => handleItemChange(idx, "excludeVat", e.target.checked)}
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <span className="text-sm font-semibold tabular-nums">{fmt(item.total)}</span>
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItemRow(idx)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/50 hover:text-destructive p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Row */}
            <div className="px-4 py-3 bg-muted/20 border-t border-border/60">
              <button
                onClick={addItemRow}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add line item
              </button>
            </div>
          </div>
        </Section>

        {/* ── Section 3: Attachments ── */}
        <Section title="Attachments" step={3} optional>
          <div className="space-y-3">
            <div className="flex items-start gap-4">
              <FileUpload
                onChange={handleFileUpload}
                multiple={true}
              />
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2 mt-1">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-2.5 rounded-lg border text-sm transition-colors",
                      file.status === "uploading" && "bg-muted/30 border-border/60",
                      file.status === "done" && "bg-background border-border",
                      file.status === "error" && "bg-destructive/5 border-destructive/20"
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
                      file.status === "uploading" && "bg-muted",
                      file.status === "done" && "bg-primary/10",
                      file.status === "error" && "bg-destructive/10"
                    )}>
                      {file.status === "uploading" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                      ) : file.status === "done" ? (
                        <FileText className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-destructive" />
                      )}
                    </div>

                    {/* Name + Status */}
                    <div className="flex-1 min-w-0">
                      {file.status === "done" ? (
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-foreground hover:text-primary transition-colors truncate block"
                        >
                          {file.name}
                        </a>
                      ) : (
                        <span className={cn("font-medium truncate block", file.status === "error" && "text-destructive")}>
                          {file.name}
                        </span>
                      )}
                      <span className={cn(
                        "text-xs mt-0.5 block",
                        file.status === "uploading" && "text-muted-foreground",
                        file.status === "done" && "text-muted-foreground",
                        file.status === "error" && "text-destructive/70"
                      )}>
                        {file.status === "uploading" && "Uploading..."}
                        {file.status === "done" && "Uploaded"}
                        {file.status === "error" && "Upload failed — please try again"}
                      </span>
                    </div>

                    {/* Remove */}
                    {file.status !== "uploading" && (
                      <button
                        onClick={() => removeAttachment(index)}
                        className="shrink-0 text-muted-foreground/50 hover:text-destructive transition-colors p-1 rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>

        {/* ── Summary + Submit ── */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5 items-start pt-2">

          {/* Info note */}
          <div className="md:col-span-2 rounded-lg border border-border/60 bg-muted/30 p-4 space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Approval Workflow</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Once submitted, this LPO will be forwarded to the <strong className="text-foreground font-medium">HOD</strong> and <strong className="text-foreground font-medium">Finance</strong> departments for approval before being sent to the supplier.
            </p>
          </div>

          {/* Totals Panel */}
          <div className="md:col-span-3 rounded-xl border border-border bg-background overflow-hidden shadow-sm">
            {/* VAT Controls */}
            <div className="px-5 py-4 border-b border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="includeVat"
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
                    checked={includeVat}
                    onChange={(e) => setIncludeVat(e.target.checked)}
                  />
                  <label htmlFor="includeVat" className="text-sm font-medium cursor-pointer select-none">
                    Apply VAT
                  </label>
                </div>
                {includeVat && (
                  <Select value={vatRateType} onValueChange={(v: any) => setVatRateType(v)}>
                    <SelectTrigger className="h-8 text-xs w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16">16% Standard</SelectItem>
                      <SelectItem value="8">8% Reduced</SelectItem>
                      <SelectItem value="0">0% Zero-rated</SelectItem>
                      <SelectItem value="custom">Custom rate</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              {includeVat && vatRateType === "custom" && (
                <div className="flex items-center justify-end gap-2">
                  <span className="text-xs text-muted-foreground">Custom VAT rate:</span>
                  <div className="relative w-24">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                      className="h-8 text-xs text-right pr-6"
                      value={customVatRate}
                      onChange={(e) => setCustomVatRate(e.target.value)}
                    />
                    <span className="absolute right-2.5 top-1.5 text-xs font-medium text-muted-foreground pointer-events-none">%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Numbers */}
            <div className="px-5 py-4 space-y-2.5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium tabular-nums">{currency} {fmt(subTotal)}</span>
              </div>
              {includeVat && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">VAT ({resolvedVatRate}%)</span>
                  <span className="font-medium tabular-nums">{currency} {fmt(vatAmount)}</span>
                </div>
              )}
              <div className="pt-3 mt-1 border-t border-border flex justify-between items-center">
                <span className="text-sm font-semibold">Total Amount</span>
                <span className="text-2xl font-bold tabular-nums tracking-tight text-primary">
                  {currency} {fmt(totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex justify-end items-center gap-3 pt-2 border-t border-border">
          <Button
            variant="ghost"
            className="h-10 px-5 text-sm font-medium text-muted-foreground"
            onClick={handleCancel}
          >
            Discard
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-10 px-6 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit for Approval
              </>
            )}
          </Button>
        </div>

      </div>
    </div>
  );
}

// ── Small helpers ──────────────────────────────────────────

function Section({
  title,
  step,
  optional,
  children,
}: {
  title: string;
  step: number;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
          {step}
        </span>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {optional && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
            Optional
          </span>
        )}
      </div>
      <div className="pl-9">{children}</div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
      {children}
    </label>
  );
}