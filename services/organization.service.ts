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

export async function getAllOrganizations() {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/consultants/organizations`,
      config
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to fetch organizations:", error);
    const message = error?.response?.data?.message || error?.message || "Failed to fetch organizations";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function approveOrganization(organizationId: string) {
  try {
    const config = await getAxiosConfig();
    await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/consultants/organizations/${organizationId}/approve`,
      {},
      config
    );
    return { success: true as const, data: true };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to approve organization:", error);
    const message = error?.response?.data?.message || error?.message || "Failed to approve organization";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function rejectOrganization(organizationId: string) {
  try {
    const config = await getAxiosConfig();
    await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/consultants/organizations/${organizationId}/reject`,
      {},
      config
    );
    return { success: true as const, data: true };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to reject organization:", error);
    const message = error?.response?.data?.message || error?.message || "Failed to reject organization";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}
