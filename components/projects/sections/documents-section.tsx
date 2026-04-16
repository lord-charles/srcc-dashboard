"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Lock, Unlock, Loader2, Files } from "lucide-react";
import type { ProjectDocument } from "@/types/project";
import { useToast } from "@/hooks/use-toast";
import { getProjectConfig } from "@/services/system-config.service";
import { MainDocuments } from "./documents/main-documents";
import { AdditionalDocuments } from "./documents/additional-documents";

interface DocumentsSectionProps {
  projectId: string;
  projectProposalUrl?: string;
  signedContractUrl?: string;
  executionMemoUrl?: string;
  signedBudgetUrl?: string;
  documents: ProjectDocument[];
  documentFolders?: string[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  projectId,
  projectProposalUrl,
  signedContractUrl,
  executionMemoUrl,
  signedBudgetUrl,
  documents,
  documentFolders = [],
  onRefresh,
  isRefreshing = false,
}) => {
  const { toast } = useToast();
  const [isCrudEnabled, setIsCrudEnabled] = useState(false);
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const result = await getProjectConfig();
        if (result.success && result.data?.data?.documentCrudExpiry) {
          const expiry = new Date(result.data.data.documentCrudExpiry);
          if (expiry > new Date()) {
            setIsCrudEnabled(true);
            setExpiryDate(expiry);
          }
        }
      } catch (e) {
        console.error("Config fetch failed", e);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  return (
    <Card className="shadow-sm border-muted/40 overflow-hidden">
      <CardHeader className="bg-muted/10 border-b pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Files className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-bold">Document Repository</CardTitle>
            {isRefreshing && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100 animate-in fade-in zoom-in-95">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-[10px] font-bold">Syncing...</span>
              </div>
            )}
          </div>
          
          {loading ? (
             <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : isRefreshing ? (
             null // Already showing "Syncing..."
          ) : isCrudEnabled ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 border border-green-200">
              <Unlock className="h-3 w-3" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Admin Lock Open (Ends {expiryDate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground border">
              <Lock className="h-3 w-3" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Storage Locked</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x">
          {/* Left Column: Fixed Mandatory Docs */}
          <div className="lg:col-span-5 p-4 bg-muted/5">
            <MainDocuments
              projectId={projectId}
              projectProposalUrl={projectProposalUrl}
              signedContractUrl={signedContractUrl}
              executionMemoUrl={executionMemoUrl}
              signedBudgetUrl={signedBudgetUrl}
              onRefresh={onRefresh}
            />
          </div>

          {/* Right Column: Custom Pool & Folders */}
          <div className="lg:col-span-7 p-4 bg-background">
            <AdditionalDocuments
              projectId={projectId}
              documents={documents}
              documentFolders={documentFolders}
              isCrudEnabled={isCrudEnabled}
              onRefresh={onRefresh}
            />
          </div>
        </div>
      </CardContent>
      
      {!isCrudEnabled && (
        <div className="px-4 py-2 bg-amber-500/5 border-t flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
          <p className="text-[10px] text-amber-700">
            <strong>Maintenance Note:</strong> Deleting or renaming files requires an admin window. New uploads are always permitted.
          </p>
        </div>
      )}
    </Card>
  );
};

export default DocumentsSection;
