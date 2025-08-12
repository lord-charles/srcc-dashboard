"use client";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from "@/components/ui/drawer";
import { usePwa } from "./PwaProvider";

export const InstallPwaDialog = () => {
  const { isOpen, setIsOpen, mode, handleInstallClick, handleRemindLater } = usePwa();

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
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
          {mode === 'event' && (
            <Button size="lg" className="w-full" onClick={handleInstallClick}>Install</Button>
          )}
          <Button className="w-full" onClick={handleRemindLater}>Remind me in 7 days</Button>
          <DrawerClose asChild>
            <Button variant="ghost" className="w-full">Not now</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
