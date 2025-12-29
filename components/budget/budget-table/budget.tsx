"use client";
import { useRouter } from "next/navigation";
import { Budget as BudgetType } from "@/types/project";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";

interface BudgetTableProps {
  budgets?: BudgetType[];
}

export default function BudgetTable({ budgets }: BudgetTableProps) {
  const router = useRouter();


  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Budgets</h2>
          <p className="text-muted-foreground">
            Manage and track your project budgets
          </p>
        </div>

      </div>
      <DataTable
        columns={columns}
        data={budgets || []}
      />
    </div>
  );
}
