"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export interface PaginatedResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Supplier {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson?: {
    name: string;
    phone: string;
    email: string;
  };
  kraPin: string;
  registrationNumber: string;
  taxComplianceCertificateExpiry?: string;
  kraPinUrl?: string;
  incorporationCertificateUrl?: string;
  otherComplianceDocumentUrl?: string;
  bankName: string;
  bankBranch: string;
  accountName: string;
  accountNumber: string;
  supplierCategory: string;
  servicesProvided?: string[];
  status: string;
  rating?: number;
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

export async function getSuppliers(
  searchParams?: Record<string, string>
): Promise<PaginatedResponse<Supplier[]>> {
  try {
    const token = await getAuthToken();
    const query = new URLSearchParams(searchParams).toString();
    const url = `${API_URL}/supplier${query ? `?${query}` : ""}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: 'no-store',
    });

    if (!res.ok) {
        return { data: [] };
    }

    const data = await res.json();
    return { data: data }; // Depending on how backend returns data
  } catch (error) {
    console.error("Failed to fetch suppliers:", error);
    return { data: [] };
  }
}

export async function searchSuppliers(
  query: string
): Promise<Partial<Supplier>[]> {
  try {
    const token = await getAuthToken();
    const url = `${API_URL}/supplier/search?q=${encodeURIComponent(query)}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    return await res.json();
  } catch (error) {
    console.error("Failed to search suppliers:", error);
    return [];
  }
}

export async function getSupplierById(id: string): Promise<{ success: boolean; data?: Supplier; error?: string }> {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${API_URL}/supplier/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
        const errorData = await res.json();
        return { success: false, error: errorData.message || "Failed to fetch supplier" };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error("Failed to fetch supplier by ID:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getSupplierStats() {
    try {
        const token = await getAuthToken();
        const url = `${API_URL}/supplier/stats`;
    
        const res = await fetch(url, {
            method: "GET",
            headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            },
            cache: 'no-store',
        });
    
        if (!res.ok) {
            return null;
        }
    
        return await res.json();
    } catch (error) {
      console.error("Failed to fetch supplier stats:", error);
      return null;
    }
}

export async function createSupplier(data: any): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${API_URL}/supplier`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return {
        success: false,
        error: errorData.message || "Failed to create supplier",
      };
    }

    const result = await res.json();
    return { success: true, data: result };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}

export async function updateSupplier(id: string, data: any): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${API_URL}/supplier/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return {
        success: false,
        error: errorData.message || "Failed to update supplier",
      };
    }

    const result = await res.json();
    return { success: true, data: result };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}

export async function deleteSupplier(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${API_URL}/supplier/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      return {
        success: false,
        error: errorData.message || "Failed to delete supplier",
      };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}

