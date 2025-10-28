"use client";

import { useState, useEffect } from "react";
import { BarChart3 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SummariesView } from "@/components/summaries/summaries-view";

export default function ReportsPage() {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch workspace ID
  useEffect(() => {
    const fetchWorkspace = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data } = await supabase
          .from('workspace_members')
          .select('workspace_id')
          .eq('user_id', user.id)
          .limit(1)
          .single();
        
        if (data) {
          setWorkspaceId(data.workspace_id);
        }
      }
      setLoading(false);
    };

    fetchWorkspace();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">Loading workspace...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!workspaceId) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">No workspace found</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto">
      <div className="p-4 md:p-8">
        <div className="mx-auto max-w-[1600px] space-y-6 md:space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-2 md:gap-3">
              <BarChart3 className="h-6 w-6 md:h-10 md:w-10 text-[#c4dfc4]" />
              Reports
            </h1>
            <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
              AI-generated compliance summaries and executive reports
            </p>
          </div>

          {/* Content */}
          <SummariesView workspaceId={workspaceId} />
        </div>
      </div>
    </div>
  );
}

