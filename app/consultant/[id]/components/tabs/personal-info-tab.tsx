"use client";

import type React from "react";

import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Save,
  Loader2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle,
  AlertCircle,
  Shield,
} from "lucide-react";
import { useConsultant } from "../consultant-context";
import { useToast } from "@/hooks/use-toast";

export function PersonalInfoTab() {
  const { data, updateSection, saving, consultantId } = useConsultant();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    firstName: data.firstName || "",
    lastName: data.lastName || "",
    middleName: data.middleName || "",
    email: data.email || "",
    phoneNumber: data.phoneNumber || "",
    alternativePhoneNumber: data.alternativePhoneNumber || "",
    nationalId: data.nationalId || "",
    kraPinNumber: data.kraPinNumber || "",
    nhifNumber: data.nhifNumber || "",
    nssfNumber: data.nssfNumber || "",
    dateOfBirth: data.dateOfBirth || "",
    physicalAddress: data.physicalAddress || "",
    postalAddress: data.postalAddress || "",
    county: data.county || "",
  });

  useEffect(() => {
    if (data) {
      setFormData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        middleName: data.middleName || "",
        email: data.email || "",
        phoneNumber: data.phoneNumber || "",
        alternativePhoneNumber: data.alternativePhoneNumber || "",
        nationalId: data.nationalId || "",
        kraPinNumber: data.kraPinNumber || "",
        nhifNumber: data.nhifNumber || "",
        nssfNumber: data.nssfNumber || "",
        dateOfBirth: data.dateOfBirth || "",
        physicalAddress: data.physicalAddress || "",
        postalAddress: data.postalAddress || "",
        county: data.county || "",
      });
    }
  }, [data]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const kenyanCounties = [
    "Nairobi",
    "Mombasa",
    "Kwale",
    "Kilifi",
    "Tana River",
    "Lamu",
    "Taita-Taveta",
    "Garissa",
    "Wajir",
    "Mandera",
    "Marsabit",
    "Isiolo",
    "Meru",
    "Tharaka-Nithi",
    "Embu",
    "Kitui",
    "Machakos",
    "Makueni",
    "Nyandarua",
    "Nyeri",
    "Kirinyaga",
    "Murang'a",
    "Kiambu",
    "Turkana",
    "West Pokot",
    "Samburu",
    "Trans-Nzoia",
    "Uasin Gishu",
    "Elgeyo-Marakwet",
    "Nandi",
    "Baringo",
    "Laikipia",
    "Nakuru",
    "Narok",
    "Kajiado",
    "Kericho",
    "Bomet",
    "Kakamega",
    "Vihiga",
    "Bungoma",
    "Busia",
    "Siaya",
    "Kisumu",
    "Homa Bay",
    "Migori",
    "Kisii",
    "Nyamira",
  ];

  const validateEmail = (email: string) => {
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePhone = (phone: string) => {
    if (phone && !/^[+]?[0-9\s\-()]{10,}$/.test(phone)) {
      return "Please enter a valid phone number";
    }
    return "";
  };

  const validateNationalId = (id: string) => {
    if (id && !/^[0-9]{7,8}$/.test(id)) {
      return "National ID should be 7-8 digits";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (formData.email) {
      const emailError = validateEmail(formData.email);
      if (emailError) newErrors.email = emailError;
    }

    if (formData.phoneNumber) {
      const phoneError = validatePhone(formData.phoneNumber);
      if (phoneError) newErrors.phoneNumber = phoneError;
    }

    if (formData.alternativePhoneNumber) {
      const altPhoneError = validatePhone(formData.alternativePhoneNumber);
      if (altPhoneError) newErrors.alternativePhoneNumber = altPhoneError;
    }

    if (formData.nationalId) {
      const idError = validateNationalId(formData.nationalId);
      if (idError) newErrors.nationalId = idError;
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
      await updateSection(formData);
      toast({
        title: "Success",
        description: "Personal information updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update personal information",
        variant: "destructive",
      });
    }
  };

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
              <User className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">
                  Personal Information
                </h3>
                <p className="text-sm text-muted-foreground">
                  Basic personal and contact details
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
      <Alert className="border-primary/20 bg-primary/5">
        <Shield className="h-4 w-4 text-primary" />
        <AlertDescription className="text-foreground">
          Your personal information is encrypted and securely stored. All fields
          are optional and can be updated anytime.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="w-6 h-6 text-primary" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  First Name
                  {isFieldComplete("firstName") && (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, firstName: e.target.value }))
                  }
                  placeholder="Enter first name"
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="middleName"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  Middle Name
                  {isFieldComplete("middleName") && (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                </Label>
                <Input
                  id="middleName"
                  value={formData.middleName}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, middleName: e.target.value }))
                  }
                  placeholder="Enter middle name"
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  Last Name
                  {isFieldComplete("lastName") && (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, lastName: e.target.value }))
                  }
                  placeholder="Enter last name"
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="dateOfBirth"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Date of Birth
                  {isFieldComplete("dateOfBirth") && (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, dateOfBirth: e.target.value }))
                  }
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="nationalId"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  National ID
                  {isFieldComplete("nationalId") && (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                </Label>
                <Input
                  id="nationalId"
                  value={formData.nationalId}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, nationalId: e.target.value }))
                  }
                  placeholder="12345678"
                  className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${
                    errors.nationalId
                      ? "border-destructive focus:ring-destructive/20"
                      : ""
                  }`}
                />
                {errors.nationalId && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    {errors.nationalId}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Phone className="w-6 h-6 text-primary" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Email Address
                  {isFieldComplete("email") && (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="john.doe@example.com"
                  className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${
                    errors.email
                      ? "border-destructive focus:ring-destructive/20"
                      : ""
                  }`}
                />
                {errors.email && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phoneNumber"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  Phone Number
                  {isFieldComplete("phoneNumber") && (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                </Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, phoneNumber: e.target.value }))
                  }
                  placeholder="+254 712 345 678"
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
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="alternativePhoneNumber"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  Alternative Phone
                  {isFieldComplete("alternativePhoneNumber") && (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                </Label>
                <Input
                  id="alternativePhoneNumber"
                  value={formData.alternativePhoneNumber}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      alternativePhoneNumber: e.target.value,
                    }))
                  }
                  placeholder="+254 723 456 789"
                  className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${
                    errors.alternativePhoneNumber
                      ? "border-destructive focus:ring-destructive/20"
                      : ""
                  }`}
                />
                {errors.alternativePhoneNumber && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    {errors.alternativePhoneNumber}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="county"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  County
                  {isFieldComplete("county") && (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                </Label>
                <Select
                  value={formData.county}
                  onValueChange={(value) =>
                    setFormData((p) => ({ ...p, county: value }))
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select county" />
                  </SelectTrigger>
                  <SelectContent>
                    {kenyanCounties.map((county) => (
                      <SelectItem key={county} value={county}>
                        {county}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="my-8" />

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="physicalAddress"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  Physical Address
                  {isFieldComplete("physicalAddress") && (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                </Label>
                <Textarea
                  id="physicalAddress"
                  value={formData.physicalAddress}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      physicalAddress: e.target.value,
                    }))
                  }
                  placeholder="Enter physical address"
                  rows={3}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="postalAddress"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  Postal Address
                  {isFieldComplete("postalAddress") && (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                </Label>
                <Textarea
                  id="postalAddress"
                  value={formData.postalAddress}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      postalAddress: e.target.value,
                    }))
                  }
                  placeholder="P.O. Box 12345-00100"
                  rows={3}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Government Numbers */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Shield className="w-6 h-6 text-primary" />
              Government Numbers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label
                  htmlFor="kraPinNumber"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  KRA PIN
                  {isFieldComplete("kraPinNumber") && (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                </Label>
                <Input
                  id="kraPinNumber"
                  value={formData.kraPinNumber}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, kraPinNumber: e.target.value }))
                  }
                  placeholder="A012345678B"
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="nhifNumber"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  SHA Number
                  {isFieldComplete("nhifNumber") && (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                </Label>
                <Input
                  id="nhifNumber"
                  value={formData.nhifNumber}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, nhifNumber: e.target.value }))
                  }
                  placeholder="SHA123456"
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="nssfNumber"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  NSSF Number
                  {isFieldComplete("nssfNumber") && (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                </Label>
                <Input
                  id="nssfNumber"
                  value={formData.nssfNumber}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, nssfNumber: e.target.value }))
                  }
                  placeholder="NSSF123456"
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end mt-6">
          <Button type="submit" disabled={saving} className="w-full sm:w-auto">
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
