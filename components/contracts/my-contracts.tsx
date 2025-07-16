"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DollarSign,
  User,
  Calendar,
  Search,
  MoreHorizontal,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  SlidersHorizontal,
  X,
  Eye,
  CalendarClock,
  ArrowDownToLine,
  Share2,
  Star,
  StarHalf,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { NoContracts } from "./no-contracts"
import { MyContractDetailsDrawer } from "./contracts/components/my-contract-details-drawer"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { generateContractOtp, verifyContractOtp } from "@/services/contracts.service"
import { Spinner } from "../ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface MyContractsProps {
  initialData?: any[]
  isLoading?: boolean
}

const MyContracts = ({ initialData = [], isLoading = false }: MyContractsProps) => {
  const [selectedContract, setSelectedContract] = useState<any | null>(null)
  const [otpValue, setOtpValue] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [otpDialogOpen, setOtpDialogOpen] = useState(false)
  const [otpGenerating, setOtpGenerating] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleGenerateOtp = async (contractId: string) => {
    if (otpGenerating) return;

    setOtpGenerating(true);
    try {
      const result = await generateContractOtp(contractId);
      if (result) {
        setOtpDialogOpen(true);
        toast({
          title: "Success",
          description: "OTP has been sent to your email",
        });
      } else {
        toast({
          title: "Failed to generate OTP",
          description: "Please try again",
        });
      }
    } catch (error) {
      console.error("Error generating OTP:", error);
      toast({
        title: "Failed to generate OTP",
        description: "Please try again",
      });
    } finally {
      setOtpGenerating(false);
    }
  };

  const handleVerifyOtp = async (contractId: string) => {
    if (otpVerifying || !otpValue || otpValue.length !== 6) return;

    setOtpVerifying(true);
    try {
      const result = await verifyContractOtp(contractId, otpValue);
      if (result) {
        toast({
          title: "Contract accepted successfully",
          description: "Contract has been accepted successfully",
        });
        setOtpDialogOpen(false);
        setOtpValue("");
        router.refresh();
      } else {
        toast({
          title: "Invalid OTP",
          description: "Please try again",
        });
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast({
        title: "Failed to verify OTP",
        description: `${error}` || "Please try again",
        variant: "destructive",
      });
    } finally {
      setOtpVerifying(false);
    }
  };


  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "pending_acceptance":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const statusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-300"
      case "pending_acceptance":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  // Calculate contract statistics
  const activeContracts = initialData.filter((c) => c.status.toLowerCase() === "active").length
  const pendingContracts = initialData.filter((c) => c.status.toLowerCase() === "pending_acceptance").length
  const totalValue = initialData.reduce((sum, contract) => sum + contract.contractValue, 0)

  // Filter and sort contracts
  const filteredAndSortedContracts = initialData
    .filter((contract) => {
      const matchesSearch =
        contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || contract.status.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "value-high":
          return b.contractValue - a.contractValue
        case "value-low":
          return a.contractValue - b.contractValue
        case "end-date":
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
        default:
          return 0
      }
    })

  // Calculate days remaining for each contract
  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const today = new Date()
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setSortBy("newest")
    setShowFilters(false)
  }

  // Handle contract download
  const handleDownload = (contractId: string) => {
    toast({
      title: "Download Started",
      description: "Your contract is being prepared for download",
    })
  }

  // Calculate contract health score (mock function)
  const getContractHealthScore = (contract: any) => {
    const daysRemaining = calculateDaysRemaining(contract.endDate)
    const totalDuration =
      (new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime()) / (1000 * 60 * 60 * 24)
    const percentRemaining = (daysRemaining / totalDuration) * 100

    // Score based on time remaining and status
    let score = 0

    // Status factor
    if (contract.status.toLowerCase() === "active") {
      score += 50
    } else if (contract.status.toLowerCase() === "pending_acceptance") {
      score += 30
    }

    // Time factor
    if (percentRemaining > 50) {
      score += 50
    } else if (percentRemaining > 20) {
      score += 30
    } else if (percentRemaining > 10) {
      score += 20
    } else {
      score += 10
    }

    return score
  }

  // Render health score stars
  const renderHealthScore = (score: number) => {
    const fullStars = Math.floor(score / 20)
    const hasHalfStar = score % 20 >= 10

    return (
      <div className="flex items-center" aria-label={`Health score: ${score} out of 100`}>
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          } else if (i === fullStars && hasHalfStar) {
            return <StarHalf key={i} className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          } else {
            return <Star key={i} className="h-3.5 w-3.5 text-gray-300" />
          }
        })}
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Contracts</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage and track all your contract agreements
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search contracts..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              className={showFilters ? "bg-gray-100 dark:bg-gray-800" : ""}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="sr-only">Toggle filters</span>
            </Button>
          </div>
        </div>

        {/* Advanced filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Advanced Filters</h3>
              <Button variant="ghost" size="sm" className="text-xs h-8" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="status-filter" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending_acceptance">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="sort-by" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Sort By
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="value-high">Highest Value</SelectItem>
                    <SelectItem value="value-low">Lowest Value</SelectItem>
                    <SelectItem value="end-date">End Date (Soonest)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats overview */}
      <div className="px-6 py-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                      <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                    <div className="mt-4">
                      <Skeleton className="h-2 w-full" />
                      <Skeleton className="h-3 w-24 mt-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-300">Active Contracts</p>
                        <h3 className="text-2xl font-bold mt-1 text-green-900 dark:text-green-100">
                          {activeContracts}
                        </h3>
                      </div>
                      <div className="h-10 w-10 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-green-700 dark:text-green-300" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <Progress
                        value={(activeContracts / (initialData.length || 1)) * 100}
                        className="h-1.5 bg-green-200 dark:bg-green-800"
                      >
                        <div
                          className="h-full bg-green-600 dark:bg-green-400"
                          style={{ width: `${(activeContracts / (initialData.length || 1)) * 100}%` }}
                        />
                      </Progress>
                      <p className="text-xs text-green-800 dark:text-green-300 mt-1.5">
                        {Math.round((activeContracts / (initialData.length || 1)) * 100)}% of total contracts
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Pending Contracts</p>
                        <h3 className="text-2xl font-bold mt-1 text-amber-900 dark:text-amber-100">
                          {pendingContracts}
                        </h3>
                      </div>
                      <div className="h-10 w-10 bg-amber-200 dark:bg-amber-800 rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <Progress
                        value={(pendingContracts / (initialData.length || 1)) * 100}
                        className="h-1.5 bg-amber-200 dark:bg-amber-800"
                      >
                        <div
                          className="h-full bg-amber-600 dark:bg-amber-400"
                          style={{ width: `${(pendingContracts / (initialData.length || 1)) * 100}%` }}
                        />
                      </Progress>
                      <p className="text-xs text-amber-800 dark:text-amber-300 mt-1.5">
                        {Math.round((pendingContracts / (initialData.length || 1)) * 100)}% of total contracts
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20">
                <CardContent className="p-4">
                  <div className="p-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Total Contract Value</p>
                        <h3 className="text-2xl font-bold mt-1 text-blue-900 dark:text-blue-100">
                          {totalValue.toLocaleString()} {initialData[0]?.currency || "KES"}
                        </h3>
                      </div>
                      <div className="h-10 w-10 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center text-xs">
                        <span className="text-blue-700 dark:text-blue-300 flex items-center">
                          <ChevronRight className="h-4 w-4 rotate-90" />
                          12% increase
                        </span>
                        <span className="ml-auto text-blue-600/70 dark:text-blue-400/70">from last month</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Contracts list */}
      <div className="px-6 pb-6">
        <Tabs defaultValue="grid" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Contract List</h2>
              {!isLoading && filteredAndSortedContracts.length > 0 && (
                <Badge variant="outline" className="text-xs font-normal">
                  {filteredAndSortedContracts.length}{" "}
                  {filteredAndSortedContracts.length === 1 ? "contract" : "contracts"}
                </Badge>
              )}
            </div>
            <TabsList>
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="grid">
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="p-1">
                      <Skeleton className="h-1.5 w-full" />
                    </div>
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </div>
                      <div className="space-y-3 mt-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between p-3 pt-2 border-t">
                      <Skeleton className="h-9 w-24" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : filteredAndSortedContracts.length === 0 ? (
              <NoContracts />
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredAndSortedContracts.map((contract) => {
                  const daysRemaining = calculateDaysRemaining(contract.endDate)
                  const progress = Math.min(
                    100,
                    Math.max(
                      0,
                      ((new Date().getTime() - new Date(contract.startDate).getTime()) /
                        (new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime())) *
                        100,
                    ),
                  )
                  const healthScore = getContractHealthScore(contract)

                  return (
                    <Card
                      key={contract._id}
                      className="flex flex-col justify-between overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="p-1 relative top-[-7px] w-full">
                        <div
                          className={`w-full rounded-md h-1.5 ${
                            progress > 75
                              ? "bg-red-100 dark:bg-red-950/50"
                              : progress > 50
                                ? "bg-amber-100 dark:bg-amber-950/50"
                                : "bg-green-100 dark:bg-green-950/50"
                          }`}
                        >
                          <div
                            className={`h-full rounded-md ${
                              progress > 75
                                ? "bg-red-500 dark:bg-red-600"
                                : progress > 50
                                  ? "bg-amber-500 dark:bg-amber-600"
                                  : "bg-green-500 dark:bg-green-600"
                            } transition-all duration-500 ease-in-out`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h2 className="text-base font-semibold mb-1 text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                              {contract.contractNumber}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                              {contract.description}
                            </p>
                          </div>
                          <Badge
                            className={`${statusColor(contract.status)} flex items-center gap-1 ml-2 border`}
                            variant="outline"
                          >
                            {getStatusIcon(contract.status)}
                            <span className="whitespace-nowrap">{contract.status}</span>
                          </Badge>
                        </div>
                        <div className="space-y-2.5 text-sm">
                          <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <DollarSign className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                            <span className="font-medium">{`${contract.contractValue.toLocaleString()} ${contract.currency}`}</span>
                          </div>
                          <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <User className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                            <span>{`${contract.contractedUserId.firstName} ${contract.contractedUserId.lastName}`}</span>
                          </div>
                          <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <Calendar className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                            <span>{`${format(new Date(contract.startDate), "MMM d, yyyy")} - ${format(
                              new Date(contract.endDate),
                              "MMM d, yyyy",
                            )}`}</span>
                          </div>
                          <div className="pt-1.5 border-t border-gray-100 dark:border-gray-800">
                            <div className="flex justify-between items-center text-xs mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-gray-600 dark:text-gray-400">Health Score:</span>
                                {renderHealthScore(healthScore)}
                              </div>
                              <span
                                className={`font-medium ${
                                  daysRemaining < 30
                                    ? "text-red-600 dark:text-red-400"
                                    : daysRemaining < 90
                                      ? "text-amber-600 dark:text-amber-400"
                                      : "text-green-600 dark:text-green-400"
                                }`}
                              >
                                {daysRemaining} days left
                              </span>
                            </div>
                            <div className="relative">
                              <Progress value={progress} className="h-1.5" />
                              <div className="absolute -bottom-4 left-0 w-full flex justify-between text-[10px] text-gray-500 dark:text-gray-400 px-0.5">
                                <span>Start</span>
                                <span>End</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between p-3 pt-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                        <MyContractDetailsDrawer
                          contract={contract}
                          trigger={
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedContract(contract)}
                              className="gap-1.5 text-xs h-8"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View Details
                            </Button>
                          }
                          open={selectedContract?._id === contract._id}
                          onOpenChange={(open) => {
                            if (!open) setSelectedContract(null)
                          }}
                          onClose={() => setSelectedContract(null)}
                          onGenerateOtp={handleGenerateOtp}
                          otpGenerating={otpGenerating}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">More options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleDownload(contract._id)}>
                              <ArrowDownToLine className="mr-2 h-4 w-4" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CalendarClock className="mr-2 h-4 w-4" />
                              View Timeline
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Share2 className="mr-2 h-4 w-4" />
                              Share Contract
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="list">
            {isLoading ? (
              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Contract</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Value</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Timeline</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Health</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <tr key={i} className="border-b border-gray-200 dark:border-gray-800">
                          <td className="px-4 py-3">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-48 mt-1" />
                          </td>
                          <td className="px-4 py-3">
                            <Skeleton className="h-5 w-20" />
                          </td>
                          <td className="px-4 py-3">
                            <Skeleton className="h-6 w-24 rounded-full" />
                          </td>
                          <td className="px-4 py-3">
                            <Skeleton className="h-4 w-32 mb-1" />
                            <Skeleton className="h-2 w-24" />
                          </td>
                          <td className="px-4 py-3">
                            <Skeleton className="h-4 w-24" />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-8 w-20 rounded" />
                              <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : filteredAndSortedContracts.length === 0 ? (
              <NoContracts />
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Contract</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Value</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Timeline</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Health</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {filteredAndSortedContracts.map((contract) => {
                        const daysRemaining = calculateDaysRemaining(contract.endDate)
                        const progress = Math.min(
                          100,
                          Math.max(
                            0,
                            ((new Date().getTime() - new Date(contract.startDate).getTime()) /
                              (new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime())) *
                              100,
                          ),
                        )
                        const healthScore = getContractHealthScore(contract)

                        return (
                          <tr key={contract._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 group">
                            <td className="px-4 py-3">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                                  {contract.contractNumber}
                                </div>
                                <div className="text-gray-500 dark:text-gray-400 text-xs mt-1 max-w-xs truncate">
                                  {contract.description}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium">
                              {`${contract.contractValue.toLocaleString()} ${contract.currency}`}
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                className={`${statusColor(contract.status)} flex items-center gap-1 border`}
                                variant="outline"
                              >
                                {getStatusIcon(contract.status)}
                                <span className="whitespace-nowrap">{contract.status}</span>
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                {format(new Date(contract.startDate), "MMM d, yyyy")} -{" "}
                                {format(new Date(contract.endDate), "MMM d, yyyy")}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="relative w-24">
                                  <Progress value={progress} className="h-1.5" />
                                </div>
                                <span
                                  className={`text-xs font-medium ${
                                    daysRemaining < 30
                                      ? "text-red-600 dark:text-red-400"
                                      : daysRemaining < 90
                                        ? "text-amber-600 dark:text-amber-400"
                                        : "text-green-600 dark:text-green-400"
                                  }`}
                                >
                                  {daysRemaining} days left
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                {renderHealthScore(healthScore)}
                                <span className="text-xs text-gray-500 dark:text-gray-400">({healthScore}/100)</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <MyContractDetailsDrawer
                                  contract={contract}
                                  trigger={
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setSelectedContract(contract)}
                                      className="h-8 text-xs"
                                    >
                                      Details
                                    </Button>
                                  }
                                  open={selectedContract?._id === contract._id}
                                  onOpenChange={(open) => {
                                    if (!open) setSelectedContract(null)
                                  }}
                                  onClose={() => setSelectedContract(null)}
                                  onGenerateOtp={handleGenerateOtp}
                                  otpGenerating={otpGenerating}
                                />
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">More options</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={() => handleDownload(contract._id)}>
                                      <ArrowDownToLine className="mr-2 h-4 w-4" />
                                      Download PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <CalendarClock className="mr-2 h-4 w-4" />
                                      View Timeline
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                      <Share2 className="mr-2 h-4 w-4" />
                                      Share Contract
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

            {/* OTP Verification Dialog */}
            <Dialog open={otpDialogOpen} onOpenChange={setOtpDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Contract Acceptance</DialogTitle>
            <DialogDescription>
              Enter the 6-digit OTP sent to your email to confirm contract
              acceptance.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-4">
            <InputOTP
              maxLength={6}
              value={otpValue}
              onChange={(value) => setOtpValue(value)}
              disabled={otpVerifying}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>

            <p className="text-sm text-muted-foreground mt-4">
              Didn&apos;t receive the code?{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() =>
                  selectedContract && handleGenerateOtp(selectedContract._id)
                }
                disabled={otpGenerating}
              >
                Resend
              </Button>
            </p>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setOtpDialogOpen(false);
                setOtpValue("");
              }}
              disabled={otpVerifying}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedContract && handleVerifyOtp(selectedContract._id)
              }
              disabled={otpVerifying || otpValue.length !== 6}
              className="min-w-24"
            >
              {otpVerifying ? (
                <div className="flex items-center space-x-2">
                  <Spinner /> <span>Verifying...</span>
                </div>
              ) : (
                "Verify"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MyContracts

