"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { addTeamMember } from "@/services/projects-service"
import { CalendarIcon, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { DatePicker } from "@/components/ui/date-picker"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "../ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface AddTeamMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  projectName: string
  user: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  returnUrl?: string
}

export function AddTeamMemberDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  user,
  returnUrl,
}: AddTeamMemberDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(new Date(new Date().setFullYear(new Date().getFullYear() + 1)))
  const [responsibilities, setResponsibilities] = useState("")

  const handleAddMember = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Missing dates",
        description: "Please select both start and end dates",
        variant: "destructive",
      })
      return
    }

    if (endDate < startDate) {
      toast({
        title: "Invalid dates",
        description: "End date must be after start date",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const responsibilitiesList = responsibilities
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean)

      await addTeamMember(projectId, {
        userId: user._id,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        responsibilities: responsibilitiesList.length > 0 ? responsibilitiesList : ["Team Member"],
      })

      toast({
        title: "Success",
        description: `Added ${user.firstName} ${user.lastName} to ${projectName}`,
      })

      onOpenChange(false)
      if (returnUrl) {
        router.push(returnUrl)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add team member",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Add {user.firstName} {user.lastName} to project {projectName}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} disabled />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="end-date">End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="responsibilities">
              Responsibilities (one per line)
            </Label>
            <Textarea
              id="responsibilities"
              placeholder="Frontend Development&#10;UI/UX Design&#10;Code Review"
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddMember} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add to Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
