import { Imprest } from "@/types/imprest";
import { getAxiosConfig, handleUnauthorized } from "./dashboard.service";
import axios, { AxiosError } from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://innova.cognitron.co.ke/srcc/api";

export async function getMyImprest() {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(`${API_URL}/imprest/my-imprest`, config);
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data?.message || error;
  }
}

interface CreateImprestData {
  paymentReason: string;
  currency: string;
  amount: number;
  paymentType: string;
  explanation: string;
  attachmentUrls?: string[];
}

export async function createImprest(data: CreateImprestData): Promise<Imprest> {
  try {
    const config = await getAxiosConfig();

    const response = await axios.post<Imprest>(
      `${API_URL}/imprest`,
      data,
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

interface ReceiptData {
  description: string;
  amount: number;
}

interface SubmitAccountingData {
  receipts: ReceiptData[];
  comments?: string;
  receiptFiles: File[];
}

export async function submitImprestAccounting(
  id: string,
  data: SubmitAccountingData
): Promise<Imprest> {
  try {
    const config = await getAxiosConfig();

    // Create FormData for multipart/form-data request
    const formData = new FormData();

    // Convert receipts array to JSON string
    formData.append("receipts", JSON.stringify(data.receipts));

    if (data.comments) {
      formData.append("comments", data.comments);
    }

    // Add receipt files
    if (data.receiptFiles && data.receiptFiles.length > 0) {
      data.receiptFiles.forEach((file) => {
        formData.append("receiptFiles", file);
      });
    }

    // Update config headers for multipart/form-data
    const multipartConfig = {
      ...config,
      headers: {
        ...config.headers,
        "Content-Type": "multipart/form-data",
      },
    };

    const response = await axios.post<Imprest>(
      `${API_URL}/imprest/${id}/account`,
      formData,
      multipartConfig
    );
    console.log(response.data);
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Error submitting imprest accounting:", error);
    throw error?.response?.data?.message || error;
  }
}

export async function getAllImprests(): Promise<Imprest[]> {
  try {
    const config = await getAxiosConfig();
    console.log("config", config);

    const response = await axios.get<Imprest[]>(`${API_URL}/imprest`, config);
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    const config = await getAxiosConfig();
    console.log("config", config);
    console.error("Error fetching imprests:", error.response.data);
    throw error?.response?.data?.message || error;
  }
}

export async function getMyImprests(): Promise<Imprest[]> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get<Imprest[]>(
      `${API_URL}/imprest/my-imprest`,
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Error fetching my imprests:", error);
    throw error?.response?.data?.message || error;
  }
}

export async function getImprestById(id: string): Promise<Imprest> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get<Imprest>(
      `${API_URL}/imprest/${id}`,
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Error fetching imprest:", error);
    throw error?.response?.data?.message || error;
  }
}

export async function approveImprestHOD(
  id: string,
  comments: string
): Promise<Imprest> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Imprest>(
      `${API_URL}/imprest/${id}/approve/hod`,
      { comments },
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Error approving imprest:", error);
    throw error?.response?.data?.message || error;
  }
}

export async function approveImprestAccountant(
  id: string,
  comments: string
): Promise<Imprest> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Imprest>(
      `${API_URL}/imprest/${id}/approve/accountant`,
      { comments },
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Error approving imprest:", error);
    throw error?.response?.data?.message || error;
  }
}

export async function approveImprestAccounting(
  id: string,
  comments: string
): Promise<Imprest> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${API_URL}/imprest/${id}/accounting/approve`,
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

export async function rejectImprest(
  id: string,
  reason: string
): Promise<Imprest> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Imprest>(
      `${API_URL}/imprest/${id}/reject`,
      { reason },
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Error rejecting imprest:", error);
    throw error?.response?.data?.message || error;
  }
}

interface DisbursementData {
  amount: number;
  comments?: string;
}

export async function disburseImprest(
  id: string,
  data: DisbursementData
): Promise<Imprest> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Imprest>(
      `${API_URL}/imprest/${id}/disburse`,
      data,
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
