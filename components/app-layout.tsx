"use client";

import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";

export function AppLayout({ children }: { children: React.ReactNode }) {
  // Read from localStorage/cookie immediately to prevent flash
  const getInitialState = () => {
    if (typeof window === 'undefined') return true; // SSR default
    
    // Check cookie first (SidebarProvider uses this)
    const cookieMatch = document.cookie.match(/sidebar_state=([^;]+)/);
    if (cookieMatch) {
      return cookieMatch[1] === 'true';
    }
    
    // Fallback to localStorage
    const saved = localStorage.getItem('sidebar-open');
    if (saved !== null) {
      return saved === 'true';
    }
    
    return true; // Default
  };

  const [sidebarOpen, setSidebarOpen] = useState(getInitialState);

  // Only save to localStorage when state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-open', String(sidebarOpen));
    }
  }, [sidebarOpen]);

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

