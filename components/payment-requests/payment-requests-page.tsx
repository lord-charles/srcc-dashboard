"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PaymentRequestsTable } from "./payment-requests-table";
import { PaymentRequestDetailsSheet } from "./payment-request-details-sheet";
import { getPaymentRequests } from "@/services/payment-request.service";
import type { PaymentRequest } from "@/types/payment-request";

interface Props {
  initialRequests: PaymentRequest[];
}

export function PaymentRequestsPage({ initialRequests }: Props) {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<PaymentRequest[]>(initialRequests);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    const res = await getPaymentRequests();
    if (res.success) {
      setRequests(res.data);
      // Update selectedRequest details if sheet is currently open
      if (selectedRequest) {
        const updated = res.data.find((r) => r._id === selectedRequest._id);
        if (updated) setSelectedRequest(updated);
      }
    }
    setIsLoading(false);
  }, [selectedRequest]);

  // Keep state updated if initialRequests changes (e.g. on route navigation)
  useEffect(() => {
    setRequests(initialRequests);
  }, [initialRequests]);

  return (
    <div className="flex-1 space-y-4 p-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payment Requests</h2>
          <p className="text-sm text-muted-foreground">
            Manage, approve and audit project payment requests raised against LPOs.
          </p>
        </div>
      </div>

      <PaymentRequestsTable
        requests={requests}
        isLoading={isLoading}
        onRefresh={handleRefresh}
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
        onSuccess={handleRefresh}
      />
    </div>
  );
}
