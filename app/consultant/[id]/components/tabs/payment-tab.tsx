"use client";

import type React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Save,
  Loader2,
  Smartphone,
  Building,
  CheckCircle,
  AlertCircle,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { useConsultant } from "../consultant-context";
import { useToast } from "@/hooks/use-toast";

export function PaymentTab() {
  const { data, updateSection, saving } = useConsultant();
  const { toast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState<"bank" | "mpesa">(
    data.bankDetails?.bankName || data.bankDetails?.accountNumber
      ? "bank"
      : data.mpesaDetails?.phoneNumber
      ? "mpesa"
      : "bank"
  );

  const [bankData, setBankData] = useState({
    bankName: data.bankDetails?.bankName || "",
    accountNumber: data.bankDetails?.accountNumber || "",
    branchCode: data.bankDetails?.branchCode || "",
  });

  const [mpesaData, setMpesaData] = useState({
    phoneNumber: data.mpesaDetails?.phoneNumber || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validateAccountNumber = (accountNumber: string) => {
    if (accountNumber && !/^[0-9]{8,20}$/.test(accountNumber)) {
      return "Account number should be 8-20 digits";
    }
    return "";
  };

  const validatePhoneNumber = (phone: string) => {
    if (
      phone &&
      !/^(\+254|254|0)?[17][0-9]{8}$/.test(phone.replace(/\s/g, ""))
    ) {
      return "Please enter a valid Kenyan phone number";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (paymentMethod === "bank") {
      if (!bankData.bankName) {
        newErrors.bankName = "Bank name is required";
      }
      if (!bankData.accountNumber) {
        newErrors.accountNumber = "Account number is required";
      } else {
        const accountError = validateAccountNumber(bankData.accountNumber);
        if (accountError) newErrors.accountNumber = accountError;
      }
    } else {
      if (!mpesaData.phoneNumber) {
        newErrors.phoneNumber = "Phone number is required";
      } else {
        const phoneError = validatePhoneNumber(mpesaData.phoneNumber);
        if (phoneError) newErrors.phoneNumber = phoneError;
      }
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
      const updateData =
        paymentMethod === "bank"
          ? { bankDetails: bankData, mpesaDetails: null }
          : { mpesaDetails: mpesaData, bankDetails: null };

      await updateSection(updateData as any);
      toast({
        title: "Success",
        description: "Payment details updated successfully",
      });
    } catch (error) {
      // Error handled in context
    }
  };

  const isComplete = () => {
    if (paymentMethod === "bank") {
      return bankData.bankName && bankData.accountNumber;
    }
    return mpesaData.phoneNumber;
  };

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
                  Payment Information
                </h3>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred payment method
                </p>
              </div>
            </div>
            <Badge
              variant={isComplete() ? "default" : "secondary"}
              className="px-3 py-1"
            >
              {isComplete() ? "Complete" : "Incomplete"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Alert className="border-primary/20 bg-primary/5">
        <Shield className="h-4 w-4 text-primary" />
        <AlertDescription className="text-foreground">
          Your payment information is encrypted and securely stored. Choose
          either bank details or M-Pesa for receiving payments.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Method Selection */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-xl">Select Payment Method</CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose how you&apos;d like to receive payments
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid gap-4 md:grid-cols-2">
              <Button
                type="button"
                variant={paymentMethod === "bank" ? "default" : "outline"}
                onClick={() => setPaymentMethod("bank")}
                className="h-20 flex-col gap-2 transition-all duration-200"
              >
                <Building className="w-8 h-8" />
                <div className="text-center">
                  <div className="font-medium">Bank Account</div>
                  <div className="text-xs opacity-80">Traditional banking</div>
                </div>
              </Button>

              <Button
                type="button"
                variant={paymentMethod === "mpesa" ? "default" : "outline"}
                onClick={() => setPaymentMethod("mpesa")}
                className="h-20 flex-col gap-2 transition-all duration-200"
              >
                <Smartphone className="w-8 h-8" />
                <div className="text-center">
                  <div className="font-medium">M-Pesa</div>
                  <div className="text-xs opacity-80">Mobile money</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bank Details */}
        {paymentMethod === "bank" && (
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Building className="w-6 h-6 text-primary" />
                Bank Details
                {isComplete() && (
                  <CheckCircle className="w-5 h-5 text-primary" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bankName" className="text-sm font-medium">
                    Bank Name *
                  </Label>
                  <Select
                    value={bankData.bankName}
                    onValueChange={(value) =>
                      setBankData((b) => ({ ...b, bankName: value }))
                    }
                  >
                    <SelectTrigger
                      className={`h-11 ${
                        errors.bankName ? "border-destructive" : ""
                      }`}
                    >
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
                  {errors.bankName && (
                    <div className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      {errors.bankName}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branchCode" className="text-sm font-medium">
                    Branch Code
                  </Label>
                  <Input
                    id="branchCode"
                    value={bankData.branchCode}
                    onChange={(e) =>
                      setBankData((b) => ({ ...b, branchCode: e.target.value }))
                    }
                    placeholder="e.g., 001"
                    className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber" className="text-sm font-medium">
                  Account Number *
                </Label>
                <Input
                  id="accountNumber"
                  value={bankData.accountNumber}
                  onChange={(e) =>
                    setBankData((b) => ({
                      ...b,
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
            </CardContent>
          </Card>
        )}

        {/* M-Pesa Details */}
        {paymentMethod === "mpesa" && (
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Smartphone className="w-6 h-6 text-primary" />
                M-Pesa Details
                {isComplete() && (
                  <CheckCircle className="w-5 h-5 text-primary" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <Alert className="border-primary/20 bg-primary/5">
                  <Smartphone className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-foreground">
                    Enter the phone number registered with your M-Pesa account.
                    This will be used for receiving payments.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2 max-w-md">
                  <Label htmlFor="mpesaPhone" className="text-sm font-medium">
                    M-Pesa Phone Number *
                  </Label>
                  <Input
                    id="mpesaPhone"
                    value={mpesaData.phoneNumber}
                    onChange={(e) =>
                      setMpesaData({ phoneNumber: e.target.value })
                    }
                    placeholder="e.g., 0712345678 or +254712345678"
                    className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${
                      errors.phoneNumber
                        ? "border-destructive focus:ring-destructive/20"
                        : ""
                    }`}
                  />
                  {errors.phoneNumber && (
                    <div className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phoneNumber}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Enter a valid Kenyan phone number (Safaricom or Airtel)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            type="submit"
            disabled={saving}
            size="lg"
            className="min-w-[200px] h-12"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Payment Details
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
