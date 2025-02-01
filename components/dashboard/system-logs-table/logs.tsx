"use client";

import { DataTable } from "./components/data-table";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { columns } from "./components/columns";
import { SystemLog } from "@/types/dashboard";
import { useState, useEffect } from "react";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { getSystemLogs } from "@/services/dashboard.service";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function LogsTable({
  logs: initialLogs,
}: {
  logs: SystemLog[];
}) {
  const [logs, setLogs] = useState<SystemLog[]>(initialLogs);
  const [date, setDate] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  useEffect(() => {
    const fetchLogs = async () => {
      if (date.from && date.to) {
        const startDate = date.from.toISOString();
        const endDate = date.to.toISOString();
        const newLogs = await getSystemLogs(startDate, endDate);
        setLogs(newLogs);
      }
    };

    fetchLogs();
  }, [date]);

  return (
    <div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>System Logs</CardTitle>
          <CardDescription>
            View and analyze system events, tracking important activities and
            potential issues.
          </CardDescription>
        </div>
        <div className="flex items-center space-x-4 py-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[260px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={(range) => {
                  if (range) {
                    setDate({ from: range.from, to: range.to });
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
        <DataTable data={logs} columns={columns} />
      </div>
    </div>
  );
}
