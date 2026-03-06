"use client";

import { useState, useCallback } from "react";
import { ChartOfAccounts, CreateChartPayload, UpdateChartPayload } from "@/types/charts-of-accounts";
import {
  getAllCharts,
  getChartByCode,
  createChart,
  updateChart,
  deleteChart,
  getChartStatistics,
} from "@/services/charts-of-accounts.service";

interface UseChartsOfAccountsState {
  charts: ChartOfAccounts[];
  selectedChart: ChartOfAccounts | null;
  loading: boolean;
  error: string | null;
}

export function useChartsOfAccounts() {
  const [state, setState] = useState<UseChartsOfAccountsState>({
    charts: [],
    selectedChart: null,
    loading: false,
    error: null,
  });

  const loadCharts = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await getAllCharts();
      setState((prev) => ({ ...prev, charts: data || [], loading: false }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load charts";
      setState((prev) => ({ ...prev, error: message, loading: false }));
    }
  }, []);

  const loadChart = useCallback(async (chartCode: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await getChartByCode(chartCode);
      setState((prev) => ({ ...prev, selectedChart: data, loading: false }));
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load chart";
      setState((prev) => ({ ...prev, error: message, loading: false }));
      throw error;
    }
  }, []);

  const create = useCallback(async (payload: CreateChartPayload) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await createChart(payload);
      setState((prev) => ({
        ...prev,
        charts: [...prev.charts, data],
        loading: false,
      }));
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create chart";
      setState((prev) => ({ ...prev, error: message, loading: false }));
      throw error;
    }
  }, []);

  const update = useCallback(async (chartCode: string, payload: UpdateChartPayload) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await updateChart(chartCode, payload);
      setState((prev) => ({
        ...prev,
        charts: prev.charts.map((c) => (c.chartCode === chartCode ? data : c)),
        selectedChart: prev.selectedChart?.chartCode === chartCode ? data : prev.selectedChart,
        loading: false,
      }));
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update chart";
      setState((prev) => ({ ...prev, error: message, loading: false }));
      throw error;
    }
  }, []);

  const remove = useCallback(async (chartCode: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await deleteChart(chartCode);
      setState((prev) => ({
        ...prev,
        charts: prev.charts.filter((c) => c.chartCode !== chartCode),
        selectedChart:
          prev.selectedChart?.chartCode === chartCode ? null : prev.selectedChart,
        loading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete chart";
      setState((prev) => ({ ...prev, error: message, loading: false }));
      throw error;
    }
  }, []);

  const getStatistics = useCallback(async (chartCode: string) => {
    try {
      return await getChartStatistics(chartCode);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load statistics";
      setState((prev) => ({ ...prev, error: message }));
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const selectChart = useCallback((chart: ChartOfAccounts | null) => {
    setState((prev) => ({ ...prev, selectedChart: chart }));
  }, []);

  return {
    ...state,
    loadCharts,
    loadChart,
    create,
    update,
    remove,
    getStatistics,
    clearError,
    selectChart,
  };
}
