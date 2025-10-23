"use client";

import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default for SSR

  // Read from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('sidebar-open');
    if (saved !== null) {
      setSidebarOpen(saved === 'true');
    }
  }, []);

  // Save to localStorage whenever state changes (but only after mount)
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sidebar-open', String(sidebarOpen));
    }
  }, [sidebarOpen, mounted]);

  return (
    <SidebarProvider 
      open={sidebarOpen} 
      onOpenChange={setSidebarOpen}
    >
      <div className="flex min-h-screen w-full" suppressHydrationWarning>
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <AppHeader />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

