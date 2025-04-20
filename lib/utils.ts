import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "KES"): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`
}
export function getStatusColor(status: string): string {
  if (!status) return "bg-slate-400"

  switch (status.toLowerCase()) {
    case "accounted":
      return "bg-emerald-500"
    case "pending_accountant":
    case "pending_hod":
      return "bg-amber-500"
    case "rejected":
      return "bg-rose-500"
    case "disbursed":
      return "bg-blue-500"
    default:
      return "bg-slate-400"
  }
}

export function getStatusBadgeVariant(status: string): string {
  if (!status) return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400"

  switch (status.toLowerCase()) {
    case "accounted":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
    case "pending_accountant":
    case "pending_hod":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
    case "rejected":
      return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
    case "disbursed":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
    default:
      return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400"
  }
}

export function getReadableStatus(status: string): string {
  if (!status) return "Unknown"

  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function calculateDaysRemaining(dueDate: string): number {
  try {
    const today = new Date()
    const due = new Date(dueDate)
    if (isNaN(due.getTime())) {
      throw new Error("Invalid date")
    }
    const diffTime = due.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  } catch (e) {
    return 0
  }
}

export function getDaysRemainingColor(days: number): string {
  if (isNaN(days)) return "text-slate-500"
  if (days < 0) return "text-rose-500"
  if (days <= 2) return "text-amber-500"
  return "text-emerald-500"
}