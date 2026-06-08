"use client";

import { useEffect, useState, useCallback } from "react";
import { getAllImprests } from "@/services/imprest.service";
import ImprestTable from "@/components/imprest/imprest-table/imprest";
import type { Imprest } from "@/types/imprest";

interface Props {
  projectId: string;
  projectName: string;
}

export function ProjectImprestsSection({ projectId, projectName }: Props) {
  const [imprests, setImprests] = useState<Imprest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchImprests = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getAllImprests({ projectId });
      if (res.success) {
        setImprests(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch project imprests:", error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchImprests();
  }, [fetchImprests]);

  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading imprests...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ImprestTable data={imprests} />
    </div>
  );
}
