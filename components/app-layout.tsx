"use client";

import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";

// Initialize from localStorage immediately (client-side only)
const getInitialSidebarState = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('sidebar-open');
    return saved === 'true';
  }
  return false;
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(getInitialSidebarState);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Save sidebar state to localStorage whenever it changes
  const handleOpenChange = (open: boolean) => {
    setSidebarOpen(open);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-open', String(open));
    }
  };

  // Prevent hydration mismatch by using defaultOpen for SSR
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

