"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CalendarIcon,
  CreditCardIcon,
  DollarSignIcon,
  UserIcon,
  AlertTriangleIcon,
  Plus,
} from "lucide-react";
import { DatePickerWithRange } from "../date-range-picker";
import ContractTable from "./contracts/contracts";
import { getAllContracts } from "@/services/contracts.service";
import { Contract } from "@/types/contract";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface ContractStats {
  totalContracts: number;
  activeContracts: number;
  totalValue: number;
  completedDeliverables: number;
  pendingPayments: number;
}

const calculateContractStats = (contracts: Contract[]): ContractStats => {
  return {
    totalContracts: contracts.length,
    activeContracts: contracts.filter(c => c.status === 'active').length,
    totalValue: contracts.reduce((sum, contract) => sum + contract.contractValue, 0),
    completedDeliverables: contracts.reduce(
      (sum, contract) => sum + contract.deliverables.filter(d => d.completed).length,
      0
    ),
    pendingPayments: contracts.reduce(
      (sum, contract) => sum + contract.paymentSchedule.filter(p => !p.paid).length,
      0
    ),
  };
};

const ContractModule = ({ initialData }: { initialData: Contract[] }) => {
  const [contracts, setContracts] = useState<Contract[]>(initialData || []);
  const [loading, setLoading] = useState(false);
const router = useRouter();
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
        const data = await getAllContracts();
        if (data) {
          setContracts(data);
        }
      } catch (error) {
        console.error("Error fetching contracts:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!initialData) {
      fetchContracts();
    }
  }, [initialData]);

  const stats = calculateContractStats(contracts);

  return (
    <div className="min-h-screen">
      <div className="px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Contracts Overview
          </h1>
          <DatePickerWithRange />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <Card className="bg-white/50 backdrop-blur-lg dark:bg-gray-800/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Contracts
              </CardTitle>
              <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalContracts}</div>
              <p className="text-xs text-muted-foreground">Total managed contracts</p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-lg dark:bg-gray-800/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Contracts
              </CardTitle>
              <UserIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeContracts}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-lg dark:bg-gray-800/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Value
              </CardTitle>
              <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('en-KE', { 
                  style: 'currency', 
                  currency: 'KES',
                  maximumFractionDigits: 0
                }).format(stats.totalValue)}
              </div>
              <p className="text-xs text-muted-foreground">Contract value</p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-lg dark:bg-gray-800/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Deliverables
              </CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedDeliverables}</div>
              <p className="text-xs text-muted-foreground">Total completed</p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-lg dark:bg-gray-800/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Payments
              </CardTitle>
              <AlertTriangleIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingPayments}</div>
              <p className="text-xs text-muted-foreground">Awaiting payment</p>
            </CardContent>
          </Card>
        </div>
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
                <div className="grid gap-4 pt-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Contracts List</CardTitle>
              <CardDescription>View and manage your contracts</CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => {
                router.push("/contract/new");
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Contract
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
          <ContractTable data={contracts} />
          </div>
          </CardContent>
        </Card>
      </div>
        )}
      </div>
    </div>
  );
};

export default ContractModule;
