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
  // const cookieStore = cookies();
  // (await cookieStore).delete("token");
  // (await cookieStore).delete("next-auth.session-token");
  redirect("/login");
}


const getAxiosConfig = async () => {

  const cookieStore = await cookies();
  const token = cookieStore.get("token");


  
  return {
    headers: {
      Authorization: token ? `Bearer ${token.value}` : "",
      "Content-Type": "application/json",
    },
  };
};

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const config = await getAxiosConfig();
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/statistics/dashboard`,
      config
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }

    console.error("Failed to fetch dashboard statistics:", error);
    // Return default values when the API call fails
    return {
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

export async function getOverviewCharts(): Promise<ChartDataResponse> {
  try {
    const config = await getAxiosConfig();
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/statistics/overview-charts`,
      config
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }

    console.error("Failed to fetch overview charts:", error);
    return {
      lineChart: [],
      pieChart: [],
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
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch detailed stats:", error);
    throw error?.response?.data || error;
  }
}

export async function getMonthlyTrends(
  months: number = 6
): Promise<MonthlyTrends[]> {
  try {
    const config = await getAxiosConfig();
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/statistics/monthly-trends?months=${months}`,
      config
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }

    console.error("Failed to fetch monthly trends:", error);
    return [];
  }
}

export async function getRecentAdvanceStats(): Promise<RecentAdvanceStats> {
  try {
    const config = await getAxiosConfig();
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/statistics/recent-advance-stats`,
      config
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }

    console.error("Failed to fetch recent advance stats:", error);
    throw error;
  }
}

export async function getRecentAdvances(
  page: number = 1,
  limit: number = 30
): Promise<PaginatedAdvances> {
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
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }

    console.error("Failed to fetch recent advances:", error);
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 30,
    };
  }
}

export async function getSystemLogs(
  startDate?: string,
  endDate?: string
): Promise<SystemLog[]> {
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
    return data.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }

    console.error("Failed to fetch system logs:", error);
    return [];
  }
}
