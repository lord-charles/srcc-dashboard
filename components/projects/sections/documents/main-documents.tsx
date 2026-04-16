"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileCheck, FileText, Paperclip, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cloudinaryService } from "@/lib/cloudinary-service";
import { SimpleFileUpload } from "@/components/ui/simple-file-upload";
import { updateProject } from "@/services/projects-service";

import { useRouter } from "next/navigation";

interface MainDocumentsProps {
  projectId: string;
  projectProposalUrl?: string;
  signedContractUrl?: string;
  executionMemoUrl?: string;
  signedBudgetUrl?: string;
  onRefresh?: () => void;
}

export const MainDocuments: React.FC<MainDocumentsProps> = ({
  projectId,
  projectProposalUrl,
  signedContractUrl,
  executionMemoUrl,
  signedBudgetUrl,
  onRefresh,
}) => {
  const { toast } = useToast();
  const router = useRouter();
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const mainDocsList = [
    { name: "Project Proposal", url: projectProposalUrl, icon: FileText, field: "projectProposalUrl" },
    { name: "Signed Contract", url: signedContractUrl, icon: FileCheck, field: "signedContractUrl" },
    { name: "Execution Memo", url: executionMemoUrl, icon: Paperclip, field: "executionMemoUrl" },
    { name: "Signed Budget", url: signedBudgetUrl, icon: FileCheck, field: "signedBudgetUrl" },
  ];

  const handleReplace = async (field: string, file: File) => {
    setUploading((prev) => ({ ...prev, [field]: true }));
    try {
      const url = await cloudinaryService.uploadFile(file);
      await updateProject(projectId, { [field]: url });
      toast({ title: "Document updated" });
      onRefresh?.();
      router.refresh();
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }));
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">Mandatory Documents</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {mainDocsList.map((doc) => {
          const Icon = doc.icon;
          return (
            <div
              key={doc.field}
              className="group flex flex-col gap-2 p-3 rounded-lg border bg-card hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">{doc.name}</p>
                    {doc.url ? (
                      <p className="text-[10px] text-green-600 mt-1">Uploaded</p>
                    ) : (
                      <p className="text-[10px] text-destructive mt-1">Missing</p>
                    )}
                  </div>
                </div>
                {doc.url && (
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground opacity-30 group-hover:opacity-100 transition-opacity" asChild>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
              </div>

              <div className="mt-1 flex items-center justify-between">
                 <div className="w-full">
                  <SimpleFileUpload
                    label="Replace document"
                    variant="outline"
                    onChange={async (files) => {
                      if (!files?.length) return;
                      await handleReplace(doc.field, files[0]);
                    }}
                  />
                 </div>
                 {uploading[doc.field] && <Loader2 className="h-4 w-4 animate-spin text-primary ml-2 shrink-0" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
