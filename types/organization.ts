export interface ContactPerson {
  name: string;
  position: string;
  email: string;
  phoneNumber: string;
  alternativePhoneNumber?: string;
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchCode: string;
  swiftCode: string;
}

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
  status: 'pending' | 'active' | 'rejected';
  createdAt: string;
  updatedAt: string;
  organizationId: string;
}
