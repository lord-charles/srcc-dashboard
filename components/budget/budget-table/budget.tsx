"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Budget } from "@/types/budget";
import { Button } from "@/components/ui/button";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { Plus } from "lucide-react";
interface BudgetTableProps {
  budgets?: Budget[];
}

export default function BudgetTable({ budgets }: BudgetTableProps) {
  const router = useRouter();


  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Budgets</h2>
          <p className="text-muted-foreground">
            Manage and track your project budgets
          </p>
        </div>
        <Button onClick={() => router.push("/budget/new")}>
          <Plus className="mr-2 h-4 w-4" /> New Budget
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={budgets || []}
      />
    </div>
  );
}
