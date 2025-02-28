"use client";

import type React from "react";
import { useState, useTransition } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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

import {
  DollarSign,
  User,
  Calendar,
  Mail,
  Phone,
  Search,
  Filter,
  Download,
  AlertCircle,
} from "lucide-react";
import { Amendment } from "@/types/contract";
import {
  generateContractOtp,
  verifyContractOtp,
} from "@/services/contracts.service";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "../ui/spinner";
import { useRouter } from "next/navigation";
import { NoContracts } from "./no-contracts";

interface MyContractsProps {
  initialData?: any[];
}

const MyContracts = ({ initialData = [] }: MyContractsProps) => {
  const [selectedContract, setSelectedContract] = useState<any | null>(null);
  const [otpValue, setOtpValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpGenerating, setOtpGenerating] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

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

  const statusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-500";
      case "draft":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const filteredContracts = initialData.filter(
    (contract) =>
      contract.contractNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      contract.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen ">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className=" shadow-sm z-10 flex justify-between items-center">
          <div className=" py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold ">My Contracts</h1>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 " />
              <Input
                type="text"
                placeholder="Search contracts..."
                className="pl-10 pr-4 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filter contracts</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto ">
          <div className=" px-4 sm:px-6 lg:px-8 py-8">
            {filteredContracts.length === 0 && <NoContracts />}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredContracts.map((contract) => (
                <Card
                  key={contract._id}
                  className="flex flex-col justify-between  hover:shadow-lg transition-shadow duration-200"
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold mb-1 ">
                          {contract.contractNumber}
                        </h2>
                        <p className="text-sm  line-clamp-2">
                          {contract.description}
                        </p>
                      </div>
                      <Badge
                        className={`${statusColor(
                          contract.status
                        )} text-white ml-2`}
                      >
                        {contract.status}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 " />
                        <span>{`${contract.contractValue.toLocaleString()} ${contract.currency
                          }`}</span>
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 " />
                        <span>{`${contract.contractedUserId.firstName} ${contract.contractedUserId.lastName}`}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 " />
                        <span>{`${format(
                          new Date(contract.startDate),
                          "MMM d, yyyy"
                        )} - ${format(
                          new Date(contract.endDate),
                          "MMM d, yyyy"
                        )}`}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-4 border-t">
                    <Drawer>
                      <DrawerTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedContract(contract)}
                        >
                          View Details
                        </Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <DrawerHeader className="border-b pb-4">
                          <DrawerTitle className="text-2xl font-bold">
                            {contract.contractNumber}
                          </DrawerTitle>
                          <DrawerDescription>
                            {contract.description}
                          </DrawerDescription>
                        </DrawerHeader>
                        <ScrollArea className="flex-1 px-6">
                          <Tabs defaultValue="details" className="w-full mt-4">
                            <TabsList className="grid w-full grid-cols-3 mb-4">
                              <TabsTrigger value="details">Details</TabsTrigger>
                              <TabsTrigger value="contractor">
                                Contractor
                              </TabsTrigger>
                              <TabsTrigger value="amendments">
                                Amendments
                              </TabsTrigger>
                            </TabsList>
                            <TabsContent value="details">
                              <Table>
                                <TableBody>
                                  <TableRow>
                                    <TableCell className="font-medium">
                                      Project
                                    </TableCell>
                                    <TableCell>
                                      {contract.projectId.name}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">
                                      Value
                                    </TableCell>
                                    <TableCell>{`${contract.contractValue.toLocaleString()} ${contract.currency
                                      }`}</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">
                                      Start Date
                                    </TableCell>
                                    <TableCell>
                                      {format(
                                        new Date(contract.startDate),
                                        "MMM d, yyyy"
                                      )}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">
                                      End Date
                                    </TableCell>
                                    <TableCell>
                                      {format(
                                        new Date(contract.endDate),
                                        "MMM d, yyyy"
                                      )}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">
                                      Status
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        className={`${statusColor(
                                          contract.status
                                        )} text-white`}
                                      >
                                        {contract.status}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">
                                      Created At
                                    </TableCell>
                                    <TableCell>
                                      {format(
                                        new Date(contract.createdAt),
                                        "MMM d, yyyy HH:mm"
                                      )}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">
                                      Last Updated
                                    </TableCell>
                                    <TableCell>
                                      {format(
                                        new Date(contract.updatedAt),
                                        "MMM d, yyyy HH:mm"
                                      )}
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>

                              {contract.status.toLowerCase() === "draft" && (
                                <div className="mt-6">
                                  <Button
                                    className="w-full"
                                    onClick={() =>
                                      handleGenerateOtp(contract._id)
                                    }
                                    disabled={otpGenerating}
                                  >
                                    {otpGenerating
                                      ? "Generating OTP..."
                                      : "Accept Contract"}
                                  </Button>
                                  <p className="text-sm text-muted-foreground mt-2">
                                    <AlertCircle className="inline-block w-4 h-4 mr-1" />
                                    Accepting the contract will make it active
                                    and legally binding.
                                  </p>
                                </div>
                              )}
                            </TabsContent>
                            <TabsContent value="contractor">
                              <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                  <div className="w-16 h-16 rounded-full  flex items-center justify-center text-2xl font-semibold">
                                    {contract.contractedUserId.firstName[0]}
                                    {contract.contractedUserId.lastName[0]}
                                  </div>
                                  <div>
                                    <h3 className="text-xl font-semibold">{`${contract.contractedUserId.firstName} ${contract.contractedUserId.lastName}`}</h3>
                                    <p className="text-sm ">Contractor</p>
                                  </div>
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                  <div className="flex items-center">
                                    <Mail className="w-5 h-5 mr-2 " />
                                    <span>
                                      {contract.contractedUserId.email}
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <Phone className="w-5 h-5 mr-2 " />
                                    <span>
                                      {contract.contractedUserId.phoneNumber}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </TabsContent>
                            <TabsContent value="amendments">
                              <div className="space-y-4">
                                {contract.amendments.map(
                                  (amendment: Amendment, index: number) => (
                                    <div key={index} className="p-4 rounded-lg">
                                      <p className="text-sm  mb-1">
                                        {format(
                                          new Date(
                                            amendment.date || contract.createdAt
                                          ),
                                          "MMM d, yyyy HH:mm"
                                        )}
                                      </p>
                                      <p className="font-medium mb-1">
                                        {amendment.description ||
                                          "Initial contract creation"}
                                      </p>
                                      {amendment.changedFields &&
                                        amendment.changedFields.length > 0 && (
                                          <p className="text-sm">
                                            <strong>Changed:</strong>{" "}
                                            {amendment.changedFields.join(", ")}
                                          </p>
                                        )}
                                    </div>
                                  )
                                )}
                              </div>
                            </TabsContent>
                          </Tabs>
                        </ScrollArea>
                        <DrawerFooter className="border-t">
                          <DrawerClose asChild>
                            <Button variant="outline">Close</Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </DrawerContent>
                    </Drawer>

                    <Button variant="ghost" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </main>

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
  );
};

export default MyContracts;
