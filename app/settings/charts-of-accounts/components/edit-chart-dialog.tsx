"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { updateChart } from "@/services/charts-of-accounts.service";
import { ChartOfAccounts } from "@/types/charts-of-accounts";
import { Loader2 } from "lucide-react";
import AccountsTab from "./tabs/accounts-tab";
import ObjectCodesTab from "./tabs/object-codes-tab";

interface EditChartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chart: ChartOfAccounts | null;
  onSuccess: () => void;
}

export default function EditChartDialog({
  open,
  onOpenChange,
  chart,
  onSuccess,
}: EditChartDialogProps) {
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [localChart, setLocalChart] = useState<ChartOfAccounts | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (chart) {
      setLocalChart(JSON.parse(JSON.stringify(chart)));
      setHasChanges(false);
    }
  }, [chart, open]);

  const handleSave = async () => {
    if (!localChart || !chart) return;

    try {
      setLoading(true);
      await updateChart(chart.chartCode, {
        accounts: localChart.accounts,
        objectCodes: localChart.objectCodes,
        mappings: localChart.mappings,
      });

      toast({
        title: "Success",
        description: "Chart updated successfully",
      });

      setHasChanges(false);
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update chart";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!localChart) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Chart: {chart?.chartCode}</DialogTitle>
          <DialogDescription>
            Manage accounts and object codes for this chart
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="accounts" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="accounts">
              Accounts ({localChart.accounts?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="objectCodes">
              Object Codes ({localChart.objectCodes?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="space-y-4">
            <AccountsTab
              chart={localChart}
              onUpdate={(updatedChart) => {
                setLocalChart(updatedChart);
                setHasChanges(true);
              }}
            />
          </TabsContent>

          <TabsContent value="objectCodes" className="space-y-4">
            <ObjectCodesTab
              chart={localChart}
              onUpdate={(updatedChart) => {
                setLocalChart(updatedChart);
                setHasChanges(true);
              }}
            />
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !hasChanges}
            className="gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
