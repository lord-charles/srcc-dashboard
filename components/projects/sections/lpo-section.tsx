"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  FileDown,
  Send,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Plus,
  CreditCard,
  Paperclip,
} from "lucide-react";
import { getLposByProject, updateLpoStatus } from "@/services/lpo.service";
import { Lpo } from "@/types/lpo";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "next-auth/react";


interface LpoSectionProps {
  projectId: string;
  projectCurrency: string;
  projectName?: string;
}

export const LpoSection: React.FC<LpoSectionProps> = ({
  projectId,
  projectCurrency,
  projectName = "",
}) => {
  const { toast } = useToast();
  const { data: session } = useSession();
  const userRoles = (session?.user as any)?.roles || [];

  const isHod = userRoles.includes("hod");
  const isFinance = userRoles.includes("srcc_finance");

  const [lpos, setLpos] = useState<Lpo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLpos();
  }, [projectId]);

  const loadLpos = useCallback(async () => {
    setIsLoading(true);
    const result = await getLposByProject(projectId);
    if (result.success && result.data) {
      setLpos(result.data);
    } else {
      toast({
        title: "Error",
        description: "Failed to load LPOs",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  }, [projectId, toast]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const result = await updateLpoStatus(id, newStatus);
      if (result.success) {
        toast({
          title: "Success",
          description: `LPO status updated to ${newStatus}`,
        });
        loadLpos();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update LPO status",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "An error occurred",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100/50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-none"
          >
            Submitted
          </Badge>
        );
      case "hod_approved":
        return (
          <Badge
            variant="secondary"
            className="bg-amber-100/50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-none"
          >
            HOD Approved
          </Badge>
        );
      case "finance_approved":
        return (
          <Badge
            variant="secondary"
            className="bg-emerald-100/50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-none"
          >
            Finance Approved
          </Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-cente">
        <div>
          <h2 className="text-lg font-semibold">
            Local Purchase Orders (LPOs)
          </h2>
          <p className="text-sm text-muted-foreground">
        Issue LPOs for this project.
          </p>
        </div>
        <Link href={`/projects/${projectId}/lpo/new`}>
          <Button variant="default">
            <Plus className="w-4 h-4 mr-2" />
            Create New LPO
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/50" />
        </div>
      ) : lpos.length === 0 ? (
        <div className="p-8 text-center bg-muted/30 rounded-md border border-dashed border-border">
          <p className="text-muted-foreground">
            No LPOs found for this project.
          </p>
        </div>
      ) : (
        <div className="bg-card text-card-foreground rounded-md border shadow-sm">
          <div className="grid grid-cols-12 gap-2 p-4 border-b font-semibold text-sm text-muted-foreground bg-muted/50">
            <div className="col-span-2">LPO No</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Supplier</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-center">Docs</div>
            <div className="col-span-1 text-center">Actions</div>
          </div>

          <div className="divide-y">
            {lpos.map((lpo) => (
              <div
                key={lpo._id}
                className="grid grid-cols-12 gap-2 p-4 items-center text-sm"
              >
                <div className="col-span-2 font-medium">{lpo.lpoNo}</div>
                <div className="col-span-2">
                  {new Date(lpo.lpoDate).toLocaleDateString()}
                </div>
                <div
                  className="col-span-2 truncate"
                  title={lpo.supplierId?.name}
                >
                  {lpo.supplierId?.name || "Unknown Supplier"}
                </div>
                <div className="col-span-2 text-right font-medium">
                  {new Intl.NumberFormat("en-KE", {
                    style: "currency",
                    currency: lpo.currency || projectCurrency || "KES",
                  }).format(lpo.totalAmount)}
                </div>
                <div className="col-span-2">{getStatusBadge(lpo.status)}</div>
                <div className="col-span-1 flex items-center justify-center">
                  {lpo.attachments && lpo.attachments.length > 0 ? (
                    lpo.attachments.length === 1 ? (
                      <a
                        href={lpo.attachments[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 transition-colors"
                        title={lpo.attachments[0].split("/").pop() || "View attachment"}
                      >
                        <Paperclip className="h-4 w-4" />
                      </a>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-1.5 flex items-center gap-1 text-xs text-primary hover:bg-primary/5 font-medium"
                          >
                            <Paperclip className="h-3.5 w-3.5" />
                            <span className="text-[10px]">{lpo.attachments.length}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel className="text-xs text-muted-foreground font-semibold px-2 py-1.5">
                            Attachments ({lpo.attachments.length})
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {lpo.attachments.map((url, idx) => {
                            const fileName = url.split("/").pop() || `Document ${idx + 1}`;
                            return (
                              <DropdownMenuItem key={idx} asChild>
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 cursor-pointer text-xs truncate w-full"
                                >
                                  <span className="shrink-0 text-muted-foreground">📎</span>
                                  <span className="truncate flex-1">{fileName}</span>
                                </a>
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </div>
                <div className="col-span-1 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>

                      {/* Approvals */}
                      {lpo.status === "submitted" && isHod && (
                        <>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusUpdate(lpo._id, "hod_approved")
                            }
                            className="text-emerald-600"
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                            (HOD)
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusUpdate(lpo._id, "rejected")
                            }
                            className="text-red-600"
                          >
                            <XCircle className="mr-2 h-4 w-4" /> Reject (HOD)
                          </DropdownMenuItem>
                        </>
                      )}
                      {lpo.status === "hod_approved" && isFinance && (
                        <>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusUpdate(lpo._id, "finance_approved")
                            }
                            className="text-emerald-600"
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                            (Finance)
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusUpdate(lpo._id, "rejected")
                            }
                            className="text-red-600"
                          >
                            <XCircle className="mr-2 h-4 w-4" /> Reject
                            (Finance)
                          </DropdownMenuItem>
                        </>
                      )}

                      <DropdownMenuSeparator />

                      {lpo.status === "finance_approved" && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/projects/${projectId}/lpo/${lpo._id}/dispatch`}
                              className="flex items-center cursor-pointer"
                            >
                              <FileDown className="mr-2 h-4 w-4" /> Download /
                              Dispatch
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/projects/${projectId}/payment-request/new?lpoId=${lpo._id}`}
                              className="text-primary focus:text-primary flex items-center cursor-pointer"
                            >
                              <CreditCard className="mr-2 h-4 w-4 text-primary" /> Raise Payment Request
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}




    </div>
  );
};
