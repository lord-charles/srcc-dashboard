"use server";

import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";
import { handleUnauthorized } from "./dashboard.service";
import {
  ChartOfAccounts,
  ChartsOfAccountsDBResponse,
  CreateChartPayload,
  UpdateChartPayload,
  ChartStatistics,
} from "@/types/charts-of-accounts";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL environment variable is not set");
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

function handleApiError(error: unknown): never {
  if (error instanceof AxiosError) {
    if (error.response?.status === 401) {
      handleUnauthorized();
    }
    const message = error.response?.data?.message || error.message;
    throw new Error(message || "API request failed");
  }
  throw error instanceof Error ? error : new Error("An unexpected error occurred");
}

function transformChartsResponse(response: any): ChartOfAccounts[] {
  const charts: ChartOfAccounts[] = [];

  // Handle array response from API
  if (Array.isArray(response)) {
    response.forEach((item) => {
      if (item && typeof item === "object") {
        const _id = item._id;
        Object.entries(item).forEach(([key, value]) => {
          // Skip the _id field
          if (key === "_id") return;

          // Check if value is a valid chart object with data field
          if (value && typeof value === "object") {
            const chartData = (value as any).data || value;
            
            // Ensure we have the required fields
            if (chartData && typeof chartData === "object" && "accounts" in chartData) {
              charts.push({
                _id,
                chartCode: key,
                accounts: chartData.accounts || [],
                objectCodes: chartData.objectCodes || [],
                mappings: chartData.mappings,
              });
            }
          }
        });
      }
    });
  } else if (response && typeof response === "object") {
    // Handle single object response (backward compatibility)
    const _id = response._id;
    Object.entries(response).forEach(([key, value]) => {
      if (key === "_id") return;
      if (value && typeof value === "object") {
        const chartData = (value as any).data || value;
        
        if (chartData && typeof chartData === "object" && "accounts" in chartData) {
          charts.push({
            _id,
            chartCode: key,
            accounts: chartData.accounts || [],
            objectCodes: chartData.objectCodes || [],
            mappings: chartData.mappings,
          });
        }
      }
    });
  }

  return charts;
}

// Chart CRUD Operations
export async function getAllCharts(): Promise<ChartOfAccounts[]> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get<ChartsOfAccountsDBResponse>(
      `${API_BASE_URL}/charts-of-accounts`,
      config,
    );

    return transformChartsResponse(response.data);
  } catch (error) {
    handleApiError(error);
  }
}

export async function getChartByCode(chartCode: string): Promise<ChartOfAccounts> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get<ChartsOfAccountsDBResponse>(
      `${API_BASE_URL}/charts-of-accounts/${chartCode}`,
      config,
    );

    const charts = transformChartsResponse(response.data);
    const chart = charts.find((c) => c.chartCode === chartCode);

    if (!chart) {
      throw new Error(`Chart ${chartCode} not found`);
    }

    return chart;
  } catch (error) {
    handleApiError(error);
  }
}

export async function createChart(payload: CreateChartPayload): Promise<ChartOfAccounts> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<ChartsOfAccountsDBResponse>(
      `${API_BASE_URL}/charts-of-accounts`,
      payload,
      config,
    );

    const charts = transformChartsResponse(response.data);
    const chart = charts.find((c) => c.chartCode === payload.chartCode);

    if (!chart) {
      throw new Error("Failed to create chart");
    }

    return chart;
  } catch (error) {
    handleApiError(error);
  }
}

export async function updateChart(
  chartCode: string,
  payload: UpdateChartPayload,
): Promise<ChartOfAccounts> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch<ChartsOfAccountsDBResponse>(
      `${API_BASE_URL}/charts-of-accounts/${chartCode}`,
      payload,
      config,
    );

    const charts = transformChartsResponse(response.data);
    const chart = charts.find((c) => c.chartCode === chartCode);

    if (!chart) {
      throw new Error("Failed to update chart");
    }

    return chart;
  } catch (error) {
    handleApiError(error);
  }
}

export async function deleteChart(chartCode: string): Promise<void> {
  try {
    const config = await getAxiosConfig();
    await axios.delete(`${API_BASE_URL}/charts-of-accounts/${chartCode}`, config);
  } catch (error) {
    handleApiError(error);
  }
}

// Statistics
export async function getChartStatistics(chartCode: string): Promise<ChartStatistics> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get<ChartStatistics>(
      `${API_BASE_URL}/charts-of-accounts/${chartCode}/statistics`,
      config,
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}
