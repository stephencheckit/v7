"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Tag,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Forms",
    url: "/forms",
    icon: FileText,
  },
  {
    title: "Prep Labels",
    url: "/prep-labels",
    icon: Tag,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-white bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#000000]" collapsible="icon">
      <SidebarHeader className="border-b border-white px-3 pt-4 pb-[15px] bg-gradient-to-r from-[#000000] to-[#0a0a0a]">
        <Link href="/" className="flex items-center gap-2 font-semibold group-data-[collapsible=icon]:justify-center">
          <div className="flex h-8 w-8 items-center justify-center shrink-0">
            <Image 
              src="/checkit-checkit.png" 
              alt="V7 Logo" 
              width={32} 
              height={32}
              className="w-8 h-8 object-contain"
            />
          </div>
          <span className="text-base group-data-[collapsible=icon]:hidden text-gray-100 hidden md:inline">Checkit v7</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="bg-transparent">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <TooltipProvider delayDuration={0}>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.url}
                          className="w-full"
                        >
                          <Link href={item.url}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="group-data-[collapsible=icon]:block hidden">
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                ))}
              </TooltipProvider>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

