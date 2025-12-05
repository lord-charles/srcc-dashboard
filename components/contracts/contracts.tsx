"use client";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";

import ContractTable from "./contracts/contracts";
import { Contract } from "@/types/contract";
import ContractStats from "./contract-stats";

const ContractModule = ({ initialData }: { initialData: Contract[] }) => {
  return (
    <div className="p-2 min-h-screen space-y-4">
      <ContractStats contractsData={initialData as any} />
      <Card>
        <div className="flex flex-row items-center justify-between space-y-0 p-3">
          <div>
            <CardTitle>Contracts List</CardTitle>
            <CardDescription>View and manage your contracts</CardDescription>
          </div>
        </div>
        <div className="p-3">
          <ContractTable data={initialData} />
        </div>
      </Card>
    </div>
  );
};

export default ContractModule;
