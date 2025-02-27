"use client";

import type React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  ShieldAlert,
} from "lucide-react";
import { RiskAssessment } from "@/types/project";

interface RiskSectionProps {
  riskAssessment: RiskAssessment;
  riskLevel: "Low" | "Medium" | "High";
}

export const RiskSection: React.FC<RiskSectionProps> = ({
  riskAssessment,
  riskLevel,
}) => {
  const getRiskBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "low":
        return "bg-green-500/10 text-green-500";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500";
      case "high":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case "low":
        return <ShieldAlert className="h-5 w-5 text-green-500" />;
      case "medium":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "high":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Risk Assessment</CardTitle>
        <Badge
          className={`${getRiskBadgeColor(
            riskLevel
          )} px-3 py-1 text-sm font-medium`}
        >
          {getRiskIcon(riskLevel)}
          <span className="ml-1 capitalize">{riskLevel} Risk</span>
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Risk Factors</h3>
            <div className="space-y-2">
              {riskAssessment.factors.map((factor, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-2 rounded-lg border p-3"
                >
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <p className="text-sm">{factor}</p>
                </div>
              ))}
              {riskAssessment.factors.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No risk factors have been identified yet.
                </p>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-2">
              Mitigation Strategies
            </h3>
            <div className="space-y-2">
              {riskAssessment.mitigationStrategies.map((strategy, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-2 rounded-lg border p-3"
                >
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <p className="text-sm">{strategy}</p>
                </div>
              ))}
              {riskAssessment.mitigationStrategies.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No mitigation strategies have been defined yet.
                </p>
              )}
            </div>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Last Assessment</p>
                <p className="text-sm text-muted-foreground">
                  {riskAssessment.lastAssessmentDate
                    ? new Date(
                        riskAssessment.lastAssessmentDate
                      ).toLocaleDateString()
                    : "Not available"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Next Assessment</p>
                <p className="text-sm text-muted-foreground">
                  {riskAssessment.nextAssessmentDate
                    ? new Date(
                        riskAssessment.nextAssessmentDate
                      ).toLocaleDateString()
                    : "Not scheduled"}
                </p>
              </div>
            </div>
          </div>

          <Button className="w-full">Update Assessment</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskSection;
