import axios, { AxiosError } from "axios";

// Client-safe OTP verification functions (no server-only APIs)
export async function verifyOtp(data: {
  email: string;
  pin: string;
  verificationType: "email" | "phone";
}) {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/consultants/verify-otp`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    console.error("Failed to verify OTP:", error);
    const message = error instanceof AxiosError && error.response?.data?.message
      ? error.response.data.message
      : error.message || "An unexpected error occurred.";
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
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/consultants/company/verify-otp`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return { success: true as const, data: response.data };
  } catch (error: any) {
    console.error("Failed to verify company OTP:", error);
    const message = error instanceof AxiosError && error.response?.data?.message
      ? error.response.data.message
      : error.message || "An unexpected error occurred.";
    return { 
      success: false as const, 
      error: typeof message === 'string' ? message : Array.isArray(message) ? message[0] : JSON.stringify(message) 
    };
  }
}
