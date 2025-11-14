import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Building2, Clock, BarChart3, Briefcase } from "lucide-react";

type Organization = {
  _id: string;
  companyName: string;
  registrationNumber: string;
  businessEmail: string;
  yearsOfOperation: number;
  hourlyRate: number;
  servicesOffered: string[];
  industries: string[];
  status: string;
};

type OrganizationStatsProps = {
  organizations: Organization[];
};

export function OrganizationStats({ organizations }: OrganizationStatsProps) {
  // Calculate statistics
  const totalOrganizations = organizations.length;
  const activeOrganizations = organizations.filter(
    (o) => o.status === "active"
  ).length;
  const pendingOrganizations = organizations.filter(
    (o) => o.status === "pending"
  ).length;
  const activePercentage =
    totalOrganizations > 0
      ? Math.round((activeOrganizations / totalOrganizations) * 100)
      : 0;

  const avgYearsOfOperation =
    organizations.length > 0
      ? Math.round(
          organizations.reduce(
            (sum, o) =>
              sum + (isNaN(o.yearsOfOperation) ? 0 : o.yearsOfOperation),
            0
          ) / organizations.length
        )
      : 0;

  // Get industries distribution
  const allIndustries = organizations
    .flatMap((o) => o.industries)
    .flatMap((i) => i.split(","));
  const industryCount = allIndustries.reduce((acc, industry) => {
    const trimmed = industry.trim();
    acc[trimmed] = (acc[trimmed] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sort industries by count
  const sortedIndustries = Object.entries(industryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Get services distribution
  const allServices = organizations
    .flatMap((o) => o.servicesOffered)
    .flatMap((s) => s.split(","));
  const serviceCount = allServices.reduce((acc, service) => {
    const trimmed = service.trim();
    acc[trimmed] = (acc[trimmed] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sort services by count
  const sortedServices = Object.entries(serviceCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Total Organizations */}
      <Card className="border shadow-md hover:shadow-lg transition-shadow bg-card">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Organizations
              </p>
              <p className="text-3xl font-semibold mt-2 text-card-foreground">
                {totalOrganizations}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-slate-600" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Active</span>
              <span className="font-medium text-primary">
                {activeOrganizations}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Pending</span>
              <span className="font-medium text-muted-foreground">
                {pendingOrganizations}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Status */}
      <Card className="border shadow-md hover:shadow-lg transition-shadow bg-card">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Status Distribution
              </p>
              <p className="text-3xl font-semibold mt-2 text-card-foreground">
                {isNaN(activePercentage) ? 0 : activePercentage}%
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-teal-50 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-teal-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Active Rate</span>
              <span className="font-medium text-primary">
                {isNaN(activePercentage) ? 0 : activePercentage}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${isNaN(activePercentage) ? 0 : activePercentage}%`,
                }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Years Operating */}
      <Card className="border shadow-md hover:shadow-lg transition-shadow bg-card">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Avg. Years Operating
              </p>
              <div className="flex items-baseline mt-2">
                <p className="text-3xl font-semibold text-card-foreground">
                  {isNaN(avgYearsOfOperation) ? 0 : avgYearsOfOperation}
                </p>
                <p className="text-sm ml-1 text-muted-foreground">years</p>
              </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Maturity Index</span>
              <span className="font-medium text-primary">
                {isNaN(avgYearsOfOperation)
                  ? 0
                  : avgYearsOfOperation < 2
                  ? "Startup"
                  : avgYearsOfOperation < 5
                  ? "Growing"
                  : "Established"}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    isNaN(avgYearsOfOperation)
                      ? 0
                      : Math.min(avgYearsOfOperation * 10, 100)
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Industry Distribution */}
      <Card className="border shadow-md hover:shadow-lg transition-shadow bg-card">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Industry Focus
              </p>
              <p className="text-3xl font-semibold mt-2 text-card-foreground">
                {Object.keys(industryCount).length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <ScrollArea className="mt-4 space-y-2 h-18s">
            {sortedIndustries?.slice(0, 5).map(([industry, count]) => (
              <div key={industry}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground font-medium">
                    {industry}
                  </span>
                  <span className="text-muted-foreground">{count} orgs</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className="bg-accent h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        isNaN(count) ? 0 : (count / totalOrganizations) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
