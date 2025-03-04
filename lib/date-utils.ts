/**
 * Formats a date string or Date object to YYYY-MM-DD format for HTML date inputs
 * @param date Date string or Date object
 * @returns Formatted date string or empty string if invalid date
 */
export const formatDateForInput = (date: string | Date | undefined | null): string => {
  if (!date) return '';
  try {
    return new Date(date).toISOString().split('T')[0];
  } catch (error) {
    console.error('Invalid date:', date);
    return '';
  }
};
