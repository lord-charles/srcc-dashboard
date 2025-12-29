import DashboardProvider from "../dashboard-provider";
import { Header } from "@/components/header";
import { getMyContracts } from "@/services/contracts.service";
import MyContracts from "@/components/contracts/my-contracts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ContractsPage() {
  const initialData = await getMyContracts();
  return (
    <DashboardProvider>
      <Header />
      <MyContracts initialData={initialData} />
    </DashboardProvider>
  );

}
