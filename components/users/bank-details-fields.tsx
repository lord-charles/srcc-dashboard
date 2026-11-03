"use client";

import { Building2, Globe2, Landmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ComboBox } from "@/components/ui/combobox";
import { CountryDropdown, type Country } from "@/components/ui/country-dropdown";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface BankDetailsValue {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  branchCode?: string;
  bankCountry?: string;
  swiftCode?: string;
  iban?: string;
}

interface BankDetailsFieldsProps {
  value: BankDetailsValue;
  onChange: (value: BankDetailsValue) => void;
  errors?: Record<string, string>;
  prefix?: string;
}

const kenyanBanks = [
  "Absa Bank Kenya",
  "Access Bank Kenya",
  "African Banking Corporation",
  "Bank of Africa Kenya",
  "Citibank N.A. Kenya",
  "Consolidated Bank of Kenya",
  "Co-operative Bank of Kenya",
  "Credit Bank",
  "Development Bank of Kenya",
  "Diamond Trust Bank Kenya",
  "Ecobank Kenya",
  "Equity Bank Kenya",
  "Family Bank",
  "First Community Bank",
  "Guaranty Trust Bank Kenya",
  "Gulf African Bank",
  "I&M Bank",
  "Kingdom Bank",
  "Mayfair CIB Bank",
  "Middle East Bank Kenya",
  "M-Oriental Bank",
  "National Bank of Kenya",
  "NCBA Bank Kenya",
  "Prime Bank",
  "Sidian Bank",
  "Stanbic Bank Kenya",
  "Standard Chartered Bank Kenya",
  "UBA Kenya Bank",
  "Victoria Commercial Bank",
];

export function BankDetailsFields({
  value,
  onChange,
  errors = {},
  prefix = "bankDetails",
}: BankDetailsFieldsProps) {
  const country = value.bankCountry || "KEN";
  const isKenyan = country === "KEN";
  const kenyanBankOptions = Array.from(
    new Set([...kenyanBanks, ...(value.bankName ? [value.bankName] : [])]),
  ).map((bank) => ({ value: bank, label: bank }));
  const set = (field: keyof BankDetailsValue, next: string) =>
    onChange({ ...value, [field]: next });
  const labelClass = "text-xs font-medium text-muted-foreground";

  return (
    <div className="space-y-5 rounded-xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">Bank account details</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add the account where you want to receive payments.
            </p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1.5 font-normal">
          {isKenyan ? <Building2 className="h-3.5 w-3.5" /> : <Globe2 className="h-3.5 w-3.5" />}
          {isKenyan ? "Kenyan bank" : "International bank"}
        </Badge>
      </div>

      <div className="grid gap-1 rounded-lg bg-muted/50 p-1 sm:grid-cols-2">
        <Button type="button" variant={isKenyan ? "default" : "ghost"} className="justify-start gap-2" onClick={() => onChange({ ...value, bankCountry: "KEN", bankName: kenyanBanks.includes(value.bankName || "") ? value.bankName : "" })}>
          <Building2 className="h-4 w-4" />Kenyan bank
        </Button>
        <Button type="button" variant={!isKenyan ? "default" : "ghost"} className="justify-start gap-2" onClick={() => onChange({ ...value, bankCountry: isKenyan ? "INTL" : country, bankName: "" })}>
          <Globe2 className="h-4 w-4" />International bank
        </Button>
      </div>

      {!isKenyan && (
        <div className="space-y-2">
          <Label className={labelClass} htmlFor={`${prefix}.bankCountry`}>Bank country <span className="text-destructive">*</span></Label>
          <CountryDropdown
            defaultValue={country === "INTL" ? undefined : country}
            placeholder="Search and select a country"
            onChange={(selected: Country) => set("bankCountry", selected.alpha3)}
          />
          {errors.bankCountry && <p className="text-xs text-destructive">{errors.bankCountry}</p>}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className={labelClass} htmlFor={`${prefix}.bankName`}>Bank name <span className="text-destructive">*</span></Label>
          {isKenyan ? (
            <ComboBox
              options={kenyanBankOptions}
              value={value.bankName || ""}
              onChange={(bankName) => set("bankName", bankName)}
              placeholder="Choose a Kenyan bank"
              inputPlaceholder="Search Kenyan banks..."
              className="w-full"
            />
          ) : (
            <Input id={`${prefix}.bankName`} value={value.bankName || ""} onChange={(event) => set("bankName", event.target.value)} placeholder="Enter any international bank" />
          )}
          {errors.bankName && <p className="text-xs text-destructive">{errors.bankName}</p>}
        </div>
        <div className="space-y-2">
          <Label className={labelClass} htmlFor={`${prefix}.accountName`}>Account holder name</Label>
          <Input id={`${prefix}.accountName`} value={value.accountName || ""} onChange={(event) => set("accountName", event.target.value)} placeholder="Name as shown on the account" autoComplete="name" />
        </div>
        <div className="space-y-2">
          <Label className={labelClass} htmlFor={`${prefix}.accountNumber`}>Account number <span className="text-destructive">*</span></Label>
          <Input id={`${prefix}.accountNumber`} value={value.accountNumber || ""} onChange={(event) => set("accountNumber", event.target.value)} placeholder={isKenyan ? "Enter account number" : "Account number or IBAN"} autoComplete="off" />
          {errors.accountNumber && <p className="text-xs text-destructive">{errors.accountNumber}</p>}
        </div>
        {isKenyan ? (
          <div className="space-y-2">
            <Label className={labelClass} htmlFor={`${prefix}.branchCode`}>Branch code <span className="font-normal">(optional)</span></Label>
            <Input id={`${prefix}.branchCode`} value={value.branchCode || ""} onChange={(event) => set("branchCode", event.target.value)} placeholder="e.g. 001" />
          </div>
        ) : (
          <div className="space-y-2">
            <Label className={labelClass} htmlFor={`${prefix}.swiftCode`}>SWIFT / BIC code <span className="font-normal">(optional)</span></Label>
            <Input id={`${prefix}.swiftCode`} value={value.swiftCode || ""} onChange={(event) => set("swiftCode", event.target.value.toUpperCase())} placeholder="e.g. CHASUS33" autoCapitalize="characters" />
          </div>
        )}
        {!isKenyan && (
          <div className="space-y-2 sm:col-span-2">
            <Label className={labelClass} htmlFor={`${prefix}.iban`}>IBAN <span className="font-normal">(if applicable)</span></Label>
            <Input id={`${prefix}.iban`} value={value.iban || ""} onChange={(event) => set("iban", event.target.value.replace(/\s/g, "").toUpperCase())} placeholder="International Bank Account Number" autoCapitalize="characters" />
          </div>
        )}
        {!isKenyan && (
          <div className="space-y-2 sm:col-span-2">
            <Label className={labelClass} htmlFor={`${prefix}.branchCode`}>Branch / routing details <span className="font-normal">(optional)</span></Label>
            <Input id={`${prefix}.branchCode`} value={value.branchCode || ""} onChange={(event) => set("branchCode", event.target.value)} placeholder="Branch name, sort code, routing number, or local clearing code" />
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">Bank details are stored on your consultant profile and used for payment processing.</p>
    </div>
  );
}
