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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";

export default function EmployeeDetailsPage({ employee }: any) {
  const totalDeductions =
    (employee?.nhifDeduction || 0) + (employee?.nssfDeduction || 0);
  const netSalary = (employee?.baseSalary || 0) - totalDeductions;

  const router = useRouter();
  return (
    <div className=" px-4 py-8  min-h-screen">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-primary">Employee Profile</h1>
        <div className="flex space-x-4">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => router.push(`/employees/${employee?._id}/update`)}
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
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
          <CardContent className="relative pt-0">
            <div className="flex flex-col items-center -mt-16 space-y-4">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage
                  src="/placeholder.svg?height=128&width=128"
                  alt={`${employee?.firstName} ${employee?.lastName}`}
                />
                <AvatarFallback className="text-4xl">
                  {employee?.firstName?.[0]}
                  {employee?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-400">
                  {employee?.firstName} {employee?.lastName}
                </h2>
                <p className="text-gray-600">{employee?.position}</p>
              </div>
              <Badge
                variant={
                  (employee?.status === "active"
                    ? "success"
                    : "destructive") as "default"
                }
                className="text-sm"
              >
                {employee?.status}
              </Badge>
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
                <span>{employee?.department}</span>
              </div>
              <div className="flex items-center text-sm">
                <Mail className="mr-2 h-4 w-4 text-gray-500" />
                <span>{employee?.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="mr-2 h-4 w-4 text-gray-500" />
                <span>{employee?.phoneNumber}</span>
              </div>
              <div className="flex items-center text-sm">
                <CreditCard className="mr-2 h-4 w-4 text-gray-500" />
                <span>ID: {employee?.employeeId}</span>
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
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Employment Type</p>
                      <p className="font-medium">{employee?.employmentType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium">{employee?.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="font-medium">
                        {employee?.employmentStartDate
                          ? format(employee.employmentStartDate, "dd MMM yyyy")
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">End Date</p>
                      <p className="font-medium">
                        {employee?.employmentEndDate
                          ? format(employee.employmentEndDate, "dd MMM yyyy")
                          : "N/A"}
                      </p>
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
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div>
                      <p className="text-sm text-gray-500">Wallet Balance</p>
                      <p className="font-medium">
                        KES {(employee?.walletBalance || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Advances</p>
                      <p className="font-medium">
                        KES {(employee?.totalAdvances || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Loans</p>
                      <p className="font-medium">
                        KES {(employee?.totalLoans || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">NHIF Deduction</p>
                      <p className="font-medium">
                        KES {(employee?.nhifDeduction || 0).toLocaleString()}
                      </p>
                    </div>
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
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Date of Birth</p>
                      <p className="font-medium">
                        {employee?.dateOfBirth
                          ? format(employee.dateOfBirth, "dd MMM yyyy")
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">National ID</p>
                      <p className="font-medium">{employee?.nationalId}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Emergency Contact</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">
                          {employee?.emergencyContact?.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Relationship</p>
                        <p className="font-medium">
                          {employee?.emergencyContact?.relationship}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">
                          {employee?.emergencyContact?.phoneNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Alternative Phone
                        </p>
                        <p className="font-medium">
                          {employee?.emergencyContact?.alternativePhoneNumber}
                        </p>
                      </div>
                    </div>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Bank Name</p>
                    <p className="font-medium">
                      {employee?.bankDetails?.bankName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Account Number</p>
                    <p className="font-medium">
                      {employee?.bankDetails?.accountNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Branch Code</p>
                    <p className="font-medium">
                      {employee?.bankDetails?.branchCode}
                    </p>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">M-Pesa Details</h3>
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium">
                    {employee?.mpesaDetails?.phoneNumber}
                  </p>
                </div>
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
