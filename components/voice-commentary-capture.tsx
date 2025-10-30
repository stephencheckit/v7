"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AudioWaveform } from '@/components/ui/audio-waveform';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface VoiceCommentaryCaptureProps {
  formSchema: { fields: any[] };
  currentValues: Record<string, any>;
  onFieldUpdate: (fieldId: string, value: any) => void;
  onCommentaryCapture?: (commentary: string) => void;
  onAutoSubmit?: () => void;
  onProgressUpdate?: (fieldId: string, progress: number) => void;
  onValidationError?: (missingFieldIds: string[]) => void;
  onCancel?: () => void;
}

interface FieldProgress {
  fieldId: string;
  label: string;
  progress: number; // 0-100
  isAnswered: boolean;
}

export function VoiceCommentaryCapture({
  formSchema,
  currentValues,
  onFieldUpdate,
  onCommentaryCapture,
  onAutoSubmit,
  onProgressUpdate,
  onValidationError,
  onCancel
}: VoiceCommentaryCaptureProps) {
  const [countdown, setCountdown] = useState<number | null>(3);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [fieldProgress, setFieldProgress] = useState<Map<string, number>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-start countdown on mount
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      // Countdown finished, start recording
      setTimeout(() => {
        setCountdown(null);
        startRecording();
      }, 500);
    }
  }, [countdown]);

  // Timer: counts up from 0 while recording
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setTimeElapsed(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  // Cleanup on unmount - ensure all audio stops
  useEffect(() => {
    return () => {
      // Stop speech recognition if active
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }

      // Clear any pending timeouts
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onstart = () => {
      console.log('🎤 Voice recording started');
      setIsRecording(true);
      setTranscription('');
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
          // Process this chunk in real-time for progress updates
          processTranscriptionChunk(transcript);
        } else {
          interimTranscript += transcript;
        }
      }

      // Update full transcription (but don't display it)
      setTranscription(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        console.log('No speech detected, continuing...');
      } else {
        setIsRecording(false);
      }
    };

    recognition.onend = () => {
      console.log('🎤 Voice recording ended');
      if (isRecording) {
        // Auto-restart if still in recording mode
        recognition.start();
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const processTranscriptionChunk = async (chunk: string) => {
    // Debounce processing for real-time updates
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }

    processingTimeoutRef.current = setTimeout(async () => {
      try {
        // Send chunk to AI for quick matching (just for progress updates)
        const response = await fetch('/api/ai/voice-to-form', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcription: chunk,
            formSchema,
            currentValues
          })
        });

        if (response.ok) {
          const { field_updates } = await response.json();

          // Update form fields AND track progress
          if (field_updates && Object.keys(field_updates).length > 0) {
            Object.entries(field_updates).forEach(([fieldId, value]) => {
              onFieldUpdate(fieldId, value);
              // Mark as 100% complete
              setFieldProgress(prev => new Map(prev).set(fieldId, 100));
              if (onProgressUpdate) {
                onProgressUpdate(fieldId, 100);
              }
            });
          }
        }
      } catch (error) {
        console.error('[Voice] Error processing chunk:', error);
      }
    }, 800);
  };

  const stopRecordingAndSubmit = async () => {
    if (recognitionRef.current) {
      setIsRecording(false);
      recognitionRef.current.stop();
      recognitionRef.current = null;

      if (!transcription || transcription.trim().length === 0) {
        toast.error('No voice input detected', {
          description: 'Please try recording again'
        });
        return;
      }

      // Process entire transcript for final cleanup
      setIsProcessing(true);

      try {
        console.log('[Voice] Final processing of full transcript');

        // Send ENTIRE transcript for final holistic analysis + cleanup
        const response = await fetch('/api/ai/voice-to-form', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcription,
            formSchema,
            currentValues
          })
        });

        if (!response.ok) {
          throw new Error('Failed to process transcript');
        }

        const { field_updates } = await response.json();

        // Apply any additional updates from final pass
        if (field_updates && Object.keys(field_updates).length > 0) {
          Object.entries(field_updates).forEach(([fieldId, value]) => {
            onFieldUpdate(fieldId, value);
            setFieldProgress(prev => new Map(prev).set(fieldId, 100));
            if (onProgressUpdate) {
              onProgressUpdate(fieldId, 100);
            }
          });
        }

        // Check for missing required fields
        const requiredFields = formSchema.fields.filter(f => f.required);
        const missingFields = requiredFields.filter(f => {
          const fieldKey = f.id || f.name;
          return !fieldProgress.has(fieldKey) && !currentValues[fieldKey];
        });

        if (missingFields.length > 0) {
          // Notify parent of missing fields for highlighting
          const missingFieldIds = missingFields.map(f => f.id || f.name);
          if (onValidationError) {
            onValidationError(missingFieldIds);
          }

          // Show which questions need answers
          toast.error(`⚠️ ${missingFields.length} required question${missingFields.length !== 1 ? 's' : ''} unanswered`, {
            description: missingFields.map(f => f.label).join(', '),
            duration: 5000
          });
          setIsProcessing(false);
          return; // Don't auto-submit, let user answer manually
        }

        // Save commentary for reverse engineering (will be saved AFTER form submit by parent)
        if (onCommentaryCapture) {
          onCommentaryCapture(transcription);
        }

        // All required fields answered - auto-submit!
        toast.success(`✓ All questions answered!`, {
          description: 'Submitting form...'
        });

        setTimeout(() => {
          if (onAutoSubmit) {
            onAutoSubmit();
          }
        }, 1500);

      } catch (error) {
        console.error('[Voice] Error processing transcript:', error);
        toast.error('Failed to process voice input', {
          description: 'Please try again or fill manually'
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCancel = () => {
    // Stop speech recognition immediately
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    // Stop any pending processing
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }

    // Reset all state
    setIsRecording(false);
    setTranscription('');
    setFieldProgress(new Map());
    setCountdown(null); // Clear countdown to ensure clean unmount

    // Tell parent to go back to AI assist selection (this will unmount the component)
    if (onCancel) {
      onCancel();
    }
  };

  // Countdown display
  if (countdown !== null) {
    return (
      <div className="w-full mb-4">
        <Card className="bg-gradient-to-r from-[#c4dfc4]/10 to-[#c8e0f5]/10 border-[#c4dfc4]/30 p-8">
          <div className="flex flex-col items-center justify-center">
            <div className="text-6xl font-bold text-[#c4dfc4] mb-2 animate-pulse">
              {countdown > 0 ? countdown : 'GO!'}
            </div>
            <p className="text-gray-500 text-sm">
              Get ready to speak...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Compact recording bar with vertical progress bars
  if (isRecording) {
    return (
      <div className="w-full mb-4">
        <Card className="bg-gradient-to-r from-[#c4dfc4]/10 to-[#c8e0f5]/10 border-[#c4dfc4]/30 p-3">
          {/* Top row: audio controls */}
          <div className="flex items-center gap-3 mb-3">
            {/* Recording indicator */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                {formatTime(timeElapsed)}
              </span>
            </div>

            {/* Compact Waveform */}
            <div className="flex-1">
              <AudioWaveform isRecording={isRecording} size="sm" />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={handleCancel}
                size="sm"
                variant="ghost"
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={stopRecordingAndSubmit}
                size="sm"
                disabled={isProcessing}
                className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Processing
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Submit
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Bottom row: horizontal progress bars side by side */}
          <div className="flex gap-2">
            {formSchema.fields.map((field, idx) => {
              const fieldKey = field.id || field.name;
              const progress = fieldProgress.get(fieldKey) || 0;
              const isAnswered = progress >= 100;

              return (
                <div key={fieldKey} className="flex-1">
                  {/* Horizontal progress bar - thin height, equal width */}
                  <div className="w-full h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden relative">
                    <div
                      className={`absolute left-0 h-full transition-all duration-300 ${isAnswered ? 'bg-green-500' : 'bg-[#c4dfc4]'
                        }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  }

  // Not recording - return null (parent component shows the form normally)
  return null;
}

