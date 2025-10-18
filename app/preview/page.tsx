"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useVideoRecording } from "@/hooks/use-video-recording";
import {
  Type,
  AlignLeft,
  Mail,
  Phone,
  Calendar,
  Image as ImageIcon,
  List,
  CheckSquare,
  Hash,
  Upload,
  Circle,
  ThumbsUp,
  Layers,
  Video,
  VideoOff,
  Sparkles,
  Loader2,
} from "lucide-react";

interface FormField {
  id: string;
  type: string;
  name: string;
  label: string;
  placeholder: string;
  required: boolean;
  color: string;
  icon: any;
  description?: string;
  options?: string[];
  multiSelect?: boolean;
  dateRange?: boolean;
}

interface FormData {
  name: string;
  description: string;
  fields: FormField[];
  submitButtonText: string;
}

export default function PreviewPage() {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [aiAnswers, setAiAnswers] = useState<Record<string, any>>({});
  const [snapshotCount, setSnapshotCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    isRecording,
    isCameraOn,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    captureSnapshot,
    startRecording,
    stopRecording,
  } = useVideoRecording();

  useEffect(() => {
    // Load form data from localStorage
    const savedForm = localStorage.getItem("formPreviewData");
    if (savedForm) {
      setFormData(JSON.parse(savedForm));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      stopCamera();
    };
  }, [stopCamera]);

  const handleStartCamera = async () => {
    const success = await startCamera();
    if (!success) {
      alert('Failed to start camera. Please check permissions.');
    }
  };

  const handleStartRecording = async () => {
    if (!isCameraOn) {
      await handleStartCamera();
    }
    
    startRecording();
    setSnapshotCount(0);
    setAnsweredCount(0);
    
    // Start capturing snapshots every 4 seconds
    const interval = setInterval(async () => {
      const snapshot = captureSnapshot();
      
      if (!snapshot || !formData) {
        console.warn('Cannot capture snapshot or no form data');
        return;
      }

      setIsAnalyzing(true);
      setSnapshotCount(prev => prev + 1);

      try {
        // Prepare questions for AI analysis
        const questions = formData.fields
          .filter(f => f.type !== 'group') // Skip group headers
          .map(f => ({
            id: f.id,
            label: f.label,
            type: f.type,
            options: f.options
          }));

        // Send to AI for analysis
        const response = await fetch('/api/analyze-video-form', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: snapshot,
            questions
          })
        });

        if (!response.ok) {
          console.error('AI analysis failed:', response.statusText);
          return;
        }

        const { answers, answeredQuestions } = await response.json();

        // Update AI answers
        setAiAnswers(prev => ({ ...prev, ...answers }));
        setAnsweredCount(answeredQuestions || Object.keys(answers).length);

        console.log(`[Video AI] Snapshot ${snapshotCount + 1}: ${Object.keys(answers).length} answers`);
      } catch (error) {
        console.error('Error analyzing snapshot:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }, 4000); // 4 seconds

    recordingIntervalRef.current = interval;
  };

  const handleStopRecording = () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    stopRecording();
    stopCamera();
    setIsAnalyzing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Merge manual inputs with AI answers
    const finalValues = { ...aiAnswers, ...formValues };
    console.log("Form submitted:", finalValues);
    alert("Form submitted! Check console for values.");
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#000000] to-[#0a0a0a]">
        <p className="text-gray-400">Loading form preview...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000000] to-[#0a0a0a] py-12">
      <div className="max-w-3xl mx-auto">
        {/* Video AI Controls */}
        <Card className="mb-6 p-6 bg-[#1a1a1a] border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                AI Video Form Filler
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Point camera at inspection area to auto-fill answers
              </p>
            </div>
            <div className="flex gap-2">
              {!isCameraOn && (
                <Button
                  onClick={handleStartCamera}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Start Camera
                </Button>
              )}
              {isCameraOn && !isRecording && (
                <Button
                  onClick={handleStartRecording}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Start Recording
                </Button>
              )}
              {isRecording && (
                <Button
                  onClick={handleStopRecording}
                  size="sm"
                  variant="destructive"
                >
                  <VideoOff className="h-4 w-4 mr-2" />
                  Stop Recording
                </Button>
              )}
            </div>
          </div>

          {/* Camera Feed */}
          {isCameraOn && (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {isRecording && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-full">
                    <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    <span className="text-sm font-medium">Recording</span>
                  </div>
                )}
              </div>

              {/* Recording Stats */}
              {isRecording && (
                <div className="flex gap-4">
                  <Badge variant="outline" className="text-white border-white/20">
                    <Video className="h-3 w-3 mr-1" />
                    Snapshots: {snapshotCount}
                  </Badge>
                  <Badge variant="outline" className="text-green-400 border-green-400/20">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Answered: {answeredCount} / {formData?.fields.filter(f => f.type !== 'group').length || 0}
                  </Badge>
                  {isAnalyzing && (
                    <Badge variant="outline" className="text-blue-400 border-blue-400/20">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Analyzing...
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Hidden canvas for snapshot capture */}
          <canvas ref={canvasRef} className="hidden" />
        </Card>

        {/* Form Card */}
        <Card className="p-12 bg-[#1a1a1a] border-border/50 shadow-xl">
        {/* Form Header */}
        <div className="mb-10 pb-8 border-b border-border/50 bg-gradient-to-br from-[#1a1a1a] to-[#151515] -mx-12 -mt-12 px-12 pt-12 rounded-t-lg">
          <h1 className="text-4xl font-bold text-gray-100 mb-3">
            {formData.name}
          </h1>
          {formData.description && (
            <p className="text-lg text-muted-foreground">
              {formData.description}
            </p>
          )}
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {formData.fields.map((field) => {
            // Skip group headers in basic preview for now, or render them differently
            if (field.type === "group") {
              return (
                <div
                  key={field.id}
                  className="py-4 px-4 rounded-lg border-l-4 mb-6 mt-8"
                  style={{ 
                    borderLeftColor: field.color,
                    backgroundColor: `${field.color}40`
                  }}
                >
                  <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                    <Layers className="h-6 w-6" style={{ color: field.color }} />
                    {field.label.toUpperCase()}
                  </h2>
                  {field.description && (
                    <p className="text-sm text-white/80 mt-1">{field.description}</p>
                  )}
                </div>
              );
            }

            const hasAiAnswer = aiAnswers[field.id] !== undefined;
            const displayValue = formValues[field.id] !== undefined ? formValues[field.id] : aiAnswers[field.id];

            return (
              <div key={field.id} className="space-y-2">
                <label className="flex items-center gap-2 text-base font-medium text-gray-100">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                  {hasAiAnswer && (
                    <Badge variant="outline" className="text-xs text-blue-400 border-blue-400/30 bg-blue-400/10">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Filled
                    </Badge>
                  )}
                </label>
                {field.description && (
                  <p className="text-sm text-muted-foreground mb-2">{field.description}</p>
                )}
                
                {/* Render different input types */}
                {field.type === "textarea" ? (
                  <textarea
                    placeholder={field.placeholder}
                    required={field.required}
                    value={displayValue || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className={`w-full min-h-[120px] rounded-lg border border-border px-4 py-3 text-base text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#c4dfc4]/50 focus:border-transparent ${
                      hasAiAnswer && !formValues[field.id] ? 'bg-blue-950/30 border-blue-400/30' : 'bg-background'
                    }`}
                  />
                ) : field.type === "dropdown" ? (
                  <select
                    required={field.required}
                    value={displayValue || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className={`w-full rounded-lg border border-border px-4 py-3 text-base text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#c4dfc4]/50 focus:border-transparent ${
                      hasAiAnswer && !formValues[field.id] ? 'bg-blue-950/30 border-blue-400/30' : 'bg-background'
                    }`}
                  >
                    <option value="">Select an option...</option>
                    {field.options?.map((option, idx) => (
                      <option key={idx} value={option}>{option}</option>
                    ))}
                  </select>
                ) : field.type === "checkbox" ? (
                  <div className="space-y-2">
                    {field.options?.map((option, idx) => (
                      <label key={idx} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type={field.multiSelect ? "checkbox" : "radio"}
                          name={field.id}
                          value={option}
                          onChange={(e) => {
                            if (field.multiSelect) {
                              const current = formValues[field.id] || [];
                              if (e.target.checked) {
                                handleInputChange(field.id, [...current, option]);
                              } else {
                                handleInputChange(field.id, current.filter((v: string) => v !== option));
                              }
                            } else {
                              handleInputChange(field.id, option);
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-[#c4dfc4] focus:ring-[#c4dfc4]"
                        />
                        <span className="text-base text-gray-100">{option}</span>
                      </label>
                    ))}
                  </div>
                ) : field.type === "radio" ? (
                  <div className={`space-y-2 ${hasAiAnswer && !formValues[field.id] ? 'p-3 rounded-lg bg-blue-950/20 border border-blue-400/30' : ''}`}>
                    {field.options?.map((option, idx) => (
                      <label key={idx} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={field.id}
                          value={option}
                          checked={displayValue === option}
                          required={field.required}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className="h-4 w-4 border-gray-300 text-[#c4dfc4] focus:ring-[#c4dfc4]"
                        />
                        <span className="text-base text-gray-100">{option}</span>
                      </label>
                    ))}
                  </div>
                ) : field.type === "thumbs" ? (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={field.id}
                        value="thumbs-up"
                        required={field.required}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className="h-4 w-4 border-gray-300 text-[#c4dfc4] focus:ring-[#c4dfc4]"
                      />
                      <span className="text-base text-gray-100">👍 Thumbs Up</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={field.id}
                        value="thumbs-down"
                        required={field.required}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className="h-4 w-4 border-gray-300 text-[#c4dfc4] focus:ring-[#c4dfc4]"
                      />
                      <span className="text-base text-gray-100">👎 Thumbs Down</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={field.id}
                        value="na"
                        required={field.required}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className="h-4 w-4 border-gray-300 text-[#c4dfc4] focus:ring-[#c4dfc4]"
                      />
                      <span className="text-base text-muted-foreground">N/A</span>
                    </label>
                  </div>
                ) : field.type === "date" ? (
                  <div className="flex gap-3">
                    <Input
                      type="date"
                      required={field.required}
                      onChange={(e) => handleInputChange(field.id + "_start", e.target.value)}
                      className="flex-1 px-4 py-3 text-base bg-background text-gray-100 border-border"
                    />
                    {field.dateRange && (
                      <>
                        <span className="self-center text-muted-foreground">to</span>
                        <Input
                          type="date"
                          required={field.required}
                          onChange={(e) => handleInputChange(field.id + "_end", e.target.value)}
                          className="flex-1 px-4 py-3 text-base bg-background text-gray-100 border-border"
                        />
                      </>
                    )}
                  </div>
                ) : field.type === "file" || field.type === "image" ? (
                  <Input
                    type="file"
                    accept={field.type === "image" ? "image/*" : undefined}
                    required={field.required}
                    onChange={(e) => handleInputChange(field.id, e.target.files?.[0])}
                    className="px-4 py-3 text-base bg-background text-gray-100 border-border"
                  />
                ) : (
                  <Input
                    type={field.type === "email" ? "email" : field.type === "number" ? "number" : field.type === "phone" ? "tel" : "text"}
                    placeholder={field.placeholder}
                    required={field.required}
                    value={displayValue || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className={`px-4 py-3 text-base text-gray-100 placeholder:text-gray-500 border-border ${
                      hasAiAnswer && !formValues[field.id] ? 'bg-blue-950/30 border-blue-400/30' : 'bg-background'
                    }`}
                  />
                )}
              </div>
            );
          })}

          {/* Submit Button */}
          <div className="pt-6">
            <Button
              type="submit"
              className="w-full bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a] font-semibold py-4 text-lg rounded-lg transition-colors"
            >
              {formData.submitButtonText}
            </Button>
          </div>
        </form>
      </Card>
      </div>
    </div>
  );
}

