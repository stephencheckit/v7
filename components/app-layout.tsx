"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";

// Initialize from localStorage immediately (client-side only)
const getInitialSidebarState = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('sidebar-open');
    // Default to true (open) if not set
    return saved === null ? true : saved === 'true';
  }
  return true; // Default to open for SSR
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  // Save sidebar state to localStorage whenever it changes
  const handleOpenChange = (open: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-open', String(open));
    }
  };

  return (
    <SidebarProvider 
      defaultOpen={getInitialSidebarState()} 
      onOpenChange={handleOpenChange}
    >
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

