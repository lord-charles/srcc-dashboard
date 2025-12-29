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
  Briefcase,
  TrendingUp,
  Plus,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Project } from "@/types/project";
import { useRouter } from "next/navigation";
import ProjectTable from "./projects-table/projects";
import ProjectStats from "./project-statcards";

interface EmployeeModuleProps {
  initialData: PaginatedResponse<Project>;
}

export default function ProjectsModule({ initialData }: EmployeeModuleProps) {
  const router = useRouter();


  return (
    <div className="flex-1 space-y-4 p-2">
      <ProjectStats projectData={initialData} />

      <div className="grid gap-4 pt-2">
        <Card>
          <div className="p-3 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Project List</CardTitle>
              <CardDescription>View and manage your projects</CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => {
                router.push("/project/new");
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </div>
          <div className="p-3">
            <ProjectTable projects={initialData} />
          </div>
        </Card>
      </div>
    </div>
  );
}
