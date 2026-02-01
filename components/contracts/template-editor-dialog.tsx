import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Spinner } from "../ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TemplateEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: {
    _id: string;
    name: string;
    version?: string;
    contentType: string;
    content: string;
    variables?: string[];
    category?: string;
  } | null;
  onSave: (editedContent: string) => void;
  isLoading?: boolean;
  contractData?: {
    projectName: string;
    teamMemberName: string;
    teamMemberEmail: string;
    contractValue: number;
    currency: string;
    startDate: string;
    endDate: string;
    description: string;
    // Coach-specific data
    isCoach?: boolean;
    coachRate?: number;
    coachRateUnit?: "per_session" | "per_hour";
    coachTitle?: string; // Mr, Ms, Dr, etc.
    coachFirstName?: string;
    coachLastName?: string;
  };
}

export function TemplateEditorDialog({
  open,
  onOpenChange,
  template,
  onSave,
  isLoading = false,
  contractData,
}: TemplateEditorDialogProps) {
  const [editedContent, setEditedContent] = useState("");

  // Function to replace template variables with actual values
  const populateTemplate = useCallback(
    (content: string) => {
      if (!contractData) return content;

      let populated = content;

      const startDate = new Date(contractData.startDate);
      const endDate = new Date(contractData.endDate);
      const currentDate = new Date();

      // Format dates in different ways
      const formatLongDate = (date: Date) =>
        date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

      const formatShortDate = (date: Date) =>
        date.toLocaleDateString("en-GB", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

      const formatMonthYear = (date: Date) =>
        date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
        });

      // Common replacements for both team members and coaches
      const commonReplacements: Record<string, string> = {
        // Project Name
        "{{projectName}}": contractData.projectName,
        "{{project_name}}": contractData.projectName,
        "{{Project Name}}": contractData.projectName,
        "{Project Name}": contractData.projectName,
        "{projectName}": contractData.projectName,
        "{project_name}": contractData.projectName,

        // Currency
        "{{currency}}": contractData.currency,
        "{currency}": contractData.currency,
        "{Currency}": contractData.currency,

        // Dates - Full format
        "{{startDate}}": formatLongDate(startDate),
        "{{start_date}}": formatLongDate(startDate),
        "{startDate}": formatLongDate(startDate),
        "{Start Date}": formatLongDate(startDate),
        "{{endDate}}": formatLongDate(endDate),
        "{{end_date}}": formatLongDate(endDate),
        "{endDate}": formatLongDate(endDate),
        "{End Date}": formatLongDate(endDate),
        "{{currentDate}}": formatLongDate(currentDate),
        "{{current_date}}": formatLongDate(currentDate),
        "{Date}": formatLongDate(currentDate),
        "{date}": formatLongDate(currentDate),

        // Dates - Month Year format
        "{month-start, year-start}": formatLongDate(startDate),
        "{month-end, year-end}": formatLongDate(endDate),

        // Description / Title
        "{{description}}": contractData.description,
        "{description}": contractData.description,
        "{title}": contractData.description,
        "{{title}}": contractData.description,

        // Department
        "{Department}": "Research and Consultancy",
        "{{Department}}": "Research and Consultancy",
        "{department}": "Research and Consultancy",
        "{{department}}": "Research and Consultancy",
      };

      // Coach-specific replacements
      if (contractData.isCoach) {
        const coachReplacements: Record<string, string> = {
          // Coach Name variations
          "{Coach Name}": contractData.teamMemberName,
          "{{Coach Name}}": contractData.teamMemberName,
          "{coach_name}": contractData.teamMemberName,
          "{{coach_name}}": contractData.teamMemberName,
          "{name}": contractData.teamMemberName,
          "{Name}": contractData.teamMemberName,
          "{{name}}": contractData.teamMemberName,

          // Coach Title (Mr, Ms, Dr, etc.)
          "{Coach Title}": contractData.coachTitle || "Mr/Ms",
          "{{Coach Title}}": contractData.coachTitle || "Mr/Ms",
          "{coach_title}": contractData.coachTitle || "Mr/Ms",

          // Coach Last Name
          "{Coach Last Name}":
            contractData.coachLastName ||
            contractData.teamMemberName.split(" ").pop() ||
            "",
          "{{Coach Last Name}}":
            contractData.coachLastName ||
            contractData.teamMemberName.split(" ").pop() ||
            "",
          "{coach_last_name}":
            contractData.coachLastName ||
            contractData.teamMemberName.split(" ").pop() ||
            "",

          // Rate and Rate Unit
          "{Rate}": contractData.coachRate?.toString() || "XXX",
          "{{Rate}}": contractData.coachRate?.toString() || "XXX",
          "{rate}": contractData.coachRate?.toString() || "XXX",
          "{{rate}}": contractData.coachRate?.toString() || "XXX",

          "{Rate Unit}":
            contractData.coachRateUnit === "per_session" ? "session" : "hour",
          "{{Rate Unit}}":
            contractData.coachRateUnit === "per_session" ? "session" : "hour",
          "{rate_unit}":
            contractData.coachRateUnit === "per_session" ? "session" : "hour",
          "{{rate_unit}}":
            contractData.coachRateUnit === "per_session" ? "session" : "hour",

          // Email
          "{{coachEmail}}": contractData.teamMemberEmail,
          "{coach_email}": contractData.teamMemberEmail,
          "{email}": contractData.teamMemberEmail,
          "{{email}}": contractData.teamMemberEmail,

          // Contract Reference for coaches
          "{Contract Ref. No}": `EM/COACHING/${formatShortDate(currentDate).replace(/\//g, "/")}/2025`,
          "{{Contract Ref. No}}": `EM/COACHING/${formatShortDate(currentDate).replace(/\//g, "/")}/2025`,
        };

        Object.assign(commonReplacements, coachReplacements);
      } else {
        // Team Member/Consultant-specific replacements
        const teamMemberReplacements: Record<string, string> = {
          // Team Member Name (the contractor)
          "{{teamMemberName}}": contractData.teamMemberName,
          "{{team_member_name}}": contractData.teamMemberName,
          "{{contractorName}}": contractData.teamMemberName,
          "{{contractor_name}}": contractData.teamMemberName,

          "{name}": contractData.teamMemberName,
          "{Name}": contractData.teamMemberName,
          "{{name}}": contractData.teamMemberName,

          "{{Name of Staff}}": contractData.teamMemberName,
          "{Name of Staff}": contractData.teamMemberName,
          "{{staffName}}": contractData.teamMemberName,
          "{staffName}": contractData.teamMemberName,

          // Email
          "{{teamMemberEmail}}": contractData.teamMemberEmail,
          "{{team_member_email}}": contractData.teamMemberEmail,
          "{email}": contractData.teamMemberEmail,
          "{{email}}": contractData.teamMemberEmail,

          // Contract Value / Amount
          "{{contractValue}}": contractData.contractValue.toLocaleString(),
          "{{contract_value}}": contractData.contractValue.toLocaleString(),
          "{amount}": `${contractData.currency} ${contractData.contractValue.toLocaleString()}`,
          "{{amount}}": `${contractData.currency} ${contractData.contractValue.toLocaleString()}`,
          "{amount with currency}": `${contractData.currency} ${contractData.contractValue.toLocaleString()}`,
          "{{amount with currency}}": `${contractData.currency} ${contractData.contractValue.toLocaleString()}`,

          // Contract Reference for team members
          "{Contract Ref. No}": "SRCC-" + new Date().getFullYear() + "-XXXXX",
          "{{Contract Ref. No}}": "SRCC-" + new Date().getFullYear() + "-XXXXX",
        };

        Object.assign(commonReplacements, teamMemberReplacements);
      }

      // Replace all variables
      Object.entries(commonReplacements).forEach(([key, value]) => {
        // Escape special regex characters in the key
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        populated = populated.replace(new RegExp(escapedKey, "g"), value);
      });

      return populated;
    },
    [contractData],
  );

  useEffect(() => {
    if (template) {
      const populated = populateTemplate(template.content);
      setEditedContent(populated);
    }
  }, [template, populateTemplate]);

  const handleSave = () => {
    onSave(editedContent);
  };

  if (!template) return null;

  const isCoachTemplate = template.category === "coach";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Edit {isCoachTemplate ? "Coach" : "Team Member"} Contract Template:{" "}
            {template.name}
          </DialogTitle>
          <DialogDescription>
            {template.version && `Version ${template.version} • `}
            {template.contentType.toUpperCase()} Format
            {template.variables && template.variables.length > 0 && (
              <div className="mt-2 text-sm">
                <span className="font-medium">Available variables:</span>{" "}
                {template.variables.map((v) => `{{${v}}}`).join(", ")}
              </div>
            )}
            {isCoachTemplate && (
              <div className="mt-2 text-sm text-blue-600">
                <span className="font-medium">Coach Template Variables:</span>{" "}
                {"{Coach Name}"}, {"{Coach Title}"}, {"{Coach Last Name}"},{" "}
                {"{Rate}"}, {"{Rate Unit}"}, {"{Currency}"}, {"{Date}"},{" "}
                {"{End Date}"}
              </div>
            )}
            {!isCoachTemplate && (
              <div className="mt-2 text-sm text-green-600">
                <span className="font-medium">Team Member Variables:</span>{" "}
                {"{Name of Staff}"}, {"{amount with currency}"},{" "}
                {"{Project Name}"}, {"{Date}"}, {"{Department}"}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="template-content">Template Content</Label>
          <Textarea
            id="template-content"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="min-h-[400px] font-mono text-sm"
            placeholder="Enter template content..."
          />
        </div>

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Spinner />
                <span>Saving...</span>
              </div>
            ) : (
              "Use This Template"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
