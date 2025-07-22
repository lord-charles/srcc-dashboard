"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  FileText,
  User,
  CreditCard,
  Upload,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { OverviewTab } from "./tabs/overview-tab";
import { BusinessInfoTab } from "./tabs/business-info-tab";
import { ContactTab } from "./tabs/contact-tab";
import { BankingTab } from "./tabs/banking-tab";
import { DocumentsTab } from "./tabs/documents-tab";
import { useProfile } from "./profile-context";

export function ProfileTabs() {
  const { data, missingFields } = useProfile();

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: Building2,
      component: OverviewTab,
      hasIssues: false,
    },
    {
      id: "business",
      label: "Business Info",
      icon: FileText,
      component: BusinessInfoTab,
      hasIssues: missingFields.some((field) =>
        [
          "companyName",
          "registrationNumber",
          "kraPin",
          "businessAddress",
          "businessPhone",
          "businessEmail",
        ].includes(field)
      ),
    },
    {
      id: "contact",
      label: "Contact",
      icon: User,
      component: ContactTab,
      hasIssues: missingFields.some((field) =>
        field.startsWith("contactPerson")
      ),
    },
    {
      id: "banking",
      label: "Banking",
      icon: CreditCard,
      component: BankingTab,
      hasIssues: missingFields.some((field) => field.startsWith("bankDetails")),
    },
    {
      id: "documents",
      label: "Documents",
      icon: Upload,
      component: DocumentsTab,
      hasIssues: missingFields.some((field) => field.includes("Url")),
    },
  ];

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5 h-auto p-1  border shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex flex-col items-center gap-2 py-3 px-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 relative"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">
                  {tab.label}
                </span>
                {tab.hasIssues && (
                  <AlertCircle className="w-3 h-3 text-red-500" />
                )}
                {!tab.hasIssues && tab.id !== "overview" && (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                )}
              </div>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {tabs.map((tab) => {
        const Component = tab.component;
        return (
          <TabsContent key={tab.id} value={tab.id} className="space-y-4">
            <Component />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
