"use client"

import { useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, ChevronRight, Upload, Plus, Trash2, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import Header from "./header"
import Footer from "./footer"
import { useToast } from "@/hooks/use-toast"
import { registerConsultant } from "@/services/consultant.service"
import { FileUpload } from "@/components/ui/file-upload"
import { cn } from "@/lib/utils"

interface SkillField {
  name: string
  yearsOfExperience: number
  proficiencyLevel: string
}

interface EducationField {
  institution: string
  qualification: string
  yearOfCompletion: string
}

interface CertificationField {
  name: string
  issuingOrganization: string
  dateIssued: string
  expiryDate: string
  certificationId: string
}

interface ExperienceField {
  company: string
  position: string
  startDate: Date
  endDate: Date
  responsibilities: string
}

interface FormData {
  firstName: string
  lastName: string
  middleName: string
  nationalId: string
  kraPinNumber: string
  nhifNumber: string
  nssfNumber: string
  phoneNumber: string
  alternativePhoneNumber: string
  email: string
  password: string
  dateOfBirth: string
  physicalAddress: string
  postalAddress: string
  county: string
  department: string
  yearsOfExperience: number
  hourlyRate: number
  nhifDeduction: number
  nssfDeduction: number
  workType: string
  availability: string
  emergencyContact: {
    name: string
    relationship: string
    phoneNumber: string
    alternativePhoneNumber: string
  }
  bankDetails: {
    bankName: string
    accountNumber: string
    branchCode: string
  }
  mpesaDetails: {
    phoneNumber: string
  }
  skills: SkillField[]
  education: EducationField[]
  certifications: CertificationField[]
  experience: ExperienceField[]
}


export default function ConsultantRegistrationForm() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'mpesa'>('bank')

  // Add states for file uploads
  const [cvDocument, setCvDocument] = useState<File[]>([]);
  const [certificatesCopy, setCertificatesCopy] = useState<File[]>([]);

  const { toast } = useToast()

  const defaultValues: FormData = {
    firstName: "",
    lastName: "",
    middleName: "",
    nationalId: "",
    kraPinNumber: "",
    nhifNumber: "",
    nssfNumber: "",
    phoneNumber: "",
    alternativePhoneNumber: "",
    email: "",
    password: "",
    dateOfBirth: "",
    physicalAddress: "",
    postalAddress: "",
    county: "",
    department: "",
    yearsOfExperience: 0,
    hourlyRate: 0,
    nhifDeduction: 0,
    nssfDeduction: 0,
    workType: "",
    availability: "",
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
    skills: [{ name: "", yearsOfExperience: 0, proficiencyLevel: "" }],
    education: [{ institution: "", qualification: "", yearOfCompletion: "" }],
    certifications: [{ name: "", issuingOrganization: "", dateIssued: "", expiryDate: "", certificationId: "" }],
    experience: [{ company: "", position: "", startDate: new Date(), endDate: new Date(), responsibilities: "" }],
  };

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues,
  })

  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({
    control,
    name: "skills",
  })

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    control,
    name: "education",
  })

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({
    control,
    name: "experience",
  })

  const totalSteps = 5

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)

      // Validate required fields
      if (!data.physicalAddress || !data.county || !data.department) {
        const missingFields = [];
        if (!data.physicalAddress) missingFields.push('Physical Address');
        if (!data.county) missingFields.push('County');
        if (!data.department) missingFields.push('Department');

        toast({
          title: "Validation Error",
          description: `Please fill in the following required fields: ${missingFields.join(', ')}`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Create FormData object for file upload
      const formData = new FormData();

      // Append CV document if exists
      if (cvDocument.length > 0) {
        formData.append('cv', cvDocument[0]);
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
          formData.append('academicCertificateFiles', cert);
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
      const academicCertificatesMetadata = certificatesCopy.map((cert, index) => ({
        name: `Certificate ${index + 1}`,
        institution: data.education[index]?.institution || 'Unknown Institution',
        yearOfCompletion: data.education[index]?.yearOfCompletion || new Date().getFullYear().toString()
      }));

      // Append the rest of the form data
      Object.keys(data).forEach(key => {
        if (key !== 'cv' && key !== 'certificates') {
          // Add academic certificates metadata
          if (key === 'education') {
            formData.append('academicCertificates', JSON.stringify(academicCertificatesMetadata));
          }

          // Handle arrays and objects properly
          const value = (data as Record<string, any>)[key];
          if (typeof value === 'string') {
            // Remove extra quotes from strings
            formData.append(key, value);
          } else {
            // For arrays and objects, stringify without extra quotes
            formData.append(key, JSON.stringify(value));
          }
        }
      });

      // Validate required arrays are not empty
      const formDataObj = Object.fromEntries(formData.entries());
      if (!JSON.parse(formDataObj.skills as string)?.length) {
        toast({
          title: "Skills Required",
          description: "Please add at least one skill",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!JSON.parse(formDataObj.education as string)?.length) {
        toast({
          title: "Education Required",
          description: "Please add at least one education entry",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const response = await registerConsultant(formData)

      toast({
        title: "Success",
        description: "Consultant registration successful",
      })

      // Reset form or redirect
      setStep(1)
      setIsLoading(false)
    } catch (error: any) {
      setIsLoading(false)
      toast({
        title: "Error",
        description: error.message || "Something went wrong during registration",
        variant: "destructive",
      })
    }
  };

  const setStepWithScroll = (newStep: number) => {
    setStep(newStep)
    // window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 light">
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#1B4D3E]">Consultant Registration</h1>
            <p className="mt-2 text-gray-600">Join SRCC&apos;s network of professional consultants</p>
          </div>

          <div className="mb-12">
            <div className="relative">
              <div className="overflow-hidden mb-4">
                <div className="flex justify-between">
                  {Array.from({ length: totalSteps }).map((_, index) => (
                    <div key={index} className="flex-1 relative p-3">
                      <div
                        className={`h-2 ${step > index + 1 ? "bg-[#B7BE00]" : step === index + 1 ? "bg-[#1B4D3E]" : "bg-gray-200"}`}
                      />
                      <div
                        className={`
                        absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                        rounded-full h-8 w-8 flex items-center justify-center text-sm font-semibold
                        ${step > index + 1
                            ? "bg-[#B7BE00] text-[#1B4D3E]"
                            : step === index + 1
                              ? "bg-[#1B4D3E] text-white"
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

          <Card className="shadow-lg border-t-4 border-t-[#1B4D3E] bg-gray-50">
            <div className="bg-gray-50 border-b p-3">
              <CardTitle className="text-2xl text-[#1B4D3E] font-bold">
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
              <div className="mb-4 text-sm font-medium text-gray-500 mt-2">
                Step {step} of {totalSteps}
              </div>
              <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          aria-label="First Name"
                          {...register("firstName", { required: "First name is required" })}
                          className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
                        />
                        {errors.firstName && (
                          <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="middleName" className="text-sm font-medium text-gray-700">
                          Middle Name
                        </Label>
                        <Input
                          id="middleName"
                          aria-label="Middle Name"
                          {...register("middleName")}
                          className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          aria-label="Last Name"
                          {...register("lastName", { required: "Last name is required" })}
                          className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
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
                        <Label htmlFor="nationalId" className="text-sm font-medium text-gray-700">
                          National ID
                        </Label>
                        <Input
                          id="nationalId"
                          aria-label="National ID"
                          {...register("nationalId", { required: true })}
                          className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
                          Date of Birth *
                        </Label>
                        <Input
                          type="date"
                          {...register("dateOfBirth", { required: true })}
                          className={cn(
                            "w-full px-3 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50",
                            errors.dateOfBirth
                              ? "border-red-500 focus:border-red-500"
                              : "border-gray-300 focus:border-green-500"
                          )}
                        />
                        {errors.dateOfBirth && (
                          <p className="text-sm text-red-500">
                            Date of birth is required (YYYY-MM-DD)
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="yearsOfExperience" className="text-sm font-medium text-gray-700">
                          Years of work Experience
                        </Label>
                        <Input
                          id="yearsOfExperience"
                          aria-label="Years of Experience"
                          {...register("yearsOfExperience", { required: true })}
                          className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="kraPinNumber" className="text-sm font-medium text-gray-700">
                          KRA PIN Number
                        </Label>
                        <Input
                          id="kraPinNumber"
                          aria-label="KRA PIN Number"
                          {...register("kraPinNumber", { required: true })}
                          className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nhifNumber" className="text-sm font-medium text-gray-700">
                          NHIF Number
                        </Label>
                        <Input
                          id="nhifNumber"
                          aria-label="NHIF Number"
                          {...register("nhifNumber", { required: true })}
                          className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nssfNumber" className="text-sm font-medium text-gray-700">
                          NSSF Number
                        </Label>
                        <Input
                          id="nssfNumber"
                          aria-label="NSSF Number"
                          {...register("nssfNumber", { required: true })}
                          className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="county" className="text-sm font-medium text-gray-700">
                          County
                        </Label>
                        <Select onValueChange={(value) => setValue('county', value)}>
                          <SelectTrigger
                            id="county"
                            aria-label="County"
                            className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
                          >
                            <SelectValue placeholder="Select county" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nairobi">Nairobi</SelectItem>
                            <SelectItem value="mombasa">Mombasa</SelectItem>
                            <SelectItem value="kisumu">Kisumu</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                          Password
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          aria-label="Password"
                          {...register("password", { required: true })}
                          className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">

                      {/* Hidden fields with default values */}
                      <input type="hidden" {...register("nhifDeduction")} />
                      <input type="hidden" {...register("nssfDeduction")} />
                      <input type="hidden" {...register("department")} />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          aria-label="Email"
                          {...register("email", { required: true })}
                          className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                          Phone Number
                        </Label>
                        <Input
                          id="phoneNumber"
                          aria-label="Phone Number"
                          {...register("phoneNumber", { required: true })}
                          className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="alternativePhoneNumber" className="text-sm font-medium text-gray-700">
                          Alternative Phone Number
                        </Label>
                        <Input
                          id="alternativePhoneNumber"
                          aria-label="Alternative Phone Number"
                          {...register("alternativePhoneNumber")}
                          className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="county" className="text-sm font-medium text-gray-700">
                          County
                        </Label>
                        <Select onValueChange={(value) => setValue('county', value)}>
                          <SelectTrigger
                            id="county"
                            aria-label="County"
                            className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
                          >
                            <SelectValue placeholder="Select county" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nairobi">Nairobi</SelectItem>
                            <SelectItem value="mombasa">Mombasa</SelectItem>
                            <SelectItem value="kisumu">Kisumu</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="physicalAddress" className="text-sm font-medium text-gray-700">
                        Physical Address
                      </Label>
                      <Input
                        id="physicalAddress"
                        aria-label="Physical Address"
                        {...register("physicalAddress", { required: true })}
                        className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
                      />
                    </div>

                    <Separator className="my-8" />

                    <div>
                      <h3 className="text-lg font-medium text-[#1B4D3E] mb-4">Emergency Contact</h3>
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="emergencyName" className="text-sm font-medium text-gray-700">
                            Contact Name
                          </Label>
                          <Input
                            id="emergencyName"
                            aria-label="Emergency Contact Name"
                            {...register("emergencyContact.name", { required: true })}
                            className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emergencyRelationship" className="text-sm font-medium text-gray-700">
                            Relationship
                          </Label>
                          <Input
                            id="emergencyRelationship"
                            aria-label="Emergency Contact Relationship"
                            {...register("emergencyContact.relationship", { required: true })}
                            className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emergencyPhone" className="text-sm font-medium text-gray-700">
                            Phone Number
                          </Label>
                          <Input
                            id="emergencyPhone"
                            aria-label="Emergency Contact Phone Number"
                            {...register("emergencyContact.phoneNumber", { required: true })}
                            className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emergencyAltPhone" className="text-sm font-medium text-gray-700">
                            Alternative Phone
                          </Label>
                          <Input
                            id="emergencyAltPhone"
                            aria-label="Emergency Contact Alternative Phone"
                            {...register("emergencyContact.alternativePhoneNumber")}
                            className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
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
                        <Label className="text-lg font-medium text-[#1B4D3E]">Skills</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => appendSkill({ name: "", yearsOfExperience: 0, proficiencyLevel: "" })}
                          className="bg-[#1B4D3E] text-white flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" /> Add Skill
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {skillFields.map((field, index) => (
                          <div
                            key={field.id}
                            className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 flex-1">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Skill Name</Label>
                                <Input
                                  placeholder="e.g., Project Management"
                                  aria-label={`Skill Name ${index + 1}`}
                                  {...register(`skills.${index}.name` as const)}
                                  className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Years of Experience</Label>
                                <Input
                                  type="number"
                                  placeholder="e.g., 5"
                                  aria-label={`Years of Experience for Skill ${index + 1}`}
                                  {...register(`skills.${index}.yearsOfExperience` as const)}
                                  className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Proficiency Level</Label>
                                <Select onValueChange={(value) => setValue(`skills.${index}.proficiencyLevel`, value)}>
                                  <SelectTrigger
                                    aria-label={`Proficiency Level for Skill ${index + 1}`}
                                    className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
                                  >
                                    <SelectValue placeholder="Select level" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="beginner">Beginner</SelectItem>
                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                    <SelectItem value="expert">Expert</SelectItem>
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
                        <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                          Department
                        </Label>
                        <Select onValueChange={(value) => setValue('department', value)}>
                          <SelectTrigger
                            id="department"
                            aria-label="Department"
                            className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
                          >
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="software">Software Engineering</SelectItem>
                            <SelectItem value="data">Data Science</SelectItem>
                            <SelectItem value="business">Business Analysis</SelectItem>
                            <SelectItem value="project">Project Management</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="availability" className="text-sm font-medium text-gray-700">
                          Availability
                        </Label>
                        <Select onValueChange={(value) => setValue('availability', value)}>
                          <SelectTrigger
                            id="availability"
                            aria-label="Availability"
                            className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
                          >
                            <SelectValue placeholder="Select availability" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="busy">Busy</SelectItem>
                            <SelectItem value="unavailable">Unavailable</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="hourlyRate" className="text-sm font-medium text-gray-700">
                          Hourly Rate (KES)
                        </Label>
                        <Input
                          id="hourlyRate"
                          type="number"
                          aria-label="Hourly Rate"
                          {...register("hourlyRate", { required: true })}
                          className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Preferred Work Types</Label>
                        <Select onValueChange={(value) => setValue('workType', value)}>
                          <SelectTrigger
                            aria-label="Preferred Work Types"
                            className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
                          >
                            <SelectValue placeholder="Select work type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="remote">Remote</SelectItem>
                            <SelectItem value="onsite">On-site</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <Label className="text-lg font-medium text-[#1B4D3E]">Experience</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          appendExperience({
                            company: "",
                            position: "",
                            startDate: new Date(),
                            endDate: new Date(),
                            responsibilities: "",
                          })
                        }
                        className="bg-[#1B4D3E] text-white flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" /> Add Experience
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {experienceFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 flex-1">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Company</Label>
                              <Input
                                placeholder="e.g., ABC Corporation"
                                aria-label={`Company for Experience ${index + 1}`}
                                {...register(`experience.${index}.company` as const)}
                                className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Position</Label>
                              <Input
                                placeholder="e.g., Software Engineer"
                                aria-label={`Position for Experience ${index + 1}`}
                                {...register(`experience.${index}.position` as const)}
                                className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 flex-1">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Start Date</Label>
                              <Input
                                type="date"
                                aria-label="Start Date"
                                className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900 bg-[#1B4D3E] text-white h-10"
                                value={format(field.startDate, "yyyy-MM-dd")}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    setValue(`experience.${index}.startDate`, new Date(e.target.value));
                                  }
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">End Date</Label>
                              <Input
                                type="date"
                                aria-label="End Date"
                                className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900 bg-[#1B4D3E] text-white h-10"
                                value={format(field.endDate, "yyyy-MM-dd")}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    setValue(`experience.${index}.endDate`, new Date(e.target.value));
                                  }
                                }}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Responsibilities</Label>
                            <Input
                              placeholder="e.g., Team Lead, Project Manager"
                              aria-label={`Responsibilities for Experience ${index + 1}`}
                              {...register(`experience.${index}.responsibilities` as const)}
                              className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExperience(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-100"
                            aria-label={`Remove Experience ${index + 1}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-8">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-[#1B4D3E]">Education</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => appendEducation({ institution: "", qualification: "", yearOfCompletion: "" })}
                          className="bg-[#1B4D3E] text-white flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" /> Add Education
                        </Button>
                      </div>
                      {educationFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="space-y-4 p-4 bg-gray-50 rounded-lg mb-4"
                        >
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Institution</Label>
                              <Input
                                {...register(`education.${index}.institution` as const)}
                                aria-label={`Institution for Education ${index + 1}`}
                                className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Year of Completion</Label>
                              <Input
                                type="number"
                                {...register(`education.${index}.yearOfCompletion` as const)}
                                aria-label={`Year of Completion for Education ${index + 1}`}
                                className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Qualification</Label>
                            <Input
                              {...register(`education.${index}.qualification` as const)}
                              aria-label={`Qualification for Education ${index + 1}`}
                              className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
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
                      <h3 className="text-lg font-medium text-[#1B4D3E] mb-4">Document Upload</h3>
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">CV</Label>
                          <FileUpload
                            onChange={(files) => {
                              console.log('CV updated:', files);
                              setCvDocument(files);
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Academic Certificates</Label>
                          <FileUpload
                            onChange={(files) => {
                              console.log('Academic Certificates updated:', files);
                              setCertificatesCopy(files);
                            }}
                          />
                        </div>
                      </div>
                      {/* <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">National ID Copy *</Label>
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
                          <Label className="text-sm font-medium text-gray-700">KRA PIN Copy *</Label>
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
                          className={`flex-1 ${paymentMethod === 'bank' ? 'bg-[#1B4D3E] text-white' : 'bg-white text-gray-700'}`}
                          onClick={() => setPaymentMethod('bank')}
                        >
                          Bank Transfer
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className={`flex-1 ${paymentMethod === 'mpesa' ? 'bg-[#1B4D3E] text-white' : 'bg-white text-gray-700'}`}
                          onClick={() => setPaymentMethod('mpesa')}
                        >
                          M-Pesa
                        </Button>
                      </div>

                      {paymentMethod === 'bank' ? (
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-[#1B4D3E]">Bank Details</h3>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Bank Name</Label>
                              <Input
                                {...register("bankDetails.bankName")}
                                aria-label="Bank Name"
                                className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Account Number</Label>
                              <Input
                                {...register("bankDetails.accountNumber")}
                                aria-label="Account Number"
                                className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Branch Code</Label>
                              <Input
                                {...register("bankDetails.branchCode")}
                                aria-label="Branch Code"
                                className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-[#1B4D3E]">M-Pesa Details</h3>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                            <Input
                              {...register("mpesaDetails.phoneNumber")}
                              aria-label="M-Pesa Phone Number"
                              className="border-gray-300 focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 text-gray-900"
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
                    onClick={() => setStepWithScroll(step > 1 ? step - 1 : 1)}
                    disabled={step === 1}
                    className="bg-[#1B4D3E] text-white flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                  {step < totalSteps ? (
                    <Button
                      type="button"
                      onClick={() => setStepWithScroll(step < totalSteps ? step + 1 : totalSteps)}
                      className="bg-[#1B4D3E] text-white flex items-center gap-2"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      className="bg-[#B7BE00] text-[#1B4D3E] font-semibold"
                      disabled={isLoading}
                      type="button"
                      onClick={() => handleSubmit(onSubmit)()}
                    >
                      {isLoading ? (
                        <>
                          <span className="loading loading-spinner loading-sm mr-2"></span>
                          Submitting...
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
  )
}
