"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Inbox, TrendingUp } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { CenteredSpinner } from "@/components/loading";
import { MyWorkView } from "@/components/dashboard/my-work-view";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inbox' | 'insights'>('inbox');
  const { user } = useAuth();

  // Extract first name from user metadata or email
  const getUserName = () => {
    if (!user) return "there";
    
    // Try to get first name from metadata
    const firstName = user.user_metadata?.first_name;
    if (firstName) return firstName;
    
    // Fallback to email-based name
    if (user.email) {
      const emailName = user.email.split('@')[0];
      const name = emailName.split(/[._-]/)[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    
    return "there";
  };

  // Auto-select default tab based on user role (if we add roles later)
  useEffect(() => {
    // For now, everyone starts on "Inbox"
    // In the future, managers could default to 'insights'
    setLoading(false);
  }, [user]);

  if (loading) {
    return <CenteredSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="w-full h-full overflow-auto">
      <div className="p-4 md:p-8">
        <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-2 md:gap-3">
            <Inbox className="h-6 w-6 md:h-10 md:w-10 text-[#c4dfc4]" />
            <span className="hidden sm:inline">Welcome back, {getUserName()}</span>
            <span className="sm:hidden">Dashboard</span>
          </h1>
          <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
            Here's your food safety overview for today
          </p>
        </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-6">
              <TabsTrigger value="inbox" className="flex items-center gap-2">
                <Inbox className="w-4 h-4" />
                Inbox
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Insights
              </TabsTrigger>
            </TabsList>

            {/* Tab Content: Inbox */}
            <TabsContent value="inbox" className="mt-6">
              <MyWorkView />
            </TabsContent>

            {/* Tab Content: Insights */}
            <TabsContent value="insights" className="mt-6">
              <DashboardOverview />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
