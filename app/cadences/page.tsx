"use client";

import { useState, useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { CalendarEvent, FormInstance, InstanceStatus } from "@/lib/types/cadence";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar as CalendarIcon, RefreshCw, FileCheck, Clock, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { InstanceDetailModal } from "@/components/cadences/instance-detail-modal";
import { toast } from "sonner";
import Link from "next/link";

// Status color mapping
const STATUS_COLORS: Record<InstanceStatus, string> = {
  pending: "#6b7280", // gray
  ready: "#f59e0b", // yellow/amber
  in_progress: "#3b82f6", // blue
  completed: "#10b981", // green
  missed: "#ef4444", // red
  skipped: "#9ca3af" // light gray
};

export default function CadencesPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<FormInstance | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<InstanceStatus | "all">("all");

  // Auto-detect timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

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
    };

    fetchWorkspace();
  }, []);

  // Fetch instances for FullCalendar
  const fetchEvents = async (fetchInfo: any) => {
    if (!workspaceId) {
      return [];
    }

    try {
      const startDate = fetchInfo.startStr;
      const endDate = fetchInfo.endStr;

      // Build query params
      const params = new URLSearchParams({
        workspace_id: workspaceId,
        start_date: startDate,
        end_date: endDate,
        view: 'calendar'
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/instances?${params.toString()}`);
      
      const data = await response.json();
      
      // Check for migration error
      if (data.error && data.error.includes('Database tables not yet created')) {
        toast.error('Migration Required', {
          description: 'Please apply the cadence migration in Supabase dashboard',
          duration: 10000
        });
        return [];
      }
      
      if (!response.ok) {
        console.error('API Error Details:', data);
        throw new Error(data.details || data.error || `HTTP error! status: ${response.status}`);
      }

      const { events: apiEvents } = data;

      // Transform API events to FullCalendar events
      return (apiEvents || []).map((event: any) => ({
        id: event.instanceId,
        title: event.title,
        start: event.start,
        end: event.end,
        backgroundColor: STATUS_COLORS[event.status as InstanceStatus] || "#6b7280",
        borderColor: STATUS_COLORS[event.status as InstanceStatus] || "#6b7280",
        extendedProps: {
          status: event.status,
          formId: event.formId,
          instanceId: event.instanceId,
          cadenceId: event.cadenceId,
          resource: event.resource
        }
      }));
    } catch (error) {
      console.error('Error loading instances:', error);
      toast.error('Failed to load calendar');
      return [];
    }
  };

  // Event click handler for FullCalendar
  const handleEventClick = async (clickInfo: any) => {
    const instanceId = clickInfo.event.extendedProps.instanceId;
    
    const supabase = createClient();
    
    // Type cast to avoid "excessively deep" TypeScript error with complex nested query
    const result: any = await (supabase as any)
      .from('form_instances')
      .select(`
        *,
        form:simple_forms(id, title, description, schema),
        cadence:form_cadences(id, name, schedule_config),
        submission:simple_form_submissions(id, data, submitted_at)
      `)
      .eq('id', instanceId)
      .single();
    
    const instance = result.data as FormInstance | null;

    if (instance) {
      setSelectedInstance(instance);
      setModalOpen(true);
    }
  };

  // Calculate stats - simplified without moment
  const totalInstances = events.length;
  const today = new Date().toDateString();
  const completedToday = events.filter(e => {
    if (!e.extendedProps) return false;
    return e.extendedProps.status === 'completed' && 
           new Date(e.end).toDateString() === today;
  }).length;
  const pendingTasks = events.filter(e => {
    if (!e.extendedProps) return false;
    return e.extendedProps.status === 'ready' || e.extendedProps.status === 'pending';
  }).length;
  const missedTasks = events.filter(e => {
    if (!e.extendedProps) return false;
    return e.extendedProps.status === 'missed';
  }).length;

  return (
    <div className="w-full h-full overflow-auto">
      <div className="p-4 md:p-8">
        <div className="mx-auto max-w-[1600px] space-y-6 md:space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-2 md:gap-3">
                <CalendarIcon className="h-6 w-6 md:h-10 md:w-10 text-[#c4dfc4]" />
                Cadences
              </h1>
              <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
                Schedule and track recurring form completions
              </p>
            </div>
            
            <Link href="/summaries">
              <Button variant="outline" className="border-gray-700 shrink-0">
                <FileCheck className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">View Summaries</span>
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4">
            <Card className="bg-gradient-to-br from-[#c4dfc4] to-[#c4dfc4]/80 border-0 p-4">
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-8 w-8 text-[#0a0a0a]" />
                <div>
                  <p className="text-sm text-[#0a0a0a]/70">Total Tasks</p>
                  <p className="text-2xl font-bold text-[#0a0a0a]">{totalInstances}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-[#c8e0f5] to-[#c8e0f5]/80 border-0 p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-[#0a0a0a]" />
                <div>
                  <p className="text-sm text-[#0a0a0a]/70">Pending</p>
                  <p className="text-2xl font-bold text-[#0a0a0a]">{pendingTasks}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-[#c4dfc4] to-[#c4dfc4]/80 border-0 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-[#0a0a0a]" />
                <div>
                  <p className="text-sm text-[#0a0a0a]/70">Completed Today</p>
                  <p className="text-2xl font-bold text-[#0a0a0a]">{completedToday}</p>
                </div>
              </div>
            </Card>

            <Card className={`border-0 p-4 ${
              missedTasks > 0
                ? 'bg-gradient-to-br from-[#ff6b6b] to-[#ff6b6b]/80'
                : 'bg-gradient-to-br from-[#f5edc8] to-[#f5edc8]/80'
            }`}>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-[#0a0a0a]" />
                <div>
                  <p className="text-sm text-[#0a0a0a]/70">Missed</p>
                  <p className="text-2xl font-bold text-[#0a0a0a]">{missedTasks}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters and Legend */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <p className="text-gray-400 text-sm">
                Viewing in {timezone} timezone
              </p>
              
              <div className="flex items-center gap-3 flex-wrap">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="ready">Ready</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="missed">Missed</option>
                  <option value="skipped">Skipped</option>
                </select>

                {/* Refresh Button */}
                <Button
                  onClick={fetchInstances}
                  variant="outline"
                  className="border-gray-700"
                  disabled={loading}
                  size="sm"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 p-4 bg-[#1a1a1a] rounded-lg border border-gray-700">
              {Object.entries(STATUS_COLORS).map(([status, color]) => (
                <div key={status} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-gray-300 capitalize">
                    {status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Container */}
          <div className="w-full">
            <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
              <FullCalendar
                key={statusFilter}
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
                }}
                events={fetchEvents}
                eventClick={handleEventClick}
                height={600}
                editable={false}
                selectable={false}
                selectMirror={true}
                dayMaxEvents={true}
                weekends={true}
                eventDisplay="block"
                eventTimeFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  meridiem: false
                }}
              />
            </div>
          </div>

      {/* Instance Detail Modal */}
      {selectedInstance && (
        <InstanceDetailModal
          instance={selectedInstance}
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedInstance(null);
          }}
          onUpdate={() => {
            // Refresh calendar by updating the statusFilter to trigger re-fetch
            setStatusFilter(statusFilter);
          }}
        />
      )}
        </div>
      </div>
    </div>
  );
}

