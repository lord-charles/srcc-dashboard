"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from "@/components/ui/drawer";

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

export const InstallPwa = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [mode, setMode] = useState<"event" | "ios" | null>(null);

  const LS_SNOOZE_UNTIL = "pwa_prompt_snooze_until";
  const LS_INSTALLED = "pwa_installed";

  // Detect mobile once on mount
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    setIsMobileDevice(/android|iphone|ipad|ipod|windows phone/i.test(ua));
    // Mark installed if already in standalone display-mode (Android/iOS)
    try {
      const isStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || (navigator as any).standalone === true;
      if (isStandalone) {
        localStorage.setItem(LS_INSTALLED, "true");
      }
    } catch {}
  }, []);



  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      const bip = event as BeforeInstallPromptEvent;
      setDeferredPrompt(bip);
      try {
        (window as any).__deferredPwaPrompt = bip;
      } catch {}
      // Only suppress if user explicitly snoozed; and only on mobile devices
      let canShow = true;
      try {
        const installed = localStorage.getItem(LS_INSTALLED) === "true";
        if (installed) canShow = false;
        const snoozeUntil = parseInt(localStorage.getItem(LS_SNOOZE_UNTIL) || "0", 10) || 0;
        if (Date.now() < snoozeUntil) canShow = false;
      } catch {}
      // Check mobile here to avoid effect dependencies
      let mobile = false;
      try {
        const ua = navigator.userAgent || (navigator as any).vendor || (window as any).opera;
        mobile = /android|iphone|ipad|ipod|windows phone/i.test(ua);
      } catch {}
      if (mobile && canShow) {
        setOpen(true);
        setMode("event");
      }
    };

    // Pick up an early-fired beforeinstallprompt that may have happened before this component mounted
    try {
      const cached: BeforeInstallPromptEvent | undefined = (window as any).__deferredPwaPrompt;
      if (cached) {
        // Apply the same gating logic as the live handler
        let canShow = true;
        try {
          const installed = localStorage.getItem(LS_INSTALLED) === "true";
          if (installed) canShow = false;
          const snoozeUntil = parseInt(localStorage.getItem(LS_SNOOZE_UNTIL) || "0", 10) || 0;
          if (Date.now() < snoozeUntil) canShow = false;
        } catch {}
        let mobile = false;
        try {
          const ua = navigator.userAgent || (navigator as any).vendor || (window as any).opera;
          mobile = /android|iphone|ipad|ipod|windows phone/i.test(ua);
        } catch {}
        if (mobile && canShow) {
          setDeferredPrompt(cached);
          setMode("event");
          setOpen(true);
        }
      }
    } catch {}

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    const handleAppInstalled = () => {
      try {
        localStorage.setItem(LS_INSTALLED, "true");
      } catch {}
      setDeferredPrompt(null);
      setOpen(false);
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // iOS Safari fallback: show instructions if no beforeinstallprompt will fire
  useEffect(() => {
    // Only run on client
    try {
      const ua = navigator.userAgent || (navigator as any).vendor || (window as any).opera;
      const isIOS = /iphone|ipad|ipod/i.test(ua);
      const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
      const isStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || (navigator as any).standalone === true;
      if (!(isIOS && isSafari)) return;
      // Suppress only if snoozed or installed
      let canShow = true;
      try {
        const installed = localStorage.getItem(LS_INSTALLED) === "true" || isStandalone;
        if (installed) canShow = false;
        const snoozeUntil = parseInt(localStorage.getItem(LS_SNOOZE_UNTIL) || "0", 10) || 0;
        if (Date.now() < snoozeUntil) canShow = false;
      } catch {}
      if (canShow) {
        setMode("ios");
        setOpen(true);
      }
    } catch {}
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        try {
          localStorage.setItem(LS_INSTALLED, "true");
        } catch {}
        setOpen(false);
        setDeferredPrompt(null);
      } else {
        setOpen(false);
      }
    } catch {
      setOpen(false);
    }
  };

  const handleRemindLater = () => {
    try {
      localStorage.setItem(LS_SNOOZE_UNTIL, String(Date.now() + ONE_WEEK_MS));
    } catch {}
    setOpen(false);
  };

  // If not mobile, render nothing.
  if (!isMobileDevice) return null;
  // For Android/Chromium we need the deferredPrompt to render. For iOS we can render without it.
  if (mode === "event" && !deferredPrompt) return null;
  console.log("deferredPrompt", deferredPrompt);
  console.log("open", open);
  console.log("mode", mode);
  console.log("isMobileDevice", isMobileDevice);
  return (
    <Drawer open={open} onOpenChange={(o) => {
      setOpen(o);
    }}>
      <DrawerContent className="px-4 pb-4">
        <DrawerHeader>
          <DrawerTitle className="text-base font-semibold">Install SRCC ERP</DrawerTitle>
          <DrawerDescription>
            {mode === "ios"
              ? "Add this app to your Home Screen for a faster, fullscreen experience."
              : "Get a faster, app-like experience by adding this app to your home screen."}
          </DrawerDescription>
        </DrawerHeader>
        {mode === "ios" ? (
          <div className="px-4 text-sm text-muted-foreground">
            • Tap the Share icon in Safari
            <br />• Choose &quot;Add to Home Screen&quot;
          </div>
        ) : (
          <div className="px-4 text-sm text-muted-foreground">
            • Works offline for key pages
            <br />• Launches fullscreen like a native app
          </div>
        )}
        <DrawerFooter className="gap-2 px-4 sticky bottom-0 bg-background pt-2 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {deferredPrompt ? (
            <Button size="lg" className="w-full" onClick={handleInstallClick}>Install</Button>
          ) : null}
          <Button className="w-full" onClick={handleRemindLater}>Remind me in 7 days</Button>
          <DrawerClose asChild>
            <Button variant="ghost" className="w-full">Not now</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
