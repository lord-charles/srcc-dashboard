"use client";

import * as React from "react";
import { useState } from "react";
import { Mail, Lock, ArrowRight, KeyRound, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
interface PasswordResetFormProps {
  onClose: () => void;
  initialEmail?: string;
  type?: "user" | "organization";
}

interface ApiResponse {
  success?: boolean;
  message?: string;
}

export function PasswordResetForm({
  onClose,
  initialEmail = "",
  type: initialType = "user",
}: PasswordResetFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [type, setType] = useState<"user" | "organization">(initialType);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"request" | "confirm" | "success">(
    "request"
  );
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const validateEmail = (email: string) =>
    /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email);

  const handleRequestReset = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter your email address.",
      });
      return;
    }
    if (!validateEmail(email)) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter a valid email address.",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/request-password-reset`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({ email, type }),
        }
      );

      const data: ApiResponse = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            data.message || "Failed to send reset code. Please try again.",
        });
      } else {
        toast({
          title: "Success",
          description:
            data.message || "Reset code has been sent to your email address.",
        });
        setStep("confirm");
      }
    } catch (error) {
      console.error("Request password reset error:", error);
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Could not connect to the server. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async () => {
    if (!resetToken) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter the reset code.",
      });
      return;
    }
    if (!newPassword) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter your new password.",
      });
      return;
    }
    if (newPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Password must be at least 8 characters long.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Passwords do not match.",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/confirm-password-reset`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({ email, resetToken, newPassword, type }),
        }
      );
      const data: ApiResponse = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            data.message ||
            "Failed to reset password. Please check the code and try again.",
        });
      } else {
        toast({
          title: "Success",
          description:
            data.message ||
            "Your password has been reset successfully. You can now login.",
        });
        setStep("success");
      }
    } catch (error) {
      console.error("Confirm password reset error:", error);
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Could not connect to the server. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === "success") {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <Check className="w-16 h-16 mx-auto mb-4 text-green-500" />
        <h3 className="mb-2 text-xl font-semibold">Password Reset!</h3>
        <p className="text-muted-foreground">
          Your password has been successfully reset.
        </p>
        <Button onClick={onClose} className="mt-6 w-full">
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 py-4">
      {step === "request" && (
        <>
          <p className="text-sm text-center text-muted-foreground">
            Enter your email to receive a password reset code. If the email is
            valid, instructions will be sent.
          </p>
          <div className="grid gap-2">
            <Label>Account Type</Label>
            <RadioGroup
              defaultValue={type}
              onValueChange={(value: "user" | "organization") => setType(value)}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="user"
                  id="user"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="user"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  Individual
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="organization"
                  id="organization"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="organization"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  Organization
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email-reset">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email-reset"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="pl-10"
                name="email-reset"
              />
            </div>
          </div>
          <Button
            onClick={handleRequestReset}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <Spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="mr-2 w-4 h-4" />
            )}
            Send Reset Code
          </Button>
        </>
      )}

      {step === "confirm" && (
        <>
          <p className="text-sm text-center text-muted-foreground">
            Enter the code sent to {email} and your new password.
          </p>
          <div className="grid gap-2">
            <Label htmlFor="reset-code">Reset Code</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="reset-code"
                type="text"
                placeholder="123456"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                disabled={loading}
                className="pl-10"
                name="reset-code"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                className="pl-10"
                name="new-password"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-new-password">Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="confirm-new-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="pl-10"
                name="confirm-new-password"
              />
            </div>
          </div>
          <Button
            onClick={handleConfirmReset}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <Spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 w-4 h-4" />
            )}
            Reset Password
          </Button>
        </>
      )}
      <Button
        variant="outline"
        onClick={onClose}
        disabled={loading}
        className="w-full mt-2"
      >
        Cancel
      </Button>
    </div>
  );
}
