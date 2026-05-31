import axios, { AxiosError } from "axios";
import { getAxiosConfig, handleUnauthorized } from "./dashboard.service";
import type {
  PaymentRequest,
  PaymentVoucher,
  CreatePaymentRequestPayload,
  ApprovePayload,
  RejectPayload,
  RevisionPayload,
  CreateVoucherPayload,
  PayVoucherPayload,
} from "@/types/payment-request";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractError(error: any, fallback: string): string {
  const msg = error?.response?.data?.message || error?.message || fallback;
  return typeof msg === "string"
    ? msg
    : Array.isArray(msg)
      ? msg[0]
      : JSON.stringify(msg);
}

async function withAuth<T>(fn: (config: any) => Promise<T>): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const config = await getAxiosConfig();
    const data = await fn(config);
    return { success: true, data };
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.status === 401) {
      await handleUnauthorized();
    }
    return { success: false, error: extractError(error, "An unexpected error occurred") };
  }
}

// ─── Payment Requests ─────────────────────────────────────────────────────────

export async function getPaymentRequests(filters?: { projectId?: string; lpoId?: string; status?: string }) {
  return withAuth<PaymentRequest[]>(async (config) => {
    const params: Record<string, string> = {};
    if (filters?.projectId) params.projectId = filters.projectId;
    if (filters?.lpoId) params.lpoId = filters.lpoId;
    if (filters?.status) params.status = filters.status;
    const { data } = await axios.get(`${API_URL}/payment-requests`, { ...config, params });
    return data;
  });
}

export async function getPaymentRequestById(id: string) {
  return withAuth<PaymentRequest>(async (config) => {
    const { data } = await axios.get(`${API_URL}/payment-requests/${id}`, config);
    return data;
  });
}

export async function getLpoRemainingBalance(lpoId: string, excludeRequestId?: string) {
  return withAuth<{ balance: number }>(async (config) => {
    const params: Record<string, string> = {};
    if (excludeRequestId) params.excludeRequestId = excludeRequestId;
    const { data } = await axios.get(`${API_URL}/payment-requests/remaining-balance/${lpoId}`, { ...config, params });
    return data;
  });
}

export async function createPaymentRequest(payload: CreatePaymentRequestPayload) {
  return withAuth<PaymentRequest>(async (config) => {
    const { data } = await axios.post(`${API_URL}/payment-requests`, payload, config);
    return data;
  });
}

export async function updatePaymentRequest(id: string, payload: CreatePaymentRequestPayload) {
  return withAuth<PaymentRequest>(async (config) => {
    const { data } = await axios.put(`${API_URL}/payment-requests/${id}`, payload, config);
    return data;
  });
}

export async function approvePaymentRequest(id: string, payload: ApprovePayload) {
  return withAuth<PaymentRequest>(async (config) => {
    const { data } = await axios.post(`${API_URL}/payment-requests/${id}/approve`, payload, config);
    return data;
  });
}

export async function rejectPaymentRequest(id: string, payload: RejectPayload) {
  return withAuth<PaymentRequest>(async (config) => {
    const { data } = await axios.post(`${API_URL}/payment-requests/${id}/reject`, payload, config);
    return data;
  });
}

export async function requestPaymentRequestRevision(id: string, payload: RevisionPayload) {
  return withAuth<PaymentRequest>(async (config) => {
    const { data } = await axios.post(`${API_URL}/payment-requests/${id}/request-revision`, payload, config);
    return data;
  });
}

// ─── Payment Vouchers ─────────────────────────────────────────────────────────

export async function getPaymentVouchers(filters?: { status?: string; paymentRequestId?: string }) {
  return withAuth<PaymentVoucher[]>(async (config) => {
    const params: Record<string, string> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.paymentRequestId) params.paymentRequestId = filters.paymentRequestId;
    const { data } = await axios.get(`${API_URL}/payment-requests/vouchers/all`, { ...config, params });
    return data;
  });
}

export async function getPaymentVoucherById(id: string) {
  return withAuth<PaymentVoucher>(async (config) => {
    const { data } = await axios.get(`${API_URL}/payment-requests/vouchers/${id}`, config);
    return data;
  });
}

export async function createPaymentVoucher(payload: CreateVoucherPayload) {
  return withAuth<PaymentVoucher>(async (config) => {
    const { data } = await axios.post(`${API_URL}/payment-requests/vouchers`, payload, config);
    return data;
  });
}

export async function updatePaymentVoucher(id: string, payload: CreateVoucherPayload) {
  return withAuth<PaymentVoucher>(async (config) => {
    const { data } = await axios.put(`${API_URL}/payment-requests/vouchers/${id}`, payload, config);
    return data;
  });
}

export async function approvePaymentVoucher(id: string, payload: ApprovePayload) {
  return withAuth<PaymentVoucher>(async (config) => {
    const { data } = await axios.post(`${API_URL}/payment-requests/vouchers/${id}/approve`, payload, config);
    return data;
  });
}

export async function rejectPaymentVoucher(id: string, payload: RejectPayload) {
  return withAuth<PaymentVoucher>(async (config) => {
    const { data } = await axios.post(`${API_URL}/payment-requests/vouchers/${id}/reject`, payload, config);
    return data;
  });
}

export async function requestVoucherRevision(id: string, payload: RevisionPayload) {
  return withAuth<PaymentVoucher>(async (config) => {
    const { data } = await axios.post(`${API_URL}/payment-requests/vouchers/${id}/request-revision`, payload, config);
    return data;
  });
}

export async function payVoucher(id: string, payload: PayVoucherPayload) {
  return withAuth<PaymentVoucher>(async (config) => {
    const { data } = await axios.post(`${API_URL}/payment-requests/vouchers/${id}/pay`, payload, config);
    return data;
  });
}
