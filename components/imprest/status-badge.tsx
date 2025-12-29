import React from "react";
import {
  Check,
  CreditCard,
  Clock,
  Info,
  AlertTriangle,
  CheckCircle,
  FileCheck,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusMap: Record<
    string,
    { color: string; bgColor: string; label: string; icon: React.ReactNode }
  > = {
    pending_hod: {
      color: "text-amber-700 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/50",
      label: "Pending HOD",
      icon: <Clock className="h-3.5 w-3.5" />,
    },
    pending_accountant: {
      color: "text-orange-700 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/50",
      label: "Pending Accountant",
      icon: <Clock className="h-3.5 w-3.5" />,
    },
    pending_accounting_approval: {
      color: "text-orange-700 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/50",
      label: "Pending Accounting Approval",
      icon: <Clock className="h-3.5 w-3.5" />,
    },
    approved: {
      color: "text-emerald-700 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
      label: "Approved",
      icon: <CheckCircle className="h-3.5 w-3.5" />,
    },
    rejected: {
      color: "text-rose-700 dark:text-rose-400",
      bgColor: "bg-rose-50 dark:bg-rose-950/50",
      label: "Rejected",
      icon: <XCircle className="h-3.5 w-3.5" />,
    },
    disbursed: {
      color: "text-blue-700 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
      label: "Disbursed",
      icon: <CreditCard className="h-3.5 w-3.5" />,
    },
    pending_acknowledgment: {
      color: "text-amber-700 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/50",
      label: "Pending Acknowledgment",
      icon: <Clock className="h-3.5 w-3.5" />,
    },
    disputed: {
      color: "text-red-700 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/50",
      label: "Disputed",
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
    },
    resolved_dispute: {
      color: "text-purple-700 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/50",
      label: "Resolved Dispute",
      icon: <CheckCircle className="h-3.5 w-3.5" />,
    },
    accounted: {
      color: "text-indigo-700 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/50",
      label: "Accounted",
      icon: <FileCheck className="h-3.5 w-3.5" />,
    },
    overdue: {
      color: "text-red-700 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/50",
      label: "Overdue",
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
    },
  };

  const { color, bgColor, label, icon } = statusMap[status] || {
    color: "text-gray-700 dark:text-gray-400",
    bgColor: "bg-gray-50 dark:bg-gray-800/50",
    label: status,
    icon: <Info className="h-3.5 w-3.5" />,
  };

  return (
    <Badge
      variant="outline"
      className={`${color} ${bgColor} border-0 flex items-center gap-1.5 px-2.5 py-1 capitalize font-medium shadow-sm`}
    >
      {icon}
      {label}
    </Badge>
  );
};
