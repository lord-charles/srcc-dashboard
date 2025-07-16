"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Mail, Phone, Loader2, ArrowLeft } from 'lucide-react';
import { getVerificationStatus } from '@/services/consultant.service';

interface VerificationHubProps {
  email: string;
  onVerifyEmail: () => void;
  onVerifyPhone: () => void;
  onBackToLogin: () => void;
  onBothVerified: () => void;
}

export function VerificationHub({ email, onVerifyEmail, onVerifyPhone, onBackToLogin, onBothVerified }: VerificationHubProps) {
  const [status, setStatus] = useState<{ isEmailVerified: boolean; isPhoneVerified: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsLoading(true);
        const newStatus = await getVerificationStatus(email);
        setStatus(newStatus);
        if (newStatus.isEmailVerified && newStatus.isPhoneVerified) {
          onBothVerified();
        }
      } catch (error) {
        console.error("Failed to fetch verification status", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
  }, [email, onBothVerified]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Loading Verification Status...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center p-8">
          <Loader2 className="h-12 w-12 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Complete Your Registration</CardTitle>
        <CardDescription>Please verify your email and phone number to continue.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center space-x-4">
            <Mail className="h-6 w-6" />
            <p>Email Verification</p>
          </div>
          {status?.isEmailVerified ? (
            <CheckCircle className="h-6 w-6 text-green-500" />
          ) : (
            <Button onClick={onVerifyEmail} size="sm">Verify</Button>
          )}
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center space-x-4">
            <Phone className="h-6 w-6" />
            <p>Phone Verification</p>
          </div>
          {status?.isPhoneVerified ? (
            <CheckCircle className="h-6 w-6 text-green-500" />
          ) : (
            <Button onClick={onVerifyPhone} size="sm">Verify</Button>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="link" onClick={onBackToLogin}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Login
        </Button>
      </CardFooter>
    </Card>
  );
}
