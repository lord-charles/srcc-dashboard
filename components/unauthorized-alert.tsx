"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";

function UnauthorizedAlertContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams.get("unauthorized") === "1") {
      setShow(true);
    }
  }, [searchParams]);

  const handleDismiss = () => {
    setShow(false);
    // Clear unauthorized query param from address bar cleanly
    const params = new URLSearchParams(window.location.search);
    params.delete("unauthorized");
    const newQuery = params.toString();
    router.replace(newQuery ? `${window.location.pathname}?${newQuery}` : window.location.pathname);
  };

  if (!show) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 mt-4 animate-in fade-in slide-in-from-top-4 duration-300">
      <Alert
        variant="destructive"
        className="relative flex items-start gap-3 pr-10 border-destructive bg-destructive/5 text-destructive dark:bg-destructive/10"
      >
        <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="flex-1">
          <AlertTitle className="font-bold text-sm tracking-tight">
            Access Restricted
          </AlertTitle>
          <AlertDescription className="text-xs text-destructive/90 mt-1 leading-relaxed">
            You do not have the required permissions to access the requested module. If this is unexpected, please request module access updates from your administrator.
          </AlertDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="absolute right-2 top-2 h-7 w-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>
      </Alert>
    </div>
  );
}

export function UnauthorizedAlert() {
  return (
    <Suspense fallback={null}>
      <UnauthorizedAlertContent />
    </Suspense>
  );
}
