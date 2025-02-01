import { Metadata } from "next";
import Image from "next/image";

import { Separator } from "@/components/ui/separator";
import { SidebarNav } from "./components/sidebar-nav";
import { Card } from "@/components/ui/card";
import DashboardProvider from "../dashboard-provider";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Forms",
  description: "Advanced form example using react-hook-form and Zod.",
};

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/settings",
  },
  // {
  //   title: "Account",
  //   href: "/settings/account",
  // },
  {
    title: "Appearance",
    href: "/settings/appearance",
  },

];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <DashboardProvider>
      <Header />
    <div className="pl-10 pr-3 bg-card pb-[100px] mt-6">
      <Card className="bg-card p-4 space-y-2 relative top-2">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and set e-mail preferences.
          </p>
        </div>
        <Separator className="my-6" />
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="lg:w-1/5">
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className="flex-1 ">{children}</div>
        </div>
      </Card>
    </div>
    </DashboardProvider>

  );
}
