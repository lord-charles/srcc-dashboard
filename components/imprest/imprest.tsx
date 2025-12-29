"use client";
import {
  Card,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

import { Imprest } from "@/types/imprest";
import ImprestTable from "./imprest-table/imprest";
import { ImprestStats } from "./imprest-stats";

const ImprestModule = ({ initialData }: { initialData: Imprest[] }) => {
  

  return (
    <div className="min-h-screen p-2">
      <ImprestStats imprests={initialData} />
      <div className="grid gap-4 pt-4">
        <Card>
          <div className="p-3 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Imprest List</CardTitle>
                  <CardDescription>
                    View and manage imprest requests
                  </CardDescription>
                </div>
              </div>
              <div className="p-3">
                <div className="space-y-4">
                  <ImprestTable data={initialData} />
                </div>
              </div>
            </Card>
          </div>
  
    </div>
  );
};

export default ImprestModule;
