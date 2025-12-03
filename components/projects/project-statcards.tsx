"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Calendar,
  Clock,
  DollarSign,
  Layers,
  Users,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PaginatedResponse } from "@/services/employees.service";
import { Project } from "@/types/project";

interface ProjectStatsProps {
  projectData: PaginatedResponse<Project>;
}

export default function ProjectStats({ projectData }: ProjectStatsProps) {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    draftProjects: 0,
    totalBudget: 0,
    totalSpent: 0,
    budgetUtilization: 0,
    totalTeamMembers: 0,
    totalMilestones: 0,
    completedMilestones: 0,
    departments: new Set(),
    riskDistribution: {
      low: 0,
      medium: 0,
      high: 0,
    },
    nextMilestoneDays: null,
  });

  useEffect(() => {
    try {
      // Calculate statistics from project data
      const totalProjects = Array.isArray(projectData) ? projectData.length : 0;
      const activeProjects = Array.isArray(projectData)
        ? projectData.filter((p) => p && p.status === "active").length
        : 0;
      const draftProjects = Array.isArray(projectData)
        ? projectData.filter((p) => p && p.status === "draft").length
        : 0;

      let totalBudget = 0;
      let totalSpent = 0;
      const totalTeamMembers = new Set();
      let totalMilestones = 0;
      let completedMilestones = 0;
      const departments = new Set();
      const riskDistribution = { low: 0, medium: 0, high: 0 };

      // Track upcoming milestones
      let closestMilestoneDays: number | null = null;

      if (Array.isArray(projectData)) {
        projectData.forEach((project) => {
          if (!project) return;

          // Budget calculations - handle string or number values
          const projectBudget =
            project.totalBudget !== undefined
              ? Number(project.totalBudget)
              : project.totalProjectValue !== undefined
              ? Number(project?.totalProjectValue)
              : 0;

          if (!isNaN(projectBudget)) {
            totalBudget += projectBudget;
          }

          const projectSpent =
            project.amountSpent !== undefined ? Number(project.amountSpent) : 0;
          if (!isNaN(projectSpent)) {
            totalSpent += projectSpent;
          }

          // Team members
          if (Array.isArray(project.teamMembers)) {
            project.teamMembers.forEach((member: { userId: string }) => {
              if (member && member.userId) {
                totalTeamMembers.add(member.userId);
              }
            });
          }

          // Milestones
          if (Array.isArray(project.milestones)) {
            totalMilestones += project.milestones.length;
            completedMilestones += project.milestones.filter(
              (m: { completed: boolean }) => m && m.completed
            ).length;

            // Find closest upcoming milestone
            const today = new Date();
            project.milestones.forEach(
              (milestone: { dueDate: string; completed: boolean }) => {
                if (milestone && milestone.dueDate && !milestone.completed) {
                  const dueDate = new Date(milestone.dueDate);
                  if (!isNaN(dueDate.getTime())) {
                    const daysDiff = Math.ceil(
                      (dueDate.getTime() - today.getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                    if (
                      daysDiff > 0 &&
                      (closestMilestoneDays === null ||
                        daysDiff < closestMilestoneDays)
                    ) {
                      closestMilestoneDays = daysDiff;
                    }
                  }
                }
              }
            );
          }

          // Departments
          if (project.department) {
            departments.add(project.department);
          }

          // Risk levels
          if (project.riskLevel) {
            const risk = String(project.riskLevel).toLowerCase();
            if (risk === "low") riskDistribution.low++;
            if (risk === "medium") riskDistribution.medium++;
            if (risk === "high") riskDistribution.high++;
          }
        });
      }

      const budgetUtilization =
        totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

      setStats({
        totalProjects,
        activeProjects,
        draftProjects,
        totalBudget,
        totalSpent,
        budgetUtilization,
        totalTeamMembers: totalTeamMembers.size,
        totalMilestones,
        completedMilestones,
        departments,
        riskDistribution,
        nextMilestoneDays: closestMilestoneDays,
      });
    } catch (error) {
      console.error("Error calculating project stats:", error);
      // Set default values in case of error
      setStats({
        totalProjects: 0,
        activeProjects: 0,
        draftProjects: 0,
        totalBudget: 0,
        totalSpent: 0,
        budgetUtilization: 0,
        totalTeamMembers: 0,
        totalMilestones: 0,
        completedMilestones: 0,
        departments: new Set(),
        riskDistribution: { low: 0, medium: 0, high: 0 },
        nextMilestoneDays: null,
      });
    }
  }, []);

  // Format currency with error handling
  const formatCurrency = (amount: string) => {
    try {
      const numAmount = Number(amount);
      if (isNaN(numAmount)) return "KES 0";

      return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 0,
      }).format(numAmount);
    } catch (error) {
      console.error("Error formatting currency:", error);
      return "KES 0";
    }
  };

  // Get all unique skills from team members
  const getSkills = () => {
    try {
      const skills = new Set();

      if (Array.isArray(projectData)) {
        projectData.forEach((project) => {
          if (project && Array.isArray(project.teamMembers)) {
            project.teamMembers.forEach(
              (member: { responsibilities: string[] }) => {
                if (member && Array.isArray(member.responsibilities)) {
                  member.responsibilities.forEach((skill: string) => {
                    if (skill) skills.add(String(skill).toLowerCase());
                  });
                }
              }
            );
          }
        });
      }

      return Array.from(skills).slice(0, 4);
    } catch (error) {
      console.error("Error getting skills:", error);
      return [];
    }
  };

  const skills = getSkills();
  const skillColors = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-violet-500",
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
      {/* Project Overview Card */}
      <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-500" />
            Project Portfolio
          </CardTitle>
          <CardDescription>Overall project status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-3xl font-bold">{stats.totalProjects || 0}</p>
              <p className="text-sm text-muted-foreground">Total Projects</p>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  {stats.activeProjects || 0} Active
                </Badge>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 border-amber-200"
                >
                  {stats.draftProjects || 0} Draft
                </Badge>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Departments</span>
              <span className="font-medium">
                {stats.departments?.size || 0}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 mt-2">
              {Array.from(stats.departments || [])
                .slice(0, 6)
                .map((dept, i) => (
                  <Badge key={i} variant="secondary" className="justify-center">
                    {String(dept)}
                  </Badge>
                ))}
              {(stats.departments?.size || 0) > 6 && (
                <Badge variant="secondary" className="justify-center">
                  +{(stats.departments?.size || 0) - 6}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
        {/* <CardFooter className="pt-0 pb-3">
          <div className="w-full flex items-center justify-between text-sm text-muted-foreground">
            <span>Risk:</span>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-[10px]">
                <span className="h-2 w-2 rounded-full bg-green-500"></span> Low: {stats.riskDistribution?.low || 0}
              </span>
              <span className="flex items-center gap-1 text-[10px]">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span> Med: {stats.riskDistribution?.medium || 0}
              </span>
              <span className="flex items-center gap-1 text-[10px]  ">
                <span className="h-2 w-2 rounded-full bg-red-500"></span> High: {stats.riskDistribution?.high || 0}
              </span>
            </div>
          </div>
        </CardFooter> */}
      </Card>

      {/* Financial Overview Card */}
      <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-violet-500" />
            Financial Overview
          </CardTitle>
          <CardDescription>Budget allocation and spending</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">Total Budget</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(String(stats.totalBudget))}
                </p>
              </div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">Amount Spent</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(String(stats.totalSpent))}
                </p>
              </div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">Remaining</p>
                <p className="text-sm font-semibold text-emerald-600">
                  {formatCurrency(
                    String((stats.totalBudget || 0) - (stats.totalSpent || 0))
                  )}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">Budget Utilization</p>
                <p className="text-sm font-medium">
                  {(stats.budgetUtilization || 0).toFixed(1)}%
                </p>
              </div>
              <Progress value={stats.budgetUtilization || 0} className="h-2" />
            </div>
          </div>
        </CardContent>
        {/* <CardFooter className="pt-0 pb-3">
          <div className="w-full flex items-center justify-between text-sm">
            <BarChart className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Updated: {new Date().toLocaleDateString()}
            </span>
          </div>
        </CardFooter> */}
      </Card>

      {/* Timeline & Progress Card */}
      <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Timeline & Progress
          </CardTitle>
          <CardDescription>Milestone completion status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">
                  {stats.completedMilestones || 0}/{stats.totalMilestones || 0}
                </p>
                <p className="text-sm text-muted-foreground">
                  Milestones Completed
                </p>
              </div>
              <div className="relative h-16 w-16">
                <svg
                  className="h-16 w-16 rotate-[-90deg]"
                  viewBox="0 0 100 100"
                >
                  <circle
                    className="stroke-slate-200 dark:stroke-slate-700"
                    cx="50"
                    cy="50"
                    r="40"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    className="stroke-blue-500"
                    cx="50"
                    cy="50"
                    r="40"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray="251.2"
                    strokeDashoffset={
                      (stats.totalMilestones || 0) > 0
                        ? 251.2 -
                          251.2 *
                            ((stats.completedMilestones || 0) /
                              (stats.totalMilestones || 1))
                        : 251.2
                    }
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                  {(stats.totalMilestones || 0) > 0
                    ? Math.round(
                        ((stats.completedMilestones || 0) /
                          (stats.totalMilestones || 1)) *
                          100
                      )
                    : 0}
                  %
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">On Schedule</span>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  {stats.activeProjects || 0} Projects
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Upcoming Milestones
                </span>
                <span className="font-medium">
                  {(stats.totalMilestones || 0) -
                    (stats.completedMilestones || 0)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
        {/* <CardFooter className="pt-0 pb-3">
          <div className="w-full flex items-center justify-between text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {stats.nextMilestoneDays !== null
                ? `Next milestone due in ${stats.nextMilestoneDays} days`
                : "No upcoming milestones"}
            </span>
          </div>
        </CardFooter> */}
      </Card>

      {/* Team & Resources Card */}
      <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-500" />
            Team & Resources
          </CardTitle>
          <CardDescription>Team allocation and skills</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">
                  {stats.totalTeamMembers || 0}
                </p>
                <p className="text-sm text-muted-foreground">Team Members</p>
              </div>
              <div className="flex -space-x-2">
                {[...Array(Math.min(stats.totalTeamMembers || 0, 5))].map(
                  (_, i) => (
                    <div
                      key={i}
                      className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-medium border-2 border-white dark:border-slate-800 ${
                        [
                          "bg-blue-500",
                          "bg-emerald-500",
                          "bg-amber-500",
                          "bg-violet-500",
                          "bg-rose-500",
                        ][i % 5]
                      }`}
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  )
                )}
                {(stats.totalTeamMembers || 0) > 5 && (
                  <div className="h-10 w-10 rounded-full flex items-center justify-center bg-slate-200 text-slate-600 font-medium border-2 border-white dark:border-slate-800 dark:bg-slate-700 dark:text-slate-300">
                    +{(stats.totalTeamMembers || 0) - 5}
                  </div>
                )}
              </div>
            </div>
            {/* 
            <div className="space-y-2">
              <p className="text-sm font-medium">Skills Distribution</p>
              <div className="grid grid-cols-2 gap-2">
                {skills.length > 0 ? (
                  skills.map((skill, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span
                        className={`h-3 w-3 rounded-sm ${
                          skillColors[i % skillColors.length]
                        }`}
                      ></span>
                      <span className="capitalize">{skill as string}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="h-3 w-3 rounded-sm bg-blue-500"></span>
                      <span>Frontend</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="h-3 w-3 rounded-sm bg-emerald-500"></span>
                      <span>Backend</span>
                    </div>
                  </>
                )}
              </div>
            </div> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
