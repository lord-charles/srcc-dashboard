"use client";

import * as React from "react";
import {
  MoonIcon,
  SunIcon,
  BellIcon,
  Moon,
  Sun,
  AlertTriangle,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export function Header() {
  const { setTheme, theme } = useTheme();
  const { data: session } = useSession();

  const user = session?.user;

  const initials = user
    ? (user.firstName && user.lastName
        ? `${user.firstName[0]}${user.lastName[0]}`
        : user.email?.substring(0, 2) ?? ''
      ).toUpperCase()
    : "";

  const displayName = user
    ? user.firstName
      ? `${user.firstName} ${user.lastName || ''}`.trim()
      : user.email || ''
    : '';

  const welcomeMessage = user?.firstName
    ? `Welcome back, ${user?.firstName}`
    : "Welcome!";
  console.log(session);
  return (
    <>
      {user?.registrationStatus === "quick" && (
        <div className="bg-amber-100 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 p-3 text-center text-sm flex items-center justify-center gap-2 shadow-sm">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">Your profile is incomplete.</span>
          <Link
            href="/consultant/register/individual"
            className="font-semibold underline hover:text-amber-900 dark:hover:text-amber-100 transition-colors"
          >
            Complete your registration
          </Link>
          <span>to get full access.</span>
        </div>
      )}
      <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-3">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-2" />
          <Separator orientation="vertical" className="h-6" />
          <div>
            <p className="text-sm text-muted-foreground">{welcomeMessage}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden sm:flex relative overflow-hidden group"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5 transition-transform group-hover:rotate-45 duration-300" />
                  ) : (
                    <Moon className="h-5 w-5 transition-transform group-hover:rotate-12 duration-300" />
                  )}
                  <span className="absolute inset-0 rounded-md bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle theme</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src="/avatars/01.png"
                    alt={user?.firstName || user?.email || "User"}
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem className="flex flex-col items-start">
                <div className="text-sm font-medium">{displayName}</div>
                <div className="text-xs text-muted-foreground">
                  {user?.email}
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>

              <DropdownMenuItem onClick={() => signOut()}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
}
