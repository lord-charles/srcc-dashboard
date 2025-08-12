"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import {
  User,
  CheckCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  Loader2,
} from "lucide-react";
import { useConsultant } from "./consultant-context";
import { ConsultantInsights } from "./consultant-insights";
import { completeConsultantRegistration } from "@/services/consultant.service";
import { useToast } from "@/hooks/use-toast";
import { signOut } from "next-auth/react";

export function ConsultantHeader() {
  const {
    data,
    completionPercentage,
    loading,
    refreshData,
    missingFields,
    consultantId,
  } = useConsultant();
  const [completing, setCompleting] = useState(false);
  const { toast } = useToast();

  const handleCompleteRegistration = async () => {
    setCompleting(true);
    try {
      await completeConsultantRegistration(consultantId);
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
    return <ConsultantHeaderSkeleton />;
  }

  const fullName = [data.firstName, data.middleName, data.lastName]
    .filter(Boolean)
    .join(" ");
  const initials = [data.firstName?.charAt(0), data.lastName?.charAt(0)]
    .filter(Boolean)
    .join("");



  const getAvailabilityVariant = (availability?: string) => {
    switch (availability) {
      case "available":
        return "default";
      case "partially_available":
        return "secondary";
      case "not_available":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-4 mb-4">
      {/* Main Header Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Consultant Info */}
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg ring-2 ring-muted">
                <AvatarImage
                  src={`https://ui-avatars.com/api/?name=${fullName}&background=random&color=fff&size=96`}
                />
                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                  {initials || "C"}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-bold text-foreground tracking-tight">
                    {fullName || "Consultant Profile"}
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

                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  {data.position && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{data.position}</span>
                    </div>
                  )}
                  {data.department && (
                    <>
                      <Separator orientation="vertical" className="h-4" />
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{data.department}</span>
                      </div>
                    </>
                  )}
                  {data.yearsOfExperience !== undefined && (
                    <>
                      <Separator orientation="vertical" className="h-4" />
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>{data.yearsOfExperience} years experience</span>
                      </div>
                    </>
                  )}
                  {data.availability && (
                    <>
                      <Separator orientation="vertical" className="h-4" />
                      <Badge
                        variant={getAvailabilityVariant(data.availability)}
                        className="capitalize text-xs"
                      >
                        {data.availability.replace("_", " ")}
                      </Badge>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  {data.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span className="truncate max-w-[200px]">
                        {data.email}
                      </span>
                    </div>
                  )}
                  {data.phoneNumber && (
                    <>
                      <Separator orientation="vertical" className="h-4" />
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <span>{data.phoneNumber}</span>
                      </div>
                    </>
                  )}
                  {data.county && (
                    <>
                      <Separator orientation="vertical" className="h-4" />
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{data.county}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end">
              {missingFields.length === 0 &&
                data.registrationStatus !== "complete" && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-foreground">
                      {missingFields.length > 0 ? "Missing Fields:" : ""}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {missingFields.slice(0, 3).map((field: any) => (
                        <Badge
                          key={field}
                          variant="outline"
                          className="text-xs"
                        >
                          {field
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str: any) => str.toUpperCase())}
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
              {missingFields.length === 0 &&
              data.registrationStatus !== "complete" ? (
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
              ) : (
                <Button
                onClick={handleCompleteRegistration}
                disabled={completing}>
                  <CheckCircle className="mr-2 h-4 w-4" /> Update
                  Details
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress and Insights */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Progress Card */}
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Profile Completion
              </h3>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  {completionPercentage}%
                </div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
            </div>

            <Progress value={completionPercentage} className="h-3 mb-4" />

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">
                  {completionPercentage === 100
                    ? "All sections completed"
                    : `${missingFields.length} sections remaining`}
                </div>
                <div className="text-primary font-medium">
                  {completionPercentage >= 80 ? "Almost there!" : "Keep going!"}
                </div>
              </div>
              {missingFields.length === 0 &&
                data.registrationStatus !== "complete" && (
                  <Button
                    onClick={handleCompleteRegistration}
                    disabled={completing}
                    size="lg"
                  >
                    {completing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Complete Registration
                  </Button>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Completion Insights */}
        <ConsultantInsights />
      </div>
    </div>
  );
}

function ConsultantHeaderSkeleton() {
  return (
    <div className="space-y-4 mb-4">
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-muted animate-pulse" />
            <div className="space-y-3 flex-1">
              <div className="h-8 bg-muted rounded animate-pulse w-1/3" />
              <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
              <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="h-4 bg-muted rounded animate-pulse mb-4" />
            <div className="h-3 bg-muted rounded animate-pulse mb-4" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="h-4 bg-muted rounded animate-pulse mb-4" />
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded animate-pulse" />
              <div className="h-3 bg-muted rounded animate-pulse" />
              <div className="h-3 bg-muted rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
