import DashboardProvider from "../../dashboard-provider";
import { Header } from "@/components/header";
import { getPaymentVoucherById } from "@/services/payment-request.service";
import { PaymentVoucherDetailsPage } from "@/components/payment-requests/payment-voucher-details-page";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{
    voucherId: string;
  }>;
}

export default async function PaymentVoucherDetailsRoute({ params }: Props) {
  const { voucherId } = await params;
  const res = await getPaymentVoucherById(voucherId);
  if (!res.success || !res.data) {
    redirect("/payment-vouchers");
  }
  return (
    <DashboardProvider>
      <Header />
      <PaymentVoucherDetailsPage initialVoucher={res.data} />
    </DashboardProvider>
  );
}
