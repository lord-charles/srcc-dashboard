"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PaymentVouchersTable } from "./payment-vouchers-table";
import { PaymentVoucherDetailsSheet } from "./payment-voucher-details-sheet";
import { getPaymentVouchers } from "@/services/payment-request.service";
import type { PaymentVoucher } from "@/types/payment-request";

interface Props {
  initialVouchers: PaymentVoucher[];
}

export function PaymentVouchersPage({ initialVouchers }: Props) {
  const { data: session } = useSession();
  const [vouchers, setVouchers] = useState<PaymentVoucher[]>(initialVouchers);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<PaymentVoucher | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    const res = await getPaymentVouchers();
    if (res.success) {
      setVouchers(res.data);
      // Update selectedVoucher details if sheet is currently open
      if (selectedVoucher) {
        const updated = res.data.find((v) => v._id === selectedVoucher._id);
        if (updated) setSelectedVoucher(updated);
      }
    }
    setIsLoading(false);
  }, [selectedVoucher]);

  // Keep state updated if initialVouchers changes
  useEffect(() => {
    setVouchers(initialVouchers);
  }, [initialVouchers]);

  return (
    <div className="flex-1 space-y-4 p-2">
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
          setSelectedVoucher(voucher);
          setSheetOpen(true);
        }}
      />

      <PaymentVoucherDetailsSheet
        voucher={selectedVoucher}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        userRoles={session?.user?.roles || []}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
