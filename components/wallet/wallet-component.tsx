"use client";

import { Header } from "../header";
import TransactionStatCards from "@/components/wallet/transaction-stat-cards";
import DashboardProvider from "@/app/dashboard-provider";
import { PaymentTransaction, WalletTransaction } from "@/types/wallet";
import WalletTable from "./wallet-table/wallet";
import { useState, useEffect } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import { getPaymentTransactions, getWalletTransactions } from "@/services/wallet-service";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import MpesaTable from "./mpesa-table /mpesa";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WalletPageProps {
  transactions: WalletTransaction[];
  mpesaPayments:PaymentTransaction[]

}

export default function WalletPage({
  transactions: initialTransactions,
  mpesaPayments
  
}: WalletPageProps) {
  const [transactions, setTransactions] =
    useState<WalletTransaction[]>(initialTransactions);
    const [mpesa, setMpesa] =
    useState<PaymentTransaction[]>(mpesaPayments);
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      if (date.from && date.to) {
        setIsLoading(true);
        try {
          const startDate = date.from.toISOString();
          const endDate = date.to.toISOString();
            const [
              newTransactions, mpesaPayments
              ] = await Promise.all([
                getWalletTransactions({
                  startDate,
                  endDate,
                }),
                getPaymentTransactions({
                  startDate,
                  endDate,
                }),
              ]);

          setMpesa(mpesaPayments)
          setTransactions(newTransactions.data);
        } catch (error) {
          console.error("Failed to fetch transactions:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchTransactions();
  }, [date]);

  return (
    <DashboardProvider>
      <Header />
      <div className="p-4">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Innova Wallet
          </h1>
          <div className="flex items-center space-x-4 py-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[260px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CalendarIcon className="mr-2 h-4 w-4" />
                  )}
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={(range) => {
                    if (range) {
                      setDate({ from: range.from, to: range.to });
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <TransactionStatCards transactions={transactions} />
        <div className="relative mt-8">
          {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-gray-900/50">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          )}
          <Tabs defaultValue="wallet" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="wallet">Wallet Transactions</TabsTrigger>
            <TabsTrigger value="mpesa">M-Pesa Transactions</TabsTrigger>
          </TabsList>
          <TabsContent value="wallet" className="mt-4">
            <WalletTable transactions={transactions} />
          </TabsContent>
          <TabsContent value="mpesa" className="mt-4">
            <MpesaTable transactions={mpesa} />
          </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardProvider>
  );
}
