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
import { PaymentVouchersTable } from "@/components/payment-requests/payment-vouchers-table";
import { PaymentVoucherDetailsSheet } from "@/components/payment-requests/payment-voucher-details-sheet";
import { getPaymentVouchers } from "@/services/payment-request.service";
import type { PaymentVoucher } from "@/types/payment-request";

interface Props {
  projectId: string;
  projectName: string;
}

export function ProjectPaymentVouchersSection({ projectId, projectName }: Props) {
  const { data: session } = useSession();
  const [vouchers, setVouchers] = useState<PaymentVoucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVoucher, setSelectedVoucher] = useState<PaymentVoucher | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

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
        
        if (selectedVoucher) {
          const updated = projectVouchers.find((v) => v._id === selectedVoucher._id);
          if (updated) setSelectedVoucher(updated);
        }
      }
    } catch (error) {
      console.error("Failed to fetch project payment vouchers:", error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, selectedVoucher]);

  useEffect(() => {
    fetchVouchers();
  }, [projectId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Vouchers</CardTitle>
        <CardDescription>
          All payment vouchers generated for approved requests on {projectName}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PaymentVouchersTable
          vouchers={vouchers}
          isLoading={isLoading}
          onRefresh={fetchVouchers}
          onView={(voucher) => {
            setSelectedVoucher(voucher);
            setSheetOpen(true);
          }}
        />

        <PaymentVoucherDetailsSheet
          voucher={selectedVoucher}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          userRoles={session?.user?.roles || []}
          onSuccess={fetchVouchers}
        />
      </CardContent>
    </Card>
  );
}
