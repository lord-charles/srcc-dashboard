"use client";

import { format } from "date-fns";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  ChevronLeft,
  Edit,
  Download,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
  Globe,
  Calendar,
  DollarSign,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
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
import {
  approveOrganization,
  rejectOrganization,
} from "@/services/organization.service";

export default function OrganizationDetailsPage({ organization }: any) {
  const router = useRouter();
  const { toast } = useToast();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const approveOrganizationHandler = async (id: string) => {
    try {
      setIsApproving(true);
      const result = await approveOrganization(id);
      if (result.success) {
        toast({
          title: "Success",
          description: "Organization has been approved successfully",
          variant: "default",
        });
        router.refresh();
      } else {
        throw new Error("Failed to approve organization");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to approve organization",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
      setShowApproveDialog(false);
    }
  };

  const rejectOrganizationHandler = async (id: string) => {
    try {
      setIsRejecting(true);
      const result = await rejectOrganization(id);
      if (result.success) {
        toast({
          title: "Success",
          description: "Organization has been rejected successfully",
          variant: "default",
        });
        router.refresh();
      } else {
        throw new Error("Failed to reject organization");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to reject organization",
        variant: "destructive",
      });
    } finally {
      setIsRejecting(false);
      setShowRejectDialog(false);
    }
  };

  return (
    <div className="p-2 md:p-6 min-h-screen">
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
            <h1 className="text-3xl font-bold">Organization Profile</h1>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() =>
              router.push(`/organizations/${organization?._id}/update`)
            }
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
          <div className="bg-gradient-to-r from-blue-800 to-blue-900 h-32"></div>
          <CardContent className="relative pt-0">
            <div className="flex flex-col items-center -mt-16 space-y-4">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarFallback className="text-4xl bg-primary text-white">
                  {organization?.companyName?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="text-2xl font-bold">
                  {organization?.companyName}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {organization?.organizationId || "No ID"}
                </p>
              </div>
              <Badge
                variant={
                  (organization?.status === "active"
                    ? "success"
                    : organization?.status === "pending"
                      ? "warning"
                      : "destructive") as "default"
                }
                className="text-sm px-3 py-1"
              >
                {organization?.status || "unknown"}
              </Badge>
              {organization?.status === "pending" && (
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
                        <AlertDialogTitle>
                          Approve Organization
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to approve this organization?
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isApproving}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            approveOrganizationHandler(organization._id)
                          }
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
                        <AlertDialogTitle>Reject Organization</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to reject this organization?
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isRejecting}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            rejectOrganizationHandler(organization._id)
                          }
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
                <Mail className="mr-3 h-4 w-4" />
                <span>{organization?.businessEmail || "No email"}</span>
                {organization?.isEmailVerified ? (
                  <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="ml-2 h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center text-sm">
                <Phone className="mr-3 h-4 w-4" />
                <span>{organization?.businessPhone || "No phone"}</span>
                {organization?.isPhoneVerified ? (
                  <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="ml-2 h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="mr-3 h-4 w-4" />
                <span>{organization?.businessAddress || "Not provided"}</span>
              </div>
              <div className="flex items-center text-sm">
                <FileText className="mr-3 h-4 w-4" />
                <span>Reg: {organization?.registrationNumber || "N/A"}</span>
              </div>
              <div className="flex items-center text-sm">
                <FileText className="mr-3 h-4 w-4" />
                <span>KRA: {organization?.kraPin || "N/A"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <Tabs defaultValue="business" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12 rounded-lg p-1">
              <TabsTrigger value="business" className="rounded-md">
                Business Info
              </TabsTrigger>
              <TabsTrigger value="services" className="rounded-md">
                Services
              </TabsTrigger>
              <TabsTrigger value="documents" className="rounded-md">
                Documents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="business" className="mt-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Building2 className="mr-2 h-5 w-5" />
                    Business Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-100 shadow-sm rounded-md">
                    <div className="p-4 rounded-lg">
                      <p className="text-sm font-medium">Company Name</p>
                      <p className="font-medium mt-1">
                        {organization?.companyName || "Not provided"}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg">
                      <p className="text-sm font-medium">Registration Number</p>
                      <p className="font-medium mt-1">
                        {organization?.registrationNumber || "Not provided"}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg">
                      <p className="text-sm font-medium">KRA PIN</p>
                      <p className="font-medium mt-1">
                        {organization?.kraPin || "Not provided"}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg">
                      <p className="text-sm font-medium">Years of Operation</p>
                      <p className="font-medium mt-1">
                        {organization?.yearsOfOperation || 0} years
                      </p>
                    </div>
                    <div className="p-4 rounded-lg">
                      <p className="text-sm font-medium">County</p>
                      <p className="font-medium mt-1 capitalize">
                        {organization?.county || "Not specified"}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg">
                      <p className="text-sm font-medium">Hourly Rate</p>
                      <p className="font-medium mt-1">
                        {organization?.hourlyRate
                          ? `KES ${organization.hourlyRate}`
                          : "Not set"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Contact Person
                    </h3>
                    <div className="p-4 border border-gray-100 rounded-lg shadow-sm">
                      <p className="font-medium">
                        {organization?.contactPerson?.name || "Not provided"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 capitalize">
                        {organization?.contactPerson?.position || "N/A"}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <Mail className="h-3 w-3" />
                        <span>
                          {organization?.contactPerson?.email || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>
                          {organization?.contactPerson?.phoneNumber || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Bank Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border border-gray-100 rounded-lg shadow-sm">
                        <p className="text-sm font-medium">Bank Name</p>
                        <p className="font-medium mt-1">
                          {organization?.bankDetails?.bankName ||
                            "Not provided"}
                        </p>
                      </div>
                      <div className="p-4 border border-gray-100 rounded-lg shadow-sm">
                        <p className="text-sm font-medium">Account Number</p>
                        <p className="font-medium mt-1">
                          {organization?.bankDetails?.accountNumber ||
                            "Not provided"}
                        </p>
                      </div>
                      <div className="p-4 border border-gray-100 rounded-lg shadow-sm">
                        <p className="text-sm font-medium">Branch Code</p>
                        <p className="font-medium mt-1">
                          {organization?.bankDetails?.branchCode ||
                            "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services" className="mt-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle>Services & Industries</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Services Offered
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {organization?.servicesOffered?.length > 0 ? (
                        organization.servicesOffered.map(
                          (service: string, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {service}
                            </Badge>
                          ),
                        )
                      ) : (
                        <p className="text-muted-foreground">
                          No services listed
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Industries</h3>
                    <div className="flex flex-wrap gap-2">
                      {organization?.industries?.length > 0 ? (
                        organization.industries.map(
                          (industry: string, index: number) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-purple-50 text-purple-700"
                            >
                              {industry}
                            </Badge>
                          ),
                        )
                      ) : (
                        <p className="text-muted-foreground">
                          No industries listed
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Preferred Work Types
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {organization?.preferredWorkTypes?.length > 0 ? (
                        organization.preferredWorkTypes.map(
                          (type: string, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="capitalize"
                            >
                              {type}
                            </Badge>
                          ),
                        )
                      ) : (
                        <p className="text-muted-foreground">
                          No work types specified
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle>Business Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {organization?.registrationCertificateUrl && (
                      <a
                        href={organization.registrationCertificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-4 border border-gray-100 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                      >
                        <Download className="mr-3 h-5 w-5" />
                        <span>Registration Certificate</span>
                      </a>
                    )}
                    {organization?.kraCertificateUrl && (
                      <a
                        href={organization.kraCertificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-4 border border-gray-100 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                      >
                        <Download className="mr-3 h-5 w-5" />
                        <span>KRA Certificate</span>
                      </a>
                    )}
                    {organization?.taxComplianceCertificateUrl && (
                      <a
                        href={organization.taxComplianceCertificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-4 border border-gray-100 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                      >
                        <Download className="mr-3 h-5 w-5" />
                        <span>Tax Compliance Certificate</span>
                      </a>
                    )}
                    {organization?.cr12Url && (
                      <a
                        href={organization.cr12Url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-4 border border-gray-100 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                      >
                        <Download className="mr-3 h-5 w-5" />
                        <span>CR12 Document</span>
                      </a>
                    )}
                  </div>
                  {!organization?.registrationCertificateUrl &&
                    !organization?.kraCertificateUrl &&
                    !organization?.taxComplianceCertificateUrl &&
                    !organization?.cr12Url && (
                      <p className="text-muted-foreground text-center py-8">
                        No documents uploaded
                      </p>
                    )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
