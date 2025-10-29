"use client";

import { Badge } from "@/components/ui/badge";
import { ChevronRight, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { getTimeRemaining, getTimeUntilDue } from "@/lib/utils/time-remaining";
import type { FormInstance } from "@/lib/types/cadence";

interface WorkInstanceCardProps {
  instance: FormInstance & {
    form?: { id: string; title: string; description?: string };
    cadence?: { id: string; name: string };
  };
  showTimeRemaining?: boolean;
  showStartTime?: boolean;
}

export function WorkInstanceCard({ 
  instance, 
  showTimeRemaining = false,
  showStartTime = false 
}: WorkInstanceCardProps) {
  const router = useRouter();
  const timeRemaining = showTimeRemaining ? getTimeRemaining(instance.due_at) : null;
  const startTime = showStartTime ? getTimeUntilDue(instance.scheduled_for) : null;

  const handleClick = () => {
    // If not yet due (pending), don't allow opening
    if (instance.status === 'pending' && !showStartTime) {
      return;
    }
    router.push(`/f/${instance.form_id}`);
  };

  const getBadgeColor = () => {
    if (!timeRemaining) return 'default';
    if (timeRemaining.isOverdue) return 'destructive';
    if (timeRemaining.totalMinutes < 60) return 'warning';
    return 'default';
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg border border-gray-700 hover:border-[#c4dfc4] transition-all ${
        instance.status === 'pending' && !showStartTime ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-white truncate">{instance.instance_name}</h4>
        <p className="text-sm text-gray-400 truncate">{instance.form?.title || 'Unknown Form'}</p>
        
        {/* Show who's working on it if in progress */}
        {instance.status === 'in_progress' && instance.started_at && (
          <div className="flex items-center gap-1 mt-1 text-xs text-blue-400">
            <Users className="w-3 h-3" />
            <span>Started {new Date(instance.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 ml-4">
        {showTimeRemaining && timeRemaining && (
          <Badge 
            variant={getBadgeColor() as any}
            className={`whitespace-nowrap ${
              timeRemaining.isOverdue 
                ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                : timeRemaining.totalMinutes < 60
                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                : 'bg-green-500/20 text-green-400 border-green-500/30'
            }`}
          >
            {timeRemaining.display}
          </Badge>
        )}
        
        {showStartTime && startTime && (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 whitespace-nowrap">
            {startTime}
          </Badge>
        )}
        
        {instance.status !== 'pending' && <ChevronRight className="w-5 h-5 text-gray-500" />}
      </div>
    </div>
  );
}

