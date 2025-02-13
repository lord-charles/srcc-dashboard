"use server";

import axios, { AxiosError } from "axios";
import { Budget } from "@/types/budget";
import { cookies } from "next/headers";
import { handleUnauthorized } from "./dashboard.service";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://innova.cognitron.co.ke/srcc/api";

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

export async function createBudget(budgetData: any) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Budget>(
      `${API_URL}/budgets`,
      budgetData,
      config
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to create budget:", error);
    return null;
  }
}

export async function getAllBudgets(): Promise<Budget[] | null> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get<Budget[]>(
      `${API_URL}/budgets`,
      config
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to fetch budgets:", error);
    return null;
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
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to fetch budget:", error);
    return null;
  }
}

export async function updateBudget(id: string, budgetData: Partial<Budget>): Promise<Budget | null> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.put<Budget>(
      `${API_URL}/budgets/${id}`,
      budgetData,
      config
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to update budget:", error);
    return null;
  }
}

export async function deleteBudget(id: string): Promise<boolean> {
  try {
    const config = await getAxiosConfig();
    await axios.delete(
      `${API_URL}/budgets/${id}`,
      config
    );
    return true;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to delete budget:", error);
    return false;
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
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to update budget status:", error);
    return null;
  }
}