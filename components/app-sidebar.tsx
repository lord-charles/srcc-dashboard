"use client";

import * as React from "react";
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  Briefcase,
  Wallet,
  BarChart2,
  Users,
  Settings as Cog,
  CalendarCheck,
  List,
  Settings,
} from "lucide-react";
import { useSession } from "next-auth/react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import Image from "next/image";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/analytics",
      icon: "LayoutDashboard",
    },
    {
      title: "Project Management",
      url: "#",
      icon: "ClipboardList",
      items: [
        {
          title: "All Projects",
          url: "/projects",
        },
        {
          title: "Budget",
          url: "/budget",
        },
      ],
    },
    {
      title: "Contracts Management",
      url: "#",
      icon: "Briefcase",
      items: [
        {
          title: "All Contracts",
          url: "/contracts",
        },
        {
          title: "My Contracts",
          url: "/my-contracts",
        },
      ],
    },
    {
      title: "Claims Management",
      url: "#",
      icon: "Wallet",
      items: [
        {
          title: "All Claims",
          url: "/claims",
        },
        {
          title: "My Claims",
          url: "/my-claims",
        },
      ],
    },
    {
      title: "Imprest Management",
      url: "#",
      icon: "CalendarCheck",
      items: [
        {
          title: "All Imprest",
          url: "/imprest",
        },
        {
          title: "My Imprest",
          url: "/my-imprest",
        },
      ],
    },
    // {
    //   title: "Reports",
    //   url: "#",
    //   icon: "BarChart2",
    // },
    {
      title: "Consultants",
      url: "/users",
      icon: "Users",
    },
    {
      title: "Settings",
      url: "/settings",
      icon: "Settings",
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const [currentPath, setCurrentPath] = React.useState("");

  React.useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  const isActive = (url: string) => {
    if (url === "#") return false;
    return currentPath === url || currentPath.startsWith(url);
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader >
        <SidebarMenu>
          <SidebarMenuItem>
          <div className="relative w-[250px] h-[80px]">
            <Image
              src="/srcc-logo.webp"
              alt="Logo"
              fill
              className="object-contain" // or object-stretch
            />
          </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className={`rounded-lg p-3.5 transition-all duration-200 hover:bg-accent/50 ${
                    isActive(item.url)
                      ? "bg-accent font-medium shadow-sm"
                      : "text-white hover:text-foreground"
                  }`}
                >
                  <a href={item.url} className="text-base">
                    {item.icon && (
                      <span
                        className={`mr-4 inline-flex ${
                          isActive(item.url)
                            ? "text-yellow-500"
                            : "text-white text-yellow-500"
                        }`}
                      >
                        {(() => {
                          const iconProps = {
                            className: "h-5 w-5 transition-colors duration-200",
                          };
                          switch (item.icon) {
                            case "LayoutDashboard":
                              return <LayoutDashboard {...iconProps} />;
                            case "Users":
                              return <Users {...iconProps} />;
                            case "Briefcase":
                              return <Briefcase {...iconProps} />;
                            case "Wallet":
                              return <Wallet {...iconProps} />;
                            case "ClipboardList":
                              return <ClipboardList {...iconProps} />;
                            case "CalendarCheck":
                              return <CalendarCheck {...iconProps} />;
                            case "List":
                              return <List {...iconProps} />;
                            case "FileText":
                              return <FileText {...iconProps} />;
                            case "Briefcase":
                              return <Briefcase {...iconProps} />;
                            case "BarChart2":
                              return <BarChart2 {...iconProps} />;
                            case "Settings":
                              return <Settings {...iconProps} />;
                            default:
                              return null;
                          }
                        })()}
                      </span>
                    )}
                    {item.title}
                  </a>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub className="ml-9 space-y-1 border-l border-muted pl-4">
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          className={`rounded-md p-2.5 transition-all duration-200 hover:bg-accent/50 ${
                            isActive(subItem.url)
                              ? "bg-accent font-medium text-foreground"
                              : "text-white hover:text-foreground"
                          }`}
                        >
                          <a href={subItem.url} className="text-sm">
                            {subItem.title}
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
            <div className="h-5"/>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-accent rounded-md relative top-[-20px]">
        {session?.user && <NavUser user={session.user} />}
      </SidebarFooter>
    </Sidebar>
  );
}
