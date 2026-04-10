"use client";

import { useState, useEffect } from "react";
import { Users, Store, Truck, CheckCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSupplierStats } from "@/services/suppliers.service";

export default function SupplierStats() {
  const [stats, setStats] = useState({
    totalSuppliers: 0,
    activeSuppliers: 0,
    pendingSuppliers: 0,
    goodsSuppliers: 0,
    servicesSuppliers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const result = await getSupplierStats();
      if (result) {
        setStats({
          totalSuppliers: result.totalSuppliers || 0,
          activeSuppliers: result.activeSuppliers || 0,
          pendingSuppliers: result.pendingSuppliers || 0,
          goodsSuppliers: result.goodsSuppliers || 0,
          servicesSuppliers: result.servicesSuppliers || 0,
        });
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
      {/* Total Suppliers */}
      <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Total Suppliers
          </CardTitle>
          <CardDescription>All registered suppliers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-4xl font-bold">{stats.totalSuppliers}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Suppliers */}
      <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            Active vs Pending
          </CardTitle>
          <CardDescription>Current operational status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.activeSuppliers}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Active</p>
            </div>
            <div className="flex flex-col items-end">
              <Badge
                variant="outline"
                className="bg-amber-50 text-amber-700 border-amber-200"
              >
                {stats.pendingSuppliers} Pending
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goods Suppliers */}
      <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Truck className="h-5 w-5 text-amber-500" />
            Goods Providers
          </CardTitle>
          <CardDescription>Suppliers dealing in goods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-4xl font-bold">{stats.goodsSuppliers}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Suppliers */}
      <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Store className="h-5 w-5 text-violet-500" />
            Service Providers
          </CardTitle>
          <CardDescription>Suppliers providing services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-4xl font-bold">{stats.servicesSuppliers}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
