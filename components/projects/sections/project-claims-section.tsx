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
import { Plus } from "lucide-react";
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
              Consultant Claims (
              {
                claims.filter(
                  (c) =>
                    !(c.contractId as any)?.description
                      ?.toLowerCase()
                      .includes("coach"),
                ).length
              }
              )
            </TabsTrigger>
            <TabsTrigger value="coaches">
              Coach Claims (
              {
                claims.filter((c) =>
                  (c.contractId as any)?.description
                    ?.toLowerCase()
                    .includes("coach"),
                ).length
              }
              )
            </TabsTrigger>
          </TabsList>

          <TabsContent value="consultants">
            {claims.filter(
              (c) =>
                !(c.contractId as any)?.description
                  ?.toLowerCase()
                  .includes("coach"),
            ).length > 0 ? (
              <ClaimTable
                data={claims.filter(
                  (c) =>
                    !(c.contractId as any)?.description
                      ?.toLowerCase()
                      .includes("coach"),
                )}
              />
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
            {claims.filter((c) =>
              (c.contractId as any)?.description
                ?.toLowerCase()
                .includes("coach"),
            ).length > 0 ? (
              <ClaimTable
                data={claims.filter((c) =>
                  (c.contractId as any)?.description
                    ?.toLowerCase()
                    .includes("coach"),
                )}
              />
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
