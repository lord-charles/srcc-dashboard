"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { addCoachManager } from "@/services/projects-service";
import { Loader2 } from "lucide-react";

interface AddCoachManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  user?: { _id: string; firstName: string; lastName: string; email: string };
  returnUrl?: string;
}

export function AddCoachManagerDialog({ open, onOpenChange, projectId, user, returnUrl }: AddCoachManagerDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [respInput, setRespInput] = useState("");
  const [responsibilities, setResponsibilities] = useState<string[]>([]);

  const handleSubmit = async () => {
    if (!user?._id) {
      toast({ title: "Missing selection", description: "Select a user from the list first", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await addCoachManager(projectId, user._id, responsibilities);
      toast({ title: "Coach manager added", description: "Coach manager assigned successfully" });
      if (returnUrl) {
        window.location.href = returnUrl;
      } else {
        onOpenChange(false);
        setTimeout(() => window.location.reload(), 50);
      }
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to add coach manager", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Coach Manager</DialogTitle>
          <DialogDescription>Assign a coach manager to this project.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid gap-1">
            <Label htmlFor="user">User</Label>
            <Input id="user" value={user ? `${user.firstName} ${user.lastName} (${user.email})` : "No user selected"} disabled />
          </div>
          <div className="grid gap-1">
            <Label>Responsibilities</Label>
            <div className="flex gap-2">
              <Input placeholder="Add and press Enter" value={respInput} onChange={(e) => setRespInput(e.target.value)} onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const v = respInput.trim();
                  if (v && !responsibilities.includes(v)) {
                    setResponsibilities((prev) => [...prev, v]);
                    setRespInput("");
                  }
                }
              }} />
              <Button type="button" onClick={() => {
                const v = respInput.trim();
                if (v && !responsibilities.includes(v)) {
                  setResponsibilities((prev) => [...prev, v]);
                  setRespInput("");
                }
              }}>Add</Button>
            </div>
            {responsibilities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1 text-xs">
                {responsibilities.map((r) => (
                  <span key={r} className="px-2 py-1 rounded border">{r}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Coach Manager
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
