import DashboardProvider from "@/app/dashboard-provider";
import { Header } from "@/components/header";
import { getOrganizationById } from "@/services/consultant.service";
import React from "react";
import OrganizationDetailsPage from "@/components/organizations/organization-details";

async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const organizationId = resolvedParams.id;

  if (!organizationId) {
    return (
      <DashboardProvider>
        <Header />
        <div className="flex items-center justify-center h-screen">
          <p className="text-xl text-gray-600">
            Invalid organization parameter
          </p>
        </div>
      </DashboardProvider>
    );
  }

  const organization = await getOrganizationById(organizationId);

  if (!organization || !organization.success) {
    return (
      <DashboardProvider>
        <Header />
        <div className="flex items-center justify-center h-screen">
          <p className="text-xl text-gray-600">
            Organization not found or has incomplete details
          </p>
        </div>
      </DashboardProvider>
    );
  }

  return (
    <DashboardProvider>
      <Header />
      <OrganizationDetailsPage organization={organization.data} />
    </DashboardProvider>
  );
}

export default Page;
