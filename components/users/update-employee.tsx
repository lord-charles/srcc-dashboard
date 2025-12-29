"use client";

<<<<<<< HEAD
import { ChevronLeft, Plus, Trash2, Upload } from "lucide-react";
=======
import { ChevronLeft, Download } from "lucide-react";
>>>>>>> 53902b35964e59c30e770eedfce882b6fbcd68f3
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
<<<<<<< HEAD
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DatePicker } from "@/components/ui/date-picker";
import * as z from "zod";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { updateEmployee } from "@/services/employees.service";

// Skill Schema
const skillSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  yearsOfExperience: z.coerce.number().min(0).max(50),
  proficiencyLevel: z.enum(["Beginner", "Intermediate", "Expert"]),
});

// Education Schema
const educationSchema = z.object({
  institution: z.string().min(1, "Institution is required"),
  qualification: z.string().min(1, "Qualification is required"),
  yearOfCompletion: z.string().min(4, "Year is required"),
});

// Certification Schema
const certificationSchema = z.object({
  name: z.string().min(1, "Certification name is required"),
  issuingOrganization: z.string().min(1, "Issuing organization is required"),
  dateIssued: z.date(),
  expiryDate: z.date().optional(),
  certificationId: z.string().optional(),
});

// Academic Certificate Schema
const academicCertificateSchema = z.object({
  name: z.string().min(1, "Certificate name is required"),
  institution: z.string().min(1, "Institution is required"),
  yearOfCompletion: z.string().min(4, "Year is required"),
  documentUrl: z.string().url("Valid URL is required"),
});

// Bank Details Schema
const bankDetailsSchema = z.object({
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  branchCode: z.string().optional(),
});

// Mpesa Details Schema
const mpesaDetailsSchema = z.object({
  phoneNumber: z.string().optional(),
});

// Emergency Contact Schema
const emergencyContactSchema = z.object({
  name: z.string().optional(),
  relationship: z.string().optional(),
  phoneNumber: z.string().optional(),
  alternativePhoneNumber: z.string().optional(),
});

// Main Consultant/Employee Schema
const consultantSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  middleName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  alternativePhoneNumber: z.string().optional(),
  nationalId: z.string().min(6, "Invalid national ID"),
  kraPinNumber: z.string().optional(),
  nhifNumber: z.string().optional(),
  nssfNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  physicalAddress: z.string().optional(),
  postalAddress: z.string().optional(),
  county: z.string().optional(),

  // Professional Information
  department: z.string().optional(),
  position: z.string().optional(),
  yearsOfExperience: z.coerce.number().min(0).max(50).optional(),
  hourlyRate: z.coerce.number().min(0).optional(),
  availability: z.enum(["available", "partially_available", "not_available"]).optional(),
  preferredWorkTypes: z.array(z.enum(["remote", "onsite", "hybrid"])).optional(),
  cvUrl: z.string().url().optional().or(z.literal("")),

  // Skills, Education, Certifications
  skills: z.array(skillSchema).optional(),
  education: z.array(educationSchema).optional(),
  certifications: z.array(certificationSchema).optional(),
  academicCertificates: z.array(academicCertificateSchema).optional(),

  // Financial Information
  nhifDeduction: z.coerce.number().min(0).optional(),
  nssfDeduction: z.coerce.number().min(0).optional(),
  bankDetails: bankDetailsSchema.optional(),
  mpesaDetails: mpesaDetailsSchema.optional(),

  // Emergency Contact
  emergencyContact: emergencyContactSchema.optional(),

  // Account Status
  status: z.enum(["pending", "active", "inactive", "suspended", "terminated"]).optional(),
  roles: z.array(z.string()).optional(),
});

type ConsultantFormData = z.infer<typeof consultantSchema>;

export function UpdateEmployeeComponent({ employee }: any) {
  const { toast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("personal");
=======
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DatePicker } from "@/components/ui/date-picker";
import { Header } from "../header";
import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateEmployeeDto } from "@/types/employee";
import { useToast } from "@/hooks/use-toast";
import { updateEmployee } from "@/services/employees.service";

// Define the validation schema
const employeeSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z
      .string()
      .regex(/^254[17]\d{8}$/, "Phone number must start with 254"),
    nationalId: z.string().min(6, "Invalid national ID"),
    dateOfBirth: z.date().optional(),
    department: z.string().min(2, "Department is required"),
    position: z.string().min(2, "Position is required"),
    employmentType: z.enum(["full-time", "part-time", "contract", "intern"]),
    baseSalary: z.coerce
      .number()
      .min(0, "Base salary must be a positive number"),
    employmentStartDate: z.date(),
    employmentEndDate: z.date().optional(),
    paymentMethod: z.enum(["bank", "mpesa", "cash", "wallet"]),
    bankDetails: z
      .object({
        bankName: z.string().min(1, "Bank name is required"),
        accountNumber: z.string().min(1, "Account number is required"),
        branchCode: z.string().min(1, "Branch code is required"),
      })
      .optional(),
    mpesaDetails: z
      .object({
        phoneNumber: z
          .string()
          .regex(/^254[17]\d{8}$/, "Phone number must start with 254"),
      })
      .optional(),
    emergencyContact: z
      .object({
        name: z.string().optional(),
        relationship: z.string().optional(),
        phoneNumber: z
          .string()
          // .regex(/^254[17]\d{8}$/, "Phone number must start with 254")
          .optional(),
        alternativePhoneNumber: z
          .string()
          // .regex(/^254[17]\d{8}$/, "Phone number must start with 254")
          .optional(),
      })
      .optional(),
    status: z
      .enum(["active", "inactive", "suspended", "terminated"])
      .default("active"),
    roles: z
      .array(z.enum(["employee", "admin", "hr", "finance"]))
      .default(["employee"]),
  })
  .refine(
    (data) => {
      if (data.paymentMethod === "bank" && !data.bankDetails) {
        return false;
      }
      return true;
    },
    {
      message: "Please provide the required payment details",
      path: ["paymentMethod"],
    }
  );

type EmployeeFormData = z.infer<typeof employeeSchema>;

export function UpdateEmployeeComponent({ employee }: any) {
  const { toast } = useToast();

  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<
    "bank" | "mpesa" | "cash" | "wallet"
  >(employee?.paymentMethod || "mpesa");
>>>>>>> 53902b35964e59c30e770eedfce882b6fbcd68f3

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
<<<<<<< HEAD
    watch,
  } = useForm<ConsultantFormData>({
    resolver: zodResolver(consultantSchema),
    defaultValues: {
      // Personal Information
      firstName: employee?.firstName || "",
      lastName: employee?.lastName || "",
      middleName: employee?.middleName || "",
      email: employee?.email || "",
      phoneNumber: employee?.phoneNumber || "",
      alternativePhoneNumber: employee?.alternativePhoneNumber || "",
      nationalId: employee?.nationalId || "",
      kraPinNumber: employee?.kraPinNumber || "",
      nhifNumber: employee?.nhifNumber || "",
      nssfNumber: employee?.nssfNumber || "",
      dateOfBirth: employee?.dateOfBirth || "",
      physicalAddress: employee?.physicalAddress || "",
      postalAddress: employee?.postalAddress || "",
      county: employee?.county || "",

      // Professional Information
      department: employee?.department || "",
      position: employee?.position || "",
      yearsOfExperience: employee?.yearsOfExperience || 0,
      hourlyRate: employee?.hourlyRate || 0,
      availability: employee?.availability || "available",
      preferredWorkTypes: employee?.preferredWorkTypes || [],
      cvUrl: employee?.cvUrl || "",

      // Skills, Education, Certifications
      skills: employee?.skills || [],
      education: employee?.education || [],
      certifications: employee?.certifications || [],
      academicCertificates: employee?.academicCertificates || [],

      // Financial Information
      nhifDeduction: employee?.nhifDeduction || 0,
      nssfDeduction: employee?.nssfDeduction || 0,
      bankDetails: employee?.bankDetails || {},
      mpesaDetails: employee?.mpesaDetails || {},

      // Emergency Contact
      emergencyContact: employee?.emergencyContact || {},

      // Account Status
      status: employee?.status || "active",
      roles: employee?.roles || ["consultant"],
=======
    // watch,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: employee?.firstName || "",
      lastName: employee?.lastName || "",
      email: employee?.email || "",
      phoneNumber: employee?.phoneNumber || "",
      nationalId: employee?.nationalId || "",
      dateOfBirth: employee?.dateOfBirth
        ? new Date(employee.dateOfBirth)
        : undefined,
      department: employee?.department || "",
      position: employee?.position || "",
      employmentType: employee?.employmentType || "full-time",
      baseSalary: employee?.baseSalary || 0,
      employmentStartDate: employee?.employmentStartDate
        ? new Date(employee.employmentStartDate)
        : new Date(),
      employmentEndDate: employee?.employmentEndDate
        ? new Date(employee.employmentEndDate)
        : undefined,
      paymentMethod: employee?.paymentMethod || "mpesa",
      bankDetails: employee?.bankDetails || undefined,
      mpesaDetails: employee?.mpesaDetails || undefined,
      emergencyContact: employee?.emergencyContact || undefined,
      status: employee?.status || "active",
      roles: employee?.roles || ["employee"],
>>>>>>> 53902b35964e59c30e770eedfce882b6fbcd68f3
    },
    mode: "onChange",
  });

<<<<<<< HEAD
  // Field Arrays for dynamic sections
  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({
    control,
    name: "skills",
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    control,
    name: "education",
  });

  const {
    fields: certificationFields,
    append: appendCertification,
    remove: removeCertification,
  } = useFieldArray({
    control,
    name: "certifications",
  });

  const {
    fields: academicCertFields,
    append: appendAcademicCert,
    remove: removeAcademicCert,
  } = useFieldArray({
    control,
    name: "academicCertificates",
  });

  const preferredWorkTypes = watch("preferredWorkTypes");

  const onSubmit = async (data: ConsultantFormData) => {
    try {
      toast({
        title: "Updating Consultant/Employee",
        description: "Please wait while we process your request...",
      });

      await updateEmployee(employee._id, data as any);

      toast({
        title: "Update Successful",
        description: "Consultant/Employee has been updated successfully.",
      });

      setTimeout(() => {
        router.push("/users");
      }, 1500);
=======
  const onSubmit = async (data: EmployeeFormData) => {
    try {
      toast({
        title: "Updating Employee",
        description: "Please wait while we process your request...",
      });

      // Update instead of register
      await updateEmployee(employee._id, data as CreateEmployeeDto);

      // Show success toast
      toast({
        title: "Update Successful",
        description: "Employee has been updated successfully.",
      });

      // Redirect after a short delay to ensure toast is visible
      setTimeout(() => {
        router.push("/employees");
      }, 4500);
>>>>>>> 53902b35964e59c30e770eedfce882b6fbcd68f3
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
<<<<<<< HEAD
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
          Update Consultant/Employee
        </Badge>
        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
=======
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="px-4 flex min-h-screen w-full bg-card flex-col md:w-[87%] lg:w-full md:ml-[80px] lg:ml-0 sm:ml-0 overflow-x-hidden rounded-md"
      >
        {/* Header section */}
        <div className="flex items-center gap-4 py-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Badge variant="outline" className="rounded-sm px-1 font-normal">
            Update Employee
          </Badge>
          <div className="items-center gap-2 md:ml-auto flex">
            <Button
              type="submit"
              size="sm"
              className="font-bold bg-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3 lg:gap-8">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-4">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Employee identification details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid lg:grid-cols-3 sm:grid-cols-1 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        {...register("firstName")}
                        className={`w-full ${
                          errors.firstName ? "border-red-500" : ""
                        }`}
                      />
                      {errors.firstName && (
                        <p className="text-sm text-red-500">
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        {...register("lastName")}
                        className={`w-full ${
                          errors.lastName ? "border-red-500" : ""
                        }`}
                      />
                      {errors.lastName && (
                        <p className="text-sm text-red-500">
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        className={`w-full ${
                          errors.email ? "border-red-500" : ""
                        }`}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number *</Label>
                      <Input
                        id="phoneNumber"
                        {...register("phoneNumber")}
                        className={`w-full ${
                          errors.phoneNumber ? "border-red-500" : ""
                        }`}
                      />
                      {errors.phoneNumber && (
                        <p className="text-sm text-red-500">
                          {errors.phoneNumber.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nationalId">National ID *</Label>
                      <Input
                        id="nationalId"
                        {...register("nationalId")}
                        className={`w-full ${
                          errors.nationalId ? "border-red-500" : ""
                        }`}
                      />
                      {errors.nationalId && (
                        <p className="text-sm text-red-500">
                          {errors.nationalId.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">
                        Date of Birth (Optional)
                      </Label>
                      <Controller
                        name="dateOfBirth"
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            date={field.value}
                            setDate={field.onChange}
                          />
                        )}
                      />
                      {errors.dateOfBirth && (
                        <p className="text-sm text-red-500">
                          {errors.dateOfBirth.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Employment Details */}
            <Card>
              <CardHeader>
                <CardTitle>Employment Details</CardTitle>
                <CardDescription>
                  Job role and department information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department *</Label>
                      <Controller
                        name="department"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value || "SRCC"}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger id="department">
                              <SelectValue placeholder="Select School/Department" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ILAB">ILAB</SelectItem>
                              <SelectItem value="SBS">SBS</SelectItem>
                              <SelectItem value="SRCC">SRCC</SelectItem>
                              <SelectItem value="SHSS">SHSS</SelectItem>
                              <SelectItem value="SERC">SERC</SelectItem>
                              <SelectItem value="SIMS">SIMS</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.department && (
                        <p className="text-sm text-red-500">
                          {errors.department.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Position/Job Title *</Label>
                      <Input
                        id="position"
                        {...register("position")}
                        className={`w-full ${
                          errors.position ? "border-red-500" : ""
                        }`}
                      />
                      {errors.position && (
                        <p className="text-sm text-red-500">
                          {errors.position.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employmentType">Employment Type *</Label>
                      <Controller
                        name="employmentType"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger id="employmentType">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full-time">
                                Full-time
                              </SelectItem>
                              <SelectItem value="part-time">
                                Part-time
                              </SelectItem>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="intern">Intern</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.employmentType && (
                        <p className="text-sm text-red-500">
                          {errors.employmentType.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="baseSalary">Base Salary (KES) *</Label>
                      <Input
                        id="baseSalary"
                        type="number"
                        {...register("baseSalary", { valueAsNumber: true })}
                        className={`w-full ${
                          errors.baseSalary ? "border-red-500" : ""
                        }`}
                      />
                      {errors.baseSalary && (
                        <p className="text-sm text-red-500">
                          {errors.baseSalary.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employmentStartDate">Start Date *</Label>
                      <Controller
                        name="employmentStartDate"
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            date={field.value}
                            setDate={field.onChange}
                          />
                        )}
                      />
                      {errors.employmentStartDate && (
                        <p className="text-sm text-red-500">
                          {errors.employmentStartDate.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employmentEndDate">End Date</Label>
                      <Controller
                        name="employmentEndDate"
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            date={field.value}
                            setDate={field.onChange}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
                <CardDescription>
                  Primary emergency contact details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact.name">
                        Full Name (Optional)
                      </Label>
                      <Input
                        id="emergencyContact.name"
                        {...register("emergencyContact.name")}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact.relationship">
                        Relationship (Optional)
                      </Label>
                      <Controller
                        name="emergencyContact.relationship"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger id="emergencyContact.relationship">
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Spouse">Spouse</SelectItem>
                              <SelectItem value="Parent">Parent</SelectItem>
                              <SelectItem value="Sibling">Sibling</SelectItem>
                              <SelectItem value="Child">Child</SelectItem>
                              <SelectItem value="Friend">Friend</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact.phoneNumber">
                        Phone Number (Optional)
                      </Label>
                      <Input
                        id="emergencyContact.phoneNumber"
                        {...register("emergencyContact.phoneNumber")}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact.alternativePhoneNumber">
                        Alternative Phone
                      </Label>
                      <Input
                        id="emergencyContact.alternativePhoneNumber"
                        {...register("emergencyContact.alternativePhoneNumber")}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>Salary payment details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Controller
                      name="paymentMethod"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={(val) => {
                            field.onChange(val);
                            setPaymentMethod(
                              val as "bank" | "mpesa" | "cash" | "wallet"
                            );
                          }}
                        >
                          <SelectTrigger id="paymentMethod">
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bank">Bank Transfer</SelectItem>
                            <SelectItem value="mpesa">M-Pesa</SelectItem>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="wallet">Wallet</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {paymentMethod === "bank" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="bankDetails.bankName">
                          Bank Name (Optional)
                        </Label>
                        <Input
                          id="bankDetails.bankName"
                          {...register("bankDetails.bankName")}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankDetails.accountNumber">
                          Account Number (Optional)
                        </Label>
                        <Input
                          id="bankDetails.accountNumber"
                          {...register("bankDetails.accountNumber")}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankDetails.branchCode">
                          Branch Code (Optional)
                        </Label>
                        <Input
                          id="bankDetails.branchCode"
                          {...register("bankDetails.branchCode")}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}

                  {paymentMethod === "mpesa" && (
                    <div className="space-y-2">
                      <Label htmlFor="mpesaDetails.phoneNumber">
                        M-Pesa Phone Number (Optional)
                      </Label>
                      <Input
                        id="mpesaDetails.phoneNumber"
                        {...register("mpesaDetails.phoneNumber")}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
                <CardDescription>
                  Employee account configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger id="status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                            <SelectItem value="terminated">
                              Terminated
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="roles">Roles</Label>
                    <Controller
                      name="roles"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value[0]}
                          onValueChange={(val) => field.onChange([val])}
                        >
                          <SelectTrigger id="roles">
                            <SelectValue placeholder="Select roles" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employee">Employee</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="hr">HR</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center justify-center gap-2 md:hidden mt-4 w-full">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full font-bold text-lg"
          >
>>>>>>> 53902b35964e59c30e770eedfce882b6fbcd68f3
            Cancel
          </Button>
          <Button
            type="submit"
<<<<<<< HEAD
            size="sm"
            className="font-bold bg-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
        <TabsList className="grid w-full grid-cols-6 h-12 rounded-lg p-1 mb-6">
          <TabsTrigger value="personal" className="rounded-md">
            Personal
          </TabsTrigger>
          <TabsTrigger value="professional" className="rounded-md">
            Professional
          </TabsTrigger>
          <TabsTrigger value="skills" className="rounded-md">
            Skills
          </TabsTrigger>
          <TabsTrigger value="education" className="rounded-md">
            Education
          </TabsTrigger>
          <TabsTrigger value="financial" className="rounded-md">
            Financial
          </TabsTrigger>
          <TabsTrigger value="emergency" className="rounded-md">
            Emergency
          </TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Basic identification and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    {...register("firstName")}
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input id="middleName" {...register("middleName")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    {...register("lastName")}
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    {...register("phoneNumber")}
                    placeholder="254712345678"
                    className={errors.phoneNumber ? "border-red-500" : ""}
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-500">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alternativePhoneNumber">
                    Alternative Phone Number
                  </Label>
                  <Input
                    id="alternativePhoneNumber"
                    {...register("alternativePhoneNumber")}
                    placeholder="254723456789"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationalId">National ID *</Label>
                  <Input
                    id="nationalId"
                    {...register("nationalId")}
                    className={errors.nationalId ? "border-red-500" : ""}
                  />
                  {errors.nationalId && (
                    <p className="text-sm text-red-500">
                      {errors.nationalId.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kraPinNumber">KRA PIN Number</Label>
                  <Input
                    id="kraPinNumber"
                    {...register("kraPinNumber")}
                    placeholder="A012345678B"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nhifNumber">NHIF Number</Label>
                  <Input
                    id="nhifNumber"
                    {...register("nhifNumber")}
                    placeholder="NHIF123456"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nssfNumber">NSSF Number</Label>
                  <Input
                    id="nssfNumber"
                    {...register("nssfNumber")}
                    placeholder="NSSF123456"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...register("dateOfBirth")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="county">County</Label>
                  <Input
                    id="county"
                    {...register("county")}
                    placeholder="Nairobi"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="physicalAddress">Physical Address</Label>
                  <Textarea
                    id="physicalAddress"
                    {...register("physicalAddress")}
                    placeholder="Westlands, Nairobi"
                    rows={3}
                  />
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
              <CardDescription>User account configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="terminated">Terminated</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Professional Information Tab */}
        <TabsContent value="professional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Professional Details</CardTitle>
              <CardDescription>
                Work experience and professional information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department/School</Label>
                  <Controller
                    name="department"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="department">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SRCC">SRCC</SelectItem>
                          <SelectItem value="SU">SU</SelectItem>
                          <SelectItem value="SBS">SBS</SelectItem>
                          <SelectItem value="ILAB">ILAB</SelectItem>
                          <SelectItem value="SERC">SERC</SelectItem>
                          <SelectItem value="SIMS">SIMS</SelectItem>
                          <SelectItem value="SHSS">SHSS</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position/Job Title</Label>
                  <Input
                    id="position"
                    {...register("position")}
                    placeholder="Senior Consultant"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                  <Input
                    id="yearsOfExperience"
                    type="number"
                    {...register("yearsOfExperience", { valueAsNumber: true })}
                    min="0"
                    max="50"
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

                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Controller
                    name="availability"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="availability">
                          <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="partially_available">
                            Partially Available
                          </SelectItem>
                          <SelectItem value="not_available">
                            Not Available
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

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
                            checked={field.value?.includes(type as any)}
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

              <div className="space-y-2">
                <Label htmlFor="cvUrl">CV/Resume URL</Label>
                <Input
                  id="cvUrl"
                  {...register("cvUrl")}
                  placeholder="https://cloudinary.com/cv/john-doe-cv.pdf"
                />
                {errors.cvUrl && (
                  <p className="text-sm text-red-500">{errors.cvUrl.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Skills & Expertise</CardTitle>
                  <CardDescription>
                    Add and manage professional skills
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    appendSkill({
                      name: "",
                      yearsOfExperience: 0,
                      proficiencyLevel: "Beginner",
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Skill
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {skillFields.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No skills added yet. Click &quot;Add Skill&quot; to get started.
                </p>
              ) : (
                skillFields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor={`skills.${index}.name`}>Skill Name</Label>
                        <Input
                          id={`skills.${index}.name`}
                          {...register(`skills.${index}.name`)}
                          placeholder="Project Management"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`skills.${index}.yearsOfExperience`}>
                          Years of Experience
                        </Label>
                        <Input
                          id={`skills.${index}.yearsOfExperience`}
                          type="number"
                          {...register(`skills.${index}.yearsOfExperience`, {
                            valueAsNumber: true,
                          })}
                          min="0"
                          max="50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`skills.${index}.proficiencyLevel`}>
                          Proficiency
                        </Label>
                        <Controller
                          name={`skills.${index}.proficiencyLevel`}
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Beginner">Beginner</SelectItem>
                                <SelectItem value="Intermediate">
                                  Intermediate
                                </SelectItem>
                                <SelectItem value="Expert">Expert</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="mt-4"
                      onClick={() => removeSkill(index)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Education & Certifications</CardTitle>
                  <CardDescription>
                    Academic qualifications and professional certifications
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Education Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Education Background</h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      appendEducation({
                        institution: "",
                        qualification: "",
                        yearOfCompletion: "",
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                  </Button>
                </div>

                {educationFields.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No education records added yet.
                  </p>
                ) : (
                  educationFields.map((field, index) => (
                    <Card key={field.id} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`education.${index}.institution`}>
                            Institution
                          </Label>
                          <Input
                            id={`education.${index}.institution`}
                            {...register(`education.${index}.institution`)}
                            placeholder="University of Nairobi"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`education.${index}.qualification`}>
                            Qualification
                          </Label>
                          <Input
                            id={`education.${index}.qualification`}
                            {...register(`education.${index}.qualification`)}
                            placeholder="Bachelor of Science"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`education.${index}.yearOfCompletion`}>
                            Year of Completion
                          </Label>
                          <Input
                            id={`education.${index}.yearOfCompletion`}
                            {...register(`education.${index}.yearOfCompletion`)}
                            placeholder="2020"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="mt-4"
                        onClick={() => removeEducation(index)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </Card>
                  ))
                )}
              </div>

              {/* Certifications Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Professional Certifications
                  </h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      appendCertification({
                        name: "",
                        issuingOrganization: "",
                        dateIssued: new Date(),
                        expiryDate: undefined,
                        certificationId: "",
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Certification
                  </Button>
                </div>

                {certificationFields.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No certifications added yet.
                  </p>
                ) : (
                  certificationFields.map((field, index) => (
                    <Card key={field.id} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`certifications.${index}.name`}>
                            Certification Name
                          </Label>
                          <Input
                            id={`certifications.${index}.name`}
                            {...register(`certifications.${index}.name`)}
                            placeholder="PMP"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor={`certifications.${index}.issuingOrganization`}
                          >
                            Issuing Organization
                          </Label>
                          <Input
                            id={`certifications.${index}.issuingOrganization`}
                            {...register(
                              `certifications.${index}.issuingOrganization`
                            )}
                            placeholder="PMI"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`certifications.${index}.dateIssued`}>
                            Date Issued
                          </Label>
                          <Controller
                            name={`certifications.${index}.dateIssued`}
                            control={control}
                            render={({ field }) => (
                              <DatePicker
                                date={field.value}
                                setDate={field.onChange}
                              />
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`certifications.${index}.expiryDate`}>
                            Expiry Date (Optional)
                          </Label>
                          <Controller
                            name={`certifications.${index}.expiryDate`}
                            control={control}
                            render={({ field }) => (
                              <DatePicker
                                date={field.value}
                                setDate={field.onChange}
                              />
                            )}
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label
                            htmlFor={`certifications.${index}.certificationId`}
                          >
                            Certification ID (Optional)
                          </Label>
                          <Input
                            id={`certifications.${index}.certificationId`}
                            {...register(
                              `certifications.${index}.certificationId`
                            )}
                            placeholder="PMP123456"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="mt-4"
                        onClick={() => removeCertification(index)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </Card>
                  ))
                )}
              </div>

              {/* Academic Certificates Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Academic Certificates</h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      appendAcademicCert({
                        name: "",
                        institution: "",
                        yearOfCompletion: "",
                        documentUrl: "",
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Certificate
                  </Button>
                </div>

                {academicCertFields.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No academic certificates added yet.
                  </p>
                ) : (
                  academicCertFields.map((field, index) => (
                    <Card key={field.id} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`academicCertificates.${index}.name`}>
                            Certificate Name
                          </Label>
                          <Input
                            id={`academicCertificates.${index}.name`}
                            {...register(`academicCertificates.${index}.name`)}
                            placeholder="Bachelor of Science"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor={`academicCertificates.${index}.institution`}
                          >
                            Institution
                          </Label>
                          <Input
                            id={`academicCertificates.${index}.institution`}
                            {...register(
                              `academicCertificates.${index}.institution`
                            )}
                            placeholder="University of Nairobi"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor={`academicCertificates.${index}.yearOfCompletion`}
                          >
                            Year of Completion
                          </Label>
                          <Input
                            id={`academicCertificates.${index}.yearOfCompletion`}
                            {...register(
                              `academicCertificates.${index}.yearOfCompletion`
                            )}
                            placeholder="2020"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor={`academicCertificates.${index}.documentUrl`}
                          >
                            Document URL
                          </Label>
                          <Input
                            id={`academicCertificates.${index}.documentUrl`}
                            {...register(
                              `academicCertificates.${index}.documentUrl`
                            )}
                            placeholder="https://cloudinary.com/certificates/bsc.pdf"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="mt-4"
                        onClick={() => removeAcademicCert(index)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
              <CardDescription>
                Deductions and payment details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Deductions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Statutory Deductions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nhifDeduction">NHIF Deduction (KES)</Label>
                    <Input
                      id="nhifDeduction"
                      type="number"
                      {...register("nhifDeduction", { valueAsNumber: true })}
                      min="0"
                      placeholder="1700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nssfDeduction">NSSF Deduction (KES)</Label>
                    <Input
                      id="nssfDeduction"
                      type="number"
                      {...register("nssfDeduction", { valueAsNumber: true })}
                      min="0"
                      placeholder="200"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Bank Details</h3>
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
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>

              {/* M-Pesa Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">M-Pesa Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mpesaDetails.phoneNumber">
                      M-Pesa Phone Number
                    </Label>
                    <Input
                      id="mpesaDetails.phoneNumber"
                      {...register("mpesaDetails.phoneNumber")}
                      placeholder="254712345678"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emergency Contact Tab */}
        <TabsContent value="emergency" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
              <CardDescription>
                Primary emergency contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact.name">Full Name</Label>
                  <Input
                    id="emergencyContact.name"
                    {...register("emergencyContact.name")}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact.relationship">
                    Relationship
                  </Label>
                  <Controller
                    name="emergencyContact.relationship"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="emergencyContact.relationship">
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Spouse">Spouse</SelectItem>
                          <SelectItem value="Parent">Parent</SelectItem>
                          <SelectItem value="Sibling">Sibling</SelectItem>
                          <SelectItem value="Child">Child</SelectItem>
                          <SelectItem value="Friend">Friend</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact.phoneNumber">
                    Phone Number
                  </Label>
                  <Input
                    id="emergencyContact.phoneNumber"
                    {...register("emergencyContact.phoneNumber")}
                    placeholder="254712345678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact.alternativePhoneNumber">
                    Alternative Phone Number
                  </Label>
                  <Input
                    id="emergencyContact.alternativePhoneNumber"
                    {...register("emergencyContact.alternativePhoneNumber")}
                    placeholder="254723456789"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom Action Bar */}
      <div className="sticky bottom-0 bg-background border-t py-4 mt-8 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
=======
            size="lg"
            className="w-full font-bold text-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update"}
          </Button>
        </div>
      </form>
    </>
>>>>>>> 53902b35964e59c30e770eedfce882b6fbcd68f3
  );
}
