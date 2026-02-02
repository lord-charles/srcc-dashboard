"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Home,
  Users2,
  DollarSign as Finance,
  AlertTriangle as Risk,
  Milestone as MilestoneIcon,
  FileText as Documents,
  Receipt,
  DollarSign,
  FileText,
} from "lucide-react";
import type { Project } from "@/types/project";
import { useRouter, useSearchParams } from "next/navigation";
import { TeamSection } from "./sections/team-section";
import { FinancialSection } from "./sections/financial-section";
import { RiskSection } from "./sections/risk-section";
import { MilestonesSection } from "./sections/milestones-section";
import { DocumentsSection } from "./sections/documents-section";
import { InvoicesSection } from "./sections/invoices-section";
import { ProjectStatCards } from "./project-stat-cards";
import ModernBudgetDisplay from "./sections/modern-budget-display";
import ProjectOverview from "./sections/project-overview";
import ContractsTable from "./sections/team-contracts-table";
import { ProjectClaimsSection } from "./sections/project-claims-section";

interface ProjectDetailsProps {
  project?: Project;
  isLoading?: boolean;
  onTeamMemberEdit?: (memberId: string) => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  project: projectData,
  isLoading = false,
  onTeamMemberEdit,
}) => {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "overview",
  );
  const router = useRouter();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (
      tab &&
      [
        "overview",
        "team",
        "coaches",
        "financial",
        "risk",
        "milestones",
        "documents",
        "invoices",
        "budget",
        "contracts",
        "claims",
      ].includes(tab)
    ) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  if (isLoading || !projectData) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
        </div>
        <div className="grid gap-4">
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("tab", value);
    router.push(newUrl.pathname + newUrl.search);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="p-2">
      <ProjectStatCards projectData={projectData} />
      <ScrollArea className="mt-4">
        <TabsList className="mb-3 h-auto -space-x-px bg-background p-0 shadow-sm shadow-black/5 rtl:space-x-reverse">
          <TabsTrigger
            value="overview"
            className="relative overflow-hidden rounded-none border border-border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
          >
            <Home
              className="-ms-0.5 me-1.5 opacity-60"
              size={16}
              strokeWidth={2}
            />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="relative overflow-hidden rounded-none border border-border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
          >
            <Users2
              className="-ms-0.5 me-1.5 opacity-60"
              size={16}
              strokeWidth={2}
            />
            Team
          </TabsTrigger>

          <TabsTrigger
            value="financial"
            className="relative overflow-hidden rounded-none border border-border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
          >
            <Finance
              className="-ms-0.5 me-1.5 opacity-60"
              size={16}
              strokeWidth={2}
            />
            Financial
          </TabsTrigger>
          <TabsTrigger
            value="risk"
            className="relative overflow-hidden rounded-none border border-border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
          >
            <Risk
              className="-ms-0.5 me-1.5 opacity-60"
              size={16}
              strokeWidth={2}
            />
            Risk
          </TabsTrigger>
          <TabsTrigger
            value="milestones"
            className="relative overflow-hidden rounded-none border border-border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
          >
            <MilestoneIcon
              className="-ms-0.5 me-1.5 opacity-60"
              size={16}
              strokeWidth={2}
            />
            Milestones
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className="relative overflow-hidden rounded-none border border-border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
          >
            <Documents
              className="-ms-0.5 me-1.5 opacity-60"
              size={16}
              strokeWidth={2}
            />
            Documents
          </TabsTrigger>
          <TabsTrigger
            value="invoices"
            className="relative overflow-hidden rounded-none border border-border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
          >
            <Receipt
              className="-ms-0.5 me-1.5 opacity-60"
              size={16}
              strokeWidth={2}
            />
            Invoices
          </TabsTrigger>
          <TabsTrigger
            value="budget"
            className="relative overflow-hidden rounded-none border border-border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
          >
            <DollarSign
              className="-ms-0.5 me-1.5 opacity-60"
              size={16}
              strokeWidth={2}
            />
            Budget
          </TabsTrigger>
          <TabsTrigger
            value="contracts"
            className="relative overflow-hidden rounded-none border border-border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
          >
            <FileText
              className="-ms-0.5 me-1.5 opacity-60"
              size={16}
              strokeWidth={2}
            />
            Contracts
          </TabsTrigger>
          <TabsTrigger
            value="claims"
            className="relative overflow-hidden rounded-none border border-border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary"
          >
            <Receipt
              className="-ms-0.5 me-1.5 opacity-60"
              size={16}
              strokeWidth={2}
            />
            Claims
          </TabsTrigger>
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <TabsContent value="overview" className="space-y-4">
        <ProjectOverview projectData={projectData} />
      </TabsContent>

      <TabsContent value="team">
        <TeamSection
          teamMembers={projectData.teamMembers}
          projectId={projectData._id}
          projectData={projectData}
        />
      </TabsContent>

      <TabsContent value="financial">
        <FinancialSection
          totalBudget={projectData.totalBudget}
          amountSpent={projectData.amountSpent}
          totalProjectValue={projectData.totalProjectValue}
          currency={projectData.currency}
          projectData={projectData}
        />
      </TabsContent>

      <TabsContent value="risk">
        <RiskSection
          riskAssessment={projectData.riskAssessment}
          riskLevel={projectData.riskLevel}
        />
      </TabsContent>

      <TabsContent value="milestones">
        <MilestonesSection
          milestones={projectData.milestones}
          currency={projectData.currency}
          projectId={projectData._id}
          projectData={projectData}
        />
      </TabsContent>

      <TabsContent value="documents">
        <DocumentsSection
          projectId={projectData._id}
          projectProposalUrl={projectData.projectProposalUrl}
          signedContractUrl={projectData.signedContractUrl}
          executionMemoUrl={projectData.executionMemoUrl}
          signedBudgetUrl={projectData.signedBudgetUrl}
          documents={projectData.documents}
        />
      </TabsContent>

      <TabsContent value="invoices">
        <InvoicesSection
          invoices={projectData.invoices}
          currency={projectData.currency}
          projectId={projectData._id}
        />
      </TabsContent>

      <TabsContent value="budget">
        <ModernBudgetDisplay
          budget={projectData.budgetId}
          currency={projectData.currency}
          projectId={projectData._id}
          teamMembers={projectData.teamMembers}
          milestones={projectData.milestones || []}
        />
      </TabsContent>

      <TabsContent value="contracts">
        <Tabs defaultValue="consultants" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="consultants">
              Consultant Contracts (
              {projectData?.teamMemberContracts?.filter(
                (c) => !c.description?.toLowerCase().includes("coach"),
              ).length || 0}
              )
            </TabsTrigger>
            <TabsTrigger value="coaches">
              Coach Contracts (
              {projectData?.teamMemberContracts?.filter((c) =>
                c.description?.toLowerCase().includes("coach"),
              ).length || 0}
              )
            </TabsTrigger>
          </TabsList>

          <TabsContent value="coaches">
            <ContractsTable
              contracts={
                projectData?.teamMemberContracts?.filter((c) =>
                  c.description?.toLowerCase().includes("coach"),
                ) || []
              }
              projectId={projectData._id}
              projectMilestones={projectData.milestones || []}
            />
          </TabsContent>

          <TabsContent value="consultants">
            <ContractsTable
              contracts={
                projectData?.teamMemberContracts?.filter(
                  (c) => !c.description?.toLowerCase().includes("coach"),
                ) || []
              }
              projectId={projectData._id}
              projectMilestones={projectData.milestones || []}
            />
          </TabsContent>
        </Tabs>
      </TabsContent>

      <TabsContent value="claims">
        <ProjectClaimsSection
          projectId={projectData._id}
          projectName={projectData.name}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ProjectDetails;
