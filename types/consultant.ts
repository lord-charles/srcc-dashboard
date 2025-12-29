export interface Skill {
  name: string
  yearsOfExperience: number
  proficiencyLevel: "Beginner" | "Intermediate" | "Expert"
}

export interface AcademicCertificate {
  name: string
  institution: string
  yearOfCompletion: string
  documentUrl: string
}

export interface BankDetails {
  bankName?: string
  accountNumber?: string
  branchCode?: string
}

export interface MpesaDetails {
  phoneNumber?: string
}

export interface EmergencyContact {
  name: string
  relationship: string
  phoneNumber: string
  alternativePhoneNumber?: string
}

export interface ConsultantData {
  _id?: string
  firstName?: string
  lastName?: string
  middleName?: string
  email: string
  phoneNumber: string
  alternativePhoneNumber?: string
  nationalId: string
  kraPinNumber?: string
  nhifNumber?: string
  nssfNumber?: string
    status?: "pending" | "active" | "inactive" | "suspended" | "terminated";
  registrationStatus?: "quick" | "complete";
  dateOfBirth?: string
  physicalAddress?: string
  postalAddress?: string
  county?: string
  skills?: Skill[]
  cvUrl?: string
  academicCertificates?: AcademicCertificate[]
  yearsOfExperience?: number
  availability?: "available" | "partially_available" | "not_available"
  preferredWorkTypes?: ("remote" | "onsite" | "hybrid")[]
  position?: string
  department?: string
  emergencyContact?: EmergencyContact
  bankDetails?: BankDetails
  mpesaDetails?: MpesaDetails
  profileCompletionPercentage?: number
  lastUpdated?: string
  createdAt?: string
}

export interface ConsultantContextType {
  consultantId: string;
  data: ConsultantData
  loading: boolean
  saving: boolean
  completionPercentage: number
  missingFields: string[]
  updateSection: (sectionData: Partial<ConsultantData>) => Promise<void>
  uploadFile: (file: File, field: string) => Promise<string>
  refreshData: () => Promise<void>
}
