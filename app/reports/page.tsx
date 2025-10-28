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
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-8 h-8" />
              Reports
            </h1>
            <p className="text-gray-400 mt-1">
              AI-generated compliance summaries and executive reports
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        <SummariesView workspaceId={workspaceId} />
      </div>
    </div>
  );
}

