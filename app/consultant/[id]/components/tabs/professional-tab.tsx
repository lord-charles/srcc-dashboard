"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  Plus,
  X,
  Save,
  Loader2,
  FileText,
  CheckCircle,
  Briefcase,
  TrendingUp,
  Download,
  Eye,
  Trash2,
} from "lucide-react";
import { useConsultant } from "../consultant-context";
import { useToast } from "@/hooks/use-toast";

export function ProfessionalTab() {
  const { data, updateSection, uploadFile, saving } = useConsultant();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    position: data.position || "",
    department: data.department || "",
    yearsOfExperience: data.yearsOfExperience || 0,
    availability: data.availability || "",
    preferredWorkTypes: data.preferredWorkTypes || [],
    skills: data.skills || [],
    cvUrl: data.cvUrl || "",
  });

  const [newSkill, setNewSkill] = useState({
    name: "",
    yearsOfExperience: 0,
    proficiencyLevel: "Beginner",
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const availabilityOptions = [
    { value: "available", label: "Available", color: "text-primary" },
    {
      value: "partially_available",
      label: "Partially Available",
      color: "text-secondary-foreground",
    },
    {
      value: "not_available",
      label: "Not Available",
      color: "text-muted-foreground",
    },
  ];

  const workTypeOptions = [
    { value: "remote", label: "Remote Work", icon: "🏠" },
    { value: "onsite", label: "On-site Work", icon: "🏢" },
    { value: "hybrid", label: "Hybrid Work", icon: "🔄" },
  ];

  const proficiencyLevels = [
    { value: "Beginner", label: "Beginner", color: "bg-secondary" },
    { value: "Intermediate", label: "Intermediate", color: "bg-primary/20" },
    { value: "Expert", label: "Expert", color: "bg-primary" },
  ];

  const addSkill = () => {
    if (!newSkill.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a skill name",
        variant: "destructive",
      });
      return;
    }

    if (
      formData.skills.find(
        (s) => s.name?.toLowerCase() === newSkill.name.trim().toLowerCase()
      )
    ) {
      toast({
        title: "Duplicate Skill",
        description: "This skill already exists in your list",
        variant: "destructive",
      });
      return;
    }

    setFormData((p: any) => ({
      ...p,
      skills: [...p.skills, { ...newSkill, name: newSkill.name.trim() }],
    }));
    setNewSkill({
      name: "",
      yearsOfExperience: 0,
      proficiencyLevel: "Beginner",
    });

    toast({
      title: "Skill Added",
      description: "Skill has been added to your profile",
    });
  };

  const removeSkill = (index: number) => {
    setFormData((p) => ({
      ...p,
      skills: p.skills.filter((_, i) => i !== index),
    }));
    toast({
      title: "Skill Removed",
      description: "Skill has been removed from your profile",
    });
  };

  const toggleWorkType = (type: string) => {
    setFormData((p) => ({
      ...p,
      preferredWorkTypes: p.preferredWorkTypes.includes(type as any)
        ? p.preferredWorkTypes.filter((t) => t !== type)
        : [...p.preferredWorkTypes, type as any],
    }));
  };

  const handleCvUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please choose a file under 10 MB",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.includes("pdf")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const url = await uploadFile(file, "cvUrl");

      clearInterval(progressInterval);
      setUploadProgress(100);

      setFormData((p) => ({ ...p, cvUrl: url }));

      toast({
        title: "Upload successful",
        description: "CV uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload CV. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const removeCv = () => {
    setFormData((p) => ({ ...p, cvUrl: "" }));
    toast({
      title: "CV Removed",
      description: "CV has been removed from your profile",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSection(formData as any);
      toast({
        title: "Success",
        description: "Professional details updated successfully",
      });
    } catch (error) {
      // Error handled in context
    }
  };

  const isComplete = (field: keyof typeof formData) => {
    const value = formData[field];
    if (Array.isArray(value)) return value.length > 0;
    return !!value;
  };

  const completedFields = Object.keys(formData).filter((field) =>
    isComplete(field as keyof typeof formData)
  ).length;
  const totalFields = Object.keys(formData).length;

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">
                  Professional Information
                </h3>
                <p className="text-sm text-muted-foreground">
                  Career details and expertise
                </p>
              </div>
            </div>
            <Badge
              variant={
                completedFields === totalFields ? "default" : "secondary"
              }
              className="px-3 py-1"
            >
              {completedFields}/{totalFields} Sections Complete
            </Badge>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Information */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Briefcase className="w-6 h-6 text-primary" />
              Role Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="position"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  Position / Title
                  {isComplete("position") && (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                </Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, position: e.target.value }))
                  }
                  placeholder="e.g., Senior Consultant"
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="department"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  Department
                  {isComplete("department") && (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                </Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, department: e.target.value }))
                  }
                  placeholder="e.g., Software Engineering"
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="experience"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  Years of Experience
                  {isComplete("yearsOfExperience") && (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                </Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  max="50"
                  value={formData.yearsOfExperience}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      yearsOfExperience: Number(e.target.value) || 0,
                    }))
                  }
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="availability"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  Availability Status
                  {isComplete("availability") && (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                </Label>
                <Select
                  value={formData.availability}
                  onValueChange={(value) =>
                    setFormData((p) => ({ ...p, availability: value as any }))
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    {availabilityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className={option.color}>{option.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="flex items-center gap-2">
              Skills & Expertise
              {isComplete("skills") && (
                <CheckCircle className="w-4 h-4 text-primary" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {/* Add New Skill */}
            <div className="grid gap-4 md:grid-cols-4">
              <Input
                value={newSkill.name}
                onChange={(e) =>
                  setNewSkill((s) => ({ ...s, name: e.target.value }))
                }
                placeholder="Skill name"
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addSkill())
                }
                className="h-11"
              />
              <Input
                type="number"
                min="0"
                max="50"
                value={newSkill.yearsOfExperience}
                onChange={(e) =>
                  setNewSkill((s) => ({
                    ...s,
                    yearsOfExperience: Number(e.target.value) || 0,
                  }))
                }
                placeholder="Years"
                className="h-11"
              />
              <Select
                value={newSkill.proficiencyLevel}
                onValueChange={(value) =>
                  setNewSkill((s) => ({ ...s, proficiencyLevel: value as any }))
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {proficiencyLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${level.color}`}
                        />
                        {level.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={addSkill} className="h-11">
                <Plus className="w-4 h-4 mr-2" />
                Add Skill
              </Button>
            </div>

            {/* Skills List */}
            {formData.skills.length > 0 && (
              <div className="space-y-3">
                <Separator />
                <div className="grid gap-3">
                  {formData.skills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border"
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-foreground">
                          {skill.name}
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            skill.proficiencyLevel === "Expert"
                              ? "border-primary text-primary"
                              : skill.proficiencyLevel === "Intermediate"
                              ? "border-secondary text-secondary-foreground"
                              : "border-muted-foreground text-muted-foreground"
                          }
                        >
                          {skill.proficiencyLevel}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {skill.yearsOfExperience} year
                          {skill.yearsOfExperience !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSkill(idx)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Work Preferences */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="flex items-center gap-2">
              Work Preferences
              {isComplete("preferredWorkTypes") && (
                <CheckCircle className="w-4 h-4 text-primary" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-4">
              <Label className="text-sm font-medium">
                Preferred Work Types
              </Label>
              <div className="grid gap-3 md:grid-cols-3">
                {workTypeOptions.map((type) => (
                  <Button
                    key={type.value}
                    type="button"
                    variant={
                      formData.preferredWorkTypes.includes(type.value as any)
                        ? "default"
                        : "outline"
                    }
                    onClick={() => toggleWorkType(type.value)}
                    className="h-16 flex-col gap-2 transition-all duration-200"
                  >
                    <span className="text-2xl">{type.icon}</span>
                    <span className="text-sm">{type.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CV Upload */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-6 h-6 text-primary" />
              Curriculum Vitae
              {isComplete("cvUrl") && (
                <CheckCircle className="w-4 h-4 text-primary" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <Alert className="border-primary/20 bg-primary/5">
              <FileText className="h-4 w-4 text-primary" />
              <AlertDescription className="text-foreground">
                Upload your latest CV/résumé in PDF format. Maximum file size:
                10 MB.
              </AlertDescription>
            </Alert>

            {/* Upload Progress */}
            {uploading && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Uploading CV...</span>
                  <span className="text-muted-foreground">
                    {uploadProgress}%
                  </span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Current CV or Upload */}
            {formData.cvUrl ? (
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Current CV</p>
                    <p className="text-sm text-muted-foreground">
                      PDF document uploaded
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(formData.cvUrl, "_blank")}
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
                      link.href = formData.cvUrl;
                      link.download = "CV.pdf";
                      link.click();
                    }}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeCv}
                    className="text-destructive hover:text-destructive bg-transparent"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".pdf"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCvUpload(file);
                  }}
                  className="flex-1 h-11 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all duration-200"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            type="submit"
            disabled={saving}
            size="lg"
            className="min-w-[200px] h-12"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Update Professional Details
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
