"use client";

import type React from "react";
import {
  User,
  Save,
  Loader2,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { useProfile } from "../profile-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ContactTab() {
  const { data, updateSection, saving } = useProfile();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: data.contactPerson?.name || "",
    position: data.contactPerson?.position || "",
    email: data.contactPerson?.email || "",
    phoneNumber: data.contactPerson?.phoneNumber || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePhone = (phone: string) => {
    if (phone && !/^[+]?[0-9\s\-$$$$]{10,}$/.test(phone)) {
      return "Please enter a valid phone number";
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
      await updateSection({ contactPerson: formData });
      toast({
        title: "Success",
        description: "Contact information updated successfully",
      });
    } catch (error) {
      // Error handled in context
    }
  };

  const positions = [
    "CEO",
    "CTO",
    "CFO",
    "COO",
    "Managing Director",
    "General Manager",
    "HR Manager",
    "Operations Manager",
    "Project Manager",
    "Team Lead",
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
    <div className="space-y-6 ">
      {/* Progress Indicator */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-semibold">Contact Person Information</h3>
                <p className="text-sm text-muted-foreground">
                  Primary contact for your organization
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <User className="w-6 h-6 text-primary" />
            Contact Person Details
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            All fields are optional. Update any information as needed.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                  <User className="w-4 h-4 text-accent-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Personal Information</h3>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    Full Name
                    {isFieldComplete("name") && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="Enter full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position" className="flex items-center gap-2">
                    Position/Title
                    {isFieldComplete("position") && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) =>
                      setFormData((p) => ({ ...p, position: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((position) => (
                        <SelectItem key={position} value={position}>
                          {position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                  <Phone className="w-4 h-4 text-accent-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Contact Information</h3>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                    {isFieldComplete("email") && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="contact@company.com"
                    className={cn(
                      errors.email &&
                        "border-destructive focus-visible:ring-destructive/50"
                    )}
                  />
                  {errors.email && (
                    <div className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                    {isFieldComplete("phoneNumber") && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        phoneNumber: e.target.value,
                      }))
                    }
                    placeholder="+254 712 345 678"
                    className={cn(
                      errors.phoneNumber &&
                        "border-destructive focus-visible:ring-destructive/50"
                    )}
                  />
                  {errors.phoneNumber && (
                    <div className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phoneNumber}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t">
              <Button
                type="submit"
                disabled={saving}
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
                    Update Contact Information
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
