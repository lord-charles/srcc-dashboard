"use client";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import SupplierTable from "./suppliers-table/suppliers";
import SupplierStats from "./supplier-statcards";
import { Supplier } from "@/services/suppliers.service";

interface SuppliersModuleProps {
  initialData: Supplier[];
}

export default function SuppliersModule({ initialData }: SuppliersModuleProps) {
  const router = useRouter();

  return (
    <div className="flex-1 space-y-4 p-2">
      <SupplierStats />

      <div className="grid gap-2 pt-2">
        <Card className="border-none shadow-md">
          <div className="p-2 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div>
              <CardTitle className="text-xl">Supplier Matrix</CardTitle>
              <CardDescription>
                Manage your suppliers and their compliance documents
              </CardDescription>
            </div>
            <Button
              size="default"
              onClick={() => {
                router.push("/suppliers/new");
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          </div>
          <div className="p-4 pt-0">
            <SupplierTable suppliers={initialData} />
          </div>
        </Card>
      </div>
    </div>
  );
}
