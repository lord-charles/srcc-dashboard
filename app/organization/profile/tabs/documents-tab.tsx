"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Clock,
  Upload,
  FileText,
  Download,
  Eye,
  Calendar,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { useProfile } from "../profile-context";
import { useToast } from "@/hooks/use-toast";

export function DocumentsTab() {
  const { data, uploadFile, updateSection } = useProfile();
  const { toast } = useToast();
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );

  const docs = [
    {
      key: "registrationCertificateUrl",
      label: "Business Registration Certificate",
      required: true,
      description:
        "Official business registration document from the Registrar of Companies",
      icon: FileText,
    },
    {
      key: "kraCertificateUrl",
      label: "KRA PIN Certificate",
      required: true,
      description: "Kenya Revenue Authority PIN registration certificate",
      icon: FileText,
    },
    {
      key: "taxComplianceCertificateUrl",
      label: "Tax Compliance Certificate",
      required: true,
      description: "Current tax compliance certificate from KRA",
      icon: FileText,
    },
    {
      key: "cr12Url",
      label: "CR12 Document",
      required: true,
      description: "Annual returns filing document",
      icon: FileText,
    },
  ];

  const handleUpload = async (file: File, field: string) => {
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(field);

    try {
      await uploadFile(file, field);
      // The toast is now handled by the context
    } catch (error) {
      // Error is handled by the context
    } finally {
      setUploading(null);
    }
  };

  const uploadedDocs = docs.filter((doc) => data[doc.key as keyof typeof data]);
  const requiredDocs = docs.filter((doc) => doc.required);
  const uploadedRequiredDocs = requiredDocs.filter(
    (doc) => data[doc.key as keyof typeof data]
  );

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Upload className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-semibold text-primary">
                  Document Upload Progress
                </h3>
                <p className="text-sm text-muted-foreground">
                  {uploadedDocs.length} of {docs.length} documents uploaded
                  {requiredDocs.length > 0 &&
                    ` • ${uploadedRequiredDocs.length}/${requiredDocs.length} required`}
                </p>
              </div>
            </div>
            <Badge
              variant={
                uploadedRequiredDocs.length === requiredDocs.length
                  ? "default"
                  : "secondary"
              }
              className="px-3 py-1"
            >
              {uploadedRequiredDocs.length === requiredDocs.length
                ? "Complete"
                : "In Progress"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Alert className="bg-success/10 border-success/30 items-center flex gap-2">
        <Shield className="h-4 w-4 text-success" />
        <AlertDescription className="text-foreground">
          All documents are securely encrypted and stored. Supported formats:
          PDF, JPG, PNG (max 10MB each).
        </AlertDescription>
      </Alert>

      <Card className="border-0 shadow-lg overflow-hidden">
        <CardContent className="p-2">
          <div className="space-y-4">
            {docs.map((doc, index) => {
              const Icon = doc.icon;
              const isUploaded = data[doc.key as keyof typeof data];
              const isUploading = uploading === doc.key;
              const progress = uploadProgress[doc.key];

              return (
                <div key={doc.key}>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted/50">
                        <Icon className="w-6 h-6 text-muted-foreground" />
                      </div>

                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Label className="text-base font-semibold text-foreground">
                              {doc.label}
                            </Label>
                            {doc.required && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                            {isUploaded && (
                              <Badge
                                variant="outline"
                                className="text-xs text-success-foreground bg-success/10 border-success/30"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Uploaded
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {doc.description}
                          </p>
                        </div>

                        <div className="space-y-3">
                          {/* Upload Progress */}
                          {isUploading && progress !== undefined && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Uploading...
                                </span>
                                <span className="text-muted-foreground">
                                  {progress}%
                                </span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>
                          )}

                          {/* File Input */}
                          <div className="flex items-center gap-3">
                            <Input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              disabled={isUploading}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUpload(file, doc.key);
                              }}
                              className="flex-1 h-11 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-muted file:text-foreground hover:file:bg-muted/80 transition-colors"
                            />

                            {isUploaded && (
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    window.open(
                                      data[
                                        doc.key as keyof typeof data
                                      ] as string,
                                      "_blank"
                                    )
                                  }
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const link = document.createElement("a");
                                    link.href = data[
                                      doc.key as keyof typeof data
                                    ] as string;
                                    link.download = doc.label;
                                    link.click();
                                  }}
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  Download
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Upload Status */}
                          {isUploading && (
                            <div className="flex items-center gap-2 text-sm text-primary">
                              <Clock className="w-4 h-4 animate-spin" />
                              Uploading document...
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {index < docs.length - 1 && <Separator className="mt-8" />}
                </div>
              );
            })}

            {/* Tax Compliance Expiry Date */}
            {data.taxComplianceCertificateUrl && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-warning" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Tax Compliance Expiry
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="taxComplianceExpiry"
                      className="text-sm font-medium"
                    >
                      Tax Compliance Certificate Expiry Date
                    </Label>
                    <Input
                      id="taxComplianceExpiry"
                      type="date"
                      value={data.taxComplianceExpiryDate || ""}
                      onChange={(e) => {
                        updateSection({
                          taxComplianceExpiryDate: e.target.value,
                        });
                      }}
                      className="h-11 max-w-xs"
                    />
                    <p className="text-xs text-muted-foreground">
                      Set the expiry date to receive renewal reminders
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
