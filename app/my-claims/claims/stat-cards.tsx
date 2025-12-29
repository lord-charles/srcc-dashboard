"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BanknoteIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Claim } from "@/types/claim";

interface ClaimsStatCardsProps {
  claims: Claim[];
}

export function ClaimsStatCards({ claims }: ClaimsStatCardsProps) {
  const [counts, setCounts] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
  });

  const totalClaims = claims.length;
  const totalAmount = claims.reduce((sum, claim) => sum + claim.amount, 0);

  const approvedClaims = claims.filter((c) => c.status === "approved").length;
  const rejectedClaims = claims.filter((c) => c.status === "rejected").length;
  const pendingClaims = claims.filter((c) =>
    c.status.includes("pending")
  ).length;

  const currencies = claims.map((c) => c.currency);
  const mostCommonCurrency =
    currencies.length > 0
      ? currencies
          .sort(
            (a, b) =>
              currencies.filter((v) => v === a).length -
              currencies.filter((v) => v === b).length
          )
          .pop()
      : "KES";

  const trend = 12.5;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCounts({
        total: totalClaims,
        approved: approvedClaims,
        rejected: rejectedClaims,
        pending: pendingClaims,
      });
    }, 100);

    return () => clearTimeout(timeout);
  }, [totalClaims, approvedClaims, rejectedClaims, pendingClaims]);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    footer,
  }: {
    title: string;
    value: number;
    icon: React.ElementType;
    footer?: React.ReactNode;
  }) => (
    <Card className="transition-shadow hover:shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
          <Icon className="h-4 w-4 text-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        {footer && (
          <div className="mt-1 text-xs text-muted-foreground">{footer}</div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <StatCard
          title="Total Claims"
          value={counts.total}
          icon={BanknoteIcon}
          footer={`Total value: ${formatCurrency(
            totalAmount,
            mostCommonCurrency
          )}`}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <StatCard
          title="Approved Claims"
          value={counts.approved}
          icon={CheckCircleIcon}
          footer={
            <span className="inline-flex items-center gap-1">
              {trend > 0 ? (
                <ArrowUpIcon className="h-3 w-3" />
              ) : (
                <ArrowDownIcon className="h-3 w-3" />
              )}
              {Math.abs(trend)}% from previous period
            </span>
          }
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <StatCard
          title="Rejected Claims"
          value={counts.rejected}
          icon={XCircleIcon}
          footer={
            rejectedClaims > 0
              ? `${Math.round(
                  (rejectedClaims / totalClaims) * 100
                )}% of total claims`
              : "No rejected claims"
          }
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <StatCard
          title="Pending Claims"
          value={counts.pending}
          icon={ClockIcon}
          footer={
            pendingClaims > 0
              ? `${Math.round(
                  (pendingClaims / totalClaims) * 100
                )}% of total claims`
              : "No pending claims"
          }
        />
      </motion.div>
    </div>
  );
}
