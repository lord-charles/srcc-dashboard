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
import { getAllClaims } from "@/services/contracts.service";
import { Claim } from "@/types/claim";
import { useRouter } from "next/navigation";
import ClaimTable from "./claims-table/claim";
import ClaimStatCards from "./components/claim-stat-cards";

const ClaimsModule = ({ initialData }: { initialData: Claim[] }) => {
  const [claims, setClaims] = useState<Claim[]>(initialData || []);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        setLoading(true);
        const data = await getAllClaims();
        if (data) {
          setClaims(data);
        }
      } catch (error) {
        console.error("Error fetching claims:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!initialData) {
      fetchClaims();
    }
  }, [initialData]);

  return (
    <div className="min-h-screen">
      <div className="px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Claims Overview
          </h1>
          <DatePickerWithRange />
        </div>
        <ClaimStatCards claimsData={claims} />
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="grid gap-4 pt-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Claims List</CardTitle>
                  <CardDescription>
                    View and manage milestone claims
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ClaimTable data={claims} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimsModule;
