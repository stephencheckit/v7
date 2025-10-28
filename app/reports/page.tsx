"use client";

import { useState, useEffect } from "react";
import { BarChart3, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SummariesView } from "@/components/summaries/summaries-view";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-2 md:gap-3">
                <BarChart3 className="h-6 w-6 md:h-10 md:w-10 text-[#c4dfc4]" />
                Reports
              </h1>
              <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
                AI-generated compliance summaries and executive reports
              </p>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="generating">Generating</option>
                <option value="scheduled">Scheduled</option>
                <option value="failed">Failed</option>
              </select>
              
              <Button
                onClick={() => setCreateModalOpen(true)}
                className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-black shrink-0"
                size="sm"
              >
                <Plus className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Create Summary</span>
              </Button>
            </div>
          </div>

          {/* Content */}
          <SummariesView 
            workspaceId={workspaceId} 
            statusFilter={statusFilter}
            createModalOpen={createModalOpen}
            onCreateModalClose={() => setCreateModalOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}

