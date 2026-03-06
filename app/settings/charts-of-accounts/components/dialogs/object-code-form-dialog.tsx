"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ObjectCode } from "@/types/charts-of-accounts";

interface ObjectCodeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  objectCode: ObjectCode | null;
  onSave: (objectCode: ObjectCode) => Promise<void>;
  loading: boolean;
}

export default function ObjectCodeFormDialog({
  open,
  onOpenChange,
  objectCode,
  onSave,
  loading,
}: ObjectCodeFormDialogProps) {
  const [formData, setFormData] = useState<ObjectCode>({
    objectCode: "",
    objectCodeName: "",
    type: "",
  });

  useEffect(() => {
    if (objectCode) {
      setFormData(objectCode);
    } else {
      setFormData({
        objectCode: "",
        objectCodeName: "",
        type: "",
      });
    }
  }, [objectCode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.objectCode.trim() ||
      !formData.objectCodeName.trim() ||
      !formData.type.trim()
    ) {
      return;
    }

    await onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{objectCode ? "Edit Object Code" : "Add Object Code"}</DialogTitle>
          <DialogDescription>
            {objectCode ? "Update object code details" : "Create a new object code"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="objectCode">Object Code</Label>
            <Input
              id="objectCode"
              value={formData.objectCode}
              onChange={(e) =>
                setFormData({ ...formData, objectCode: e.target.value })
              }
              placeholder="e.g., 1001"
              disabled={loading || !!objectCode}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="objectCodeName">Object Code Name</Label>
            <Input
              id="objectCodeName"
              value={formData.objectCodeName}
              onChange={(e) =>
                setFormData({ ...formData, objectCodeName: e.target.value })
              }
              placeholder="e.g., Personnel"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Input
              id="type"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              placeholder="e.g., Personnel"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
