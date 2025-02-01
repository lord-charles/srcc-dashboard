"use server";

import axios from "axios";
import { Advance, PaginatedAdvances } from "@/types/advance";
import { cookies } from "next/headers";

export interface GetAdvancesParams {
  page?: number;
  limit?: number;
  minAmount?: number;
  maxAmount?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  employeeId?: string;
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

export async function getAdvances({
  page = 1,
  limit = 1000,
}: GetAdvancesParams = {}): Promise<PaginatedAdvances> {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const config = await getAxiosConfig();

    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/advances?${queryParams.toString()}`,
      config
    );
    return data;
  } catch (error) {
    console.error("Failed to fetch advances:", error);
    return { data: [], total: 0, page: 1, limit: 10 };
  }
}

export async function getAdvanceById(id: string): Promise<Advance | null> {
  try {
    const config = await getAxiosConfig();
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/advances/${id}`,
      config
    );
    return data;
  } catch (error) {
    console.error("Failed to fetch advance details:", error);
    throw error;
  }
}

export async function createAdvance(
  advanceData: Partial<Advance>
): Promise<Advance | null> {
  try {
    const config = await getAxiosConfig();
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/advances`,
      advanceData,
      config
    );
    return data;
  } catch (error) {
    console.error("Failed to create advance:", error);
    throw error;
  }
}

export async function updateAdvance(
  id: string,
  advanceData: Partial<Advance>
): Promise<Advance | null> {
  try {
    const config = await getAxiosConfig();
    const { data } = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/advances/${id}`,
      advanceData,
      config
    );
    return data;
  } catch (error) {
    console.error("Failed to update advance:", error);
    throw error;
  }
}

export async function updateAdvanceStatus(
  id: string,
  status: string,
  comments?: string
): Promise<Advance | null> {
  try {
    const config = await getAxiosConfig();
    const { data } = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/advances/${id}/status`,
      { status, comments },
      config
    );
    return data;
  } catch (error) {
    console.error("Failed to update advance status:", error);
    throw error;
  }
}
