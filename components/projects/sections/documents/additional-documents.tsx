"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FolderPlus,
  FolderOpen,
  FileText,
  Download,
  Trash2,
  Edit2,
  ChevronRight,
  ChevronDown,
  Info,
  Loader2,
  Plus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cloudinaryService } from "@/lib/cloudinary-service";
import {
  addProjectDocument,
  deleteProjectDocument,
  updateProjectDocument,
  addDocumentFolder,
  deleteDocumentFolder,
} from "@/services/projects-service";
import { SimpleFileUpload } from "@/components/ui/simple-file-upload";
import { ProjectDocument } from "@/types/project";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface AdditionalDocumentsProps {
  projectId: string;
  documents: ProjectDocument[];
  documentFolders: string[];
  isCrudEnabled: boolean;
  onRefresh?: () => void;
}

export const AdditionalDocuments: React.FC<AdditionalDocumentsProps> = ({
  projectId,
  documents,
  documentFolders,
  isCrudEnabled,
  onRefresh,
}) => {
  const { toast } = useToast();
  const router = useRouter();
  const [expandedFolders, setExpandedFolders] = useState<
    Record<string, boolean>
  >({ Uncategorized: true });
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>(
    {},
  );
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [renamingDoc, setRenamingDoc] = useState<{ id: string, name: string } | null>(null);
  const [tempName, setTempName] = useState("");

  const toggleFolder = (folder: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folder]: !prev[folder] }));
  };

  const handleAddFolder = async () => {
    if (!newFolderName.trim()) return;
    setIsCreatingFolder(true);
    try {
      const result = await addDocumentFolder(projectId, newFolderName.trim());
      if (result.success) {
        toast({ title: "Folder created successfully" });
        setNewFolderName("");
        setShowNewFolderInput(false);
        onRefresh?.();
        router.refresh();
      } else {
        toast({
          title: "Operation failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleDeleteFolder = async (folderName: string) => {
    if (
      !confirm(
        `Are you sure you want to remove the folder "${folderName}"? Contained documents will be moved to the Uncategorized section.`,
      )
    )
      return;
    try {
      const result = await deleteDocumentFolder(projectId, folderName);
      if (result.success) {
        toast({ title: "Folder removed" });
        onRefresh?.();
        router.refresh();
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleFileUploads = async (files: File[], folder?: string) => {
    const folderKey = folder || "Uncategorized";

    if (files.length > 5) {
      toast({
        title: "Limit exceeded",
        description: "You can upload a maximum of 5 documents at a time.",
        variant: "destructive",
      });
      return;
    }

    setUploadingState((prev) => ({ ...prev, [folderKey]: true }));

    try {
      let successCount = 0;
      for (const file of files) {
        const url = await cloudinaryService.uploadFile(file);
        const result = await addProjectDocument(projectId, {
          name: file.name,
          url,
          type: "other",
          folder: folder === "Uncategorized" ? undefined : folder,
        });
        if (result.success) successCount++;
      }

      if (successCount > 0) {
        toast({ title: `${successCount} document(s) uploaded successfully` });
        onRefresh?.();
        router.refresh();
        setExpandedFolders((prev) => ({ ...prev, [folderKey]: true }));
      }
    } catch (e: any) {
      toast({
        title: "Upload incomplete",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setUploadingState((prev) => ({ ...prev, [folderKey]: false }));
    }
  };

  const handleDeleteFile = async (id: string) => {
    if (
      !confirm(
        "Permanent Action: Are you sure you want to delete this document?",
      )
    )
      return;
    try {
      const result = await deleteProjectDocument(projectId, id);
      if (result.success) {
        toast({ title: "Document deleted" });
        onRefresh?.();
        router.refresh();
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleRenameClick = (id: string, name: string) => {
    setRenamingDoc({ id, name });
    setTempName(name);
  };

  const performRename = async () => {
    if (!renamingDoc || !tempName.trim() || tempName === renamingDoc.name) {
      setRenamingDoc(null);
      return;
    }
    
    try {
      const result = await updateProjectDocument(projectId, renamingDoc.id, {
        name: tempName.trim(),
      });
      if (result.success) {
        toast({ title: "Filename updated" });
        onRefresh?.();
        router.refresh();
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setRenamingDoc(null);
    }
  };

  // Group documents by folder
  const groupedDocs: Record<string, ProjectDocument[]> = {
    Uncategorized: [],
  };
  documentFolders.forEach((f) => (groupedDocs[f] = []));
  documents.forEach((doc) => {
    const folder = doc.folder || "Uncategorized";
    if (!groupedDocs[folder]) groupedDocs[folder] = [];
    groupedDocs[folder].push(doc);
  });

  const allFolders = [...documentFolders, "Uncategorized"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-foreground">
            Project Documents Pool
          </h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-tight">
            Additional Uploads & Assets
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 font-semibold text-[11px] border-primary/20 hover:border-primary/50"
          onClick={() => setShowNewFolderInput(!showNewFolderInput)}
        >
          <FolderPlus className="h-3.5 w-3.5" />
          Create Folder
        </Button>
      </div>

      {showNewFolderInput && (
        <div className="flex items-center gap-2 p-3 rounded-lg border-2 border-dashed border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-top-2">
          <Input
            placeholder="Document Category Name (e.g. Phase One Documents)"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="h-8 text-xs bg-background"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleAddFolder()}
          />
          <Button
            size="sm"
            onClick={handleAddFolder}
            className="h-8 px-4"
            disabled={isCreatingFolder}
          >
            {isCreatingFolder ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Create
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8"
            onClick={() => setShowNewFolderInput(false)}
          >
            Cancel
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {allFolders.map((folder) => {
          const isUncategorized = folder === "Uncategorized";
          const isOpen = expandedFolders[folder];
          const folderDocs = groupedDocs[folder] || [];
          const isUploading = uploadingState[folder];

          return (
            <div
              key={folder}
              className={cn(
                "rounded-xl border shadow-sm transition-all duration-200",
                isOpen
                  ? "ring-1 ring-primary/10 border-primary/20"
                  : "bg-muted/10",
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-between px-4 py-3 cursor-pointer group/folder select-none",
                  isOpen ? "bg-primary/[0.03]" : "hover:bg-muted/50",
                )}
                onClick={() => toggleFolder(folder)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {isOpen ? (
                      <ChevronDown className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <FolderOpen
                    className={cn(
                      "h-4 w-4 transition-transform group-hover/folder:scale-110",
                      isUncategorized
                        ? "text-muted-foreground"
                        : "text-amber-500 fill-amber-500/10",
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold leading-none">
                      {folder}
                    </span>
                    <span className="text-[9px] text-muted-foreground mt-1 uppercase tracking-tighter">
                      {folderDocs.length}{" "}
                      {folderDocs.length === 1 ? "Object" : "Objects"} Listed
                    </span>
                  </div>
                </div>

                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isUploading ? (
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      <span className="text-[10px] font-bold text-primary animate-pulse uppercase">
                        Uploading...
                      </span>
                    </div>
                  ) : (
                    <SimpleFileUpload
                      label="Batch Upload"
                      variant="outline"
                      multiple
                      onChange={(files) => handleFileUploads(files, folder)}
                      icon={<Plus className="h-3.5 w-3.5" />}
                    />
                  )}

                  {!isUncategorized && isCrudEnabled && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteFolder(folder)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              {isOpen && (
                <div className="divide-y border-t bg-background animate-in fade-in zoom-in-[0.98] duration-300">
                  {folderDocs.map((doc) => (
                    <div
                      key={doc._id}
                      className="flex items-center justify-between px-4 py-2.5 text-xs hover:bg-primary/[0.02] transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="p-1.5 rounded-md bg-blue-500/5 text-blue-500">
                          <FileText className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-medium truncate" title={doc.name}>
                          {doc.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full hover:bg-primary/10 text-primary"
                          asChild
                        >
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        {isCrudEnabled && (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-full hover:bg-primary/10 text-primary"
                              onClick={() =>
                                handleRenameClick(doc._id, doc.name)
                              }
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-full hover:bg-destructive/10 text-destructive"
                              onClick={() => handleDeleteFile(doc._id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {folderDocs.length === 0 && (
                    <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                      <FileText className="h-8 w-8 text-muted/20" />
                      <p className="text-[11px] text-muted-foreground font-medium">
                        No documents residing in this pool.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* POLICY NOTICE */}
      <div className="mt-8 p-4 rounded-xl border border-warning/20 bg-warning/5 flex gap-3 items-start">
        <Info className="h-4 w-4 text-warning mt-0.5" />
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-foreground">
            Administrative Policy Notice
          </p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            While document uploads are unrestricted to ensure accurate project
            tracking, the **modification or removal** of existing records is
            subject to strict administrative protocols. For corrective actions
            outside of active administrative windows, please contact the **SRCC
            System Administrator**.
          </p>
        </div>
      </div>

      <Dialog open={!!renamingDoc} onOpenChange={(open) => !open && setRenamingDoc(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Document</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Filename</p>
              <Input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && performRename()}
                autoFocus
                className="col-span-3 h-10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" className="h-9 px-4 text-xs font-semibold" onClick={() => setRenamingDoc(null)}>Cancel</Button>
            <Button className="h-9 px-4 text-xs font-semibold" onClick={performRename}>Apply Name</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
