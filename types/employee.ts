import { PaymentMethod } from "./advance";
import {
  BankDetails,
  EmergencyContact,
  MpesaDetails,
  UserRole,
  UserStatus,
} from "./user";

export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalId: string;
  status: UserStatus;
  dateOfBirth?: Date;
  bankDetails?: BankDetails;
  mpesaDetails?: MpesaDetails;
  paymentMethod?: PaymentMethod;
  roles: UserRole[];
  department: string;
  position: string;
  baseSalary: number;
  employmentStartDate: Date;
  employmentEndDate?: Date;
  emergencyContact?: EmergencyContact;
}
