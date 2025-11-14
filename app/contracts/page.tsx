import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardProvider from "../dashboard-provider";
import { Header } from "@/components/header";
import { getAllContracts } from "@/services/contracts.service";
import ContractModule from "@/components/contracts/contracts";

// Disable caching for this page
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ContractsPage() {
  const initialData = await getAllContracts();
  return (
    <DashboardProvider>
      <Header />
      <ContractModule initialData={initialData} />
    </DashboardProvider>
  );
}
