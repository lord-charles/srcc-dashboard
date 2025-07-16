"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaginatedResponse } from "@/services/employees.service";
import {
  Users,
  DollarSign,
  UserCheck,
  UserMinus,
  TrendingUp,
  Plus,
  Building2,
} from "lucide-react";
import { User } from "@/types/user";
import { Organization } from "@/types/organization";
import EmployeeTable from "./users-table/user";
import { useRouter, useSearchParams } from "next/navigation";
import { AddToProjectHeader } from "./add-to-project-header";
import { useState } from "react";
import OrgTable from "./org-table/org";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConsultantStats } from "./statcards/consultant-stats";
import { OrganizationStats } from "./statcards/organization-stats";

interface EmployeeModuleProps {
  initialData: PaginatedResponse<User>;
  organizations: Organization[];
}

export default function EmployeeModule({ initialData, organizations }: EmployeeModuleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  console.log(organizations);

  const projectId = searchParams.get("projectId");
  const projectName = searchParams.get("projectName");

  const isAddingToProject = !!projectId && !!projectName;

  const stats = [
    {
      title: "Total Consultants",
      value: initialData.total.toString(),
      icon: Users,
      color: "text-blue-600",
      trend: "+5%",
      trendColor: "text-green-500",
    },
    {
      title: "Active Consultants",
      value: initialData.data.length.toString(),
      icon: UserCheck,
      color: "text-green-600",
      trend: "+3%",
      trendColor: "text-green-500",
    },
    {
      title: "Pending Consultants",
      value: "2",
      icon: UserMinus,
      color: "text-orange-600",
      trend: "-1%",
      trendColor: "text-red-500",
    },
    {
      title: "Organizations",
      value: organizations.length.toString(),
      icon: Building2,
      color: "text-purple-600",
    },
    {
      title: "Average Rate",
      value: "KES 120,000",
      icon: DollarSign,
      color: "text-emerald-600",
      trend: "+3.5%",
      trendColor: "text-green-500",
    },
    {
      title: "Total Projects",
      value: "29",
      icon: TrendingUp,
      color: "text-indigo-600",
      trend: "+2.1%",
      trendColor: "text-green-500",
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-2">
      {isAddingToProject && (
        <AddToProjectHeader selectedUser={selectedUser} />
      )}

{isAddingToProject &&(
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          Select Team Members
        </h1>
      </div>

      )}



      <div className="grid gap-2">
        <Card>
          <div className="p-2 flex flex-row items-center justify-between ">
            <div>
              <CardTitle>
                {isAddingToProject ? "Available Consultants" : "Consultant List"}
              </CardTitle>
              <CardDescription>
                {isAddingToProject
                  ? "Click on a consultant to add them to the project"
                  : "View and manage your consultants"}
              </CardDescription>
            </div>
            {!isAddingToProject && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    router.push("/consultant/register/individual");
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Individual
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    router.push("/consultant/register/company");
                  }}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Add Organization
                </Button>
              </div>
            )}
          </div>
          <div className="p-2">
            <Tabs defaultValue="individuals" className="w-full">
              <TabsList>
                <TabsTrigger value="individuals" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Individuals
                </TabsTrigger>
                <TabsTrigger value="organizations" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Organizations
                </TabsTrigger>
              </TabsList>
              <TabsContent value="individuals" className="mt-4 space-y-6">
                {!isAddingToProject && (
                    <ConsultantStats consultants={initialData.data || []} />
                )}
                <EmployeeTable
                  employees={initialData.data}
                  onUserSelect={(user) => {
                    if (isAddingToProject) {
                      setSelectedUser(user);
                    }
                  }}
                />
              </TabsContent>
              <TabsContent value="organizations" className="mt-4 space-y-6">
                {!isAddingToProject && (
                  <OrganizationStats organizations={organizations} />
                )}
                <OrgTable organizations={organizations} />
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </div>
    </div>
  );
}
