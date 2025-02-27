import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardProvider from "../dashboard-provider";
import { Header } from "@/components/header";
import { getMyContracts } from "@/services/contracts.service";
import MyContracts from "@/components/contracts/my-contracts";

// Disable caching for this page
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ContractsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  try {
    const initialData = await getMyContracts();
    return (
      <DashboardProvider>
        <Header />
        <MyContracts initialData={initialData} />
      </DashboardProvider>
    );
  } catch (error) {
    console.error("Failed to fetch my contracts:", error);
    return (
      <DashboardProvider>
        <div>Error loading contracts</div>
      </DashboardProvider>
    );
  }
}
