"use server";

import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";
import { handleUnauthorized } from "./dashboard.service";

const getAxiosConfig = async (isMultipart = false) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  return {
    headers: {
      Authorization: token ? `Bearer ${token.value}` : "",
      "Content-Type": isMultipart ? "multipart/form-data" : "application/json",
    },
  };
};

export async function registerConsultant(formData: FormData) {
  try {
    const config = await getAxiosConfig(true);
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/consultants/register`,
      formData,
      {
        ...config,
        headers: {
          ...config.headers,
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Consultant registration error:", error);
    const message = error.response?.data?.message || error.message || "Consultant registration failed";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function approveConsultant(
  consultantId: string,
) {
  try {
    const config = await getAxiosConfig();
    await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/consultants/${consultantId}/approve`,
      {},
      config,
    );
    return { success: true as const, data: true };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to approve consultant:", error);
    const message = error.response?.data?.message || error.message || "Failed to approve consultant";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function rejectConsultant(consultantId: string) {
  try {
    const config = await getAxiosConfig();
    await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/consultants/${consultantId}/reject`,
      {},
      config,
    );
    return { success: true as const, data: true };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Failed to reject consultant:", error);
    const message = error.response?.data?.message || error.message || "Failed to reject consultant";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function requestPasswordReset(email: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password/request`,
      { email },
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Password reset request error:", error);
    const message = error.response?.data?.message || error.message || "Password reset request failed";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function registerOrganization(formData: FormData) {
  try {
    const config = await getAxiosConfig(true);
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/consultants/organization/register`,
      formData,
      {
        ...config,
        headers: {
          ...config.headers,
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Organization registration error:", error);
    const message = error.response?.data?.message || error.message || "Organization registration failed";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function quickRegister(data: {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationalId: string;
  password: string;
}) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/consultants/quick-register`,
      data,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Quick registration error:", error);
    const message = error.response?.data?.message || error.message || "Quick registration failed";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function quickCompanyRegister(data: {
  businessEmail: string;
  businessPhone: string;
  registrationNumber: string;
  kraPin: string;
  password: string;
}) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/consultants/quick-company-register`,
      data,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Quick company registration error:", error);
    const message = error.response?.data?.message || error.message || "Quick company registration failed";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function verifyOtp(data: {
  email: string;
  pin: string;
  verificationType: "email" | "phone";
}) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/consultants/verify-otp`,
      data,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("OTP verification error:", error);
    const message = error.response?.data?.message || error.message || "OTP verification failed";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function verifyCompanyOtp(data: {
  businessEmail: string;
  pin: string;
  verificationType: "email" | "phone";
}) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/consultants/company/verify-otp`,
      data,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Company OTP verification error:", error);
    const message = error.response?.data?.message || error.message || "Company OTP verification failed";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export const verifyEmailOtp = async (email: string, pin: string) =>
  verifyOtp({ email, pin, verificationType: "email" });

export const verifyPhoneOtp = async (email: string, pin: string) =>
  verifyOtp({ email, pin, verificationType: "phone" });

export async function getVerificationStatus(
  email: string,
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/consultants/verification-status`,
      {
        ...config,
        params: { email },
      },
    );
    return { success: true as const, data: response.data as { isEmailVerified: boolean; isPhoneVerified: boolean } };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Get verification status error:", error);
    const message = error.response?.data?.message || error.message || "Failed to get verification status";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function getCompanyVerificationStatus(
  businessEmail: string,
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/consultants/company/verification-status`,
      {
        ...config,
        params: { businessEmail },
      },
    );
    return { success: true as const, data: response.data as { isEmailVerified: boolean; isPhoneVerified: boolean } };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error("Get company verification status error:", error);
    const message = error.response?.data?.message || error.message || "Failed to get company verification status";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function getOrganization(id: string) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/consultants/organization/${id}`,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to fetch organization ${id}:`, error);
    const message = error.response?.data?.message || error.message || "Failed to fetch organization";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function updateOrganization(id: string, data: any) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/consultants/organization/update/${id}`,
      data,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to update organization ${id}:`, error);
    const message = error.response?.data?.message || error.message || "Failed to update organization";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function getConsultant(id: string) {
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
    console.error(`Failed to fetch consultant ${id}:`, error);
    const message = error.response?.data?.message || error.message || "Failed to fetch consultant";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function updateConsultant(id: string, data: any) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/consultants/consultant/update/${id}`,
      data,
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to update consultant ${id}:`, error);
    const message = error.response?.data?.message || error.message || "Failed to update consultant";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function completeConsultantRegistration(
  consultantId: string,
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/consultants/${consultantId}/complete-registration`,
      {},
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to complete consultant registration ${consultantId}:`, error);
    const message = error.response?.data?.message || error.message || "Failed to complete registration";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function completeOrganizationRegistration(
  organizationId: string,
) {
  try {
    const config = await getAxiosConfig();
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/consultants/organization/${organizationId}/complete-registration`,
      {},
      config,
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to complete organization registration ${organizationId}:`, error);
    const message = error.response?.data?.message || error.message || "Failed to complete registration";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}

export async function manualVerifyConsultant(
  consultantId: string,
) {
  try {
    const config = await getAxiosConfig();
    await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/consultants/${consultantId}/manual-verify`,
      {},
      config,
    );
    return { success: true as const, data: true };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    console.error(`Failed to manually verify consultant ${consultantId}:`, error);
    const message = error.response?.data?.message || error.message || "Failed to verify consultant";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}
