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
