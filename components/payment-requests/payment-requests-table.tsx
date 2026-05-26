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
  Plus,
  RefreshCw,
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
import type { PaymentRequest } from "@/types/payment-request";
import { PaymentRequestStatus } from "@/types/payment-request";

// ─── Status Config ────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  [PaymentRequestStatus.PENDING_HOD_APPROVAL]: {
    label: "Pending HOD Approval",
    className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    icon: <Clock className="h-3 w-3" />,
  },
  [PaymentRequestStatus.HOD_APPROVED]: {
    label: "HOD Approved",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: <CheckCircle className="h-3 w-3" />,
  },
  [PaymentRequestStatus.REVISION_REQUESTED]: {
    label: "Revision Requested",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: <RotateCcw className="h-3 w-3" />,
  },
  [PaymentRequestStatus.REJECTED]: {
    label: "Rejected",
    className: "bg-destructive/10 text-destructive border-destructive/20",
    icon: <XCircle className="h-3 w-3" />,
  },
};

// ─── Summary Cards ────────────────────────────────────────────────────────────

function SummaryCards({ requests }: { requests: PaymentRequest[] }) {
  const total = requests.length;
  const pending = requests.filter((r) => r.status === PaymentRequestStatus.PENDING_HOD_APPROVAL).length;
  const approved = requests.filter((r) => r.status === PaymentRequestStatus.HOD_APPROVED).length;
  const rejected = requests.filter((r) => r.status === PaymentRequestStatus.REJECTED).length;
  const totalAmount = requests.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {[
        { label: "Total Requests", value: total, icon: <DollarSign className="h-5 w-5 text-primary" />, className: "bg-primary/5 border-primary/10" },
        { label: "Pending Approval", value: pending, icon: <Clock className="h-5 w-5 text-yellow-500" />, className: "bg-yellow-500/5 dark:bg-yellow-500/10 border-yellow-500/20" },
        { label: "HOD Approved", value: approved, icon: <CheckCircle className="h-5 w-5 text-emerald-500" />, className: "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20" },
        { label: "Rejected", value: rejected, icon: <XCircle className="h-5 w-5 text-destructive" />, className: "bg-destructive/5 dark:bg-destructive/10 border-destructive/20" },
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
  requests: PaymentRequest[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onView?: (request: PaymentRequest) => void;
  showProjectColumn?: boolean;
  title?: string;
}

export function PaymentRequestsTable({
  requests,
  isLoading,
  onRefresh,
  onView,
  showProjectColumn = true,
  title = "Payment Requests",
}: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = requests.filter((r) => {
    const matchesSearch =
      !search ||
      (r.lpoId as any)?.lpoNo?.toLowerCase().includes(search.toLowerCase()) ||
      (r.projectId as any)?.name?.toLowerCase().includes(search.toLowerCase()) ||
      `${r.requestedBy?.firstName} ${r.requestedBy?.lastName}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <SummaryCards requests={requests} />

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-lg">{title}</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by LPO, project, requester..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-[240px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={PaymentRequestStatus.PENDING_HOD_APPROVAL}>Pending HOD</SelectItem>
                  <SelectItem value={PaymentRequestStatus.HOD_APPROVED}>HOD Approved</SelectItem>
                  <SelectItem value={PaymentRequestStatus.REVISION_REQUESTED}>Revision Requested</SelectItem>
                  <SelectItem value={PaymentRequestStatus.REJECTED}>Rejected</SelectItem>
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
        <CardContent className="p-0">
          <div className="rounded-md border-t overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  {showProjectColumn && <TableHead>Project</TableHead>}
                  <TableHead>LPO No.</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={showProjectColumn ? 7 : 6} className="text-center py-12 text-muted-foreground">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                      Loading payment requests...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={showProjectColumn ? 7 : 6} className="text-center py-12 text-muted-foreground">
                      <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="font-medium">No payment requests found</p>
                      <p className="text-sm mt-1">
                        {search || statusFilter !== "all"
                          ? "Try adjusting your search or filters"
                          : "No payment requests have been raised yet"}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((request) => {
                    const sc = statusConfig[request.status] || statusConfig[PaymentRequestStatus.PENDING_HOD_APPROVAL];
                    return (
                      <TableRow
                        key={request._id}
                        className="hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => onView?.(request)}
                      >
                        {showProjectColumn && (
                          <TableCell className="font-medium max-w-[160px] truncate">
                            {(request.projectId as any)?.name || "—"}
                          </TableCell>
                        )}
                        <TableCell>
                          <span className="font-mono text-sm font-semibold text-primary">
                            {(request.lpoId as any)?.lpoNo || "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">
                            {request.currency} {request.amount.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {request.requestedBy?.firstName} {request.requestedBy?.lastName}
                        </TableCell>
                        <TableCell>
                          <Badge className={`flex items-center gap-1 w-fit text-xs ${sc.className}`}>
                            {sc.icon} {sc.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {format(new Date(request.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); onView?.(request); }}
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
              Showing {filtered.length} of {requests.length} requests
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
