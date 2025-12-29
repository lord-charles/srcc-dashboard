"use server";

import axios, { AxiosError } from "axios";
import { Budget, BudgetCategory } from "@/types/project";
import { getAxiosConfig, handleUnauthorized } from "./dashboard.service";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://innova.cognitron.co.ke/srcc/api";

export async function createInternalBudget(budgetData: any) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Budget>(
      `${API_URL}/budgets`,
      budgetData,
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data?.message || error;
  }
}

export async function createExternalBudget(budgetData: any) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Budget>(
      `${API_URL}/budgets`,
      budgetData,
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data?.message || error;
  }
}

export async function approveBudget(budgetId: string, comments: string): Promise<Budget | null> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Budget>(
      `${API_URL}/budgets/${budgetId}/approve`,
      { comments },
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to approve budget:", error.response?.data?.message);
    throw error?.response?.data?.message || error;
  }
}

export async function requestBudgetRevision(
  budgetId: string,
  data: { comments: string; changes: string[] }
): Promise<Budget | null> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Budget>(
      `${API_URL}/budgets/${budgetId}/request-revision`,
      data,
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data?.message || error;
  }
}

export async function rejectBudget(
  budgetId: string,
  data: { reason: string; level: string }
): Promise<Budget | null> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Budget>(
      `${API_URL}/budgets/${budgetId}/reject`,
      data,
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data?.message || error;
  }
}

export async function getAllBudgets(): Promise<Budget[] | null> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get<Budget[]>(`${API_URL}/budgets`, config);
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data.message || error;
  }
}

export async function getBudgetById(id: string): Promise<Budget | null> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get<Budget>(
      `${API_URL}/budgets/${id}`,
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data.message || error;
  }
}

export async function updateBudget(
  id: string,
  budgetData: Partial<Budget>
): Promise<Budget | null> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.put<Budget>(
      `${API_URL}/budgets/${id}`,
      budgetData,
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data.message || error;
  }
}

export async function deleteBudget(id: string): Promise<boolean> {
  try {
    const config = await getAxiosConfig();
    await axios.delete(`${API_URL}/budgets/${id}`, config);
    return true;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to delete budget:", error);
    throw error?.response?.data.message || error;
  }
}

export async function updateBudgetStatus(
  id: string,
  status: "active" | "completed" | "pending"
): Promise<Budget | null> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch<Budget>(
      `${API_URL}/budgets/${id}/status`,
      { status },
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to update budget status:", error);
    throw error?.response?.data.message || error;
  }
}

export async function updateInternalBudget(
  data: any,
  budgetId: string
): Promise<Budget | null> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch<Budget>(
      `${API_URL}/budgets/${budgetId}`,
      data,
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to update internal budget:", error);
    throw error?.response?.data.message || error;
  }
}

export async function updateExternalBudget(
  data: any,
  budgetId: string
): Promise<Budget | null> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch<Budget>(
      `${API_URL}/budgets/${budgetId}`,
      data,
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to update external budget:", error);
    throw error?.response?.data.message || error;
  }
}

export async function submitBudget(budgetId: string): Promise<Budget | null> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Budget>(
      `${API_URL}/budgets/${budgetId}/submit`,
      {},
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to submit budget:", error.response);
    throw error?.response?.data?.message || error;
  }
}
