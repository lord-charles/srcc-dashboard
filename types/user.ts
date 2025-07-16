export interface BankDetails {
  bankName?: string;
  accountNumber?: string;
  branchCode?: string;
}

export interface MpesaDetails {
  phoneNumber?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  alternativePhoneNumber?: string;
}

export interface Skill {
  name: string;
  yearsOfExperience: string | number;
  proficiencyLevel: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface Education {
  institution: string;
  qualification: string;
  yearOfCompletion: string;
}

export interface Certification {
  name: string;
  issuingOrganization: string;
  certificationId: string;
}

export interface AcademicCertificate {
  documentUrl: string;
}

export type UserStatus = "active" | "pending" | "rejected" | "suspended";
export type UserRole = "consultant" | "admin" | "hr" | "finance";
export type Availability = "available" | "unavailable" | "busy";

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phoneNumber: string;
  alternativePhoneNumber?: string;
  nationalId: string;
  kraPinNumber?: string;
  nhifNumber?: string;
  nssfNumber?: string;
  status: UserStatus;
  dateOfBirth?: string | Date;
  physicalAddress?: string;
  postalAddress?: string;
  county?: string;
  skills?: Skill[];
  education?: Education[];
  certifications?: Certification[];
  cvUrl?: string;
  academicCertificates?: AcademicCertificate[];
  yearsOfExperience: number;
  hourlyRate: number;
  availability: Availability;
  preferredWorkTypes?: string[];
  roles: UserRole[];
  department: string;
  nhifDeduction?: number;
  nssfDeduction?: number;
  emergencyContact?: EmergencyContact;
  bankDetails?: BankDetails;
  mpesaDetails?: MpesaDetails;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  employeeId: string;
}

export interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  limit: number;
}
