"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  User,
  XCircle,
  Download,
  ExternalLink,
  Info,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion } from "framer-motion"

interface ClaimDetailsDialogProps {
  claim: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClaimDetailsDialog({ claim, open, onOpenChange }: ClaimDetailsDialogProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-50 border-green-200 text-green-700"
      case "rejected":
        return "bg-red-50 border-red-200 text-red-700"
      default:
        return "bg-yellow-50 border-yellow-200 text-yellow-700"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className={`p-6 ${getStatusClass(claim.status)}`}>
          <div className="flex items-center gap-2">
            {getStatusIcon(claim.status)}
            <DialogTitle className="text-xl">
              Claim Details
              <Badge
                variant={
                  claim.status === "approved" ? "success" : claim.status === "rejected" ? "destructive" : "outline"
                }
                className="ml-2 capitalize"
              >
                {claim.status}
              </Badge>
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm opacity-90">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-2">
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4 opacity-70" />
                <span>Contract: </span>
                <span className="font-medium">{claim.contractId.contractNumber}</span>
              </div>
              <div className="flex items-center gap-1">
                <Info className="h-4 w-4 opacity-70" />
                <span>Project: </span>
                <span className="font-medium">{claim.projectId.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 opacity-70" />
                <span>Created: </span>
                <span className="font-medium">{formatDate(claim.createdAt)}</span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <div className="px-6 border-b">
            <TabsList className="w-full justify-start h-12 bg-transparent p-0">
              <TabsTrigger
                value="details"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="milestones"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
              >
                Milestones
              </TabsTrigger>
              <TabsTrigger
                value="audit"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
              >
                Audit Trail
              </TabsTrigger>
              {claim.documents && claim.documents.length > 0 && (
                <TabsTrigger
                  value="documents"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                >
                  Documents
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="details" className="p-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Claim Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="text-muted-foreground">Amount:</div>
                      <div className="font-medium">{formatCurrency(claim.amount, claim.currency)}</div>

                      <div className="text-muted-foreground">Created:</div>
                      <div className="font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(claim.createdAt)}
                      </div>

                      <div className="text-muted-foreground">Updated:</div>
                      <div className="font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(claim.updatedAt)}
                      </div>

                      <div className="text-muted-foreground">Version:</div>
                      <div className="font-medium">{claim.version}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {claim.status === "rejected" && claim.rejection && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base text-red-700 flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Rejection Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="text-red-700/70">Rejected By:</div>
                        <div className="font-medium text-red-700 flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {claim?.rejection?.rejectedBy}
                        </div>

                        <div className="text-red-700/70">Rejected At:</div>
                        <div className="font-medium text-red-700 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(claim.rejection.rejectedAt)}
                        </div>

                        <div className="text-red-700/70">Reason:</div>
                        <div className="font-medium text-red-700">{claim.rejection.reason}</div>

                        <div className="text-red-700/70">Level:</div>
                        <div className="font-medium text-red-700 capitalize">{claim.rejection.level}</div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="milestones" className="p-6 focus-visible:outline-none focus-visible:ring-0">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Milestone Details</CardTitle>
                  <CardDescription>Breakdown of milestones included in this claim</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>% Claimed</TableHead>
                        <TableHead>Max Claimable</TableHead>
                        <TableHead>Previously Claimed</TableHead>
                        <TableHead>Current Claim</TableHead>
                        <TableHead>Remaining</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {claim.milestones.map((milestone: any) => (
                        <TableRow key={milestone._id} className="hover:bg-muted/30">
                          <TableCell className="font-medium">{milestone.title}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ width: `${milestone.percentageClaimed}%` }}
                                />
                              </div>
                              <span>{milestone.percentageClaimed}%</span>
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(milestone.maxClaimableAmount, claim.currency)}</TableCell>
                          <TableCell>{formatCurrency(milestone.previouslyClaimed, claim.currency)}</TableCell>
                          <TableCell className="font-medium text-blue-700">
                            {formatCurrency(milestone.currentClaim, claim.currency)}
                          </TableCell>
                          <TableCell>{formatCurrency(milestone.remainingClaimable, claim.currency)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="audit" className="p-6 focus-visible:outline-none focus-visible:ring-0">
            {claim.auditTrail && claim.auditTrail.length > 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Audit Trail</CardTitle>
                    <CardDescription>History of actions performed on this claim</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {claim.auditTrail.map((audit: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 text-sm border rounded-md p-4 hover:bg-muted/30 transition-colors"
                        >
                          <div className="bg-blue-100 p-2 rounded-full flex-shrink-0 mt-1">
                            <AlertCircle className="h-4 w-4 text-blue-700" />
                          </div>
                          <div className="space-y-2">
                            <div className="font-medium text-lg">{audit.action}</div>
                            <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>By: {audit.performedBy}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(audit.performedAt)}</span>
                              </div>
                            </div>
                            {audit.details && (
                              <div className="mt-2 bg-muted/50 p-3 rounded-md">
                                <div className="text-xs font-medium mb-1">Details:</div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                  {Object.entries(audit.details).map(([key, value]) => (
                                    <div key={key} className="contents">
                                      <div className="text-muted-foreground capitalize">{key}:</div>
                                      <div>{value as string}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mb-4 opacity-20" />
                <p>No audit trail available for this claim</p>
              </div>
            )}
          </TabsContent>

          {claim.documents && claim.documents.length > 0 && (
            <TabsContent value="documents" className="p-6 focus-visible:outline-none focus-visible:ring-0">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Supporting Documents</CardTitle>
                    <CardDescription>Documents attached to this claim</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {claim.documents.map((doc: any, index: number) => (
                        <div
                          key={index}
                          className="border rounded-md p-4 flex flex-col hover:shadow-md transition-all hover:border-blue-200 group"
                        >
                          <div className="bg-blue-50 rounded-md p-6 mb-3 flex items-center justify-center">
                            <FileText className="h-8 w-8 text-blue-500" />
                          </div>
                          <p className="font-medium text-sm mb-2">Document {index + 1}</p>
                          <div className="mt-auto pt-2 flex gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="outline" size="sm" className="w-full">
                                    <Download className="h-3 w-3 mr-1" />
                                    Download
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Download document</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View document</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          )}
        </Tabs>

        <DialogFooter className="p-6 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
