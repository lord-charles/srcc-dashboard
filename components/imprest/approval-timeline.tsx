import React from "react";
import { Check, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Imprest } from "./imprest-dashboard";
import { formatDate } from "./utils";

interface ApprovalTimelineProps {
  imprest: Imprest;
}

// Calculate approval progress percentage
const calculateApprovalProgress = (imprest: Imprest) => {
  if (imprest.status === "rejected") return 100;
  if (imprest.status === "approved") return 100;
  if (imprest.status === "disbursed") return 100;

  let progress = 0;
  if (imprest.hodApproval) progress += 50;
  if (imprest.accountantApproval) progress += 50;

  return progress;
};

export const ApprovalTimeline = ({ imprest }: ApprovalTimelineProps) => {
  return (
    <div className="space-y-4 py-2">
      <div className="flex justify-between mb-2">
        <div className="text-sm font-medium">Approval Progress</div>
        <div className="text-sm text-muted-foreground">
          {calculateApprovalProgress(imprest)}%
        </div>
      </div>
      <Progress
        value={calculateApprovalProgress(imprest)}
        className="h-2.5 rounded-full"
      />

      <div className="space-y-4 mt-5 relative before:absolute before:left-[11px] before:top-1 before:h-[calc(100%-8px)] before:w-0.5 before:bg-muted">
        <div className="flex items-start gap-4 relative z-10">
          <div
            className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center shadow-sm ${
              imprest.hodApproval
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {imprest.hodApproval ? <Check className="h-3.5 w-3.5" /> : "1"}
          </div>
          <div className="bg-background dark:bg-card rounded-lg p-3 shadow-sm border border-border/50 flex-1">
            <div className="font-medium text-sm">HOD Approval</div>
            {imprest.hodApproval ? (
              <div className="text-xs text-muted-foreground mt-1">
                {formatDate(imprest.hodApproval.approvedAt)} by{" "}
                {imprest.hodApproval.approvedBy.firstName}{" "}
                {imprest.hodApproval.approvedBy.lastName}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground mt-1">Pending</div>
            )}
            {imprest.hodApproval?.comments && (
              <div className="text-xs mt-2 italic bg-muted/50 p-2 rounded-md">
                {imprest.hodApproval.comments}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-start gap-4 relative z-10">
          <div
            className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center shadow-sm ${
              imprest.accountantApproval
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {imprest.accountantApproval ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              "2"
            )}
          </div>
          <div className="bg-background dark:bg-card rounded-lg p-3 shadow-sm border border-border/50 flex-1">
            <div className="font-medium text-sm">Accountant Approval</div>
            {imprest.accountantApproval ? (
              <div className="text-xs text-muted-foreground mt-1">
                {formatDate(imprest.accountantApproval.approvedAt)} by{" "}
                {imprest.accountantApproval.approvedBy.firstName}{" "}
                {imprest.accountantApproval.approvedBy.lastName}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground mt-1">
                {imprest.hodApproval
                  ? "In Progress"
                  : "Waiting for HOD Approval"}
              </div>
            )}
            {imprest.accountantApproval?.comments && (
              <div className="text-xs mt-2 italic bg-muted/50 p-2 rounded-md">
                {imprest.accountantApproval.comments}
              </div>
            )}
          </div>
        </div>

        {imprest.status === "rejected" && (
          <div className="mt-2 text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 p-3 rounded-md border border-rose-200 dark:border-rose-900/50">
            <div className="flex items-center gap-2 font-medium mb-1">
              <Info className="h-4 w-4" />
              Request Rejected
            </div>
            <p>Please review the comments and resubmit if necessary.</p>
          </div>
        )}
      </div>
    </div>
  );
};
