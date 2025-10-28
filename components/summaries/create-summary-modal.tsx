"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, ArrowRight, Calendar, Check, Loader2 } from "lucide-react";
import { CreateSummaryFormData, ScheduleConfig } from "@/lib/types/summary";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface CreateSummaryModalProps {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  onSuccess: () => void;
}

interface Cadence {
  id: string;
  name: string;
  form: {
    title: string;
  };
}

export function CreateSummaryModal({ open, onClose, workspaceId, onSuccess }: CreateSummaryModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cadences, setCadences] = useState<Cadence[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [workspaceMembers, setWorkspaceMembers] = useState<any[]>([]);

  // Form data
  const [formData, setFormData] = useState<CreateSummaryFormData>({
    name: "",
    description: "",
    date_range_start: "",
    date_range_end: "",
    source_type: "forms", // Default to forms since more likely to have data
    cadence_ids: [],
    form_ids: [],
    filter_config: {},
    schedule_type: "manual",
    recipients: [],
    notify_users: true,
    generate_now: true
  });

  // Load cadences, forms and workspace members
  useEffect(() => {
    if (open) {
      fetchCadences();
      fetchForms();
      fetchWorkspaceMembers();
      // Reset form
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      setFormData({
        name: `Weekly Summary - ${new Date().toLocaleDateString()}`,
        description: "",
        date_range_start: weekAgo.toISOString().split('T')[0],
        date_range_end: new Date().toISOString().split('T')[0],
        source_type: "forms",
        cadence_ids: [],
        form_ids: [],
        filter_config: {},
        schedule_type: "manual",
        recipients: [],
        notify_users: true,
        generate_now: true
      });
      setStep(1);
    }
  }, [open]);

  const fetchCadences = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('form_cadences')
        .select('id, name, form:simple_forms(title)')
        .eq('workspace_id', workspaceId)
        .eq('is_active', true)
        .order('name');
      
      setCadences(data || []);
    } catch (error) {
      console.error('Error fetching cadences:', error);
    }
  };

  const fetchForms = async () => {
    try {
      const supabase = createClient();
      
      // Use simple_forms table (actual table name)
      let query = supabase
        .from('simple_forms')
        .select('id, title, created_at, workspace_id');
      
      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }
      
      const { data, error } = await query.order('title');
      
      if (error) {
        console.error('Error fetching forms:', error);
        toast.error('Failed to load forms');
        return;
      }
      
      console.log('Fetched forms:', data?.length || 0, 'forms');
      
      // Get submission counts for each form
      if (data && data.length > 0) {
        const formsWithCounts = await Promise.all(
          data.map(async (form) => {
            const { count, error: countError } = await supabase
              .from('simple_form_submissions')
              .select('*', { count: 'exact', head: true })
              .eq('form_id', form.id);
            
            if (countError) {
              console.error('Error counting submissions for form', form.id, countError);
            }
            
            return { ...form, submission_count: count || 0 };
          })
        );
        
        console.log('Forms with counts:', formsWithCounts);
        setForms(formsWithCounts);
      } else {
        console.log('No forms found for workspace:', workspaceId);
        setForms([]);
      }
    } catch (error) {
      console.error('Error in fetchForms:', error);
      toast.error('Failed to load forms');
    }
  };

  const fetchWorkspaceMembers = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('workspace_members')
        .select('user_id, users(email, raw_user_meta_data)')
        .eq('workspace_id', workspaceId);
      
      setWorkspaceMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/summaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create summary');
      }

      const { summary } = await response.json();
      
      if (formData.generate_now) {
        toast.success('Summary is being generated', {
          description: 'You will be notified when it\'s ready'
        });
      } else {
        toast.success('Summary created successfully');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error creating summary:', error);
      toast.error(error.message || 'Failed to create summary');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name && formData.date_range_start && formData.date_range_end;
      case 2:
        if (formData.source_type === 'forms') {
          return formData.form_ids.length > 0;
        } else if (formData.source_type === 'cadences') {
          return formData.cadence_ids.length > 0;
        } else { // both
          return formData.form_ids.length > 0 || formData.cadence_ids.length > 0;
        }
      case 3:
        return true;
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0a0a0a] border-gray-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create Summary Report</DialogTitle>
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded ${
                  s === step ? 'bg-[#c4dfc4]' : s < step ? 'bg-green-700' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div>
                <Label>Summary Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Weekly Summary - 10/28/2025"
                  className="bg-[#1a1a1a] border-gray-700"
                />
              </div>

              <div>
                <Label>Description (Optional)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What is this summary for?"
                  className="bg-[#1a1a1a] border-gray-700"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.date_range_start}
                    onChange={(e) => setFormData({ ...formData, date_range_start: e.target.value })}
                    className="bg-[#1a1a1a] border-gray-700"
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.date_range_end}
                    onChange={(e) => setFormData({ ...formData, date_range_end: e.target.value })}
                    className="bg-[#1a1a1a] border-gray-700"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Select Data Source */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Data Source</h3>
              <p className="text-sm text-gray-400">
                Choose what data to analyze in this summary
              </p>

              {/* Source Type Selector */}
              <RadioGroup
                value={formData.source_type}
                onValueChange={(value: any) => setFormData({ ...formData, source_type: value })}
              >
                <div className="flex items-center space-x-2 p-3 bg-[#1a1a1a] rounded-lg border border-gray-700">
                  <RadioGroupItem value="forms" id="forms" />
                  <Label htmlFor="forms" className="flex-1 cursor-pointer">
                    <div className="font-medium">Forms (Regular Submissions)</div>
                    <div className="text-sm text-gray-400">Analyze all submissions for selected forms</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-[#1a1a1a] rounded-lg border border-gray-700">
                  <RadioGroupItem value="cadences" id="cadences" />
                  <Label htmlFor="cadences" className="flex-1 cursor-pointer">
                    <div className="font-medium">Cadences (Scheduled Forms)</div>
                    <div className="text-sm text-gray-400">Analyze scheduled form instances</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-[#1a1a1a] rounded-lg border border-gray-700">
                  <RadioGroupItem value="both" id="both" />
                  <Label htmlFor="both" className="flex-1 cursor-pointer">
                    <div className="font-medium">Both</div>
                    <div className="text-sm text-gray-400">Include both regular and scheduled submissions</div>
                  </Label>
                </div>
              </RadioGroup>

              {/* Forms Selection */}
              {(formData.source_type === 'forms' || formData.source_type === 'both') && (
                <div className="space-y-2">
                  <Label>Select Forms</Label>
                  {forms.length === 0 ? (
                    <div className="p-8 bg-[#1a1a1a] rounded-lg border border-gray-700 text-center">
                      <p className="text-gray-400">No forms found</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {forms.map((form) => (
                        <div
                          key={form.id}
                          className="flex items-center space-x-3 p-3 bg-[#1a1a1a] rounded-lg border border-gray-700 hover:border-gray-600"
                        >
                          <Checkbox
                            id={`form-${form.id}`}
                            checked={formData.form_ids.includes(form.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  form_ids: [...formData.form_ids, form.id]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  form_ids: formData.form_ids.filter(id => id !== form.id)
                                });
                              }
                            }}
                          />
                          <label htmlFor={`form-${form.id}`} className="flex-1 cursor-pointer">
                            <div className="font-medium">{form.title}</div>
                            <div className="text-sm text-gray-400">
                              {form.submission_count} submission{form.submission_count !== 1 ? 's' : ''}
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Cadences Selection */}
              {(formData.source_type === 'cadences' || formData.source_type === 'both') && (
                <div className="space-y-2">
                  <Label>Select Cadences</Label>
                  {cadences.length === 0 ? (
                    <div className="p-8 bg-[#1a1a1a] rounded-lg border border-gray-700 text-center">
                      <p className="text-gray-400">No active cadences found</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {cadences.map((cadence) => (
                        <div
                          key={cadence.id}
                          className="flex items-center space-x-3 p-3 bg-[#1a1a1a] rounded-lg border border-gray-700 hover:border-gray-600"
                        >
                          <Checkbox
                            id={`cadence-${cadence.id}`}
                            checked={formData.cadence_ids.includes(cadence.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  cadence_ids: [...formData.cadence_ids, cadence.id]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  cadence_ids: formData.cadence_ids.filter(id => id !== cadence.id)
                                });
                              }
                            }}
                          />
                          <label htmlFor={`cadence-${cadence.id}`} className="flex-1 cursor-pointer">
                            <div className="font-medium">{cadence.name}</div>
                            <div className="text-sm text-gray-400">{cadence.form?.title}</div>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Schedule */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Schedule</h3>
              
              <RadioGroup
                value={formData.schedule_type}
                onValueChange={(value: any) => setFormData({ ...formData, schedule_type: value, generate_now: value === 'manual' })}
              >
                <div className="flex items-center space-x-2 p-3 bg-[#1a1a1a] rounded-lg border border-gray-700">
                  <RadioGroupItem value="manual" id="manual" />
                  <Label htmlFor="manual" className="flex-1 cursor-pointer">
                    <div className="font-medium">Generate Now</div>
                    <div className="text-sm text-gray-400">Create summary immediately (one-time)</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-[#1a1a1a] rounded-lg border border-gray-700">
                  <RadioGroupItem value="one_time" id="one_time" />
                  <Label htmlFor="one_time" className="flex-1 cursor-pointer">
                    <div className="font-medium">Schedule Once</div>
                    <div className="text-sm text-gray-400">Generate at a specific date and time</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-[#1a1a1a] rounded-lg border border-gray-700">
                  <RadioGroupItem value="recurring" id="recurring" />
                  <Label htmlFor="recurring" className="flex-1 cursor-pointer">
                    <div className="font-medium">Recurring Schedule</div>
                    <div className="text-sm text-gray-400">Generate automatically at regular intervals</div>
                  </Label>
                </div>
              </RadioGroup>

              {formData.schedule_type === 'one_time' && (
                <div>
                  <Label>Scheduled Date & Time</Label>
                  <Input
                    type="datetime-local"
                    onChange={(e) => setFormData({
                      ...formData,
                      schedule_config: { scheduled_at: new Date(e.target.value).toISOString() }
                    })}
                    className="bg-[#1a1a1a] border-gray-700"
                  />
                </div>
              )}

              {formData.schedule_type === 'recurring' && (
                <div className="space-y-4">
                  <div>
                    <Label>Frequency</Label>
                    <select
                      onChange={(e) => setFormData({
                        ...formData,
                        schedule_config: { ...formData.schedule_config, frequency: e.target.value as any }
                      })}
                      className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-2 text-white"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <Label>Time</Label>
                    <Input
                      type="time"
                      defaultValue="09:00"
                      onChange={(e) => setFormData({
                        ...formData,
                        schedule_config: { ...formData.schedule_config, time: e.target.value }
                      })}
                      className="bg-[#1a1a1a] border-gray-700"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Recipients */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recipients & Notifications</h3>
              
              <div>
                <Label>Recipients</Label>
                <p className="text-sm text-gray-400 mb-2">Select who should receive this summary</p>
                
                {workspaceMembers.length === 0 ? (
                  <div className="p-4 bg-[#1a1a1a] rounded-lg border border-gray-700">
                    <p className="text-gray-400 text-sm">No workspace members found</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {workspaceMembers.map((member: any) => (
                      <div
                        key={member.user_id}
                        className="flex items-center space-x-3 p-2 bg-[#1a1a1a] rounded-lg border border-gray-700"
                      >
                        <Checkbox
                          id={member.user_id}
                          checked={formData.recipients.includes(member.users?.email)}
                          onCheckedChange={(checked) => {
                            const email = member.users?.email;
                            if (checked && email) {
                              setFormData({
                                ...formData,
                                recipients: [...formData.recipients, email]
                              });
                            } else if (email) {
                              setFormData({
                                ...formData,
                                recipients: formData.recipients.filter(e => e !== email)
                              });
                            }
                          }}
                        />
                        <label htmlFor={member.user_id} className="flex-1 cursor-pointer">
                          <div className="text-sm">{member.users?.email}</div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 p-3 bg-[#1a1a1a] rounded-lg border border-gray-700">
                <Checkbox
                  id="notify_users"
                  checked={formData.notify_users}
                  onCheckedChange={(checked) => setFormData({ ...formData, notify_users: !!checked })}
                />
                <Label htmlFor="notify_users" className="cursor-pointer">
                  <div className="font-medium">Notify form users about inclusion</div>
                  <div className="text-sm text-gray-400">
                    Display visibility notice on forms and submission pages
                  </div>
                </Label>
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-400">
                  📧 Email notifications coming soon - currently using in-app notifications
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Preview & Generate */}
          {step === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Review & Generate</h3>
              
              <div className="space-y-3 p-4 bg-[#1a1a1a] rounded-lg border border-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-400">Name:</span>
                  <span className="font-medium">{formData.name}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Date Range:</span>
                  <span className="font-medium">
                    {new Date(formData.date_range_start).toLocaleDateString()} - {new Date(formData.date_range_end).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Cadences:</span>
                  <span className="font-medium">{formData.cadence_ids.length} selected</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Schedule:</span>
                  <span className="font-medium capitalize">{formData.schedule_type.replace('_', ' ')}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Recipients:</span>
                  <span className="font-medium">{formData.recipients.length}</span>
                </div>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-400">
                  {formData.generate_now 
                    ? '✨ Summary will be generated immediately using AI' 
                    : '📅 Summary will be generated according to schedule'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-700">
          <Button
            variant="outline"
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="border-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>

          {step < 5 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-black"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-black"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Create Summary
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

