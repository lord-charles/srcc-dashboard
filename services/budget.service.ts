"use server";

import axios, { AxiosError } from "axios";
import { Budget, BudgetCategory } from "@/types/project";
import { getAxiosConfig, handleUnauthorized } from "./dashboard.service";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function createInternalBudget(budgetData: any) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Budget>(
      `${API_URL}/budgets`,
      budgetData,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to create internal budget:", error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to create internal budget";
    return {
      success: false as const,
      error:
        typeof message === "string"
          ? message
          : Array.isArray(message)
            ? message[0]
            : JSON.stringify(message),
    };
  }
}

export async function createExternalBudget(budgetData: any) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Budget>(
      `${API_URL}/budgets`,
      budgetData,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to create external budget:", error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to create external budget";
    return {
      success: false as const,
      error:
        typeof message === "string"
          ? message
          : Array.isArray(message)
            ? message[0]
            : JSON.stringify(message),
    };
  }
}

export async function approveBudget(budgetId: string, comments: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Budget>(
      `${API_URL}/budgets/${budgetId}/approve`,
      { comments },
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to approve budget:", error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to approve budget";
    return {
      success: false as const,
      error:
        typeof message === "string"
          ? message
          : Array.isArray(message)
            ? message[0]
            : JSON.stringify(message),
    };
  }
}

export async function requestBudgetRevision(
  budgetId: string,
  data: { comments: string; changes: string[] },
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Budget>(
      `${API_URL}/budgets/${budgetId}/request-revision`,
      data,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to request budget revision:", error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to request budget revision";
    return {
      success: false as const,
      error:
        typeof message === "string"
          ? message
          : Array.isArray(message)
            ? message[0]
            : JSON.stringify(message),
    };
  }
}

export async function rejectBudget(
  budgetId: string,
  data: { reason: string; level: string },
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Budget>(
      `${API_URL}/budgets/${budgetId}/reject`,
      data,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to reject budget:", error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to reject budget";
    return {
      success: false as const,
      error:
        typeof message === "string"
          ? message
          : Array.isArray(message)
            ? message[0]
            : JSON.stringify(message),
    };
  }
}

export async function getAllBudgets() {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get<Budget[]>(`${API_URL}/budgets`, config);
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to fetch budgets:", error);
    const message =
      error?.response?.data.message ||
      error?.message ||
      "Failed to fetch budgets";
    return {
      success: false as const,
      error:
        typeof message === "string"
          ? message
          : Array.isArray(message)
            ? message[0]
            : JSON.stringify(message),
    };
  }
}

export async function getBudgetById(id: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get<Budget>(
      `${API_URL}/budgets/${id}`,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to fetch budget ${id}:`, error);
    const message =
      error?.response?.data.message ||
      error?.message ||
      "Failed to fetch budget";
    return {
      success: false as const,
      error:
        typeof message === "string"
          ? message
          : Array.isArray(message)
            ? message[0]
            : JSON.stringify(message),
    };
  }
}

export async function updateBudget(id: string, budgetData: Partial<Budget>) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.put<Budget>(
      `${API_URL}/budgets/${id}`,
      budgetData,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to update budget ${id}:`, error.response.data);
    const message =
      error?.response?.data.message ||
      error?.message ||
      "Failed to update budget";
    return {
      success: false as const,
      error:
        typeof message === "string"
          ? message
          : Array.isArray(message)
            ? message[0]
            : JSON.stringify(message),
    };
  }
}

export async function deleteBudget(id: string) {
  try {
    const config = await getAxiosConfig();
    await axios.delete(`${API_URL}/budgets/${id}`, config);
    return { success: true as const, data: true };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to delete budget:", error);
    const message =
      error?.response?.data.message ||
      error?.message ||
      "Failed to delete budget";
    return {
      success: false as const,
      error:
        typeof message === "string"
          ? message
          : Array.isArray(message)
            ? message[0]
            : JSON.stringify(message),
    };
  }
}

export async function updateBudgetStatus(
  id: string,
  status: "active" | "completed" | "pending",
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch<Budget>(
      `${API_URL}/budgets/${id}/status`,
      { status },
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to update budget status:", error);
    const message =
      error?.response?.data.message ||
      error?.message ||
      "Failed to update budget status";
    return {
      success: false as const,
      error:
        typeof message === "string"
          ? message
          : Array.isArray(message)
            ? message[0]
            : JSON.stringify(message),
    };
  }
}

export async function updateInternalBudget(data: any, budgetId: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch<Budget>(
      `${API_URL}/budgets/${budgetId}`,
      data,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to update internal budget:", error.response.data);
    const message =
      error?.response?.data.message ||
      error?.message ||
      "Failed to update internal budget";
    return {
      success: false as const,
      error:
        typeof message === "string"
          ? message
          : Array.isArray(message)
            ? message[0]
            : JSON.stringify(message),
    };
  }
}

export async function updateExternalBudget(data: any, budgetId: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch<Budget>(
      `${API_URL}/budgets/${budgetId}`,
      data,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to update external budget:", error);
    const message =
      error?.response?.data.message ||
      error?.message ||
      "Failed to update external budget";
    return {
      success: false as const,
      error:
        typeof message === "string"
          ? message
          : Array.isArray(message)
            ? message[0]
            : JSON.stringify(message),
    };
  }
}

export async function submitBudget(budgetId: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Budget>(
      `${API_URL}/budgets/${budgetId}/submit`,
      {},
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to submit budget:", error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to submit budget";
    return {
      success: false as const,
      error:
        typeof message === "string"
          ? message
          : Array.isArray(message)
            ? message[0]
            : JSON.stringify(message),
    };
  }
}
