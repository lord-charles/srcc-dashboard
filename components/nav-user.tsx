"use client";

import {
  BadgeCheck,
  Bell,
  Building2,
  ChevronsUpDown,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";

interface NavUserProps {
  user: Session["user"];
}

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar();
  const initials =
    `${user?.firstName?.[0]}${user?.lastName?.[0]}`.toUpperCase();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-md">
                <AvatarImage
                  src={`https://avatar.vercel.sh/${user?.email}`}
                  alt={`N/A`}
                />
                <AvatarFallback className="rounded-md bg-emerald-100 text-emerald-800">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {user?.firstName || user?.companyName}
                  {user?.lastName}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-md">
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${user?.email}`}
                    alt={`N/A`}
                  />
                  <AvatarFallback className="rounded-md bg-emerald-100 text-emerald-800">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user?.firstName} {user?.lastName} {user?.companyName}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user?.position}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User className="mr-2 size-4" />
                <Link
                  href={`/${
                    user?.type === "user" ? "consultant" : "organization"
                  }/${user?.id}`}
                  className="w-full"
                >
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1.5 p-3 border border-green-500 ">
                <div className="flex w-full items-center justify-between text-sm font-medium text-muted-foreground">
                  <span>Account Status</span>
                  {user?.status === "active" ? (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <div className="size-1.5 rounded-full bg-green-500" />
                      <span>Active</span>
                    </div>
                  ) : user?.status === "pending" ? (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      <div className="size-1.5 animate-pulse rounded-full bg-amber-500" />
                      <span>Verification Pending</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      <div className="size-1.5 rounded-full bg-red-500" />
                      <span>Account Suspended</span>
                    </div>
                  )}
                </div>
                <p
                  className="text-xs text-muted-f
                oreground"
                >
                  {user?.status === "active"
                    ? "Your account is fully verified and active."
                    : user?.status === "pending"
                    ? "Your account is pending administrative approval."
                    : "Your account has been suspended. Please contact support."}
                </p>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 size-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ redirect: true, callbackUrl: "/login" })}
            >
              <LogOut className="mr-2 size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
