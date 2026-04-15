"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { sendLpoEmail } from "@/services/lpo.service";
import { Lpo } from "@/types/lpo";
import html2pdf from "html2pdf.js";

interface DispatchLpoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lpo: Lpo | null;
  projectCurrency: string;
}

export function DispatchLpoDialog({
  open,
  onOpenChange,
  lpo,
  projectCurrency,
}: DispatchLpoDialogProps) {
  const { toast } = useToast();
  const [ccEmails, setCcEmails] = useState("");
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  const generatePdf = async (): Promise<string> => {
    if (!pdfContainerRef.current) throw new Error("Template mapping failed.");

    const opt = {
      margin: 0.5,
      filename: `${lpo?.lpoNo.replace(/\//g, "_")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    } as const;

    // Return the pdf as base64 string
    const pdfBase64 = await html2pdf()
      .set(opt)
      .from(pdfContainerRef.current)
      .outputPdf("datauristring");
    return pdfBase64;
  };

  const handleDownload = async () => {
    try {
      setIsProcessing(true);
      if (!pdfContainerRef.current) return;
      const opt = {
        margin: 0.5,
        filename: `${lpo?.lpoNo.replace(/\//g, "_")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      } as const;
      await html2pdf().set(opt).from(pdfContainerRef.current).save();
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to download PDF.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDispatch = async () => {
    if (!lpo) return;
    try {
      setIsProcessing(true);
      const pdfBase64 = await generatePdf();

      const ccArray = ccEmails
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e);

      const result = await sendLpoEmail(lpo._id, {
        pdfBase64,
        ccEmails: ccArray,
        message,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "LPO Dispatched successfully via Email.",
        });
        onOpenChange(false);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to dispatch",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed processing LPO.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!lpo) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Dispatch LPO {lpo.lpoNo}</DialogTitle>
            <DialogDescription>
              Forward this LPO directly to the supplier&apos;s registered email
              ({lpo.supplierId?.email}).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cc">CC Emails (comma separated)</Label>
              <Input
                id="cc"
                value={ccEmails}
                onChange={(e) => setCcEmails(e.target.value)}
                placeholder="manager@example.com, finance@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Custom Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please find the attached Local Purchase Order..."
                className="h-24"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-end mt-4">
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                "Download PDF"
              )}
            </Button>
            <Button onClick={handleDispatch} disabled={isProcessing}>
              {isProcessing && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Send Email
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden LPO Template for html2pdf ingestion */}
      <div className="hidden">
        <div
          ref={pdfContainerRef}
          className="p-8 text-black bg-white w-[800px] border"
          style={{ fontFamily: "Arial, sans-serif" }}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="font-bold text-lg mb-1">
                Strathmore Research & Consultancy Centre Limited
              </h1>
              <p className="text-sm border-b pb-1 mb-1">
                MADARAKA ESTATE, OLE SANGALE ROAD
              </p>
              <p className="text-sm">
                PO BOX 59857 - 00200 CITY SQUARE, NAIROBI
              </p>
              <p className="text-sm">Tel: +254 703 034244</p>
              <p className="text-sm">PIN: P051149547H | VAT: 0149495Z</p>
            </div>
            <div className="text-right">
              {/* Dummy SRCC Logo */}
              <div className="text-[#c8a065] text-4xl font-extrabold pb-2 mb-2 border-b-2 border-black inline-block">
                SRCC<span className="text-black">.</span>
              </div>
              <p className="italic text-sm text-gray-700 font-serif">
                Sharing Knowledge
              </p>
            </div>
          </div>

          <div className="bg-[#8b9cb3] text-blue-900 text-center font-bold py-2 px-4 border border-black mb-4">
            LOCAL PURCHASE ORDER
          </div>

          <div className="flex justify-between mb-6">
            <div className="border border-black flex-1 mr-2">
              <div className="border-b border-black flex">
                <span className="w-24 border-r border-black font-bold p-1">
                  Name:
                </span>{" "}
                <span className="p-1">{lpo.supplierId?.name}</span>
              </div>
              <div className="border-b border-black flex min-h-[60px]">
                <span className="w-24 border-r border-black font-bold p-1">
                  Address:
                </span>{" "}
                <span className="p-1">{lpo.supplierId?.address}</span>
              </div>
              <div className="flex">
                <span className="w-24 border-r border-black font-bold p-1">
                  VAT No.:
                </span>{" "}
                <span className="p-1">{lpo.supplierId?.kraPin}</span>
              </div>
            </div>

            <div className="border border-black w-64 h-fit">
              <div className="border-b border-black flex">
                <span className="w-24 border-r border-black font-bold p-1">
                  Prepared By:
                </span>{" "}
                <span className="p-1 text-sm">
                  {lpo.preparedBy?.firstName} {lpo.preparedBy?.lastName}
                </span>
              </div>
              <div className="border-b border-black flex">
                <span className="w-24 border-r border-black font-bold p-1">
                  LPO No:
                </span>{" "}
                <span className="p-1 truncate font-semibold">{lpo.lpoNo}</span>
              </div>
              <div className="flex">
                <span className="w-24 border-r border-black font-bold p-1">
                  LPO Date:
                </span>{" "}
                <span className="p-1">
                  {new Date(lpo.lpoDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <table className="w-full border-collapse border border-black text-sm mb-12">
            <thead>
              <tr className="border-b border-black text-center font-bold">
                <th className="border-r border-black p-2 w-12">Item</th>
                <th className="border-r border-black p-2 w-16">No. of days</th>
                <th className="border-r border-black p-2">Description</th>
                <th className="border-r border-black p-2 w-20">Quantity</th>
                <th className="border-r border-black p-2 w-24">
                  Rate ({lpo.currency || projectCurrency || "KES"})
                </th>
                <th className="p-2 w-32">
                  Total ({projectCurrency || lpo.currency || "KES"})
                </th>
              </tr>
            </thead>
            <tbody>
              {lpo.items.map((item, idx) => (
                <tr key={idx} className="border-b border-black">
                  <td className="border-r border-black p-2 text-center">
                    {idx + 1}
                  </td>
                  <td className="border-r border-black p-2 text-center">
                    {item.noOfDays}
                  </td>
                  <td className="border-r border-black p-2">
                    {item.description}
                  </td>
                  <td className="border-r border-black p-2 text-center">
                    {item.quantity}
                  </td>
                  <td className="border-r border-black p-2 text-right">
                    {item.rate.toLocaleString()}
                  </td>
                  <td className="p-2 text-right font-bold">
                    {item.total.toLocaleString()}
                  </td>
                </tr>
              ))}

              <tr className="bg-gray-300 border-black border-y-2">
                <td
                  className="border-r border-black p-2 bg-gray-300"
                  colSpan={4}
                ></td>
                <td className="border-r border-black p-2 text-right font-bold">
                  Sub-Total
                </td>
                <td className="p-2 text-right font-bold">
                  {lpo.subTotal.toLocaleString()}
                </td>
              </tr>
              <tr className="bg-gray-300 border-b border-black">
                <td
                  className="border-r border-black p-2 bg-gray-300"
                  colSpan={4}
                ></td>
                <td className="border-r border-black p-2 text-right font-bold">
                  VAT (16%)
                </td>
                <td className="p-2 text-right font-bold">
                  {lpo.vatAmount.toLocaleString()}
                </td>
              </tr>
              <tr className="bg-gray-300 border-b border-black text-lg">
                <td
                  className="border-r border-black p-2 bg-gray-300"
                  colSpan={4}
                ></td>
                <td className="border-r border-black p-2 text-right font-bold">
                  Total
                </td>
                <td className="p-2 text-right font-bold">
                  {lpo.totalAmount.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-between items-end mb-8 mt-24">
            <div className="font-bold border-b border-black pb-1 w-64 uppercase tracking-tighter">
              VALID FOR THE NEXT {lpo.validityDays} DAYS
            </div>

            <div className="border border-black flex min-w-[300px]">
              <div className="bg-[#42b0f5] text-white font-bold p-2 w-24">
                TOTAL
              </div>
              <div className="bg-[#42b0f5] text-white font-bold p-2 flex-1 text-right">
                {lpo.currency || projectCurrency || "KES"}{" "}
                {lpo.totalAmount.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-16 pr-12">
            <div className="text-center relative">
              {/* Overlay Charles Signature directly precisely onto the line */}
              <img
                src="/srcc/charles_signature.jpg"
                alt="Charles Signature"
                className="absolute -top-12 left-10 w-48 h-auto object-contain mix-blend-multiply"
                style={{ mixBlendMode: "multiply" }}
              />
              <span>
                <span className="font-bold mr-2">Signature:</span>{" "}
                <span className="inline-block border-b border-black w-48"></span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
