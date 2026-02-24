"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { addCoach, AddCoachPayload } from "@/services/projects-service";
import {
  Loader2,
  Plus,
  Calendar,
  User,
  DollarSign,
  Briefcase,
  AlertCircle,
  X,
} from "lucide-react";
import { ProjectMilestone } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold">Add Coach</SheetTitle>
          <SheetDescription className="text-base">
            Assign a coach to a specific milestone with a rate-based contract
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Coach Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Coach Information</span>
            </div>
            <div className="space-y-3 pl-6">
              <div className="space-y-1.5">
                <Label htmlFor="userId" className="text-sm font-medium">
                  {user ? "Coach" : "User ID"}
                </Label>
                {user ? (
                  <Input
                    id="userId"
                    value={`${user.firstName} ${user.lastName} (${user.email})`}
                    disabled
                    className="bg-muted"
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
            </div>
          </div>

          <Separator />

          {/* Milestone Assignment */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span>Milestone Assignment</span>
            </div>
            <div className="space-y-3 pl-6">
              {(!milestones || milestones.length === 0) && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No milestones available. Create a milestone first before
                    adding a coach.
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="milestone" className="text-sm font-medium">
                  Select Milestone
                </Label>
                <select
                  id="milestone"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="start"
                    className="text-sm font-medium flex items-center gap-1.5"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    Start Date
                  </Label>
                  <Input
                    id="start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="end"
                    className="text-sm font-medium flex items-center gap-1.5"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    End Date
                  </Label>
                  <Input
                    id="end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Responsibilities */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span>Responsibilities</span>
            </div>
            <div className="space-y-3 pl-6">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Add Responsibilities
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Technical Mentorship"
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
                    size="icon"
                    variant="secondary"
                    onClick={() => {
                      const v = respInput.trim();
                      if (v && !responsibilities.includes(v)) {
                        setResponsibilities((prev) => [...prev, v]);
                        setRespInput("");
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {responsibilities.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Added Responsibilities
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {responsibilities.map((r) => (
                      <Badge
                        key={r}
                        variant="secondary"
                        className="pl-2.5 pr-1 py-1 gap-1.5"
                      >
                        <span>{r}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() =>
                            setResponsibilities((prev) =>
                              prev.filter((x) => x !== r),
                            )
                          }
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Contract Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>Contract Details</span>
            </div>
            <div className="space-y-4 pl-6">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="rate" className="text-sm font-medium">
                    Rate
                  </Label>
                  <Input
                    id="rate"
                    type="number"
                    placeholder="1000"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rateUnit" className="text-sm font-medium">
                    Rate Unit
                  </Label>
                  <select
                    id="rateUnit"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={rateUnit}
                    onChange={(e) => setRateUnit(e.target.value as any)}
                  >
                    <option value="per_session">Per Session</option>
                    <option value="per_hour">Per Hour</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="currency" className="text-sm font-medium">
                    Currency
                  </Label>
                  <select
                    id="currency"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                  >
                    <option value="KES">KES</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Set the compensation rate for this coaching engagement
              </p>
            </div>
          </div>
        </div>

        <SheetFooter className="mt-8 gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1 sm:flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !milestones || milestones.length === 0}
            className="flex-1 sm:flex-1"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Coach
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
