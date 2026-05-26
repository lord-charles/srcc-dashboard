import DashboardProvider from "../dashboard-provider";
import { Header } from "@/components/header";
import { PaymentRequestsPage } from "@/components/payment-requests/payment-requests-page";
import { getPaymentRequests } from "@/services/payment-request.service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PaymentRequestsPageRoute() {
  const initialData = await getPaymentRequests();
  return (
    <DashboardProvider>
      <Header />
      <PaymentRequestsPage initialRequests={initialData.success ? initialData.data : []} />
    </DashboardProvider>
  );
}
