"use client";
import { format } from "date-fns";
import {
  User,
  Phone,
  Mail,
  CreditCard,
  Briefcase,
  DollarSign,
  BanknoteIcon,
  Clock,
  Edit,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Loader2 } from "lucide-react";

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
      console.log(error);
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
    <div className=" px-4 py-8  min-h-screen">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-primary">User Profile</h1>
        <div className="flex space-x-4">
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
            Download PDF
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 overflow-hidden">
          <div className="bg-dashboard h-32"></div>
          <CardContent className="relative pt-0">
            <div className="flex flex-col items-center -mt-16 space-y-4">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage
                  src="/placeholder.svg?height=128&width=128"
                  alt={`${employee?.firstName} ${employee?.lastName}`}
                />
                <AvatarFallback className="text-4xl ">
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
                <p className="text-gray-600">
                  {employee?.employeeId || "No ID"}
                </p>
              </div>
              <Badge
                variant={
                  (employee?.status === "active"
                    ? "success"
                    : employee?.status === "pending"
                    ? "warning"
                    : "destructive") as "default"
                }
                className="text-sm"
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
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {employee?.roles?.map((role: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
            <Separator className="my-4" />
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Briefcase className="mr-2 h-4 w-4 text-gray-500" />
                <span>{employee?.department || "Not specified"}</span>
              </div>
              <div className="flex items-center text-sm">
                <Mail className="mr-2 h-4 w-4 text-gray-500" />
                <span>{employee?.email || "No email"}</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="mr-2 h-4 w-4 text-gray-500" />
                <span>{employee?.phoneNumber || "No phone"}</span>
                {employee?.alternativePhoneNumber && (
                  <span className="ml-2 text-gray-500">
                    (Alt: {employee.alternativePhoneNumber})
                  </span>
                )}
              </div>
              <div className="flex items-center text-sm">
                <CreditCard className="mr-2 h-4 w-4 text-gray-500" />
                <span>ID: {employee?.nationalId || "Not provided"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-8">
          <Tabs defaultValue="employment" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="employment">Employment</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="personal">Personal</TabsTrigger>
            </TabsList>
            <TabsContent value="employment">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <Briefcase className="mr-2" />
                    Employment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium">
                        {employee?.department || "Not assigned"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Availability</p>
                      <p className="font-medium capitalize">
                        {employee?.availability || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Experience (Years)
                      </p>
                      <p className="font-medium">
                        {employee?.yearsOfExperience || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Hourly Rate</p>
                      <p className="font-medium">
                        {employee?.hourlyRate
                          ? `KES ${employee.hourlyRate}`
                          : "Not set"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Skills</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {employee?.skills?.length > 0 ? (
                        employee.skills.map((skill: any, index: number) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <p className="font-medium capitalize">
                              {skill.name}
                            </p>
                            <div className="text-sm text-gray-500 mt-1">
                              <p>Experience: {skill.yearsOfExperience} years</p>
                              <p className="capitalize">
                                Level: {skill.proficiencyLevel}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No skills listed</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Education</h3>
                    <div className="space-y-3">
                      {employee?.education?.length > 0 ? (
                        employee.education.map((edu: any, index: number) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <p className="font-medium">{edu.qualification}</p>
                            <p className="text-sm text-gray-500">
                              {edu.institution}
                            </p>
                            <p className="text-sm text-gray-500">
                              Completed: {edu.yearOfCompletion}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">
                          No education history listed
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {employee?.cvUrl && (
                        <a
                          href={employee.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          <span>Download CV</span>
                        </a>
                      )}
                      {employee?.academicCertificates?.map(
                        (cert: any, index: number) => (
                          <a
                            key={index}
                            href={cert.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-3 border rounded-lg hover:bg-gray-50"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            <span>Academic Certificate {index + 1}</span>
                          </a>
                        )
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="financial">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <DollarSign className="mr-2" />
                    Financial Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        Base Salary
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        KES {(employee?.baseSalary || 0).toLocaleString()}
                      </span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-red-600">
                        Deductions
                      </span>
                      <span className="text-sm font-medium text-red-600">
                        KES {totalDeductions.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={
                        (totalDeductions / (employee?.baseSalary || 1)) * 100
                      }
                      className="h-2 bg-red-200 [&>[role=progressbar]]:bg-red-600"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-green-600">
                        Net Salary
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        KES {netSalary.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={(netSalary / (employee?.baseSalary || 1)) * 100}
                      className="h-2 bg-green-200 [&>[role=progressbar]]:bg-green-600"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-primary">
                    <User className="mr-2" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Date of Birth</p>
                      <p className="font-medium">
                        {employee?.dateOfBirth
                          ? format(
                              new Date(employee.dateOfBirth),
                              "dd MMM yyyy"
                            )
                          : "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">National ID</p>
                      <p className="font-medium">
                        {employee?.nationalId || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">KRA PIN</p>
                      <p className="font-medium">
                        {employee?.kraPinNumber || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">NHIF Number</p>
                      <p className="font-medium">
                        {employee?.nhifNumber || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">NSSF Number</p>
                      <p className="font-medium">
                        {employee?.nssfNumber || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Address Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Physical Address
                        </p>
                        <p className="font-medium">
                          {employee?.physicalAddress || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Postal Address</p>
                        <p className="font-medium">
                          {employee?.postalAddress || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">County</p>
                        <p className="font-medium capitalize">
                          {employee?.county || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-2">Emergency Contact</h3>
                    {employee?.emergencyContact?.name ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Name</p>
                          <p className="font-medium">
                            {employee.emergencyContact.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Relationship</p>
                          <p className="font-medium">
                            {employee.emergencyContact.relationship}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">
                            {employee.emergencyContact.phoneNumber}
                          </p>
                        </div>
                        {employee.emergencyContact.alternativePhoneNumber && (
                          <div>
                            <p className="text-sm text-gray-500">
                              Alternative Phone
                            </p>
                            <p className="font-medium">
                              {employee.emergencyContact.alternativePhoneNumber}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        No emergency contact provided
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <BanknoteIcon className="mr-2" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Payment Method</span>
                <Badge variant="outline">{employee?.paymentMethod}</Badge>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Bank Details</h3>
                {employee?.bankDetails?.bankName ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Bank Name</p>
                      <p className="font-medium">
                        {employee.bankDetails.bankName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Account Number</p>
                      <p className="font-medium">
                        {employee.bankDetails.accountNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Branch Code</p>
                      <p className="font-medium">
                        {employee.bankDetails.branchCode}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No bank details provided</p>
                )}
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">M-Pesa Details</h3>
                {employee?.mpesaDetails?.phoneNumber ? (
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium">
                      {employee.mpesaDetails.phoneNumber}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">No M-Pesa details provided</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <Clock className="mr-2" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-medium">
                    {employee?.createdAt
                      ? format(employee.createdAt, "dd MMM yyyy HH:mm")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">
                    {employee?.updatedAt
                      ? format(employee.updatedAt, "dd MMM yyyy HH:mm")
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
