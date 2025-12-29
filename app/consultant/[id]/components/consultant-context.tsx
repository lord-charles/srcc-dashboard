"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useToast } from "@/hooks/use-toast";
import { calculateConsultantCompletion } from "@/lib/consultant-utils";
import { cloudinaryService } from "@/lib/cloudinary-service";
import { ConsultantData, ConsultantContextType } from "@/types/consultant";
import { getConsultant, updateConsultant } from "@/services/consultant.service";

const ConsultantContext = createContext<ConsultantContextType | undefined>(
  undefined
);

import { useCallback } from "react";

export function ConsultantProfileProvider({
  children,
  consultantId,
}: {
  children: ReactNode;
  consultantId: string;
}) {
  const [data, setData] = useState<ConsultantData>({} as ConsultantData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchConsultantData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getConsultant(consultantId);
      setData(result);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch consultant data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [consultantId, toast]);

  useEffect(() => {
    fetchConsultantData();
  }, [fetchConsultantData]);

  useEffect(() => {
    if (data) {
      const { percentage, missing } = calculateConsultantCompletion(data);
      setCompletionPercentage(percentage);
      setMissingFields(missing);
    }
  }, [data]);

  const updateSection = async (sectionData: Partial<ConsultantData>) => {
    setSaving(true);
    try {
      await updateConsultant(consultantId, sectionData);
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
    try {
      const url = await cloudinaryService.uploadFile(file);
      await updateSection({ [field]: url });
      return url;
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload file",
        variant: "destructive",
      });
      throw error;
    }
  };

  const refreshData = useCallback(async () => {
    await fetchConsultantData();
  }, [fetchConsultantData]);

  const value: ConsultantContextType = {
    consultantId,
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
    <ConsultantContext.Provider value={value}>
      {children}
    </ConsultantContext.Provider>
  );
}

export function useConsultant() {
  const context = useContext(ConsultantContext);
  if (context === undefined) {
    throw new Error(
      "useConsultant must be used within a ConsultantProfileProvider"
    );
  }
  return context;
}
