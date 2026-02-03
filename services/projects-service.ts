"use server";

import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";
import { Project, TeamMember } from "@/types/project";
import { redirect } from "next/navigation";

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

// Coaches and related roles
export interface CoachContractPayload {
  rate: number;
  rateUnit: "per_session" | "per_hour";
  currency?: "KES" | "USD";
  notes?: string;
}

export interface AddCoachPayload {
  userId: string;
  milestoneId?: string;
  startDate?: string;
  endDate?: string;
  responsibilities?: string[];
  contract: CoachContractPayload;
}

export async function addCoach(
  projectId: string,
  milestoneId: string,
  data: AddCoachPayload,
): Promise<Project> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/milestones/${milestoneId}/coaches`,
      data,
      config,
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data?.message || error;
  }
}

export async function updateCoach(
  projectId: string,
  milestoneId: string,
  coachUserId: string,
  data: Partial<AddCoachPayload>,
): Promise<Project> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/milestones/${milestoneId}/coaches/${coachUserId}`,
      data,
      config,
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data?.message || error;
  }
}

export async function deleteCoach(
  projectId: string,
  milestoneId: string,
  coachUserId: string,
): Promise<boolean> {
  try {
    const config = await getAxiosConfig();
    await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/milestones/${milestoneId}/coaches/${coachUserId}`,
      config,
    );
    return true;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data?.message || error;
  }
}

export async function addCoachManager(
  projectId: string,
  userId: string,
  responsibilities: string[] = [],
): Promise<Project> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/coach-managers`,
      { userId, responsibilities },
      config,
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data?.message || error;
  }
}

export async function updateCoachManager(
  projectId: string,
  managerUserId: string,
  responsibilities: string[],
): Promise<Project> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/coach-managers/${managerUserId}`,
      { responsibilities },
      config,
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data?.message || error;
  }
}

export async function deleteCoachManager(
  projectId: string,
  managerUserId: string,
): Promise<Project> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/coach-managers/${managerUserId}`,
      config,
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data?.message || error;
  }
}

export async function addCoachAssistant(
  projectId: string,
  userId: string,
  responsibilities: string[] = [],
): Promise<Project> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/coach-assistants`,
      { userId, responsibilities },
      config,
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data?.message || error;
  }
}

export async function updateCoachAssistant(
  projectId: string,
  assistantUserId: string,
  responsibilities: string[],
): Promise<Project> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/coach-assistants/${assistantUserId}`,
      { responsibilities },
      config,
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data?.message || error;
  }
}

export async function deleteCoachAssistant(
  projectId: string,
  assistantUserId: string,
): Promise<Project> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/coach-assistants/${assistantUserId}`,
      config,
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data?.message || error;
  }
}

export interface ProjectDocumentPayload {
  name: string;
  url: string;
}

export async function addProjectDocument(
  projectId: string,
  document: ProjectDocumentPayload,
): Promise<Project> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/documents`,
      document,
      config,
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data.message || error;
  }
}

export async function updateProject(
  projectId: string,
  data: Partial<Project>,
): Promise<Project> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}`,
      data,
      config,
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data.message || error;
  }
}

export async function handleUnauthorized() {
  redirect("/unauthorized");
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
      config,
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to fetch projects:", error);
    return null;
  }
}

export async function getProjectById(id: string) {
  try {
    const config = await getAxiosConfig();
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`,
      config,
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

export interface ProjectFiles {
  projectProposal: File[];
  signedContract: File[];
  executionMemo: File[];
  signedBudget: File[];
}

export const createProject = async (data: any) => {
  try {
    const config = await getAxiosConfig();

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/projects`,
      data,
      config,
    );

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message || "Failed to create project";
      throw new Error(errorMessage);
    }
    throw error?.response?.data.message || error;
  }
};

export async function deleteProject(id: string): Promise<boolean> {
  try {
    const config = await getAxiosConfig();
    await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`,
      config,
    );
    return true;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data.message || error;
  }
}

interface UpdateTeamMemberPayload {
  userId: string;
  milestoneId?: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
}

export async function getProject(id: string): Promise<Project> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`,
      config,
    );
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
  data: UpdateTeamMemberPayload,
): Promise<TeamMember> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/team-members/${teamMemberId}`,
      data,
      config,
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
  teamMemberId: string,
): Promise<boolean> {
  try {
    const config = await getAxiosConfig();
    const res = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/team-members/${teamMemberId}`,
      config,
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
  userId?: string;
  milestoneId?: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
}

export async function addTeamMember(
  projectId: string,
  data: AddTeamMemberPayload,
): Promise<TeamMember> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/team-members`,
      data,
      config,
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data.message || error;
  }
}

// Milestone-specific team member methods
export async function addTeamMemberToMilestone(
  projectId: string,
  milestoneId: string,
  data: AddTeamMemberPayload,
): Promise<TeamMember> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/milestones/${milestoneId}/team-members`,
      data,
      config,
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data.message || error;
  }
}

export async function updateTeamMemberInMilestone(
  projectId: string,
  milestoneId: string,
  teamMemberId: string,
  data: AddTeamMemberPayload,
): Promise<TeamMember> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/milestones/${milestoneId}/team-members/${teamMemberId}`,
      data,
      config,
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data.message || error;
  }
}

export async function removeTeamMemberFromMilestone(
  projectId: string,
  milestoneId: string,
  teamMemberId: string,
): Promise<boolean> {
  try {
    const config = await getAxiosConfig();
    await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/milestones/${milestoneId}/team-members/${teamMemberId}`,
      config,
    );
    return true;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data.message || error;
  }
}

export async function updateProjectManager(
  projectId: string,
  projectManagerId: string,
): Promise<Project | null> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/project-manager`,
      { projectManagerId },
      config,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to update project manager:", error);
    return null;
  }
}

export async function addAssistantProjectManager(
  projectId: string,
  userId: string,
  responsibilities: string[],
  contractId?: string,
): Promise<Project | null> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/assistant-project-managers`,
      { userId, responsibilities, contractId },
      config,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to add assistant project manager:", error);
    throw error;
  }
}

export async function removeAssistantProjectManager(
  projectId: string,
  assistantUserId: string,
): Promise<Project | null> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/assistant-project-managers/${assistantUserId}`,
      config,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to remove assistant project manager:", error);
    throw error;
  }
}

export interface Milestone {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  completionDate?: string;
  budget: number;
  actualCost?: number;
}

export interface AddMilestonePayload {
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  completionDate?: string;
  budget: number;
  actualCost?: number;
}

export interface UpdateMilestonePayload extends Partial<
  Omit<AddMilestonePayload, "completionDate" | "actualCost">
> {
  completionDate?: string;
  actualCost?: number;
}

export async function addMilestone(
  projectId: string,
  data: AddMilestonePayload,
): Promise<Project> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/milestones`,
      data,
      config,
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data.message || "Failed to add milestone";
  }
}

export async function updateMilestone(
  projectId: string,
  milestoneId: string,
  data: UpdateMilestonePayload,
): Promise<Project> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/milestones/${milestoneId}`,
      data,
      config,
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data.message || "Failed to update milestone";
  }
}

export async function deleteMilestone(
  projectId: string,
  milestoneId: string,
): Promise<Project> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/milestones/${milestoneId}`,
      config,
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    throw error?.response?.data.message || "Failed to delete milestone";
  }
}

export async function createContract(contractData: any): Promise<any> {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/contracts`,
      contractData,
      config,
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to create contract:", error);
    throw error?.response?.data.message || "Failed to create contract";
  }
}
