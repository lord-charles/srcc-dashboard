"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChartOfAccounts, Account } from "@/types/charts-of-accounts";
import { updateChart } from "@/services/charts-of-accounts.service";
import AccountFormDialog from "../dialogs/account-form-dialog";

interface AccountsTabProps {
  chart: ChartOfAccounts;
  onUpdate: (updatedChart: ChartOfAccounts) => void;
}

export default function AccountsTab({ chart, onUpdate }: AccountsTabProps) {
  const [accounts, setAccounts] = useState<Account[]>(chart.accounts || []);

  // Update accounts when chart prop changes
  React.useEffect(() => {
    setAccounts(chart.accounts || []);
  }, [chart.accounts]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const toggleExpanded = (accountNumber: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(accountNumber)) {
      newExpanded.delete(accountNumber);
    } else {
      newExpanded.add(accountNumber);
    }
    setExpandedRows(newExpanded);
  };

  const handleAddAccount = () => {
    setEditingAccount(null);
    setDialogOpen(true);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setDialogOpen(true);
  };

  const handleDeleteAccount = async (accountNumber: string) => {
    if (!confirm(`Delete account ${accountNumber}? This cannot be undone.`)) return;

    try {
      setLoading(true);
      const updatedAccounts = accounts.filter((a) => a.accountNumber !== accountNumber);
      await updateChart(chart.chartCode, { accounts: updatedAccounts });
      setAccounts(updatedAccounts);
      onUpdate({ ...chart, accounts: updatedAccounts });
      toast({
        title: "Success",
        description: "Account deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAccount = async (account: Account) => {
    try {
      setLoading(true);
      let updatedAccounts: Account[];

      if (editingAccount) {
        updatedAccounts = accounts.map((a) =>
          a.accountNumber === editingAccount.accountNumber ? account : a,
        );
      } else {
        updatedAccounts = [...accounts, account];
      }

      await updateChart(chart.chartCode, { accounts: updatedAccounts });
      setAccounts(updatedAccounts);
      onUpdate({ ...chart, accounts: updatedAccounts });
      setDialogOpen(false);
      setEditingAccount(null);

      toast({
        title: "Success",
        description: editingAccount ? "Account updated successfully" : "Account created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{accounts.length} accounts</p>
        <Button onClick={handleAddAccount} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Account
        </Button>
      </div>

      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-8 border rounded-lg">
          <AlertCircle className="w-8 h-8 opacity-50" />
          <p>No accounts yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Account Number</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead className="text-right">Sub Accounts</TableHead>
                <TableHead className="text-right">Mappings</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <React.Fragment key={account.accountNumber}>
                  <TableRow>
                    <TableCell>
                      {account.subAccounts && account.subAccounts.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(account.accountNumber)}
                          className="p-0 h-8 w-8"
                        >
                          {expandedRows.has(account.accountNumber) ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{account.accountNumber}</TableCell>
                    <TableCell>{account.accountName}</TableCell>
                    <TableCell className="text-right">
                      {account.subAccounts?.length || 0}
                    </TableCell>
                    <TableCell className="text-right">{account.mappings?.length || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAccount(account)}
                          disabled={loading}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAccount(account.accountNumber)}
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {expandedRows.has(account.accountNumber) &&
                    account.subAccounts &&
                    account.subAccounts.length > 0 && (
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={6}>
                          <div className="py-4">
                            <p className="text-sm font-semibold mb-3">Sub Accounts</p>
                            <div className="space-y-2">
                              {account.subAccounts.map((subAccount) => (
                                <div
                                  key={subAccount.subAccountNumber}
                                  className="flex justify-between items-center p-3 bg-background rounded border text-sm"
                                >
                                  <div>
                                    <p className="font-medium">{subAccount.subAccountNumber}</p>
                                    <p className="text-muted-foreground">{subAccount.subAccountName}</p>
                                  </div>
                                  <span className="text-xs bg-muted px-2 py-1 rounded">
                                    {subAccount.type}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AccountFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        account={editingAccount}
        onSave={handleSaveAccount}
        loading={loading}
      />
    </div>
  );
}
