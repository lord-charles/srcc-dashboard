"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Save,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useProfile } from "../profile-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function BusinessInfoTab() {
  const { data, updateSection, saving, organizationId } = useProfile();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    companyName: data.companyName || "",
    registrationNumber: data.registrationNumber || "",
    kraPin: data.kraPin || "",
    businessAddress: data.businessAddress || "",
    postalAddress: data.postalAddress || "",
    county: data.county || "",
    businessPhone: data.businessPhone || "",
    businessEmail: data.businessEmail || "",
    website: data.website || "",
    department: data.department || "",
    yearsOfOperation: data.yearsOfOperation || 0,
    servicesOffered: data.servicesOffered || [],
    industries: data.industries || [],
    preferredWorkTypes: data.preferredWorkTypes || [],
  });

  const [newService, setNewService] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = "Registration number is required";
    }

    if (!formData.kraPin.trim()) {
      newErrors.kraPin = "KRA PIN is required";
    }

    if (!formData.businessAddress.trim()) {
      newErrors.businessAddress = "Business address is required";
    }

    if (!formData.businessPhone.trim()) {
      newErrors.businessPhone = "Business phone is required";
    }

    if (!formData.businessEmail.trim()) {
      newErrors.businessEmail = "Business email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.businessEmail)) {
      newErrors.businessEmail = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
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
        description: "Business information updated successfully",
      });
    } catch (error) {
      // Error is already handled in the context
    }
  };

  const addService = () => {
    if (
      newService.trim() &&
      !formData.servicesOffered.includes(newService.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        servicesOffered: [...prev.servicesOffered, newService.trim()],
      }));
      setNewService("");
    }
  };

  const removeService = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      servicesOffered: prev.servicesOffered.filter((_, i) => i !== index),
    }));
  };

  const addIndustry = () => {
    if (
      newIndustry.trim() &&
      !formData.industries.includes(newIndustry.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        industries: [...prev.industries, newIndustry.trim()],
      }));
      setNewIndustry("");
    }
  };

  const removeIndustry = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      industries: prev.industries.filter((_, i) => i !== index),
    }));
  };

  const requiredFields = [
    "companyName",
    "registrationNumber",
    "kraPin",
    "businessAddress",
    "businessPhone",
    "businessEmail",
  ];
  const completedFields = requiredFields.filter(
    (field) => formData[field as keyof typeof formData]
  );

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <span className="font-medium">Business Information Progress</span>
            </div>
            <Badge
              variant={
                completedFields.length === requiredFields.length
                  ? "default"
                  : "secondary"
              }
            >
              {completedFields.length}/{requiredFields.length} Required Fields
            </Badge>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="companyName"
                  className="flex items-center gap-2"
                >
                  Company Name
                  <span className="text-destructive">*</span>
                  {formData.companyName && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      companyName: e.target.value,
                    }))
                  }
                  className={cn(
                    errors.companyName &&
                      "border-destructive focus-visible:ring-destructive/50"
                  )}
                  placeholder="Enter your company name"
                />
                {errors.companyName && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    {errors.companyName}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="registrationNumber"
                  className="flex items-center gap-2"
                >
                  Registration Number
                  <span className="text-destructive">*</span>
                  {formData.registrationNumber && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </Label>
                <Input
                  id="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      registrationNumber: e.target.value,
                    }))
                  }
                  className={cn(
                    errors.registrationNumber &&
                      "border-destructive focus-visible:ring-destructive/50"
                  )}
                  placeholder="e.g., PVT-1234567X"
                />
                {errors.registrationNumber && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    {errors.registrationNumber}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="kraPin" className="flex items-center gap-2">
                  KRA PIN
                  <span className="text-destructive">*</span>
                  {formData.kraPin && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </Label>
                <Input
                  id="kraPin"
                  value={formData.kraPin}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, kraPin: e.target.value }))
                  }
                  className={cn(
                    errors.kraPin &&
                      "border-destructive focus-visible:ring-destructive/50"
                  )}
                  placeholder="e.g., P051234567Q"
                />
                {errors.kraPin && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    {errors.kraPin}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="county">County</Label>
                <Input
                  id="county"
                  value={formData.county}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, county: e.target.value }))
                  }
                  placeholder="e.g., Nairobi"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="businessPhone"
                  className="flex items-center gap-2"
                >
                  Business Phone
                  <span className="text-destructive">*</span>
                  {formData.businessPhone && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </Label>
                <Input
                  id="businessPhone"
                  value={formData.businessPhone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      businessPhone: e.target.value,
                    }))
                  }
                  className={cn(
                    errors.businessPhone &&
                      "border-destructive focus-visible:ring-destructive/50"
                  )}
                  placeholder="e.g., 0712345678"
                />
                {errors.businessPhone && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    {errors.businessPhone}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="businessEmail"
                  className="flex items-center gap-2"
                >
                  Business Email
                  <span className="text-destructive">*</span>
                  {formData.businessEmail && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </Label>
                <Input
                  id="businessEmail"
                  type="email"
                  value={formData.businessEmail}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      businessEmail: e.target.value,
                    }))
                  }
                  className={cn(
                    errors.businessEmail &&
                      "border-destructive focus-visible:ring-destructive/50"
                  )}
                  placeholder="info@company.com"
                />
                {errors.businessEmail && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    {errors.businessEmail}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      website: e.target.value,
                    }))
                  }
                  placeholder="https://company.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearsOfOperation">Years of Operation</Label>
                <Input
                  id="yearsOfOperation"
                  type="number"
                  min="0"
                  value={formData.yearsOfOperation}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      yearsOfOperation: Number.parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="5"
                />
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="businessAddress"
                  className="flex items-center gap-2"
                >
                  Business Address
                  <span className="text-destructive">*</span>
                  {formData.businessAddress && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </Label>
                <Textarea
                  id="businessAddress"
                  value={formData.businessAddress}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      businessAddress: e.target.value,
                    }))
                  }
                  className={cn(
                    "min-h-[100px]",
                    errors.businessAddress &&
                      "border-destructive focus-visible:ring-destructive/50"
                  )}
                  placeholder="Enter your business address"
                  rows={3}
                />
                {errors.businessAddress && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    {errors.businessAddress}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalAddress">Postal Address</Label>
                <Textarea
                  id="postalAddress"
                  value={formData.postalAddress}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      postalAddress: e.target.value,
                    }))
                  }
                  placeholder="P.O. Box 12345-00100"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services and Industries */}
        <Card>
          <CardHeader>
            <CardTitle>Services & Industries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Services Offered */}
            <div className="space-y-3">
              <Label>Services Offered</Label>
              <div className="flex gap-2">
                <Input
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  placeholder="Add a service"
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addService())
                  }
                />
                <Button
                  type="button"
                  onClick={addService}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.servicesOffered.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.servicesOffered.map((service, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1 group"
                    >
                      {service}
                      <button
                        type="button"
                        onClick={() => removeService(index)}
                        className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Industries */}
            <div className="space-y-3">
              <Label>Industries</Label>
              <div className="flex gap-2">
                <Input
                  value={newIndustry}
                  onChange={(e) => setNewIndustry(e.target.value)}
                  placeholder="Add an industry"
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addIndustry())
                  }
                />
                <Button
                  type="button"
                  onClick={addIndustry}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.industries.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.industries.map((industry, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="flex items-center gap-1 group"
                    >
                      {industry}
                      <button
                        type="button"
                        onClick={() => removeIndustry(index)}
                        className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end mt-6">
          <Button type="submit" disabled={saving}>
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
