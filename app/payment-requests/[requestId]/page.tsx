import DashboardProvider from "../../dashboard-provider";
import { Header } from "@/components/header";
import { getPaymentRequestById } from "@/services/payment-request.service";
import { PaymentRequestDetailsPage } from "@/components/payment-requests/payment-request-details-page";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: {
    requestId: string;
  };
}

export default async function PaymentRequestDetailsRoute({ params }: Props) {
  const res = await getPaymentRequestById(params.requestId);
  if (!res.success || !res.data) {
    redirect("/payment-requests");
  }
  return (
    <DashboardProvider>
      <Header />
      <PaymentRequestDetailsPage initialRequest={res.data} />
    </DashboardProvider>
  );
}
