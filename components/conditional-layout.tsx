"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";

// Pages that should NOT show the sidebar/header
const PUBLIC_ROUTES = [
  "/",
  "/home",
  "/home-2",
  "/home-3",
  "/home-4",
  "/home-5",
  "/signin",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/preview",
  "/demo-form",
  "/test-printer",
  "/test-video-ai",
  "/video-form-fill",
];

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  // Ensure consistent render between server and client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if current route is public (no sidebar)
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route) || 
                        pathname.startsWith("/f/"); // Form fill pages

  // Public routes: render children directly
  if (isPublicRoute) {
    return <div suppressHydrationWarning>{children}</div>;
  }

  // During SSR or before mount, render a basic layout to prevent hydration mismatch
  if (!mounted) {
    return <div suppressHydrationWarning>{children}</div>;
  }

  // App routes: render with sidebar (only after client-side mount)
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <AppHeader />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

