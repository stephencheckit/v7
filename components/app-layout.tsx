"use client";

import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-open');
    if (saved !== null) {
      setSidebarOpen(saved === 'true');
    }
    setMounted(true);
  }, []);

  // Save sidebar state to localStorage whenever it changes
  const handleOpenChange = (open: boolean) => {
    setSidebarOpen(open);
    localStorage.setItem('sidebar-open', String(open));
  };

  // Prevent hydration mismatch
  if (!mounted) {
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

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={handleOpenChange}>
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

