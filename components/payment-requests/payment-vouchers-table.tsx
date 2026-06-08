"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Eye,
  Search,
  Filter,
  RefreshCw,
  Receipt,
  DollarSign,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PaymentVoucher } from "@/types/payment-request";
import { PaymentVoucherStatus } from "@/types/payment-request";

// ─── Status Config ────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  [PaymentVoucherStatus.PENDING_FINANCE_APPROVAL]: {
    label: "Pending Approval",
    className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    icon: <Clock className="h-3 w-3" />,
  },
  [PaymentVoucherStatus.APPROVED]: {
    label: "Approved",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    icon: <CheckCircle className="h-3 w-3" />,
  },
  [PaymentVoucherStatus.REVISION_REQUESTED]: {
    label: "Revision Requested",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: <RotateCcw className="h-3 w-3" />,
  },
  [PaymentVoucherStatus.REJECTED]: {
    label: "Rejected",
    className: "bg-destructive/10 text-destructive border-destructive/20",
    icon: <XCircle className="h-3 w-3" />,
  },
  [PaymentVoucherStatus.PAID]: {
    label: "Paid",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: <CheckCircle className="h-3 w-3" />,
  },
};

// ─── Summary Cards ────────────────────────────────────────────────────────────

function SummaryCards({ vouchers }: { vouchers: PaymentVoucher[] }) {
  const total = vouchers.length;
  const pending = vouchers.filter((v) => v.status === PaymentVoucherStatus.PENDING_FINANCE_APPROVAL).length;
  const approved = vouchers.filter((v) => v.status === PaymentVoucherStatus.APPROVED).length;
  const paid = vouchers.filter((v) => v.status === PaymentVoucherStatus.PAID).length;
  const totalPaid = vouchers
    .filter((v) => v.status === PaymentVoucherStatus.PAID)
    .reduce((sum, v) => sum + v.amount, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {[
        { label: "Total Vouchers", value: total, icon: <Receipt className="h-5 w-5 text-primary" />, className: "bg-primary/5 border-primary/10" },
        { label: "Pending Approval", value: pending, icon: <Clock className="h-5 w-5 text-yellow-500" />, className: "bg-yellow-500/5 dark:bg-yellow-500/10 border-yellow-500/20" },
        { label: "Approved (Pending Payment)", value: approved, icon: <CheckCircle className="h-5 w-5 text-blue-500" />, className: "bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/20" },
        { label: "Paid", value: paid, icon: <DollarSign className="h-5 w-5 text-emerald-500" />, className: "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20" },
      ].map((card) => (
        <Card key={card.label} className={`border ${card.className}`}>
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              </div>
              <div className="opacity-80">{card.icon}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Main Table ───────────────────────────────────────────────────────────────

interface Props {
  vouchers: PaymentVoucher[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onView?: (voucher: PaymentVoucher) => void;
  title?: string;
}

export function PaymentVouchersTable({ vouchers, isLoading, onRefresh, onView, title = "Payment Vouchers" }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = vouchers.filter((v) => {
    const pr = v.paymentRequestId as any;
    const matchesSearch =
      !search ||
      v.voucherNo?.toLowerCase().includes(search.toLowerCase()) ||
      pr?.lpoId?.lpoNo?.toLowerCase().includes(search.toLowerCase()) ||
      pr?.projectId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      `${v.preparedBy?.firstName} ${v.preparedBy?.lastName}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <SummaryCards vouchers={vouchers} />

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-lg">{title}</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by voucher no, project, LPO..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-[260px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={PaymentVoucherStatus.PENDING_FINANCE_APPROVAL}>Pending Approval</SelectItem>
                  <SelectItem value={PaymentVoucherStatus.APPROVED}>Approved</SelectItem>
                  <SelectItem value={PaymentVoucherStatus.REVISION_REQUESTED}>Revision Requested</SelectItem>
                  <SelectItem value={PaymentVoucherStatus.REJECTED}>Rejected</SelectItem>
                  <SelectItem value={PaymentVoucherStatus.PAID}>Paid</SelectItem>
                </SelectContent>
              </Select>
              {onRefresh && (
                <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2">
          <div className="rounded-md border-t overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Voucher No</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>LPO No.</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Prepared By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                      Loading payment vouchers...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      <Receipt className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="font-medium">No payment vouchers found</p>
                      <p className="text-sm mt-1">
                        {search || statusFilter !== "all"
                          ? "Try adjusting your search or filters"
                          : "No payment vouchers have been created yet"}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((voucher) => {
                    const pr = voucher.paymentRequestId as any;
                    const sc = statusConfig[voucher.status] || statusConfig[PaymentVoucherStatus.PENDING_FINANCE_APPROVAL];
                    return (
                      <TableRow
                        key={voucher._id}
                        className="hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => onView?.(voucher)}
                      >
                        <TableCell>
                          <span className="font-mono text-sm font-bold text-primary">{voucher.voucherNo}</span>
                        </TableCell>
                        <TableCell className="font-medium max-w-[160px] truncate">
                          {pr?.projectId?.name || "—"}
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">{pr?.lpoId?.lpoNo || "—"}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">
                            {pr?.currency || "KES"} {voucher.amount.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {voucher.preparedBy?.firstName} {voucher.preparedBy?.lastName}
                        </TableCell>
                        <TableCell>
                          <Badge className={`flex items-center gap-1 w-fit text-xs ${sc.className}`}>
                            {sc.icon} {sc.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {format(new Date(voucher.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); onView?.(voucher); }}
                            className="gap-1"
                          >
                            <Eye className="h-3.5 w-3.5" /> View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t text-sm text-muted-foreground">
              Showing {filtered.length} of {vouchers.length} vouchers
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
