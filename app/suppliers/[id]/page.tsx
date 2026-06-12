import { Header } from "@/components/header";
import DashboardProvider from "../../dashboard-provider";
import { getSupplierById } from "@/services/suppliers.service";
import Link from "next/link";
import { ChevronLeft, Edit, Calendar, FileText, Phone, Mail, MapPin, Building, ShieldCheck, Landmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Disable caching for this page
export const dynamic = "force-dynamic";

export default async function SupplierDetailsPage({
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const result = await getSupplierById(id);

  if (!result.success || !result.data) {
    return (
      <DashboardProvider>
        <Header />
        <div className="flex h-[80vh] items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-red-500">Supplier Not Found</h2>
            <p className="text-muted-foreground">The requested supplier does not exist or could not be loaded.</p>
            <Button asChild variant="outline">
              <Link href="/suppliers">Go back to Suppliers</Link>
            </Button>
          </div>
        </div>
      </DashboardProvider>
    );
  }

  const supplier = result.data;

  // Format Status class name
  let statusColor = "bg-slate-50 text-slate-700 border-slate-200";
  switch(supplier.status) {
    case 'active':
      statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400";
      break;
    case 'pending_approval':
      statusColor = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400";
      break;
    case 'suspended':
      statusColor = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400";
      break;
    case 'inactive':
      statusColor = "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400";
      break;
  }

  return (
    <DashboardProvider>
      <Header />
      <div className="px-4 py-6 flex min-h-[80vh] w-full bg-card flex-col md:w-[87%] lg:w-full md:ml-[80px] lg:ml-0 sm:ml-0 overflow-x-hidden rounded-md">
        
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-4 border-b mb-6">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              asChild
            >
              <Link href="/suppliers">
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{supplier.name}</h1>
                <Badge variant="outline" className={`capitalize ${statusColor}`}>
                  {supplier.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">Supplier Profile Details</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
              <Link href={`/suppliers/${supplier._id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Supplier
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          
          {/* Main Info Columns */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Basic & Contact Info Card */}
            <Card className="border-none shadow-md bg-white dark:bg-slate-900">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <Building className="h-5 w-5 text-emerald-600" />
                  Company Details
                </CardTitle>
                <CardDescription>General business contact information</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 grid gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Company Name</span>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{supplier.name}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Category</span>
                  <p className="text-sm font-medium">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400">
                      {supplier.supplierCategory}
                    </Badge>
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </span>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{supplier.email}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> Phone
                  </span>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{supplier.phone}</p>
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> Physical Address
                  </span>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100 whitespace-pre-line">{supplier.address}</p>
                </div>
              </CardContent>
            </Card>

            {/* Financial Details Card */}
            <Card className="border-none shadow-md bg-white dark:bg-slate-900">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <Landmark className="h-5 w-5 text-emerald-600" />
                  Financial / Banking Details
                </CardTitle>
                <CardDescription>Payment and account specifications</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 grid gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Bank Name</span>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{supplier.bankName}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Bank Branch</span>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{supplier.bankBranch}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account Name</span>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{supplier.accountName}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account Number</span>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{supplier.accountNumber}</p>
                </div>
              </CardContent>
            </Card>

            {/* Attachments Section */}
            <Card className="border-none shadow-md bg-white dark:bg-slate-900">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  Uploaded Documents & Attachments
                </CardTitle>
                <CardDescription>Legal compliance and banking documents</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  
                  {/* KRA PIN */}
                  <div className="flex items-start p-3 border rounded-lg bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <FileText className="h-8 w-8 text-rose-500 shrink-0 mr-3 mt-0.5" />
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">KRA PIN Certificate</p>
                      {supplier.kraPinUrl ? (
                        <a
                          href={supplier.kraPinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline block truncate"
                        >
                          View PIN Document
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Not provided</span>
                      )}
                    </div>
                  </div>

                  {/* Certificate of Incorporation */}
                  <div className="flex items-start p-3 border rounded-lg bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <FileText className="h-8 w-8 text-rose-500 shrink-0 mr-3 mt-0.5" />
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Incorporation Certificate</p>
                      {supplier.incorporationCertificateUrl ? (
                        <a
                          href={supplier.incorporationCertificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline block truncate"
                        >
                          View Incorporation Cert
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Not provided</span>
                      )}
                    </div>
                  </div>

                  {/* Bank Attachment */}
                  <div className="flex items-start p-3 border rounded-lg bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <FileText className="h-8 w-8 text-rose-500 shrink-0 mr-3 mt-0.5" />
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bank Attachment</p>
                      {supplier.bankAttachmentUrl ? (
                        <a
                          href={supplier.bankAttachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline block truncate"
                        >
                          View Bank Attachment
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Not provided</span>
                      )}
                    </div>
                  </div>

                  {/* Other Compliance */}
                  <div className="flex items-start p-3 border rounded-lg bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <FileText className="h-8 w-8 text-rose-500 shrink-0 mr-3 mt-0.5" />
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Other Compliance Doc</p>
                      {supplier.otherComplianceDocumentUrl ? (
                        <a
                          href={supplier.otherComplianceDocumentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline block truncate"
                        >
                          View Compliance Doc
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Not provided</span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Other Attachments List */}
                {supplier.otherAttachments && supplier.otherAttachments.length > 0 && (
                  <div className="mt-6">
                    <Separator className="my-4" />
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">Other Additional Attachments</h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {supplier.otherAttachments.map((url: string, index: number) => {
                        const fileName = url.split("/").pop() || `Document ${index + 1}`;
                        return (
                          <div key={url} className="flex items-center p-2 border rounded bg-slate-50 dark:bg-slate-900/30">
                            <FileText className="h-5 w-5 text-slate-400 shrink-0 mr-2" />
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline truncate flex-1"
                            >
                              {fileName}
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>

          </div>

          {/* Right Sidebar Columns */}
          <div className="space-y-6">
            
            {/* Legal compliance numbers Card */}
            <Card className="border-none shadow-md bg-white dark:bg-slate-900">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  Compliance IDs
                </CardTitle>
                <CardDescription>Registration and tax identifiers</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">KRA PIN</span>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">{supplier.kraPin}</p>
                </div>
                <Separator />
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Registration Number</span>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">{supplier.registrationNumber}</p>
                </div>
                {supplier.taxComplianceCertificateExpiry && (
                  <>
                    <Separator />
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> Tax Compliance Expiry
                      </span>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        {new Date(supplier.taxComplianceCertificateExpiry).toLocaleDateString()}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Primary Contact Person Card */}
            <Card className="border-none shadow-md bg-white dark:bg-slate-900">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  Primary Contact Person
                </CardTitle>
                <CardDescription>Direct contact designated for operations</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {supplier.contactPerson && (supplier.contactPerson.name || supplier.contactPerson.phone || supplier.contactPerson.email) ? (
                  <>
                    {supplier.contactPerson.name && (
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Name</span>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{supplier.contactPerson.name}</p>
                      </div>
                    )}
                    {supplier.contactPerson.phone && (
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" /> Phone
                        </span>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{supplier.contactPerson.phone}</p>
                      </div>
                    )}
                    {supplier.contactPerson.email && (
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" /> Email
                        </span>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{supplier.contactPerson.email}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No primary contact person assigned.</p>
                )}
              </CardContent>
            </Card>

            {/* Tracking Card */}
            <Card className="border-none shadow-md bg-white dark:bg-slate-900">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-100">Record History</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Registered:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {new Date(supplier.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {new Date(supplier.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                {supplier?.createdBy && (
                  <div className="flex justify-between">
                    <span>Registered By:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {typeof supplier?.createdBy === 'object' 
                        ? `${supplier?.createdBy.firstName || ''} ${supplier?.createdBy.lastName || ''}`.trim() || supplier.createdBy.email
                        : 'System'}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

        </div>

        <div className="pb-12" />
      </div>
    </DashboardProvider>
  );
}
