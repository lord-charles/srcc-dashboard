"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileCheck, FileText, Paperclip } from "lucide-react";
import type { ProjectDocument } from "@/types/project";

interface DocumentsSectionProps {
  projectProposalUrl?: string;
  signedContractUrl?: string;
  executionMemoUrl?: string;
  signedBudgetUrl?: string;
  documents: ProjectDocument[];
}

export const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  projectProposalUrl,
  signedContractUrl,
  executionMemoUrl,
  signedBudgetUrl,
  documents,
}) => {
  const mainDocuments = [
    {
      name: "Project Proposal",
      url: projectProposalUrl,
      icon: FileText,
    },
    {
      name: "Signed Contract",
      url: signedContractUrl,
      icon: FileCheck,
    },
    {
      name: "Execution Memo",
      url: executionMemoUrl,
      icon: Paperclip,
    },
    {
      name: "Signed Budget",
      url: signedBudgetUrl,
      icon: FileCheck,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Main Documents</h4>
            <div className="grid gap-2">
              {mainDocuments.map((doc, index) => {
                const Icon = doc.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{doc.name}</span>
                    </div>
                    {doc.url ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="ml-auto"
                      >
                        <a href={doc.url} target="_blank" rel="noopener">
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download {doc.name}</span>
                        </a>
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Not uploaded
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Additional Documents</h4>
            <div className="grid gap-2">
              {documents.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{doc.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" asChild className="ml-auto">
                    <a href={doc.url} target="_blank" rel="noopener">
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download {doc.name}</span>
                    </a>
                  </Button>
                </div>
              ))}
              {documents.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No additional documents uploaded.
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentsSection;
