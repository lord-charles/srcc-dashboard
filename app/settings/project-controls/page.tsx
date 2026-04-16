"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldAlert, Timer, CheckCircle2, XCircle } from "lucide-react";
import { getProjectConfig, updateSystemConfig, createSystemConfig } from "@/services/system-config.service";

export default function ProjectControlsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [duration, setDuration] = useState("5");

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const result = await getProjectConfig();
      if (result.success) {
        setConfig(result.data);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch configuration",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnableCrud = async () => {
    setSaving(true);
    try {
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + parseInt(duration));

      let result;
      const newData = {
        ...config?.data,
        documentCrudExpiry: expiry,
      };

      if (config) {
        result = await updateSystemConfig("project_config", newData);
      } else {
        result = await createSystemConfig({
          key: "project_config",
          type: "project" as any,
          data: newData,
          description: "Project related configurations",
        });
      }

      if (result.success) {
        setConfig(result.data);
        toast({
          title: "Success",
          description: `Document CRUD enabled for ${duration} hours`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update configuration",
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDisableCrud = async () => {
    setSaving(true);
    try {
      const newData = {
        ...config?.data,
        documentCrudExpiry: new Date(0), // Set to past
      };

      const result = await updateSystemConfig("project_config", newData);
      if (result.success) {
        setConfig(result.data);
        toast({
          title: "Success",
          description: "Document CRUD disabled",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update configuration",
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isCrudEnabled = config?.data?.documentCrudExpiry && new Date(config.data.documentCrudExpiry) > new Date();
  const expiryDate = isCrudEnabled ? new Date(config.data.documentCrudExpiry) : null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Project Controls</h1>
        <p className="text-muted-foreground">
          Manage administrative overrides and safety locks for projects.
        </p>
      </div>

      <Card className="border-amber-200/50 bg-amber-50/50 dark:bg-amber-950/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <CardTitle>Document CRUD Permissions</CardTitle>
          </div>
          <CardDescription className="dark:text-amber-200/70">
            For security, deleting or updating uploaded documents is restricted. 
            Enable this temporary window to allow corrections.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isCrudEnabled ? (
            <div className="space-y-6">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-green-700 dark:text-green-400">Lock is currently OPEN</p>
                  <p className="text-sm text-green-600 dark:text-green-500">
                    Document editing and deletion is allowed until <span className="font-bold">{expiryDate?.toLocaleString()}</span>
                  </p>
                </div>
              </div>
              <Button 
                variant="destructive" 
                onClick={handleDisableCrud}
                disabled={saving}
                className="w-full sm:w-auto"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Close Lock Immediately
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-red-700 dark:text-red-400">Lock is currently CLOSED</p>
                  <p className="text-sm text-red-600 dark:text-red-500">
                    Document editing and deletion is strictly disabled across all projects.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-end gap-4">
                <div className="grid gap-2 flex-1 w-full">
                  <label className="text-sm font-medium">Enable Window Duration</label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Hour</SelectItem>
                      <SelectItem value="5">5 Hours</SelectItem>
                      <SelectItem value="10">10 Hours</SelectItem>
                      <SelectItem value="24">24 Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleEnableCrud}
                  disabled={saving}
                  className="w-full sm:w-auto px-8"
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Open Lock
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
