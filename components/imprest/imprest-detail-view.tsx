"use client";

import React from "react";
import {
  Calendar,
  CreditCard,
  User,
  Info,
  Clock,
  Download,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Imprest } from "./imprest-dashboard";
import { StatusBadge } from "./status-badge";
import { ApprovalTimeline } from "./approval-timeline";
import { formatCurrency, formatDate } from "./utils";

interface ImprestDetailViewProps {
  imprest: Imprest | null;
  onClose: () => void;
}

export const ImprestDetailView = ({
  imprest,
  onClose,
}: ImprestDetailViewProps) => {
  if (!imprest) return null;

  return (
    <Dialog open={!!imprest} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <StatusBadge status={imprest.status} />
            <DialogTitle>Imprest Request Details</DialogTitle>
          </div>
          <DialogDescription className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            Submitted on {formatDate(imprest.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className=" pr-4 h-[70vh]">
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-2 bg-muted/30 rounded-t-lg">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    Request Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between items-center pb-2 border-b border-border/30">
                      <dt className="text-muted-foreground">Payment Reason:</dt>
                      <dd className="font-medium">{imprest.paymentReason}</dd>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border/30">
                      <dt className="text-muted-foreground">Amount:</dt>
                      <dd className="font-medium text-primary">
                        {formatCurrency(imprest.amount, imprest.currency)}
                      </dd>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border/30">
                      <dt className="text-muted-foreground">Payment Type:</dt>
                      <dd className="font-medium">{imprest.paymentType}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-2 bg-muted/30 rounded-t-lg">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Requester Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between items-center pb-2 border-b border-border/30">
                      <dt className="text-muted-foreground">Name:</dt>
                      <dd className="font-medium">
                        {imprest.requestedBy.firstName}{" "}
                        {imprest.requestedBy.lastName}
                      </dd>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border/30">
                      <dt className="text-muted-foreground">Email:</dt>
                      <dd className="font-medium">
                        {imprest.requestedBy.email}
                      </dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-muted-foreground">Department:</dt>
                      <dd className="font-medium capitalize">
                        {imprest.requestedBy.department}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-2 bg-muted/30 rounded-t-lg">
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  Explanation
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm bg-muted/20 p-3 rounded-md border border-border/30">
                  {imprest.explanation}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-2 bg-muted/30 rounded-t-lg">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Approval Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ApprovalTimeline imprest={imprest} />
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
