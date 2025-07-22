"use client";
import type React from "react";
import { useParams } from "next/navigation";
import { ProfileHeader } from "../profile/profile-header";
import { ProfileTabs } from "../profile/profile-tabs";
import { ProfileProvider } from "../profile/profile-context";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import DashboardProvider from "@/app/dashboard-provider";
import { Header } from "@/components/header";

export default function ConsultantProfilePage() {
  const params = useParams();
  const organizationId = params.id as string;
  return (
    <ErrorBoundary>
      <DashboardProvider>
        <Header />
        <ProfileProvider organizationId={organizationId}>
          <div className="p-2">
            <ProfileHeader />
            <ProfileTabs />
          </div>
        </ProfileProvider>
        <Toaster />
      </DashboardProvider>
    </ErrorBoundary>
  );
}
