"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  AlertCircle,
  X,
} from "lucide-react";
import Header from "./header";
import Footer from "./footer";
import { useToast } from "@/hooks/use-toast";
import { registerConsultant } from "@/services/consultant.service";
import { FileUpload } from "@/components/ui/file-upload";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Spinner } from "../ui/spinner";

interface SkillField {
  name: string;
  yearsOfExperience: number;
  proficiencyLevel: string;
}

interface EducationField {
  institution: string;
  qualification: string;
  yearOfCompletion: string;
}

interface CertificationField {
  name: string;
  issuingOrganization: string;
  dateIssued: string;
  expiryDate: string;
  certificationId: string;
}

interface EmergencyContact {
  name?: string;
  relationship?: string;
  phoneNumber?: string;
  alternativePhoneNumber?: string;
}

interface BankDetails {
  bankName: string;
  accountNumber: string;
  branchCode: string;
}

interface MpesaDetails {
  phoneNumber: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phoneNumber: string;
  alternativePhoneNumber?: string;
  nationalId: string;
  kraPinNumber: string;
  nhifNumber: string;
  nssfNumber: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  physicalAddress: string;
  postalAddress?: string;
  county: string;
  skills: SkillField[];
  education: EducationField[];
  certifications?: CertificationField[];
  cvUrl?: string;
  academicCertificates?: any[];
  yearsOfExperience: number;
  hourlyRate?: number;
  preferredWorkTypes?: string[];
  department: string;
  nhifDeduction?: number;
  nssfDeduction?: number;
  emergencyContact: EmergencyContact;
  bankDetails: BankDetails;
  mpesaDetails?: MpesaDetails;
}

export default function ConsultantRegistrationForm() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "mpesa">("bank");

  // Add states for file uploads
  const [cvDocument, setCvDocument] = useState<File[]>([]);
  const [certificatesCopy, setCertificatesCopy] = useState<File[]>([]);

  const { toast } = useToast();

  const defaultValues: FormData = {
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phoneNumber: "",
    alternativePhoneNumber: "",
    nationalId: "",
    kraPinNumber: "",
    nhifNumber: "",
    nssfNumber: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    physicalAddress: "",
    postalAddress: "",
    county: "",
    skills: [{ name: "", yearsOfExperience: 0, proficiencyLevel: "" }],
    education: [{ institution: "", qualification: "", yearOfCompletion: "" }],
    certifications: [
      {
        name: "",
        issuingOrganization: "",
        dateIssued: "",
        expiryDate: "",
        certificationId: "",
      },
    ],
    cvUrl: "",
    academicCertificates: [],
    yearsOfExperience: 0,
    hourlyRate: 0,
    preferredWorkTypes: [],
    department: "",
    nhifDeduction: 0,
    nssfDeduction: 0,
    emergencyContact: {
      name: "",
      relationship: "",
      phoneNumber: "",
      alternativePhoneNumber: "",
    },
    bankDetails: {
      bankName: "",
      accountNumber: "",
      branchCode: "",
    },
    mpesaDetails: {
      phoneNumber: "",
    },
  };

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues,
  });

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

  const totalSteps = 5;

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      const requiredFields = {
        firstName: "First Name",
        lastName: "Last Name",
        email: "Email",
        phoneNumber: "Phone Number",
        nationalId: "National ID",
        kraPinNumber: "KRA PIN Number",
        nhifNumber: "NHIF Number",
        nssfNumber: "NSSF Number",
        password: "Password",
        confirmPassword: "Confirm Password",
        dateOfBirth: "Date of Birth",
        physicalAddress: "Physical Address",
        county: "County",
        department: "Department",
        yearsOfExperience: "Years of Experience",
        hourlyRate: "Hourly Rate",
        // nhifDeduction: 'NHIF Deduction',
        // nssfDeduction: 'NSSF Deduction',
        preferredWorkTypes: "Preferred Work Types",
      };

      const requiredArrayFields = {
        skills: "Skills",
        education: "Education Background",
      };

      const missingFields: string[] = [];

      // Check basic required fields
      Object.entries(requiredFields).forEach(([key, label]) => {
        if (!data[key as keyof FormData]) {
          missingFields.push(label);
        }
      });

      // Check required array fields
      Object.entries(requiredArrayFields).forEach(([key, label]) => {
        const arrayField = data[key as keyof FormData] as any[];
        if (!arrayField || arrayField.length === 0) {
          missingFields.push(label);
        }
      });

      if (missingFields.length > 0) {
        toast({
          title: "Validation Error",
          description: `Please fill in the following required fields: ${missingFields.join(
            ", "
          )}`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const formData = new FormData();

      // Append CV document if exists
      if (cvDocument.length > 0) {
        formData.append("cv", cvDocument[0]);
      } else {
        toast({
          title: "Document Required",
          description: "Please upload your CV document",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Append certificates if they exist
      if (certificatesCopy.length > 0) {
        certificatesCopy.forEach((cert, index) => {
          formData.append("academicCertificateFiles", cert);
        });
      } else {
        toast({
          title: "Document Required",
          description: "Please upload your academic certificates",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Create academic certificates metadata
      const academicCertificatesMetadata = certificatesCopy.map(
        (cert, index) => ({
          name: `Certificate ${index + 1}`,
          institution:
            data.education[index]?.institution || "Unknown Institution",
          yearOfCompletion:
            data.education[index]?.yearOfCompletion ||
            new Date().getFullYear().toString(),
        })
      );

      // Append the rest of the form data
      Object.keys(data).forEach((key) => {
        if (key !== "cv" && key !== "certificates") {
          if (key === "education") {
            formData.append(
              "academicCertificates",
              JSON.stringify(academicCertificatesMetadata)
            );
          }

          const value = (data as Record<string, any>)[key];
          if (typeof value === "string") {
            formData.append(key, value);
          } else {
            formData.append(key, JSON.stringify(value));
          }
        }
      });

      const response = await registerConsultant(formData);

      toast({
        title: "Success",
        description: "Consultant registration successful",
      });

      setStep(1);
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      toast({
        title: "Error",
        description:
          error.message || "Something went wrong during registration",
        variant: "destructive",
      });
    }
  };

  const setStepWithScroll = (newStep: number) => {
    setStep(newStep);
    // window.scrollTo({ top: 0, behavior: "smooth" })
  };

  const validateStep = () => {
    if (step === 1) {
      const fields = [
        { name: "firstName" as const, label: "First Name" },
        { name: "lastName" as const, label: "Last Name" },
        { name: "nationalId" as const, label: "National ID" },
        { name: "dateOfBirth" as const, label: "Date of Birth" },
        { name: "yearsOfExperience" as const, label: "Years of Experience" },
        { name: "kraPinNumber" as const, label: "KRA PIN Number" },
        { name: "nhifNumber" as const, label: "NHIF Number" },
        { name: "nssfNumber" as const, label: "NSSF Number" },
        { name: "county" as const, label: "County" },
        { name: "password" as const, label: "Password" },
        { name: "confirmPassword" as const, label: "Confirm Password" },
      ];

      const missingFields = fields.filter((field) => !getValues(field.name));

      if (missingFields.length > 0) {
        toast({
          title: "Missing Required Fields",
          description: `Please fill in: ${missingFields
            .map((field) => field.label)
            .join(", ")}`,
          variant: "destructive",
        });
        return false;
      }

      // Password validation
      const password = getValues("password");
      const passwordRegex = /^(?=.*[A-Z]).{8,}$/;

      if (!passwordRegex.test(password)) {
        toast({
          title: "Invalid Password",
          description:
            "Password must contain at least one uppercase letter and be at least 8 characters",
          variant: "destructive",
        });
        return false;
      }

      if (password !== getValues("confirmPassword")) {
        toast({
          title: "Password Mismatch",
          description: "Passwords do not match",
          variant: "destructive",
        });
        return false;
      }

      return true;
    }

    if (step === 2) {
      const formValues = getValues();
      const fields = [
        { name: "email" as const, label: "Email" },
        { name: "phoneNumber" as const, label: "Phone Number" },
        { name: "physicalAddress" as const, label: "Physical Address" },
      ];

      const missingBasicFields = fields
        .filter((field) => !formValues[field.name])
        .map((f) => f.label);

      const missingFields = [...missingBasicFields];

      if (missingFields.length > 0) {
        toast({
          title: "Missing Required Fields",
          description: `Please fill in: ${missingFields.join(", ")}`,
          variant: "destructive",
        });
        return false;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formValues.email)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        return false;
      }

      // Validate phone numbers (Kenyan format)
      const phoneRegex = /^(?:\+254|0)[17]\d{8}$/;

      if (!phoneRegex.test(formValues.phoneNumber)) {
        toast({
          title: "Invalid Phone Number",
          description:
            "Please enter a valid Kenyan phone number (e.g., +254712345678 or 0712345678)",
          variant: "destructive",
        });
        return false;
      }

      return true;
    }

    if (step === 3) {
      const skills = getValues("skills") || [];
      const department = getValues("department");
      const preferredWorkTypes = getValues("preferredWorkTypes") || [];
      const hourlyRate = getValues("hourlyRate");

      // Validate skills
      if (skills.length === 0 || !skills[0].name) {
        toast({
          title: "Skills Required",
          description:
            "Please add at least one skill with complete information",
          variant: "destructive",
        });
        return false;
      }

      // Check if all skills have complete information
      const incompleteSkills = skills.some(
        (skill) =>
          !skill.name || !skill.yearsOfExperience || !skill.proficiencyLevel
      );

      if (incompleteSkills) {
        toast({
          title: "Incomplete Skills",
          description:
            "Please fill in all information for each skill (name, years of experience, and proficiency level)",
          variant: "destructive",
        });
        return false;
      }

      if (!department) {
        toast({
          title: "Department Required",
          description: "Please select your department",
          variant: "destructive",
        });
        return false;
      }

      if (preferredWorkTypes.length === 0) {
        toast({
          title: "Work Type Required",
          description: "Please select at least one preferred work type",
          variant: "destructive",
        });
        return false;
      }

      if (!hourlyRate || hourlyRate <= 0) {
        toast({
          title: "Invalid Hourly Rate",
          description: "Please enter a valid hourly rate (greater than 0)",
          variant: "destructive",
        });
        return false;
      }

      return true;
    }

    if (step === 4) {
      const education = getValues("education") || [];
      const certifications = getValues("certifications") || [];

      if (education.length === 0 || !education[0].institution) {
        toast({
          title: "Education Required",
          description: "Please add at least one education entry",
          variant: "destructive",
        });
        return false;
      }

      // Check if all education entries are complete
      const incompleteEducation = education.some(
        (edu) => !edu.institution || !edu.qualification || !edu.yearOfCompletion
      );

      if (incompleteEducation) {
        toast({
          title: "Incomplete Education",
          description:
            "Please fill in all information for each education entry (institution, qualification, and year of completion)",
          variant: "destructive",
        });
        return false;
      }

      if (!cvDocument || cvDocument.length === 0) {
        toast({
          title: "CV Required",
          description: "Please upload your CV document",
          variant: "destructive",
        });
        return false;
      }

      if (!certificatesCopy || certificatesCopy.length === 0) {
        toast({
          title: "Certificates Required",
          description: "Please upload your academic certificates",
          variant: "destructive",
        });
        return false;
      }

      // Validate certifications if any are added
      // if (certifications.length > 0) {
      //   const incompleteCertifications = certifications.some(
      //     (cert) =>
      //       !cert.name ||
      //       !cert.issuingOrganization ||
      //       !cert.dateIssued ||
      //       !cert.certificationId
      //   );

      //   if (incompleteCertifications) {
      //     toast({
      //       title: "Incomplete Certifications",
      //       description:
      //         "Please fill in all information for each certification",
      //       variant: "destructive",
      //     });
      //     return false;
      //   }
      // }

      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step < totalSteps) {
        setStepWithScroll(step + 1);
        toast({
          title: "Step Completed",
          description: "Moving to next step",
        });
      }
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStepWithScroll(step - 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold">Consultant Registration</h1>
            <p className="mt-2 text-gray-600">
              Join SRCC&apos;s network of professional consultants
            </p>
          </div>

          <div className="mb-12">
            <div className="relative">
              <div className="overflow-hidden mb-4">
                <div className="flex justify-between">
                  {Array.from({ length: totalSteps }).map((_, index) => (
                    <div key={index} className="flex-1 relative p-3">
                      <div
                        className={`h-2 ${
                          step > index + 1
                            ? "bg-[#B7BE00]"
                            : step === index + 1
                            ? "bg-[#31876d]"
                            : "bg-gray-200"
                        }`}
                      />
                      <div
                        className={`
                        absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                        rounded-full h-8 w-8 flex items-center justify-center text-sm font-semibold
                        ${
                          step > index + 1
                            ? "bg-[#B7BE00] text-[#31876d]"
                            : step === index + 1
                            ? "bg-[#31876d] "
                            : "bg-gray-200 text-gray-600"
                        }
                        `}
                      >
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between text-xs font-medium text-gray-500">
                <span>Personal Info</span>
                <span>Contact</span>
                <span>Professional</span>
                <span>Education</span>
                <span>Financial</span>
              </div>
            </div>
          </div>

          <Card className="shadow-lg border-t-4 border-t-[#31876d] ">
            <div className=" border-b p-3">
              <CardTitle className="text-2xl text-[#31876d] font-bold">
                {step === 1
                  ? "Personal Information"
                  : step === 2
                  ? "Contact & Emergency Details"
                  : step === 3
                  ? "Professional Information"
                  : step === 4
                  ? "Education & Certifications"
                  : "Financial Information"}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {step === 1
                  ? "Provide your basic personal details"
                  : step === 2
                  ? "Enter your contact and emergency information"
                  : step === 3
                  ? "Tell us about your professional experience"
                  : step === 4
                  ? "Share your educational background and certifications"
                  : "Add your payment and statutory details"}
              </CardDescription>
            </div>
            <CardContent>
              <div className="mb-4 text-sm font-medium text-gray-400 mt-2">
                Step {step} of {totalSteps}
              </div>
              <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label
                          htmlFor="firstName"
                          className="text-sm font-medium"
                        >
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          aria-label="First Name"
                          {...register("firstName", {
                            required: "First name is required",
                          })}
                          className="border-gray-300 focus:border-[#31876d] focus:ring focus:ring-[#31876d] focus:ring-opacity-50 "
                        />
                        {errors.firstName && (
                          <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="middleName"
                          className="text-sm font-medium"
                        >
                          Middle Name
                        </Label>
                        <Input
                          id="middleName"
                          aria-label="Middle Name"
                          {...register("middleName")}
                          className="border-gray-300 focus:border-[#31876d] focus:ring focus:ring-[#31876d] focus:ring-opacity-50 "
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="lastName"
                          className="text-sm font-medium"
                        >
                          Last Name
                        </Label>
                        <Input
                          required
                          id="lastName"
                          aria-label="Last Name"
                          {...register("lastName", {
                            required: "Last name is required",
                          })}
                          className="border-gray-300 focus:border-[#31876d] focus:ring focus:ring-[#31876d] focus:ring-opacity-50 "
                        />
                        {errors.lastName && (
                          <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label
                          htmlFor="nationalId"
                          className="text-sm font-medium"
                        >
                          National ID
                        </Label>
                        <Input
                          id="nationalId"
                          aria-label="National ID"
                          {...register("nationalId", { required: true })}
                          className="border-gray-300 focus:border-[#31876d] focus:ring focus:ring-[#31876d] focus:ring-opacity-50 "
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="dateOfBirth"
                          className="text-sm font-medium"
                        >
                          Date of Birth *
                        </Label>
                        <Input
                          type="date"
                          {...register("dateOfBirth", {
                            required: "Date of birth is required",
                            validate: {
                              validDate: (value) => {
                                const date = new Date(value);
                                return (
                                  !isNaN(date.getTime()) ||
                                  "Invalid date format"
                                );
                              },
                              notFuture: (value) => {
                                const date = new Date(value);
                                return (
                                  date <= new Date() ||
                                  "Date cannot be in the future"
                                );
                              },
                              minimumAge: (value) => {
                                const date = new Date(value);
                                const minAge = new Date();
                                minAge.setFullYear(minAge.getFullYear() - 18);
                                return (
                                  date <= minAge ||
                                  "Must be at least 18 years old"
                                );
                              },
                            },
                            setValueAs: (value) => {
                              // Ensure the date is stored in ISO format
                              return value
                                ? new Date(value).toISOString().split("T")[0]
                                : value;
                            },
                          })}
                          max={
                            new Date(
                              new Date().setFullYear(
                                new Date().getFullYear() - 18
                              )
                            )
                              .toISOString()
                              .split("T")[0]
                          }
                          className={cn(
                            "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-[#31876d] focus:ring-opacity-50",
                            errors.dateOfBirth
                              ? "border-red-500 focus:border-red-500"
                              : "border-gray-300 focus:border-[#31876d]"
                          )}
                          id="dateOfBirth"
                          aria-label="Date of Birth"
                        />
                        {errors.dateOfBirth && (
                          <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.dateOfBirth.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="yearsOfExperience"
                          className="text-sm font-medium"
                        >
                          Years of work Experience
                        </Label>
                        <Input
                          id="yearsOfExperience"
                          aria-label="Years of Experience"
                          {...register("yearsOfExperience", { required: true })}
                          className="border-gray-300 focus:border-[#31876d] focus:ring focus:ring-[#31876d] focus:ring-opacity-50 "
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                      {/* Hidden fields with default values */}
                      <input type="hidden" {...register("nhifDeduction")} />
                      <input type="hidden" {...register("nssfDeduction")} />
                      <input type="hidden" {...register("department")} />
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label
                          htmlFor="kraPinNumber"
                          className="text-sm font-medium"
                        >
                          KRA PIN Number
                        </Label>
                        <Input
                          id="kraPinNumber"
                          aria-label="KRA PIN Number"
                          {...register("kraPinNumber", { required: true })}
                          className="border-gray-300 focus:border-[#31876d] focus:ring focus:ring-[#31876d] focus:ring-opacity-50 "
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="nhifNumber"
                          className="text-sm font-medium"
                        >
                          SHA/SHIF Number
                        </Label>
                        <Input
                          id="nhifNumber"
                          aria-label="NHIF Number"
                          {...register("nhifNumber", { required: true })}
                          className="border-gray-300 focus:border-[#31876d] focus:ring focus:ring-[#31876d] focus:ring-opacity-50 "
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="nssfNumber"
                          className="text-sm font-medium"
                        >
                          NSSF Number
                        </Label>
                        <Input
                          id="nssfNumber"
                          aria-label="NSSF Number"
                          {...register("nssfNumber", { required: true })}
                          className="border-gray-300 focus:border-[#31876d] focus:ring focus:ring-[#31876d] focus:ring-opacity-50 "
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="county" className="text-sm font-medium">
                          County
                        </Label>
                        <Select
                          onValueChange={(value) => setValue("county", value)}
                          defaultValue={getValues("county")}
                        >
                          <SelectTrigger
                            id="county"
                            aria-label="County"
                            className="border-gray-300 focus:border-[#31876d] focus:ring focus:ring-[#31876d] focus:ring-opacity-50"
                          >
                            <SelectValue placeholder="Select county" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="baringo">Baringo</SelectItem>
                            <SelectItem value="bomet">Bomet</SelectItem>
                            <SelectItem value="bungoma">Bungoma</SelectItem>
                            <SelectItem value="busia">Busia</SelectItem>
                            <SelectItem value="elgeyo_marakwet">
                              Elgeyo-Marakwet
                            </SelectItem>
                            <SelectItem value="embu">Embu</SelectItem>
                            <SelectItem value="garissa">Garissa</SelectItem>
                            <SelectItem value="homa_bay">Homa Bay</SelectItem>
                            <SelectItem value="isiolo">Isiolo</SelectItem>
                            <SelectItem value="kajiado">Kajiado</SelectItem>
                            <SelectItem value="kakamega">Kakamega</SelectItem>
                            <SelectItem value="kericho">Kericho</SelectItem>
                            <SelectItem value="kiambu">Kiambu</SelectItem>
                            <SelectItem value="kilifi">Kilifi</SelectItem>
                            <SelectItem value="kirinyaga">Kirinyaga</SelectItem>
                            <SelectItem value="kisii">Kisii</SelectItem>
                            <SelectItem value="kisumu">Kisumu</SelectItem>
                            <SelectItem value="kitui">Kitui</SelectItem>
                            <SelectItem value="kwale">Kwale</SelectItem>
                            <SelectItem value="laikipia">Laikipia</SelectItem>
                            <SelectItem value="lamu">Lamu</SelectItem>
                            <SelectItem value="machakos">Machakos</SelectItem>
                            <SelectItem value="makueni">Makueni</SelectItem>
                            <SelectItem value="mandera">Mandera</SelectItem>
                            <SelectItem value="marsabit">Marsabit</SelectItem>
                            <SelectItem value="meru">Meru</SelectItem>
                            <SelectItem value="migori">Migori</SelectItem>
                            <SelectItem value="mombasa">Mombasa</SelectItem>
                            <SelectItem value="murang'a">
                              Murang&apos;a
                            </SelectItem>
                            <SelectItem value="nairobi">Nairobi</SelectItem>
                            <SelectItem value="nakuru">Nakuru</SelectItem>
                            <SelectItem value="nandi">Nandi</SelectItem>
                            <SelectItem value="narok">Narok</SelectItem>
                            <SelectItem value="nyamira">Nyamira</SelectItem>
                            <SelectItem value="nyandarua">Nyandarua</SelectItem>
                            <SelectItem value="nyeri">Nyeri</SelectItem>
                            <SelectItem value="samburu">Samburu</SelectItem>
                            <SelectItem value="siaya">Siaya</SelectItem>
                            <SelectItem value="taita_taveta">
                              Taita Taveta
                            </SelectItem>
                            <SelectItem value="tana_river">
                              Tana River
                            </SelectItem>
                            <SelectItem value="tharaka_nithi">
                              Tharaka Nithi
                            </SelectItem>
                            <SelectItem value="trans_nzoia">
                              Trans Nzoia
                            </SelectItem>
                            <SelectItem value="turkana">Turkana</SelectItem>
                            <SelectItem value="uasin_gishu">
                              Uasin Gishu
                            </SelectItem>
                            <SelectItem value="vihiga">Vihiga</SelectItem>
                            <SelectItem value="wajir">Wajir</SelectItem>
                            <SelectItem value="west_pokot">
                              West Pokot
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="password"
                          className="text-sm font-medium"
                        >
                          Password
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          aria-label="Password"
                          {...register("password", {
                            required: "Password is required",
                            minLength: {
                              value: 8,
                              message: "Password must be at least 8 characters",
                            },
                            pattern: {
                              value: /^(?=.*[A-Z]).{8,}$/,
                              message:
                                "Password must contain at least one uppercase letter and be at least 8 characters",
                            },
                          })}
                          className="border-gray-300 focus:border-[#31876d] focus:ring focus:ring-[#31876d] focus:ring-opacity-50"
                        />

                        {errors.password && (
                          <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.password.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="confirmPassword"
                          className="text-sm font-medium"
                        >
                          Confirm Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          aria-label="Confirm Password"
                          {...register("confirmPassword", {
                            required: "Please confirm your password",
                            validate: (value) =>
                              value === getValues("password") ||
                              "Passwords do not match",
                          })}
                          className="border-gray-300 focus:border-[#31876d] focus:ring focus:ring-[#31876d] focus:ring-opacity-50"
                        />
                        {errors.confirmPassword && (
                          <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.confirmPassword.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          aria-label="Email"
                          {...register("email", { required: true })}
                          className="border-gray-300 focus:border-[#31876d] focus:ring focus:ring-[#31876d] focus:ring-opacity-50 "
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="phoneNumber"
                          className="text-sm font-medium"
                        >
                          Phone Number
                        </Label>
                        <Input
                          id="phoneNumber"
                          aria-label="Phone Number"
                          {...register("phoneNumber", { required: true })}
                          className="border-gray-300 focus:border-[#31876d] focus:ring focus:ring-[#31876d] focus:ring-opacity-50 "
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label
                          htmlFor="alternativePhoneNumber"
                          className="text-sm font-medium"
                        >
                          Alternative Phone Number
                        </Label>
                        <Input
                          id="alternativePhoneNumber"
                          aria-label="Alternative Phone Number"
                          {...register("alternativePhoneNumber")}
                          className="border-gray-300 focus:border-[#31876d] focus:ring focus:ring-[#31876d] focus:ring-opacity-50 "
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="physicalAddress"
                          className="text-sm font-medium"
                        >
                          Physical Address
                        </Label>
                        <Input
                          id="physicalAddress"
                          aria-label="Physical Address"
                          {...register("physicalAddress", { required: true })}
                          className="border-gray-300 focus:border-[#31876d] focus:ring focus:ring-[#31876d] focus:ring-opacity-50 "
                        />
                      </div>
                    </div>

                    <Separator className="my-8" />

                    <div>
                      <h3 className="text-lg font-medium text-[#31876d] mb-4">
                        Emergency Contact
                      </h3>
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label
                            htmlFor="emergencyName"
                            className="text-sm font-medium"
                          >
                            Contact Name
                          </Label>
                          <Input
                            id="emergencyName"
                            aria-label="Emergency Contact Name"
                            {...register("emergencyContact.name")}
                            className="border-gray-300 focus:border-[#31876d] focus:ring focus:ring-[#31876d] focus:ring-opacity-50 "
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="emergencyRelationship"
                            className="text-sm font-medium"
                          >
                            Relationship
                          </Label>
                          <Input
                            id="emergencyRelationship"
                            aria-label="Emergency Contact Relationship"
                            {...register("emergencyContact.relationship")}
                            className="border-gray-300 focus:border-[#31876d] focus:ring focus:ring-[#31876d] focus:ring-opacity-50 "
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="emergencyPhone"
                            className="text-sm font-medium"
                          >
                            Phone Number
                          </Label>
                          <Input
                            id="emergencyPhone"
                            aria-label="Emergency Contact Phone Number"
                            {...register("emergencyContact.phoneNumber")}
                            className="border-gray-300 focus:border-[#31876d] focus:ring focus:ring-[#31876d] focus:ring-opacity-50 "
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="emergencyAltPhone"
                            className="text-sm font-medium"
                          >
                            Alternative Phone
                          </Label>
                          <Input
                            id="emergencyAltPhone"
                            aria-label="Emergency Contact Alternative Phone"
                            {...register(
                              "emergencyContact.alternativePhoneNumber"
                            )}
                            className="border-gray-300 focus:border-[#31876d] focus:ring focus:ring-[#31876d] focus:ring-opacity-50 "
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <Label className="text-lg font-medium text-[#31876d]">
                          Skills
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            appendSkill({
                              name: "",
                              yearsOfExperience: 0,
                              proficiencyLevel: "",
                            })
                          }
                          className="bg-[#31876d]  flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" /> Add Skill
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {skillFields.map((field, index) => (
                          <div
                            key={field.id}
                            className="flex gap-4 items-start p-4  rounded-lg"
                          >
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 flex-1">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                  Skill Name
                                </Label>
                                <Input
                                  placeholder="e.g., Project Management"
                                  aria-label={`Skill Name ${index + 1}`}
                                  {...register(`skills.${index}.name` as const)}
                                  className="border-gray-300 focus:border-[#31876d] focus:ring focus:ring-[#31876d] focus:ring-opacity-50 "
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                  Years of Experience
                                </Label>
                                <Input
                                  type="number"
                                  placeholder="e.g., 5"
                                  aria-label={`Years of Experience for Skill ${
                                    index + 1
                                  }`}
                                  {...register(
                                    `skills.${index}.yearsOfExperience` as const
                                  )}
                                  className="border-gray-300 focus:border-[#31876d] focus:ring focus:ring-[#31876d] focus:ring-opacity-50 "
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                  Proficiency Level
                                </Label>
                                <Select
                                  onValueChange={(value) =>
                                    setValue(
                                      `skills.${index}.proficiencyLevel`,
                                      value
                                    )
                                  }
                                >
                                  <SelectTrigger
                                    aria-label={`Proficiency Level for Skill ${
                                      index + 1
                                    }`}
                                    className="border-gray-300 focus:border-[#31876d] focus:ring focus:ring-[#31876d] focus:ring-opacity-50"
                                  >
                                    <SelectValue placeholder="Select level" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="beginner">
                                      Beginner
                                    </SelectItem>
                                    <SelectItem value="intermediate">
                                      Intermediate
                                    </SelectItem>
                                    <SelectItem value="expert">
                                      Expert
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSkill(index)}
                              className="mt-2 text-red-500 hover:text-red-700 hover:bg-red-100"
                              aria-label={`Remove Skill ${index + 1}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator className="my-8" />

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label
                          htmlFor="department"
                          className="text-sm font-medium"
                        >
                          Department
                        </Label>
                        <Select
                          onValueChange={(value) =>
                            setValue("department", value)
                          }
                        >
                          <SelectTrigger
                            id="department"
                            aria-label="Department"
                            className="border-gray-300 focus:border-[#31876d] focus:ring focus:ring-[#31876d] focus:ring-opacity-50 "
                          >
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="software">
                              Software Engineering
                            </SelectItem>
                            <SelectItem value="data">Data Science</SelectItem>
                            <SelectItem value="business">
                              Business Analysis
                            </SelectItem>
                            <SelectItem value="project">
                              Project Management
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Preferred Work Type
                        </Label>
                        <Select
                          onValueChange={(value) => {
                            const currentTypes =
                              getValues("preferredWorkTypes") || [];
                            if (!currentTypes.includes(value)) {
                              setValue("preferredWorkTypes", [
                                ...currentTypes,
                                value,
                              ]);
                            }
                          }}
                        >
                          <SelectTrigger
                            aria-label="Preferred Work Type"
                            className="border-gray-300 focus:border-[#31876d] focus:ring focus:ring-[#31876d] focus:ring-opacity-50"
                          >
                            <SelectValue placeholder="Select work type" />
                          </SelectTrigger>
                          <SelectContent>
                            {["remote", "onsite", "hybrid"].map((type) => {
                              const currentTypes =
                                getValues("preferredWorkTypes") || [];
                              const isDisabled = currentTypes.includes(type);
                              return (
                                <SelectItem
                                  key={type}
                                  value={type}
                                  disabled={isDisabled}
                                >
                                  {type.charAt(0).toUpperCase() + type.slice(1)}
                                  {isDisabled && " (Selected)"}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>

                        {/* Display selected work types */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {getValues("preferredWorkTypes")?.map(
                            (type, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="flex items-center gap-1 bg-[#31876d]/10"
                              >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 hover:bg-transparent text-[#31876d] hover:text-[#31876d]/80"
                                  onClick={() => {
                                    const currentTypes =
                                      getValues("preferredWorkTypes");
                                    setValue(
                                      "preferredWorkTypes",
                                      currentTypes.filter((_, i) => i !== index)
                                    );
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            )
                          )}
                        </div>
                        {errors.preferredWorkTypes && (
                          <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.preferredWorkTypes.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label
                          htmlFor="hourlyRate"
                          className="text-sm font-medium"
                        >
                          Hourly Rate (KES)
                        </Label>
                        <Input
                          id="hourlyRate"
                          type="number"
                          aria-label="Hourly Rate"
                          {...register("hourlyRate", { required: true })}
                          className="border-gray-300 focus:border-[#31876d] focus:ring focus:ring-[#31876d] focus:ring-opacity-50 "
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-8">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-[#31876d]">
                          Education
                        </h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            appendEducation({
                              institution: "",
                              qualification: "",
                              yearOfCompletion: "",
                            })
                          }
                          className="bg-[#31876d]  flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" /> Add Education
                        </Button>
                      </div>
                      {educationFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="space-y-4 p-4  rounded-lg mb-4"
                        >
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                Institution
                              </Label>
                              <Input
                                {...register(
                                  `education.${index}.institution` as const
                                )}
                                aria-label={`Institution for Education ${
                                  index + 1
                                }`}
                                className="border-gray-300 focus:border-[#31876d] focus:ring focus:ring-[#31876d] focus:ring-opacity-50 "
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                Year of Completion
                              </Label>
                              <Input
                                type="number"
                                {...register(
                                  `education.${index}.yearOfCompletion` as const
                                )}
                                aria-label={`Year of Completion for Education ${
                                  index + 1
                                }`}
                                className="border-gray-300 focus:border-[#31876d] focus:ring focus:ring-[#31876d] focus:ring-opacity-50 "
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Qualification
                            </Label>
                            <Input
                              {...register(
                                `education.${index}.qualification` as const
                              )}
                              aria-label={`Qualification for Education ${
                                index + 1
                              }`}
                              className="border-gray-300 focus:border-[#31876d] focus:ring focus:ring-[#31876d] focus:ring-opacity-50 "
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEducation(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-100"
                            aria-label={`Remove Education ${index + 1}`}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Remove
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-8" />

                    <div>
                      <h3 className="text-lg font-medium text-[#31876d] mb-4">
                        Document Upload
                      </h3>
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">CV</Label>
                          <FileUpload
                            onChange={(files) => {
                              console.log("CV updated:", files);
                              setCvDocument(files);
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Academic Certificates
                          </Label>
                          <FileUpload
                            onChange={(files) => {
                              console.log(
                                "Academic Certificates updated:",
                                files
                              );
                              setCertificatesCopy(files);
                            }}
                          />
                        </div>
                      </div>
                      {/* <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">National ID Copy *</Label>
                          <FileUpload
                            onChange={(files) => {
                              console.log('National ID copy updated:', files);
                              setNationalIdCopy(files);
                            }}
                          />
                          {nationalIdCopy[0] && (
                            <p className="text-xs text-muted-foreground">
                              Selected: {nationalIdCopy[0].name}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">KRA PIN Copy *</Label>
                          <FileUpload
                            onChange={(files) => {
                              console.log('KRA PIN copy updated:', files);
                              setKraPinCopy(files);
                            }}
                          />
                          {kraPinCopy[0] && (
                            <p className="text-xs text-muted-foreground">
                              Selected: {kraPinCopy[0].name}
                            </p>
                          )}
                        </div>
                      </div> */}
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex space-x-4 mb-6">
                        <Button
                          type="button"
                          variant="outline"
                          className={`flex-1 ${
                            paymentMethod === "bank" ? "bg-[#31876d] " : ""
                          }`}
                          onClick={() => setPaymentMethod("bank")}
                        >
                          Bank Transfer
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className={`flex-1 ${
                            paymentMethod === "mpesa" ? "bg-[#31876d] " : ""
                          }`}
                          onClick={() => setPaymentMethod("mpesa")}
                        >
                          M-Pesa
                        </Button>
                      </div>

                      {paymentMethod === "bank" ? (
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-[#31876d]">
                            Bank Details
                          </h3>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                Bank Name
                              </Label>
                              <Input
                                {...register("bankDetails.bankName")}
                                aria-label="Bank Name"
                                className="border-gray-300 focus:border-[#31876d] focus:ring focus:ring-[#31876d] focus:ring-opacity-50 "
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                Account Number
                              </Label>
                              <Input
                                {...register("bankDetails.accountNumber")}
                                aria-label="Account Number"
                                className="border-gray-300 focus:border-[#31876d] focus:ring focus:ring-[#31876d] focus:ring-opacity-50 "
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                Branch Code
                              </Label>
                              <Input
                                {...register("bankDetails.branchCode")}
                                aria-label="Branch Code"
                                className="border-gray-300 focus:border-[#31876d] focus:ring focus:ring-[#31876d] focus:ring-opacity-50 "
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-[#31876d]">
                            M-Pesa Details
                          </h3>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Phone Number
                            </Label>
                            <Input
                              {...register("mpesaDetails.phoneNumber")}
                              aria-label="M-Pesa Phone Number"
                              className="border-gray-300 focus:border-[#31876d] focus:ring focus:ring-[#31876d] focus:ring-opacity-50 "
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={step === 1}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                  {step < totalSteps ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="bg-[#31876d] hover:bg-[#31876d]/90 text-white flex items-center gap-2"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      onClick={handleSubmit(onSubmit)}
                      disabled={isLoading}
                      className="bg-[#31876d] hover:bg-[#31876d]/90 text-white"
                    >
                      {isLoading ? (
                        <>
                          Submitting <Spinner variant="ring" />
                        </>
                      ) : (
                        "Submit Registration"
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
