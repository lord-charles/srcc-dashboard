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
import { PaymentVouchersTable } from "@/components/payment-requests/payment-vouchers-table";
import { getPaymentVouchers } from "@/services/payment-request.service";
import type { PaymentVoucher } from "@/types/payment-request";

interface Props {
  projectId: string;
  projectName: string;
}

export function ProjectPaymentVouchersSection({ projectId, projectName }: Props) {
  const router = useRouter();
  const [vouchers, setVouchers] = useState<PaymentVoucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVouchers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getPaymentVouchers();
      if (res.success) {
        // Filter by project ID since backend doesn't filter directly
        const projectVouchers = res.data.filter((v) => {
          const pr = v.paymentRequestId as any;
          const prProjId = pr?.projectId?._id || pr?.projectId;
          return prProjId === projectId;
        });
        setVouchers(projectVouchers);
      }
    } catch (error) {
      console.error("Failed to fetch project payment vouchers:", error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchVouchers();
  }, [projectId]);

  return (
    <div>
        <PaymentVouchersTable
          vouchers={vouchers}
          isLoading={isLoading}
          onRefresh={fetchVouchers}
          onView={(voucher) => {
            router.push(`/payment-vouchers/${voucher._id}`);
          }}
        />
    </div>
  );
}
