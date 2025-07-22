"use client";

import { useParams } from "next/navigation";
import { ConsultantProfileProvider } from "./components/consultant-context";
import { ConsultantHeader } from "./components/consultant-header";
import { ConsultantTabs } from "./components/consultant-tabs";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import DashboardProvider from "@/app/dashboard-provider";
import { Header } from "@/components/header";

export default function ConsultantProfilePage() {
  const params = useParams();
  const consultantId = params.id as string;

  return (
    <ErrorBoundary>
      <DashboardProvider>
        <Header />
        <ConsultantProfileProvider consultantId={consultantId}>
          <div className="p-2">
            <ConsultantHeader />
            <ConsultantTabs />
          </div>
        </ConsultantProfileProvider>
      </DashboardProvider>
    </ErrorBoundary>
  );
}
