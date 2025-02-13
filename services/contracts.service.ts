"use server";

import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";
import { endOfMonth, startOfMonth } from "date-fns";
import { handleUnauthorized } from "./dashboard.service";

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

interface CreateContractInput {
  contractNumber: string;
  title: string;
  description: string;
  contractingAuthorityId: string;
  contractorId: string;
  contractValue: number;
  currency: string;
  startDate: string;
  endDate: string;
  status: string;
  procurementMethod: string;
  procurementReferenceNumber: string;
  terms: {
    clause: string;
    description: string;
  }[];
  deliverables: {
    title: string;
    description: string;
    dueDate: string;
    completed: boolean;
    acceptanceCriteria: string[];
  }[];
  paymentSchedule: {
    milestone: string;
    amount: number;
    dueDate: string;
    paid: boolean;
    paymentDate: string;
  }[];
  requiresPerformanceSecurity: boolean;
  performanceSecurityAmount: number;
  amendments: {
    amendmentNumber: string;
    description: string;
    date: string;
    approvedBy: string;
  }[];
  createdBy: string;
  contractManagerId: string;
}

interface Contract {
  // Add contract properties here
}

export async function getAllContracts(
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/contracts`,
      config
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to fetch contracts:", error);
    return null
  }
}

export async function createContract(data: any): Promise<Contract | null> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Contract>(
      `${process.env.NEXT_PUBLIC_API_URL}/contracts`,
      data,
      config
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to create contract:", error);
    return null;
  }
}
