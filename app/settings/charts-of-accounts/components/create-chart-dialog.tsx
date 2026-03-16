"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createChart } from "@/services/charts-of-accounts.service";
import { CreateChartPayload } from "@/types/charts-of-accounts";
import { validateChartCode, formatChartCode } from "@/lib/charts-of-accounts.utils";
import { Loader2, AlertCircle } from "lucide-react";

interface CreateChartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateChartDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateChartDialogProps) {
  const [loading, setLoading] = useState(false);
  const [chartCode, setChartCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validateChartCode(chartCode);
    if (!validation.valid) {
      setError(validation.error || "Invalid chart code");
      return;
    }

    try {
      setLoading(true);
      const payload: CreateChartPayload = {
        chartCode: formatChartCode(chartCode),
        accounts: [],
        objectCodes: [],
      };

      await createChart(payload);

      toast({
        title: "Success",
        description: `Chart "${chartCode}" created successfully`,
      });

      setChartCode("");
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create chart";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setChartCode("");
      setError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Chart of Accounts</DialogTitle>
          <DialogDescription>
            Add a new chart of accounts configuration to your system
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chartCode">Chart Code *</Label>
            <Input
              id="chartCode"
              placeholder="e.g., SR, CU, CB"
              value={chartCode}
              onChange={(e) => {
                setChartCode(e.target.value);
                setError(null);
              }}
              disabled={loading}
              maxLength={10}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Uppercase letters and numbers only, max 10 characters
            </p>
          </div>

          {error && (
            <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Chart
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
