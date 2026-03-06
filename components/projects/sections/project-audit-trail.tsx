"use client";

import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, User, Calendar, FileEdit } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface AuditEntry {
  updatedBy:
    | {
        firstName?: string;
        lastName?: string;
        email?: string;
        _id?: string;
      }
    | string;
  updatedAt: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  reason?: string;
}

interface ProjectAuditTrailProps {
  auditTrail: AuditEntry[];
}

const getUserName = (updatedBy: any): string => {
  if (!updatedBy) return "Unknown User";

  // If it's just a string (user ID), return it
  if (typeof updatedBy === "string") {
    return `User ID: ${updatedBy.substring(0, 8)}...`;
  }

  // If it's an object with user details
  if (updatedBy.firstName && updatedBy.lastName) {
    return `${updatedBy.firstName} ${updatedBy.lastName}`;
  }

  if (updatedBy.email) {
    return updatedBy.email;
  }

  if (updatedBy._id) {
    return `User ID: ${updatedBy._id.substring(0, 8)}...`;
  }

  return "Unknown User";
};

const getUserEmail = (updatedBy: any): string => {
  if (!updatedBy) return "";

  if (typeof updatedBy === "string") {
    return updatedBy;
  }

  return updatedBy.email || updatedBy._id || "";
};

const formatFieldName = (field: string): string => {
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

const formatValue = (value: any): string => {
  if (value === null || value === undefined) return "Not set";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(", ") : "Empty";
    }
    return JSON.stringify(value, null, 2);
  }
  if (typeof value === "number") return value.toLocaleString();

  // Check if it's a date string
  const date = new Date(value);
  if (!isNaN(date.getTime()) && value.includes("-")) {
    return format(date, "PPP");
  }

  return String(value);
};

const getFieldBadgeColor = (field: string): string => {
  const criticalFields = ["status", "totalProjectValue", "amountSpent"];
  const importantFields = [
    "contractStartDate",
    "contractEndDate",
    "department",
  ];

  if (criticalFields.includes(field)) return "destructive";
  if (importantFields.includes(field)) return "default";
  return "secondary";
};

export function ProjectAuditTrail({ auditTrail }: ProjectAuditTrailProps) {
  if (!auditTrail || auditTrail.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Update History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No updates have been made to this project yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Update History
          <Badge variant="secondary" className="ml-auto">
            {auditTrail.length} {auditTrail.length === 1 ? "update" : "updates"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <Accordion type="single" collapsible className="w-full">
            {auditTrail
              .slice()
              .reverse()
              .map((entry, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border rounded-lg mb-3 px-4"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-start gap-3 text-left w-full">
                      <div className="mt-1">
                        <FileEdit className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">
                            {getUserName(entry.updatedBy)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {entry.changes.length}{" "}
                            {entry.changes.length === 1 ? "change" : "changes"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(entry.updatedAt), "PPP 'at' p")}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      {entry.reason && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-sm font-medium mb-1">
                            Reason for Update:
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {entry.reason}
                          </p>
                        </div>
                      )}

                      <div className="space-y-3">
                        <p className="text-sm font-medium">Changes Made:</p>
                        {entry.changes.map((change, changeIndex) => (
                          <div
                            key={changeIndex}
                            className="border rounded-lg p-3 space-y-2"
                          >
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  getFieldBadgeColor(change.field) as any
                                }
                                className="text-xs"
                              >
                                {formatFieldName(change.field)}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">
                                  Previous Value:
                                </p>
                                <div className="bg-red-50 dark:bg-red-950/20 rounded p-2 border border-red-200 dark:border-red-900">
                                  <p className="text-red-900 dark:text-red-100 break-words whitespace-pre-wrap">
                                    {formatValue(change.oldValue)}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">
                                  New Value:
                                </p>
                                <div className="bg-green-50 dark:bg-green-950/20 rounded p-2 border border-green-200 dark:border-green-900">
                                  <p className="text-green-900 dark:text-green-100 break-words whitespace-pre-wrap">
                                    {formatValue(change.newValue)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                        <User className="h-3 w-3" />
                        <span>Updated by {getUserEmail(entry.updatedBy)}</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
