"use server";

import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";
import { handleUnauthorized } from "./dashboard.service";
import { Organization } from "@/types/organization";

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

export async function getAllOrganizations(): Promise<Organization[]> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/consultants/organizations`,
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to fetch organizations:", error);
    throw error.response?.data.message || error.message;
  }
}

export async function approveOrganization(organizationId: string): Promise<boolean> {
  try {
    const config = await getAxiosConfig();
    await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/consultants/organizations/${organizationId}/approve`,
      {},
      config
    );
    return true;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to approve organization:", error);
    throw error.response?.data.message || error.message;
  }
}

export async function rejectOrganization(organizationId: string): Promise<boolean> {
  try {
    const config = await getAxiosConfig();
    await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/consultants/organizations/${organizationId}/reject`,
      {},
      config
    );
    return true;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to reject organization:", error);
    throw error.response?.data.message || error.message;
  }
}
