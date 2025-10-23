"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertCircle, Check } from "lucide-react";
import { AIVisionAssistant } from "@/components/ai-vision-assistant";

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
}

export default function PublicFormPage() {
  const params = useParams();
  const formId = params.id as string;

  // Check if this is a preview
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const isPreview = searchParams.get('preview') === 'true';

  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [aiMetadata, setAiMetadata] = useState<Record<string, any>>({});
  const [analysisFeed, setAnalysisFeed] = useState<any[]>([]);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  useEffect(() => {
    loadForm();
  }, [formId]);

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
      
      // Start redirect countdown if configured
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#c4dfc4] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <Card className="bg-[#1a1a1a] border-red-500/30 p-8 max-w-md text-center">
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <Card className="bg-[#1a1a1a] border-[#c4dfc4]/30 p-8 max-w-2xl">
          <div className="text-center space-y-6">
            {/* Success Icon */}
            <CheckCircle2 className="w-16 h-16 text-[#c4dfc4] mx-auto" />
            
            {/* Custom Message */}
            <p className="text-xl font-medium text-white whitespace-pre-wrap">
              {thankYouSettings.message}
            </p>

            {/* Response Summary */}
            {thankYouSettings.showResponseSummary && Object.keys(formValues).length > 0 && (
              <div className="mt-6 p-4 rounded-lg bg-[#0a0a0a] border border-border/30 text-left">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Your Response:</h3>
                <div className="space-y-2">
                  {Object.entries(formValues).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="text-gray-500">{key}:</span>{' '}
                      <span className="text-gray-300">
                        {Array.isArray(value) ? value.join(', ') : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
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
                    alert('Form link copied to clipboard!');
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
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Preview Banner */}
        {isPreview && (
          <div className="mb-4 p-4 bg-[#c4dfc4]/10 border-2 border-[#c4dfc4]/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Badge className="bg-[#c4dfc4] text-[#0a0a0a]">Preview Mode</Badge>
              <p className="text-sm text-gray-300">
                Submissions in preview mode will not be counted in your analytics.
              </p>
            </div>
          </div>
        )}
        
        <Card className="bg-[#1a1a1a] border-white/10 p-8">
          {/* Form Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{form?.title}</h1>
            {form?.description && (
              <p className="text-gray-400">{form.description}</p>
            )}
          </div>

          {/* AI Vision Assistant */}
          {form && (
            <AIVisionAssistant
              formSchema={form.schema}
              currentValues={formValues}
              onFieldSuggestion={handleAISuggestion}
              onAnalysisComplete={handleAnalysisComplete}
            />
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
                      className={`flex-1 py-3 rounded-lg border transition-colors ${
                        formValues[field.name] === "up"
                          ? "bg-[#c4dfc4]/20 border-[#c4dfc4] text-[#c4dfc4]"
                          : "bg-white/5 border-white/10 text-gray-400 hover:border-[#c4dfc4]/50"
                      }`}
                    >
                      👍 Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFieldChange(field.name, "down")}
                      className={`flex-1 py-3 rounded-lg border transition-colors ${
                        formValues[field.name] === "down"
                          ? "bg-red-500/20 border-red-500 text-red-400"
                          : "bg-white/5 border-white/10 text-gray-400 hover:border-red-500/50"
                      }`}
                    >
                      👎 No
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a] font-semibold py-6 text-lg"
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
          <Card className="bg-[#1a1a1a] border-white/10 p-6 mt-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-purple-400">✨</span>
              AI Analysis Feed
            </h3>
            <ScrollArea className="h-96 pr-4">
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
                                  className={`text-xs ${
                                    entry.confidence?.[fieldId] >= 90 
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


