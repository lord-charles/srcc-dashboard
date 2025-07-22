"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  TrendingUp,
  Award,
} from "lucide-react";
import { useProfile } from "../profile-context";

export function OverviewTab() {
  const { data } = useProfile();

  const quickStats = [
    {
      label: "Years of Operation",
      value: data.yearsOfOperation || "Not specified",
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      label: "Services Offered",
      value: data.servicesOffered?.length || 0,
      icon: Briefcase,
      color: "text-green-600",
    },
    {
      label: "Industries",
      value: data.industries?.length || 0,
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      label: "Work Types",
      value: data.preferredWorkTypes?.length || 0,
      icon: Users,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Company Overview */}
      <Card className="lg:col-span-2 p-0 border-0 shadow-lg ">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              Company Overview
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {data.companyName || "Company name not provided"}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Company Name
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {data.businessPhone || "Not provided"}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Business Phone
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {data.businessEmail || "Not provided"}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Business Email
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {data.website || "Not provided"}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Website
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {data.businessAddress || "Not provided"}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Business Address
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {data.department || "Not specified"}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Department
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Services and Industries */}
          {(data.servicesOffered?.length || data.industries?.length) && (
            <>
              <Separator />
              <div className="space-y-4">
                {data.servicesOffered?.length && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Services Offered
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {data.servicesOffered.map((service, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-white"
                        >
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {data.industries?.length && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Industries
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {data.industries.map((industry, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="border-green-200 dark:border-green-700 text-green-700 dark:text-green-300"
                        >
                          {industry}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="space-y-6">
        <Card className="border-0 shadow-lg ">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 mt-4">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {stat.value}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Work Preferences */}
        {data.preferredWorkTypes?.length && (
          <Card className="border-0 shadow-lg ">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Work Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.preferredWorkTypes.map((type, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="capitalize bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white"
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
