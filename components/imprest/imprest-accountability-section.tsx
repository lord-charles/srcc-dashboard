"use client"

import { useState } from "react"
import { Info, MessageSquare, Copy, ReceiptIcon, PlusCircle, Trash2, SendIcon, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileUpload } from "../ui/file-upload2"
import { Imprest } from "./imprest-dashboard"
import { submitImprestAccounting } from "../../services/imprest.service"

interface Receipt {
  description: string
  amount: number
}

interface ImprestAccountabilityProps {
  imprest: Imprest
  onDuplicate: (imprest: any) => void
}

export function ImprestAccountabilitySection({
  imprest,
  onDuplicate,
}: ImprestAccountabilityProps) {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [comments, setComments] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const addReceiptRow = () => {
    setReceipts([...receipts, { description: "", amount: 0 }])
  }

  const removeReceiptRow = (index: number) => {
    const updatedReceipts = [...receipts]
    updatedReceipts.splice(index, 1)
    setReceipts(updatedReceipts)
  }

  const updateReceipt = (index: number, field: keyof Receipt, value: string | number) => {
    const updatedReceipts = [...receipts]
    updatedReceipts[index] = {
      ...updatedReceipts[index],
      [field]: field === "amount" ? Number.parseFloat(value as string) || 0 : value,
    }
    setReceipts(updatedReceipts)
  }

  const calculateTotal = () => {
    return receipts.reduce((sum, receipt) => sum + receipt.amount, 0)
  }

  const getBalanceStatus = () => {
    const total = calculateTotal()
    const balance = imprest.amount - total

    if (balance === 0) return "balanced"
    if (balance > 0) return "surplus"
    return "deficit"
  }

  const getBalanceStatusColor = () => {
    const status = getBalanceStatus()
    if (status === "balanced") return "text-emerald-600 dark:text-emerald-400"
    if (status === "surplus") return "text-amber-600 dark:text-amber-400"
    return "text-red-600 dark:text-red-400"
  }

  const handleSubmit = async () => {
    if (receipts.length === 0) {
      toast({
        variant: "destructive",
        title: "No receipts added",
        description: "Please add at least one receipt to submit accountability.",
      })
      return
    }

    try {
      setIsSubmitting(true)

        await submitImprestAccounting(imprest._id, {
          receipts,
          comments,
          receiptFiles: files
        })

        toast({
          title: "Accountability submitted",
          description: "Your imprest accountability has been submitted successfully.",
        })
        window.location.reload()

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: error || "An error occurred while submitting accountability.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const balanceStatus = getBalanceStatus()
  const balanceAmount = imprest.amount - calculateTotal()

  return (
    <TableRow>
      <TableCell colSpan={7} className="p-0 border-t-0">
        <div className="bg-emerald-50/30 dark:bg-emerald-950/10 p-6 border-t border-emerald-200/30 dark:border-emerald-800/30">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          

            {/* Approval Comments Card */}
            <Card className="shadow-sm border-border/50 overflow-hidden">
              <CardHeader className="bg-muted/30 pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-emerald-500" />
                  Approval Comments
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {imprest.hodApproval && (
                  <div className="text-sm">
                    <div className="font-medium text-xs text-muted-foreground">HOD Comment:</div>
                    <p className="mt-1 bg-muted/20 p-2 rounded-md">
                      {imprest.hodApproval.comments || "No comments provided"}
                    </p>
                  </div>
                )}
                {imprest.accountantApproval && (
                  <div className="text-sm">
                    <div className="font-medium text-xs text-muted-foreground">Accountant Comment:</div>
                    <p className="mt-1 bg-muted/20 p-2 rounded-md">
                      {imprest.accountantApproval.comments || "No comments provided"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Accountability Card */}
            <Card className="shadow-sm border-border/50 overflow-hidden">
              <CardHeader className="bg-muted/30 pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ReceiptIcon className="h-4 w-4 text-emerald-500" />
                  Accountability Info
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Imprest Amount:</span>
                    <span className="font-medium ml-2">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: "KES" }).format(imprest.amount)}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium ml-2 capitalize">{imprest.status}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Total Receipts:</span>
                    <span className="font-medium ml-2">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: "KES" }).format(calculateTotal())}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Balance:</span>
                    <span className={`font-medium ml-2 ${getBalanceStatusColor()}`}>
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: "KES" }).format(
                        Math.abs(balanceAmount),
                      )}
                      {balanceStatus === "deficit"
                        ? " (Deficit)"
                        : balanceStatus === "surplus"
                          ? " (Surplus)"
                          : " (Balanced)"}
                    </span>
                  </div>
                </div>

                {balanceStatus !== "balanced" && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Attention Required</AlertTitle>
                    <AlertDescription>
                      {balanceStatus === "surplus"
                        ? "You have a surplus. Please return the remaining amount to the finance office."
                        : "You have a deficit. Please provide an explanation for the additional expenses."}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
             
          </div>

           {/* Explanation Card */}
           <Card className="shadow-sm border-border/50 overflow-hidden mt-2">
              <CardHeader className="bg-muted/30 pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Info className="h-4 w-4 text-emerald-500" />
                  Explanation
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">{imprest.explanation || "No explanation provided"}</p>
              </CardContent>
            </Card>

          {/* Receipts Section */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-medium flex items-center gap-2">
                <ReceiptIcon className="h-4 w-4 text-emerald-500" />
                Receipt Details
              </h3>
              <Button variant="outline" size="sm" onClick={addReceiptRow} className="h-8 text-xs">
                <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                Add Receipt
              </Button>
            </div>

            <div className="bg-background rounded-lg border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60%]">Description</TableHead>
                    <TableHead className="w-[30%]">Amount (KES)</TableHead>
                    <TableHead className="w-[10%] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                        No receipts added. Click &quot;Add Receipt&quot; to begin.
                      </TableCell>
                    </TableRow>
                  ) : (
                    receipts.map((receipt, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            value={receipt.description}
                            onChange={(e) => updateReceipt(index, "description", e.target.value)}
                            placeholder="Enter receipt description"
                            className="text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={receipt.amount || ""}
                            onChange={(e) => updateReceipt(index, "amount", e.target.value)}
                            placeholder="0.00"
                            className="text-sm"
                            step="0.01"
                            min="0"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeReceiptRow(index)}
                                  className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Remove receipt</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {receipts.length > 0 && (
                    <TableRow className="bg-muted/20">
                      <TableCell className="font-medium">Total</TableCell>
                      <TableCell colSpan={2} className="font-medium">
                        {new Intl.NumberFormat("en-US", { style: "currency", currency: "KES" }).format(
                          calculateTotal(),
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="receipt-files" className="text-base font-medium flex items-center gap-2 mb-4">
                <ReceiptIcon className="h-4 w-4 text-emerald-500" />
                Receipt Attachments
              </Label>
              <FileUpload
                value={files}
                onChange={setFiles}
                maxFiles={10}
                maxSize={10 * 1024 * 1024} // 10MB
                acceptedTypes={[
                  "application/pdf",
                  "image/jpeg",
                  "image/png",
                  "image/heic",
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                  "application/vnd.ms-excel",
                ]}
              />
            </div>

            <div>
              <Label htmlFor="comments" className="text-base font-medium flex items-center gap-2 mb-4">
                <MessageSquare className="h-4 w-4 text-emerald-500" />
                Additional Comments
              </Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add any additional information or explanation about your receipts..."
                className="min-h-[225px]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-end gap-3 mt-6">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/30 dark:text-emerald-400"
              onClick={() => onDuplicate(imprest)}
            >
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              Duplicate Request
            </Button>

            <Button
              variant="default"
              size="sm"
              className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-600"
              onClick={handleSubmit}
              disabled={isSubmitting || receipts.length === 0}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-1.5 h-3.5 w-3.5 border-2 border-t-transparent rounded-full" />
                  Submitting...
                </>
              ) : (
                <>
                  <SendIcon className="mr-1.5 h-3.5 w-3.5" />
                  Submit Accountability
                </>
              )}
            </Button>
          </div>
        </div>
      </TableCell>
    </TableRow>
  )
}
