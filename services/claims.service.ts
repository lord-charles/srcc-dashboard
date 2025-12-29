"use server";

import axios, { AxiosError } from "axios";
import { Claim } from "@/types/claim";
import { getAxiosConfig, handleUnauthorized } from "./dashboard.service";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://innova.cognitron.co.ke/srcc/api";

export async function approveClaim(
  claimId: string,
  comments: string
): Promise<Claim | null> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Claim>(
      `${API_URL}/claims/${claimId}/approve`,
      { comments },
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

export async function getMyClaims(): Promise<Claim[]> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get<Claim[]>(`${API_URL}/claims`, config);
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data?.message || error;
  }
}

export async function rejectClaim(
  claimId: string,
  reason: string
): Promise<Claim | null> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Claim>(
      `${API_URL}/claims/${claimId}/reject`,
      { reason },
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

export async function deleteClaim(claimId: string): Promise<void> {
  try {
    const config = await getAxiosConfig();
    await axios.delete(`${API_URL}/claims/${claimId}`, config);
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data?.message || error;
  }
}

export async function markClaimAsPaid(
  claimId: string,
  paymentDetails: {
    paymentMethod: string;
    transactionId: string;
    reference: string;
    paymentAdviceUrl: string;
  }
): Promise<Claim | null> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Claim>(
      `${API_URL}/claims/${claimId}/mark-as-paid`,
      paymentDetails,
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

export async function getClaimsByProject(projectId: string): Promise<Claim[]> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get<Claim[]>(
      `${API_URL}/claims/by-project/${projectId}`,
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

export async function cancelClaim(claimId: string): Promise<Claim | null> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Claim>(
      `${API_URL}/claims/${claimId}/cancel`,
      {},
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
