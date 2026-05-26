"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PaymentRequestsTable } from "@/components/payment-requests/payment-requests-table";
import { PaymentRequestDetailsSheet } from "@/components/payment-requests/payment-request-details-sheet";
import { getPaymentRequests } from "@/services/payment-request.service";
import type { PaymentRequest } from "@/types/payment-request";

interface Props {
  projectId: string;
  projectName: string;
}

export function ProjectPaymentRequestsSection({ projectId, projectName }: Props) {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getPaymentRequests({ projectId });
      if (res.success) {
        setRequests(res.data);
        if (selectedRequest) {
          const updated = res.data.find((r) => r._id === selectedRequest._id);
          if (updated) setSelectedRequest(updated);
        }
      }
    } catch (error) {
      console.error("Failed to fetch project payment requests:", error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, selectedRequest]);

  useEffect(() => {
    fetchRequests();
  }, [projectId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Requests</CardTitle>
        <CardDescription>
          All payment requests raised against approved LPOs for {projectName}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PaymentRequestsTable
          requests={requests}
          isLoading={isLoading}
          onRefresh={fetchRequests}
          showProjectColumn={false}
          onView={(request) => {
            setSelectedRequest(request);
            setSheetOpen(true);
          }}
        />

        <PaymentRequestDetailsSheet
          request={selectedRequest}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          userRoles={session?.user?.roles || []}
          onSuccess={fetchRequests}
        />
      </CardContent>
    </Card>
  );
}
