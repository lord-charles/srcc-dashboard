import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import { Building2, Clock, BarChart3, Briefcase } from "lucide-react"

type Organization = {
  _id: string
  companyName: string
  registrationNumber: string
  businessEmail: string
  yearsOfOperation: number
  hourlyRate: number
  servicesOffered: string[]
  industries: string[]
  status: string
}

type OrganizationStatsProps = {
  organizations: Organization[]
}

export function OrganizationStats({ organizations }: OrganizationStatsProps) {
  // Calculate statistics
  const totalOrganizations = organizations.length
  const activeOrganizations = organizations.filter((o) => o.status === "active").length
  const pendingOrganizations = organizations.filter((o) => o.status === "pending").length
  const activePercentage = totalOrganizations > 0 ? Math.round((activeOrganizations / totalOrganizations) * 100) : 0

  const avgYearsOfOperation =
    organizations.length > 0
      ? Math.round(organizations.reduce((sum, o) => sum + o.yearsOfOperation, 0) / organizations.length)
      : 0

  // Get industries distribution
  const allIndustries = organizations.flatMap((o) => o.industries).flatMap((i) => i.split(","))
  const industryCount = allIndustries.reduce(
    (acc, industry) => {
      const trimmed = industry.trim()
      acc[trimmed] = (acc[trimmed] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Sort industries by count
  const sortedIndustries = Object.entries(industryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  // Get services distribution
  const allServices = organizations.flatMap((o) => o.servicesOffered).flatMap((s) => s.split(","))
  const serviceCount = allServices.reduce(
    (acc, service) => {
      const trimmed = service.trim()
      acc[trimmed] = (acc[trimmed] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Sort services by count
  const sortedServices = Object.entries(serviceCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Total Organizations */}
      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium ">Total Organizations</p>
              <p className="text-3xl font-semibold mt-2 text-slate-800">{totalOrganizations}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-slate-600" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="">Active</span>
              <span className="font-medium text-slate-700">{activeOrganizations}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="">Pending</span>
              <span className="font-medium text-slate-700">{pendingOrganizations}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Status */}
      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium ">Status Distribution</p>
              <p className="text-3xl font-semibold mt-2 text-slate-800">{activePercentage}%</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-teal-50 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-teal-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="">Active Rate</span>
              <span className="font-medium text-slate-700">{activePercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-teal-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${activePercentage}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Years Operating */}
      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium ">Avg. Years Operating</p>
              <div className="flex items-baseline mt-2">
                <p className="text-3xl font-semibold text-slate-800">{avgYearsOfOperation}</p>
                <p className="text-sm  ml-1">years</p>
              </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="">Maturity Index</span>
              <span className="font-medium text-slate-700">
                {avgYearsOfOperation < 2 ? "Startup" : avgYearsOfOperation < 5 ? "Growing" : "Established"}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(avgYearsOfOperation * 10, 100)}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Industry Distribution */}
      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium ">Industry Focus</p>
              <p className="text-3xl font-semibold mt-2 text-slate-800">{Object.keys(industryCount).length}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <ScrollArea className="mt-4 space-y-2 h-18s">

            {sortedIndustries?.slice(0, 5).map(([industry, count]) => (
              <div key={industry}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium">{industry}</span>
                  <span className="">{count} orgs</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${(count / totalOrganizations) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
