"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { useToast } from "@/hooks/use-toast";
import { registerOrganization } from "@/services/consultant.service";
import { FileUpload } from "@/components/ui/file-upload";
import { Spinner } from "../ui/spinner";
import Header from "./header";
import Footer from "./footer";

interface ContactPerson {
  name: string;
  position: string;
  email: string;
  phoneNumber: string;
  alternativePhoneNumber?: string;
}

interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchCode: string;
  swiftCode: string;
}

interface FormData {
  companyName: string;
  registrationNumber: string;
  kraPin: string;
  businessEmail: string;
  businessPhone: string;
  alternativePhoneNumber?: string;
  businessAddress: string;
  postalAddress?: string;
  county: string;
  yearsOfOperation: number;
  hourlyRate: number;
  servicesOffered: string[];
  industries: string[];
  contactPerson: ContactPerson;
  bankDetails: BankDetails;
  registrationCertificate?: File;
  kraCertificate?: File;
  taxComplianceCertificate?: File;
  cr12Document?: File;
  taxComplianceExpiryDate: string;
}

export default function OrganizationRegistrationForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const totalSteps = 4;

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);

      // Validate required files
      const requiredFiles = {
        registrationCertificate: data.registrationCertificate,
        kraCertificate: data.kraCertificate,
        taxComplianceCertificate: data.taxComplianceCertificate,
        cr12Document: data.cr12Document,
      };

      // Check if all required files are present and are PDF
      for (const [key, file] of Object.entries(requiredFiles)) {
        if (!file) {
          toast({
            title: "Missing Required File",
            description: `${key
              .replace(/([A-Z])/g, " $1")
              .toLowerCase()} is required`,
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        if (file.type !== "application/pdf") {
          toast({
            title: "Invalid File Type",
            description: `${key
              .replace(/([A-Z])/g, " $1")
              .toLowerCase()} must be a PDF file`,
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File Too Large",
            description: `${key
              .replace(/([A-Z])/g, " $1")
              .toLowerCase()} must be less than 5MB`,
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      const formData = new FormData();

      // Append all files
      Object.entries(requiredFiles).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });

      // Required fields from schema
      const requiredFields = {
        companyName: data.companyName,
        registrationNumber: data.registrationNumber,
        kraPin: data.kraPin,
        businessAddress: data.businessAddress,
        county: data.county,
        businessPhone: data.businessPhone,
        businessEmail: data.businessEmail,
        yearsOfOperation: Number(data.yearsOfOperation),
        hourlyRate: Number(data.hourlyRate),
        servicesOffered: data.servicesOffered || [],
        industries: data.industries || [],
        preferredWorkTypes: ["remote", "onsite", "hybrid"],
        taxComplianceExpiryDate: data.taxComplianceExpiryDate,
        contactPerson: {
          name: data.contactPerson?.name,
          position: data.contactPerson?.position,
          email: data.contactPerson?.email,
          phoneNumber: data.contactPerson?.phoneNumber,
        },
        bankDetails: {
          bankName: data.bankDetails?.bankName,
          accountName: data.bankDetails?.accountName,
          accountNumber: data.bankDetails?.accountNumber,
          branchCode: data.bankDetails?.branchCode,
        },
      };

      // Validate all required fields
      const missingFields = [];
      for (const [key, value] of Object.entries(requiredFields)) {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          missingFields.push(key);
        }
      }

      if (missingFields.length > 0) {
        toast({
          title: "Missing Required Fields",
          description: `Please fill in: ${missingFields
            .map((field) => field.replace(/([A-Z])/g, " $1").toLowerCase())
            .join(", ")}`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Append all form fields
      Object.entries(requiredFields).forEach(([key, value]) => {
        if (key === "contactPerson" || key === "bankDetails") {
          formData.append(key, JSON.stringify(value));
        } else if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      });

      // Optional fields
      if (data.postalAddress)
        formData.append("postalAddress", data.postalAddress);
      if (data.website) formData.append("website", data.website);
      if (data.department) formData.append("department", data.department);

      const response = await registerOrganization(formData);

      toast({
        title: "Success",
        description:
          "Organization registration successful. Pending admin approval.",
      });

      setStep(1);
      reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Something went wrong during registration",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep = () => {
    if (step === 1) {
      const fields = [
        { name: "companyName" as const, label: "Company Name" },
        { name: "registrationNumber" as const, label: "Registration Number" },
        { name: "kraPin" as const, label: "KRA PIN" },
        { name: "businessEmail" as const, label: "Business Email" },
        { name: "businessPhone" as const, label: "Business Phone" },
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

      // Validate email format
      const email = getValues("businessEmail");
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        return false;
      }

      // Validate phone format (Kenyan format)
      const phone = getValues("businessPhone");
      const phoneRegex = /^254[17]\d{8}$/;
      if (!phoneRegex.test(phone)) {
        toast({
          title: "Invalid Phone Number",
          description:
            "Please enter a valid Kenyan phone number (e.g., 254712345678)",
          variant: "destructive",
        });
        return false;
      }

      return true;
    }

    if (step === 2) {
      const fields = [
        { name: "businessAddress" as const, label: "Business Address" },
        { name: "county" as const, label: "County" },
        { name: "yearsOfOperation" as const, label: "Years of Operation" },
        { name: "hourlyRate" as const, label: "Hourly Rate" },
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

      // Validate numeric fields
      const yearsOfOperation = Number(getValues("yearsOfOperation"));
      const hourlyRate = Number(getValues("hourlyRate"));

      if (isNaN(yearsOfOperation) || yearsOfOperation < 0) {
        toast({
          title: "Invalid Years of Operation",
          description: "Years of operation must be a positive number",
          variant: "destructive",
        });
        return false;
      }

      if (isNaN(hourlyRate) || hourlyRate <= 0) {
        toast({
          title: "Invalid Hourly Rate",
          description: "Hourly rate must be greater than 0",
          variant: "destructive",
        });
        return false;
      }

      return true;
    }

    if (step === 3) {
      const servicesOffered = getValues("servicesOffered");
      const industries = getValues("industries");
      const contactPerson = getValues("contactPerson");

      if (!servicesOffered?.length || !industries?.length) {
        toast({
          title: "Missing Required Fields",
          description: "Please select at least one service and industry",
          variant: "destructive",
        });
        return false;
      }

      if (
        !contactPerson?.name ||
        !contactPerson?.email ||
        !contactPerson?.phoneNumber
      ) {
        toast({
          title: "Missing Contact Person Details",
          description: "Please fill in all required contact person details",
          variant: "destructive",
        });
        return false;
      }

      // Validate contact person email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactPerson.email)) {
        toast({
          title: "Invalid Contact Person Email",
          description:
            "Please enter a valid email address for the contact person",
          variant: "destructive",
        });
        return false;
      }

      return true;
    }

    if (step === 4) {
      const files = {
        registrationCertificate: getValues("registrationCertificate"),
        kraCertificate: getValues("kraCertificate"),
        taxComplianceCertificate: getValues("taxComplianceCertificate"),
        cr12Document: getValues("cr12Document"),
      };

      // Check if all required files are uploaded
      const missingFiles = Object.entries(files)
        .filter(([_, file]) => !file)
        .map(([key]) => key.replace(/([A-Z])/g, " $1").toLowerCase());

      if (missingFiles.length > 0) {
        toast({
          title: "Missing Required Files",
          description: `Please upload: ${missingFiles.join(", ")}`,
          variant: "destructive",
        });
        return false;
      }

      // Validate file sizes (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      const oversizedFiles = Object.entries(files)
        .filter(([_, file]) => file && file.size > maxSize)
        .map(([key]) => key.replace(/([A-Z])/g, " $1").toLowerCase());

      if (oversizedFiles.length > 0) {
        toast({
          title: "Files Too Large",
          description: `These files exceed 5MB limit: ${oversizedFiles.join(
            ", "
          )}`,
          variant: "destructive",
        });
        return false;
      }

      // Validate tax compliance expiry date
      const expiryDate = getValues("taxComplianceExpiryDate");
      if (!expiryDate) {
        toast({
          title: "Missing Expiry Date",
          description:
            "Please enter the tax compliance certificate expiry date",
          variant: "destructive",
        });
        return false;
      }

      const today = new Date();
      const expiry = new Date(expiryDate);
      if (expiry <= today) {
        toast({
          title: "Invalid Expiry Date",
          description: "Tax compliance certificate must not be expired",
          variant: "destructive",
        });
        return false;
      }

      // Validate bank details
      const bankDetails = getValues("bankDetails");
      if (
        !bankDetails?.bankName ||
        !bankDetails?.accountName ||
        !bankDetails?.accountNumber ||
        !bankDetails?.branchCode
      ) {
        toast({
          title: "Missing Bank Details",
          description: "Please fill in all required bank details",
          variant: "destructive",
        });
        return false;
      }

      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step < totalSteps) {
        setStep(step + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold">Organization Registration</h1>
            <p className="mt-2 text-gray-600">
              Register your organization as a consultant with SRCC
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
                              ? "bg-[#31876d] text-white"
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
                <span>Basic Info</span>
                <span>Address & Rates</span>
                <span>Services</span>
                <span>Documents</span>
              </div>
            </div>
          </div>

          <Card className="shadow-lg border-t-4 border-t-[#31876d]">
            <div className="border-b p-3">
              <CardTitle className="text-2xl text-[#31876d] font-bold">
                {step === 1
                  ? "Basic Information"
                  : step === 2
                  ? "Address & Financial Details"
                  : step === 3
                  ? "Services & Contact Person"
                  : "Documents"}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {step === 1
                  ? "Provide your organization's basic details"
                  : step === 2
                  ? "Enter address and financial information"
                  : step === 3
                  ? "Specify services and contact person details"
                  : "Upload required documents"}
              </CardDescription>
            </div>

            <CardContent>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6 mt-4"
              >
                {/* Step 1: Basic Information */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="companyName">Company Name *</Label>
                        <Input
                          {...register("companyName", { required: true })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="registrationNumber">
                          Registration Number *
                        </Label>
                        <Input
                          {...register("registrationNumber", {
                            required: true,
                          })}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="kraPin">KRA PIN *</Label>
                        <Input
                          {...register("kraPin", { required: true })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="businessEmail">Business Email *</Label>
                        <Input
                          type="email"
                          {...register("businessEmail", { required: true })}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="businessPhone">Business Phone *</Label>
                        <Input
                          {...register("businessPhone", { required: true })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="alternativePhoneNumber">
                          Alternative Phone
                        </Label>
                        <Input
                          {...register("alternativePhoneNumber")}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Address & Financial Details */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="businessAddress">
                          Business Address *
                        </Label>
                        <Input
                          {...register("businessAddress", { required: true })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="postalAddress">Postal Address</Label>
                        <Input
                          {...register("postalAddress")}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="county">County *</Label>
                        <Select
                          onValueChange={(value) => setValue("county", value)}
                        >
                          <SelectTrigger className="mt-1">
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
                      <div>
                        <Label htmlFor="yearsOfOperation">
                          Years of Operation *
                        </Label>
                        <Input
                          type="number"
                          {...register("yearsOfOperation", {
                            required: true,
                            min: 0,
                          })}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="hourlyRate">Hourly Rate (KES) *</Label>
                      <Input
                        type="number"
                        {...register("hourlyRate", { required: true, min: 0 })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Services & Contact Person */}
                {step === 3 && (
                  <div className="space-y-4">
                    {/* Services Offered */}
                    <div>
                      <Label>Services Offered *</Label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {[
                          "Software Development",
                          "IT Consulting",
                          "Cloud Solutions",
                          "Cybersecurity",
                          "Data Analytics",
                          "Project Management",
                        ].map((service) => (
                          <label
                            key={service}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              value={service}
                              onChange={(e) => {
                                const current =
                                  getValues("servicesOffered") || [];
                                if (e.target.checked) {
                                  setValue("servicesOffered", [
                                    ...current,
                                    service,
                                  ]);
                                } else {
                                  setValue(
                                    "servicesOffered",
                                    current.filter((s) => s !== service)
                                  );
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <span>{service}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Industries */}
                    <div>
                      <Label>Industries *</Label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {[
                          "Technology",
                          "Finance",
                          "Healthcare",
                          "Education",
                          "Manufacturing",
                          "Retail",
                        ].map((industry) => (
                          <label
                            key={industry}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              value={industry}
                              onChange={(e) => {
                                const current = getValues("industries") || [];
                                if (e.target.checked) {
                                  setValue("industries", [
                                    ...current,
                                    industry,
                                  ]);
                                } else {
                                  setValue(
                                    "industries",
                                    current.filter((i) => i !== industry)
                                  );
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <span>{industry}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Contact Person */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Contact Person Details</h3>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="contactPersonName">Name *</Label>
                          <Input
                            {...register("contactPerson.name", {
                              required: true,
                            })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="contactPersonPosition">
                            Position *
                          </Label>
                          <Input
                            {...register("contactPerson.position", {
                              required: true,
                            })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="contactPersonEmail">Email *</Label>
                          <Input
                            type="email"
                            {...register("contactPerson.email", {
                              required: true,
                            })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="contactPersonPhone">Phone *</Label>
                          <Input
                            {...register("contactPerson.phoneNumber", {
                              required: true,
                            })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Documents */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <Label>Registration Certificate (PDF) *</Label>
                        <FileUpload
                          onChange={(files) => {
                            setValue("registrationCertificate", files[0]);
                          }}
                        />
                      </div>
                      <div>
                        <Label>KRA Certificate (PDF) *</Label>
                        <FileUpload
                          onChange={(files) => {
                            setValue("kraCertificate", files[0]);
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <Label>Tax Compliance Certificate (PDF) *</Label>
                        <FileUpload
                          onChange={(files) => {
                            setValue("taxComplianceCertificate", files[0]);
                          }}
                        />
                      </div>
                      <div>
                        <Label>CR12 Document (PDF) *</Label>
                        <FileUpload
                          onChange={(files) => {
                            setValue("cr12Document", files[0]);
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Tax Compliance Expiry Date *</Label>
                      <Input
                        type="date"
                        {...register("taxComplianceExpiryDate", {
                          required: true,
                        })}
                        className="mt-1"
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">Bank Details</h3>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <Label>Bank Name *</Label>
                          <Input
                            {...register("bankDetails.bankName", {
                              required: true,
                            })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Account Name *</Label>
                          <Input
                            {...register("bankDetails.accountName", {
                              required: true,
                            })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <Label>Account Number *</Label>
                          <Input
                            {...register("bankDetails.accountNumber", {
                              required: true,
                            })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Branch Code *</Label>
                          <Input
                            {...register("bankDetails.branchCode", {
                              required: true,
                            })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>SWIFT Code</Label>
                        <Input
                          {...register("bankDetails.swiftCode")}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-8">
                  {step > 1 && (
                    <Button
                      type="button"
                      onClick={handlePrevious}
                      variant="outline"
                      className="w-32"
                    >
                      Previous
                    </Button>
                  )}
                  {step < totalSteps ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="w-32 ml-auto"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="w-32 ml-auto"
                      disabled={isSubmitting}
                      onClick={handleSubmit(onSubmit)}
                    >
                      {isSubmitting ? <Spinner /> : "Submit"}
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
