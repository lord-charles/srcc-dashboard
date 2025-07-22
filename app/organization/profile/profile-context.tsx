"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useCallback,
} from "react";
import type {
  OrganizationData,
  ProfileContextType,
} from "@/types/organization";
import { useToast } from "@/hooks/use-toast";
import { calculateCompletion } from "@/lib/profile-utils";
import { cloudinaryService } from "@/lib/cloudinary-service";
import {
  getOrganization,
  updateOrganization,
} from "@/services/consultant.service";

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({
  children,
  organizationId,
}: {
  children: ReactNode;
  organizationId: string;
}) {
  const [data, setData] = useState<OrganizationData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchOrganizationData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getOrganization(organizationId);
      setData(result);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch organization data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [organizationId, toast]);

  useEffect(() => {
    fetchOrganizationData();
  }, [fetchOrganizationData]);

  useEffect(() => {
    const { percentage, missing } = calculateCompletion(data);
    setCompletionPercentage(percentage);
    setMissingFields(missing);
  }, [data]);

  const updateSection = async (sectionData: Partial<OrganizationData>) => {
    setSaving(true);
    try {
      await updateOrganization(organizationId, sectionData);
      setData((prev) => ({
        ...prev,
        ...sectionData,
        lastUpdated: new Date().toISOString(),
      }));
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async (file: File, field: string): Promise<string> => {
    setSaving(true);
    try {
      const url = await cloudinaryService.uploadFile(file);
      await updateOrganization(organizationId, { [field]: url });
      setData((prev) => ({
        ...prev,
        [field]: url,
        lastUpdated: new Date().toISOString(),
      }));
      toast({
        title: "Upload Successful",
        description: "Document uploaded and saved successfully.",
      });
      return url;
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload file or update profile.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const refreshData = async () => {
    await fetchOrganizationData();
  };

  const value: ProfileContextType = {
    organizationId,
    data,
    loading,
    saving,
    completionPercentage,
    missingFields,
    updateSection,
    uploadFile,
    refreshData,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
