"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, KeyRound, ShieldAlert } from "lucide-react";
import { updateUserPermissions } from "@/services/employees.service";

interface EmployeePermissionsProps {
  employee: any;
}

const BLOCKED_MODULES = [
  {
    path: "/budget",
    label: "Budgets & Project Controls",
    description: "Allows access to internal/external project budgets, budget checkers/managers, and costing templates.",
  },
  {
    path: "/contracts",
    label: "Contracts & Agreements",
    description: "Allows access to general contracts, templates, and supplier agreements.",
  },
  {
    path: "/claims",
    label: "Claims Management",
    description: "Allows access to project/employee claim reviews, approvals, and reports.",
  },
  {
    path: "/imprest",
    label: "Imprest Requests",
    description: "Allows access to imprest applications, project filters, and approval queues.",
  },
  {
    path: "/lpos",
    label: "Local Purchase Orders (LPOs)",
    description: "Allows access to create, view, approve, and dispatch LPOs.",
  },
  {
    path: "/suppliers",
    label: "Supplier Directory",
    description: "Allows access to view and manage registered supplier profiles and details.",
  },
  {
    path: "/payment-requests",
    label: "Payment Requests",
    description: "Allows access to payment requests and HOD/finance approval pipelines.",
  },
  {
    path: "/payment-vouchers",
    label: "Payment Vouchers",
    description: "Allows access to generation and management of payment vouchers.",
  },
];

export default function EmployeePermissions({ employee }: EmployeePermissionsProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Initialize permissions state based on whether each path exists and has entries
  const [permissionsState, setPermissionsState] = useState<Record<string, boolean>>(() => {
    const state: Record<string, boolean> = {};
    BLOCKED_MODULES.forEach((mod) => {
      const initialVal = employee?.permissions?.[mod.path];
      state[mod.path] = Array.isArray(initialVal) && initialVal.length > 0;
    });
    return state;
  });

  const handleToggle = (path: string) => {
    setPermissionsState((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Map toggled states to ["read", "write"] permissions or empty arrays
      const updatedBlocked: Record<string, string[]> = {};
      BLOCKED_MODULES.forEach((mod) => {
        updatedBlocked[mod.path] = permissionsState[mod.path]
          ? ["read", "write"]
          : [];
      });

      // Merge with any existing permissions to avoid wiping out other modules
      const mergedPermissions = {
        ...(employee?.permissions || {}),
        ...updatedBlocked,
      };

      const result = await updateUserPermissions(employee._id, mergedPermissions);

      if (result.success) {
        toast({
          title: "Permissions Updated",
          description: "User module permissions have been updated successfully.",
        });
        router.refresh();
      } else {
        throw new Error(result.error || "Failed to update permissions");
      }
    } catch (error: any) {
      toast({
        title: "Error Saving Permissions",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isConsultant = employee?.roles?.includes("consultant") && !employee?.roles?.includes("admin");

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <CardTitle className="flex items-center text-lg">
            <KeyRound className="mr-2 h-5 w-5 text-primary" />
            Module Access Control
          </CardTitle>
          <CardDescription>
            Assign route permissions to non-admin users to grant access to specific restricted modules.
          </CardDescription>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="self-end md:self-auto">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Permissions"
          )}
        </Button>
      </CardHeader>
      <CardContent className="mt-4">
        {!isConsultant && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800/50">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">Admin/Super Admin User</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
                This user already has admin privileges and bypassed access controls. Changing these permissions will 
                only affect them if their admin roles are revoked.
              </p>
            </div>
          </div>
        )}

        <div className="divide-y divide-border border rounded-lg">
          {BLOCKED_MODULES.map((mod) => {
            const isEnabled = permissionsState[mod.path] || false;
            return (
              <div
                key={mod.path}
                className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors"
              >
                <div className="space-y-1 pr-6">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{mod.label}</span>
                    <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground">
                      {mod.path}
                    </code>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                    {mod.description}
                  </p>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={() => handleToggle(mod.path)}
                  aria-label={`Toggle access for ${mod.label}`}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
