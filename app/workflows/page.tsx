"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Plus, Zap } from "lucide-react";
import { WorkflowCard } from "@/components/workflows/workflow-card";
import { WorkflowBuilderModal } from "@/components/workflows/workflow-builder-modal";
import { AIChatPanel } from "@/components/ai-chat-panel";
import { Workflow } from "@/lib/types/workflow";
import { CenteredSpinner } from "@/components/loading";

export default function WorkflowsPage() {
  const { workspaceId, isLoading: authLoading } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
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
    <div className="w-full h-full overflow-auto">
      <div className="p-4 md:p-8">
        <div className="mx-auto max-w-[1600px]">
          {/* Header */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white flex items-center gap-3">
                <Zap className="h-10 w-10 text-[#c4dfc4]" />
                Workflows
              </h1>
              <p className="text-muted-foreground mt-2">
                Automate actions based on sensor alerts, form events, and schedules
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => setShowAI(true)}
                className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a]"
              >
                💬 Create with AI
              </Button>
              <Button
                onClick={() => setShowBuilder(true)}
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Manual Builder
              </Button>
            </div>
          </div>
          
          {/* Workflows List */}
          <div className="space-y-4">
            {workflows.length === 0 ? (
              <EmptyState onCreateAI={() => setShowAI(true)} onCreateManual={() => setShowBuilder(true)} />
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
      
      {/* AI Chat Panel */}
      {showAI && (
        <AIChatPanel
          isOpen={showAI}
          onToggle={() => setShowAI(false)}
          context="workflows"
          onWorkflowCreated={loadWorkflows}
        />
      )}
      
      {/* Manual Builder Modal */}
      {showBuilder && (
        <WorkflowBuilderModal
          onClose={() => setShowBuilder(false)}
          onSave={loadWorkflows}
        />
      )}
    </div>
  );
}

function EmptyState({ onCreateAI, onCreateManual }: { onCreateAI: () => void; onCreateManual: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8 max-w-md">
        <Zap className="h-16 w-16 text-[#c4dfc4] mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No workflows yet</h3>
        <p className="text-muted-foreground mb-6">
          Create your first workflow to automate actions based on sensor alerts, form events, or schedules.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={onCreateAI}
            className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a]"
          >
            💬 Create with AI
          </Button>
          <Button
            onClick={onCreateManual}
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Manual Builder
          </Button>
        </div>
      </div>
    </div>
  );
}

