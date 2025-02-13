"use server";

import axios, { AxiosError } from "axios";
import { Advance, PaginatedAdvances } from "@/types/advance";
import { cookies } from "next/headers";
import { Project, TeamMember } from "@/types/project";
import { handleUnauthorized } from "./dashboard.service";

export interface GetAdvancesParams {
  page?: number;
  limit?: number;
  minAmount?: number;
  maxAmount?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  employeeId?: string;
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

export async function getProjects() {
  try {
    const config = await getAxiosConfig();

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/projects`,
      config
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to fetch projects:", error);
    return null
  }
}

export async function getProjectById(id: string) {
  try {
    const config = await getAxiosConfig();
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`,
      config
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to fetch PROJECT details:", error);
    throw error;
  }
}

export async function createAdvance(
  advanceData: Partial<Advance>
): Promise<Advance | null> {
  try {
    const config = await getAxiosConfig();
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/advances`,
      advanceData,
      config
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to create advance:", error);
    throw error;
  }
}

export async function updateAdvance(
  id: string,
  advanceData: Partial<Advance>
): Promise<Advance | null> {
  try {
    const config = await getAxiosConfig();
    const { data } = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/advances/${id}`,
      advanceData,
      config
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to update advance:", error);
    throw error;
  }
}

export async function updateAdvanceStatus(
  id: string,
  status: string,
  comments?: string
): Promise<Advance | null> {
  try {
    const config = await getAxiosConfig();
    const { data } = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/advances/${id}/status`,
      { status, comments },
      config
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to update advance status:", error);
    throw error;
  }
}

export interface ProjectFiles {
  projectProposal: File[];
  signedContract: File[];
  executionMemo: File[];
  signedBudget: File[];
}

export const createProject = async (data: any, files: ProjectFiles) => {
  try {
    console.log('Creating project with data:', data);
    const config = await getAxiosConfig();
    console.log('Got axios config:', config);

    const formData = new FormData();

    // Append all file data
    if (files.projectProposal[0]) {
      console.log('Appending project proposal file');
      formData.append("projectProposal", files.projectProposal[0]);
    }
    if (files.signedContract[0]) {
      console.log('Appending signed contract file');
      formData.append("signedContract", files.signedContract[0]);
    }
    if (files.executionMemo[0]) {
      console.log('Appending execution memo file');
      formData.append("executionMemo", files.executionMemo[0]);
    }
    if (files.signedBudget[0]) {
      console.log('Appending signed budget file');
      formData.append("signedBudget", files.signedBudget[0]);
    }

    // Append form data
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof Date) {
        const dateStr = value.toISOString().split('T')[0];
        console.log(`Appending date field ${key}:`, dateStr);
        formData.append(key, dateStr);
      } else if (Array.isArray(value) || typeof value === 'object') {
        const jsonStr = JSON.stringify(value);
        console.log(`Appending object/array field ${key}:`, jsonStr);
        formData.append(key, jsonStr);
      } else {
        console.log(`Appending field ${key}:`, value);
        formData.append(key, String(value));
      }
    });

    console.log('Making API request to:', `${process.env.NEXT_PUBLIC_API_URL}/projects`);
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/projects`,
      formData,
      {
        ...config,
        headers: {
          ...config.headers,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in createProject:', error);
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || "Failed to create project";
      console.error('API Error:', errorMessage);
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export async function deleteProject(id: string): Promise<boolean> {
  try {
    const config = await getAxiosConfig();
    await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`, config);
    return true;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data.message || error;
  }
}

interface UpdateTeamMemberPayload {
  userId: string
  startDate: string
  endDate: string
  responsibilities: string[]
}

export async function getProject(id: string): Promise<Project> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`, config);
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data.message || error;
  }
}

export async function updateTeamMember(
  projectId: string,
  teamMemberId: string,
  data: UpdateTeamMemberPayload
): Promise<TeamMember> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/team-members/${teamMemberId}`,
      data,
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data.message || error;
  }
}

export async function deleteTeamMember(
  projectId: string,
  teamMemberId: string
): Promise<boolean> {
  try {
    const config = await getAxiosConfig();
    await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/team-members/${teamMemberId}`,
      config
    );
    return true;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data.message || error;
  }
}

export interface AddTeamMemberPayload {
  userId: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
}

export async function addTeamMember(
  projectId: string,
  data: AddTeamMemberPayload
): Promise<TeamMember> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/team-members`,
      data,
      config
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data.message || error;
  }
}
