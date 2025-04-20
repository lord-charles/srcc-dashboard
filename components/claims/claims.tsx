"use client";
import {
  Card,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Claim } from "@/types/claim";
import ClaimTable from "./claims-table/claim";
import ClaimsStats from "./claims-stats";

const ClaimsModule = ({ initialData }: { initialData: Claim[] }) => {


  return (
    <div className="min-h-screen p-2">
    <ClaimsStats claimsData={initialData} />
          <div className="grid gap-4 pt-4">
            <Card>
              <div className="p-3 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Claims List</CardTitle>
                  <CardDescription>
                    View and manage milestone claims
                  </CardDescription>
                </div>
              </div>
              <div className="p-3">
                <div className="space-y-4">
                  <ClaimTable data={initialData} />
                </div>  
              </div>
            </Card>
          </div>
       
    </div>
  );
};

export default ClaimsModule;
