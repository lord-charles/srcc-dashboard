"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  FileText,
  GraduationCap,
  CreditCard,
  Phone,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { PersonalInfoTab } from "./tabs/personal-info-tab";
import { ProfessionalTab } from "./tabs/professional-tab";
import { EducationTab } from "./tabs/education-tab";
import { PaymentTab } from "./tabs/payment-tab";
import { EmergencyTab } from "./tabs/emergency-tab";
import { useConsultant } from "./consultant-context";

export function ConsultantTabs() {
  const { data, missingFields } = useConsultant();

  const tabs = [
    {
      id: "personal",
      label: "Personal Info",
      icon: User,
      component: PersonalInfoTab,
      hasIssues: missingFields.some((field: any) =>
        [
          "firstName",
          "lastName",
          "email",
          "phoneNumber",
          "nationalId",
        ].includes(field)
      ),
    },
    {
      id: "professional",
      label: "Professional",
      icon: FileText,
      component: ProfessionalTab,
      hasIssues: missingFields.some((field: any) =>
        ["position", "department", "skills", "cvUrl"].includes(field)
      ),
    },
    {
      id: "education",
      label: "Education",
      icon: GraduationCap,
      component: EducationTab,
      hasIssues: missingFields.some((field: any) =>
        field.includes("academicCertificates")
      ),
    },
    {
      id: "payment",
      label: "Payment",
      icon: CreditCard,
      component: PaymentTab,
      hasIssues: missingFields.some(
        (field: any) =>
          field.startsWith("bankDetails") || field.startsWith("mpesaDetails")
      ),
    },
    {
      id: "emergency",
      label: "Emergency",
      icon: Phone,
      component: EmergencyTab,
      hasIssues: missingFields.some((field: any) =>
        field.startsWith("emergencyContact")
      ),
    },
  ];

  return (
    <Tabs defaultValue="personal" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5 h-auto p-1 bg-background border shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex flex-col items-center gap-2 py-3 px-4 data-[state=active]:bg-primary/10 data-[state=active]:text-primary relative transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">
                  {tab.label}
                </span>
                {tab.hasIssues ? (
                  <AlertCircle className="w-3 h-3 text-destructive" />
                ) : (
                  <CheckCircle className="w-3 h-3 text-success" />
                )}
              </div>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {tabs.map((tab) => {
        const Component = tab.component;
        return (
          <TabsContent key={tab.id} value={tab.id} className="space-y-6">
            <Component />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
