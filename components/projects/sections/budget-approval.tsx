"use client";
import { format, isAfter } from "date-fns";
import Countdown from "react-countdown";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Pencil,
  Eye,
  ClipboardCheck,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircleIcon,
  AlertCircleIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ComprehensiveAuditTrail } from "./improved-audit-trail";
import { BudgetAuditTrailItem } from "@/types/budget";
import { User } from "@/types/project";
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  approveBudget,
  rejectBudget,
  requestBudgetRevision,
} from "@/services/budget.service";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";

type BudgetApprovalProps = {
  status?: string;
  createdBy?: User;
  updatedBy?: User;
  auditTrail?: BudgetAuditTrailItem[];
  currentLevelDeadline?: string;
  budgetId: string;
};

interface ActionFormProps {
  type: "approve" | "reject" | "revise";
  onSubmit: (data: {
    comments?: string;
    reason?: string;
    changes?: string[];
  }) => Promise<void>;
  onCancel: () => void;
}

function ActionForm({ type, onSubmit, onCancel }: ActionFormProps) {
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        comments: type === "approve" ? comments : undefined,
        reason: type === "reject" ? comments : undefined,
        changes:
          type === "revise" ? comments.split("\n").filter(Boolean) : undefined,
      });
      setComments("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 border rounded-lg bg-muted/30"
    >
      <div className="space-y-2">
        <h3 className="font-medium">
          {type === "approve"
            ? "Approve Budget"
            : type === "reject"
            ? "Reject Budget"
            : "Request Revision"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {type === "approve"
            ? "Add any comments for this approval"
            : type === "reject"
            ? "Please provide a reason for rejection"
            : "List the changes needed (one per line)"}
        </p>
      </div>

      <Textarea
        autoFocus
        className="min-h-[100px] w-full resize-none focus-visible:ring-1"
        placeholder={
          type === "approve"
            ? "Enter approval comments..."
            : type === "reject"
            ? "Enter rejection reason..."
            : "Enter revision changes (one per line)..."
        }
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        required
      />

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!comments.trim() || isSubmitting}
          variant={
            type === "approve"
              ? "default"
              : type === "reject"
              ? "destructive"
              : "secondary"
          }
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <Spinner />
              <span>Processing...</span>
            </div>
          ) : (
            "Confirm"
          )}
        </Button>
      </div>
    </form>
  );
}

const getStepFromStatus = (status: string) => {
  switch (status) {
    case "draft":
      return 1;
    case "pending_checker_approval":
      return 2;
    case "pending_manager_approval":
      return 3;
    case "pending_finance_approval":
      return 4;
    case "approved":
      return 5;
    case "revision_requested":
    case "rejected":
      return -1; // Special handling for these states
    default:
      return 1;
  }
};

const approvalSteps = [
  { step: 1, title: "Draft", description: "Budget in draft", status: "draft" },
  {
    step: 2,
    title: "Checker",
    description: "Pending checker approval",
    status: "pending_checker_approval",
  },
  {
    step: 3,
    title: "Manager",
    description: "Pending manager approval",
    status: "pending_manager_approval",
  },
  {
    step: 4,
    title: "Finance",
    description: "Pending finance approval",
    status: "pending_finance_approval",
  },
  {
    step: 5,
    title: "Approved",
    description: "Budget approved",
    status: "approved",
  },
];

const getStepStatusClass = (stepStatus: number, currentStatus: string) => {
  const currentStep = getStepFromStatus(currentStatus);

  if (currentStatus === "revision_requested" || currentStatus === "rejected") {
    return "bg-destructive text-destructive-foreground";
  }

  if (stepStatus < currentStep) {
    return "bg-primary text-primary-foreground"; // completed
  } else if (stepStatus === currentStep) {
    return "bg-primary text-primary-foreground animate-pulse"; // current
  }
  return "bg-muted text-muted-foreground"; // upcoming
};

const CountdownRenderer = ({
  days,
  hours,
  minutes,
  seconds,
  completed,
}: any) => {
  if (completed) {
    return (
      <div className="flex items-center text-destructive">
        <AlertTriangle className="w-4 h-4 mr-2" />
        <span>Deadline passed</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4 mt-2">
      <div className="flex flex-col items-center">
        <div className="text-2xl font-bold">{days}</div>
        <div className="text-xs text-muted-foreground">Days</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-2xl font-bold">{hours}</div>
        <div className="text-xs text-muted-foreground">Hours</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-2xl font-bold">{minutes}</div>
        <div className="text-xs text-muted-foreground">Minutes</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-2xl font-bold">{seconds}</div>
        <div className="text-xs text-muted-foreground">Seconds</div>
      </div>
    </div>
  );
};

const getDeadlineStatus = (deadline?: string) => {
  if (!deadline)
    return { color: "text-muted-foreground", text: "No deadline set" };

  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffInDays = Math.ceil(
    (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (isAfter(now, deadlineDate)) {
    return { color: "text-destructive", text: "Deadline passed" };
  }
  if (diffInDays <= 2) {
    return { color: "text-warning", text: "Due soon" };
  }
  return { color: "text-primary", text: "On track" };
};

const shouldShowAction = (
  action: "approve" | "reject" | "revise",
  status: string
) => {
  switch (action) {
    case "approve":
      return [
        "draft",
        "pending_checker_approval",
        "pending_manager_approval",
        "pending_finance_approval",
      ].includes(status);
    case "reject":
      return [
        "pending_checker_approval",
        "pending_manager_approval",
        "pending_finance_approval",
      ].includes(status);
    case "revise":
      return [
        "pending_checker_approval",
        "pending_manager_approval",
        "pending_finance_approval",
      ].includes(status);
    default:
      return false;
  }
};

export default function ImprovedBudgetApprovalComponent({
  status = "draft",
  createdBy,
  updatedBy,
  auditTrail = [],
  currentLevelDeadline,
  budgetId,
}: BudgetApprovalProps) {
  const { toast } = useToast();
  const [actionType, setActionType] = useState<
    "approve" | "reject" | "revise" | null
  >(null);

  const router = useRouter();

  const getCurrentLevel = () => {
    if (status === "pending_checker_approval") return "1";
    if (status === "pending_manager_approval") return "2";
    if (status === "pending_finance_approval") return "3";
    return "1";
  };

  const handleAction = async (data: {
    comments?: string;
    reason?: string;
    changes?: string[];
  }) => {
    if (!budgetId) {
      toast({
        title: "Error",
        description: "Budget ID is required for this action",
        variant: "destructive",
      });
      return;
    }

    try {
      if (actionType === "approve") {
        await approveBudget(budgetId, data?.comments || "");
        toast({
          title: "Budget Approved",
          description: "The budget has been successfully approved.",
        });
        // Delay reload to ensure any dialogs close first
        setTimeout(() => window.location.reload(), 100);
      } else if (actionType === "reject") {
        await rejectBudget(budgetId, {
          reason: data?.reason || "",
          level: getCurrentLevel(),
        });
        toast({
          title: "Budget Rejected",
          description: "The budget has been rejected.",
        });
        // Delay reload to ensure any dialogs close first
        setTimeout(() => window.location.reload(), 100);
      } else if (actionType === "revise") {
        await requestBudgetRevision(budgetId, {
          comments: data?.changes?.join("\n") || "",
          changes: data?.changes || [],
        });
        toast({
          title: "Revision Requested",
          description: "A revision has been requested for this budget.",
        });
        // Delay reload to ensure any dialogs close first
        setTimeout(() => window.location.reload(), 100);
      }
      setActionType(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "An error occurred while processing your request.",
        variant: "destructive",
      });
    }
  };

  const isDeadlinePassed = currentLevelDeadline
    ? isAfter(new Date(), new Date(currentLevelDeadline))
    : false;

  const statusInfo = useMemo(() => {
    switch (status) {
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
  }, [status]);

  const deadlineStatus = getDeadlineStatus(currentLevelDeadline);

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">Created by:</p>
              <Badge variant="outline" className="text-xs">
                {createdBy?.firstName || "N/A"} {createdBy?.lastName || ""}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">Last updated by:</p>
              <Badge variant="outline" className="text-xs">
                {updatedBy?.firstName || "N/A"} {updatedBy?.lastName || ""}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge
              className={`${statusInfo.color} px-3 py-1 text-sm font-medium rounded-full`}
            >
              <statusInfo.icon className="w-4 h-4 mr-1 inline" />
              {(status || "draft").replace(/_/g, " ")}
            </Badge>
            <span className={`text-xs ${deadlineStatus.color}`}>
              {deadlineStatus.text}
            </span>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Approval Progress</h3>
            <div className="relative">
              {status === "revision_requested" && (
                <div className="absolute -top-6 left-0 right-0 text-center">
                  <Badge variant="destructive">Revision Requested</Badge>
                </div>
              )}
              {status === "rejected" && (
                <div className="absolute -top-6 left-0 right-0 text-center">
                  <Badge variant="destructive">Rejected</Badge>
                </div>
              )}
              <div className="flex items-center justify-between">
                {approvalSteps.map((step, index) => (
                  <React.Fragment key={step.step}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${getStepStatusClass(
                          step.step,
                          status || "draft"
                        )}`}
                      >
                        {step.step}
                      </div>
                      <p className="mt-2 text-xs font-medium">{step.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                    {index < approvalSteps.length - 1 && (
                      <div
                        className={`h-[2px] flex-1 mx-2 ${
                          step.step < getStepFromStatus(status || "draft")
                            ? "bg-primary"
                            : "bg-muted"
                        }`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Deadline Status
            </h3>
            {currentLevelDeadline ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Due: {format(new Date(currentLevelDeadline), "PPP 'at' p")}
                  </p>
                  <Badge variant="outline" className={deadlineStatus.color}>
                    {deadlineStatus.text}
                  </Badge>
                </div>
                <div
                  className={`rounded-lg p-4 ${
                    isDeadlinePassed ? "bg-destructive/10" : "bg-muted"
                  }`}
                >
                  <Countdown
                    date={new Date(currentLevelDeadline)}
                    renderer={CountdownRenderer}
                    onComplete={() => {
                      toast({
                        title: "Deadline Passed",
                        description: "The budget approval deadline has passed.",
                        variant: "destructive",
                      });
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-lg p-4 bg-muted flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No deadline set</p>
              </div>
            )}
          </div>

          {actionType ? (
            <ActionForm
              type={actionType}
              onSubmit={handleAction}
              onCancel={() => setActionType(null)}
            />
          ) : (
            <div className="mt-6 space-y-4">
              <h4 className="font-medium">Available Actions</h4>
              <div className="flex gap-2">
                {shouldShowAction("approve", status) && (
                  <Button
                    onClick={() => setActionType("approve")}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve
                  </Button>
                )}

                {shouldShowAction("reject", status) && (
                  <Button
                    variant="destructive"
                    onClick={() => setActionType("reject")}
                    className="flex items-center gap-2"
                  >
                    <XCircleIcon className="h-4 w-4" />
                    Reject
                  </Button>
                )}

                {shouldShowAction("revise", status) && (
                  <Button
                    variant="secondary"
                    onClick={() => setActionType("revise")}
                    className="flex items-center gap-2"
                  >
                    <AlertCircleIcon className="h-4 w-4" />
                    Request Revision
                  </Button>
                )}
              </div>
              <div className="pt-4">
                <ComprehensiveAuditTrail auditTrail={auditTrail} />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
