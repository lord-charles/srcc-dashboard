"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Receipt } from "lucide-react";
import { getClaimsByProject } from "@/services/claims.service";
import { Claim } from "@/types/claim";
import ClaimTable from "@/components/claims/claims-table/claim";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProjectClaimsSectionProps {
  projectId: string;
  projectName: string;
}

export function ProjectClaimsSection({
  projectId,
  projectName,
}: ProjectClaimsSectionProps) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        setIsLoading(true);
        const data = await getClaimsByProject(projectId);
        setClaims(data);
      } catch (error) {
        console.error("Failed to fetch project claims:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClaims();
  }, [projectId]);

  // Group claims by milestone
  const groupClaimsByMilestone = (claimsList: Claim[]) => {
    const groups: Record<
      string,
      {
        milestone: any;
        milestoneName: string;
        claims: Claim[];
      }
    > = {};

    claimsList.forEach((claim) => {
      // Check if claim has milestones array (direct claim milestones)
      if (claim.milestones && claim.milestones.length > 0) {
        // Group by each milestone in the claim
        claim.milestones.forEach((claimMilestone: any) => {
          const milestoneId =
            claimMilestone.milestoneId?.toString() ||
            claimMilestone.milestoneId;

          // Find the full milestone data from projectId.milestones
          const fullMilestone = (claim.projectId as any)?.milestones?.find(
            (m: any) => m._id.toString() === milestoneId,
          );

          const milestoneName =
            fullMilestone?.title || claimMilestone.title || "Unknown Milestone";

          if (!groups[milestoneId]) {
            groups[milestoneId] = {
              milestone: fullMilestone || claimMilestone,
              milestoneName,
              claims: [],
            };
          }

          // Only add the claim once per milestone
          if (!groups[milestoneId].claims.find((c) => c._id === claim._id)) {
            groups[milestoneId].claims.push(claim);
          }
        });
      }
      // Fallback to contract milestone if available
      else if ((claim.contractId as any)?.milestoneId) {
        const milestoneId =
          (claim.contractId as any)?.milestoneId?._id?.toString() ||
          "no-milestone";
        const milestoneName =
          (claim.contractId as any)?.milestoneId?.title ||
          "No Milestone Assigned";

        if (!groups[milestoneId]) {
          groups[milestoneId] = {
            milestone: (claim.contractId as any)?.milestoneId,
            milestoneName,
            claims: [],
          };
        }

        groups[milestoneId].claims.push(claim);
      }
      // No milestone assigned
      else {
        const milestoneId = "no-milestone";
        const milestoneName = "No Milestone Assigned";

        if (!groups[milestoneId]) {
          groups[milestoneId] = {
            milestone: null,
            milestoneName,
            claims: [],
          };
        }

        groups[milestoneId].claims.push(claim);
      }
    });

    return Object.values(groups);
  };

  const consultantClaims = claims.filter(
    (c) => !(c.contractId as any)?.description?.toLowerCase().includes("coach"),
  );

  const coachClaims = claims.filter((c) =>
    (c.contractId as any)?.description?.toLowerCase().includes("coach"),
  );

  const groupedConsultantClaims = groupClaimsByMilestone(consultantClaims);
  const groupedCoachClaims = groupClaimsByMilestone(coachClaims);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Project Claims</CardTitle>
          <CardDescription>All claims raised for {projectName}</CardDescription>
        </div>
        <Button
          onClick={() => {
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set("tab", "contracts");
            window.history.pushState({}, "", newUrl.toString());
            window.dispatchEvent(new PopStateEvent("popstate"));
          }}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Claim
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="consultants" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="consultants">
              Consultant Claims ({consultantClaims.length})
            </TabsTrigger>
            <TabsTrigger value="coaches">
              Coach Claims ({coachClaims.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="consultants">
            {groupedConsultantClaims.length > 0 ? (
              <div className="space-y-6">
                {groupedConsultantClaims.map((group) => (
                  <div key={group.milestoneName} className="space-y-3">
                    {/* Milestone Header */}
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <Receipt className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {group.milestoneName}
                          </h3>
                          {group.milestone && (
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                              <span>
                                Budget:{" "}
                                {group.milestone.budget?.toLocaleString()}
                              </span>
                              {group.milestone.dueDate && (
                                <span>
                                  Due:{" "}
                                  {new Date(
                                    group.milestone.dueDate,
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        {group.claims.length}{" "}
                        {group.claims.length === 1 ? "Claim" : "Claims"}
                      </Badge>
                    </div>

                    {/* Claims Table */}
                    <ClaimTable data={group.claims} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No consultant claims found for this project
                </p>
                <Button
                  onClick={() => {
                    const newUrl = new URL(window.location.href);
                    newUrl.searchParams.set("tab", "contracts");
                    window.history.pushState({}, "", newUrl.toString());
                    window.dispatchEvent(new PopStateEvent("popstate"));
                  }}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Claim from Contract
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="coaches">
            {groupedCoachClaims.length > 0 ? (
              <div className="space-y-6">
                {groupedCoachClaims.map((group) => (
                  <div key={group.milestoneName} className="space-y-3">
                    {/* Milestone Header */}
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Receipt className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {group.milestoneName}
                          </h3>
                          {group.milestone && (
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                              <span>
                                Budget:{" "}
                                {group.milestone.budget?.toLocaleString()}
                              </span>
                              {group.milestone.dueDate && (
                                <span>
                                  Due:{" "}
                                  {new Date(
                                    group.milestone.dueDate,
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-purple-50 text-purple-700 border-purple-200"
                      >
                        {group.claims.length}{" "}
                        {group.claims.length === 1 ? "Claim" : "Claims"}
                      </Badge>
                    </div>

                    {/* Claims Table */}
                    <ClaimTable data={group.claims} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No coach claims found for this project
                </p>
                <Button
                  onClick={() => {
                    const newUrl = new URL(window.location.href);
                    newUrl.searchParams.set("tab", "contracts");
                    window.history.pushState({}, "", newUrl.toString());
                    window.dispatchEvent(new PopStateEvent("popstate"));
                  }}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Claim from Contract
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
