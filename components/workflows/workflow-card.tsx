"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Thermometer, 
  FileText, 
  Clock, 
  Mail, 
  MessageSquare, 
  CheckSquare,
  Play,
  Pause,
  Trash2,
  MoreVertical
} from "lucide-react";
import { Workflow } from "@/lib/types/workflow";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WorkflowCardProps {
  workflow: Workflow;
  onUpdate: () => void;
}

export function WorkflowCard({ workflow, onUpdate }: WorkflowCardProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const getTriggerIcon = () => {
    switch (workflow.trigger_type) {
      case 'sensor_temp_exceeds':
      case 'sensor_temp_below':
        return <Thermometer className="w-4 h-4" />;
      case 'form_overdue':
      case 'form_submitted':
      case 'form_missed':
        return <FileText className="w-4 h-4" />;
      case 'schedule':
        return <Clock className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };
  
  const getTriggerLabel = () => {
    const config = workflow.trigger_config as any;
    
    switch (workflow.trigger_type) {
      case 'sensor_temp_exceeds':
        return `Temperature exceeds ${config.threshold}°${config.unit} for ${config.duration_minutes}min`;
      case 'sensor_temp_below':
        return `Temperature below ${config.threshold}°${config.unit} for ${config.duration_minutes}min`;
      case 'form_overdue':
        return `Form becomes overdue`;
      case 'form_submitted':
        return `Form is submitted`;
      case 'form_missed':
        return `Form is missed`;
      case 'schedule':
        return `On schedule: ${config.cron}`;
      default:
        return workflow.trigger_type;
    }
  };
  
  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'email':
        return <Mail className="w-3 h-3" />;
      case 'sms':
        return <MessageSquare className="w-3 h-3" />;
      case 'create_task':
        return <CheckSquare className="w-3 h-3" />;
      default:
        return <Zap className="w-3 h-3" />;
    }
  };
  
  const getActionLabel = (action: any) => {
    switch (action.type) {
      case 'email':
        return `Email ${action.config.recipients?.length || 0} recipient(s)`;
      case 'sms':
        return `SMS ${action.config.recipients?.length || 0} recipient(s)`;
      case 'create_task':
        return `Create task (${action.config.priority} priority)`;
      default:
        return action.type;
    }
  };
  
  const handleToggleActive = async () => {
    try {
      setIsToggling(true);
      const response = await fetch(`/api/workflows/${workflow.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !workflow.is_active,
        }),
      });
      
      if (response.ok) {
        toast.success(workflow.is_active ? 'Workflow paused' : 'Workflow activated');
        onUpdate();
      } else {
        toast.error('Failed to update workflow');
      }
    } catch (error) {
      console.error('Error toggling workflow:', error);
      toast.error('Failed to update workflow');
    } finally {
      setIsToggling(false);
    }
  };
  
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this workflow?')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/workflows/${workflow.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success('Workflow deleted');
        onUpdate();
      } else {
        toast.error('Failed to delete workflow');
      }
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast.error('Failed to delete workflow');
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-white">{workflow.name}</h3>
            <Badge variant={workflow.is_active ? "default" : "secondary"}>
              {workflow.is_active ? 'Active' : 'Paused'}
            </Badge>
          </div>
          {workflow.description && (
            <p className="text-sm text-muted-foreground mb-3">{workflow.description}</p>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleToggleActive} disabled={isToggling}>
              {workflow.is_active ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="text-red-500"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Trigger */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase">When</span>
        </div>
        <div className="flex items-center gap-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded p-3">
          {getTriggerIcon()}
          <span className="text-sm text-white">{getTriggerLabel()}</span>
        </div>
      </div>
      
      {/* Actions */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase">Then</span>
        </div>
        <div className="space-y-2">
          {workflow.actions.map((action, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded p-3"
            >
              {getActionIcon(action.type)}
              <span className="text-sm text-white">{getActionLabel(action)}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-[#2a2a2a] flex items-center gap-6 text-xs text-muted-foreground">
        <div>
          <span className="font-medium">Triggered:</span> {workflow.triggered_count || 0} times
        </div>
        {workflow.last_triggered_at && (
          <div>
            <span className="font-medium">Last:</span>{' '}
            {new Date(workflow.last_triggered_at).toLocaleDateString()}
          </div>
        )}
      </div>
    </Card>
  );
}

