"use server";

import axios from "axios";
import { User, PaginatedUsers } from "@/types/user";
import { CreateEmployeeDto } from "@/types/employee";
import { cookies } from "next/headers";
import {
  WalletTransaction,
  PaginatedWalletTransactions,
  PaymentTransaction,
  PaginatedPaymentTransactions,
} from "@/types/wallet";
import { endOfMonth, startOfMonth } from "date-fns";

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

export async function getAllEmployees(
  page: number = 1,
  limit: number = 1000000
): Promise<PaginatedUsers> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/users?page=${page}&limit=${limit}`,
      config
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    return { data: [], total: 0, page: 1, limit };
  }
}

export async function getWalletTransactions(
  params: {
    startDate?: string;
    endDate?: string;
  } = {}
) {
  try {
    const now = new Date();
    const defaultEndDate = endOfMonth(now).toISOString();
    const defaultStartDate = startOfMonth(now).toISOString();

    const config = await getAxiosConfig();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/wallet-transactions`,
      {
        ...config,
        params: {
          startDate: params.startDate || defaultStartDate,
          endDate: params.endDate || defaultEndDate,
          limit: 20000,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch wallet transactions:", error);
    return { data: [], total: 0, page: 1, limit: 10 };
  }
}

export async function getPaymentTransactions(
  params: {
    startDate?: string;
    endDate?: string;
  } = {}
): Promise<PaymentTransaction[]> {
  try {
    const now = new Date();
    const defaultEndDate = endOfMonth(now).toISOString();
    const defaultStartDate = startOfMonth(now).toISOString();

    const config = await getAxiosConfig();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/payment/transactions`,
      {
        ...config,
        params: {
          startDate: params.startDate || defaultStartDate,
          endDate: params.endDate || defaultEndDate,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch payment transactions:", error);
    throw error;
  }
}
