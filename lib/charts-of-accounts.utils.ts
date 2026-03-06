import { ChartOfAccounts, ChartStatistics } from "@/types/charts-of-accounts";

export function validateChartCode(code: string): { valid: boolean; error?: string } {
  if (!code || code.trim().length === 0) {
    return { valid: false, error: "Chart code is required" };
  }
  if (code.length > 10) {
    return { valid: false, error: "Chart code must be 10 characters or less" };
  }
  if (!/^[A-Z0-9]+$/.test(code)) {
    return { valid: false, error: "Chart code must contain only uppercase letters and numbers" };
  }
  return { valid: true };
}

export function formatChartCode(code: string): string {
  return code.toUpperCase().trim();
}

export function getChartSummary(chart: ChartOfAccounts): ChartStatistics {
  const totalSubAccounts = chart.accounts.reduce(
    (sum, acc) => sum + (acc.subAccounts?.length || 0),
    0,
  );
  const totalMappings = chart.accounts.reduce(
    (sum, acc) => sum + (acc.mappings?.length || 0),
    0,
  );

  return {
    chartCode: chart.chartCode,
    totalAccounts: chart.accounts?.length || 0,
    totalSubAccounts,
    totalObjectCodes: chart.objectCodes?.length || 0,
    totalMappings,
  };
}






export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function searchCharts(
  charts: ChartOfAccounts[],
  searchTerm: string,
): ChartOfAccounts[] {
  if (!searchTerm.trim()) return charts;

  const term = searchTerm.toLowerCase();
  return charts.filter(
    (chart) =>
      chart.chartCode.toLowerCase().includes(term),
  );
}

export function sortCharts(
  charts: ChartOfAccounts[],
  sortBy: "code" = "code",
): ChartOfAccounts[] {
  const sorted = [...charts];

  switch (sortBy) {
    case "code":
    default:
      return sorted.sort((a, b) => a.chartCode.localeCompare(b.chartCode));
  }
}
