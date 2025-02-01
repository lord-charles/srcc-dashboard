"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Wallet,
  CreditCard,
  PiggyBank,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { WalletTransaction } from "@/types/wallet";

interface TransactionTypeData {
  type: string;
  label: string;
  icon: any;
  count: number;
  amount: number;
  color: string;
  trend: number;
}

const defaultTransactionTypes: TransactionTypeData[] = [

  {
    type: "receive_from_mpesa",
    label: "M-Pesa to Wallet",
    icon: ArrowDownToLine,
    count: 0,
    amount: 0,
    color: "from-green-500 to-green-600",
    trend: 0,
  },
  {
    type: "transfer_to_wallet",
    label: "Wallet to Wallet",
    icon: ArrowLeftRight,
    count: 0,
    amount: 0,
    color: "from-blue-500 to-blue-600",
    trend: 0,
  },
  {
    type: "receive_from_advance",
    label: "Receive from Advance",
    icon: PiggyBank,
    count: 0,
    amount: 0,
    color: "from-purple-500 to-purple-600",
    trend: 0,
  },
  {
    type: "withdrawal",
    label: "Withdrawal",
    icon: Wallet,
    count: 0,
    amount: 0,
    color: "from-orange-500 to-orange-600",
    trend: 0,
  },
  {
    type: "Withdrawal",
    label: "Coming soon!",
    icon: ArrowUpFromLine,
    count: 0,
    amount: 0,
    color: "from-red-500 to-red-600",
    trend: 0,
  },
  
];

const processTransactions = (
  transactions: WalletTransaction[]
): TransactionTypeData[] => {
  const transactionMap = new Map<string, TransactionTypeData>();

  // Initialize with default values
  defaultTransactionTypes.forEach((type) => {
    transactionMap.set(type.type, { ...type });
  });

  // Process transactions
  transactions.forEach((transaction) => {
    const type = transactionMap.get(transaction.transactionType);
    if (type) {
      type.count += 1;
      type.amount += transaction.amount;
    }
  });

  // Calculate trends (simplified - could be enhanced with historical data)
  const results = Array.from(transactionMap.values());

  // Add total as the last item
  const totalTransactions = {
    type: "total",
    label: "Total Transactions",
    icon: CreditCard,
    count: results.reduce((sum, item) => sum + item.count, 0),
    amount: results.reduce((sum, item) => sum + item.amount, 0),
    color: "from-gray-700 to-gray-800",
    trend: 0,
  };

  return [...results, totalTransactions];
};

export default function TransactionStatCards({
  transactions,
}: {
  transactions: WalletTransaction[];
}) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const processedTransactions = processTransactions(transactions);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {processedTransactions.map((transaction) => (
        <Card
          key={transaction.type}
          className="overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
          onMouseEnter={() => setHoveredCard(transaction.type)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${transaction.color} opacity-10`}
          ></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {transaction.label}
            </CardTitle>
            <div
              className={`rounded-full p-2 bg-gradient-to-br ${transaction.color}`}
            >
              <transaction.icon className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="space-y-1">
                <div className={`text-2xl font-bold`}>
                  KES {transaction.amount.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {transaction.count} transaction
                  {transaction.count !== 1 ? "s" : ""}
                </div>
              </div>
              <div
                className={`flex items-center space-x-1 ${
                  transaction.trend > 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {transaction.trend > 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {Math.abs(transaction.trend)}%
                </span>
              </div>
            </div>
            <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${transaction.color} transition-all duration-500 ease-in-out`}
                style={{
                  width: `${
                    (transaction.count /
                      processedTransactions[processedTransactions.length - 1]
                        .count) *
                    100
                  }%`,
                  transform:
                    hoveredCard === transaction.type
                      ? "scaleX(1.03)"
                      : "scaleX(1)",
                }}
              ></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
