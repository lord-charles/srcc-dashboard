import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdvances } from "@/services/advance-service";
import DashboardProvider from "../dashboard-provider";
import AdvanceModule from "@/components/advance/advance";
import { Header } from "@/components/header";

// Disable caching for this page
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdvancePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  try {
    // const initialData = await getAdvances({});

    return (
      <DashboardProvider>
        <Header />
        {/* <AdvanceModule initialData={initialData} /> */}
      </DashboardProvider>
    );
  } catch (error) {
    console.error("Failed to fetch advances:", error);
    return (
      <DashboardProvider>
        <div>Error loading advances</div>
      </DashboardProvider>
    );
  }
}
