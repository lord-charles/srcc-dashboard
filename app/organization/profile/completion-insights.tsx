"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useProfile } from "./profile-context";
import { CheckCircle, Clock, TrendingUp, AlertTriangle } from "lucide-react";

export function CompletionInsights() {
  const { completionPercentage, missingFields, data } = useProfile();

  const getInsightLevel = () => {
    if (completionPercentage === 100) return "complete";
    if (completionPercentage >= 80) return "good";
    if (completionPercentage >= 60) return "moderate";
    return "needs-attention";
  };

  const insightLevel = getInsightLevel();

  const insights = {
    complete: {
      icon: CheckCircle,
      variant: "default" as const,
      title: "Profile Complete",
      message: "All required information has been provided.",
    },
    good: {
      icon: TrendingUp,
      variant: "default" as const,
      title: "Almost Complete",
      message: "Just a few more fields to complete your profile.",
    },
    moderate: {
      icon: Clock,
      variant: "default" as const,
      title: "In Progress",
      message: "Continue adding information to improve your profile.",
    },
    "needs-attention": {
      icon: AlertTriangle,
      variant: "destructive" as const,
      title: "Needs Attention",
      message: "Several required fields are missing.",
    },
  };

  const currentInsight = insights[insightLevel];
  const Icon = currentInsight.icon;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon className="w-5 h-5" />
          Profile Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant={currentInsight.variant}>
          <Icon className="h-4 w-4" />
          <AlertTitle>{currentInsight.title}</AlertTitle>
          <AlertDescription>{currentInsight.message}</AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
