"use client";

import { useState } from "react";
import { Lpo } from "@/types/lpo";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface LposModuleProps {
  initialData: Lpo[];
}

export default function LposModule({ initialData }: LposModuleProps) {
  const [data] = useState<Lpo[]>(initialData);

  const stats = [
    {
      title: "Total LPOs",
      value: data.length,
      icon: FileText,
      description: "Across all projects",
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Pending Approval",
      value: data.filter(
        (l) => l.status === "submitted" || l.status === "hod_approved",
      ).length,
      icon: Clock,
      description: "Awaiting HOD/Finance",
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      title: "Fully Approved",
      value: data.filter((l) => l.status === "finance_approved").length,
      icon: CheckCircle2,
      description: "Ready for dispatch",
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      title: "Total Commitment",
      value: new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 0,
      }).format(data.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0)),
      icon: TrendingUp,
      description: "Total value of all LPOs",
      color: "text-primary",
      bg: "bg-primary/5",
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-2 pt-2">
      <div className="flex items-center justify-between space-y-0.5">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            LPO Management
          </h2>
          <p className="text-muted-foreground">
            Monitor, review and approve Local Purchase Orders across the
            organization.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge
            variant="outline"
            className="px-3 py-1 bg-muted/50 font-bold border-dashed"
          >
            <History className="h-3.5 w-3.5 mr-2" />
            LPO Registry v2.0
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <Card
            key={idx}
            className="overflow-hidden border-none shadow-md ring-1 ring-muted/50 hover:ring-primary/20 transition-all duration-300"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={cn("p-2 rounded-lg", stat.bg)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                {stat.description}
              </p>
              <div className={cn("h-1 w-full mt-4 rounded-full", stat.bg)}>
                <div
                  className={cn(
                    "h-full rounded-full",
                    stat.color.replace("text", "bg"),
                  )}
                  style={{
                    width: `${Math.min(typeof stat.value === "number" ? (stat.value / (data.length || 1)) * 100 : 100, 100)}%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="border-none shadow-xl ring-1 ring-muted/50 overflow-hidden">
        <CardHeader className="bg-muted/10 pb-6 border-b">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            LPO Registry
          </CardTitle>
          <CardDescription>
            A history of all purchase orders issued. Use the actions menu to
            view full details or approve pending items.
          </CardDescription>
        </CardHeader>
        <div className="p-2">
          <DataTable data={data} columns={columns} />
        </div>
      </div>
    </div>
  );
}
