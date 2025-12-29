"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addAssistantProjectManager } from "@/services/projects-service";
import { User } from "@/types/user";

interface AddAssistantPMDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  user: User;
  returnUrl?: string;
}

export function AddAssistantPMDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  user,
  returnUrl,
}: AddAssistantPMDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [currentResponsibility, setCurrentResponsibility] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddResponsibility = () => {
    if (
      currentResponsibility.trim() &&
      !responsibilities.includes(currentResponsibility.trim())
    ) {
      setResponsibilities([...responsibilities, currentResponsibility.trim()]);
      setCurrentResponsibility("");
    }
  };

  const handleRemoveResponsibility = (responsibility: string) => {
    setResponsibilities(responsibilities.filter((r) => r !== responsibility));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddResponsibility();
    }
  };

  const handleSubmit = async () => {
    if (responsibilities.length === 0) {
      toast({
        title: "Responsibilities Required",
        description: "Please add at least one responsibility",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addAssistantProjectManager(projectId, user._id, responsibilities);
      toast({
        title: "Success",
        description: `${user.firstName} ${user.lastName} has been added as an assistant project manager`,
      });
      onOpenChange(false);
      if (returnUrl) {
        router.push(returnUrl);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Failed to add assistant project manager",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Assistant Project Manager</DialogTitle>
          <DialogDescription>
            Add {user.firstName} {user.lastName} as an assistant project manager
            to {projectName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="responsibility">Responsibilities</Label>
            <div className="flex gap-2">
              <Input
                id="responsibility"
                placeholder="e.g., Coordinate with stakeholders"
                value={currentResponsibility}
                onChange={(e) => setCurrentResponsibility(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button
                type="button"
                onClick={handleAddResponsibility}
                variant="outline"
              >
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Press Enter or click Add to add a responsibility
            </p>
          </div>

          {responsibilities.length > 0 && (
            <div className="space-y-2">
              <Label>Added Responsibilities</Label>
              <div className="flex flex-wrap gap-2">
                {responsibilities.map((responsibility) => (
                  <Badge
                    key={responsibility}
                    variant="secondary"
                    className="gap-1"
                  >
                    {responsibility}
                    <button
                      type="button"
                      onClick={() => handleRemoveResponsibility(responsibility)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || responsibilities.length === 0}
          >
            {isSubmitting ? "Adding..." : "Add Assistant PM"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
