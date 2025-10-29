"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";
import { WorkflowCard } from "@/components/workflows/workflow-card";
import { AIChatPanel } from "@/components/ai-chat-panel";
import { Workflow } from "@/lib/types/workflow";
import { CenteredSpinner } from "@/components/loading";

export default function WorkflowsPage() {
  const { workspaceId, isLoading: authLoading } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAI, setShowAI] = useState(false);
  
  useEffect(() => {
    if (workspaceId && !authLoading) {
      loadWorkflows();
    }
  }, [workspaceId, authLoading]);
  
  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workflows?workspace_id=${workspaceId}`);
      const data = await response.json();
      setWorkflows(data.workflows || []);
    } catch (error) {
      console.error('Error loading workflows:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (authLoading || loading) {
    return <CenteredSpinner />;
  }
  
  return (
    <div className="flex w-full h-full">
      {/* Main Content */}
      <div className={`flex-1 h-full overflow-auto transition-all duration-300 ${showAI ? 'mr-[600px]' : ''}`}>
        <div className="p-4 md:p-8">
          <div className="mx-auto max-w-[1600px]">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-white flex items-center gap-3">
                  <Zap className="h-10 w-10 text-[#c4dfc4]" />
                  Workflows
                  <Badge variant="secondary" className="text-xs">Preview</Badge>
                </h1>
                <p className="text-muted-foreground mt-2">
                  Automate actions with sensor alerts • Coming soon: form events & schedules
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowAI(true)}
                  className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a]"
                >
                  💬 Create with AI
                </Button>
              </div>
            </div>
            
            {/* Workflows List */}
            <div className="space-y-4">
              {workflows.length === 0 ? (
                <EmptyState onCreateAI={() => setShowAI(true)} />
              ) : (
                workflows.map(workflow => (
                  <WorkflowCard 
                    key={workflow.id} 
                    workflow={workflow}
                    onUpdate={loadWorkflows}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Chat Panel - Fixed to the right */}
      <AIChatPanel
        isOpen={showAI}
        onToggle={() => setShowAI(!showAI)}
        context="workflows"
        onWorkflowCreated={loadWorkflows}
      />
    </div>
  );
}

function EmptyState({ onCreateAI }: { onCreateAI: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8 max-w-md">
        <Zap className="h-16 w-16 text-[#c4dfc4] mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No workflows yet</h3>
        <p className="text-muted-foreground mb-6">
          Create your first automation workflow to trigger actions when sensor temperatures exceed thresholds.
        </p>
        <Button
          onClick={onCreateAI}
          className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a]"
        >
          💬 Create with AI
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          ✨ Coming soon: Form events, schedules, and more triggers
        </p>
      </div>
    </div>
  );
}

