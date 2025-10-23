"use client";

import { useState } from "react";
import { Menu, Search, FileText, Settings, Home, Layout, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

export function AppHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();

  // Define searchable items
  const searchableItems = [
    { id: 1, title: "Dashboard", description: "View your dashboard", icon: Home, link: "/dashboard" },
    { id: 2, title: "My Forms", description: "Manage your forms", icon: FileText, link: "/forms" },
    { id: 3, title: "Settings", description: "Account settings", icon: Settings, link: "/settings" },
    { id: 4, title: "Form Builder", description: "Build and edit forms", icon: FileText, link: "/forms" },
    { id: 5, title: "Distribution Settings", description: "Configure form distribution", icon: FileText, link: "/forms?tab=distribution" },
  ];

  // Filter results based on search query
  const searchResults = searchQuery.trim().length > 0
    ? searchableItems.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim().length > 0) {
      setIsSearchOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleResultClick = (link: string) => {
    router.push(link);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-white bg-gradient-to-r from-[#000000] via-[#0a0a0a] to-[#000000] shadow-sm px-6">
        <SidebarTrigger>
          <Menu className="h-5 w-5" />
        </SidebarTrigger>

        <div className="flex flex-1 items-center gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              className="w-full pl-9 bg-[#1a1a1a] border-white/10 text-gray-100 placeholder:text-gray-500 focus-visible:ring-[#c4dfc4]/50"
            />
          </div>
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 gap-2 px-3 hover:bg-white/10">
              <Avatar className="h-8 w-8 bg-[#c4dfc4]">
                <AvatarFallback className="bg-[#c4dfc4] text-[#0a0a0a] font-semibold text-sm">
                  CC
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-white hidden md:inline-block">
                Charlie Checkit
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-[#1a1a1a] border-border/50" align="end">
            <DropdownMenuLabel className="text-gray-400">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem 
              onClick={() => router.push('/settings')}
              className="text-gray-300 focus:bg-white/10 focus:text-white cursor-pointer"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => router.push('/dashboard')}
              className="text-gray-300 focus:bg-white/10 focus:text-white cursor-pointer"
            >
              <Layout className="mr-2 h-4 w-4" />
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem 
              onClick={() => router.push('/signin')}
              className="text-red-400 focus:bg-red-500/10 focus:text-red-300 cursor-pointer"
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Search Results Modal */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#1a1a1a] border-border/50 text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-gray-100">Search Results</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleResultClick(item.link)}
                    className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-[#2a2a2a] transition-colors text-left group"
                  >
                    <div className="h-10 w-10 rounded-lg bg-[#c4dfc4]/20 flex items-center justify-center shrink-0 group-hover:bg-[#c4dfc4]/30 transition-colors">
                      <item.icon className="h-5 w-5 text-[#c4dfc4]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-100">{item.title}</div>
                      <div className="text-sm text-gray-400">{item.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No results found for &quot;{searchQuery}&quot;</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

