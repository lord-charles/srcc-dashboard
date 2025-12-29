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
      config
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to fetch contracts:", error);
    return null;
  }
}

export async function createContract(data: any) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/contracts`,
      data,
      config
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to create contract:", error);
    return null;
  }
}

export async function getContractById(contractId: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/contracts/${contractId}`,
      config
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to fetch contract ${contractId}:`, error);
    return null;
  }
}

export async function updateContractStatus(contractId: string, status: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/contracts/${contractId}/status`,
      { status },
      config
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to update contract status:`, error);
    return null;
  }
}

export async function getContractsByProject(projectId: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/contracts/project/${projectId}`,
      config
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to fetch contracts for project ${projectId}:`, error);
    return null;
  }
}

export async function getContractsByUser(userId: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/contracts/user/${userId}`,
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to fetch user contracts:", error);
    throw error?.response?.data.message || "Failed to fetch user contracts";
  }
}

export async function getMyContracts() {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/contracts/my-contracts`,
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to fetch my contracts:", error);
    throw error?.response?.data.message || "Failed to fetch my contracts";
  }
}

export async function updateContract(contractId: string, contractData: any) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/contracts/${contractId}`,
      contractData,
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to update contract ${contractId}:`, error);
    throw error?.response?.data.message || "Failed to update contract";
  }
}

export async function deleteContract(contractId: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/contracts/${contractId}`,
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to delete contract ${contractId}:`, error);
    throw error?.response?.data.message || "Failed to delete contract";
  }
}

export async function generateContractOtp(contractId: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/contracts/${contractId}/generate-otp`,
      {},
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to generate contract OTP:`, error);
    throw error?.response?.data.message || "Failed to generate contract OTP";
  }
}

export async function verifyContractOtp(contractId: string, otp: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/contracts/${contractId}/verify-otp`,
      { otp },
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to verify contract OTP:`, error);
    throw error?.response?.data.message || "Failed to verify contract OTP";
  }
}

export async function approveContract(contractId: string, comments: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/contracts/${contractId}/approve`,
      { comments },
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to approve contract ${contractId}:`, error);
    throw error?.response?.data.message || "Failed to approve contract";
  }
}

export async function rejectContract(contractId: string, reason: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/contracts/${contractId}/reject`,
      { reason },
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to reject contract ${contractId}:`, error);
    throw error?.response?.data.message || "Failed to reject contract";
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
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to create claim:", error);
    throw error?.response?.data.message || "Failed to create claim";
  }
}

export async function getContractClaims(contractId: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/claims/contract/${contractId}`,
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to fetch contract claims:", error);
    throw error?.response?.data.message || "Failed to fetch contract claims";
  }
}

export async function getAllClaims() {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/claims/claims`,
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to fetch claims:", error);
    throw error?.response?.data.message || "Failed to fetch claims";
  }
}

export async function fetchClaimsByContract(contractId: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/claims?contractId=${contractId}`,
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to fetch claims by contract:", error);
    throw error?.response?.data.message || "Failed to fetch claims by contract";
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
      config
    );
    return response.data as Array<{
      _id: string;
      name: string;
      version?: string;
      contentType: string;
      content: string;
      variables?: string[];
    }>;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to fetch contract templates:", error);
    throw (
      error?.response?.data?.message || "Failed to fetch contract templates"
    );
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
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to create contract template:", error);
    throw (
      error?.response?.data?.message || "Failed to create contract template"
    );
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
  }>
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/contract-templates/${id}`,
      data,
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to update contract template:", error);
    throw (
      error?.response?.data?.message || "Failed to update contract template"
    );
  }
}

export async function deleteContractTemplate(id: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/contract-templates/${id}`,
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to delete contract template:", error);
    throw (
      error?.response?.data?.message || "Failed to delete contract template"
    );
  }
}
