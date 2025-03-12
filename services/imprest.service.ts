import { Imprest } from "@/types/imprest";
import { getAxiosConfig, handleUnauthorized } from "./dashboard.service";
import axios, { AxiosError } from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://innova.cognitron.co.ke/srcc/api";



export async function getAllImprests(): Promise<Imprest[]> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get<Imprest[]>(`${API_URL}/imprest`, config);
  return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Error fetching imprests:", error);
    throw error?.response?.data?.message || error;
  }
}

export async function getImprestById(id: string): Promise<Imprest> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get<Imprest>(`${API_URL}/imprest/${id}`, config);
  return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Error fetching imprest:", error);
    throw error?.response?.data?.message || error;
  }
}

export async function approveImprestHOD(id: string, comments: string): Promise<Imprest> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Imprest>(`${API_URL}/imprest/${id}/approve/hod`, { comments }, config);
  return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Error approving imprest:", error);
    throw error?.response?.data?.message || error;
  }
}

export async function approveImprestAccountant(id: string, comments: string): Promise<Imprest> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Imprest>(`${API_URL}/imprest/${id}/approve/accountant`, { comments }, config);
  return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Error approving imprest:", error);
    throw error?.response?.data?.message || error;
  }
}

export async function rejectImprest(id: string, reason: string): Promise<Imprest> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Imprest>(`${API_URL}/imprest/${id}/reject`, { reason }, config);
  return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Error rejecting imprest:", error);
    throw error?.response?.data?.message || error;
  }
}
