"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit2, Trash2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChartOfAccounts, ObjectCode } from "@/types/charts-of-accounts";
import { updateChart } from "@/services/charts-of-accounts.service";
import ObjectCodeFormDialog from "../dialogs/object-code-form-dialog";

interface ObjectCodesTabProps {
  chart: ChartOfAccounts;
  onUpdate: (updatedChart: ChartOfAccounts) => void;
}

export default function ObjectCodesTab({ chart, onUpdate }: ObjectCodesTabProps) {
  const [objectCodes, setObjectCodes] = useState<ObjectCode[]>(chart.objectCodes || []);

  // Sync state with props
  React.useEffect(() => {
    setObjectCodes(chart.objectCodes || []);
  }, [chart.objectCodes]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingObjectCode, setEditingObjectCode] = useState<ObjectCode | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAddObjectCode = () => {
    setEditingObjectCode(null);
    setDialogOpen(true);
  };

  const handleEditObjectCode = (objectCode: ObjectCode) => {
    setEditingObjectCode(objectCode);
    setDialogOpen(true);
  };

  const handleDeleteObjectCode = async (objectCode: string) => {
    if (!confirm(`Delete object code ${objectCode}? This cannot be undone.`)) return;

    try {
      setLoading(true);
      const updatedObjectCodes = objectCodes.filter((o) => o.objectCode !== objectCode);
      await updateChart(chart.chartCode, { objectCodes: updatedObjectCodes });
      setObjectCodes(updatedObjectCodes);
      onUpdate({ ...chart, objectCodes: updatedObjectCodes });
      toast({
        title: "Success",
        description: "Object code deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete object code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveObjectCode = async (objectCode: ObjectCode) => {
    try {
      setLoading(true);
      let updatedObjectCodes: ObjectCode[];

      if (editingObjectCode) {
        updatedObjectCodes = objectCodes.map((o) =>
          o.objectCode === editingObjectCode.objectCode ? objectCode : o,
        );
      } else {
        updatedObjectCodes = [...objectCodes, objectCode];
      }

      await updateChart(chart.chartCode, { objectCodes: updatedObjectCodes });
      setObjectCodes(updatedObjectCodes);
      onUpdate({ ...chart, objectCodes: updatedObjectCodes });
      setDialogOpen(false);
      setEditingObjectCode(null);

      toast({
        title: "Success",
        description: editingObjectCode
          ? "Object code updated successfully"
          : "Object code created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save object code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{objectCodes.length} object codes</p>
        <Button onClick={handleAddObjectCode} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Object Code
        </Button>
      </div>

      {objectCodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-8 border rounded-lg">
          <AlertCircle className="w-8 h-8 opacity-50" />
          <p>No object codes yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Object Code</TableHead>
                <TableHead>Object Code Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {objectCodes.map((objectCode) => (
                <TableRow key={objectCode.objectCode}>
                  <TableCell className="font-medium">{objectCode.objectCode}</TableCell>
                  <TableCell>{objectCode.objectCodeName}</TableCell>
                  <TableCell>
                    <span className="text-xs bg-muted px-2 py-1 rounded">{objectCode.type}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditObjectCode(objectCode)}
                        disabled={loading}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteObjectCode(objectCode.objectCode)}
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ObjectCodeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        objectCode={editingObjectCode}
        onSave={handleSaveObjectCode}
        loading={loading}
      />
    </div>
  );
}
