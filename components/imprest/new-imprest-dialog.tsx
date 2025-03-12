import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { AlertCircle, Calendar, Check, CreditCard, DollarSign, Info, Loader2, X } from 'lucide-react'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  paymentReason: z.string().min(5, {
    message: "Payment reason must be at least 5 characters.",
  }).max(100, {
    message: "Payment reason must not exceed 100 characters."
  }),
  currency: z.string({
    required_error: "Please select a currency.",
  }),
  amount: z.coerce.number({
    required_error: "Please enter an amount.",
    invalid_type_error: "Amount must be a number.",
  }).positive({
    message: "Amount must be greater than 0.",
  }),
  paymentType: z.string({
    required_error: "Please select a payment type.",
  }),
  explanation: z.string().min(10, {
    message: "Explanation must be at least 10 characters.",
  }).max(500, {
    message: "Explanation must not exceed 500 characters."
  }),

})

export type FormValues = z.infer<typeof formSchema>

// Currency options
const currencies = [
  { value: "USD", label: "USD - US Dollar", symbol: "$" },
  { value: "EUR", label: "EUR - Euro", symbol: "€" },
  { value: "GBP", label: "GBP - British Pound", symbol: "£" },
  { value: "KES", label: "KES - Kenyan Shilling", symbol: "KSh" },
]

// Payment type options
const paymentTypes = [
  { value: "Contingency Cash", label: "Contingency Cash" },
  { value: "Purchase Cash", label: "Purchase Cash" },
  { value: "Travel Cash", label: "Travel Cash" },
  { value: "Others", label: "Others" },
]


interface NewImprestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: FormValues) => Promise<void>
}

export function NewImprestModal({ open, onOpenChange, onSubmit }: NewImprestModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  
  // Initialize the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentReason: "",
      currency: "USD",
      amount: undefined,
      paymentType: "Contingency Cash",
      explanation: "",
    },
  })
  
  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      // If onSubmit is provided, call it with the form values
      if (onSubmit) {
        await onSubmit(values)
      }
      
      // Show success toast
      toast({
        title: "Imprest request submitted",
        description: "Your imprest request has been submitted successfully.",
      })
      
      // Close the modal
      onOpenChange(false)
      
      // Reset the form
      form.reset()
    } catch (err) {
      // Handle error
      setError(err instanceof Error ? err.message : "An error occurred while submitting your request.")
      
      // Show error toast
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: "There was an error submitting your imprest request.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Get the selected currency symbol
  const selectedCurrency = form.watch("currency")
  const currencySymbol = currencies.find(c => c.value === selectedCurrency)?.symbol || "$"
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl flex flex-col">
        <DialogHeader className="pb-2 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">New Imprest Request</DialogTitle>
              <DialogDescription className="text-sm mt-1">
                Create a new imprest application for approval
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4 pr-2">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <FormField
                  control={form.control}
                  name="paymentReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Reason <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Google Cloud Payment" 
                          {...field} 
                          className="bg-background"
                        />
                      </FormControl>
                      <FormDescription>
                        Brief reason for the imprest request
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

<FormField
                  control={form.control}
                  name="paymentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Type <span className="text-destructive">*</span></FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select payment type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {paymentTypes.map((type) => (
                            <SelectItem 
                              key={type.value} 
                              value={type.value}
                            >
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>
                
           
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency <span className="text-destructive">*</span></FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem 
                              key={currency.value} 
                              value={currency.value}
                              className="flex items-center gap-2"
                            >
                              <span className="font-medium">{currency.symbol}</span> {currency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="relative flex items-center ">
                          <div className="absolute inset-y-0 left-2 flex items-center pl-3 pointer-events-none">
                            <span className="text-muted-foreground">{currencySymbol}</span>
                          </div>
                          <Input 
                            type="number" 
                            step="0.01" 
                            min="0" 
                            placeholder="0.00" 
                            className="pl-16 bg-background"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === "" ? undefined : parseFloat(value));
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
              
              </div>
              
   
              <FormField
                control={form.control}
                name="explanation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Explanation <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide a detailed explanation for this imprest request..." 
                        className="min-h-[120px] resize-y bg-background"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription className="flex justify-between">
                      <span>Detailed explanation of the imprest request</span>
                      <span className={`text-xs ${field.value.length > 450 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                        {field.value.length}/500
                      </span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium">Important Information</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your imprest request will be reviewed by your Head of Department and the Accountant before approval.
                      Please ensure all information is accurate and complete.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </div>
        
        <DialogFooter className="flex justify-between border-t pt-4 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => form.reset()}
              className="gap-2"
            >
              <AlertCircle className="h-4 w-4" />
              Reset Form
            </Button>
            
            <Button
              type="submit"
              disabled={isSubmitting}
              onClick={form.handleSubmit(handleSubmit)}
              className="gap-2 min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}