"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";

import { X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Contract } from "@/types/project";
import { Spinner } from "@/components/ui/spinner";
import axios from "axios";
import { getAxiosConfig } from "@/services/dashboard.service";
import { createClaim } from "@/services/claims.service";
import { FileUpload } from "@/components/ui/file-upload";
import { cloudinaryService } from "@/lib/cloudinary-service";

interface CreateClaimOnBehalfDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract;
  projectMilestones: Array<{
    _id: string;
    title: string;
    description: string;
    budget: number;
  }>;
}

interface MilestoneInput {
  milestoneId: string;
  title: string;
  percentageClaimed: number;
  budget: number;
}

type ClaimDocumentInput = {
  url: string;
  name: string;
  type: "invoice" | "receipt" | "timesheet" | "report" | "other";
};

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const sectionClassName = "space-y-2 rounded-lg border bg-muted/20 p-2.5";

export function CreateClaimOnBehalfDialog({
  open,
  onOpenChange,
  contract,
  projectMilestones,
}: CreateClaimOnBehalfDialogProps) {
  const previousOpenRef = useRef(open);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState("");
  const [coachUnits, setCoachUnits] = useState("");
  const [coachRate, setCoachRate] = useState("");
  const [coachRateUnit, setCoachRateUnit] = useState<
    "per_session" | "per_hour"
  >("per_session");
  const [coachRateSource, setCoachRateSource] = useState<
    "contract" | "project" | "manual"
  >("manual");
  const [notes, setNotes] = useState("");
  const [selectedMilestones, setSelectedMilestones] = useState<
    MilestoneInput[]
  >([]);
  const [currentMilestone, setCurrentMilestone] = useState("");

  const [newDocName, setNewDocName] = useState("");
  const [newDocType, setNewDocType] = useState<
    "invoice" | "receipt" | "timesheet" | "report" | "other"
  >("timesheet");
  const [newDocUploading, setNewDocUploading] = useState(false);
  const [newDocUrl, setNewDocUrl] = useState<string>("");
  const [documents, setDocuments] = useState<ClaimDocumentInput[]>([]);
  const isCoachContract =
    (contract.type || "").toLowerCase() === "coach" ||
    (contract.description || "").toLowerCase().includes("coach");

  const coachRateFromContract = useMemo(() => {
    const anyContract = contract as any;
    const candidate =
      anyContract?.coachRate ??
      anyContract?.rate ??
      anyContract?.coachContract?.rate ??
      anyContract?.coach?.contract?.rate;
    const parsed =
      typeof candidate === "string" ? parseFloat(candidate) : candidate;
    return typeof parsed === "number" && !Number.isNaN(parsed)
      ? parsed
      : undefined;
  }, [contract]);

  const coachRateUnitFromContract = useMemo(() => {
    const anyContract = contract as any;
    const candidate =
      anyContract?.coachRateUnit ??
      anyContract?.rateUnit ??
      anyContract?.coachContract?.rateUnit ??
      anyContract?.coach?.contract?.rateUnit;
    const normalized = (candidate || "").toString().toLowerCase();
    if (normalized === "per_hour" || normalized === "per_session") {
      return normalized as "per_hour" | "per_session";
    }
    return undefined;
  }, [contract]);

  const coachRateSourceLabel = useMemo(() => {
    if (coachRateSource === "contract") return "Contract";
    if (coachRateSource === "project") return "Project";
    return "Manual";
  }, [coachRateSource]);

  const coachCalculatedAmount = useMemo(() => {
    const units = parseFloat(coachUnits);
    const rate = parseFloat(coachRate);
    if (!isCoachContract || isNaN(units) || units <= 0) return 0;
    if (isNaN(rate) || rate <= 0) return 0;
    return units * rate;
  }, [coachUnits, coachRate, isCoachContract]);

  const availableMilestones = projectMilestones.filter(
    (m) => !selectedMilestones.find((sm) => sm.milestoneId === m._id),
  );

  // Calculate total budget of selected milestones
  const totalMilestoneBudget = selectedMilestones.reduce(
    (sum, m) => sum + m.budget,
    0,
  );

  // Auto-calculate percentages when amount or milestones change
  const calculatePercentages = (
    claimAmount: number,
    milestones: MilestoneInput[],
  ) => {
    if (!claimAmount || milestones.length === 0) return milestones;

    const totalBudget = milestones.reduce((sum, m) => sum + m.budget, 0);
    if (totalBudget === 0) return milestones;

    return milestones.map((milestone) => {
      // Calculate this milestone's share of the claim based on its budget proportion
      const milestoneShare = (milestone.budget / totalBudget) * claimAmount;
      // Calculate percentage of milestone budget being claimed
      const percentage = (milestoneShare / milestone.budget) * 100;
      return {
        ...milestone,
        percentageClaimed: Math.min(Math.round(percentage * 100) / 100, 100), // Round to 2 decimals, max 100%
      };
    });
  };

  // Update percentages when amount changes
  const handleAmountChange = (value: string) => {
    setAmount(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0 && selectedMilestones.length > 0) {
      setSelectedMilestones(calculatePercentages(numValue, selectedMilestones));
    }
  };

  const handleCoachUnitsChange = (value: string) => {
    setCoachUnits(value);
  };

  const handleCoachRateChange = (value: string) => {
    setCoachRate(value);
  };

  const handleAddDocument = async () => {
    if (!newDocName || !newDocUrl) {
      toast({
        title: "Missing fields",
        description: "Please provide a document name and upload a file.",
        variant: "destructive",
      });
      return;
    }

    setDocuments((prev) => [
      ...prev,
      {
        name: newDocName,
        url: newDocUrl,
        type: newDocType,
      },
    ]);
    setNewDocName("");
    setNewDocUrl("");
    setNewDocType("timesheet");
  };

  const handleRemoveDocument = (idx: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddMilestone = () => {
    if (!currentMilestone) {
      toast({
        title: "Missing Information",
        description: "Please select a milestone",
        variant: "destructive",
      });
      return;
    }

    const milestone = projectMilestones.find((m) => m._id === currentMilestone);
    if (!milestone) return;

    const claimAmount = parseFloat(amount);
    const nextMilestones: MilestoneInput[] = [
      ...selectedMilestones,
      {
        milestoneId: milestone._id,
        title: milestone.title,
        percentageClaimed: 0,
        budget: milestone.budget,
      },
    ];

    setSelectedMilestones(
      !Number.isNaN(claimAmount) && claimAmount > 0
        ? calculatePercentages(claimAmount, nextMilestones)
        : nextMilestones,
    );
    setCurrentMilestone("");
  };

  const handleRemoveMilestone = (milestoneId: string) => {
    const updatedMilestones = selectedMilestones.filter(
      (m) => m.milestoneId !== milestoneId,
    );
    setSelectedMilestones(updatedMilestones);

    // Recalculate percentages after removing milestone
    if (amount && parseFloat(amount) > 0 && updatedMilestones.length > 0) {
      setSelectedMilestones(
        calculatePercentages(parseFloat(amount), updatedMilestones),
      );
    }
  };

  const handleSubmit = async () => {
    const claimAmount = parseFloat(amount);

    if (!amount || claimAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid claim amount",
        variant: "destructive",
      });
      return;
    }

    if (!isCoachContract && claimAmount > contract.contractValue) {
      toast({
        title: "Amount Exceeds Contract Value",
        description: `Claim amount cannot exceed contract value of ${contract.contractValue.toLocaleString()} ${
          contract.currency
        }`,
        variant: "destructive",
      });
      return;
    }

    if (selectedMilestones.length === 0) {
      toast({
        title: "No Milestones",
        description: "Please add at least one milestone",
        variant: "destructive",
      });
      return;
    }

    if (claimAmount > totalMilestoneBudget) {
      toast({
        title: "Amount Exceeds Milestone Budget",
        description: `Claim amount cannot exceed total milestone budget of ${totalMilestoneBudget.toLocaleString()} ${
          contract.currency
        }`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createClaim({
        projectId: contract.projectId,
        contractId: contract._id,
        claimantId: contract.contractedUserId._id,
        amount: parseFloat(amount),
        coachClaim: isCoachContract
          ? {
              units: parseFloat(coachUnits),
              rate: parseFloat(coachRate),
              rateUnit: coachRateUnit,
              unitAmount: parseFloat(coachRate),
              totalAmount: parseFloat(amount),
            }
          : undefined,
        currency: contract.currency,
        milestones: selectedMilestones,
        notes: notes || undefined,
        documents: documents.length ? documents : undefined,
      });

      if (!result.success) {
        toast({
          title: "Failed to Create Claim",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Claim Created",
        description: `Claim created successfully for ${contract.contractedUserId.firstName} ${contract.contractedUserId.lastName}`,
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to create claim:", error);
      toast({
        title: "Failed to Create Claim",
        description: "An unexpected error occurred while creating the claim",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    if (!isCoachContract) return;

    if (coachRateFromContract !== undefined) {
      setCoachRate(coachRateFromContract.toString());
      setCoachRateSource("contract");
    }
    if (coachRateUnitFromContract) {
      setCoachRateUnit(coachRateUnitFromContract);
      setCoachRateSource("contract");
    }
    // Intentionally not resetting units/amount here to avoid wiping user input
  }, [open, isCoachContract, coachRateFromContract, coachRateUnitFromContract]);

  useEffect(() => {
    if (!open) return;
    if (!isCoachContract) return;
    if (coachRateFromContract !== undefined && coachRateUnitFromContract)
      return;

    let cancelled = false;

    const loadCoachRateFromProject = async () => {
      try {
        const config = await getAxiosConfig();
        const { data: project } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/projects/${contract.projectId}`,
          config,
        );

        const coaches = (project?.coaches || []) as Array<any>;
        const coachId = contract?.contractedUserId?._id;
        if (!coachId) return;

        const getIdString = (value: any): string | undefined => {
          if (!value) return undefined;
          if (typeof value === "string") return value;
          if (typeof value === "object") {
            if (value._id) return value._id.toString();
            if (typeof value.toString === "function") return value.toString();
          }
          return undefined;
        };

        const coachIdStr = coachId.toString();
        const contractMilestoneIdStr = contract.milestoneId
          ? contract.milestoneId.toString()
          : undefined;

        const fromMilestone = contract.milestoneId
          ? coaches.find(
              (c) =>
                getIdString(c?.userId) === coachIdStr &&
                getIdString(c?.milestoneId) === contractMilestoneIdStr,
            )
          : undefined;

        const assignment =
          fromMilestone ||
          coaches.find((c) => getIdString(c?.userId) === coachIdStr) ||
          undefined;

        const rate = assignment?.contract?.rate;
        const rateUnit = assignment?.contract?.rateUnit;

        if (cancelled) return;

        if (typeof rate === "number" && !Number.isNaN(rate)) {
          setCoachRate(rate.toString());
          setCoachRateSource("project");
        } else if (contract.contractValue && contract.contractValue > 0) {
          setCoachRate(contract.contractValue.toString());
          setCoachRateSource("project");
        }
        if (rateUnit === "per_hour" || rateUnit === "per_session") {
          setCoachRateUnit(rateUnit);
          setCoachRateSource("project");
        }
      } catch (e) {
        if (
          !cancelled &&
          contract.contractValue &&
          contract.contractValue > 0
        ) {
          setCoachRate(contract.contractValue.toString());
          setCoachRateSource("project");
        }
        return;
      }
    };

    void loadCoachRateFromProject();

    return () => {
      cancelled = true;
    };
  }, [
    open,
    isCoachContract,
    contract.projectId,
    contract.contractedUserId?._id,
    contract.milestoneId,
    contract.contractValue,
    coachRateFromContract,
    coachRateUnitFromContract,
  ]);

  useEffect(() => {
    if (!isCoachContract) return;
    const units = parseFloat(coachUnits);
    const rate = parseFloat(coachRate);
    if (Number.isNaN(units) || units <= 0) {
      setAmount("");
      return;
    }
    if (Number.isNaN(rate) || rate <= 0) {
      setAmount("");
      return;
    }
    const computed = units * rate;
    setAmount(computed ? computed.toFixed(2) : "");
    if (computed > 0) {
      setSelectedMilestones((prev) =>
        prev.length > 0 ? calculatePercentages(computed, prev) : prev,
      );
    }
  }, [isCoachContract, coachUnits, coachRate]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] w-[calc(100vw-1rem)] max-w-[700px] gap-0 overflow-y-auto p-0">
        <DialogHeader className="space-y-1 border-b px-4 py-3">
          <DialogTitle className="text-lg">Create Claim on Behalf</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Creating a claim for {contract.contractedUserId.firstName}{" "}
            {contract.contractedUserId.lastName} under contract{" "}
            {contract.contractNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2.5 px-4 py-3">
          <div className={sectionClassName}>
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs font-medium sm:text-sm">
                Contract Value:
              </span>
              <span className="text-right text-xs sm:text-sm">
                {contract.contractValue.toLocaleString()} {contract.currency}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs font-medium sm:text-sm">Claimant:</span>
              <span className="text-right text-xs sm:text-sm">
                {contract.contractedUserId.firstName}{" "}
                {contract.contractedUserId.lastName}
              </span>
            </div>
          </div>

          {isCoachContract && (
            <div className={sectionClassName}>
              <Label htmlFor="coachUnits">Hours / Sessions *</Label>
              <div className="grid gap-2 sm:grid-cols-3">
                <Input
                  id="coachUnits"
                  type="number"
                  placeholder="Units"
                  value={coachUnits}
                  onChange={(e) => handleCoachUnitsChange(e.target.value)}
                  min="0"
                  step="0.01"
                />
                <Input
                  id="coachRate"
                  type="number"
                  placeholder="Rate"
                  value={coachRate}
                  onChange={(e) => handleCoachRateChange(e.target.value)}
                  min="0"
                  step="0.01"
                  disabled={coachRateSource !== "manual"}
                />
                <select
                  id="coachRateUnit"
                  className={selectClassName}
                  value={coachRateUnit}
                  onChange={(e) =>
                    setCoachRateUnit(
                      e.target.value as "per_session" | "per_hour",
                    )
                  }
                  disabled={coachRateSource !== "manual"}
                >
                  <option value="per_session">per session</option>
                  <option value="per_hour">per hour</option>
                </select>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Rate source: {coachRateSourceLabel}
              </p>
            </div>
          )}

          <div className={sectionClassName}>
            <Label htmlFor="amount">Claim Amount *</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter claim amount"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              min="0"
              max={isCoachContract ? undefined : contract.contractValue}
              step="0.01"
              disabled={isCoachContract}
            />
            <p className="text-xs text-muted-foreground">
              {isCoachContract ? (
                <>Auto-calculated from units and rate</>
              ) : (
                <>
                  Maximum: {contract.contractValue.toLocaleString()}{" "}
                  {contract.currency}
                </>
              )}
              {selectedMilestones.length > 0 && (
                <>
                  {" "}
                  | Selected milestones budget:{" "}
                  {totalMilestoneBudget.toLocaleString()} {contract.currency}
                </>
              )}
            </p>
            {!isCoachContract &&
              amount &&
              parseFloat(amount) > contract.contractValue && (
                <p className="text-xs text-destructive">
                  Amount exceeds contract value
                </p>
              )}
            {amount &&
              selectedMilestones.length > 0 &&
              parseFloat(amount) > totalMilestoneBudget && (
                <p className="text-xs text-destructive">
                  Amount exceeds selected milestones budget
                </p>
              )}
          </div>

          <div className={sectionClassName}>
            <Label>Milestones *</Label>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <select
                className={selectClassName}
                value={currentMilestone}
                onChange={(e) => setCurrentMilestone(e.target.value)}
              >
                <option value="">Select milestone</option>
                {availableMilestones.map((milestone) => (
                  <option key={milestone._id} value={milestone._id}>
                    {milestone.title} ({milestone.budget.toLocaleString()}{" "}
                    {contract.currency})
                  </option>
                ))}
              </select>
              <Button
                type="button"
                onClick={handleAddMilestone}
                variant="outline"
                size="icon"
                className="h-9 w-9"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Percentages are auto-calculated based on milestone budget share.
            </p>
          </div>

          {selectedMilestones.length > 0 && (
            <div className={sectionClassName}>
              <Label>Selected Milestones</Label>
              <div className="space-y-1.5">
                {selectedMilestones.map((milestone) => (
                  <div
                    key={milestone.milestoneId}
                    className="flex items-start justify-between gap-2 rounded-md border bg-background/70 px-2.5 py-2"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{milestone.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <p className="text-xs text-muted-foreground">
                          Budget: {milestone.budget.toLocaleString()}{" "}
                          {contract.currency}
                        </p>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-xs font-medium text-blue-600">
                          {milestone.percentageClaimed.toFixed(2)}% claimed
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        handleRemoveMilestone(milestone.milestoneId)
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={sectionClassName}>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about this claim..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className={sectionClassName}>
            <Label>Attachments (Optional)</Label>

            {documents.length > 0 && (
              <div className="space-y-1.5">
                {documents.map((doc, idx) => (
                  <div
                    key={`${doc.url}-${idx}`}
                    className="flex items-start justify-between gap-2 rounded-md border bg-background/70 px-2.5 py-2"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.type}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleRemoveDocument(idx)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-2 rounded-md border bg-background/70 p-2 sm:grid-cols-3">
              <Input
                placeholder="Document name"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
              />
              <select
                className={selectClassName}
                value={newDocType}
                onChange={(e) =>
                  setNewDocType(
                    e.target.value as
                      | "invoice"
                      | "receipt"
                      | "timesheet"
                      | "report"
                      | "other",
                  )
                }
              >
                <option value="invoice">Invoice</option>
                <option value="receipt">Receipt</option>
                <option value="timesheet">Timesheet</option>
                <option value="report">Report</option>
                <option value="other">Other</option>
              </select>
              <div className="flex items-center gap-2">
                <FileUpload
                  onChange={async (files) => {
                    if (!files?.length) return;
                    setNewDocUploading(true);
                    try {
                      const url = await cloudinaryService.uploadFile(files[0]);
                      setNewDocUrl(url);
                      toast({
                        title: "Uploaded",
                        description: "File uploaded. Click Add to attach.",
                      });
                    } catch (e: any) {
                      toast({
                        title: "Upload failed",
                        description: e?.message || "Unable to upload",
                        variant: "destructive",
                      });
                    } finally {
                      setNewDocUploading(false);
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  className="h-9"
                  onClick={handleAddDocument}
                  disabled={!newDocName || !newDocUrl || newDocUploading}
                >
                  Add
                </Button>
              </div>
            </div>
            {newDocUploading && (
              <p className="text-xs text-muted-foreground">Uploading...</p>
            )}
            {newDocUrl && (
              <div className="truncate text-[10px] text-muted-foreground">
                Uploaded: {newDocUrl}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col-reverse gap-2 border-t px-4 py-3 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="w-full sm:w-auto"
            disabled={
              isSubmitting ||
              !amount ||
              selectedMilestones.length === 0 ||
              (isCoachContract &&
                (!coachUnits ||
                  !coachRate ||
                  coachCalculatedAmount <= 0 ||
                  isNaN(parseFloat(coachUnits)) ||
                  isNaN(parseFloat(coachRate))))
            }
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-2" />
                Creating...
              </>
            ) : (
              "Create Claim"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
