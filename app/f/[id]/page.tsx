"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertCircle, Check, BarChart3, Camera, Mic } from "lucide-react";
import { AIVisionAssistant } from "@/components/ai-vision-assistant";
import { VoiceCommentaryCapture } from "@/components/voice-commentary-capture";
import { toast } from "sonner";
import { SignaturePadWidget } from "@/components/signature-pad-widget";

interface FormField {
  id: string;
  type: string;
  name: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface FormSchema {
  fields: FormField[];
}

interface ThankYouSettings {
  message: string;
  allowAnotherSubmission: boolean;
  showResponseSummary: boolean;
  showCloseButton: boolean;
  allowSocialShare: boolean;
  redirectUrl: string;
  redirectDelay: number;
}

interface FormData {
  id: string;
  title: string;
  description: string;
  schema: FormSchema;
  thank_you_settings?: ThankYouSettings;
  ai_vision_enabled?: boolean;
}

export default function PublicFormPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  // Check if this is a preview and track source
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const isPreview = searchParams.get('preview') === 'true';
  const timestamp = searchParams.get('t'); // Get timestamp for cache busting
  const source = searchParams.get('source'); // Where did user come from (e.g., 'dashboard')
  const instanceId = searchParams.get('instance_id'); // Which instance they're completing

  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [aiMetadata, setAiMetadata] = useState<Record<string, any>>({});
  const [analysisFeed, setAnalysisFeed] = useState<any[]>([]);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  const [cadenceInfo, setCadenceInfo] = useState<any>(null);
  const [nextWorkItems, setNextWorkItems] = useState<any[]>([]);
  const [assistMode, setAssistMode] = useState<'vision' | 'voice' | null>(null); // Which AI assist is active
  const [voiceCommentary, setVoiceCommentary] = useState<string>(''); // Captured voice commentary

  // Reset state when timestamp changes (new preview load)
  useEffect(() => {
    if (isPreview && timestamp) {
      setSubmitted(false);
      setFormValues({});
      setAiMetadata({});
      setAnalysisFeed([]);
      setError(null);
    }
  }, [timestamp, isPreview]);

  useEffect(() => {
    loadForm();
    loadCadenceInfo();
  }, [formId]);

  // Load next work items after submission (for non-dashboard flows)
  useEffect(() => {
    if (submitted && source !== 'dashboard') {
      loadNextWorkItems();
    }
  }, [submitted, source]);

  const loadNextWorkItems = async () => {
    try {
      const workspaceId = await getCurrentWorkspaceId();
      if (!workspaceId) return;

      const response = await fetch(`/api/instances?workspace_id=${workspaceId}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        const remaining = (data.instances || []).filter((i: any) =>
          i.status !== 'completed' && i.status !== 'skipped'
        ).slice(0, 3);
        setNextWorkItems(remaining);
      }
    } catch (error) {
      console.error('Error loading next work items:', error);
    }
  };

  const loadForm = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/forms/${formId}`);

      if (!response.ok) {
        throw new Error('Form not found');
      }

      const data = await response.json();
      setForm(data.form);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load form');
    } finally {
      setLoading(false);
    }
  };

  const loadCadenceInfo = async () => {
    try {
      // Fetch cadence for this form
      const response = await fetch(`/api/cadences?form_id=${formId}`);
      if (response.ok) {
        const { cadences } = await response.json();
        if (cadences && cadences.length > 0) {
          const cadence = cadences[0];
          // Fetch summaries that include this cadence
          if (cadence.included_in_summaries && cadence.included_in_summaries.length > 0) {
            const summaryResponse = await fetch(`/api/summaries?workspace_id=${cadence.workspace_id}`);
            if (summaryResponse.ok) {
              const { summaries } = await summaryResponse.json();
              const includedSummaries = summaries.filter((s: any) =>
                cadence.included_in_summaries.includes(s.id)
              );
              setCadenceInfo({ cadence, includedSummaries });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading cadence info:', error);
    }
  };

  const handleVoiceFieldUpdate = (fieldId: string, value: any) => {
    // Find the field in the schema
    const field = form?.schema.fields.find(f => f.id === fieldId || f.name === fieldId);
    if (!field) return;

    // Update form value
    setFormValues(prev => ({
      ...prev,
      [field.name]: value
    }));
  };

  const handleCommentaryCapture = async (commentary: string) => {
    setVoiceCommentary(commentary);

    // Save commentary to database immediately
    if (form) {
      try {
        const workspaceId = await getCurrentWorkspaceId();
        if (!workspaceId) return;

        await fetch('/api/commentary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workspace_id: workspaceId,
            form_id: formId,
            raw_transcription: commentary,
            location: cadenceInfo?.location || null
          })
        });

        console.log('✅ Commentary saved');
      } catch (error) {
        console.error('Failed to save commentary:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form) return;

    // Validate required fields
    const missingFields = form.schema.fields
      .filter(field => field.required && !formValues[field.name])
      .map(field => field.label);

    if (missingFields.length > 0) {
      setError(`Please fill in required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch(`/api/forms/${formId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: formValues,
          ai_metadata: aiMetadata,
          is_preview: isPreview
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit form');
      }

      setSubmitted(true);

      // If from dashboard, mark instance as completed and fetch next work
      if (source === 'dashboard' && instanceId) {
        try {
          // Mark instance as completed
          await fetch(`/api/instances/${instanceId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'completed' }),
          });

          // Fetch remaining work items (async, don't wait)
          fetch('/api/instances?workspace_id=' + (await getCurrentWorkspaceId()) + '&limit=5')
            .then(res => res.json())
            .then(data => {
              const remaining = (data.instances || []).filter((i: any) =>
                i.status !== 'completed' && i.status !== 'skipped'
              ).slice(0, 3);
              setNextWorkItems(remaining);
            })
            .catch(console.error);

          // Redirect to dashboard after brief delay with success toast
          setTimeout(() => {
            toast.success('Form completed!', {
              description: nextWorkItems.length > 0
                ? `You have ${nextWorkItems.length} more items due.`
                : 'Great job! All your work is complete.',
            });
            router.push('/dashboard');
          }, 1500);
          return; // Don't show thank you page for dashboard flow
        } catch (error) {
          console.error('Error updating instance:', error);
          // Continue to show thank you page on error
        }
      }

      // Start redirect countdown if configured (for non-dashboard flows)
      const thankYouSettings = form?.thank_you_settings;
      if (thankYouSettings?.redirectUrl && thankYouSettings.redirectDelay >= 0) {
        setRedirectCountdown(thankYouSettings.redirectDelay);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to get current workspace ID
  const getCurrentWorkspaceId = async () => {
    try {
      const response = await fetch('/api/forms?limit=1');
      if (response.ok) {
        const data = await response.json();
        return data.forms?.[0]?.workspace_id || null;
      }
    } catch (error) {
      console.error('Error fetching workspace:', error);
    }
    return null;
  };

  // Handle redirect countdown
  useEffect(() => {
    if (redirectCountdown === null) return;

    if (redirectCountdown === 0 && form?.thank_you_settings?.redirectUrl) {
      window.location.href = form.thank_you_settings.redirectUrl;
      return;
    }

    const timer = setTimeout(() => {
      setRedirectCountdown(prev => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [redirectCountdown, form?.thank_you_settings?.redirectUrl]);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleAnalysisComplete = (snapshot: number, answers: any, confidence: any) => {
    // Add to analysis feed
    setAnalysisFeed(prev => [{
      timestamp: new Date().toLocaleTimeString(),
      snapshotNumber: snapshot,
      answers,
      confidence,
      answeredCount: Object.keys(answers).length,
    }, ...prev].slice(0, 20)); // Keep last 20
  };

  const handleAISuggestion = (fieldId: string, value: any, confidence: number, reasoning: string) => {
    // HOW ANSWERS ARE SELECTED:
    // Each snapshot (every 3 seconds) analyzes the current video frame independently.
    // We keep the BEST answer (highest confidence) from all snapshots.
    // The form field shows the single best answer, NOT a summary of all snapshots.
    // This ensures the most confident/accurate answer is used.

    // Store metadata
    setAiMetadata(prev => {
      const existingMetadata = prev[fieldId];

      // Only update if new confidence is higher, or if no existing metadata
      if (!existingMetadata || confidence > existingMetadata.confidence) {
        return {
          ...prev,
          [fieldId]: {
            value,
            confidence,
            reasoning,
            timestamp: new Date().toISOString(),
          }
        };
      }

      return prev;
    });

    // Auto-fill field if confidence >= 80% and field is empty
    setFormValues(prev => {
      // Find the field in the form schema
      const field = form?.schema.fields.find(f => f.id === fieldId);
      if (!field) return prev;

      const fieldName = field.name;
      const existingValue = prev[fieldName];

      // Only auto-fill if field is empty or if new confidence is significantly higher
      const existingMetadata = aiMetadata[fieldId];
      const shouldUpdate = !existingValue ||
        (existingMetadata && confidence > existingMetadata.confidence + 0.05);

      if (confidence >= 0.80 && shouldUpdate) {
        return {
          ...prev,
          [fieldName]: value
        };
      }

      return prev;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-[#c4dfc4] animate-spin mx-auto mb-4" />
          <p className="text-sm md:text-base text-gray-400">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 md:p-6">
        <Card className="bg-[#1a1a1a] border-red-500/30 p-6 md:p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Form Not Found</h1>
          <p className="text-gray-400">{error}</p>
        </Card>
      </div>
    );
  }

  if (submitted) {
    const thankYouSettings = form?.thank_you_settings || {
      message: "Thank you for your submission!",
      allowAnotherSubmission: true,
      showResponseSummary: true,
      showCloseButton: false,
      allowSocialShare: false,
      redirectUrl: "",
      redirectDelay: 0,
    };

    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 md:p-6">
        <Card className="bg-[#1a1a1a] border-[#c4dfc4]/30 p-6 md:p-8 max-w-2xl w-full">
          <div className="text-center space-y-6">
            {/* Success Icon */}
            <CheckCircle2 className="w-16 h-16 text-[#c4dfc4] mx-auto" />

            {/* Custom Message */}
            <p className="text-lg md:text-xl font-medium text-white whitespace-pre-wrap">
              {thankYouSettings.message}
            </p>

            {/* Response Summary */}
            {thankYouSettings.showResponseSummary && Object.keys(formValues).length > 0 && (
              <div className="mt-4 md:mt-6 p-3 md:p-4 rounded-lg bg-[#0a0a0a] border border-border/30 text-left">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Your Response:</h3>
                <div className="space-y-3">
                  {Object.entries(formValues).map(([key, value]) => {
                    // Check if this is a signature object
                    if (typeof value === 'object' && value !== null && (value as any).signatureData) {
                      const sig = value as any;
                      return (
                        <div key={key} className="p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/30">
                          <div className="flex items-start gap-3">
                            <img
                              src={sig.signatureData}
                              alt="Signature"
                              className="h-12 border border-white/20 bg-white rounded"
                              style={{ minWidth: '100px' }}
                            />
                            <div className="flex-1 space-y-1">
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                ✓ Verified Signature
                              </Badge>
                              <p className="text-xs text-white font-medium">
                                Signed by {sig.signedBy}
                              </p>
                              <p className="text-xs text-gray-400">
                                {new Date(sig.signedAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Regular response
                    return (
                      <div key={key} className="text-sm">
                        <span className="text-gray-500">{key}:</span>{' '}
                        <span className="text-gray-300">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Next Work Items (if any) */}
            {nextWorkItems.length > 0 && (
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-left">
                <h3 className="text-sm font-medium text-blue-400 mb-3">You have more work due:</h3>
                <div className="space-y-2">
                  {nextWorkItems.map((item: any) => (
                    <div key={item.id} className="text-sm text-gray-300">
                      • {item.instance_name}
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Go to Dashboard
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center pt-4">
              {thankYouSettings.allowAnotherSubmission && (
                <Button
                  onClick={() => {
                    setSubmitted(false);
                    setFormValues({});
                    setRedirectCountdown(null);
                  }}
                  className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a]"
                >
                  Submit Another Response
                </Button>
              )}

              {thankYouSettings.showCloseButton && (
                <Button
                  onClick={() => window.close()}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-white/5"
                >
                  Close
                </Button>
              )}

              {thankYouSettings.allowSocialShare && (
                <Button
                  onClick={() => {
                    const url = window.location.href.replace(/\/f\/.*$/, `/f/${formId}`);
                    navigator.clipboard.writeText(url);
                    toast.success('Form link copied to clipboard!', {
                      description: 'Share this link with others to collect responses.',
                    });
                  }}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-white/5"
                >
                  Share
                </Button>
              )}
            </div>

            {/* Redirect Countdown */}
            {redirectCountdown !== null && thankYouSettings.redirectUrl && (
              <p className="text-sm text-gray-500 italic pt-2">
                {redirectCountdown === 0
                  ? "Redirecting now..."
                  : `Redirecting in ${redirectCountdown} second${redirectCountdown === 1 ? '' : 's'}...`}
              </p>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8 md:py-12 px-4 md:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Preview Banner */}
        {isPreview && (
          <div className="mb-4 p-3 md:p-4 bg-[#c4dfc4]/10 border-2 border-[#c4dfc4]/30 rounded-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <Badge className="bg-[#c4dfc4] text-[#0a0a0a] shrink-0">Preview Mode</Badge>
              <p className="text-xs sm:text-sm text-gray-300">
                Submissions in preview mode will not be counted in your analytics.
              </p>
            </div>
          </div>
        )}

        {/* Visibility Banner */}
        {cadenceInfo?.includedSummaries && cadenceInfo.includedSummaries.length > 0 && (
          <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <BarChart3 className="w-5 h-5" />
              <p className="font-medium">
                This form is part of {cadenceInfo.includedSummaries[0].name}
              </p>
            </div>
            <p className="text-sm text-blue-300">
              Sent to: {cadenceInfo.includedSummaries[0].recipients?.join(', ') || 'Management'}
            </p>
          </div>
        )}

        <Card className="bg-[#1a1a1a] border-white/10 p-4 md:p-8">
          {/* Form Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{form?.title}</h1>
            {form?.description && (
              <p className="text-sm md:text-base text-gray-400">{form.description}</p>
            )}
          </div>

          {/* AI Assist Options - Vision or Voice */}
          {form && form.ai_vision_enabled && !assistMode && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3">AI Assist Options</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setAssistMode('vision')}
                  className="h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-br from-[#c4dfc4]/20 to-[#c8e0f5]/20 hover:from-[#c4dfc4]/30 hover:to-[#c8e0f5]/30 border border-[#c4dfc4]/30"
                >
                  <Camera className="h-6 w-6 text-[#c4dfc4]" />
                  <span className="text-sm font-medium">AI Vision</span>
                  <span className="text-xs text-gray-400">Use camera</span>
                </Button>
                <Button
                  onClick={() => setAssistMode('voice')}
                  className="h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-br from-[#c4dfc4]/20 to-[#c8e0f5]/20 hover:from-[#c4dfc4]/30 hover:to-[#c8e0f5]/30 border border-[#c4dfc4]/30"
                >
                  <Mic className="h-6 w-6 text-[#c4dfc4]" />
                  <span className="text-sm font-medium">Voice Recording</span>
                  <span className="text-xs text-gray-400">Speak answers</span>
                </Button>
              </div>
            </div>
          )}

          {/* AI Vision Assistant */}
          {form && assistMode === 'vision' && (
            <>
              <Button
                onClick={() => setAssistMode(null)}
                variant="ghost"
                size="sm"
                className="mb-3 text-gray-400 hover:text-white"
              >
                ← Switch to Voice Recording
              </Button>
              <AIVisionAssistant
                formSchema={form.schema}
                currentValues={formValues}
                onFieldSuggestion={handleAISuggestion}
                onAnalysisComplete={handleAnalysisComplete}
              />
            </>
          )}

          {/* Voice Commentary Capture */}
          {form && assistMode === 'voice' && (
            <>
              <Button
                onClick={() => setAssistMode(null)}
                variant="ghost"
                size="sm"
                className="mb-3 text-gray-400 hover:text-white"
              >
                ← Switch to AI Vision
              </Button>
              <VoiceCommentaryCapture
                formSchema={form.schema}
                currentValues={formValues}
                onFieldUpdate={handleVoiceFieldUpdate}
                onCommentaryCapture={handleCommentaryCapture}
              />
            </>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {form?.schema.fields.map((field) => (
              <div key={field.id}>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <span>
                    {field.label}
                    {field.required && <span className="text-red-400 ml-1">*</span>}
                  </span>
                  {aiMetadata[field.id] && (
                    <Check className="w-4 h-4 text-[#c4dfc4]" />
                  )}
                </label>

                {/* Text Input */}
                {field.type === "text" && (
                  <Input
                    value={formValues[field.name] || ""}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="bg-white/5 border-white/10 text-white"
                  />
                )}

                {/* Text Area */}
                {field.type === "textarea" && (
                  <textarea
                    value={formValues[field.name] || ""}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#c4dfc4]"
                  />
                )}

                {/* Email */}
                {field.type === "email" && (
                  <Input
                    type="email"
                    value={formValues[field.name] || ""}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="bg-white/5 border-white/10 text-white"
                  />
                )}

                {/* Number */}
                {field.type === "number" && (
                  <Input
                    type="number"
                    value={formValues[field.name] || ""}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="bg-white/5 border-white/10 text-white"
                  />
                )}

                {/* Phone */}
                {field.type === "phone" && (
                  <Input
                    type="tel"
                    value={formValues[field.name] || ""}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="bg-white/5 border-white/10 text-white"
                  />
                )}

                {/* Date */}
                {field.type === "date" && (
                  <Input
                    type="date"
                    value={formValues[field.name] || ""}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    required={field.required}
                    className="bg-white/5 border-white/10 text-white"
                  />
                )}

                {/* Radio Buttons */}
                {field.type === "radio" && field.options && (
                  <div className="space-y-2">
                    {field.options.map((option, index) => (
                      <label key={index} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={field.name}
                          value={option}
                          checked={formValues[field.name] === option}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          required={field.required}
                          className="text-[#c4dfc4] focus:ring-[#c4dfc4]"
                        />
                        <span className="text-gray-300">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Checkboxes */}
                {field.type === "checkbox" && field.options && (
                  <div className="space-y-2">
                    {field.options.map((option, index) => (
                      <label key={index} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          value={option}
                          checked={(formValues[field.name] || []).includes(option)}
                          onChange={(e) => {
                            const currentValues = formValues[field.name] || [];
                            const newValues = e.target.checked
                              ? [...currentValues, option]
                              : currentValues.filter((v: string) => v !== option);
                            handleFieldChange(field.name, newValues);
                          }}
                          className="text-[#c4dfc4] focus:ring-[#c4dfc4] rounded"
                        />
                        <span className="text-gray-300">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Dropdown */}
                {field.type === "dropdown" && field.options && (
                  <select
                    value={formValues[field.name] || ""}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    required={field.required}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c4dfc4]"
                  >
                    <option value="">Select an option...</option>
                    {field.options.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}

                {/* Thumbs Up/Down */}
                {field.type === "thumbs" && (
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => handleFieldChange(field.name, "up")}
                      className={`flex-1 py-3 rounded-lg border transition-colors ${formValues[field.name] === "up"
                        ? "bg-[#c4dfc4]/20 border-[#c4dfc4] text-[#c4dfc4]"
                        : "bg-white/5 border-white/10 text-gray-400 hover:border-[#c4dfc4]/50"
                        }`}
                    >
                      👍 Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFieldChange(field.name, "down")}
                      className={`flex-1 py-3 rounded-lg border transition-colors ${formValues[field.name] === "down"
                        ? "bg-red-500/20 border-red-500 text-red-400"
                        : "bg-white/5 border-white/10 text-gray-400 hover:border-red-500/50"
                        }`}
                    >
                      👎 No
                    </button>
                  </div>
                )}

                {/* Signature */}
                {field.type === "signature" && (
                  <SignaturePadWidget
                    field={{
                      id: field.id,
                      name: field.name,
                      label: field.label,
                      required: field.required,
                      signatureMeaning: (field as any).signatureMeaning || 'Completed by',
                      requireCertification: (field as any).requireCertification !== false,
                      certificationText: (field as any).certificationText || 'I certify that my electronic signature is the legally binding equivalent of my handwritten signature.',
                      signatureSettings: (field as any).signatureSettings || {
                        penColor: '#000000',
                        backgroundColor: '#ffffff',
                        requirePassword: true
                      }
                    }}
                    value={formValues[field.name]}
                    onChange={(value) => handleFieldChange(field.name, value)}
                    disabled={submitting || submitted}
                  />
                )}
              </div>
            ))}

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a] font-semibold py-4 md:py-6 text-base md:text-lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* AI Analysis Feed - Below Form */}
        {analysisFeed.length > 0 && (
          <Card className="bg-[#1a1a1a] border-white/10 p-4 md:p-6 mt-4 md:mt-6">
            <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4 flex items-center gap-2">
              <span className="text-purple-400">✨</span>
              AI Analysis Feed
            </h3>
            <ScrollArea className="h-64 md:h-96 pr-2 md:pr-4">
              <div className="space-y-3">
                {analysisFeed.map((entry, idx) => {
                  const getQuestionLabel = (fieldId: string) => {
                    return form?.schema.fields.find(f => f.id === fieldId)?.label || fieldId;
                  };

                  return (
                    <div key={idx} className="p-4 bg-[#0a0a0a] border border-white/10 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-400">
                          Snapshot #{entry.snapshotNumber}
                        </span>
                        <span className="text-xs text-gray-500">{entry.timestamp}</span>
                      </div>

                      {Object.keys(entry.answers).length > 0 ? (
                        <div className="space-y-2">
                          {Object.entries(entry.answers).map(([fieldId, answer]: [string, any]) => (
                            <div key={fieldId} className="text-sm">
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-gray-400 flex-1">
                                  {getQuestionLabel(fieldId)}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${entry.confidence?.[fieldId] >= 90
                                    ? 'text-green-400 border-green-400/30'
                                    : entry.confidence?.[fieldId] >= 80
                                      ? 'text-yellow-400 border-yellow-400/30'
                                      : 'text-gray-400 border-gray-400/30'
                                    }`}
                                >
                                  {entry.confidence?.[fieldId]}% confident
                                </Badge>
                              </div>
                              <div className="text-white font-medium mt-1">
                                → {String(answer)}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">
                          No confident answers in this snapshot
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </Card>
        )}
      </div>
    </div>
  );
}


