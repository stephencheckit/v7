"use client";

import { useState } from "react";
import { FormInstance } from "@/lib/types/cadence";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle2, XCircle, PlayCircle, SkipForward, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";

interface InstanceDetailModalProps {
  instance: FormInstance & {
    form?: { id: string; title: string; description?: string };
    cadence?: { id: string; name: string };
    submission?: { id: string; data: any; submitted_at: string };
  };
  open: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-500",
  ready: "bg-yellow-500",
  in_progress: "bg-blue-500",
  completed: "bg-green-500",
  missed: "bg-red-500",
  skipped: "bg-gray-400"
};

const STATUS_ICONS: Record<string, any> = {
  pending: Clock,
  ready: PlayCircle,
  in_progress: PlayCircle,
  completed: CheckCircle2,
  missed: XCircle,
  skipped: SkipForward
};

export function InstanceDetailModal({ instance, open, onClose, onUpdate }: InstanceDetailModalProps) {
  const [updating, setUpdating] = useState(false);

  const StatusIcon = STATUS_ICONS[instance.status] || Clock;

  const handleAction = async (action: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/instances/${instance.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (!response.ok) {
        throw new Error('Failed to update instance');
      }

      toast.success(`Instance ${action}ed successfully`);
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Error updating instance:', error);
      toast.error(`Failed to ${action} instance`);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#1a1a1a] text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <StatusIcon className="w-6 h-6" />
            {instance.instance_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Badge */}
          <div>
            <Badge className={`${STATUS_COLORS[instance.status]} text-white text-sm px-3 py-1`}>
              {instance.status.toUpperCase().replace('_', ' ')}
            </Badge>
          </div>

          {/* Form Info */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-300">Form</h3>
            <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg border border-gray-700">
              <div>
                <p className="font-medium text-white">{instance.form?.title || 'Unknown Form'}</p>
                {instance.form?.description && (
                  <p className="text-sm text-gray-400 mt-1">{instance.form.description}</p>
                )}
              </div>
              {instance.status !== 'pending' && (
                <Link href={`/f/${instance.form_id}`} target="_blank">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`border-gray-700 ${
                      instance.status === 'ready' 
                        ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' 
                        : ''
                    }`}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {instance.status === 'ready' ? 'Complete' : 'Open Form'}
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Cadence Info */}
          {instance.cadence && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-300">Cadence</h3>
              <div className="p-4 bg-[#0a0a0a] rounded-lg border border-gray-700">
                <p className="font-medium text-white">{instance.cadence.name}</p>
              </div>
            </div>
          )}

          {/* Timing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Scheduled For
              </h3>
              <p className="text-white">
                {format(new Date(instance.scheduled_for), 'PPpp')}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Due By
              </h3>
              <p className="text-white">
                {format(new Date(instance.due_at), 'PPpp')}
              </p>
            </div>
          </div>

          {/* Completion Info */}
          {instance.status === 'completed' && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-300">Completion Details</h3>
              <div className="p-4 bg-[#0a0a0a] rounded-lg border border-green-700">
                {instance.completed_at && (
                  <p className="text-sm text-gray-300">
                    Completed: {format(new Date(instance.completed_at), 'PPpp')}
                  </p>
                )}
                {instance.submission && (
                  <Link href={`/forms/${instance.form_id}/report`} target="_blank">
                    <Button variant="link" className="p-0 h-auto text-green-400">
                      View Submission →
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4 border-t border-gray-700">
            {/* Primary Action Row */}
            <div className="flex gap-3">
              {instance.status === 'ready' && (
                <>
                  <Link href={`/f/${instance.form_id}`} target="_blank" className="flex-1">
                    <Button className="w-full bg-[#c4dfc4] hover:bg-[#b5d0b5] text-gray-900">
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Complete Form
                    </Button>
                  </Link>
                  <Button
                    onClick={() => handleAction('skip')}
                    variant="outline"
                    className="border-gray-700"
                    disabled={updating}
                  >
                    <SkipForward className="w-4 h-4 mr-2" />
                    Skip
                  </Button>
                </>
              )}

            {instance.status === 'in_progress' && (
              <Link href={`/f/${instance.form_id}`} target="_blank" className="flex-1">
                <Button className="w-full bg-blue-500 hover:bg-blue-600">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Continue Form
                </Button>
              </Link>
            )}

            {instance.status === 'pending' && (
              <div className="w-full text-center text-gray-400">
                <p className="text-sm">This form is not yet available for completion.</p>
                <p className="text-xs mt-1">It will become ready at the scheduled time.</p>
              </div>
            )}

              {(instance.status === 'missed' || instance.status === 'skipped') && (
                <Button
                  onClick={() => handleAction('reset')}
                  className="w-full bg-yellow-500 hover:bg-yellow-600"
                  disabled={updating}
                >
                  Reset to Ready
                </Button>
              )}
            </div>
            
            {/* Secondary Action Row - Edit Form Button */}
            <div className="flex gap-3">
              <Link href={`/forms/builder?id=${instance.form_id}&tab=settings&section=cadence`} target="_blank" className="flex-1">
                <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-[#2a2a2a]">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Edit Schedule Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

