"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Zap, Plus, Play, Thermometer } from "lucide-react";
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
          <div className="mx-auto max-w-[1600px] space-y-6 md:space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-2 md:gap-3">
                    <Zap className="h-6 w-6 md:h-10 md:w-10 text-[#c4dfc4]" />
                    Workflows
                    <Badge variant="secondary" className="text-xs ml-2">Preview</Badge>
                  </h1>
                  <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
                    Automate actions with sensor alerts • Coming soon: form events & schedules
                  </p>
                </div>
                
                <Button
                  onClick={() => setShowAI(true)}
                  size="sm"
                  className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a] shrink-0"
                >
                  <Plus className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Create with AI</span>
                </Button>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-3">
              <Card className="bg-gradient-to-br from-[#c4dfc4] to-[#c4dfc4]/80 border-0 p-4">
                <div className="flex items-center gap-3">
                  <Zap className="h-8 w-8 text-[#0a0a0a]" />
                  <div>
                    <p className="text-sm text-[#0a0a0a]/70">Total Workflows</p>
                    <p className="text-2xl font-bold text-[#0a0a0a]">{workflows.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-[#c8e0f5] to-[#c8e0f5]/80 border-0 p-4">
                <div className="flex items-center gap-3">
                  <Play className="h-8 w-8 text-[#0a0a0a]" />
                  <div>
                    <p className="text-sm text-[#0a0a0a]/70">Active</p>
                    <p className="text-2xl font-bold text-[#0a0a0a]">
                      {workflows.filter(w => w.is_active).length}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-[#ffd4d4] to-[#ffd4d4]/80 border-0 p-4">
                <div className="flex items-center gap-3">
                  <Thermometer className="h-8 w-8 text-[#0a0a0a]" />
                  <div>
                    <p className="text-sm text-[#0a0a0a]/70">Total Triggers</p>
                    <p className="text-2xl font-bold text-[#0a0a0a]">
                      {workflows.reduce((sum, w) => sum + (w.triggered_count || 0), 0)}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Workflows List */}
            {workflows.length === 0 ? (
              <EmptyState onCreateAI={() => setShowAI(true)} />
            ) : (
              <div className="space-y-4">
                {workflows.map(workflow => (
                  <WorkflowCard 
                    key={workflow.id} 
                    workflow={workflow}
                    onUpdate={loadWorkflows}
                  />
                ))}
              </div>
            )}
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

