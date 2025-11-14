export interface Organization {
  _id: string;
  companyName: string;
  registrationNumber: string;
  kraPin: string;
  businessAddress: string;
  postalAddress: string;
  county: string;
  businessPhone: string;
  businessEmail: string;
  yearsOfOperation: number;
  hourlyRate: number;
  servicesOffered: string[];
  industries: string[];
  preferredWorkTypes: string[];
  contactPerson: ContactPerson;
  bankDetails: BankDetails;
  registrationCertificateUrl: string;
  kraCertificateUrl: string;
  taxComplianceCertificateUrl: string;
  cr12Url: string;
  taxComplianceExpiryDate: string;
  status: "pending" | "active" | "rejected";
  registrationStatus?: "quick" | "complete";
  createdAt: string;
  updatedAt: string;
  organizationId: string;
}

export interface ContactPerson {
  name?: string;
  position?: string;
  email?: string;
  phoneNumber?: string;
}

export interface BankDetails {
  bankName?: string;
  accountNumber?: string;
  branchCode?: string;
}

export interface OrganizationData {
  registrationStatus?: "quick" | "complete";
  _id?: string;
  companyName?: string;
  registrationNumber?: string;
  kraPin?: string;
  businessAddress?: string;
  postalAddress?: string;
  county?: string;
  businessPhone?: string;
  businessEmail?: string;
  website?: string;
  department?: string;
  yearsOfOperation?: number;
  servicesOffered?: string[];
  industries?: string[];
  preferredWorkTypes?: string[];
  contactPerson?: ContactPerson;
  bankDetails?: BankDetails;
  registrationCertificateUrl?: string;
  kraCertificateUrl?: string;
  taxComplianceCertificateUrl?: string;
  cr12Url?: string;
  taxComplianceExpiryDate?: string;
  profileCompletionPercentage?: number;
  lastUpdated?: string;
  createdAt?: string;
}

export interface ProfileContextType {
  organizationId: string;
  data: OrganizationData;
  loading: boolean;
  saving: boolean;
  completionPercentage: number;
  missingFields: string[];
  updateSection: (sectionData: Partial<OrganizationData>) => Promise<void>;
  uploadFile: (file: File, field: string) => Promise<string>;
  refreshData: () => Promise<void>;
}
