"use server";

import axios, { AxiosError } from "axios";
import { Invoice } from "@/types/project";
import { getAxiosConfig, handleUnauthorized } from "./dashboard.service";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function createInvoice(invoiceData: any) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Invoice>(
      `${API_URL}/invoices`,
      invoiceData,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to create invoice:", error);
    const message = error?.response?.data?.message || error?.message || "Failed to create invoice";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function getInvoiceById(id: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get<Invoice>(
      `${API_URL}/invoices/${id}`,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to fetch invoice ${id}:`, error);
    const message = error?.response?.data?.message || error?.message || "Failed to fetch invoice";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function updateInvoice(
  id: string,
  invoiceData: Partial<Invoice>,
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.put<Invoice>(
      `${API_URL}/invoices/${id}`,
      invoiceData,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to update invoice ${id}:`, error);
    const message = error?.response?.data?.message || error?.message || "Failed to update invoice";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function deleteInvoice(id: string) {
  try {
    const config = await getAxiosConfig();
    await axios.delete(`${API_URL}/invoices/${id}`, config);
    return { success: true as const, data: true };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to delete invoice ${id}:`, error);
    const message = error?.response?.data?.message || error?.message || "Failed to delete invoice";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function editInvoice(invoiceId: string, invoiceData: any) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch<Invoice>(
      `${API_URL}/invoices/${invoiceId}`,
      invoiceData,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to edit invoice ${invoiceId}:`, error);
    const message = error?.response?.data?.message || error?.message || "Failed to edit invoice";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function submitInvoice(id: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Invoice>(
      `${API_URL}/invoices/${id}/submit`,
      {},
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to submit invoice ${id}:`, error);
    const message = error?.response?.data?.message || error?.message || "Failed to submit invoice";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function approveInvoice(id: string, comments: string = "") {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Invoice>(
      `${API_URL}/invoices/${id}/approve`,
      { comments },
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to approve invoice ${id}:`, error);
    const message = error?.response?.data?.message || error?.message || "Failed to approve invoice";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function approverRequestChanges(id: string, comments: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Invoice>(
      `${API_URL}/invoices/${id}/approver-request-changes`,
      { comments },
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to request changes for invoice ${id}:`, error);
    const message = error?.response?.data?.message || error?.message || "Failed to request changes";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function recordPayment(
  invoiceId: string,
  paymentData: Record<string, any>,
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Invoice>(
      `${API_URL}/invoices/${invoiceId}/payments`,
      paymentData,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to record payment for invoice ${invoiceId}:`, error);
    const message = error?.response?.data?.message || error?.message || "Failed to record payment";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function attachActualInvoice(
  invoiceId: string,
  url: string,
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch<Invoice>(
      `${API_URL}/invoices/${invoiceId}/actual-invoice`,
      { url },
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to attach actual invoice to invoice ${invoiceId}:`, error);
    const message = error?.response?.data?.message || error?.message || "Failed to attach actual invoice";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function requestInvoiceRevision(
  invoiceId: string,
  comments: string,
  changes: string[],
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Invoice>(
      `${API_URL}/invoices/${invoiceId}/request-revision`,
      { comments, changes },
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to request revision for invoice ${invoiceId}:`, error);
    const message = error?.response?.data?.message || error?.message || "Failed to request revision";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function addCreditNote(
  invoiceId: string,
  creditNoteData: Record<string, any>,
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Invoice>(
      `${API_URL}/invoices/${invoiceId}/credit-notes`,
      creditNoteData,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to add credit note to invoice ${invoiceId}:`, error);
    const message = error?.response?.data?.message || error?.message || "Failed to add credit note";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}
