"use client";

import { useState } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Pencil,
  Eye,
  ClipboardCheck,
  DollarSign,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import { ComprehensiveAuditTrail } from "./improved-audit-trail";
import { AuditTrailItem, User } from "@/types/project";

type BudgetApprovalProps = {
  status: string;
  createdBy: User;
  updatedBy: User;
  auditTrail: AuditTrailItem[];
  currentLevelDeadline?: string;
};

const approvalSteps = [
  { step: 1, title: "Creator", description: "Budget created" },
  { step: 2, title: "Checker", description: "Initial review" },
  { step: 3, title: "Manager", description: "Management approval" },
  { step: 4, title: "Finance", description: "Final approval" },
];

export default function ImprovedBudgetApprovalComponent({
  status,
  createdBy,
  updatedBy,
  auditTrail,
  currentLevelDeadline,
}: BudgetApprovalProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "No deadline set";
      }
      return format(date, "MMM d, yyyy HH:mm:ss");
    } catch (error) {
      return "No deadline set";
    }
  };
  const getCurrentApprovalLevel = () => {
    const lastAction = auditTrail[auditTrail.length - 1];
    if (lastAction?.details?.level) {
      return (
        approvalSteps.findIndex(
          (step) => step.title.toLowerCase() === lastAction?.details?.level
        ) + 1
      );
    }
    return 1;
  };

  const statusInfo = getStatusInfo(status);
  const currentLevel = getCurrentApprovalLevel();

  return (
    <Card className=" shadow-lg">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-muted-foreground">
              Created by: {createdBy.firstName} {createdBy.lastName}
            </p>
            <p className="text-sm text-muted-foreground">
              Last updated by: {updatedBy.firstName} {updatedBy.lastName}
            </p>
          </div>
          <Badge
            className={`${statusInfo.color}  px-3 py-1 text-sm font-medium rounded-full`}
          >
            <statusInfo.icon className="w-4 h-4 mr-1 inline" />
            {status.replace("_", " ")}
          </Badge>
        </div>

        <Separator className="my-6" />

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Approval Progress</h3>
            <Stepper value={currentLevel} className="w-full">
              {approvalSteps.map(({ step, title, description }) => (
                <StepperItem
                  key={step}
                  step={step}
                  completed={step < currentLevel}
                  className="max-md:items-start [&:not(:last-child)]:flex-1"
                >
                  <StepperTrigger className="gap-4 max-md:flex-col">
                    <StepperIndicator />
                    <div className="text-center md:text-left">
                      <StepperTitle>{title}</StepperTitle>
                      <StepperDescription className="max-sm:hidden">
                        {description}
                      </StepperDescription>
                    </div>
                  </StepperTrigger>
                  {step < approvalSteps.length && (
                    <StepperSeparator className="max-md:mt-3.5 md:mx-4" />
                  )}
                </StepperItem>
              ))}
            </Stepper>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              Current Level Deadline
            </h3>
            <p className="text-sm text-muted-foreground">
              {formatDate(currentLevelDeadline ?? "")}
            </p>
          </div>

          <ComprehensiveAuditTrail auditTrail={auditTrail} />
        </div>
      </CardContent>
    </Card>
  );
}

export const getStatusInfo = (status: string) => {
  switch (status.toLowerCase()) {
    case "approved":
      return { color: "bg-green-500", icon: CheckCircle };
    case "rejected":
      return { color: "bg-red-500", icon: XCircle };
    case "submitted_for_approval":
      return { color: "bg-blue-500", icon: Clock };
    case "updated":
      return { color: "bg-yellow-500", icon: Clock };
    case "pending_approval":
      return { color: "bg-yellow-500", icon: Clock };
    case "revision_requested":
      return { color: "bg-orange-500", icon: AlertCircle };
    case "draft":
      return { color: "bg-gray-400", icon: Pencil };
    case "pending_checker_approval":
      return { color: "bg-purple-500", icon: Eye };
    case "pending_manager_approval":
      return { color: "bg-teal-500", icon: ClipboardCheck };
    case "pending_finance_approval":
      return { color: "bg-indigo-500", icon: DollarSign };
    default:
      return { color: "bg-gray-500", icon: XCircle };
  }
};
