"use server";

import axios, { AxiosError } from "axios";
import { Claim } from "@/types/claim";
import { getAxiosConfig, handleUnauthorized } from "./dashboard.service";
import { Imprest } from "@/types/imprest";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://innova.cognitron.co.ke/srcc/api";

export async function approveClaim(claimId: string, comments: string): Promise<Claim | null> {
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

export async function rejectClaim(claimId: string, reason: string): Promise<Claim | null> {
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



