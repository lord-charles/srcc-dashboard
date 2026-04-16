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
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/milestones/${milestoneId}/coaches`,
      data,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to add coach:", error);
    const message =
      error?.response?.data?.message || error?.message || "Failed to add coach";
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

export async function updateCoach(
  projectId: string,
  milestoneId: string,
  coachUserId: string,
  data: Partial<AddCoachPayload>,
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/milestones/${milestoneId}/coaches/${coachUserId}`,
      data,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to update coach:", error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to update coach";
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

export async function deleteCoach(
  projectId: string,
  milestoneId: string,
  coachUserId: string,
) {
  try {
    const config = await getAxiosConfig();
    await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/milestones/${milestoneId}/coaches/${coachUserId}`,
      config,
    );
    return { success: true as const, data: true };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to delete coach:", error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to delete coach";
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

export async function addCoachManager(
  projectId: string,
  userId: string,
  responsibilities: string[] = [],
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/ coach-managers`,
      { userId, responsibilities },
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to add coach manager:", error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to add coach manager";
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

export async function updateCoachManager(
  projectId: string,
  managerUserId: string,
  responsibilities: string[],
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/coach-managers/${managerUserId}`,
      { responsibilities },
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to update coach manager:", error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to update coach manager";
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

export async function deleteCoachManager(
  projectId: string,
  managerUserId: string,
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/coach-managers/${managerUserId}`,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to delete coach manager:", error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to delete coach manager";
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

export async function addCoachAssistant(
  projectId: string,
  userId: string,
  responsibilities: string[] = [],
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/coach-assistants`,
      { userId, responsibilities },
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to add coach assistant:", error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to add coach assistant";
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

export async function updateCoachAssistant(
  projectId: string,
  assistantUserId: string,
  responsibilities: string[],
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/coach-assistants/${assistantUserId}`,
      { responsibilities },
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to update coach assistant:", error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to update coach assistant";
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

export async function deleteCoachAssistant(
  projectId: string,
  assistantUserId: string,
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/coach-assistants/${assistantUserId}`,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to delete coach assistant:", error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to delete coach assistant";
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

export interface ProjectDocumentPayload {
  name: string;
  url: string;
  type: string;
  folder?: string;
}

export async function addProjectDocument(
  projectId: string,
  document: ProjectDocumentPayload,
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/documents`,
      document,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to add project document:", error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to add project document";
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

export async function updateProject(projectId: string, data: Partial<Project>) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}`,
      data,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to update project:", error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to update project";
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

export async function updateProjectDetails(projectId: string, data: any) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/details`,
      data,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to update project details:", error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to update project details";
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
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to fetch projects:", error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch projects";
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

export async function getProjectById(id: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to fetch project details for ${id}:`, error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch project details";
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

    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to create project:", error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to create project";
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
};

export async function deleteProject(id: string) {
  try {
    const config = await getAxiosConfig();
    await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`,
      config,
    );
    return { success: true as const, data: true };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to delete project ${id}:`, error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to delete project";
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

interface UpdateTeamMemberPayload {
  userId: string;
  milestoneId?: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
}

export async function getProject(id: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to fetch project ${id}:`, error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch project";
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

export async function updateTeamMember(
  projectId: string,
  teamMemberId: string,
  data: UpdateTeamMemberPayload,
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/team-members/${teamMemberId}`,
      data,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(
      `Failed to update team member ${teamMemberId} in project ${projectId}:`,
      error,
    );
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to update team member";
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

export async function deleteTeamMember(
  projectId: string,
  teamMemberId: string,
) {
  try {
    const config = await getAxiosConfig();
    await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/team-members/${teamMemberId}`,
      config,
    );
    return { success: true as const, data: true };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(
      `Failed to delete team member ${teamMemberId} from project ${projectId}:`,
      error,
    );
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to delete team member";
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

export interface AddTeamMemberPayload {
  userId?: string;
  organizationId?: string;
  milestoneId?: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
}

export async function addTeamMember(
  projectId: string,
  data: AddTeamMemberPayload,
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/team-members`,
      data,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(
      `Failed to add team member to project ${projectId}:`,
      error.response.data,
    );
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to add team member";
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

// Milestone-specific team member methods
export async function addTeamMemberToMilestone(
  projectId: string,
  milestoneId: string,
  data: AddTeamMemberPayload,
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/milestones/${milestoneId}/team-members`,
      data,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(
      `Failed to add team member to milestone ${milestoneId} in project ${projectId}:`,
      error.response.data,
    );
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to add team member to milestone";
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

export async function updateTeamMemberInMilestone(
  projectId: string,
  milestoneId: string,
  teamMemberId: string,
  data: AddTeamMemberPayload,
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/milestones/${milestoneId}/team-members/${teamMemberId}`,
      data,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(
      `Failed to update team member ${teamMemberId} in milestone ${milestoneId} in project ${projectId}:`,
      error,
    );
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to update team member in milestone";
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

export async function removeTeamMemberFromMilestone(
  projectId: string,
  milestoneId: string,
  teamMemberId: string,
) {
  try {
    const config = await getAxiosConfig();
    await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/milestones/${milestoneId}/team-members/${teamMemberId}`,
      config,
    );
    return { success: true as const, data: true };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(
      `Failed to remove team member ${teamMemberId} from milestone ${milestoneId} in project ${projectId}:`,
      error,
    );
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to remove team member from milestone";
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

export async function updateProjectManager(
  projectId: string,
  projectManagerId: string,
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/project-manager`,
      { projectManagerId },
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(
      `Failed to update project manager for project ${projectId}:`,
      error,
    );
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to update project manager";
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

export async function addAssistantProjectManager(
  projectId: string,
  userId: string,
  responsibilities: string[],
  contractId?: string,
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/assistant-project-managers`,
      { userId, responsibilities, contractId },
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(
      `Failed to add assistant project manager to project ${projectId}:`,
      error,
    );
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to add assistant PM";
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

export async function removeAssistantProjectManager(
  projectId: string,
  assistantUserId: string,
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/assistant-project-managers/${assistantUserId}`,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(
      `Failed to remove assistant project manager ${assistantUserId} from project ${projectId}:`,
      error,
    );
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to remove assistant PM";
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

export interface Milestone {
  _id: string;
  title: string;
  description: string;
  startDate?: string;
  dueDate: string;
  completed: boolean;
  completionDate?: string;
  budget: number;
  actualCost?: number;
  percentage?: number;
}

export interface AddMilestonePayload {
  title: string;
  description: string;
  startDate?: string;
  dueDate: string;
  completed: boolean;
  completionDate?: string;
  budget: number;
  actualCost?: number;
  percentage?: number;
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
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/milestones`,
      data,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to add milestone to project ${projectId}:`, error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to add milestone";
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

export async function updateMilestone(
  projectId: string,
  milestoneId: string,
  data: UpdateMilestonePayload,
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/milestones/${milestoneId}`,
      data,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(
      `Failed to update milestone ${milestoneId} in project ${projectId}:`,
      error,
    );
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to update milestone";
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

export async function deleteMilestone(projectId: string, milestoneId: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/milestones/${milestoneId}`,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(
      `Failed to delete milestone ${milestoneId} from project ${projectId}:`,
      error,
    );
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to delete milestone";
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

export async function createContract(contractData: any) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/contracts`,
      contractData,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to create contract:", error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to create contract";
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

export async function updateProjectDocument(
  projectId: string,
  documentId: string,
  documentData: any,
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/documents/${documentId}`,
      documentData,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(
      `Failed to update document ${documentId} in project ${projectId}:`,
      error,
    );
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to update document";
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

export async function deleteProjectDocument(
  projectId: string,
  documentId: string,
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/documents/${documentId}`,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(
      `Failed to delete document ${documentId} from project ${projectId}:`,
      error,
    );
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to delete document";
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

export async function addDocumentFolder(
  projectId: string,
  folderName: string,
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/document-folders`,
      { folderName },
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(
      `Failed to add folder ${folderName} to project ${projectId}:`,
      error,
    );
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to add document folder";
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

export async function deleteDocumentFolder(
  projectId: string,
  folderName: string,
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/document-folders/${encodeURIComponent(folderName)}`,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(
      `Failed to delete folder ${folderName} from project ${projectId}:`,
      error,
    );
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to delete document folder";
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
