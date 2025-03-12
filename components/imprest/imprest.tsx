"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { DatePickerWithRange } from "../date-range-picker";
import { getAllImprests } from "@/services/imprest.service";
import { Imprest } from "@/types/imprest";
import { useRouter } from "next/navigation";
import ImprestTable from "./imprest-table/imprest";
import ImprestStatCards from "./components/imprest-stat-cards";

const ImprestModule = ({ initialData }: { initialData: Imprest[] }) => {
  const [imprests, setImprests] = useState<Imprest[]>(initialData || []);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchImprests = async () => {
      try {
        setLoading(true);
        const data = await getAllImprests();
        if (data) {
          setImprests(data);
        }
      } catch (error) {
        console.error("Error fetching imprests:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!initialData) {
      fetchImprests();
    }
  }, [initialData]);

  return (
    <div className="min-h-screen">
      <div className="px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Imprest Overview
          </h1>
          <DatePickerWithRange />
        </div>
        <ImprestStatCards imprestsData={imprests} />
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="grid gap-4 pt-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Imprest List</CardTitle>
                  <CardDescription>
                    View and manage imprest requests
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ImprestTable data={imprests} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImprestModule;
