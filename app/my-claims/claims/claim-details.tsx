"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
interface ClaimDetailsDialogProps {
  claim: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClaimDetailsDialog({
  claim,
  open,
  onOpenChange,
}: ClaimDetailsDialogProps) {
  const statusIconMap = {
    approved: CheckCircle2,
    paid: CheckCircle2,
    rejected: XCircle,
    pending: Clock,
  } as const;

  const StatusIcon =
    statusIconMap[claim.status as keyof typeof statusIconMap] ?? Clock;

  const statusVariant =
    claim.status === "approved" || claim.status === "paid"
      ? "default"
      : claim.status === "rejected"
      ? "destructive"
      : "outline";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0">
        {/* Header */}
        <DialogHeader className="p-6 border-b">
          <div className="flex items-center gap-3">
            <StatusIcon className="h-5 w-5 text-muted-foreground" />
            <div>
              <DialogTitle className="text-lg">Claim Details</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <Badge variant={statusVariant} className="capitalize">
                  {claim.status}
                </Badge>
                <span className="text-xs">
                  Created {formatDate(claim.createdAt)}
                </span>
              </DialogDescription>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {claim.contractId.contractNumber}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              {claim.projectId.name}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {formatDate(claim.updatedAt)}
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <Tabs defaultValue="details">
          <div className="border-b px-6">
            <TabsList className="bg-transparent p-0 h-12">
              {[
                "details",
                "milestones",
                "audit",
                claim.documents?.length && "documents",
                claim.status === "paid" && claim.payment && "payment",
              ]
                .filter(Boolean)
                .map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab as string}
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-foreground"
                  >
                    {tab?.toString().charAt(0).toUpperCase() +
                      tab?.toString().slice(1)}
                  </TabsTrigger>
                ))}
            </TabsList>
          </div>

          {/* Details */}
          <TabsContent value="details" className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Claim Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">
                    {formatCurrency(claim.amount, claim.currency)}
                  </span>

                  <span className="text-muted-foreground">Version</span>
                  <span className="font-medium">{claim.version}</span>

                  <span className="text-muted-foreground">Created</span>
                  <span>{formatDate(claim.createdAt)}</span>

                  <span className="text-muted-foreground">Updated</span>
                  <span>{formatDate(claim.updatedAt)}</span>
                </CardContent>
              </Card>

              {claim.status === "rejected" && claim.rejection && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Rejection Details</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3 text-sm">
                    <span className="text-muted-foreground">Rejected By</span>
                    <span>{claim.rejection.rejectedBy}</span>

                    <span className="text-muted-foreground">Date</span>
                    <span>{formatDate(claim.rejection.rejectedAt)}</span>

                    <span className="text-muted-foreground">Level</span>
                    <span className="capitalize">{claim.rejection.level}</span>

                    <span className="text-muted-foreground">Reason</span>
                    <span>{claim.rejection.reason}</span>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Milestones */}
          <TabsContent value="milestones" className="p-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Milestones</CardTitle>
                <CardDescription>Claimed milestone breakdown</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>%</TableHead>
                      <TableHead>Max</TableHead>
                      <TableHead>Previous</TableHead>
                      <TableHead>Current</TableHead>
                      <TableHead>Remaining</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claim.milestones.map((m: any) => (
                      <TableRow key={m._id}>
                        <TableCell className="font-medium">{m.title}</TableCell>
                        <TableCell>
                          {m.percentageClaimed?.toFixed(2)}%
                        </TableCell>
                        <TableCell>
                          {formatCurrency(m.maxClaimableAmount, claim.currency)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(m.previouslyClaimed, claim.currency)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(m.currentClaim, claim.currency)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(m.remainingClaimable, claim.currency)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Audit */}
          <TabsContent value="audit" className="p-6">
            {claim.auditTrail?.length ? (
              <div className="space-y-3">
                {claim.auditTrail.map((a: any, i: number) => (
                  <Card key={i}>
                    <CardContent className="p-4 text-sm space-y-1">
                      <div className="font-medium">{a.action}</div>
                      <div className="text-muted-foreground flex gap-4">
                        <span>
                          {typeof a.performedBy === "object"
                            ? `${a.performedBy.firstName} ${a.performedBy.lastName}`
                            : a.performedBy}
                        </span>
                        <span>{formatDate(a.performedAt)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <div>No audit records available</div>
              </div>
            )}
          </TabsContent>

          {/* Documents */}
          {claim.documents?.length && (
            <TabsContent value="documents" className="p-6">
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {claim.documents.map((_: any, i: number) => (
                  <Card key={i}>
                    <CardContent className="p-4 space-y-3">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                      <div className="text-sm font-medium">
                        Document {i + 1}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="w-full">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button size="icon" variant="ghost">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          )}

          {/* Payment Details */}
          {claim.status === "paid" && claim.payment && (
            <TabsContent value="payment" className="p-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-green-700">
                      Payment Completed
                    </CardTitle>
                  </div>
                  <CardDescription>
                    This claim has been successfully paid and processed.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <span className="text-muted-foreground">
                          Amount Paid
                        </span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(claim.amount, claim.currency)}
                        </span>

                        <span className="text-muted-foreground">
                          Payment Method
                        </span>
                        <span className="font-medium capitalize">
                          {claim.payment.paymentMethod.replace("_", " ")}
                        </span>

                        <span className="text-muted-foreground">
                          Transaction ID
                        </span>
                        <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                          {claim.payment.transactionId}
                        </span>

                        {claim.payment.reference && (
                          <>
                            <span className="text-muted-foreground">
                              Reference
                            </span>
                            <span className="font-medium">
                              {claim.payment.reference}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <span className="text-muted-foreground">
                          Payment Date
                        </span>
                        <span className="font-medium">
                          {formatDate(claim.payment.paidAt)}
                        </span>

                        <span className="text-muted-foreground">
                          Processed By
                        </span>
                        <span className="font-medium">
                          {typeof claim.payment.paidBy === "object"
                            ? `${claim.payment.paidBy.firstName} ${claim.payment.paidBy.lastName}`
                            : claim.payment.paidBy}
                        </span>

                        <span className="text-muted-foreground">
                          Payment Advice
                        </span>
                        <a
                          href={claim.payment.paymentAdviceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                        >
                          <FileText className="h-3 w-3" />
                          View Document
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-700 dark:text-green-400">
                        Payment Status: Completed
                      </span>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      The payment for this claim has been successfully processed
                      and completed.
                    </p>
                  </div>
                </CardContent>
              </Card>
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
  );
}
