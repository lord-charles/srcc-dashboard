"use client";

import * as React from "react";
import {
  GalleryVerticalEnd,
  LayoutDashboard,
  Users,
  DollarSign,
  BarChart2,
  Settings,
  Wallet,
  FileText,
  BriefcaseBusiness,
  Receipt,
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
      url: "/dashboard",
      icon: "LayoutDashboard",
    },
    {
      title: "Project Management",
      url: "#",
      icon: "BriefcaseBusiness",
      items: [
        {
          title: "All Projects",
          url: "/projects",
        },
        {
          title: "New Project",
          url: "/project/new",
        },
      ],
    },
    {
      title: "Contracts Management",
      url: "#",
      icon: "FileText",
      items: [
        {
          title: "All Contracts",
          url: "/contracts",
        },
        {
          title: "New Contract",
          url: "/contracts/new",
        }
      ],
    },
    {
      title: "Budget Management",
      url: "#",
      icon: "DollarSign",
      items: [
        {
          title: "Budget Overview",
          url: "/budget",
        },
        
        {
          title: "New Budget",
          url: "/budget/new",
        }
      ],
    },
    {
      title: "Imprest",
      url: "#",
      icon: "Receipt",
    },
    {
      title: "Reports",
      url: "#",
      icon: "BarChart2",
     
    },
    {
      title: "Users",
      url: "#",
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
    <Sidebar variant="inset" {...props} className="">
      <SidebarHeader className="pb-0 bg-dashboard">
        <SidebarMenu>
          <SidebarMenuItem>
           
           <Image
            src="/srcc-logo.webp"
            width={500}
            height={500}
            alt="Logo"
            className="object-stretch"
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="mt-2">
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className={`rounded-lg p-3.5 transition-all duration-200 hover:bg-accent/50 ${
                    isActive(item.url)
                      ? "bg-accent font-medium shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <a href={item.url} className="text-base">
                    {item.icon && (
                      <span
                        className={`mr-4 inline-flex ${
                          isActive(item.url)
                            ? "text-yellow-500"
                            : "text-muted-foreground text-yellow-500"
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
                            case "DollarSign":
                              return <DollarSign {...iconProps} />;
                            case "Receipt":
                              return <Receipt {...iconProps} />;
                            case "FileText":
                              return <FileText {...iconProps} />;
                            case "BriefcaseBusiness":
                              return <BriefcaseBusiness {...iconProps} />;
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
                  <SidebarMenuSub className="ml-9  space-y-0 border-l border-muted pl-4">
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          className={`rounded-md p-2.5 transition-all duration-200 hover:bg-accent/50 ${
                            isActive(subItem.url)
                              ? "bg-accent font-medium text-foreground"
                              : "text-muted-foreground hover:text-foreground"
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
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-accent rounded-md relative top-[-20px]">
        {session?.user && <NavUser user={session.user} />}
      </SidebarFooter>
    </Sidebar>
  );
}
