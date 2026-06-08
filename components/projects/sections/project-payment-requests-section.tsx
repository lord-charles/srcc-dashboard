"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PaymentRequestsTable } from "@/components/payment-requests/payment-requests-table";
import { getPaymentRequests } from "@/services/payment-request.service";
import type { PaymentRequest } from "@/types/payment-request";

interface Props {
  projectId: string;
  projectName: string;
}

export function ProjectPaymentRequestsSection({ projectId, projectName }: Props) {
  const router = useRouter();
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getPaymentRequests({ projectId });
      if (res.success) {
        setRequests(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch project payment requests:", error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchRequests();
  }, [projectId]);

  return (
    <div>
        <PaymentRequestsTable
          requests={requests}
          isLoading={isLoading}
          onRefresh={fetchRequests}
          showProjectColumn={false}
          onView={(request) => {
            router.push(`/payment-requests/${request._id}`);
          }}
        />
    </div>
  );
}
