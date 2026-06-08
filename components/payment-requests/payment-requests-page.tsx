"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PaymentRequestsTable } from "./payment-requests-table";
import { getPaymentRequests } from "@/services/payment-request.service";
import type { PaymentRequest } from "@/types/payment-request";

interface Props {
  initialRequests: PaymentRequest[];
}

export function PaymentRequestsPage({ initialRequests }: Props) {
  const router = useRouter();
  const [requests, setRequests] = useState<PaymentRequest[]>(initialRequests);
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    const res = await getPaymentRequests();
    if (res.success) {
      setRequests(res.data);
    }
    setIsLoading(false);
  }, []);

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
          router.push(`/payment-requests/${request._id}`);
        }}
      />
    </div>
  );
}
