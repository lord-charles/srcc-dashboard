"use client";

import { ChevronLeft, Plus, Trash2, Upload } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { updateOrganization } from "@/services/consultant.service";
import { FileUpload } from "@/components/ui/file-upload";
import { cloudinaryService } from "@/lib/cloudinary-service";

// Organization Schema
const organizationSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  registrationNumber: z.string().min(1, "Registration number is required"),
  kraPin: z.string().min(1, "KRA PIN is required"),
  businessAddress: z.string().min(5, "Business address is required"),
  postalAddress: z.string().optional(),
  county: z.string().optional(),
  businessPhone: z.string().min(10, "Valid phone number is required"),
  businessEmail: z.string().email("Invalid email address"),
  yearsOfOperation: z.coerce.number().min(0).optional(),
  hourlyRate: z.coerce.number().min(0).optional(),
  servicesOffered: z.array(z.string()).optional(),
  industries: z.array(z.string()).optional(),
  preferredWorkTypes: z.array(z.string()).optional(),
  contactPerson: z
    .object({
      name: z.string().optional(),
      position: z.string().optional(),
      email: z.string().email().optional().or(z.literal("")),
      phoneNumber: z.string().optional(),
    })
    .optional(),
  bankDetails: z
    .object({
      bankName: z.string().optional(),
      accountNumber: z.string().optional(),
      branchCode: z.string().optional(),
    })
    .optional(),
  registrationCertificateUrl: z.string().url().optional().or(z.literal("")),
  kraCertificateUrl: z.string().url().optional().or(z.literal("")),
  taxComplianceCertificateUrl: z.string().url().optional().or(z.literal("")),
  cr12Url: z.string().url().optional().or(z.literal("")),
  taxComplianceExpiryDate: z.string().optional(),
  status: z.enum(["pending", "active", "inactive"]).optional(),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

export function UpdateOrganizationComponent({ organization }: any) {
  const { toast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("business");
  const [isUploading, setIsUploading] = useState(false);

  // State for services and industries
  const [newService, setNewService] = useState("");
  const [newIndustry, setNewIndustry] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      companyName: organization?.companyName || "",
      registrationNumber: organization?.registrationNumber || "",
      kraPin: organization?.kraPin || "",
      businessAddress: organization?.businessAddress || "",
      postalAddress: organization?.postalAddress || "",
      county: organization?.county || "",
      businessPhone: organization?.businessPhone || "",
      businessEmail: organization?.businessEmail || "",
      yearsOfOperation: organization?.yearsOfOperation || 0,
      hourlyRate: organization?.hourlyRate || 0,
      servicesOffered: organization?.servicesOffered || [],
      industries: organization?.industries || [],
      preferredWorkTypes: organization?.preferredWorkTypes || [],
      contactPerson: organization?.contactPerson || {
        name: "",
        position: "",
        email: "",
        phoneNumber: "",
      },
      bankDetails: organization?.bankDetails || {
        bankName: "",
        accountNumber: "",
        branchCode: "",
      },
      registrationCertificateUrl:
        organization?.registrationCertificateUrl || "",
      kraCertificateUrl: organization?.kraCertificateUrl || "",
      taxComplianceCertificateUrl:
        organization?.taxComplianceCertificateUrl || "",
      cr12Url: organization?.cr12Url || "",
      taxComplianceExpiryDate: organization?.taxComplianceExpiryDate || "",
      status: organization?.status || "active",
    },
    mode: "onChange",
  });

  const servicesOffered = watch("servicesOffered");
  const industries = watch("industries");
  const preferredWorkTypes = watch("preferredWorkTypes");

  const handleAddService = () => {
    if (newService.trim()) {
      setValue("servicesOffered", [
        ...(servicesOffered || []),
        newService.trim(),
      ]);
      setNewService("");
    }
  };

  const handleRemoveService = (index: number) => {
    setValue(
      "servicesOffered",
      servicesOffered?.filter((_, i) => i !== index) || [],
    );
  };

  const handleAddIndustry = () => {
    if (newIndustry.trim()) {
      setValue("industries", [...(industries || []), newIndustry.trim()]);
      setNewIndustry("");
    }
  };

  const handleRemoveIndustry = (index: number) => {
    setValue("industries", industries?.filter((_, i) => i !== index) || []);
  };

  const handleFileUpload = async (
    files: File[],
    fieldName: keyof OrganizationFormData,
  ) => {
    if (files.length > 0) {
      setIsUploading(true);
      try {
        const url = await cloudinaryService.uploadFile(files[0]);
        setValue(fieldName, url as any);
        toast({
          title: "Success",
          description: "File uploaded successfully.",
        });
      } catch (error) {
        toast({
          title: "Upload Failed",
          description: "Could not upload file.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const onSubmit = async (data: OrganizationFormData) => {
    try {
      toast({
        title: "Updating Organization",
        description: "Please wait while we process your request...",
      });

      const result = await updateOrganization(organization._id, data);

      if (result.success) {
        toast({
          title: "Update Successful",
          description: "Organization has been updated successfully.",
        });
      } else {
        throw new Error(result.error || "Failed to update organization");
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="px-4 flex min-h-screen w-full bg-background flex-col md:w-[87%] lg:w-full md:ml-[80px] lg:ml-0 sm:ml-0 overflow-x-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-4 py-4 sticky top-0 bg-background z-10 border-b">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Badge variant="outline" className="rounded-sm px-2 font-normal">
          Update Organization
        </Badge>
        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className="font-bold bg-primary"
            disabled={isSubmitting || isUploading}
          >
            {isSubmitting ? "Updating..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full mt-6"
      >
        <TabsList className="grid w-full grid-cols-4 h-12 rounded-lg p-1 mb-6">
          <TabsTrigger value="business" className="rounded-md">
            Business Info
          </TabsTrigger>
          <TabsTrigger value="services" className="rounded-md">
            Services
          </TabsTrigger>
          <TabsTrigger value="contact" className="rounded-md">
            Contact & Bank
          </TabsTrigger>
          <TabsTrigger value="documents" className="rounded-md">
            Documents
          </TabsTrigger>
        </TabsList>

        {/* Business Information Tab */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Basic company details and registration information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    {...register("companyName")}
                    className={errors.companyName ? "border-red-500" : ""}
                  />
                  {errors.companyName && (
                    <p className="text-sm text-red-500">
                      {errors.companyName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">
                    Registration Number *
                  </Label>
                  <Input
                    id="registrationNumber"
                    {...register("registrationNumber")}
                    className={
                      errors.registrationNumber ? "border-red-500" : ""
                    }
                  />
                  {errors.registrationNumber && (
                    <p className="text-sm text-red-500">
                      {errors.registrationNumber.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kraPin">KRA PIN *</Label>
                  <Input
                    id="kraPin"
                    {...register("kraPin")}
                    className={errors.kraPin ? "border-red-500" : ""}
                  />
                  {errors.kraPin && (
                    <p className="text-sm text-red-500">
                      {errors.kraPin.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="county">County</Label>
                  <Input
                    id="county"
                    {...register("county")}
                    placeholder="Nairobi"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsOfOperation">Years of Operation</Label>
                  <Input
                    id="yearsOfOperation"
                    type="number"
                    {...register("yearsOfOperation", { valueAsNumber: true })}
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate (KES)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    {...register("hourlyRate", { valueAsNumber: true })}
                    min="0"
                    placeholder="5000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessEmail">Business Email *</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    {...register("businessEmail")}
                    className={errors.businessEmail ? "border-red-500" : ""}
                  />
                  {errors.businessEmail && (
                    <p className="text-sm text-red-500">
                      {errors.businessEmail.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessPhone">Business Phone *</Label>
                  <Input
                    id="businessPhone"
                    {...register("businessPhone")}
                    placeholder="254712345678"
                    className={errors.businessPhone ? "border-red-500" : ""}
                  />
                  {errors.businessPhone && (
                    <p className="text-sm text-red-500">
                      {errors.businessPhone.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessAddress">Business Address *</Label>
                  <Textarea
                    id="businessAddress"
                    {...register("businessAddress")}
                    placeholder="Westlands, Nairobi"
                    rows={3}
                    className={errors.businessAddress ? "border-red-500" : ""}
                  />
                  {errors.businessAddress && (
                    <p className="text-sm text-red-500">
                      {errors.businessAddress.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalAddress">Postal Address</Label>
                  <Textarea
                    id="postalAddress"
                    {...register("postalAddress")}
                    placeholder="P.O. Box 12345-00100"
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxComplianceExpiryDate">
                  Tax Compliance Expiry Date
                </Label>
                <Input
                  id="taxComplianceExpiryDate"
                  type="date"
                  {...register("taxComplianceExpiryDate")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Services & Industries</CardTitle>
              <CardDescription>
                Manage services offered and industries served
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Services Offered */}
              <div className="space-y-4">
                <div>
                  <Label>Services Offered</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      placeholder="Enter service name"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddService();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleAddService}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {servicesOffered?.map((service, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-2"
                    >
                      {service}
                      <button
                        type="button"
                        onClick={() => handleRemoveService(index)}
                        className="ml-1 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Industries */}
              <div className="space-y-4">
                <div>
                  <Label>Industries</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newIndustry}
                      onChange={(e) => setNewIndustry(e.target.value)}
                      placeholder="Enter industry name"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddIndustry();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleAddIndustry}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {industries?.map((industry, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-purple-50 text-purple-700 flex items-center gap-2"
                    >
                      {industry}
                      <button
                        type="button"
                        onClick={() => handleRemoveIndustry(index)}
                        className="ml-1 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Preferred Work Types */}
              <div className="space-y-2">
                <Label>Preferred Work Types</Label>
                <div className="flex flex-wrap gap-3">
                  {["remote", "onsite", "hybrid"].map((type) => (
                    <Controller
                      key={type}
                      name="preferredWorkTypes"
                      control={control}
                      render={({ field }) => (
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.value?.includes(type)}
                            onChange={(e) => {
                              const newValue = e.target.checked
                                ? [...(field.value || []), type]
                                : (field.value || []).filter((v) => v !== type);
                              field.onChange(newValue);
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="capitalize">{type}</span>
                        </label>
                      )}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact & Bank Tab */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Person</CardTitle>
              <CardDescription>Primary contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPerson.name">Name</Label>
                  <Input
                    id="contactPerson.name"
                    {...register("contactPerson.name")}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPerson.position">Position</Label>
                  <Input
                    id="contactPerson.position"
                    {...register("contactPerson.position")}
                    placeholder="CEO"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPerson.email">Email</Label>
                  <Input
                    id="contactPerson.email"
                    type="email"
                    {...register("contactPerson.email")}
                    placeholder="john@company.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPerson.phoneNumber">
                    Phone Number
                  </Label>
                  <Input
                    id="contactPerson.phoneNumber"
                    {...register("contactPerson.phoneNumber")}
                    placeholder="254712345678"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bank Details</CardTitle>
              <CardDescription>
                Banking information for payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankDetails.bankName">Bank Name</Label>
                  <Input
                    id="bankDetails.bankName"
                    {...register("bankDetails.bankName")}
                    placeholder="Equity Bank"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankDetails.accountNumber">
                    Account Number
                  </Label>
                  <Input
                    id="bankDetails.accountNumber"
                    {...register("bankDetails.accountNumber")}
                    placeholder="1234567890"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankDetails.branchCode">Branch Code</Label>
                  <Input
                    id="bankDetails.branchCode"
                    {...register("bankDetails.branchCode")}
                    placeholder="001"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Documents</CardTitle>
              <CardDescription>
                Upload required business registration and compliance documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Registration Certificate</Label>
                  <FileUpload
                    onChange={(files) =>
                      handleFileUpload(files, "registrationCertificateUrl")
                    }
                  />
                  {watch("registrationCertificateUrl") && (
                    <a
                      href={watch("registrationCertificateUrl")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline"
                    >
                      View Uploaded Certificate
                    </a>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>KRA Certificate</Label>
                  <FileUpload
                    onChange={(files) =>
                      handleFileUpload(files, "kraCertificateUrl")
                    }
                  />
                  {watch("kraCertificateUrl") && (
                    <a
                      href={watch("kraCertificateUrl")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline"
                    >
                      View Uploaded Certificate
                    </a>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Tax Compliance Certificate</Label>
                  <FileUpload
                    onChange={(files) =>
                      handleFileUpload(files, "taxComplianceCertificateUrl")
                    }
                  />
                  {watch("taxComplianceCertificateUrl") && (
                    <a
                      href={watch("taxComplianceCertificateUrl")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline"
                    >
                      View Uploaded Certificate
                    </a>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>CR12 Document</Label>
                  <FileUpload
                    onChange={(files) => handleFileUpload(files, "cr12Url")}
                  />
                  {watch("cr12Url") && (
                    <a
                      href={watch("cr12Url")}
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
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex items-center justify-center gap-2 my-4 w-full">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full font-bold text-lg"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="lg"
          className="w-full font-bold text-lg"
          disabled={isSubmitting || isUploading}
        >
          {isSubmitting
            ? "Updating..."
            : isUploading
              ? "Uploading..."
              : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
