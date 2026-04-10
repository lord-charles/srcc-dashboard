"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export interface LpoItem {
  noOfDays: number;
  description: string;
  quantity: number;
  rate: number;
  total: number;
}

export interface Lpo {
  _id: string;
  projectId: string;
  supplierId: any;
  lpoNo: string;
  lpoDate: string;
  items: LpoItem[];
  subTotal: number;
  vatAmount: number;
  totalAmount: number;
  currency: string;
  status: "draft" | "submitted" | "hod_approved" | "finance_approved" | "rejected";
  validityDays: number;
  preparedBy: any;
  createdAt: string;
  updatedAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/srcc/api";

async function getAuthToken() {
  const session = (await getServerSession(authOptions)) as any;
  if (!session?.user?.token) {
    throw new Error("Unauthorized");
  }
  return session.user.token;
}

export async function getLposByProject(projectId: string): Promise<{ success: boolean; data?: Lpo[]; error?: string }> {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${API_URL}/lpo/project/${projectId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { success: false, error: errorData.message || "Failed to fetch LPOs" };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error("Failed to fetch LPOs:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function createLpo(data: any): Promise<{ success: boolean; data?: Lpo; error?: string }> {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${API_URL}/lpo`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { success: false, error: errorData.message || "Failed to create LPO" };
    }

    const result = await res.json();
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}

export async function updateLpoStatus(id: string, status: string): Promise<{ success: boolean; data?: Lpo; error?: string }> {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${API_URL}/lpo/${id}/status`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { success: false, error: errorData.message || "Failed to update LPO status" };
    }

    const result = await res.json();
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}

export async function sendLpoEmail(id: string, data: { pdfBase64: string; ccEmails?: string[]; message?: string; }): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${API_URL}/lpo/${id}/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { success: false, error: errorData.message || "Failed to dispatch LPO" };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}
