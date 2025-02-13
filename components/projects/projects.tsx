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
  UserCheck,
  UserMinus,
  TrendingUp,
  Plus,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Project } from "@/types/project";
import EmployeeTable from "./projects-table/projects";
import { useRouter } from "next/navigation";
import ProjectTable from "./projects-table/projects";

interface EmployeeModuleProps {
  initialData: PaginatedResponse<Project>;
}

export default function ProjectsModule({ initialData }: EmployeeModuleProps) {
  const router = useRouter();

  const stats = [
    {
      title: "Total Projects",
      value: "1",
      icon: Briefcase,
      color: "text-gray-900 dark:text-white",
      gradient: "bg-gradient-to-r from-blue-500 to-blue-600",
      trend: "1 active, 0 new",
      trendColor: "text-blue-600",
    },
    {
      title: "Budget Overview",
      value: "$5,000,000",
      icon: DollarSign,
      color: "text-gray-900 dark:text-white",
      gradient: "bg-gradient-to-r from-green-500 to-emerald-600",
      trend: "50.0% spent",
      trendColor: "text-green-600",
    },
    {
      title: "Project Health",
      value: "0",
      icon: TrendingUp,
      color: "text-gray-900 dark:text-white",
      gradient: "bg-gradient-to-r from-orange-500 to-red-600",
      trend: "0.0% high risk",
      trendColor: "text-orange-600",
    },
    {
      title: "Avg. Duration",
      value: "24 months",
      icon: Clock,
      color: "text-gray-900 dark:text-white",
      gradient: "bg-gradient-to-r from-purple-500 to-indigo-600",
      trend: "1 ongoing",
      trendColor: "text-purple-600",
    },
    {
      title: "Completed Projects",
      value: "0",
      icon: CheckCircle,
      color: "text-gray-900 dark:text-white",
      gradient: "bg-gradient-to-r from-emerald-500 to-teal-600",
      trend: "0.0% completion rate",
      trendColor: "text-emerald-600",
    },
    {
      title: "Team Members",
      value: "12",
      icon: Users,
      color: "text-gray-900 dark:text-white",
      gradient: "bg-gradient-to-r from-indigo-500 to-violet-600",
      trend: "3 teams",
      trendColor: "text-indigo-600",
    },
  ];

  // const projects = [
  //   {
  //     _id: "proj_health_001",
  //     name: "Health System Upgrade",
  //     description: "A project to upgrade the health system infrastructure.",
  //     totalBudget: 5000000,
  //     totalProjectValue: 4800000,
  //     currency: "USD",
  //     contractStartDate: "2024-01-01T00:00:00.000Z",
  //     contractEndDate: "2025-12-31T00:00:00.000Z",
  //     client: "Ministry of Health",
  //     status: "active",
  //     projectManager: "John Doe",
  //     milestones: [
  //       {
  //         title: "Phase 1 Completion",
  //         description: "Complete initial system installation.",
  //         dueDate: "2024-06-30T00:00:00.000Z",
  //         completed: false,
  //       },
  //       {
  //         title: "Phase 2 Completion",
  //         description: "Finalize software integration.",
  //         dueDate: "2025-03-31T00:00:00.000Z",
  //         completed: false,
  //       },
  //     ],
  //     teamMembers: [
  //       {
  //         name: "Alice Johnson",
  //         role: "Lead Developer",
  //         contact: "alice@example.com",
  //       },
  //       {
  //         name: "Mark Smith",
  //         role: "Project Coordinator",
  //         contact: "mark@example.com",
  //       },
  //     ],
  //     procurementMethod: "Public Procurement",
  //     signedContractUrl: "https://example.com/contracts/signed-contract.pdf",
  //     contractExecutionMemoUrl: "https://example.com/contracts/execution-memo.pdf",
  //     signedBudgetUrl: "https://example.com/contracts/signed-budget.pdf",
  //     riskLevel: "High",
  //     reportingFrequency: "Quarterly",
  //     actualCompletionDate: "2025-06-30T00:00:00.000Z",
  //     amountSpent: 500000,
  //   },
  //   {
  //     _id: "proj_road_002",
  //     name: "Road Infrastructure Expansion",
  //     description: "A nationwide project to improve road networks.",
  //     totalBudget: 10000000,
  //     totalProjectValue: 9500000,
  //     currency: "EUR",
  //     contractStartDate: "2023-07-01T00:00:00.000Z",
  //     contractEndDate: "2026-06-30T00:00:00.000Z",
  //     client: "National Transport Authority",
  //     status: "on-hold",
  //     projectManager: "Emma Davis",
  //     milestones: [
  //       {
  //         title: "Phase 1: Survey",
  //         description: "Complete nationwide road survey.",
  //         dueDate: "2024-04-15T00:00:00.000Z",
  //         completed: true,
  //       },
  //       {
  //         title: "Phase 2: Construction Start",
  //         description: "Begin construction in key regions.",
  //         dueDate: "2025-01-20T00:00:00.000Z",
  //         completed: false,
  //       },
  //     ],
  //     teamMembers: [
  //       {
  //         name: "David Brown",
  //         role: "Civil Engineer",
  //         contact: "david@example.com",
  //       },
  //     ],
  //     procurementMethod: "Competitive Bidding",
  //     signedContractUrl: "https://example.com/contracts/road-infra.pdf",
  //     contractExecutionMemoUrl: "https://example.com/contracts/execution-memo.pdf",
  //     signedBudgetUrl: "https://example.com/contracts/signed-budget.pdf",
  //     riskLevel: "Medium",
  //     reportingFrequency: "Monthly",
  //     actualCompletionDate: null,
  //     amountSpent: 1200000,
  //   },
  //   {
  //     _id: "proj_edu_003",
  //     name: "National Digital Learning Initiative",
  //     description: "Providing digital learning resources for schools.",
  //     totalBudget: 7500000,
  //     totalProjectValue: 7200000,
  //     currency: "GBP",
  //     contractStartDate: "2024-03-01T00:00:00.000Z",
  //     contractEndDate: "2026-03-01T00:00:00.000Z",
  //     client: "Ministry of Education",
  //     status: "active",
  //     projectManager: "Liam Wilson",
  //     milestones: [
  //       {
  //         title: "Deploy Digital Classrooms",
  //         description: "Install smart boards and online learning systems.",
  //         dueDate: "2025-06-30T00:00:00.000Z",
  //         completed: false,
  //       },
  //     ],
  //     teamMembers: [
  //       {
  //         name: "Olivia Taylor",
  //         role: "Education Specialist",
  //         contact: "olivia@example.com",
  //       },
  //     ],
  //     procurementMethod: "Direct Award",
  //     signedContractUrl: "https://example.com/contracts/digital-learning.pdf",
  //     contractExecutionMemoUrl: "https://example.com/contracts/execution-memo.pdf",
  //     signedBudgetUrl: "https://example.com/contracts/signed-budget.pdf",
  //     riskLevel: "Low",
  //     reportingFrequency: "Bi-Annually",
  //     actualCompletionDate: null,
  //     amountSpent: 300000,
  //   },
  //   {
  //     _id: "proj_energy_004",
  //     name: "Renewable Energy Expansion",
  //     description: "A project to expand solar and wind energy capacities.",
  //     totalBudget: 15000000,
  //     totalProjectValue: 14500000,
  //     currency: "USD",
  //     contractStartDate: "2023-05-15T00:00:00.000Z",
  //     contractEndDate: "2028-05-15T00:00:00.000Z",
  //     client: "Energy Regulatory Commission",
  //     status: "active",
  //     projectManager: "Sophia Martinez",
  //     milestones: [
  //       {
  //         title: "Complete Solar Farm Installation",
  //         description: "Build and operationalize solar farms.",
  //         dueDate: "2025-12-15T00:00:00.000Z",
  //         completed: false,
  //       },
  //     ],
  //     teamMembers: [
  //       {
  //         name: "James Anderson",
  //         role: "Energy Consultant",
  //         contact: "james@example.com",
  //       },
  //     ],
  //     procurementMethod: "Public-Private Partnership",
  //     signedContractUrl: "https://example.com/contracts/renewable-energy.pdf",
  //     contractExecutionMemoUrl: "https://example.com/contracts/execution-memo.pdf",
  //     signedBudgetUrl: "https://example.com/contracts/signed-budget.pdf",
  //     riskLevel: "High",
  //     reportingFrequency: "Quarterly",
  //     actualCompletionDate: null,
  //     amountSpent: 2500000,
  //   },
  //   {
  //     _id: "proj_city_005",
  //     name: "Smart City Development",
  //     description: "A project to implement smart city infrastructure.",
  //     totalBudget: 20000000,
  //     totalProjectValue: 19500000,
  //     currency: "EUR",
  //     contractStartDate: "2023-09-01T00:00:00.000Z",
  //     contractEndDate: "2030-09-01T00:00:00.000Z",
  //     client: "City Planning Authority",
  //     status: "active",
  //     projectManager: "Benjamin White",
  //     milestones: [
  //       {
  //         title: "Smart Traffic System Deployment",
  //         description: "Install AI-powered traffic monitoring systems.",
  //         dueDate: "2026-03-01T00:00:00.000Z",
  //         completed: false,
  //       },
  //     ],
  //     teamMembers: [
  //       {
  //         name: "Emma Clark",
  //         role: "Urban Planner",
  //         contact: "emma@example.com",
  //       },
  //     ],
  //     procurementMethod: "Government Funded",
  //     signedContractUrl: "https://example.com/contracts/smart-city.pdf",
  //     contractExecutionMemoUrl: "https://example.com/contracts/execution-memo.pdf",
  //     signedBudgetUrl: "https://example.com/contracts/signed-budget.pdf",
  //     riskLevel: "Medium",
  //     reportingFrequency: "Annually",
  //     actualCompletionDate: null,
  //     amountSpent: 4000000,
  //   },
  // ];

  return (
    <div className="flex-1 space-y-4 p-4 p-4">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Project Management
        </h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index} className="relative">
            <div className={`absolute top-0 left-0 w-full h-2 ${stat.gradient} rounded-t-md`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${stat.color}`}>
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.trendColor}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <p className={`text-xs flex items-center gap-1 ${stat.trendColor}`}>
                <TrendingUp className="h-3 w-3" />
                <span>{stat.trend}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 pt-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
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
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ProjectTable projects={initialData} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
