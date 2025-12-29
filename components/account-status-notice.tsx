import * as React from "react";
import { Clock, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccountStatusNoticeProps {
  status: "pending" | "suspended";
  className?: string;
}

export const AccountStatusNotice = React.forwardRef<
  HTMLDivElement,
  AccountStatusNoticeProps
>(({ status, className }, ref) => {
  const isPending = status === "pending";
  const isSuspended = status === "suspended";

  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full p-3 rounded-lg border transition-all",
        isPending &&
          "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-950/50",
        isSuspended &&
          "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-950/50",
        className
      )}
    >
      <div className="flex gap-3">
        <div className="shrink-0 mt-0.5">
          {isPending && (
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-500" />
          )}
          {isSuspended && (
            <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-500" />
          )}
        </div>
        <div className="flex-1 space-y-1">
          <h5 className="text-sm font-medium text-foreground">
            {isPending && "Account Pending"}
            {isSuspended && "Account Suspended"}
          </h5>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isPending &&
              "Your account is pending verification. You will be notified once it's approved."}
            {isSuspended &&
              "Your account has been suspended. Please contact support for assistance."}
          </p>
        </div>
      </div>
    </div>
  );
});

AccountStatusNotice.displayName = "AccountStatusNotice";
