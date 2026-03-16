"use server";

import axios, { AxiosError } from "axios";
import { Claim } from "@/types/claim";
import { getAxiosConfig, handleUnauthorized } from "./dashboard.service";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type CreateClaimPayload = {
  projectId: string;
  contractId: string;
  claimantId: string;
  amount: number;
  currency: string;
  milestones: Array<{
    milestoneId: string;
    title: string;
    percentageClaimed: number;
    budget: number;
  }>;
  notes?: string;
  documents?: Array<{
    url: string;
    name: string;
    type: "invoice" | "receipt" | "timesheet" | "report" | "other";
  }>;
  coachClaim?: {
    units: number;
    rate: number;
    rateUnit: "per_session" | "per_hour";
    unitAmount: number;
    totalAmount: number;
  };
};

export async function createClaim(payload: CreateClaimPayload) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Claim>(
      `${API_URL}/claims`,
      payload,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    const message =
      error?.response?.data?.message || error?.message || "An error occurred";
    return {
      success: false as const,
      error:
        typeof message === "string"
          ? message
          : Array.isArray(message)
            ? message[0]
            : JSON.stringify(message),
    };
  }
}

export async function approveClaim(claimId: string, comments: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Claim>(
      `${API_URL}/claims/${claimId}/approve`,
      { comments },
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to approve claim";
    return {
      success: false as const,
      error:
        typeof message === "string"
          ? message
          : Array.isArray(message)
            ? message[0]
            : JSON.stringify(message),
    };
  }
}

export async function getMyClaims() {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get<Claim[]>(`${API_URL}/claims`, config);
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch claims";
    return {
      success: false as const,
      error:
        typeof message === "string"
          ? message
          : Array.isArray(message)
            ? message[0]
            : JSON.stringify(message),
    };
  }
}

export async function rejectClaim(claimId: string, reason: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Claim>(
      `${API_URL}/claims/${claimId}/reject`,
      { reason },
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to reject claim";
    return {
      success: false as const,
      error:
        typeof message === "string"
          ? message
          : Array.isArray(message)
            ? message[0]
            : JSON.stringify(message),
    };
  }
}

export async function deleteClaim(claimId: string) {
  try {
    const config = await getAxiosConfig();
    await axios.delete(`${API_URL}/claims/${claimId}`, config);
    return { success: true as const };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to delete claim";
    return {
      success: false as const,
      error:
        typeof message === "string"
          ? message
          : Array.isArray(message)
            ? message[0]
            : JSON.stringify(message),
    };
  }
}

export async function markClaimAsPaid(
  claimId: string,
  paymentDetails: {
    paymentMethod: string;
    transactionId: string;
    reference: string;
    paymentAdviceUrl: string;
  },
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Claim>(
      `${API_URL}/claims/${claimId}/mark-as-paid`,
      paymentDetails,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to mark as paid";
    return {
      success: false as const,
      error:
        typeof message === "string"
          ? message
          : Array.isArray(message)
            ? message[0]
            : JSON.stringify(message),
    };
  }
}

export async function getClaimsByProject(projectId: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get<Claim[]>(
      `${API_URL}/claims/by-project/${projectId}`,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch claims";
    return {
      success: false as const,
      error:
        typeof message === "string"
          ? message
          : Array.isArray(message)
            ? message[0]
            : JSON.stringify(message),
    };
  }
}

export async function cancelClaim(claimId: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Claim>(
      `${API_URL}/claims/${claimId}/cancel`,
      {},
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to cancel claim";
    return {
      success: false as const,
      error:
        typeof message === "string"
          ? message
          : Array.isArray(message)
            ? message[0]
            : JSON.stringify(message),
    };
  }
}
