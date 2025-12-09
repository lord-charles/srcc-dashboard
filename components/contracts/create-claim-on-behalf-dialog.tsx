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
import { Textarea } from "@/components/ui/textarea";

import { X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Contract } from "@/types/project";
import { Spinner } from "@/components/ui/spinner";
import axios from "axios";
import { getAxiosConfig } from "@/services/dashboard.service";

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

export function CreateClaimOnBehalfDialog({
  open,
  onOpenChange,
  contract,
  projectMilestones,
}: CreateClaimOnBehalfDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedMilestones, setSelectedMilestones] = useState<
    MilestoneInput[]
  >([]);
  const [currentMilestone, setCurrentMilestone] = useState("");

  const availableMilestones = projectMilestones.filter(
    (m) => !selectedMilestones.find((sm) => sm.milestoneId === m._id)
  );

  // Calculate total budget of selected milestones
  const totalMilestoneBudget = selectedMilestones.reduce(
    (sum, m) => sum + m.budget,
    0
  );

  // Auto-calculate percentages when amount or milestones change
  const calculatePercentages = (
    claimAmount: number,
    milestones: MilestoneInput[]
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

    // Add milestone with 0% initially - will be calculated when amount changes
    setSelectedMilestones([
      ...selectedMilestones,
      {
        milestoneId: milestone._id,
        title: milestone.title,
        percentageClaimed: 0,
        budget: milestone.budget,
      },
    ]);
    setCurrentMilestone("");
  };

  const handleRemoveMilestone = (milestoneId: string) => {
    const updatedMilestones = selectedMilestones.filter(
      (m) => m.milestoneId !== milestoneId
    );
    setSelectedMilestones(updatedMilestones);

    // Recalculate percentages after removing milestone
    if (amount && parseFloat(amount) > 0 && updatedMilestones.length > 0) {
      setSelectedMilestones(
        calculatePercentages(parseFloat(amount), updatedMilestones)
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

    if (claimAmount > contract.contractValue) {
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
      const config = await getAxiosConfig();
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/claims`,
        {
          projectId: contract.projectId,
          contractId: contract._id,
          claimantId: contract.contractedUserId._id,
          amount: parseFloat(amount),
          currency: contract.currency,
          milestones: selectedMilestones,
          notes: notes || undefined,
        },
        config
      );

      toast({
        title: "Claim Created",
        description: `Claim created successfully for ${contract.contractedUserId.firstName} ${contract.contractedUserId.lastName}`,
      });

      onOpenChange(false);
      // Refresh the page or navigate to claims
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error: any) {
      console.error("Failed to create claim:", error);
      toast({
        title: "Failed to Create Claim",
        description:
          error?.response?.data?.message ||
          "An error occurred while creating the claim",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Claim on Behalf</DialogTitle>
          <DialogDescription>
            Creating a claim for {contract.contractedUserId.firstName}{" "}
            {contract.contractedUserId.lastName} under contract{" "}
            {contract.contractNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Contract Info */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Contract Value:</span>
              <span className="text-sm">
                {contract.contractValue.toLocaleString()} {contract.currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Claimant:</span>
              <span className="text-sm">
                {contract.contractedUserId.firstName}{" "}
                {contract.contractedUserId.lastName}
              </span>
            </div>
          </div>

          {/* Claim Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Claim Amount *</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter claim amount"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              min="0"
              max={contract.contractValue}
              step="0.01"
            />
            <p className="text-xs text-muted-foreground">
              Maximum: {contract.contractValue.toLocaleString()}{" "}
              {contract.currency}
              {selectedMilestones.length > 0 && (
                <>
                  {" "}
                  | Selected milestones budget:{" "}
                  {totalMilestoneBudget.toLocaleString()} {contract.currency}
                </>
              )}
            </p>
            {amount && parseFloat(amount) > contract.contractValue && (
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

          {/* Milestones */}
          <div className="space-y-2">
            <Label>Milestones *</Label>
            <div className="flex gap-2">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Select milestones to include in this claim. Percentages will be
              calculated automatically based on claim amount.
            </p>
          </div>

          {/* Selected Milestones */}
          {selectedMilestones.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Milestones</Label>
              <div className="space-y-2">
                {selectedMilestones.map((milestone) => (
                  <div
                    key={milestone.milestoneId}
                    className="flex items-center justify-between bg-muted/50 p-3 rounded-md"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{milestone.title}</p>
                      <div className="flex items-center gap-2 mt-1">
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

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about this claim..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
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
            disabled={
              isSubmitting || !amount || selectedMilestones.length === 0
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
