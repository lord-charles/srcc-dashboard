import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, Clock, Award } from "lucide-react"

type Consultant = {
  _id: string
  firstName: string
  lastName: string
  email: string
  skills: { name: string; yearsOfExperience: string; proficiencyLevel: string }[]
  yearsOfExperience: number
  hourlyRate: number
  availability: string
  status: string
  department: string
}

type ConsultantStatsProps = {
  consultants: any[]
}

export function ConsultantStats({ consultants }: ConsultantStatsProps) {
  // Calculate statistics
  const activeConsultants = consultants?.filter((c) => c.status === "active")?.length
  const totalConsultants = consultants?.length
  const activePercentage = totalConsultants > 0 ? Math.round((activeConsultants / totalConsultants) * 100) : 0

  const avgExperience =
    consultants?.length > 0
      ? Math.round(consultants.reduce((sum: number, c: Consultant) => sum + c.yearsOfExperience, 0) / consultants.length)
      : 0

  const availableConsultants = consultants?.filter((c: Consultant) => c?.availability === "available")?.length
  const availablePercentage = totalConsultants > 0 ? Math.round((availableConsultants / totalConsultants) * 100) : 0

  // Get skills distribution
  const allSkills = consultants?.flatMap((c: Consultant) => c?.skills?.map((s: { name: string }) => s?.name))
  const skillsCount = allSkills?.reduce(
    (acc: Record<string, number>, skill: string) => {
      acc[skill] = (acc[skill] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Sort skills by count
  const sortedSkills = Object.entries(skillsCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  // Get proficiency levels distribution
  const allProficiencyLevels = consultants.flatMap((c: Consultant) => c.skills.map((s: { proficiencyLevel: string }) => s.proficiencyLevel))

  const proficiencyCount = allProficiencyLevels.reduce(
    (acc: Record<string, number>, level: string) => {
      acc[level] = (acc[level] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const expertPercentage =
    allProficiencyLevels.length > 0
      ? Math.round(((proficiencyCount["expert"] || 0) / allProficiencyLevels.length) * 100)
      : 0

  const intermediatePercentage =
    allProficiencyLevels.length > 0
      ? Math.round(((proficiencyCount["intermediate"] || 0) / allProficiencyLevels.length) * 100)
      : 0
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Total Consultants */}
      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium ">Total Consultants</p>
              <p className="text-3xl font-semibold mt-2 text-slate-800">{totalConsultants}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-slate-600" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span>Active</span>
                <span className="font-medium">{activeConsultants} ({activePercentage}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div
                  className="bg-green-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${activePercentage}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span>Pending</span>
                <span className="font-medium">{totalConsultants - activeConsultants} ({100 - activePercentage}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div
                  className="bg-orange-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${100 - activePercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Consultants */}
      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium ">Available Consultants</p>
              <p className="text-3xl font-semibold mt-2 text-slate-800">{availableConsultants}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span >Availability Rate</span>
              <span className="font-medium ">{availablePercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${availablePercentage}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Experience */}
      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium ">Avg. Experience</p>
              <div className="flex items-baseline mt-2">
                <p className="text-3xl font-semibold text-slate-800">{avgExperience}</p>
                <p className="text-sm  ml-1">years</p>
              </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span >Expert Level</span>
              <span className="font-medium ">{expertPercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${expertPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span >Intermediate Level</span>
              <span className="font-medium ">{intermediatePercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${intermediatePercentage}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Distribution */}
      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium ">Top Skills</p>
              <p className="text-3xl font-semibold mt-2 text-slate-800">{Object.keys(skillsCount).length}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
              <Award className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <ScrollArea className="mt-4 space-y-3 h-22">
            {sortedSkills?.slice(0, 5).map(([skill, count]) => (
              <div key={skill}>
                <div className="flex justify-between text-xs mb-1">
                  <span className=" font-medium capitalize">{skill}</span>
                  <span >{count} consultants</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${(count / totalConsultants) * 100}%` }}
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
