"use server";

import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";
import { handleUnauthorized } from "./dashboard.service";

const getAxiosConfig = async (isMultipart = false) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  return {
    headers: {
      Authorization: token ? `Bearer ${token.value}` : "",
      "Content-Type": isMultipart ? "multipart/form-data" : "application/json",
    },
  };
};

export async function registerConsultant(formData: FormData): Promise<any> {
  try {
    const config = await getAxiosConfig(true);
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/consultants/register`,
      formData,
      {
        ...config,
        headers: {
          ...config.headers,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.log(error.response?.data);
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Consultant registration error:", error.response?.data || error.message);
    throw error.response?.data.message
  }
}

export async function approveConsultant(consultantId: string): Promise<boolean> {
  try {
    const config = await getAxiosConfig();
    await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/consultants/${consultantId}/approve`,
      {},
      config
    );
    return true;
  } catch (error:any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to approve consultant:", error);
      throw error.response?.data.message

  }
}

export async function rejectConsultant(consultantId: string): Promise<boolean> {
  try {
    const config = await getAxiosConfig();
    await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/consultants/${consultantId}/reject`,
      {},
      config
    );
    return true;
  } catch (error:any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to reject consultant:", error);
    throw error.response?.data.message
  }
}

export async function registerOrganization(formData: FormData): Promise<any> {
  try {
    const config = await getAxiosConfig(true);
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/consultants/organization/register`,
      formData,
      {
        ...config,
        headers: {
          ...config.headers,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.log(error.response?.data);
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Organization registration error:", error.response?.data || error.message);
    throw error.response?.data.message || error.message;
  }
}
