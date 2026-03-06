"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Edit2, Trash2, AlertCircle, Loader2, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useChartsOfAccounts } from "@/hooks/useChartsOfAccounts";
import { searchCharts, sortCharts } from "@/lib/charts-of-accounts.utils";
import CreateChartDialog from "./components/create-chart-dialog";
import EditChartDialog from "./components/edit-chart-dialog";
import ChartDetailPage from "./components/chart-detail-page";
import { ChartOfAccounts } from "@/types/charts-of-accounts";

export default function ChartsOfAccountsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedChartForDetail, setSelectedChartForDetail] = useState<ChartOfAccounts | null>(
    null,
  );
  const { toast } = useToast();

  const {
    charts,
    selectedChart,
    loading,
    error,
    loadCharts,
    remove,
    selectChart,
    clearError,
  } = useChartsOfAccounts();

  useEffect(() => {
    loadCharts();
  }, [loadCharts]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      clearError();
    }
  }, [error, toast, clearError]);

  const filteredCharts = searchCharts(charts, searchTerm);
  const sortedCharts = sortCharts(filteredCharts);

  const handleDelete = async (chart: ChartOfAccounts) => {
    if (
      !confirm(
        `Are you sure you want to delete chart "${chart.chartCode}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await remove(chart.chartCode);
      toast({
        title: "Success",
        description: `Chart "${chart.chartCode}" deleted successfully`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete chart";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (chart: ChartOfAccounts) => {
    selectChart(chart);
    setEditDialogOpen(true);
  };

  const handleViewDetails = (chart: ChartOfAccounts) => {
    setSelectedChartForDetail(chart);
  };

  if (selectedChartForDetail) {
    return (
      <ChartDetailPage
        chart={selectedChartForDetail}
        onBack={() => {
          setSelectedChartForDetail(null);
          loadCharts();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Charts of Accounts</h1>
          <p className="text-muted-foreground mt-1">
            Manage your organization&apos;s chart of accounts configuration
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Chart
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by chart code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Charts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Charts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground py-8">
              <Loader2 className="w-4 h-4 animate-spin" />
              <p>Loading charts...</p>
            </div>
          ) : sortedCharts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-8">
              <AlertCircle className="w-8 h-8 opacity-50" />
              <p>{searchTerm ? "No charts match your search" : "No charts created yet"}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Chart Code</TableHead>
                    <TableHead className="text-right">Accounts</TableHead>
                    <TableHead className="text-right">Object Codes</TableHead>
                    <TableHead className="text-right">Mappings</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCharts.map((chart) => (
                    <TableRow key={`${chart._id}-${chart.chartCode}`}>
                      <TableCell className="font-medium">{chart.chartCode}</TableCell>
                      <TableCell className="text-right">{chart.accounts?.length || 0}</TableCell>
                      <TableCell className="text-right">
                        {chart.objectCodes?.length || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        {chart.mappings?.length || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(chart)}
                            title="View and manage chart details"
                            className="gap-1"
                          >
                            <ChevronRight className="w-4 h-4" />
                            Manage
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(chart)}
                            title="Edit chart"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(chart)}
                            title="Delete chart"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateChartDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          loadCharts();
          setCreateDialogOpen(false);
        }}
      />

      {selectedChart && (
        <EditChartDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          chart={selectedChart}
          onSuccess={() => {
            loadCharts();
            setEditDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}
