"use client";

import { useState, useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { CalendarEvent, FormInstance, InstanceStatus } from "@/lib/types/cadence";
import { createClient } from "@/lib/supabase/client";
import { Calendar as CalendarIcon } from "lucide-react";
import { InstanceDetailModal } from "@/components/cadences/instance-detail-modal";
import { toast } from "sonner";

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
  const [selectedInstance, setSelectedInstance] = useState<FormInstance | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [statusFilter] = useState<InstanceStatus | "all">("all");
  const [refreshKey, setRefreshKey] = useState(0);

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

  // Refresh calendar
  const refreshCalendar = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="w-full h-full overflow-auto">
      <div className="p-4 md:p-8">
        <div className="mx-auto max-w-[1600px] space-y-6 md:space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-2 md:gap-3">
              <CalendarIcon className="h-6 w-6 md:h-10 md:w-10 text-[#c4dfc4]" />
              Cadences
            </h1>
            <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
              Schedule and track recurring form completions
            </p>
          </div>

          {/* Calendar Container */}
          <div className="w-full">
            <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
              <style jsx global>{`
                .fc {
                  color: #000000;
                }
                .fc-toolbar-title {
                  color: #000000 !important;
                  font-weight: 700 !important;
                }
                .fc-button {
                  color: #000000 !important;
                }
                .fc-col-header-cell-cushion {
                  color: #000000 !important;
                  font-weight: 700 !important;
                }
                .fc-daygrid-day-number {
                  color: #000000 !important;
                  font-weight: 700 !important;
                }
                .fc-list-day-cushion {
                  color: #000000 !important;
                }
                .fc-list-event-time {
                  color: #000000 !important;
                }
                .fc-list-event-title {
                  color: #000000 !important;
                }
                .fc-timegrid-slot-label {
                  color: #000000 !important;
                }
                .fc-event-title,
                .fc-event-time {
                  color: #ffffff !important;
                }
              `}</style>
              <FullCalendar
                key={`${statusFilter}-${refreshKey}`}
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
          onUpdate={refreshCalendar}
        />
      )}
        </div>
      </div>
    </div>
  );
}

