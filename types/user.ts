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

export type PaymentMethod = "bank" | "mpesa" | "cash" | "wallet";
export type UserStatus = "active" | "inactive" | "suspended" | "terminated";
export type EmploymentType = "full-time" | "part-time" | "contract" | "intern";
export type UserRole = "employee" | "admin" | "hr" | "finance";

export interface User {
  id: string;
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalId: string;
  walletBalance: number;
  totalAdvances: number;
  totalLoans: number;
  status: UserStatus;
  dateOfBirth?: Date;
  bankDetails?: BankDetails;
  mpesaDetails?: MpesaDetails;
  paymentMethod?: PaymentMethod;
  roles: UserRole[];
  employeeId?: string;
  department: string;
  position: string;
  baseSalary: number;
  employmentStartDate: Date;
  employmentEndDate?: Date;
  employmentType: EmploymentType;
  nhifDeduction?: number;
  nssfDeduction?: number;
  emergencyContact?: EmergencyContact;
  advances?: string[];
  loans?: string[];
  mpesaTransactions?: string[];
  walletTransactions?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  limit: number;
}
