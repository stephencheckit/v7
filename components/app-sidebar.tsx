"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Tag,
  Settings,
  Thermometer,
  Calendar,
  FileCheck,
  Zap,
  Brain,
  LayoutGrid,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Forms", url: "/forms", icon: FileText },
  { title: "Workflows", url: "/workflows", icon: Zap },
  { title: "Cadences", url: "/cadences", icon: Calendar },
  { title: "Learn", url: "/learn", icon: Brain },
  { title: "Canvas", url: "/canvas", icon: LayoutGrid },
  { title: "Labeling", url: "/labeling", icon: Tag },
  { title: "Sensors", url: "/sensors", icon: Thermometer },
  { title: "Summaries", url: "/summaries", icon: FileCheck },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, setOpenMobile, state } = useSidebar();

  // When true, we suppress any hover-driven "peek open"
  const [navInFlight, setNavInFlight] = useState(false);

  // As soon as the URL changes, release the lock
  useEffect(() => {
    if (navInFlight) setNavInFlight(false);
  }, [pathname, navInFlight]);

  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    e.stopPropagation();

    setNavInFlight(true); // Disable hover/peek during nav
    if (isMobile) setOpenMobile(false); // Close only on mobile
    router.push(href);
  };

  return (
    <Sidebar
      // Slide from right on mobile, left on desktop
      side={isMobile ? "right" : "left"}
      // Block pointer/hover while navigating so it can't expand
      className={cn(
        "border-r border-white bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#000000]",
        navInFlight && "pointer-events-none"
      )}
      collapsible="icon"
      data-lock-hover={navInFlight ? "true" : "false"}
    >
      {/* Hide header on mobile since logo is in top header */}
      <SidebarHeader className={cn(
        "border-b border-white px-3 pt-4 pb-[15px] bg-gradient-to-r from-[#000000] to-[#0a0a0a]",
        isMobile && "hidden"
      )}>
        <button
          onClick={(e) => handleLinkClick(e, "/")}
          className="flex items-center gap-2 font-semibold group-data-[collapsible=icon]:justify-center hover:opacity-80 transition-opacity w-full"
        >
          <div className="flex h-8 w-8 items-center justify-center shrink-0">
            <Image
              src="/checkit-checkit.png"
              alt="V7 Logo"
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
            />
          </div>
          <span className="text-lg text-white group-data-[collapsible=icon]:hidden">
            Checkit V7
          </span>
        </button>
      </SidebarHeader>

      <SidebarContent className="bg-transparent">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <TooltipProvider delayDuration={0}>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {/* On mobile, always show full text. On desktop, show icon-only when collapsed */}
                    {!isMobile && state === "collapsed" ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => handleLinkClick(e, item.url)}
                            data-active={pathname === item.url}
                            className="peer/menu-button flex w-full items-center gap-2 justify-center overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground size-8"
                          >
                            <item.icon className="h-4 w-4 shrink-0" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          align="center"
                          className="pointer-events-none"
                        >
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <button
                        onClick={(e) => handleLinkClick(e, item.url)}
                        data-active={pathname === item.url}
                        className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground h-8"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </button>
                    )}
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

