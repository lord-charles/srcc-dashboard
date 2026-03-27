"use server";

import axios, { AxiosError } from "axios";
import { getAxiosConfig, handleUnauthorized } from "./dashboard.service";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface SystemConfig {
  key: string;
  type: string;
  data: Record<string, any>;
  isActive: boolean;
  description?: string;
}

export async function getSystemConfigs() {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(`${API_URL}/system-config`, config);
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to fetch system configs:", error);
    const message = error?.response?.data?.message || error?.message || "Failed to fetch system configs";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function getSystemConfigByKey(key: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${API_URL}/system-config/key/${key}`,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to fetch system config for ${key}:`, error);
    const message = error?.response?.data?.message || error?.message || `Failed to fetch system config for ${key}`;
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function getProjectConfig() {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${API_URL}/system-config/key/project_config`,
      config,
    );
    console.log(response.data)
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 404) {
        return { success: true as const, data: null };
      }
      if (error.response?.status === 401) {
        await handleUnauthorized();
      }
    }
    console.error("Failed to fetch project config:", error);
    const message = error?.response?.data?.message || error?.message || "Failed to fetch project config";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function updateSystemConfig(key: string, data: any) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch(
      `${API_URL}/system-config/${key}`,
      { data },
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to update system config for ${key}:`, error);
    const message = error?.response?.data?.message || error?.message || `Failed to update system config for ${key}`;
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function createSystemConfig(data: {
  key: string;
  type: string;
  data: any;
  description?: string;
}) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(`${API_URL}/system-config`, data, config);
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to create system config:", error);
    const message = error?.response?.data?.message || error?.message || "Failed to create system config";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}
