"use client";

import { Card } from "@/components/ui/card";

import { SystemLog } from "@/types/dashboard";
import LogsTable from "./system-logs-table/logs";

export function SystemLogs({ systemLogs }: { systemLogs: SystemLog[] }) {
  return (
    <Card className="w-full shadow-md">
      <LogsTable logs={systemLogs} />
    </Card>
  );
}
