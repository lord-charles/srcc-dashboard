import DashboardProvider from "@/app/dashboard-provider";
import { Header } from "@/components/header";
import { NewImprestPage } from "@/components/imprest/new-imprest-page";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function NewImprestRoute() {
  return (
    <DashboardProvider>
      <Header />
      <NewImprestPage />
    </DashboardProvider>
  );
}
