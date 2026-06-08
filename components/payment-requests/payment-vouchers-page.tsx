"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PaymentVouchersTable } from "./payment-vouchers-table";
import { getPaymentVouchers } from "@/services/payment-request.service";
import type { PaymentVoucher } from "@/types/payment-request";

interface Props {
  initialVouchers: PaymentVoucher[];
}

export function PaymentVouchersPage({ initialVouchers }: Props) {
  const router = useRouter();
  const [vouchers, setVouchers] = useState<PaymentVoucher[]>(initialVouchers);
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    const res = await getPaymentVouchers();
    if (res.success) {
      setVouchers(res.data);
    }
    setIsLoading(false);
  }, []);

  // Keep state updated if initialVouchers changes
  useEffect(() => {
    setVouchers(initialVouchers);
  }, [initialVouchers]);

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payment Vouchers</h2>
          <p className="text-sm text-muted-foreground">
            Approve vouchers and record payment confirmations for supplier LPOs.
          </p>
        </div>
      </div>

      <PaymentVouchersTable
        vouchers={vouchers}
        isLoading={isLoading}
        onRefresh={handleRefresh}
        onView={(voucher) => {
          router.push(`/payment-vouchers/${voucher._id}`);
        }}
      />
    </div>
  );
}
