"use client";

import { useState } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Search,
  ArrowUpDown,
  User,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AuditTrailItem as BaseAuditTrailItem } from "@/types/project";

interface AuditTrailItem extends BaseAuditTrailItem {
  details?: BaseAuditTrailItem['details'] & {
    status?: string;
    previousVersion?: number;
    approvers?: Array<{ id: string; name: string; role: string }>;
    returnToStatus?: string;
    returnToLevel?: string;
    level?: string;
  };
}

type ComprehensiveAuditTrailProps = {
  auditTrail: AuditTrailItem[];
};

export function ComprehensiveAuditTrail({
  auditTrail,
}: ComprehensiveAuditTrailProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy HH:mm:ss");
  };

  const filteredAndSortedAuditTrail = auditTrail
    .filter((item) => {
      const matchesSearch =
        item.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.performedBy.firstName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        item.performedBy.lastName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (item?.details?.comments &&
          item?.details?.comments
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));

      const matchesFilter =
        filterAction === "all" ||
        item.action.toLowerCase() === filterAction.toLowerCase();

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const dateA = new Date(a.performedAt).getTime();
      const dateB = new Date(b.performedAt).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "submitted_for_approval":
        return "bg-blue-500";
      case "revision_requested":
        return "bg-orange-500";
      case "approved":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Audit Trail</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 mr-2" />
          ) : (
            <ChevronDown className="h-4 w-4 mr-2" />
          )}
          {isExpanded ? "Collapse" : "Expand"}
        </Button>
      </div>
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search audit trail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="submitted_for_approval">
                Submitted for Approval
              </SelectItem>
              <SelectItem value="revision_requested">
                Revision Requested
              </SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
            </SelectContent>
          </Select>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Sort{" "}
                  {sortOrder === "asc"
                    ? "Oldest to Newest"
                    : "Newest to Oldest"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <ScrollArea
          className={`${isExpanded ? "h-[600px]" : "h-[300px]"
            } w-full rounded-md border`}
        >
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4 p-4"
            >
              {filteredAndSortedAuditTrail.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={`${getActionColor(
                              item.action
                            )} text-white`}
                          >
                            {item.action.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(item.performedAt)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          {item.performedBy.firstName}{" "}
                          {item.performedBy.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ({item.performedBy.email})
                        </p>
                      </div>
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="details">
                          <AccordionTrigger>View Details</AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 text-sm">
                              {item?.details && (
                                <p className="flex items-center">
                                  <span className="font-medium mr-2">
                                    Status change:
                                  </span>
                                  {item?.details?.from}{" "}
                                  <ArrowRight className="h-3 w-3 mx-1" />{" "}
                                  {item?.details?.to}
                                </p>
                              )}
                              {item?.details?.comments && (
                                <p>
                                  <span className="font-medium">Comments:</span>{" "}
                                  {item?.details?.comments}
                                </p>
                              )}
                              {item?.details?.changes && (
                                <div>
                                  <p className="font-medium">Changes:</p>
                                  <ul className="list-disc list-inside pl-4">
                                    {item?.details?.changes?.map(
                                      (change, changeIndex) => (
                                        <li key={changeIndex}>{change}</li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}

                              {item?.details?.returnToLevel && (
                                <p>
                                  <span className="font-medium">
                                    Return to level:
                                  </span>{" "}
                                  {item?.details?.returnToLevel}
                                </p>
                              )}

                              {item?.details?.previousVersion && (
                                <p>
                                  <span className="font-medium">
                                    Previous version:
                                  </span>{" "}
                                  {item?.details?.previousVersion}
                                </p>
                              )}

                              {item?.details?.approvers &&
                                item?.details?.approvers?.length > 0 && (
                                  <div>
                                    <p className="font-medium">Approvers:</p>
                                    <ul className="list-disc list-inside pl-4">
                                      {item?.details?.approvers?.map(
                                        (approver, approverIndex) => (
                                          <li key={approverIndex}>
                                            {approver.name} ({approver.role}) -
                                            ID: {approver.id}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </ScrollArea>
      </div>
    </div>
  );
}
