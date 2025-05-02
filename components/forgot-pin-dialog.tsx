"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { requestPasswordReset } from "@/services/consultant.service";

interface ForgotPinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgotPinDialog({ open, onOpenChange }: ForgotPinDialogProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await requestPasswordReset(email);
      toast({
        title: "PIN Sent",
        description: "If the email exists, a reset PIN has been sent to your email and phone.",
        variant: "default",
      });
      setEmail("");
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.toString() || "Failed to request PIN reset. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Forgot PIN?</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="forgot-pin-email">Email</Label>
            <Input
              id="forgot-pin-email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={isLoading}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Sending..." : "Send PIN"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
