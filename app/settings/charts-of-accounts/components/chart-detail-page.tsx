"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChartOfAccounts } from "@/types/charts-of-accounts";
import AccountsTab from "./tabs/accounts-tab";
import ObjectCodesTab from "./tabs/object-codes-tab";

interface ChartDetailPageProps {
  chart: ChartOfAccounts;
  onBack: () => void;
}

export default function ChartDetailPage({ chart, onBack }: ChartDetailPageProps) {
  const [activeTab, setActiveTab] = useState("accounts");
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
            <h1 className="text-3xl font-bold tracking-tight">{chart.chartCode}</h1>
          </div>

          <div>
            <p className="text-muted-foreground mt-1">Manage chart configuration</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Total Accounts</p>
              <p className="text-3xl font-bold mt-2">{chart.accounts?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Total Object Codes</p>
              <p className="text-3xl font-bold mt-2">{chart.objectCodes?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Total Mappings</p>
              <p className="text-3xl font-bold mt-2">{chart.mappings?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="accounts">Accounts</TabsTrigger>
              <TabsTrigger value="objectCodes">Object Codes</TabsTrigger>
            </TabsList>

            <TabsContent value="accounts" className="mt-6">
              <AccountsTab chart={chart} onUpdate={() => onBack()} />
            </TabsContent>

            <TabsContent value="objectCodes" className="mt-6">
              <ObjectCodesTab chart={chart} onUpdate={() => onBack()} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
