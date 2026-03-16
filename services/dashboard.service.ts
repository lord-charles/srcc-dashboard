"use server";

import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";
import {
  DashboardStats,
  MonthlyTrends,
  RecentAdvanceStats,
  SystemLog,
} from "@/types/dashboard";
import { redirect } from "next/navigation";
import { PaginatedAdvances } from "@/types/advance";
import { startOfMonth, endOfMonth } from "date-fns";

export async function handleUnauthorized() {
  "use server";
  redirect("/unauthorized");
}

export const getAxiosConfig = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  return {
    headers: {
      Authorization: token ? `Bearer ${token.value}` : "",
      "Content-Type": "application/json",
    },
  };
};

export async function getDashboardStats() {
  try {
    const config = await getAxiosConfig();
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/statistics/dashboard`,
      config
    );
    return { success: true as const, data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }

    console.error("Failed to fetch dashboard statistics:", error);
    const message = error?.response?.data?.message || error?.message || "Failed to fetch dashboard stats";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message),
      data: {
        employees: {
          total: 0,
          quarterlyGrowth: "0.0",
          description: "No data available",
        },
        advances: {
          total: {
            amount: 0,
            outstanding: 0,
            repaymentRate: 0,
          },
          active: {
            count: 0,
            percentageOfTotal: 0,
            dueThisMonth: 0,
          },
          utilization: {
            rate: 0,
            employeesWithAdvances: 0,
            monthlyChange: 0,
          },
          interest: {
            monthlyRate: 0,
            earned: 0,
          },
          atRisk: {
            count: 0,
            percentageOfTotal: 0,
            changeFromLastMonth: 0,
          },
        },
      }
    };
  }
}

export interface ChartDataResponse {
  lineChart: Array<{
    date: string;
    applications: number;
  }>;
  pieChart: Array<{
    name: string;
    value: number;
  }>;
}

export async function getOverviewCharts() {
  try {
    const config = await getAxiosConfig();
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/statistics/overview-charts`,
      config
    );
    return { success: true as const, data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }

    console.error("Failed to fetch overview charts:", error);
    const message = error?.response?.data?.message || error?.message || "Failed to fetch overview charts";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message),
      data: {
        lineChart: [],
        pieChart: [],
      }
    };
  }
}

export async function getDetailedStats() {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/statistics/detailed-stats`,
      config
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to fetch detailed stats:", error);
    const message = error?.response?.data?.message || error?.message || "Failed to fetch detailed stats";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function getMonthlyTrends(
  months: number = 6
) {
  try {
    const config = await getAxiosConfig();
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/statistics/monthly-trends?months=${months}`,
      config
    );
    return { success: true as const, data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }

    console.error("Failed to fetch monthly trends:", error);
    const message = error?.response?.data?.message || error?.message || "Failed to fetch monthly trends";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message),
      data: []
    };
  }
}

export async function getRecentAdvanceStats() {
  try {
    const config = await getAxiosConfig();
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/statistics/recent-advance-stats`,
      config
    );
    return { success: true as const, data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }

    console.error("Failed to fetch recent advance stats:", error);
    const message = error?.response?.data?.message || error?.message || "Failed to fetch recent advance stats";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function getRecentAdvances(
  page: number = 1,
  limit: number = 30
) {
  try {
    const config = await getAxiosConfig();
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/advances`,
      {
        ...config,
        params: {
          startDate,
          endDate,
          page,
          limit,
        },
      }
    );
    return { success: true as const, data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }

    console.error("Failed to fetch recent advances:", error);
    const message = error?.response?.data?.message || error?.message || "Failed to fetch recent advances";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message),
      data: {
        data: [],
        total: 0,
        page: 1,
        limit: 30,
      }
    };
  }
}

export async function getSystemLogs(
  startDate?: string,
  endDate?: string
) {
  try {
    const config = await getAxiosConfig();

    // Default to current month if dates not provided
    const now = new Date();
    const defaultEndDate = endOfMonth(now).toISOString();
    const defaultStartDate = startOfMonth(now).toISOString();

    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/system-logs`,
      {
        ...config,
        params: {
          startDate: startDate || defaultStartDate,
          endDate: endDate || defaultEndDate,
        },
      }
    );
    return { success: true as const, data: data.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }

    console.error("Failed to fetch system logs:", error);
    const message = error?.response?.data?.message || error?.message || "Failed to fetch system logs";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message),
      data: []
    };
  }
}
