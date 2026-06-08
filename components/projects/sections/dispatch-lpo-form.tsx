"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  ArrowLeft,
  Download,
  Send,
  AlertTriangle,
  Clock,
  Paperclip,
  Mail,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { sendLpoEmail } from "@/services/lpo.service";
import { Lpo } from "@/types/lpo";
import html2pdf from "html2pdf.js";
import { cn } from "@/lib/utils";

interface DispatchLpoFormProps {
  lpo: Lpo;
  projectId: string;
  projectCurrency: string;
}

export function DispatchLpoForm({ lpo, projectId, projectCurrency }: DispatchLpoFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [ccEmails, setCcEmails] = useState("");
  const [message, setMessage] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  const pdfOptions = {
    margin: 0,
    filename: `LPO_${lpo.lpoNo.replace(/\//g, "_")}.pdf`,
    image: { type: "jpeg", quality: 0.99 },
    html2canvas: { scale: 2.5, useCORS: true, letterRendering: true },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
  } as const;

  const generatePdf = async (): Promise<string> => {
    if (!pdfContainerRef.current) throw new Error("PDF template not found.");
    return await html2pdf().set(pdfOptions).from(pdfContainerRef.current).outputPdf("datauristring");
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      if (!pdfContainerRef.current) return;
      await html2pdf().set(pdfOptions).from(pdfContainerRef.current).save();
      toast({ title: "Downloaded", description: "LPO PDF saved successfully." });
    } catch {
      toast({ title: "Download failed", description: "Could not generate PDF.", variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDispatch = async () => {
    try {
      setIsSending(true);
      const pdfBase64 = await generatePdf();
      const ccArray = ccEmails.split(",").map((e) => e.trim()).filter(Boolean);
      const result = await sendLpoEmail(lpo._id, { pdfBase64, ccEmails: ccArray, message });

      if (result.success) {
        toast({ title: "LPO Sent", description: `Dispatched to ${lpo.supplierId?.email || "supplier"}.` });
        router.push(`/projects/${projectId}?tab=financial&financialtab=lpos`);
      } else {
        toast({ title: "Send failed", description: result.error || "Please try again.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to process LPO.", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  const isProcessing = isDownloading || isSending;

  // Compute VAT rate for display
  const vatableBase = lpo.items.filter((i) => !i.excludeVat).reduce((s, i) => s + i.total, 0);
  const displayVatRate = vatableBase > 0 ? Math.round((lpo.vatAmount / vatableBase) * 100) : 0;
  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl p-2 space-y-4">

        {/* ── Header ── */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/projects/${projectId}?tab=financial&financialtab=lpos`)}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Dispatch LPO</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              <span className="font-mono font-medium text-foreground">{lpo.lpoNo}</span>
              {" · "}
              {lpo.supplierId?.name}
            </p>
          </div>
        </div>

        {/* ── Main Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

          {/* ── Left: Controls (always visible) ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Already dispatched banner */}
            {lpo.isDispatched && (
              <div className="flex gap-3 p-4 rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">Already Dispatched</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
                    This LPO was previously sent to the supplier. You can resend it below.
                  </p>
                </div>
              </div>
            )}

            {/* Dispatch card */}
            <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border/60">
                <p className="text-sm font-semibold">Dispatch Settings</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Will be sent to{" "}
                  <span className="font-medium text-foreground">{lpo.supplierId?.email || "—"}</span>
                </p>
              </div>

              <div className="px-5 py-5 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    CC Recipients
                  </Label>
                  <Input
                    value={ccEmails}
                    onChange={(e) => setCcEmails(e.target.value)}
                    placeholder="finance@company.com, manager@company.com"
                    className="h-9 text-sm"
                  />
                  <p className="text-xs text-muted-foreground">Separate multiple emails with commas</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Email Message
                  </Label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please find the attached Local Purchase Order. Kindly confirm receipt and expected delivery..."
                    className="h-28 text-sm resize-none"
                  />
                </div>

                {/* Attachments */}
                {lpo.attachments && lpo.attachments.length > 0 && (
                  <div className="rounded-lg bg-muted/40 border border-border/60 px-4 py-3 space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Attached Files
                    </p>
                    <div className="space-y-1.5">
                      {lpo.attachments.map((url, i) => {
                        const name = decodeURIComponent(url.split("/").pop() || `File ${i + 1}`);
                        return (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs text-primary hover:underline font-medium truncate"
                          >
                            <Paperclip className="w-3 h-3 shrink-0" />
                            {name}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2.5 pt-1">
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    disabled={isProcessing}
                    className="flex-1 h-10 text-sm font-medium gap-2"
                  >
                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Download
                  </Button>
                  <Button
                    onClick={handleDispatch}
                    disabled={isProcessing || !lpo.supplierId?.email}
                    className="flex-1 h-10 text-sm font-semibold gap-2"
                  >
                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {lpo.isDispatched ? "Resend" : "Send LPO"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Dispatch History */}
            {lpo.isDispatched && lpo.dispatchHistory && lpo.dispatchHistory.length > 0 && (
              <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border/60">
                  <p className="text-sm font-semibold">Dispatch History</p>
                </div>
                <div className="px-5 py-4 space-y-4 max-h-52 overflow-y-auto">
                  {lpo.dispatchHistory?.map((h, i) => (
                    <div key={i} className="flex gap-3 text-xs">
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <div className="pt-0.5">
                        <p className="font-semibold text-foreground">
                          {new Date(h.dispatchedAt).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                        <p className="text-muted-foreground mt-0.5">
                          By {h.sentBy?.firstName} {h.sentBy?.lastName}
                        </p>
                        {h.ccEmails?.length > 0 && (
                          <p className="text-muted-foreground/70 truncate mt-0.5">
                            CC: {h.ccEmails.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: PDF Preview (hidden on mobile) ── */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="rounded-xl border border-border bg-muted/20 overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 border-b border-border/60 bg-background flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm font-semibold">Document Preview</p>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">A4</span>
              </div>
              <div className="p-6 overflow-auto max-h-[82vh] flex justify-center bg-zinc-100 dark:bg-zinc-900">
                <LpoPdfDocument lpo={lpo} ref={pdfContainerRef} />
              </div>
            </div>
          </div>

          {/* Hidden on desktop — renders for PDF generation only */}
          <div className="lg:hidden absolute -left-[9999px] -top-[9999px] pointer-events-none" aria-hidden="true">
            <LpoPdfDocument lpo={lpo} ref={pdfContainerRef} />
          </div>

        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF Document Component — Production-grade A4 design
// ─────────────────────────────────────────────────────────────────────────────
import { forwardRef } from "react";

const LpoPdfDocument = forwardRef<HTMLDivElement, { lpo: Lpo }>(({ lpo }, ref) => {
  const fmt = (n: number) => n.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const vatableBase = lpo.items.filter((i) => !i.excludeVat).reduce((s, i) => s + i.total, 0);
  const displayVatRate = vatableBase > 0 ? Math.round((lpo.vatAmount / vatableBase) * 100) : 0;

  return (
    <div
      ref={ref}
      style={{
        width: "794px",
        minHeight: "1123px",
        backgroundColor: "#ffffff",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        fontSize: "10px",
        color: "#1a1a2e",
        padding: "48px 52px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
      }}
    >
      {/* ── Top accent bar ── */}
      <div style={{
        height: "4px",
        background: "linear-gradient(90deg, #0f172a 0%, #1e3a5f 60%, #2563eb 100%)",
        marginBottom: "32px",
        borderRadius: "2px",
      }} />

      {/* ── Header: Logo + Company + Doc Label ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
        {/* Left: Logo + Name */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <img
            src="/srcc_logo.webp"
            alt="SRCC"
            style={{ height: "52px", width: "auto", objectFit: "contain" }}
          />
          <div>
            <p style={{ fontFamily: "'Georgia', serif", fontWeight: "bold", fontSize: "13px", color: "#0f172a", letterSpacing: "0.01em", lineHeight: "1.2", margin: 0 }}>
              Strathmore Research &
            </p>
            <p style={{ fontFamily: "'Georgia', serif", fontWeight: "bold", fontSize: "13px", color: "#0f172a", letterSpacing: "0.01em", lineHeight: "1.2", margin: 0 }}>
              Consultancy Centre Ltd.
            </p>
            <p style={{ fontFamily: "'Arial Narrow', Arial, sans-serif", fontSize: "8.5px", color: "#64748b", letterSpacing: "0.08em", marginTop: "4px", textTransform: "uppercase" }}>
              Madaraka Estate, Ole Sangale Road · Nairobi, Kenya
            </p>
          </div>
        </div>

        {/* Right: Document identity */}
        <div style={{ textAlign: "right" }}>
          <p style={{ fontFamily: "'Arial Narrow', Arial, sans-serif", fontSize: "8px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "6px" }}>
            Official Document
          </p>
          <p style={{ fontFamily: "'Georgia', serif", fontSize: "20px", fontWeight: "bold", color: "#0f172a", letterSpacing: "-0.02em", margin: 0 }}>
            LOCAL PURCHASE
          </p>
          <p style={{ fontFamily: "'Georgia', serif", fontSize: "20px", fontWeight: "bold", color: "#0f172a", letterSpacing: "-0.02em", margin: 0 }}>
            ORDER
          </p>
          <div style={{ marginTop: "8px", padding: "4px 10px", backgroundColor: "#0f172a", borderRadius: "3px", display: "inline-block" }}>
            <p style={{ fontFamily: "'Courier New', monospace", fontSize: "10px", color: "#ffffff", fontWeight: "bold", letterSpacing: "0.05em", margin: 0 }}>
              {lpo.lpoNo}
            </p>
          </div>
        </div>
      </div>

      {/* ── Horizontal rule ── */}
      <div style={{ borderTop: "1.5px solid #e2e8f0", marginBottom: "22px" }} />

      {/* ── Metadata: Supplier + Order Info ── */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        {/* Supplier */}
        <div style={{ flex: 1, border: "1px solid #e2e8f0", borderRadius: "6px", overflow: "hidden" }}>
          <div style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "6px 12px" }}>
            <p style={{ fontFamily: "'Arial Narrow', Arial, sans-serif", fontSize: "8px", fontWeight: "bold", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>
              Supplier Details
            </p>
          </div>
          <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: "7px" }}>
            <MetaRow label="Name" value={lpo.supplierId?.name || "—"} bold />
            <MetaRow label="Address" value={lpo.supplierId?.address || "—"} />
            <MetaRow label="Email" value={lpo.supplierId?.email || "—"} />
            <MetaRow label="KRA PIN" value={lpo.supplierId?.kraPin || "—"} mono />
          </div>
        </div>

        {/* Order info */}
        <div style={{ flex: 1, border: "1px solid #e2e8f0", borderRadius: "6px", overflow: "hidden" }}>
          <div style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "6px 12px" }}>
            <p style={{ fontFamily: "'Arial Narrow', Arial, sans-serif", fontSize: "8px", fontWeight: "bold", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>
              Order Information
            </p>
          </div>
          <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: "7px" }}>
            <MetaRow label="LPO Number" value={lpo.lpoNo} mono bold />
            <MetaRow label="Date Issued" value={new Date(lpo.lpoDate).toLocaleDateString("en-KE", { day: "2-digit", month: "long", year: "numeric" })} />
            <MetaRow label="Valid For" value={`${lpo.validityDays} days`} />
            <MetaRow label="Prepared By" value={`${lpo.preparedBy?.firstName || ""} ${lpo.preparedBy?.lastName || ""}`.trim() || "—"} />
          </div>
        </div>
      </div>

      {/* ── Line Items Table ── */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px", fontSize: "9.5px" }}>
        <thead>
          <tr style={{ backgroundColor: "#0f172a", color: "#ffffff" }}>
            {["#", "Description", "Days", "Qty", `Rate (${lpo.currency})`, `Amount (${lpo.currency})`].map((h, i) => (
              <th
                key={h}
                style={{
                  padding: "8px 10px",
                  textAlign: i === 0 ? "center" : i >= 4 ? "right" : i === 2 || i === 3 ? "center" : "left",
                  fontFamily: "'Arial Narrow', Arial, sans-serif",
                  fontSize: "8px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  whiteSpace: "nowrap",
                  ...(i === 0 ? { width: "28px", borderRadius: "4px 0 0 0" } : {}),
                  ...(i === 5 ? { borderRadius: "0 4px 0 0" } : {}),
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lpo.items.map((item, idx) => (
            <tr
              key={idx}
              style={{ backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8fafc", borderBottom: "1px solid #f1f5f9" }}
            >
              <td style={{ padding: "8px 10px", textAlign: "center", color: "#94a3b8", fontFamily: "monospace", fontWeight: "600" }}>
                {idx + 1}
              </td>
              <td style={{ padding: "8px 10px", color: "#1e293b", fontWeight: "500", lineHeight: "1.4" }}>
                {item.description}
                {item.excludeVat && (
                  <span style={{ marginLeft: "6px", fontSize: "7px", padding: "1px 5px", backgroundColor: "#fef3c7", color: "#92400e", borderRadius: "2px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.06em", verticalAlign: "middle" }}>
                    VAT Exempt
                  </span>
                )}
              </td>
              <td style={{ padding: "8px 10px", textAlign: "center", color: "#475569", fontFamily: "monospace" }}>{item.noOfDays}</td>
              <td style={{ padding: "8px 10px", textAlign: "center", color: "#475569", fontFamily: "monospace" }}>{item.quantity}</td>
              <td style={{ padding: "8px 10px", textAlign: "right", color: "#475569", fontFamily: "monospace" }}>{fmt(item.rate)}</td>
              <td style={{ padding: "8px 10px", textAlign: "right", color: "#0f172a", fontFamily: "monospace", fontWeight: "700" }}>{fmt(item.total)}</td>
            </tr>
          ))}
          {/* Empty filler rows to maintain table weight if few items */}
          {lpo.items.length < 4 && Array.from({ length: 4 - lpo.items.length }).map((_, i) => (
            <tr key={`empty-${i}`} style={{ borderBottom: "1px solid #f1f5f9" }}>
              {Array.from({ length: 6 }).map((_, j) => (
                <td key={j} style={{ padding: "8px 10px" }}>&nbsp;</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Totals + Notes ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "auto" }}>
  

        {/* Totals block */}
        <div style={{ width: "220px", border: "1px solid #e2e8f0", borderRadius: "6px", overflow: "hidden", flexShrink: 0 }}>
          <div style={{ padding: "7px 12px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9" }}>
            <span style={{ color: "#64748b", fontSize: "9px" }}>Subtotal</span>
            <span style={{ fontFamily: "monospace", fontWeight: "600", fontSize: "9px", color: "#1e293b" }}>
              {lpo.currency} {fmt(lpo.subTotal)}
            </span>
          </div>
          {lpo.vatAmount > 0 && (
            <div style={{ padding: "7px 12px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ color: "#64748b", fontSize: "9px" }}>VAT ({displayVatRate}%)</span>
              <span style={{ fontFamily: "monospace", fontWeight: "600", fontSize: "9px", color: "#1e293b" }}>
                {lpo.currency} {fmt(lpo.vatAmount)}
              </span>
            </div>
          )}
          <div style={{ padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0f172a" }}>
            <span style={{ fontFamily: "'Arial Narrow', Arial, sans-serif", fontSize: "8px", fontWeight: "bold", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Total
            </span>
            <span style={{ fontFamily: "monospace", fontWeight: "bold", fontSize: "12px", color: "#ffffff" }}>
              {lpo.currency} {fmt(lpo.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Spacer ── */}
      <div style={{ flex: 1, minHeight: "24px" }} />

      {/* ── Signature + Footer ── */}
      <div style={{ borderTop: "1.5px solid #e2e8f0", paddingTop: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          {/* Company seal / footer info */}
          <div>
            <p style={{ fontFamily: "'Arial Narrow', Arial, sans-serif", fontSize: "8px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>
              Issued by
            </p>
            <p style={{ fontSize: "9px", color: "#334155", fontWeight: "600", margin: 0 }}>
              Strathmore Research & Consultancy Centre Ltd.
            </p>
            <p style={{ fontSize: "8px", color: "#94a3b8", marginTop: "2px" }}>
              PIN: P051149547H · VAT No: 0149495Z · Tel: +254 703 034244
            </p>
          </div>

          {/* Authorized signature */}
          <div style={{ textAlign: "center" }}>
            <div style={{ position: "relative", paddingBottom: "8px" }}>
              <img
                src="/srcc/charles_signature.jpg"
                alt="Signature"
                style={{
                  height: "40px",
                  width: "auto",
                  objectFit: "contain",
                  mixBlendMode: "multiply",
                  display: "block",
                  margin: "0 auto 4px",
                }}
              />
              <div style={{ width: "160px", borderTop: "1px solid #cbd5e1", paddingTop: "5px" }}>
                <p style={{ fontFamily: "'Arial Narrow', Arial, sans-serif", fontSize: "8px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0, textAlign: "center" }}>
                  Authorized Signatory
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom accent bar ── */}
      <div style={{
        height: "3px",
        background: "linear-gradient(90deg, #2563eb 0%, #1e3a5f 40%, #0f172a 100%)",
        marginTop: "20px",
        borderRadius: "2px",
      }} />
    </div>
  );
});

LpoPdfDocument.displayName = "LpoPdfDocument";

// ── Tiny helper ──────────────────────────────────────────────────────────────
function MetaRow({ label, value, bold, mono }: { label: string; value: string; bold?: boolean; mono?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
      <span style={{ fontFamily: "'Arial Narrow', Arial, sans-serif", fontSize: "8px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0 }}>
        {label}
      </span>
      <span style={{
        fontSize: "9px",
        color: "#1e293b",
        fontWeight: bold ? "700" : "500",
        fontFamily: mono ? "'Courier New', monospace" : "inherit",
        textAlign: "right",
        wordBreak: "break-word",
      }}>
        {value}
      </span>
    </div>
  );
}