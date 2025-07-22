"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Plus,
  Save,
  Loader2,
  GraduationCap,
  Upload,
  Download,
  Eye,
  CheckCircle,
  Calendar,
  Building2,
  Trash2,
  FileText,
  AlertCircle,
  Shield,
} from "lucide-react"
import { useState } from "react"
import { useConsultant } from "../consultant-context"
import { useToast } from "@/hooks/use-toast"
import type { AcademicCertificate } from "@/types/consultant"

export function EducationTab() {
  const { data, updateSection, uploadFile, saving } = useConsultant()
  const { toast } = useToast()

  const [certificates, setCertificates] = useState<AcademicCertificate[]>(data.academicCertificates || [])
  const [newCertificate, setNewCertificate] = useState<Omit<AcademicCertificate, "documentUrl">>({
    name: "",
    institution: "",
    yearOfCompletion: "",
  })
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null)
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i)

  const validateCertificate = (cert: Omit<AcademicCertificate, "documentUrl">) => {
    const newErrors: Record<string, string> = {}

    if (!cert.name.trim()) {
      newErrors.name = "Certificate name is required"
    }

    if (!cert.institution.trim()) {
      newErrors.institution = "Institution name is required"
    }

    if (!cert.yearOfCompletion) {
      newErrors.yearOfCompletion = "Year of completion is required"
    }

    return newErrors
  }

  const addCertificate = () => {
    const validationErrors = validateCertificate(newCertificate)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Check for duplicate certificates
    const isDuplicate = certificates.some(
      (cert) =>
        cert.name.toLowerCase() === newCertificate.name.toLowerCase() &&
        cert.institution.toLowerCase() === newCertificate.institution.toLowerCase() &&
        cert.yearOfCompletion === newCertificate.yearOfCompletion,
    )

    if (isDuplicate) {
      toast({
        title: "Duplicate Certificate",
        description: "This certificate already exists in your list",
        variant: "destructive",
      })
      return
    }

    const certificate: AcademicCertificate = {
      ...newCertificate,
      name: newCertificate.name.trim(),
      institution: newCertificate.institution.trim(),
      documentUrl: "",
    }

    setCertificates((prev) => [...prev, certificate])
    setNewCertificate({ name: "", institution: "", yearOfCompletion: "" })
    setErrors({})

    toast({
      title: "Certificate Added",
      description: "Certificate added successfully. You can now upload the document.",
    })
  }

  const removeCertificate = (idx: number) => {
    setCertificates((prev) => prev.filter((_, i) => i !== idx))

    // Clean up any ongoing upload progress
    setUploadProgress((prev) => {
      const newProgress = { ...prev }
      delete newProgress[idx]
      return newProgress
    })

    toast({
      title: "Certificate Removed",
      description: "Certificate has been removed from your profile",
    })
  }

  const updateCertificate = (idx: number, field: keyof AcademicCertificate, value: string) => {
    setCertificates((prev) => prev.map((cert, i) => (i === idx ? { ...cert, [field]: value } : cert)))
  }

  const handleFileUpload = async (file: File, idx: number) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      })
      return
    }

    if (!file.type.includes("pdf") && !file.type.includes("image")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or image file (JPG, PNG)",
        variant: "destructive",
      })
      return
    }

    setUploadingIdx(idx)
    setUploadProgress((prev) => ({ ...prev, [idx]: 0 }))

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => ({
          ...prev,
          [idx]: Math.min((prev[idx] || 0) + 10, 90),
        }))
      }, 200)

      const url = await uploadFile(file, `certificates/${certificates[idx].name.replace(/\s+/g, "_")}`)

      clearInterval(progressInterval)
      setUploadProgress((prev) => ({ ...prev, [idx]: 100 }))

      setCertificates((prev) => prev.map((cert, i) => (i === idx ? { ...cert, documentUrl: url } : cert)))

      toast({
        title: "Upload Successful",
        description: "Certificate document uploaded successfully",
      })
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploadingIdx(null)
      setTimeout(() => {
        setUploadProgress((prev) => {
          const newProgress = { ...prev }
          delete newProgress[idx]
          return newProgress
        })
      }, 2000)
    }
  }

  const handleSave = async () => {
    try {
      await updateSection({ academicCertificates: certificates })
      toast({
        title: "Success",
        description: "Education details updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save education details. Please try again.",
        variant: "destructive",
      })
    }
  }

  const completedCertificates = certificates.filter((cert) => cert.documentUrl).length
  const totalCertificates = certificates.length

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">Education & Certifications</h3>
                <p className="text-sm text-muted-foreground">
                  {totalCertificates > 0
                    ? `${completedCertificates}/${totalCertificates} certificates with documents uploaded`
                    : "Add your academic certificates and professional qualifications"}
                </p>
              </div>
            </div>
            <Badge variant={totalCertificates > 0 ? "default" : "secondary"} className="px-3 py-1">
              {totalCertificates} Certificate{totalCertificates !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Alert className="border-primary/20 bg-primary/5">
        <Shield className="h-4 w-4 text-primary" />
        <AlertDescription className="text-foreground">
          All certificate documents are securely encrypted and stored. Supported formats: PDF, JPG, PNG (max 10MB each).
        </AlertDescription>
      </Alert>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSave()
        }}
        className="space-y-6"
      >
        {/* Add New Certificate */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Plus className="w-6 h-6 text-primary" />
              Add New Certificate
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Enter the details of your academic certificate or professional qualification
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="certName" className="text-sm font-medium">
                  Certificate Name *
                </Label>
                <Input
                  id="certName"
                  placeholder="e.g., Bachelor of Science in Computer Science"
                  value={newCertificate.name}
                  onChange={(e) => setNewCertificate((c) => ({ ...c, name: e.target.value }))}
                  className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${
                    errors.name ? "border-destructive focus:ring-destructive/20" : ""
                  }`}
                />
                {errors.name && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution" className="text-sm font-medium">
                  Institution *
                </Label>
                <Input
                  id="institution"
                  placeholder="e.g., University of Nairobi"
                  value={newCertificate.institution}
                  onChange={(e) => setNewCertificate((c) => ({ ...c, institution: e.target.value }))}
                  className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${
                    errors.institution ? "border-destructive focus:ring-destructive/20" : ""
                  }`}
                />
                {errors.institution && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    {errors.institution}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="year" className="text-sm font-medium">
                  Year of Completion *
                </Label>
                <select
                  id="year"
                  value={newCertificate.yearOfCompletion}
                  onChange={(e) => setNewCertificate((c) => ({ ...c, yearOfCompletion: e.target.value }))}
                  className={`h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:outline-none ${
                    errors.yearOfCompletion ? "border-destructive focus:ring-destructive/20" : ""
                  }`}
                >
                  <option value="">Select year</option>
                  {years.map((year) => (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  ))}
                </select>
                {errors.yearOfCompletion && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    {errors.yearOfCompletion}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button type="button" onClick={addCertificate} className="min-w-[140px] h-11">
                <Plus className="w-4 h-4 mr-2" />
                Add Certificate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Certificates List */}
        {certificates.length > 0 && (
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="flex items-center gap-2 text-xl">
                <GraduationCap className="w-6 h-6 text-primary" />
                Your Certificates ({certificates.length})
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your academic certificates and upload supporting documents
              </p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-8">
                {certificates.map((cert, idx) => {
                  const isUploading = uploadingIdx === idx
                  const progress = uploadProgress[idx]
                  const hasDocument = !!cert.documentUrl

                  return (
                    <div key={idx} className="space-y-6">
                      {/* Certificate Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <GraduationCap className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground text-lg leading-tight">{cert.name}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <div className="flex items-center gap-1">
                                  <Building2 className="w-4 h-4" />
                                  <span>{cert.institution}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{cert.yearOfCompletion}</span>
                                </div>
                                {hasDocument && (
                                  <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Document Uploaded
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          {hasDocument && (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(cert.documentUrl, "_blank")}
                                className="bg-transparent"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const link = document.createElement("a")
                                  link.href = cert.documentUrl
                                  link.download = `${cert.name}.pdf`
                                  link.click()
                                }}
                                className="bg-transparent"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            </>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeCertificate(idx)}
                            className="text-destructive hover:text-destructive bg-transparent"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Editable Fields */}
                      <div className="ml-15 grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Certificate Name</Label>
                          <Input
                            value={cert.name}
                            onChange={(e) => updateCertificate(idx, "name", e.target.value)}
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Institution</Label>
                          <Input
                            value={cert.institution}
                            onChange={(e) => updateCertificate(idx, "institution", e.target.value)}
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Year</Label>
                          <select
                            value={cert.yearOfCompletion}
                            onChange={(e) => updateCertificate(idx, "yearOfCompletion", e.target.value)}
                            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="">Select year</option>
                            {years.map((year) => (
                              <option key={year} value={year.toString()}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Document Upload Section */}
                      <div className="ml-15 space-y-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <Label className="text-sm font-medium">
                            Certificate Document
                            {hasDocument && <CheckCircle className="w-4 h-4 text-primary inline ml-1" />}
                          </Label>
                        </div>

                        {/* Upload Progress */}
                        {isUploading && progress !== undefined && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Uploading document...</span>
                              <span className="text-muted-foreground">{progress}%</span>
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
                              const file = e.target.files?.[0]
                              if (file) handleFileUpload(file, idx)
                            }}
                            className="flex-1 h-11 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all duration-200"
                          />
                          {isUploading && (
                            <Badge variant="outline" className="text-primary border-primary/20">
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Uploading...
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Upload a clear copy of your certificate. Supported formats: PDF, JPG, PNG (max 10MB)
                        </p>
                      </div>

                      {idx < certificates.length - 1 && <Separator className="mt-8" />}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {certificates.length === 0 && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Certificates Added</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                Add your academic certificates and professional qualifications to showcase your educational background.
                Each certificate includes the name, institution, year of completion, and document upload.
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>Certificate Name</span>
                </div>
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  <span>Institution</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Year</span>
                </div>
                <div className="flex items-center gap-1">
                  <Upload className="w-4 h-4" />
                  <span>Document</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        {certificates.length > 0 && (
          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" disabled={saving} size="lg" className="min-w-[200px] h-12">
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Education Details
                </>
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}
