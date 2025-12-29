"use client";

import type React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  Save,
  Loader2,
  Building,
  Hash,
  MapPin,
  CheckCircle,
  AlertCircle,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { useProfile } from "../profile-context";
import { useToast } from "@/hooks/use-toast";

export function BankingTab() {
  const { data, updateSection, saving } = useProfile();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    bankName: data.bankDetails?.bankName || "",
    accountNumber: data.bankDetails?.accountNumber || "",
    branchCode: data.bankDetails?.branchCode || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAccountNumber = (accountNumber: string) => {
    if (accountNumber && !/^[0-9]{8,20}$/.test(accountNumber)) {
      return "Account number should be 8-20 digits";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (formData.accountNumber) {
      const accountError = validateAccountNumber(formData.accountNumber);
      if (accountError) newErrors.accountNumber = accountError;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateSection({ bankDetails: formData });
      toast({
        title: "Success",
        description: "Banking details updated successfully",
      });
    } catch (error) {
      // Error handled in context
    }
  };

  const kenyanBanks = [
    "Equity Bank",
    "KCB Bank",
    "Cooperative Bank",
    "ABSA Bank Kenya",
    "Standard Chartered Bank",
    "NCBA Bank",
    "Stanbic Bank",
    "Diamond Trust Bank",
    "I&M Bank",
    "Family Bank",
    "Prime Bank",
    "Gulf African Bank",
    "Sidian Bank",
    "UBA Kenya",
    "Bank of Africa",
    "Credit Bank",
    "Mayfair Bank",
    "Middle East Bank",
    "Victoria Commercial Bank",
    "Other",
  ];

  const isFieldComplete = (field: string) => {
    return (
      formData[field as keyof typeof formData] &&
      formData[field as keyof typeof formData].trim() !== ""
    );
  };

  const completedFields = Object.keys(formData).filter((field) =>
    isFieldComplete(field)
  ).length;
  const totalFields = Object.keys(formData).length;

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">
                  Banking Information
                </h3>
                <p className="text-sm text-muted-foreground">
                  Secure payment and transaction details
                </p>
              </div>
            </div>
            <Badge
              variant={
                completedFields === totalFields ? "default" : "secondary"
              }
              className="px-3 py-1"
            >
              {completedFields}/{totalFields} Fields Complete
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Alert className="bg-info/10 border-info/30 items-center flex gap-2">
        <Shield className="h-4 w-4 text-info" />
        <AlertDescription className="text-foreground">
          Your banking information is encrypted and securely stored. This
          information is used for payment processing only.
        </AlertDescription>
      </Alert>

      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-muted/10 to-muted/30 border-b">
          <CardTitle className="flex items-center gap-2 text-xl">
            <CreditCard className="w-6 h-6 text-primary" />
            Banking Details
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            All fields are optional. Update your banking information for payment
            processing.
          </p>
        </CardHeader>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Bank Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Bank Information
                </h3>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="bankName"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Building className="w-4 h-4 text-muted-foreground" />
                    Bank Name
                    {isFieldComplete("bankName") && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </Label>
                  <Select
                    value={formData.bankName}
                    onValueChange={(value) =>
                      setFormData((p) => ({ ...p, bankName: value }))
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select your bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {kenyanBanks.map((bank) => (
                        <SelectItem key={bank} value={bank}>
                          {bank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="branchCode"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <CheckCircle className="w-4 h-4 text-success" />
                    Branch Code
                    {isFieldComplete("branchCode") && (
                      <CheckCircle className="w-4 h-4 text-success" />
                    )}
                  </Label>
                  <Input
                    id="branchCode"
                    value={formData.branchCode}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, branchCode: e.target.value }))
                    }
                    placeholder="e.g., 001"
                    className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Account Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-info/10 flex items-center justify-center">
                  <Hash className="w-4 h-4 text-info" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Account Information
                </h3>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="accountNumber"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  Account Number
                  {isFieldComplete("accountNumber") && (
                    <CheckCircle className="w-4 h-4 text-success" />
                  )}
                </Label>
                <Input
                  id="accountNumber"
                  value={formData.accountNumber}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      accountNumber: e.target.value,
                    }))
                  }
                  placeholder="Enter your account number"
                  className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${
                    errors.accountNumber
                      ? "border-destructive focus:ring-destructive/20"
                      : ""
                  }`}
                />
                {errors.accountNumber && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    {errors.accountNumber}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Enter your account number without spaces or special characters
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t">
              <Button
                type="submit"
                disabled={saving}
                size="lg"
                className="min-w-[200px] h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 transition-all duration-200"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Update Banking Details
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
