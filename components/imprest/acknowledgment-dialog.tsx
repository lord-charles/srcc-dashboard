"use client";

import React, { useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Imprest } from "./imprest-dashboard";
import { formatCurrency, formatDate } from "./utils";
import { useToast } from "@/hooks/use-toast";

interface AcknowledgmentDialogProps {
  imprest: Imprest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAcknowledge: (
    id: string,
    received: boolean,
    comments?: string
  ) => Promise<void>;
}

export function AcknowledgmentDialog({
  imprest,
  open,
  onOpenChange,
  onAcknowledge,
}: AcknowledgmentDialogProps) {
  const [received, setReceived] = useState<string>("");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!imprest || !received) return;

    setIsSubmitting(true);
    try {
      await onAcknowledge(
        imprest._id,
        received === "yes",
        comments || undefined
      );
      onOpenChange(false);
      // Reset form
      setReceived("");
      setComments("");
    } catch (error: any) {
      console.log(error);
      toast({
        title: "acknowledging failed",
        description: error || "Failed to acknowledging receipt",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setReceived("");
    setComments("");
  };

  if (!imprest) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-500" />
            Acknowledge Receipt of Funds
          </DialogTitle>
          <DialogDescription>
            Please confirm whether you have received the disbursed imprest
            funds.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Imprest Details */}
          <Card className="border-blue-200 bg-blue-50/30 dark:bg-blue-950/20">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Amount:</span>
                  <div className="font-semibold text-blue-700 dark:text-blue-400">
                    {formatCurrency(
                      imprest.disbursement?.amount || imprest.amount,
                      imprest.currency
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Purpose:</span>
                  <div className="font-medium">{imprest.paymentReason}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Disbursed On:</span>
                  <div className="font-medium">
                    {imprest.disbursement?.disbursedAt
                      ? formatDate(imprest.disbursement.disbursedAt.toString())
                      : "N/A"}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Due Date:</span>
                  <div className="font-medium">
                    {formatDate(imprest.dueDate)}
                  </div>
                </div>
              </div>
              {imprest.disbursement?.comments && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <span className="text-muted-foreground text-sm">
                    Disbursement Notes:
                  </span>
                  <div className="text-sm italic">
                    {imprest.disbursement.comments}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Receipt Confirmation */}
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Have you received the disbursed amount?
            </Label>

            <RadioGroup value={received} onValueChange={setReceived}>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-emerald-200 bg-emerald-50/30 dark:bg-emerald-950/20">
                <RadioGroupItem value="yes" id="yes" />
                <Label
                  htmlFor="yes"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium">
                    Yes, I have received the money
                  </span>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg border border-rose-200 bg-rose-50/30 dark:bg-rose-950/20">
                <RadioGroupItem value="no" id="no" />
                <Label
                  htmlFor="no"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <XCircle className="h-4 w-4 text-rose-600" />
                  <span className="font-medium">
                    No, I have not received the money
                  </span>
                </Label>
              </div>
            </RadioGroup>

            {received === "no" && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800 dark:text-amber-400">
                      Important: Reporting Non-Receipt
                    </p>
                    <p className="text-amber-700 dark:text-amber-300 mt-1">
                      If you select &quot;No&quot;, this will create a dispute
                      that will be investigated by the administration. Please
                      provide detailed comments about the situation.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label htmlFor="comments">
              Comments{" "}
              {received === "no" && <span className="text-rose-500">*</span>}
            </Label>
            <Textarea
              id="comments"
              placeholder={
                received === "yes"
                  ? "Optional: Add any comments about receiving the funds..."
                  : "Please explain the situation in detail..."
              }
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              className={
                received === "no" ? "border-rose-300 focus:border-rose-500" : ""
              }
            />
            {received === "no" && !comments.trim() && (
              <p className="text-sm text-rose-600">
                Comments are required when reporting non-receipt
              </p>
            )}
          </div>

          {/* Next Steps Info */}
          {received === "yes" && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-emerald-800 dark:text-emerald-400">
                    Next Steps After Confirmation
                  </p>
                  <ul className="text-emerald-700 dark:text-emerald-300 mt-1 space-y-1">
                    <li>• You can now proceed with your planned expenses</li>
                    <li>• Keep all receipts and supporting documents</li>
                    <li>
                      • Submit your accounting within 72 hours (by{" "}
                      {formatDate(imprest.dueDate)})
                    </li>
                    <li>• Return any unspent funds to the cashier</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !received ||
              isSubmitting ||
              (received === "no" && !comments.trim())
            }
            className={
              received === "yes"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-rose-600 hover:bg-rose-700"
            }
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {received === "yes" ? "Confirm Receipt" : "Report Non-Receipt"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
