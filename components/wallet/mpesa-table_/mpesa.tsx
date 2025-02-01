"use client";

import { DataTable } from "./components/data-table";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { columns } from "./components/columns";
import { PaymentTransaction } from "@/types/wallet";


export default function MpesaTable({
  transactions,
}: {
  transactions: PaymentTransaction[];
}) {

  console.log(transactions)
  return (
    <div>
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Mpesa Transactions</CardTitle>
          <CardDescription>
            View and analyze Mpesa transactions.
          </CardDescription>
        </div>
      </div>
      <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
        <DataTable data={transactions} columns={columns} />
      </div>
    </div>
  );
}
