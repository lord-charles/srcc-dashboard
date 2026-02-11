"use client";
import { format } from "date-fns";
import {
  User,
  Phone,
  Mail,
  CreditCard,
  Briefcase,
  DollarSign,
  Clock,
  Edit,
  Download,
  ChevronLeft,
  Shield,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Search,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import {
  approveConsultant,
  rejectConsultant,
} from "@/services/consultant.service";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

import { updateEmployee } from "@/services/employees.service";
import type { UserRole } from "@/types/user";

const updateUserRoles = async (userId: string, roles: UserRole[]) => {
  return updateEmployee(userId, { roles });
};

// Available roles in the system
const availableRoles: any[] = [
  "admin",
  "consultant",
  "budget_checker",
  "budget_manager",
  "finance_approver",
  "claim_checker",
  "claim_manager",
  "managing_director",
  "hod",
  "accountant",
  "head_of_programs",
  "director",
  "academic_director",
  "srcc_checker",
  "srcc_finance",
  "reviewer",
  "approver",
  "coach_finance",
  "srcc_invoice_request",
  "invoice_approver"
];

// Roles that require department assignment
const departmentRequiredRoles = [
  "claim_checker",
  "reviewer",
  "approver",
  "srcc_checker",
  "srcc_finance",
  "head_of_programs",
  "director",
  "academic_director",
  "finance",
  "coach_finance",
  "srcc_invoice_request",
  "invoice_approver"
];

// Available departments
const availableDepartments = [
  "SRCC",
  "SU",
  "SBS",
  "ILAB",
  "SERC",
  "SIMS",
  "SHSS",
];

export default function EmployeeDetailsPage({ employee }: any) {
  const totalDeductions =
    (employee?.nhifDeduction || 0) + (employee?.nssfDeduction || 0);
  const netSalary = (employee?.baseSalary || 0) - totalDeductions;

  const router = useRouter();
  const { toast } = useToast();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // Role management states
  const [userRoles, setUserRoles] = useState<UserRole[]>(employee?.roles || []);
  const [userDepartment, setUserDepartment] = useState<string>(
    employee?.department || "",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdatingRoles, setIsUpdatingRoles] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showDepartmentWarning, setShowDepartmentWarning] = useState(false);

  const filteredAvailableRoles = availableRoles
    .filter((role: UserRole) => !userRoles.includes(role))
    .filter((role: UserRole) =>
      role.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  // Check if any role requires department
  const requiresDepartment = userRoles.some((role) =>
    departmentRequiredRoles.includes(role),
  );

  const handleAddRole = (role: UserRole) => {
    setUserRoles([...userRoles, role]);
    setShowRoleDialog(false);

    // Show warning if this role requires department and none is set
    if (departmentRequiredRoles.includes(role) && !userDepartment) {
      setShowDepartmentWarning(true);
    }
  };

  const handleRemoveRole = (role: UserRole) => {
    setUserRoles(userRoles.filter((r) => r !== role));
  };

  const saveRoles = async () => {
    // Check if department is required but not set
    if (requiresDepartment && !userDepartment) {
      toast({
        title: "Department Required",
        description: "Please select a department for roles that require it",
        variant: "destructive",
      });
      setShowDepartmentWarning(true);
      return;
    }

    try {
      setIsUpdatingRoles(true);
      const updateData: any = { roles: userRoles };

      // Include department if it's set
      if (userDepartment) {
        updateData.department = userDepartment;
      }

      const success = await updateEmployee(employee._id, updateData);
      if (success) {
        toast({
          title: "Success",
          description:
            "User roles and department have been updated successfully",
          variant: "default",
        });
        setShowDepartmentWarning(false);
      } else {
        throw new Error("Failed to update roles");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update roles",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingRoles(false);
    }
  };

  const approveConsultantHandler = async (id: string) => {
    try {
      setIsApproving(true);
      const success = await approveConsultant(id);
      if (success) {
        toast({
          title: "Success",
          description: "Consultant has been approved successfully",
          variant: "default",
        });
        router.refresh();
      } else {
        throw new Error("Failed to approve consultant");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to approve consultant",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
      setShowApproveDialog(false);
    }
  };

  const rejectConsultantHandler = async (id: string) => {
    try {
      setIsRejecting(true);
      const success = await rejectConsultant(id);
      if (success) {
        toast({
          title: "Success",
          description: "Consultant has been rejected successfully",
          variant: "default",
        });
        router.refresh();
      } else {
        throw new Error("Failed to reject consultant");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to reject consultant",
        variant: "destructive",
      });
    } finally {
      setIsRejecting(false);
      setShowRejectDialog(false);
    }
  };

  return (
    <div className="p-2 md:p-6 min-h-screen ">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.back()}
            variant="default"
            size="sm"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold ">User Profile</h1>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => router.push(`/users/${employee?._id}/update`)}
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </Button>
          <Button
            className="flex items-center gap-2"
            onClick={() => window.print()}
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 overflow-hidden border-0 shadow-sm">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 h-32"></div>
          <CardContent className="relative pt-0">
            <div className="flex flex-col items-center -mt-16 space-y-4">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage
                  src="/placeholder.svg?height=128&width=128"
                  alt={`${employee?.firstName} ${employee?.lastName}`}
                />
                <AvatarFallback className="text-4x">
                  {employee?.firstName?.[0]}
                  {employee?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="text-2xl font-bold ">
                  {[
                    employee?.firstName,
                    employee?.middleName,
                    employee?.lastName,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {employee?.position || "No Position"}
                </p>
                <p>{employee?.employeeId || "No ID"}</p>
              </div>
              <Badge
                variant={
                  (employee?.status === "active"
                    ? "success"
                    : employee?.status === "pending"
                      ? "warning"
                      : "destructive") as "default"
                }
                className="text-sm px-3 py-1"
              >
                {employee?.status || "unknown"}
              </Badge>
              {employee?.status === "pending" && (
                <>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setShowApproveDialog(true)}
                      disabled={isApproving || isRejecting}
                    >
                      {isApproving && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowRejectDialog(true)}
                      disabled={isApproving || isRejecting}
                    >
                      {isRejecting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Reject
                    </Button>
                  </div>

                  <AlertDialog
                    open={showApproveDialog}
                    onOpenChange={setShowApproveDialog}
                  >
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Approve Consultant</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to approve this consultant? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isApproving}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => approveConsultantHandler(employee._id)}
                          disabled={isApproving}
                          className="bg-primary hover:bg-primary/90"
                        >
                          {isApproving && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Approve
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog
                    open={showRejectDialog}
                    onOpenChange={setShowRejectDialog}
                  >
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reject Consultant</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to reject this consultant? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isRejecting}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => rejectConsultantHandler(employee._id)}
                          disabled={isRejecting}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          {isRejecting && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Reject
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
            <Separator className="my-6" />
            <div className="space-y-4">
              <div className="flex items-center text-sm">
                <Briefcase className="mr-3 h-4 w-4 " />
                <span>{employee?.department || "Not specified"}</span>
              </div>
              <div className="flex items-center text-sm">
                <Mail className="mr-3 h-4 w-4 " />
                <span>{employee?.email || "No email"}</span>
                {employee?.isEmailVerified ? (
                  <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="ml-2 h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center text-sm">
                <Phone className="mr-3 h-4 w-4 " />
                <span>{employee?.phoneNumber || "No phone"}</span>
                {employee?.isPhoneVerified ? (
                  <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="ml-2 h-4 w-4 text-red-500" />
                )}
                {employee?.alternativePhoneNumber && (
                  <span className="ml-2 ">
                    (Alt: {employee.alternativePhoneNumber})
                  </span>
                )}
              </div>
              <div className="flex items-center text-sm">
                <CreditCard className="mr-3 h-4 w-4 " />
                <span>ID: {employee?.nationalId || "Not provided"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <Tabs defaultValue="employment" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-12 rounded-lg  p-1">
              <TabsTrigger value="employment" className="rounded-md">
                Employment
              </TabsTrigger>
              <TabsTrigger value="financial" className="rounded-md">
                Financial
              </TabsTrigger>
              <TabsTrigger value="personal" className="rounded-md">
                Personal
              </TabsTrigger>
              <TabsTrigger value="roles" className="rounded-md">
                Roles
              </TabsTrigger>
            </TabsList>

            <TabsContent value="employment" className="mt-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center ">
                    <Briefcase className="mr-2 h-5 w-5 " />
                    Employment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-100 shadow-sm rounded-md">
                    <div className=" p-4 rounded-lg">
                      <p className="text-sm font-medium ">Department</p>
                      <p className="font-medium  mt-1">
                        {employee?.department || "Not assigned"}
                      </p>
                    </div>
                    <div className=" p-4 rounded-lg">
                      <p className="text-sm font-medium ">Availability</p>
                      <p className="font-medium  mt-1 capitalize">
                        {employee?.availability || "Not specified"}
                      </p>
                    </div>
                    <div className=" p-4 rounded-lg">
                      <p className="text-sm font-medium ">
                        Preferred Work Types
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {employee?.preferredWorkTypes?.length > 0 ? (
                          employee.preferredWorkTypes.map(
                            (type: string, index: number) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="capitalize"
                              >
                                {type}
                              </Badge>
                            ),
                          )
                        ) : (
                          <p className="font-medium ">Not specified</p>
                        )}
                      </div>
                    </div>
                    <div className=" p-4 rounded-lg">
                      <p className="text-sm font-medium ">Experience (Years)</p>
                      <p className="font-medium  mt-1">
                        {employee?.yearsOfExperience || 0}
                      </p>
                    </div>
                    <div className=" p-4 rounded-lg">
                      <p className="text-sm font-medium ">Hourly Rate</p>
                      <p className="font-medium  mt-1">
                        {employee?.hourlyRate
                          ? `KES ${employee.hourlyRate}`
                          : "Not set"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold  mb-4">Skills</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {employee?.skills?.length > 0 ? (
                        employee.skills.map((skill: any, index: number) => (
                          <div
                            key={index}
                            className="p-4 border border-gray-100 rounded-lg  shadow-sm"
                          >
                            <p className="font-medium capitalize ">
                              {skill.name}
                            </p>
                            <div className="text-sm  mt-2">
                              <p>Experience: {skill.yearsOfExperience} years</p>
                              <p className="capitalize">
                                Level: {skill.proficiencyLevel}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p>No skills listed</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold  mb-4">Education</h3>
                    <div className="space-y-4">
                      {employee?.education?.length > 0 ? (
                        employee.education.map((edu: any, index: number) => (
                          <div
                            key={index}
                            className="p-4 border border-gray-100 rounded-lg  shadow-sm"
                          >
                            <p className="font-medium ">{edu.qualification}</p>
                            <p className="text-sm  mt-1">{edu.institution}</p>
                            <p className="text-sm ">
                              Completed: {edu.yearOfCompletion}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p>No education history listed</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold  mb-4">
                      Professional Certifications
                    </h3>
                    <div className="space-y-4">
                      {employee?.certifications?.length > 0 ? (
                        employee.certifications.map(
                          (cert: any, index: number) => (
                            <div
                              key={index}
                              className="p-4 border border-gray-100 rounded-lg  shadow-sm"
                            >
                              <p className="font-medium ">{cert.name}</p>
                              <p className="text-sm  mt-1">
                                Issued by: {cert.issuingOrganization}
                              </p>
                              <p className="text-sm ">
                                Date Issued:{" "}
                                {format(
                                  new Date(cert.dateIssued),
                                  "dd MMM yyyy",
                                )}
                              </p>
                              {cert.expiryDate && (
                                <p className="text-sm ">
                                  Expires:{" "}
                                  {format(
                                    new Date(cert.expiryDate),
                                    "dd MMM yyyy",
                                  )}
                                </p>
                              )}
                            </div>
                          ),
                        )
                      ) : (
                        <p>No certifications listed</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold  mb-4">Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {employee?.cvUrl && (
                        <a
                          href={employee.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-4 border border-gray-100 rounded-lg  shadow-sm hover: transition-colors"
                        >
                          <Download className="mr-3 h-5 w-5 " />
                          <span className="">Download CV</span>
                        </a>
                      )}
                      {employee?.academicCertificates?.map(
                        (cert: any, index: number) => (
                          <a
                            key={index}
                            href={cert.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-4 border border-gray-100 rounded-lg  shadow-sm hover: transition-colors"
                          >
                            <Download className="mr-3 h-5 w-5 " />
                            <span className="">
                              Academic Certificate {index + 1}
                            </span>
                          </a>
                        ),
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financial" className="mt-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center ">
                    <DollarSign className="mr-2 h-5 w-5 " />
                    Financial Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border border-gray-100 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium ">
                          Base Salary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold ">
                          KES {(employee?.baseSalary || 0).toLocaleString()}
                        </div>
                        <Progress value={100} className="h-2 mt-4" />
                      </CardContent>
                    </Card>

                    <Card className="border border-gray-100 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium text-red-600">
                          Deductions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                          KES {totalDeductions.toLocaleString()}
                        </div>
                        <Progress
                          value={
                            (totalDeductions / (employee?.baseSalary || 1)) *
                            100
                          }
                          className="h-2 mt-4 bg-red-100 [&>[role=progressbar]]:bg-red-600"
                        />
                      </CardContent>
                    </Card>

                    <Card className="border border-gray-100 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium text-green-600">
                          Net Salary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          KES {netSalary.toLocaleString()}
                        </div>
                        <Progress
                          value={
                            (netSalary / (employee?.baseSalary || 1)) * 100
                          }
                          className="h-2 mt-4 bg-green-100 [&>[role=progressbar]]:bg-green-600"
                        />
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold  mb-4">
                        Deduction Details
                      </h3>
                      <div className="space-y-4">
                        <div className="p-4 border border-gray-100 rounded-lg  shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium ">NHIF Deduction</span>
                            <span className="font-medium ">
                              KES{" "}
                              {(employee?.nhifDeduction || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 border border-gray-100 rounded-lg  shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium ">NSSF Deduction</span>
                            <span className="font-medium ">
                              KES{" "}
                              {(employee?.nssfDeduction || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold  mb-4">
                        Payment Information
                      </h3>
                      <div className="p-4 border border-gray-100 rounded-lg  shadow-sm">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="font-medium ">Payment Method</span>
                            <Badge variant="outline">
                              {employee?.paymentMethod || "Not specified"}
                            </Badge>
                          </div>
                          <Separator />
                          <div>
                            <p className="font-medium  mb-2">Bank Details</p>
                            {employee?.bankDetails?.bankName ? (
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>Bank: {employee.bankDetails.bankName}</p>
                                <p>
                                  Account: {employee.bankDetails.accountNumber}
                                </p>
                                <p>
                                  Branch Code: {employee.bankDetails.branchCode}
                                </p>
                              </div>
                            ) : (
                              <p className="text-sm ">
                                No bank details provided
                              </p>
                            )}
                          </div>
                          <Separator />
                          <div>
                            <p className="font-medium  mb-2">M-Pesa Details</p>
                            {employee?.mpesaDetails?.phoneNumber ? (
                              <p className="text-sm text-gray-600">
                                Phone: {employee.mpesaDetails.phoneNumber}
                              </p>
                            ) : (
                              <p className="text-sm ">
                                No M-Pesa details provided
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="personal" className="mt-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center ">
                    <User className="mr-2 h-5 w-5 " />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-100 shadow-sm rounded-md bg-card">
                    <div className=" p-4 rounded-lg">
                      <p className="text-sm font-medium ">Date of Birth</p>
                      <p className="font-medium  mt-1">
                        {employee?.dateOfBirth
                          ? format(
                              new Date(employee.dateOfBirth),
                              "dd MMM yyyy",
                            )
                          : "Not provided"}
                      </p>
                    </div>
                    <div className=" p-4 rounded-lg">
                      <p className="text-sm font-medium ">National ID</p>
                      <p className="font-medium  mt-1">
                        {employee?.nationalId || "Not provided"}
                      </p>
                    </div>
                    <div className=" p-4 rounded-lg">
                      <p className="text-sm font-medium ">KRA PIN</p>
                      <p className="font-medium  mt-1">
                        {employee?.kraPinNumber || "Not provided"}
                      </p>
                    </div>
                    <div className=" p-4 rounded-lg">
                      <p className="text-sm font-medium ">NHIF Number</p>
                      <p className="font-medium  mt-1">
                        {employee?.nhifNumber || "Not provided"}
                      </p>
                    </div>
                    <div className=" p-4 rounded-lg">
                      <p className="text-sm font-medium ">NSSF Number</p>
                      <p className="font-medium  mt-1">
                        {employee?.nssfNumber || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="border border-gray-100 shadow-sm rounded-md bg-card p-4">
                    <h3 className="text-lg font-semibold  mb-4 ">
                      Address Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className=" p-4 rounded-lg">
                        <p className="text-sm font-medium ">Physical Address</p>
                        <p className="font-medium  mt-1">
                          {employee?.physicalAddress || "Not provided"}
                        </p>
                      </div>
                      <div className=" p-4 rounded-lg">
                        <p className="text-sm font-medium ">Postal Address</p>
                        <p className="font-medium  mt-1">
                          {employee?.postalAddress || "Not provided"}
                        </p>
                      </div>
                      <div className=" p-4 rounded-lg">
                        <p className="text-sm font-medium ">County</p>
                        <p className="font-medium  mt-1 capitalize">
                          {employee?.county || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-100 shadow-sm rounded-md bg-card p-4">
                    <h3 className="text-lg font-semibold  mb-4">
                      Emergency Contact
                    </h3>
                    {employee?.emergencyContact?.name ? (
                      <div className="p-4 border border-gray-100 rounded-lg  shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <p className="text-sm font-medium ">Name</p>
                            <p className="font-medium  mt-1">
                              {employee.emergencyContact.name}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium ">Relationship</p>
                            <p className="font-medium  mt-1">
                              {employee.emergencyContact.relationship}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium ">Phone</p>
                            <p className="font-medium  mt-1">
                              {employee.emergencyContact.phoneNumber}
                            </p>
                          </div>
                          {employee.emergencyContact.alternativePhoneNumber && (
                            <div>
                              <p className="text-sm font-medium ">
                                Alternative Phone
                              </p>
                              <p className="font-medium  mt-1">
                                {
                                  employee.emergencyContact
                                    .alternativePhoneNumber
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p>No emergency contact provided</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roles" className="mt-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center ">
                      <Shield className="mr-2 h-5 w-5 " />
                      Role Management
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Dialog
                        open={showRoleDialog}
                        onOpenChange={setShowRoleDialog}
                      >
                        <DialogTrigger asChild>
                          <Button size="sm" className="flex items-center gap-1">
                            <Plus className="h-4 w-4" />
                            Add Role
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Role</DialogTitle>
                            <DialogDescription>
                              Select a role to assign to this user.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <div className="mb-4">
                              <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 " />
                                <Input
                                  placeholder="Search roles..."
                                  className="pl-9"
                                  value={searchTerm}
                                  onChange={(e) =>
                                    setSearchTerm(e.target.value)
                                  }
                                />
                              </div>
                            </div>
                            <ScrollArea className="h-[300px] pr-4">
                              {filteredAvailableRoles.length > 0 ? (
                                <div className="space-y-2">
                                  {filteredAvailableRoles.map((role) => (
                                    <div
                                      key={role}
                                      className="flex items-center justify-between p-3 rounded-md cursor-pointer"
                                      onClick={() => handleAddRole(role)}
                                    >
                                      <div className="flex items-center">
                                        <Shield className="h-4 w-4 mr-2 " />
                                        <span className="font-medium capitalize">
                                          {role.replace(/_/g, " ")}
                                        </span>
                                      </div>
                                      <Plus className="h-4 w-4 " />
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8 ">
                                  No roles found matching your search
                                </div>
                              )}
                            </ScrollArea>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setShowRoleDialog(false)}
                            >
                              Cancel
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={saveRoles}
                        disabled={isUpdatingRoles}
                      >
                        {isUpdatingRoles ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Manage user roles and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Department Selection */}
                    {requiresDepartment && (
                      <div
                        className={`p-4 rounded-lg border ${
                          showDepartmentWarning
                            ? "border-red-500 bg-red-50"
                            : "border-gray-100"
                        }`}
                      >
                        <p className="text-sm font-medium mb-3">
                          Department Assignment{" "}
                          <span className="text-red-500">*</span>
                        </p>
                        <div className="space-y-2">
                          <select
                            value={userDepartment}
                            onChange={(e) => {
                              setUserDepartment(e.target.value);
                              setShowDepartmentWarning(false);
                            }}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="">Select Department</option>
                            {availableDepartments.map((dept) => (
                              <option key={dept} value={dept}>
                                {dept}
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-muted-foreground">
                            Required for:{" "}
                            {userRoles
                              .filter((r) =>
                                departmentRequiredRoles.includes(r),
                              )
                              .join(", ")
                              .replace(/_/g, " ")}
                          </p>
                          {showDepartmentWarning && (
                            <p className="text-xs text-red-500">
                              Please select a department before saving
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className=" p-4 rounded-lg">
                      <p className="text-sm font-medium  mb-3">Current Roles</p>
                      {userRoles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {userRoles.map((role) => (
                            <div
                              key={role}
                              className="flex items-center justify-between p-3  rounded-md border border-gray-100 shadow-sm"
                            >
                              <div className="flex items-center">
                                <Shield className="h-4 w-4 mr-2 " />
                                <span className="font-medium capitalize">
                                  {role.replace(/_/g, " ")}
                                </span>
                              </div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8  hover:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Remove Role
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove the
                                      &lsquo;{role.replace(/_/g, " ")}&lsquo;
                                      role from this user?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleRemoveRole(role)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8   rounded-md border border-dashed border-gray-200">
                          No roles assigned to this user
                        </div>
                      )}
                    </div>

                    <div className=" p-4 rounded-lg">
                      <p className="text-sm font-medium  mb-3">
                        Role Permissions
                      </p>
                      <div className="space-y-4">
                        <div className="p-4  rounded-md border border-gray-100 shadow-sm">
                          <p className="font-medium  mb-2">Admin</p>
                          <p className="text-sm ">
                            Full access to all system features and user
                            management
                          </p>
                        </div>
                        <div className="p-4  rounded-md border border-gray-100 shadow-sm">
                          <p className="font-medium  mb-2">Consultant</p>
                          <p className="text-sm ">
                            Access to project assignments and time tracking
                          </p>
                        </div>
                        <div className="p-4  rounded-md border border-gray-100 shadow-sm">
                          <p className="font-medium  mb-2">Finance Approver</p>
                          <p className="text-sm ">
                            Can approve financial transactions and payments
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-2"
                            >
                              View All Role Descriptions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56">
                            {availableRoles.slice(0, 8).map((role) => (
                              <DropdownMenuItem
                                key={role}
                                className="capitalize"
                              >
                                {role.replace(/_/g, " ")}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center ">
                <Clock className="mr-2 h-5 w-5 " />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className=" p-4 rounded-lg">
                  <p className="text-sm font-medium ">Created At</p>
                  <p className="font-medium  mt-1">
                    {employee?.createdAt
                      ? format(
                          new Date(employee.createdAt),
                          "dd MMM yyyy HH:mm",
                        )
                      : "N/A"}
                  </p>
                </div>
                <div className=" p-4 rounded-lg">
                  <p className="text-sm font-medium ">Last Updated</p>
                  <p className="font-medium  mt-1">
                    {employee?.updatedAt
                      ? format(
                          new Date(employee.updatedAt),
                          "dd MMM yyyy HH:mm",
                        )
                      : "N/A"}
                  </p>
                </div>
                <div className=" p-4 rounded-lg">
                  <p className="text-sm font-medium ">Registration Status</p>
                  <p className="font-medium  mt-1 capitalize">
                    {employee?.registrationStatus || "N/A"}
                  </p>
                </div>
                <div className=" p-4 rounded-lg">
                  <p className="text-sm font-medium ">Status</p>
                  <div className="flex items-center mt-1">
                    {employee?.status === "active" ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                        <span className="font-medium  capitalize">
                          {employee?.status}
                        </span>
                      </>
                    ) : employee?.status === "pending" ? (
                      <>
                        <Clock className="h-4 w-4 text-amber-500 mr-2" />
                        <span className="font-medium  capitalize">
                          {employee?.status}
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500 mr-2" />
                        <span className="font-medium  capitalize">
                          {employee?.status || "unknown"}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
