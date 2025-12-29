"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface OTPVerificationFormProps {
  title: string;
  description: string;
  onVerify: (otp: string) => Promise<any>;
  onSuccess: () => void;
  onBack: () => void;
}

export function OTPVerificationForm({
  title,
  description,
  onVerify,
  onSuccess,
  onBack,
}: OTPVerificationFormProps) {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (otp.length !== 4) {
      setError("Please enter a 4-digit code.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onVerify(otp);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-lg">
      <form onSubmit={handleSubmit}>
        <CardHeader className="text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            {isSuccess ? (
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            ) : (
              <CardTitle className="text-2xl font-bold">{title}</CardTitle>
            )}
          </motion.div>
          <CardDescription>
            {isSuccess ? "Verification successful!" : description}
          </CardDescription>
        </CardHeader>
        {!isSuccess && (
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Input
                ref={inputRef}
                id="otp"
                name="otp"
                type="text"
                placeholder="_ _ _ _"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                maxLength={4}
                required
                className="text-center text-2xl tracking-[0.5em] font-mono"
                disabled={isLoading}
              />
            </div>
          </CardContent>
        )}
        <CardFooter className="flex flex-col space-y-4">
          {!isSuccess && (
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={onBack}
            disabled={isLoading || isSuccess}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
