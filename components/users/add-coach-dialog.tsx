"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { addCoach, AddCoachPayload } from "@/services/projects-service";
import { Loader2 } from "lucide-react";
import { ProjectMilestone } from "@/types/project";

interface AddCoachDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  milestones: ProjectMilestone[];
  user?: { _id: string; firstName: string; lastName: string; email: string };
  returnUrl?: string;
}

export function AddCoachDialog({
  open,
  onOpenChange,
  projectId,
  milestones,
  user,
  returnUrl,
}: AddCoachDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(user?._id || "");
  const [milestoneId, setMilestoneId] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [rate, setRate] = useState<string>("");
  const [rateUnit, setRateUnit] = useState<"per_session" | "per_hour">(
    "per_session",
  );
  const [currency, setCurrency] = useState<"KES" | "USD">("KES");
  const [respInput, setRespInput] = useState("");
  const [responsibilities, setResponsibilities] = useState<string[]>([]);

  useEffect(() => {
    if (!milestoneId && milestones && milestones.length > 0) {
      setMilestoneId(milestones[0]._id);
    }
  }, [milestones, milestoneId]);

  const handleSubmit = async () => {
    if (!userId || !milestoneId) {
      toast({
        title: "Missing fields",
        description: "User ID and milestone are required",
        variant: "destructive",
      });
      return;
    }
    if (!rate || Number(rate) <= 0) {
      toast({
        title: "Invalid rate",
        description: "Please enter a valid rate",
        variant: "destructive",
      });
      return;
    }
    if (endDate && startDate && endDate < startDate) {
      toast({
        title: "Invalid dates",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }
    const payload: AddCoachPayload = {
      userId,
      startDate,
      endDate,
      responsibilities,
      contract: { rate: Number(rate), rateUnit, currency },
    };

    setIsLoading(true);
    try {
      await addCoach(projectId, milestoneId, payload);
      toast({
        title: "Coach added",
        description: "Coach assigned to milestone successfully",
      });
      if (returnUrl) {
        window.location.href = returnUrl;
      } else {
        onOpenChange(false);
        setTimeout(() => window.location.reload(), 50);
      }
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to add coach",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Coach</DialogTitle>
          <DialogDescription>
            Assign a coach to a specific milestone with a rate-based contract.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid gap-1">
            <Label htmlFor="userId">{user ? "User" : "User ID"}</Label>
            {user ? (
              <Input
                id="userId"
                value={`${user.firstName} ${user.lastName} (${user.email})`}
                disabled
              />
            ) : (
              <Input
                id="userId"
                placeholder="507f1f77bcf86cd799439011"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            )}
          </div>
          <div className="grid gap-1">
            <Label htmlFor="milestone">Milestone</Label>
            <select
              id="milestone"
              className="border rounded h-9 px-2"
              value={milestoneId}
              onChange={(e) => setMilestoneId(e.target.value)}
              disabled={!milestones || milestones.length === 0}
            >
              {!milestones || milestones.length === 0 ? (
                <option value="">No milestones available</option>
              ) : (
                milestones.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.title}
                  </option>
                ))
              )}
            </select>
            {(!milestones || milestones.length === 0) && (
              <p className="text-xs text-muted-foreground">
                No milestones yet. Create a milestone first, then add a coach.
              </p>
            )}
          </div>
          <div className="grid gap-1">
            <Label htmlFor="start">Start Date</Label>
            <Input
              id="start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="end">End Date</Label>
            <Input
              id="end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label>Responsibilities</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add and press Enter"
                value={respInput}
                onChange={(e) => setRespInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const v = respInput.trim();
                    if (v && !responsibilities.includes(v)) {
                      setResponsibilities((prev) => [...prev, v]);
                      setRespInput("");
                    }
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => {
                  const v = respInput.trim();
                  if (v && !responsibilities.includes(v)) {
                    setResponsibilities((prev) => [...prev, v]);
                    setRespInput("");
                  }
                }}
              >
                Add
              </Button>
            </div>
            {responsibilities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1 text-xs">
                {responsibilities.map((r) => (
                  <span key={r} className="px-2 py-1 rounded border">
                    {r}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="grid gap-1">
              <Label htmlFor="rate">Rate</Label>
              <Input
                id="rate"
                type="number"
                placeholder="1000"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="rateUnit">Rate Unit</Label>
              <select
                id="rateUnit"
                className="border rounded h-9 px-2"
                value={rateUnit}
                onChange={(e) => setRateUnit(e.target.value as any)}
              >
                <option value="per_session">per session</option>
                <option value="per_hour">per hour</option>
              </select>
            </div>
            <div className="grid gap-1">
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                className="border rounded h-9 px-2"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
              >
                <option value="KES">KES</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !milestones || milestones.length === 0}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Coach
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
