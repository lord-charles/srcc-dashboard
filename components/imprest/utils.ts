import { format, parseISO, isValid } from "date-fns";

export const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format date with proper handling of invalid dates
export const formatDate = (dateString: string) => {
  try {
    const date = parseISO(dateString);
    if (isValid(date)) {
      return format(date, "MMM d, yyyy");
    }
    return format(new Date(dateString), "MMM d, yyyy");
  } catch (error) {
    return dateString;
  }
};
