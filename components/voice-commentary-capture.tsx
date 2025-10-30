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
}

export function VoiceCommentaryCapture({
  formSchema,
  currentValues,
  onFieldUpdate,
  onCommentaryCapture,
  onAutoSubmit
}: VoiceCommentaryCaptureProps) {
  const [countdown, setCountdown] = useState<number | null>(3);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [answeredFields, setAnsweredFields] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown effect: 3-2-1-GO then start recording
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
          
          // Update form fields AND track which ones are answered
          if (field_updates && Object.keys(field_updates).length > 0) {
            Object.entries(field_updates).forEach(([fieldId, value]) => {
              onFieldUpdate(fieldId, value);
              setAnsweredFields(prev => new Set(prev).add(fieldId));
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
            setAnsweredFields(prev => new Set(prev).add(fieldId));
          });
        }
        
        // Check for missing required fields
        const requiredFields = formSchema.fields.filter(f => f.required);
        const missingFields = requiredFields.filter(f => 
          !answeredFields.has(f.id) && !answeredFields.has(f.name) && !currentValues[f.id || f.name]
        );
        
        if (missingFields.length > 0) {
          // Show which questions need answers
          toast.warning(`⚠️ ${missingFields.length} required question${missingFields.length !== 1 ? 's' : ''} unanswered`, {
            description: missingFields.map(f => f.label).join(', '),
            duration: 5000
          });
          setIsProcessing(false);
          return; // Don't auto-submit, let user answer manually
        }
        
        // Save commentary
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

  const totalFields = formSchema.fields.length;
  const answeredCount = answeredFields.size;
  const progressPercent = totalFields > 0 ? (answeredCount / totalFields) * 100 : 0;

  // Countdown overlay (3-2-1)
  if (countdown !== null) {
    return (
      <div className="w-full mb-6">
        <Card className="bg-gradient-to-r from-[#c4dfc4]/10 to-[#c8e0f5]/10 border-[#c4dfc4]/30 p-12">
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <div className="text-8xl font-bold text-[#c4dfc4] mb-4 animate-pulse">
              {countdown > 0 ? countdown : 'GO!'}
            </div>
            <p className="text-gray-500 text-lg">
              Get ready to start speaking...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Recording active view with progress tracking
  return (
    <div className="w-full mb-6">
      <Card className="bg-gradient-to-r from-[#c4dfc4]/10 to-[#c8e0f5]/10 border-[#c4dfc4]/30 p-6">
        {/* Header with recording indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-lg border border-red-500/30">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm text-red-600 dark:text-red-400 font-medium">Recording</span>
            </div>
            <Badge variant="outline" className="text-base font-mono px-3 py-1">
              {formatTime(timeElapsed)}
            </Badge>
          </div>
          <Button
            onClick={stopRecordingAndSubmit}
            size="lg"
            disabled={isProcessing}
            className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a] font-medium"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Submit
              </>
            )}
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Questions Answered
            </span>
            <span className="text-sm font-medium text-[#c4dfc4]">
              {answeredCount} / {totalFields}
            </span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </div>

        {/* Audio Waveform */}
        <div className="p-6 bg-white/50 dark:bg-black/20 rounded-lg border border-white/20 mb-6">
          <AudioWaveform isRecording={isRecording} size="md" />
        </div>

        {/* Question Checklist */}
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {formSchema.fields.map((field, idx) => {
            const isAnswered = answeredFields.has(field.id) || answeredFields.has(field.name);
            return (
              <div
                key={field.id || field.name || idx}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  isAnswered
                    ? 'bg-green-50/50 dark:bg-green-900/10 border border-green-200/30'
                    : 'bg-gray-50/30 dark:bg-gray-800/10 border border-gray-200/20'
                }`}
              >
                <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                  isAnswered ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}>
                  {isAnswered && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <span className={`text-sm ${
                  isAnswered
                    ? 'text-gray-700 dark:text-gray-200 font-medium'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
          <Mic className="w-4 h-4" />
          <span>Speak naturally - questions fill automatically as you answer them</span>
        </div>
      </Card>
    </div>
  );
}

