"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Download, FileCheck, FileText, Paperclip, Upload, AlertCircle, Check, Loader2 } from "lucide-react";
import type { ProjectDocument } from "@/types/project";
import { useToast } from "@/hooks/use-toast";
import { cloudinaryService } from "@/lib/cloudinary-service";
import { addProjectDocument, updateProject } from "@/services/projects-service";
import { FileUpload } from "@/components/ui/file-upload";

interface DocumentsSectionProps {
  projectId: string;
  projectProposalUrl?: string;
  signedContractUrl?: string;
  executionMemoUrl?: string;
  signedBudgetUrl?: string;
  documents: ProjectDocument[];
}

export const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  projectId,
  projectProposalUrl,
  signedContractUrl,
  executionMemoUrl,
  signedBudgetUrl,
  documents,
}) => {
  const { toast } = useToast();
  const router = useRouter();
  // Track per-main-document uploading state
  const [mainUploading, setMainUploading] = useState<
    Partial<
      Record<
        "projectProposalUrl" | "signedContractUrl" | "executionMemoUrl" | "signedBudgetUrl",
        boolean
      >
    >
  >({});
  const [newDocName, setNewDocName] = useState("");
  const [newDocUploading, setNewDocUploading] = useState(false);
  const [newDocUrl, setNewDocUrl] = useState<string>("");
  const [pendingMain, setPendingMain] = useState<Partial<Record<
    "projectProposalUrl" | "signedContractUrl" | "executionMemoUrl" | "signedBudgetUrl",
    string
  >>>({});
  const [pendingAdditional, setPendingAdditional] = useState<{ name: string; url: string }[]>([]);

  const mainDocuments: Array<{
    name: string;
    url?: string;
    icon: any;
    field: "projectProposalUrl" | "signedContractUrl" | "executionMemoUrl" | "signedBudgetUrl";
  }> = [
    { name: "Project Proposal", url: projectProposalUrl, icon: FileText, field: "projectProposalUrl" },
    { name: "Signed Contract", url: signedContractUrl, icon: FileCheck, field: "signedContractUrl" },
    { name: "Execution Memo", url: executionMemoUrl, icon: Paperclip, field: "executionMemoUrl" },
    { name: "Signed Budget", url: signedBudgetUrl, icon: FileCheck, field: "signedBudgetUrl" },
  ];

  const replaceMainDocument = async (
    field: "projectProposalUrl" | "signedContractUrl" | "executionMemoUrl" | "signedBudgetUrl",
    file: File
  ) => {
    setMainUploading((prev) => ({ ...prev, [field]: true }));
    try {
      const url = await cloudinaryService.uploadFile(file);
      setPendingMain((prev) => ({ ...prev, [field]: url }));
      toast({ title: "Staged", description: `Change staged. Click Save Changes to apply.` });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e?.message || "Unable to upload", variant: "destructive" });
    } finally {
      setMainUploading((prev) => ({ ...prev, [field]: false }));
    }
  };

  const addAdditionalDocument = async () => {
    if (!newDocName || !newDocUrl) {
      toast({ title: "Missing fields", description: "Please provide a name and upload a file.", variant: "destructive" });
      return;
    }
    setPendingAdditional((prev) => [...prev, { name: newDocName, url: newDocUrl }]);
    setNewDocName("");
    setNewDocUrl("");
    toast({ title: "Staged", description: "Additional document staged. Click Save Changes to apply." });
  };

  const hasPending = Object.keys(pendingMain).length > 0 || pendingAdditional.length > 0;

  const saveChanges = async () => {
    try {
      if (Object.keys(pendingMain).length > 0) {
        await updateProject(projectId, pendingMain as any);
      }
      for (const doc of pendingAdditional) {
        await addProjectDocument(projectId, doc);
      }
      toast({ title: "Saved", description: "Documents updated successfully." });
      setPendingMain({});
      setPendingAdditional([]);
      router.refresh();
    } catch (e: any) {
      toast({ title: "Save failed", description: e?.message || "Unable to save changes", variant: "destructive" });
    }
  };

  const discardChanges = () => {
    setPendingMain({});
    setPendingAdditional([]);
    setNewDocName("");
    setNewDocUrl("");
    toast({ title: "Discarded", description: "Pending changes discarded." });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {hasPending && (
            <div className="flex items-center gap-2 rounded-md bg-amber-50 p-2 text-amber-700 text-xs border border-amber-200">
              <AlertCircle className="h-3 w-3" />
              You have pending document changes. Click &quot;Save Changes&quot; to apply.
            </div>
          )}
          <div className="space-y-1">
            <h4 className="text-xs font-medium text-muted-foreground">Main Documents</h4>
            <div className="grid gap-1">
              {mainDocuments.map((doc, index) => {
                const Icon = doc.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs">{doc.name}</span>
                      {pendingMain[doc.field] && (
                        <span className="text-[10px] text-amber-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Pending change
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-auto">
                      {doc.url ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="ml-auto h-7 w-7"
                        >
                          <a href={doc.url} target="_blank" rel="noopener">
                            <Download className="h-3 w-3" />
                            <span className="sr-only">Download {doc.name}</span>
                          </a>
                        </Button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">
                          Not uploaded
                        </span>
                      )}
                      <FileUpload
                        onChange={async (files) => {
                          if (!files?.length) return;
                          await replaceMainDocument(doc.field, files[0]);
                        }}
                      />
                      {mainUploading[doc.field] && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 px-1">
                          <Loader2 className="h-3 w-3 animate-spin" /> Uploading...
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-medium text-muted-foreground">Additional Documents</h4>
            <div className="grid gap-1">
              {documents.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs">{doc.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" asChild className="ml-auto h-7 w-7">
                    <a href={doc.url} target="_blank" rel="noopener">
                      <Download className="h-3 w-3" />
                      <span className="sr-only">Download {doc.name}</span>
                    </a>
                  </Button>
                </div>
              ))}
              {documents.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No additional documents uploaded.
                </p>
              )}
              <div className="flex flex-col gap-2 rounded-md border p-2">
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Document name (e.g. MOU, Addendum)"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                  />
                  <FileUpload
                    onChange={async (files) => {
                      if (!files?.length) return;
                      setNewDocUploading(true);
                      try {
                        const url = await cloudinaryService.uploadFile(files[0]);
                        setNewDocUrl(url);
                        toast({ title: "Uploaded", description: "File uploaded. Click Add to save." });
                      } catch (e: any) {
                        toast({ title: "Upload failed", description: e?.message || "Unable to upload", variant: "destructive" });
                      } finally {
                        setNewDocUploading(false);
                      }
                    }}
                  />
                  {newDocUploading && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 px-1">
                      <Loader2 className="h-3 w-3 animate-spin" /> Uploading...
                    </span>
                  )}
                  <Button size="sm" onClick={addAdditionalDocument} disabled={!newDocName || !newDocUrl}>
                    Add
                  </Button>
                </div>
                {newDocUrl && (
                  <div className="text-[10px] text-muted-foreground truncate">
                    Uploaded: {newDocUrl}
                  </div>
                )}
                {pendingAdditional.length > 0 && (
                  <div className="text-[10px] text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {pendingAdditional.length} staged document(s)
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 py-4">
            <Button variant="outline" size="sm" onClick={discardChanges} disabled={!hasPending}>
              Discard
            </Button>
            <Button size="sm" onClick={saveChanges} disabled={!hasPending}>
              <Check className="h-4 w-4 mr-1" /> Save Changes
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentsSection;
