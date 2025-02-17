"use client"

import { useEffect, useState } from "react"
import { format, isValid, parseISO } from "date-fns"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  DollarSign,
  Download,
  Edit,
  FileText,
  Milestone,
  Paperclip,
  TrendingUp,
  Trash2,
  Users,
  UserPlus,
} from "lucide-react"
import type { Project, TeamMember, ProjectMilestone, ProjectDocument } from "@/types/project"
import { deleteTeamMember } from "@/services/projects-service"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type React from "react" // Added import for React

interface ProjectDetailsProps {
  project?: Project
  isLoading?: boolean
  onTeamMemberEdit?: (memberId: string) => void
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  project: projectData,
  isLoading = false,
  onTeamMemberEdit,
}) => {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && ["overview", "team", "financial", "risk", "milestones", "documents"].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.set("tab", value)
    router.push(newUrl.pathname + newUrl.search)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: projectData?.currency || "KES",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not specified";

    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return "Invalid date";
      return format(date, "MMM d, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  }

  const calculateBudgetPercentage = (spent: number, total: number): number => {
    if (!total || !spent) return 0
    const percentage = (spent / total) * 100
    return Math.min(Math.max(percentage, 0), 100) // Clamp between 0-100
  }

  const getRiskLevelColor = (level: string): string => {
    const levels: Record<string, string> = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
    }
    return levels[level.toLowerCase()] || "bg-gray-100 text-gray-800"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 space-y-8 bg-gray-50 dark:bg-gray-900">
        <Card className="rounded-xl shadow-lg p-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (!projectData) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="p-6 text-center">
          <CardTitle className="mb-2">Project Not Found</CardTitle>
          <p className="text-gray-400">The requested project could not be found or you don&apos;t have access to it.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900" role="main" aria-label="Project Details">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="rounded-xl shadow-lg p-8 mb-8 border-0 bg-white dark:bg-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  {projectData.name}
                </h1>
                <Badge
                  variant={projectData.status === "active" ? "default" : "secondary"}
                  className={`text-sm px-3 py-1 ${projectData.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}
                >
                  {projectData.status.charAt(0).toUpperCase() + projectData.status.slice(1)}
                </Badge>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Project ID: {projectData._id}</p>
            </div>

            <div className='flex justify-between items-center'>

              <div className="items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span className='font-bold text-lg'>Project Manager</span>
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center font-semibold text-xs">
                    {projectData.createdBy?.firstName[0] || "N/A"}
                    {projectData.createdBy?.lastName[0] || "N/A"}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-700 dark:text-gray-300">
                      {projectData.createdBy?.firstName} {projectData.createdBy?.lastName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{projectData.createdBy?.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-sm transition-all hover:shadow-md"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center mb-2">
                <div className="p-2 bg-green-50 dark:bg-green-900 rounded-full mr-3">
                  <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" aria-hidden="true" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-medium">Start Date</p>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatDate(projectData.contractStartDate)}
              </p>
            </motion.div>

            <motion.div
              className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-sm transition-all hover:shadow-md"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center mb-2">
                <div className="p-2 bg-red-50 dark:bg-red-900 rounded-full mr-3">
                  <Calendar className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-medium">End Date</p>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatDate(projectData.contractEndDate)}
              </p>
            </motion.div>

            <motion.div
              className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-sm transition-all hover:shadow-md"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center mb-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-900 rounded-full mr-3">
                  <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-medium">Total Budget</p>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(projectData.totalBudget)}
              </p>
            </motion.div>
          </div>
        </Card>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="rounded-lg shadow-sm bg-white dark:bg-gray-800"
          defaultValue="overview"
        >
          <TabsList className="w-full border-b" aria-label="Project details tabs">
            <TabsTrigger value="overview" className="flex-1">
              Overview
            </TabsTrigger>
            <TabsTrigger value="team" className="flex-1">
              Team
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex-1">
              Financial
            </TabsTrigger>
            <TabsTrigger value="risk" className="flex-1">
              Risk
            </TabsTrigger>
            <TabsTrigger value="milestones" className="flex-1">
              Milestones
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex-1">
              Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-gray-600 dark:text-gray-300">{projectData.description}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Project Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Client:</span>
                      <span className="font-medium text-gray-700 dark:text-gray-200">{projectData.client}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Procurement Method:</span>
                      <span className="font-medium text-gray-700 dark:text-gray-200">
                        {projectData.procurementMethod}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Reporting Frequency:</span>
                      <span className="font-medium text-gray-700 dark:text-gray-200">
                        {projectData.reportingFrequency}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="team" className="p-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <Users className="h-5 w-5 mr-2" aria-hidden="true" />
                    Team Members
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => {
                      const params = new URLSearchParams({
                        projectId: projectData._id,
                        projectName: projectData.name,
                        returnUrl: `${window.location.pathname}?tab=team`,
                      })
                      router.push(`/users?${params.toString()}`)
                    }}
                  >
                    <UserPlus className="h-4 w-4" />
                    Add Team Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  {projectData.teamMembers.map((member: TeamMember, index: number) => (
                    <motion.div
                      key={member._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full h-10 w-10 flex items-center justify-center font-semibold"
                          aria-hidden="true"
                        >
                          {member.userId?.firstName[0] || "N/A"}
                          {member.userId?.lastName[0] || "N/A"}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-medium text-gray-800 dark:text-gray-200">
                            {member.userId?.firstName || "N/A"} {member.userId?.lastName || "N/A"}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{member.userId?.email || "N/A"}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {member.responsibilities.map((responsibility, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs py-0 text-gray-500 dark:text-gray-400"
                              >
                                {responsibility || "N/A"}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>Start: {formatDate(member.startDate) || "N/A"}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>End: {formatDate(member.endDate)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">

                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                          onClick={async () => {
                            if (window.confirm("Are you sure you want to remove this team member?")) {
                              try {
                                await deleteTeamMember(projectData._id, member.userId._id)
                                toast({
                                  title: "Success",
                                  description: "Team member removed successfully",
                                })
                                router.refresh()
                              } catch (error) {
                                console.error("Failed to delete team member:", error)
                                toast({
                                  title: "Error",
                                  description: "Failed to remove team member",
                                  variant: "destructive",
                                })
                              }
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" aria-hidden="true" />
                    Budget Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-gray-400">Total Budget:</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {formatCurrency(projectData.totalBudget)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-gray-400">Amount Spent:</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {formatCurrency(projectData.amountSpent)}
                      </span>
                    </div>
                    <div
                      role="progressbar"
                      aria-valuenow={calculateBudgetPercentage(projectData.amountSpent, projectData.totalBudget)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <Progress
                        value={calculateBudgetPercentage(projectData.amountSpent, projectData.totalBudget)}
                        className="h-2"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-right mt-1">
                        {calculateBudgetPercentage(projectData.amountSpent, projectData.totalBudget).toFixed(1)}% of
                        budget spent
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" aria-hidden="true" />
                    Project Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2 text-gray-800 dark:text-gray-200">
                    {formatCurrency(projectData.totalProjectValue)}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total project value including all costs and revenues
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="risk" className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" aria-hidden="true" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 dark:text-gray-400">Risk Level:</span>
                      <Badge className={getRiskLevelColor(projectData.riskLevel)}>{projectData.riskLevel}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Last assessment: {projectData.riskAssessment?.lastAssessmentDate ? formatDate(projectData.riskAssessment.lastAssessmentDate) : 'Not assessed yet'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Next assessment: {projectData.riskAssessment?.nextAssessmentDate ? formatDate(projectData.riskAssessment.nextAssessmentDate) : 'Not scheduled'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" aria-hidden="true" />
                    Risk Factors and Mitigation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Risk Factors:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {projectData.riskAssessment.factors.map((factor: string, index: number) => (
                          <li key={index} className="text-sm text-gray-500 dark:text-gray-400">
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Mitigation Strategies:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {projectData.riskAssessment.mitigationStrategies.map((strategy: string, index: number) => (
                          <li key={index} className="text-sm text-gray-500 dark:text-gray-400">
                            {strategy}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="milestones" className="p-6">
            <div className="space-y-6">
              {projectData.milestones.map((milestone: ProjectMilestone, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg font-semibold flex items-center">
                        <Milestone className="h-5 w-5 mr-2" aria-hidden="true" />
                        {milestone.title}
                      </CardTitle>
                      <Badge
                        variant={milestone.completed ? "default" : "secondary"}
                        className={milestone.completed ? "bg-green-100 text-green-800" : ""}
                      >
                        {milestone.completed ? "Completed" : "In Progress"}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{milestone.description}</p>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="flex flex-col space-y-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Due Date</span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {formatDate(milestone.dueDate)}
                          </span>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Budget</span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {formatCurrency(milestone.budget)}
                          </span>
                        </div>
                        {milestone.actualCost !== null && (
                          <div className="flex flex-col space-y-1">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Actual Cost</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {formatCurrency(milestone.actualCost)}
                            </span>
                          </div>
                        )}
                      </div>
                      {milestone.actualCost !== null && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Budget Usage</h4>
                          <div
                            role="progressbar"
                            aria-valuenow={calculateBudgetPercentage(milestone.actualCost, milestone.budget)}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          >
                            <Progress
                              value={calculateBudgetPercentage(milestone.actualCost, milestone.budget)}
                              className="h-2"
                            />
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {calculateBudgetPercentage(milestone.actualCost, milestone.budget).toFixed(1)}% of budget
                              used
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="documents" className="p-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Paperclip className="h-5 w-5 mr-2" aria-hidden="true" />
                  Project Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { name: "Project Proposal", url: projectData.projectProposalUrl },
                    { name: "Signed Contract", url: projectData.signedContractUrl },
                    { name: "Execution Memo", url: projectData.executionMemoUrl },
                    { name: "Signed Budget", url: projectData.signedBudgetUrl },
                    ...projectData.documents,
                  ].map((doc: ProjectDocument, index: number) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-start transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                        asChild
                      >
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center"
                          aria-label={`Download ${doc.name}`}
                        >
                          <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
                          <span className="flex-grow text-left">{doc.name}</span>
                          <Download className="ml-auto h-4 w-4" aria-hidden="true" />
                        </a>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}

export default ProjectDetails
