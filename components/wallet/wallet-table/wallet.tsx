"use client";

import { DataTable } from "./components/data-table";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { columns } from "./components/columns";
import { WalletTransaction } from "@/types/wallet";

export default function WalletTable({
  transactions,
}: {
  transactions: WalletTransaction[];
}) {
  return (
    <div>
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            View and analyze wallet transactions.
          </CardDescription>
        </div>
      </div>
      <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
        <DataTable data={transactions} columns={columns} />
      </div>
    </div>
  );
}
