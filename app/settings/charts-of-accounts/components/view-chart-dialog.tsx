"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartOfAccounts } from "@/types/charts-of-accounts";
import { getChartSummary } from "@/lib/charts-of-accounts.utils";

interface ViewChartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chart: ChartOfAccounts | null;
}

export default function ViewChartDialog({
  open,
  onOpenChange,
  chart,
}: ViewChartDialogProps) {
  if (!chart) return null;

  const summary = getChartSummary(chart);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chart Details: {chart.chartCode}</DialogTitle>
          <DialogDescription>View chart configuration and statistics</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Total Accounts</p>
              <p className="text-2xl font-bold">{summary.totalAccounts}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Total Sub-Accounts</p>
              <p className="text-2xl font-bold">{summary.totalSubAccounts}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Total Object Codes</p>
              <p className="text-2xl font-bold">{summary.totalObjectCodes}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Total Mappings</p>
              <p className="text-2xl font-bold">{summary.totalMappings}</p>
            </div>
          </div>

          {/* Detailed View */}
          <Tabs defaultValue="accounts" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="accounts">Accounts</TabsTrigger>
              <TabsTrigger value="objectCodes">Object Codes</TabsTrigger>
            </TabsList>

            <TabsContent value="accounts" className="space-y-4">
              {!chart.accounts || chart.accounts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No accounts configured</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {chart.accounts.map((account) => (
                    <div
                      key={account.accountNumber}
                      className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{account.accountNumber}</p>
                          <p className="text-sm text-muted-foreground">{account.accountName}</p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <p>{account.subAccounts?.length || 0} sub-accounts</p>
                          <p>{account.mappings?.length || 0} mappings</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="objectCodes" className="space-y-4">
              {!chart.objectCodes || chart.objectCodes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No object codes configured</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {chart.objectCodes.map((code) => (
                    <div
                      key={code.objectCode}
                      className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{code.objectCode}</p>
                          <p className="text-sm text-muted-foreground">{code.objectCodeName}</p>
                        </div>
                        <span className="text-xs bg-muted px-2 py-1 rounded">{code.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
