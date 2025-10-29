"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkSection } from "./work-section";
import { AlertTriangle, Circle, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { isOverdue as checkIsOverdue, isDue as checkIsDue, isUpNext as checkIsUpNext } from "@/lib/utils/time-remaining";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import type { FormInstance } from "@/lib/types/cadence";
import { toast } from "sonner";

export function MyWorkView() {
  const router = useRouter();
  const [instances, setInstances] = useState<Array<FormInstance & {
    form?: { id: string; title: string; description?: string };
    cadence?: { id: string; name: string };
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  // Fetch workspace ID first
  useEffect(() => {
    async function fetchWorkspace() {
      try {
        // Get user's workspace from a simple endpoint or auth context
        // For now, we'll try to fetch any instances and extract workspace_id
        const response = await fetch('/api/instances?limit=1');
        if (response.ok) {
          const data = await response.json();
          if (data.instances && data.instances.length > 0) {
            setWorkspaceId(data.instances[0].workspace_id);
          }
        }
      } catch (error) {
        console.error('Error fetching workspace:', error);
      }
    }
    fetchWorkspace();
  }, []);

  // Fetch work instances
  const fetchMyWork = async () => {
    if (!workspaceId) return;

    try {
      // Get all active instances (not completed or skipped)
      const response = await fetch(`/api/instances?workspace_id=${workspaceId}&limit=100`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch work instances');
      }

      const data = await response.json();
      setInstances(data.instances || []);
    } catch (error) {
      console.error('Failed to load work:', error);
      toast.error('Failed to load work', {
        description: 'Please refresh the page to try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) {
      fetchMyWork();
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchMyWork, 30000);
      return () => clearInterval(interval);
    }
  }, [workspaceId]);

  // Group instances by status
  const grouped = useMemo(() => {
    const now = new Date();
    
    return {
      overdue: instances.filter(i => {
        if (i.status === 'completed' || i.status === 'skipped') return false;
        return checkIsOverdue(i.due_at);
      }).sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime()),
      
      incomplete: instances.filter(i => 
        i.status === 'in_progress'
      ).sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime()),
      
      due: instances.filter(i => {
        if (i.status === 'completed' || i.status === 'skipped' || i.status === 'in_progress') return false;
        return checkIsDue(i.scheduled_for, i.due_at) && !checkIsOverdue(i.due_at);
      }).sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime()),
      
      upNext: instances.filter(i => {
        if (i.status === 'completed' || i.status === 'skipped') return false;
        return checkIsUpNext(i.scheduled_for, i.due_at);
      }).sort((a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime())
    };
  }, [instances]);

  const totalWork = grouped.overdue.length + grouped.incomplete.length + grouped.due.length;
  const hasNoWork = totalWork === 0 && grouped.upNext.length === 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#c4dfc4]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400">{grouped.overdue.length}</div>
              <p className="text-sm text-red-400/70 mt-1">Overdue</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">{grouped.incomplete.length}</div>
              <p className="text-sm text-yellow-400/70 mt-1">Incomplete</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{grouped.due.length}</div>
              <p className="text-sm text-green-400/70 mt-1">Due</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{grouped.upNext.length}</div>
              <p className="text-sm text-blue-400/70 mt-1">Up Next</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Section */}
      <WorkSection
        title="Overdue"
        icon={AlertTriangle}
        color="red"
        instances={grouped.overdue}
        showTimeRemaining
      />

      {/* Incomplete Section */}
      <WorkSection
        title="Incomplete"
        icon={Circle}
        color="yellow"
        instances={grouped.incomplete}
        showTimeRemaining
      />

      {/* Due Section */}
      <WorkSection
        title="Due"
        icon={CheckCircle2}
        color="green"
        instances={grouped.due}
        showTimeRemaining
      />

      {/* Up Next Section */}
      <WorkSection
        title="Up Next"
        icon={Clock}
        color="blue"
        instances={grouped.upNext}
        showStartTime
      />

      {/* Empty State */}
      {hasNoWork && (
        <Card className="border-[#c4dfc4]/30">
          <CardContent className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 mx-auto text-[#c4dfc4] mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">All caught up!</h2>
            <p className="text-gray-400 mb-6">
              You have no work due right now.
              {grouped.upNext.length > 0 && ` Next work starts ${grouped.upNext[0] ? new Date(grouped.upNext[0].scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'soon'}.`}
            </p>
            <Button
              onClick={() => router.push('/cadences')}
              className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a]"
            >
              View Calendar
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

