"use server";

import axios, { AxiosError } from "axios";
import { User, PaginatedUsers } from "@/types/user";
import { CreateEmployeeDto } from "@/types/employee";
import { cookies } from "next/headers";
import { handleUnauthorized } from "./dashboard.service";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

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

export async function getAllEmployees(
  page: number = 1,
  limit: number = 1000000,
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/users?page=${page}&limit=${limit}`,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to fetch employees:", error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch employees";
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

export async function getEmployeeById(id: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/user/${id}`,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to fetch employee ${id}:`, error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch employee";
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

export async function registerEmployee(employee: CreateEmployeeDto) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
      employee,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to register employee:", error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to register employee";
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

export async function updateEmployee(
  id: string,
  employee: Partial<CreateEmployeeDto>,
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/user/${id}`,
      employee,
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
      "Failed to update employee";
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

export async function deleteEmployee(id: string) {
  try {
    const config = await getAxiosConfig();
    await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/user/${id}`, config);
    return { success: true as const, data: true };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to delete employee ${id}:`, error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to delete employee";
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

export async function getProfile() {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/profile`,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to fetch user profile:", error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch profile";
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
