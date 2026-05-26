import DashboardProvider from "../dashboard-provider";
import { Header } from "@/components/header";
import { PaymentVouchersPage } from "@/components/payment-requests/payment-vouchers-page";
import { getPaymentVouchers } from "@/services/payment-request.service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PaymentVouchersPageRoute() {
  const initialData = await getPaymentVouchers();
  return (
    <DashboardProvider>
      <Header />
      <PaymentVouchersPage initialVouchers={initialData.success ? initialData.data : []} />
    </DashboardProvider>
  );
}
