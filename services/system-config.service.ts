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
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error;
  }
}

export async function getSystemConfigByKey(key: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${API_URL}/system-config/key/${key}`,
      config,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error;
  }
}

export async function getProjectConfig() {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${API_URL}/system-config/key/project_config`,
      config,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 404) {
        return null;
      }
      if (error.response?.status === 401) {
        await handleUnauthorized();
      }
    }
    throw error;
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
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error;
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
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error;
  }
}
