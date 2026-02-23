"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  getProjectConfig,
  updateSystemConfig,
  createSystemConfig,
  SystemConfig,
} from "@/services/system-config.service";

export default function DepartmentsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [newDept, setNewDept] = useState("");

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const data = await getProjectConfig();
      if (data) {
        setConfig(data);
        setDepartments(data.data.departments || []);
      } else {
        // Handle case where project_config doesn't exist yet
        setConfig(null);
        setDepartments([]);
      }
    } catch (error) {
      console.error("Failed to fetch departments", error);
    } finally {
      setLoading(false);
    }
  };

  const addDepartment = () => {
    if (!newDept.trim()) return;
    if (departments.includes(newDept.trim())) {
      toast({
        title: "Error",
        description: "Department already exists",
        variant: "destructive",
      });
      return;
    }
    setDepartments([...departments, newDept.trim()]);
    setNewDept("");
  };

  const removeDepartment = (index: number) => {
    setDepartments(departments.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (config) {
        await updateSystemConfig("project_config", { departments });
      } else {
        await createSystemConfig({
          key: "project_config",
          type: "project" as any,
          data: { departments },
          description: "Project related configurations",
        });
      }
      toast({
        title: "Success",
        description: "Departments updated successfully",
      });
      fetchConfig();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save departments",
        variant: "destructive",
      });
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Departments Management</CardTitle>
          <CardDescription>
            Manage the list of departments available for project registration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Input
              placeholder="Enter department name (e.g., SBS, SRCC)"
              value={newDept}
              onChange={(e) => setNewDept(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addDepartment()}
            />
            <Button onClick={addDepartment}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          <div className="border rounded-md divide-y">
            {departments.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No departments defined. Add one above.
              </div>
            ) : (
              departments.map((dept, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium">{dept}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeDepartment(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
