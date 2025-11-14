import axios, { AxiosError } from "axios";

// Client-safe OTP verification functions (no server-only APIs)
export async function verifyOtp(data: {
  email: string;
  pin: string;
  verificationType: "email" | "phone";
}): Promise<any> {
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
    return response.data;
  } catch (error: any) {
    const message =
      (error instanceof AxiosError && error.response?.data?.message) ||
      error.message ||
      "An unexpected error occurred.";
    throw new Error(message);
  }
}

export async function verifyCompanyOtp(data: {
  businessEmail: string;
  pin: string;
  verificationType: "email" | "phone";
}): Promise<any> {
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
    return response.data;
  } catch (error: any) {
    const message =
      (error instanceof AxiosError && error.response?.data?.message) ||
      error.message ||
      "An unexpected error occurred.";
    throw new Error(message);
  }
}
