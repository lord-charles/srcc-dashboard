import { Imprest } from "@/types/imprest";
import { getAxiosConfig, handleUnauthorized } from "./dashboard.service";
import axios, { AxiosError } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getMyImprest() {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(`${API_URL}/imprest/my-imprest`, config);
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to fetch my imprest:", error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch my imprest";
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

interface CreateImprestData {
  paymentReason: string;
  currency: string;
  amount: number;
  paymentType: string;
  explanation: string;
  attachmentUrls?: string[];
}

export async function createImprest(data: CreateImprestData) {
  try {
    const config = await getAxiosConfig();

    const response = await axios.post<Imprest>(
      `${API_URL}/imprest`,
      data,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to create imprest:", error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to create imprest";
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

interface ReceiptData {
  description: string;
  amount: number;
  receiptUrl: string;
}

interface SubmitAccountingData {
  receipts: ReceiptData[];
  comments?: string;
}

export async function submitImprestAccounting(
  id: string,
  data: SubmitAccountingData,
) {
  try {
    const config = await getAxiosConfig();

    const response = await axios.post<Imprest>(
      `${API_URL}/imprest/${id}/account`,
      data,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Error submitting imprest accounting:", error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to submit accounting";
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

export async function getAllImprests() {
  try {
    const config = await getAxiosConfig();

    const response = await axios.get<Imprest[]>(`${API_URL}/imprest`, config);
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Error fetching imprests:", error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch imprests";
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

export async function getMyImprests() {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get<Imprest[]>(
      `${API_URL}/imprest/my-imprest`,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Error fetching my imprests:", error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch my imprests";
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

export async function getImprestById(id: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get<Imprest>(
      `${API_URL}/imprest/${id}`,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Error fetching imprest ${id}:`, error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch imprest";
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

export async function approveImprestHOD(id: string, comments: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Imprest>(
      `${API_URL}/imprest/${id}/approve/hod`,
      { comments },
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Error approving imprest ${id}:`, error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to approve imprest";
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

export async function approveImprestAccountant(id: string, comments: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Imprest>(
      `${API_URL}/imprest/${id}/approve/accountant`,
      { comments },
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Error approving imprest ${id}:`, error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to approve imprest";
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

export async function approveImprestAccounting(id: string, comments: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${API_URL}/imprest/${id}/accounting/approve`,
      { comments },
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Error approving imprest accounting ${id}:`, error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to approve accounting";
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

export async function rejectImprest(id: string, reason: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Imprest>(
      `${API_URL}/imprest/${id}/reject`,
      { reason },
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Error rejecting imprest ${id}:`, error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to reject imprest";
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

interface DisbursementData {
  amount: number;
  comments?: string;
}

export async function disburseImprest(id: string, data: DisbursementData) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Imprest>(
      `${API_URL}/imprest/${id}/disburse`,
      data,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Error disbursing imprest ${id}:`, error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to disburse imprest";
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

interface AcknowledgmentData {
  received: boolean;
  comments?: string;
}

export async function acknowledgeImprestReceipt(
  id: string,
  data: AcknowledgmentData,
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Imprest>(
      `${API_URL}/imprest/${id}/acknowledge`,
      data,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Error acknowledging imprest ${id}:`, error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to acknowledge receipt";
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

interface DisputeResolutionData {
  resolution: "disbursed" | "cancelled";
  adminComments?: string;
}

export async function resolveImprestDispute(
  id: string,
  data: DisputeResolutionData,
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Imprest>(
      `${API_URL}/imprest/${id}/resolve-dispute`,
      data,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Error resolving dispute for imprest ${id}:`, error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to resolve dispute";
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

export async function requestImprestRevision(id: string, reason: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Imprest>(
      `${API_URL}/imprest/${id}/request-revision`,
      { reason },
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Error requesting revision for imprest ${id}:`, error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to request revision";
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

interface UpdateImprestData {
  paymentReason: string;
  currency: string;
  amount: number;
  paymentType: string;
  explanation: string;
  attachmentUrls?: string[];
}

export async function updateImprest(id: string, data: UpdateImprestData) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch<Imprest>(
      `${API_URL}/imprest/${id}/update`,
      data,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Error updating imprest ${id}:`, error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to update imprest";
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

export async function acceptDisputeResolution(id: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Imprest>(
      `${API_URL}/imprest/${id}/accept-dispute-resolution`,
      {},
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(
      `Error accepting dispute resolution for imprest ${id}:`,
      error,
    );
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to accept dispute resolution";
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

export async function requestAccountingRevision(id: string, reason: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post<Imprest>(
      `${API_URL}/imprest/${id}/request-accounting-revision`,
      { reason },
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(
      `Error requesting accounting revision for imprest ${id}:`,
      error,
    );
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to request accounting revision";
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
