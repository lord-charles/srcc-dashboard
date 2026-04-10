"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { FileUpload } from "../ui/file-upload";
import { cloudinaryService } from "@/lib/cloudinary-service";
import { useToast } from "@/hooks/use-toast";
import { createSupplier, updateSupplier, Supplier } from "@/services/suppliers.service";
import { Header } from "../header";

export function SupplierRegistrationComponent({ initialData, isEditing = false }: { initialData?: Supplier, isEditing?: boolean }) {
  const { toast } = useToast();
  const router = useRouter();

  // File Upload States
  const [kraPinUrl, setKraPinUrl] = useState<string>(initialData?.kraPinUrl || "");
  const [incorporationCertificateUrl, setIncorporationCertificateUrl] =
    useState<string>(initialData?.incorporationCertificateUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    kraPin: initialData?.kraPin || "",
    registrationNumber: initialData?.registrationNumber || "",
    bankName: initialData?.bankName || "",
    bankBranch: initialData?.bankBranch || "",
    accountName: initialData?.accountName || "",
    accountNumber: initialData?.accountNumber || "",
    supplierCategory: initialData?.supplierCategory || "Goods",
    status: initialData?.status || "active",
    contactPerson: {
      name: initialData?.contactPerson?.name || "",
      phone: initialData?.contactPerson?.phone || "",
      email: initialData?.contactPerson?.email || "",
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+[1-9]\d{1,14}$/;

    if (!formData.name) newErrors.name = "Supplier name is required";

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone is required";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Phone must be in E.164 format (e.g., +254700...)";
    }

    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.kraPin) newErrors.kraPin = "KRA PIN is required";
    if (!formData.registrationNumber)
      newErrors.registrationNumber = "Registration Number is required";
    if (!formData.bankName) newErrors.bankName = "Bank name is required";
    if (!formData.bankBranch) newErrors.bankBranch = "Bank branch is required";
    if (!formData.accountNumber)
      newErrors.accountNumber = "Account number is required";
    if (!formData.accountName)
      newErrors.accountName = "Account name is required";

    if (
      formData.contactPerson.email &&
      !emailRegex.test(formData.contactPerson.email)
    ) {
      newErrors.contactPersonEmail = "Invalid contact person email";
    }
    if (
      formData.contactPerson.phone &&
      !phoneRegex.test(formData.contactPerson.phone)
    ) {
      newErrors.contactPersonPhone =
        "Contact phone must be in E.164 format (+...)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const updateContactPerson = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      contactPerson: {
        ...prev.contactPerson,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the form errors before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        kraPinUrl,
        incorporationCertificateUrl,
      };

      const result = isEditing && initialData
        ? await updateSupplier(initialData._id, payload)
        : await createSupplier(payload);

      if (result.success) {
        toast({
          title: isEditing ? "Supplier Updated" : "Supplier Created",
          description: isEditing ? "Supplier has been successfully updated." : "Supplier has been successfully registered.",
        });
        setTimeout(() => {
          router.push("/suppliers");
        }, 1500);
      } else {
        toast({
          title: isEditing ? "Update Failed" : "Registration Failed",
          description: result.error || "Failed to process supplier.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="px-2 flex min-h-[80vh] w-full bg-card flex-col md:w-[87%] lg:w-full md:ml-[80px] lg:ml-0 sm:ml-0 overflow-x-hidden rounded-md">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Badge
              variant="outline"
              className="rounded-sm px-1 font-normal bg-emerald-50 text-emerald-700"
            >
              {isEditing ? "Edit Supplier" : "New Supplier Registration"}
            </Badge>
          </div>
          <Button
            disabled={isSubmitting || isUploading}
            onClick={handleSubmit}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isSubmitting ? "Processing..." : isEditing ? "Update Supplier" : "Register Supplier"}
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Info Card */}
          <Card className="border-none shadow-md">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 pb-4 border-b">
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Company and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label>Supplier / Company Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    className={errors.email ? "border-red-500" : ""}
                    placeholder="email@example.com"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                    className={errors.phone ? "border-red-500" : ""}
                    placeholder="+254700000000"
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500">{errors.phone}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Physical Address *</Label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => updateFormData("address", e.target.value)}
                  className={`min-h-[80px] ${errors.address ? "border-red-500" : ""}`}
                />
              </div>

              {/* Primary Contact Person */}
              <div className="pt-4 border-t mt-4">
                <h4 className="text-sm font-medium mb-3">
                  Primary Contact Person (Optional)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Name</Label>
                    <Input
                      value={formData.contactPerson.name}
                      onChange={(e) =>
                        updateContactPerson("name", e.target.value)
                      }
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Phone</Label>
                    <Input
                      value={formData.contactPerson.phone}
                      onChange={(e) =>
                        updateContactPerson("phone", e.target.value)
                      }
                      placeholder="+254700000000"
                      className={
                        errors.contactPersonPhone ? "border-red-500" : ""
                      }
                    />
                    {errors.contactPersonPhone && (
                      <p className="text-xs text-red-500">
                        {errors.contactPersonPhone}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Email</Label>
                    <Input
                      value={formData.contactPerson.email}
                      onChange={(e) =>
                        updateContactPerson("email", e.target.value)
                      }
                      placeholder="jane@example.com"
                      className={
                        errors.contactPersonEmail ? "border-red-500" : ""
                      }
                    />
                    {errors.contactPersonEmail && (
                      <p className="text-xs text-red-500">
                        {errors.contactPersonEmail}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal & Business Profile */}
          <div className="space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 pb-4 border-b">
                <CardTitle>Legal & Operations</CardTitle>
                <CardDescription>
                  Compliance and business tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>KRA PIN *</Label>
                    <Input
                      value={formData.kraPin}
                      onChange={(e) => updateFormData("kraPin", e.target.value)}
                      className={
                        errors.kraPin ? "border-red-500 uppercase" : "uppercase"
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cert / Incorporation No *</Label>
                    <Input
                      value={formData.registrationNumber}
                      onChange={(e) =>
                        updateFormData("registrationNumber", e.target.value)
                      }
                      className={
                        errors.registrationNumber
                          ? "border-red-500 uppercase"
                          : "uppercase"
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Supplier Category *</Label>
                    <Select
                      value={formData.supplierCategory}
                      onValueChange={(val) =>
                        updateFormData("supplierCategory", val)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Goods">Goods</SelectItem>
                        <SelectItem value="Services">Services</SelectItem>
                        <SelectItem value="Both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(val) => updateFormData("status", val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending_approval">
                          Pending Approval
                        </SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Details */}
            <Card className="border-none shadow-md">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 pb-4 border-b">
                <CardTitle>Financial Details</CardTitle>
                <CardDescription>Bank information for payments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bank Name *</Label>
                    <Input
                      value={formData.bankName}
                      onChange={(e) =>
                        updateFormData("bankName", e.target.value)
                      }
                      className={errors.bankName ? "border-red-500" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Branch *</Label>
                    <Input
                      value={formData.bankBranch}
                      onChange={(e) =>
                        updateFormData("bankBranch", e.target.value)
                      }
                      className={errors.bankBranch ? "border-red-500" : ""}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Account Name *</Label>
                    <Input
                      value={formData.accountName}
                      onChange={(e) =>
                        updateFormData("accountName", e.target.value)
                      }
                      className={errors.accountName ? "border-red-500" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Number *</Label>
                    <Input
                      value={formData.accountNumber}
                      onChange={(e) =>
                        updateFormData("accountNumber", e.target.value)
                      }
                      className={errors.accountNumber ? "border-red-500" : ""}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Uploads Section */}
        <Card className="mt-6 border-none shadow-md">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 pb-4 border-b">
            <CardTitle>Compliance Documents (Optional)</CardTitle>
            <CardDescription>
              Upload necessary attachments for your supplier profile
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>KRA PIN Certificate</Label>
                <FileUpload
                  onChange={async (files) => {
                    if (files.length > 0) {
                      setIsUploading(true);
                      try {
                        const url = await cloudinaryService.uploadFile(
                          files[0],
                        );
                        setKraPinUrl(url);
                        toast({
                          title: "Success",
                          description: "KRA PIN uploaded.",
                        });
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to upload file.",
                          variant: "destructive",
                        });
                      } finally {
                        setIsUploading(false);
                      }
                    }
                  }}
                />
                {kraPinUrl && (
                  <a
                    href={kraPinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline"
                  >
                    View Uploaded Document
                  </a>
                )}
              </div>
              <div className="space-y-2">
                <Label>Certificate of Incorporation</Label>
                <FileUpload
                  onChange={async (files) => {
                    if (files.length > 0) {
                      setIsUploading(true);
                      try {
                        const url = await cloudinaryService.uploadFile(
                          files[0],
                        );
                        setIncorporationCertificateUrl(url);
                        toast({
                          title: "Success",
                          description: "Incorporation Cert uploaded.",
                        });
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to upload file.",
                          variant: "destructive",
                        });
                      } finally {
                        setIsUploading(false);
                      }
                    }
                  }}
                />
                {incorporationCertificateUrl && (
                  <a
                    href={incorporationCertificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline"
                  >
                    View Uploaded Document
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="pb-12" />
      </div>
    </>
  );
}
