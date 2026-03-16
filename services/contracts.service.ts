"use server";

import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";
import { handleUnauthorized } from "./dashboard.service";

const getAxiosConfig = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  return {
    headers: {
      Authorization: token ? `Bearer ${token.value}` : "",
      "Content-Type": "application/json",
    },
  };
};

export async function getAllContracts() {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/contracts`,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to fetch contracts:", error);
    const message = error?.response?.data?.message || error?.message || "Failed to fetch contracts";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function createContract(data: any) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/contracts`,
      data,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to create contract:", error);
    const message = error?.response?.data?.message || error?.message || "Failed to create contract";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function getContractById(contractId: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/contracts/${contractId}`,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to fetch contract ${contractId}:`, error);
    const message = error?.response?.data?.message || error?.message || "Failed to fetch contract";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function updateContractStatus(contractId: string, status: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/contracts/${contractId}/status`,
      { status },
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to update contract status for ${contractId}:`, error);
    const message = error?.response?.data?.message || error?.message || "Failed to update contract status";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function getContractsByProject(projectId: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/contracts/project/${projectId}`,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to fetch contracts for project ${projectId}:`, error);
    const message = error?.response?.data?.message || error?.message || "Failed to fetch project contracts";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function getContractsByUser(userId: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/contracts/user/${userId}`,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to fetch user contracts:", error);
    const message = error?.response?.data?.message || error?.message || "Failed to fetch user contracts";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function getMyContracts() {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/contracts/my-contracts`,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to fetch my contracts:", error);
    const message = error?.response?.data?.message || error?.message || "Failed to fetch my contracts";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function updateContract(contractId: string, contractData: any) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/contracts/${contractId}`,
      contractData,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to update contract ${contractId}:`, error);
    const message = error?.response?.data?.message || error?.message || "Failed to update contract";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function deleteContract(contractId: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/contracts/${contractId}`,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to delete contract ${contractId}:`, error);
    const message = error?.response?.data?.message || error?.message || "Failed to delete contract";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function generateContractOtp(contractId: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/contracts/${contractId}/generate-otp`,
      {},
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to generate contract OTP:`, error);
    const message = error?.response?.data?.message || error?.message || "Failed to generate contract OTP";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function verifyContractOtp(contractId: string, otp: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/contracts/${contractId}/verify-otp`,
      { otp },
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to verify contract OTP:`, error);
    const message = error?.response?.data?.message || error?.message || "Failed to verify contract OTP";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function approveContract(contractId: string, comments: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/contracts/${contractId}/approve`,
      { comments },
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to approve contract ${contractId}:`, error);
    const message = error?.response?.data?.message || error?.message || "Failed to approve contract";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function rejectContract(contractId: string, reason: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/contracts/${contractId}/reject`,
      { reason },
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to reject contract ${contractId}:`, error);
    const message = error?.response?.data?.message || error?.message || "Failed to reject contract";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function createClaim(data: {
  projectId: string;
  contractId: string;
  amount: number;
  currency: string;
  milestones: Array<{
    milestoneId: string;
    title: string;
    percentageClaimed: number;
  }>;
}) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/claims`,
      data,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to create claim:", error);
    const message = error?.response?.data?.message || error?.message || "Failed to create claim";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function getContractClaims(contractId: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/claims/contract/${contractId}`,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to fetch contract claims:", error);
    const message = error?.response?.data?.message || error?.message || "Failed to fetch contract claims";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function getAllClaims() {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/claims/claims`,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to fetch claims:", error);
    const message = error?.response?.data?.message || error?.message || "Failed to fetch claims";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function fetchClaimsByContract(contractId: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/claims?contractId=${contractId}`,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to fetch claims by contract:", error);
    const message = error?.response?.data?.message || error?.message || "Failed to fetch claims by contract";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function getContractTemplates(params?: {
  active?: boolean;
  category?: string;
}) {
  try {
    const config = await getAxiosConfig();
    const search = new URLSearchParams();
    if (params?.active !== undefined)
      search.set("active", String(params.active));
    if (params?.category) search.set("category", params.category);
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/contract-templates${
        search.toString() ? `?${search.toString()}` : ""
      }`,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to fetch contract templates:", error);
    const message = error?.response?.data?.message || error?.message || "Failed to fetch contract templates";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function createContractTemplate(data: {
  name: string;
  category?: string;
  version?: string;
  contentType?: string;
  content: string;
  variablesCsv?: string;
  active?: boolean;
}) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/contract-templates`,
      data,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to create contract template:", error);
    const message = error?.response?.data?.message || error?.message || "Failed to create contract template";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function updateContractTemplate(
  id: string,
  data: Partial<{
    name: string;
    category?: string;
    version?: string;
    contentType?: string;
    content: string;
    variablesCsv?: string;
    active?: boolean;
  }>,
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/contract-templates/${id}`,
      data,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to update contract template:", error);
    const message = error?.response?.data?.message || error?.message || "Failed to update contract template";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function deleteContractTemplate(id: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/contract-templates/${id}`,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to delete contract template:", error);
    const message = error?.response?.data?.message || error?.message || "Failed to delete contract template";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}
