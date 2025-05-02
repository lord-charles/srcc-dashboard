"use server";

import axios, { AxiosError } from "axios";
import { Invoice } from "@/types/project";
import { getAxiosConfig, handleUnauthorized } from "./dashboard.service";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://innova.cognitron.co.ke/srcc/api";

export async function createInvoice(invoiceData: any) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Invoice>(
      `${API_URL}/invoices`,
      invoiceData,
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.log("Failed to create invoice:", error.response.data);
    throw error;
  }
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get<Invoice>(
      `${API_URL}/invoices/${id}`,
      config
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to fetch invoice:", error);
    return null;
  }
}

export async function updateInvoice(
  id: string,
  invoiceData: Partial<Invoice>
): Promise<Invoice | null> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.put<Invoice>(
      `${API_URL}/invoices/${id}`,
      invoiceData,
      config
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to update invoice:", error);
    return null;
  }
}

export async function deleteInvoice(id: string): Promise<boolean> {
  try {
    const config = await getAxiosConfig();
    await axios.delete(`${API_URL}/invoices/${id}`, config);
    return true;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to delete invoice:", error);
    throw new Error(
      error.response?.data?.message || "Failed to delete invoice"
    );
  }
}

export async function editInvoice(invoiceId: string, invoiceData: any) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch<Invoice>(
      `${API_URL}/invoices/${invoiceId}`,
      invoiceData,
      config
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        await handleUnauthorized();
      }
      throw new Error(
        error.response?.data?.message || "Failed to edit invoice"
      );
    }
    throw error;
  }
}

export async function submitInvoice(id: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Invoice>(
      `${API_URL}/invoices/${id}/submit`,
      {},
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw new Error(
      error.response?.data?.message || "Failed to submit invoice"
    );
  }
}


export async function recordPayment(
  invoiceId: string,
  paymentData: Record<string, any>,
  receiptFile?: File
): Promise<Invoice> {
  try {
    const config = await getAxiosConfig();
    const formData = new FormData();
    Object.entries(paymentData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    if (receiptFile) {
      formData.append('receiptFile', receiptFile);
    }
    const response = await axios.post<Invoice>(
      `${API_URL}/invoices/${invoiceId}/payments`,
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
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw new Error(
      error.response?.data?.message || 'Failed to record payment'
    );
  }
}



export async function attachActualInvoice(
  invoiceId: string,
  file: File
): Promise<Invoice> {
  try {
    const config = await getAxiosConfig();
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.patch<Invoice>(
      `${API_URL}/invoices/${invoiceId}/actual-invoice`,
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
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw new Error(
      error.response?.data?.message || 'Failed to attach actual invoice file'
    );
  }
}
