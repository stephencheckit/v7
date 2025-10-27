"use client";

import { useState, useEffect } from "react";
import { Menu, Search, FileText, Settings, Home, Layout, User, Tag, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
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
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/auth-context";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  icon: any;
  link: string;
  type: 'form' | 'page';
}

export function AppHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  
  const isFormBuilderPage = pathname?.includes('/forms/builder');
  
  // Listen for AI chat state changes (from form builder)
  useEffect(() => {
    if (!isFormBuilderPage) return;
    
    const getInitialChatState = () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('ai-chat-open');
        return saved !== null ? saved === 'true' : true;
      }
      return true;
    };
    
    setIsChatOpen(getInitialChatState());
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ai-chat-open') {
        setIsChatOpen(e.newValue === 'true');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also poll for changes since storage event doesn't fire in same tab
    const interval = setInterval(() => {
      setIsChatOpen(getInitialChatState());
    }, 100);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [isFormBuilderPage]);

  const performSearch = async (query: string) => {
    if (query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const results: SearchResult[] = [];

      // Search forms - try multiple approaches
      console.log('🔍 Searching for:', query);
      
      // Try fetching all forms first and filter client-side as fallback
      // Cast to any because simple_forms table not in generated types yet
      const { data: allForms, error: fetchError } = await (supabase as any)
        .from('simple_forms')
        .select('id, title, description');

      console.log('🔍 Raw response:', { 
        data: allForms, 
        error: fetchError,
        hasData: !!allForms,
        dataLength: allForms?.length,
        errorDetails: fetchError ? JSON.stringify(fetchError) : null
      });

      let forms = allForms;
      let error = fetchError;

      // Filter client-side
      if (allForms && !fetchError) {
        console.log('🔍 Filtering forms...');
        forms = allForms.filter((form: any) => {
          const searchLower = query.toLowerCase();
          const titleMatch = form.title?.toLowerCase().includes(searchLower);
          const descMatch = form.description?.toLowerCase().includes(searchLower);
          console.log(`  - Form: ${form.title}, match: ${titleMatch || descMatch}`);
          return titleMatch || descMatch;
        }).slice(0, 10);
      } else {
        console.error('❌ No forms or error occurred');
      }

      console.log('🔍 Filtered results:', { formsCount: forms?.length, hasError: !!error });

      if (error) {
        console.error('❌ Search error details:', {
          error,
          message: (error as any).message,
          details: (error as any).details,
          hint: (error as any).hint,
          code: (error as any).code
        });
      }

      if (!error && forms) {
        console.log(`✅ Found ${forms.length} forms`);
        forms.forEach((form: any) => {
          results.push({
            id: form.id,
            title: form.title || 'Untitled Form',
            description: form.description || 'Form',
            icon: FileText,
            link: `/forms/builder?edit=${form.id}`,
            type: 'form'
          });
        });
      }

      // Add static navigation pages that match
      const staticPages = [
        { id: 'dashboard', title: "Dashboard", description: "View your dashboard", icon: Home, link: "/dashboard", type: 'page' as const },
        { id: 'forms', title: "Forms", description: "Manage your forms", icon: FileText, link: "/forms", type: 'page' as const },
        { id: 'labeling', title: "Labeling", description: "Menu prep labels", icon: Tag, link: "/labeling", type: 'page' as const },
        { id: 'sensors', title: "Sensors", description: "Temperature monitoring", icon: FileText, link: "/sensors", type: 'page' as const },
        { id: 'settings', title: "Settings", description: "Account settings", icon: Settings, link: "/settings", type: 'page' as const },
      ];

      staticPages.forEach(page => {
        if (
          page.title.toLowerCase().includes(query.toLowerCase()) ||
          page.description.toLowerCase().includes(query.toLowerCase())
        ) {
          results.push(page);
        }
      });

      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsSearchOpen(true);
      await performSearch(searchQuery);
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const handleResultClick = (link: string) => {
    router.push(link);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      <header 
        className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-white bg-gradient-to-r from-[#000000] via-[#0a0a0a] to-[#000000] shadow-sm px-6 transition-all duration-300"
      >
        {/* Mobile: Logo on LEFT */}
        <Link href="/" className="flex md:hidden items-center gap-2 shrink-0">
          <Image
            src="/checkit-checkit.png"
            alt="Checkit V7"
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
          />
        </Link>

        {/* Desktop: Hamburger on LEFT */}
        <div className="hidden md:block shrink-0">
          <SidebarTrigger>
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
        </div>

        <div className="flex flex-1 items-center gap-4 min-w-0">
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

        {/* Desktop: User Menu */}
        <div className="hidden md:flex items-center justify-end ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 gap-2 px-3 hover:bg-white/10" disabled={isSigningOut}>
              {isSigningOut ? (
                <>
                  <div className="h-8 w-8 rounded-full bg-[#c4dfc4]/20 flex items-center justify-center">
                    <div className="h-4 w-4 border-2 border-[#c4dfc4] border-t-transparent rounded-full animate-spin" />
                  </div>
                  <span className="text-sm font-medium text-gray-400">Signing out...</span>
                </>
              ) : (
                <>
                  <Avatar className="h-8 w-8 bg-[#c4dfc4]">
                    <AvatarFallback className="bg-[#c4dfc4] text-[#0a0a0a] font-semibold text-sm">
                      {user?.user_metadata?.first_name && user?.user_metadata?.last_name
                        ? `${user.user_metadata.first_name[0]}${user.user_metadata.last_name[0]}`.toUpperCase()
                        : user?.email?.substring(0, 2).toUpperCase() || "??"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-white hidden md:inline-block">
                    {user?.user_metadata?.first_name && user?.user_metadata?.last_name
                      ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                      : user?.email?.split('@')[0] || "User"}
                  </span>
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-[#1a1a1a] border-border/50" align="end">
            <DropdownMenuLabel className="text-gray-400">
              {user?.user_metadata?.first_name && user?.user_metadata?.last_name
                ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                : user?.email || "My Account"}
            </DropdownMenuLabel>
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
              onClick={async () => {
                setIsSigningOut(true);
                await signOut();
                window.location.href = '/signin';
              }}
              className="text-red-400 focus:bg-red-500/10 focus:text-red-300 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>

        {/* Mobile: Hamburger on RIGHT */}
        <div className="md:hidden shrink-0">
          <SidebarTrigger>
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
        </div>
      </header>

      {/* Search Results Modal */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#1a1a1a] border-border/50 text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-gray-100">
              {searchQuery.trim().length > 0 ? `Search: "${searchQuery}"` : 'Search'}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {isSearching ? (
              <div className="text-center py-8 text-gray-400">
                <div className="animate-spin h-8 w-8 border-2 border-[#c4dfc4] border-t-transparent rounded-full mx-auto mb-3"></div>
                <p>Searching...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
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
                      <div className="text-xs text-gray-500 mt-1 capitalize">{item.type}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery.trim().length > 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No results found</p>
                <p className="text-sm mt-1">Try searching for forms, pages, or features</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Start typing to search</p>
                <p className="text-sm mt-1">Search for forms, pages, and more</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

