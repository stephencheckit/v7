"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Repeat, Users, Bell, Eye } from "lucide-react";
import { toast } from "sonner";
import { FormCadence, ScheduleConfig } from "@/lib/types/cadence";

interface ScheduleSettingsProps {
  formId: string;
  workspaceId?: string;
  formTitle: string;
}

export function ScheduleSettings({ formId, workspaceId: workspaceIdProp, formTitle }: ScheduleSettingsProps) {
  const [workspaceId, setWorkspaceId] = useState<string | null>(workspaceIdProp || null);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingCadence, setExistingCadence] = useState<FormCadence | null>(null);
  
  // Auto-detect timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Fetch workspace ID if not provided
  useEffect(() => {
    const fetchWorkspaceId = async () => {
      if (workspaceIdProp) {
        setWorkspaceId(workspaceIdProp);
        return;
      }
      
      try {
        const response = await fetch('/api/auth/workspace');
        if (!response.ok) {
          throw new Error('Failed to fetch workspace');
        }
        const data = await response.json();
        setWorkspaceId(data.workspaceId);
      } catch (error) {
        console.error('Error fetching workspace:', error);
        toast.error('Failed to load workspace info');
      }
    };
    
    fetchWorkspaceId();
  }, [workspaceIdProp]);

  // Form state
  const [enabled, setEnabled] = useState(false);
  const [cadenceName, setCadenceName] = useState("");
  const [pattern, setPattern] = useState<"daily" | "weekly" | "monthly" | "quarterly">("daily");
  const [time, setTime] = useState("09:00");
  const [completionWindowHours, setCompletionWindowHours] = useState(2);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]); // All days
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [includedSummaries, setIncludedSummaries] = useState<any[]>([]);

  // Load existing cadence
  useEffect(() => {
    const fetchCadence = async () => {
      // Don't fetch if workspaceId is not available yet
      if (!workspaceId || !formId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const response = await fetch(`/api/cadences?workspace_id=${workspaceId}&form_id=${formId}`);
        if (!response.ok) throw new Error('Failed to fetch cadence');
        
        const { cadences } = await response.json();
        
        if (cadences && cadences.length > 0) {
          const cadence = cadences[0];
          setExistingCadence(cadence);
          setEnabled(cadence.is_active);
          setCadenceName(cadence.name);
          setPattern(cadence.schedule_config.pattern);
          setTime(cadence.schedule_config.time);
          setCompletionWindowHours(cadence.schedule_config.completion_window_hours);
          setDaysOfWeek(cadence.schedule_config.days_of_week);
          setStartDate(cadence.schedule_config.start_date || "");
          setEndDate(cadence.schedule_config.end_date || "");
          
          // Fetch summaries that include this cadence
          if (cadence.included_in_summaries && cadence.included_in_summaries.length > 0) {
            fetchIncludedSummaries(cadence.included_in_summaries);
          }
        } else {
          // Set default name and start date to today
          setCadenceName(`${formTitle} - Daily`);
          setStartDate(new Date().toISOString().split('T')[0]);
        }
      } catch (error) {
        console.error('Error fetching cadence:', error);
      } finally {
        setLoading(false);
        setInitialLoadComplete(true);
      }
    };

    fetchCadence();
  }, [formId, workspaceId, formTitle]);

  const fetchIncludedSummaries = async (summaryIds: string[]) => {
    if (!workspaceId || summaryIds.length === 0) return;
    
    try {
      const response = await fetch(`/api/summaries?workspace_id=${workspaceId}`);
      if (response.ok) {
        const { summaries } = await response.json();
        const filtered = summaries.filter((s: any) => summaryIds.includes(s.id));
        setIncludedSummaries(filtered);
      }
    } catch (error) {
      console.error('Error fetching included summaries:', error);
    }
  };

  const toggleDayOfWeek = (day: number) => {
    setDaysOfWeek(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const handleSave = async () => {
    if (!workspaceId) {
      toast.error('Workspace not loaded. Please refresh the page.');
      return;
    }
    
    if (!cadenceName.trim()) {
      toast.error('Please enter a cadence name');
      return;
    }

    if (daysOfWeek.length === 0 && pattern === 'daily') {
      toast.error('Please select at least one day of the week');
      return;
    }

    setSaving(true);
    try {
      const schedule_config: ScheduleConfig = {
        type: 'recurring',
        pattern,
        time,
        timezone,
        days_of_week: daysOfWeek,
        completion_window_hours: completionWindowHours,
        start_date: startDate || new Date().toISOString().split('T')[0],
        end_date: endDate || null
      };

      const payload = {
        workspace_id: workspaceId,
        form_id: formId,
        name: cadenceName,
        schedule_config,
        notification_config: {
          recipients: [],
          notify_on_ready: true,
          notify_on_missed: true,
          reminder_minutes_before_deadline: [60, 15]
        },
        is_active: enabled
      };

      let response;
      if (existingCadence) {
        // Update existing
        response = await fetch(`/api/cadences/${existingCadence.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Create new
        response = await fetch('/api/cadences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save cadence');
      }

      const { cadence } = await response.json();
      setExistingCadence(cadence);
      setEnabled(cadence.is_active); // Update toggle state from saved value
      
      toast.success('Schedule saved successfully!');
    } catch (error) {
      console.error('Error saving cadence:', error);
      toast.error('Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  if (!initialLoadComplete) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-gray-400">Loading schedule settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Cadence Settings</h3>
          <p className="text-sm text-gray-400">
            Configure when this form should be available for completion
          </p>
        </div>
        {existingCadence && (
          <a
            href="/cadences"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#c4dfc4] hover:text-[#b5d0b5] text-sm flex items-center gap-2 border border-gray-700 px-4 py-2 rounded-lg hover:bg-[#1a1a1a] transition-colors"
          >
            <Calendar className="w-4 h-4" />
            View Calendar
          </a>
        )}
      </div>

      {/* Enable/Disable Toggle */}
      <Card className="bg-[#1a1a1a] border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Enable Scheduling</CardTitle>
              <CardDescription className="text-gray-400">
                Automatically create form instances based on a recurring schedule
              </CardDescription>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
              className="data-[state=checked]:bg-[#c4dfc4]"
            />
          </div>
        </CardHeader>
      </Card>

      {enabled && (
        <>
          {/* Cadence Name */}
          <Card className="bg-[#1a1a1a] border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Repeat className="w-5 h-5" />
                Cadence Name
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={cadenceName}
                onChange={(e) => setCadenceName(e.target.value)}
                placeholder="e.g., Morning Checklist - Daily"
                className="bg-[#0a0a0a] border-gray-700 text-white"
              />
            </CardContent>
          </Card>

          {/* Pattern Selection */}
          <Card className="bg-[#1a1a1a] border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recurrence Pattern
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {(['daily', 'weekly', 'monthly', 'quarterly'] as const).map((p) => (
                  <Button
                    key={p}
                    variant={pattern === p ? "default" : "outline"}
                    onClick={() => setPattern(p)}
                    className={
                      pattern === p
                        ? "bg-[#c4dfc4] text-gray-900 hover:bg-[#b5d0b5]"
                        : "border-gray-700 text-white hover:bg-[#2a2a2a]"
                    }
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Days of Week (for daily/weekly) */}
          {(pattern === 'daily' || pattern === 'weekly') && (
            <Card className="bg-[#1a1a1a] border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Days of Week</CardTitle>
                <CardDescription className="text-gray-400">
                  Select which days the form should be available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {[
                    { day: 1, label: 'Mon' },
                    { day: 2, label: 'Tue' },
                    { day: 3, label: 'Wed' },
                    { day: 4, label: 'Thu' },
                    { day: 5, label: 'Fri' },
                    { day: 6, label: 'Sat' },
                    { day: 7, label: 'Sun' }
                  ].map(({ day, label }) => (
                    <Button
                      key={day}
                      variant={daysOfWeek.includes(day) ? "default" : "outline"}
                      onClick={() => toggleDayOfWeek(day)}
                      className={
                        daysOfWeek.includes(day)
                          ? "bg-[#c4dfc4] text-gray-900 hover:bg-[#b5d0b5]"
                          : "border-gray-700 text-white hover:bg-[#2a2a2a]"
                      }
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Time */}
          <Card className="bg-[#1a1a1a] border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Scheduled Time
              </CardTitle>
              <CardDescription className="text-gray-400">
                What time should the form become available? (24-hour format)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Time</Label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="bg-[#0a0a0a] border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Detected Timezone</Label>
                <div className="text-gray-400 text-sm mt-1 p-3 bg-[#0a0a0a] rounded border border-gray-700">
                  {timezone}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date Range */}
          <Card className="bg-[#1a1a1a] border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Date Range (Optional)
              </CardTitle>
              <CardDescription className="text-gray-400">
                Limit when this schedule is active
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-[#0a0a0a] border-gray-700 text-white"
                  placeholder="Leave empty to start immediately"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to start immediately</p>
              </div>
              <div>
                <Label className="text-white">End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-[#0a0a0a] border-gray-700 text-white"
                  placeholder="Leave empty for no end date"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for no end date</p>
              </div>
            </CardContent>
          </Card>

          {/* Completion Window */}
          <Card className="bg-[#1a1a1a] border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Completion Window</CardTitle>
              <CardDescription className="text-gray-400">
                How many hours do users have to complete the form?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min="1"
                  max="24"
                  value={completionWindowHours}
                  onChange={(e) => setCompletionWindowHours(parseInt(e.target.value) || 2)}
                  className="bg-[#0a0a0a] border-gray-700 text-white w-24"
                />
                <span className="text-gray-400">hours</span>
              </div>
            </CardContent>
          </Card>

          {/* Visibility Notices */}
          {existingCadence && includedSummaries.length > 0 && (
            <Card className="bg-[#1a1a1a] border-yellow-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-400">
                  <Eye className="w-5 h-5" />
                  Visibility Notice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-400 mb-3">
                  This cadence is included in the following summaries:
                </p>
                {includedSummaries.map(summary => (
                  <div key={summary.id} className="bg-[#0a0a0a] p-3 rounded mb-2 border border-yellow-700/30">
                    <p className="font-medium text-white">{summary.name}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Recipients: {summary.recipients?.join(', ') || 'None'}
                    </p>
                    <p className="text-xs text-gray-400">
                      Generated: {summary.generated_at ? new Date(summary.generated_at).toLocaleDateString() : 'Pending'}
                    </p>
                  </div>
                ))}
                <p className="text-xs text-yellow-500 mt-3 font-medium">
                  ⚠️ Form submissions are reviewed by management
                </p>
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-gray-900"
            >
              {saving ? "Saving..." : existingCadence ? "Update Schedule" : "Create Schedule"}
            </Button>
          </div>
        </>
      )}

      {!enabled && existingCadence && (
        <Card className="bg-[#1a1a1a] border-yellow-700">
          <CardContent className="pt-6">
            <p className="text-yellow-400 text-sm">
              Schedule is currently disabled. Enable it above to activate recurring form instances.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

