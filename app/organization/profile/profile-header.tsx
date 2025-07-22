"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import {
  Building2,
  CheckCircle,
  Clock,
  Loader2,
  RefreshCw,
  Shield,
  TrendingUp,
} from "lucide-react";
import { useProfile } from "./profile-context";
import { CompletionInsights } from "./completion-insights";
import { completeOrganizationRegistration } from "@/services/consultant.service";
import { useToast } from "@/hooks/use-toast";
import { signOut } from "next-auth/react";

export function ProfileHeader() {
  const {
    data,
    completionPercentage,
    loading,
    refreshData,
    missingFields,
    organizationId,
  } = useProfile();
  const [completing, setCompleting] = useState(false);
  const { toast } = useToast();

  const handleCompleteRegistration = async () => {
    if (!organizationId) return;
    setCompleting(true);
    try {
      await completeOrganizationRegistration(organizationId);
      toast({
        title: "Success",
        description: "Registration completed successfully",
      });
      await refreshData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete registration",
        variant: "destructive",
      });
    } finally {
      setCompleting(false);
      toast({
        title: "Success",
        description: "Please login again to complete your registration",
      });

      setTimeout(() => {
        signOut({ redirect: true, callbackUrl: "/login" });
      }, 2000);
    }
  };

  if (loading) {
    return <ProfileHeaderSkeleton />;
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Main Header Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Company Info */}
            <div className="flex items-center gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-primary-900 tracking-tight">
                    {data.companyName || "Organization Profile"}
                  </h1>
                  <Badge
                    variant={
                      completionPercentage === 100 ? "default" : "secondary"
                    }
                    className="text-sm px-3 py-1 font-medium"
                  >
                    {completionPercentage === 100 ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Complete
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 mr-1" />
                        {completionPercentage}% Complete
                      </>
                    )}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm ">
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <span>
                      {data.registrationNumber ||
                        "Registration Number not specified"}
                    </span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>{data.yearsOfOperation || 0} years in operation</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              {missingFields.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Missing Fields</p>
                  <div className="flex flex-wrap gap-2">
                    {missingFields.slice(0, 3).map((field) => (
                      <Badge
                        key={field}
                        variant="secondary"
                        className="text-xs font-normal"
                      >
                        {field
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </Badge>
                    ))}
                    {missingFields.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{missingFields.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              {completionPercentage === 100 &&
              data.registrationStatus !== "complete" ? (
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={handleCompleteRegistration}
                    disabled={completing}
                  >
                    {completing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Complete Registration
                  </Button>
                </div>
              ) : (
                <Button disabled>
                  <CheckCircle className="mr-2 h-4 w-4" /> Completed
                  Registration
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress and Insights */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Progress Card */}
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-heading">
                Profile Completion
              </h3>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  {completionPercentage}%
                </div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
            </div>

            <Progress
              value={completionPercentage}
              className="h-3 mb-4"
              color="primary"
            />

            {completionPercentage === 100 &&
              data.registrationStatus !== "complete" && (
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={handleCompleteRegistration}
                    disabled={completing}
                  >
                    {completing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Complete Registration
                  </Button>
                </div>
              )}

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {completionPercentage === 100
                  ? "All required fields completed"
                  : `${Math.ceil(
                      (100 - completionPercentage) / 10
                    )} sections remaining`}
              </span>
              <span className="text-primary font-medium">
                {completionPercentage >= 80 ? "Almost there!" : "Keep going!"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Completion Insights */}
        <CompletionInsights />
      </div>
    </div>
  );
}

function ProfileHeaderSkeleton() {
  return (
    <div className="space-y-6 mb-8">
      <Card className="border-0 shadow-xl">
        <CardContent className="p-8">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-gray-200 animate-pulse" />
            <div className="space-y-3 flex-1">
              <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-3 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
