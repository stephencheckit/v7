"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, CheckCircle2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer: counts up from 0
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
        } else {
          interimTranscript += transcript;
        }
      }

      // Just update the display - NO incremental processing
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

      // Process entire transcript holistically
      setIsProcessing(true);
      toast.info('Processing your answers...', {
        description: 'Analyzing entire transcript'
      });
      
      try {
        console.log('[Voice] Processing full transcript:', transcription);
        
        // Send ENTIRE transcript to AI for holistic analysis
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

        const { field_updates, unstructured_notes } = await response.json();
        
        console.log('[Voice] ✅ AI Results:', { field_updates, unstructured_notes });
        
        // Fill ALL fields at once
        if (field_updates && Object.keys(field_updates).length > 0) {
          let filledCount = 0;
          Object.entries(field_updates).forEach(([fieldId, value]) => {
            onFieldUpdate(fieldId, value);
            filledCount++;
          });
          
          toast.success(`Filled ${filledCount} field${filledCount !== 1 ? 's' : ''}!`, {
            description: 'Review answers below'
          });
        } else {
          toast.warning('No answers detected', {
            description: 'Try speaking more clearly about the form questions'
          });
        }
        
        // Save commentary
        if (onCommentaryCapture) {
          onCommentaryCapture(transcription);
        }
        
        // Auto-submit after a brief delay to let user see filled fields
        setTimeout(() => {
          if (onAutoSubmit) {
            toast.success('Auto-submitting form...');
            onAutoSubmit();
          }
        }, 2000);
        
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

  if (!isRecording) {
    return (
      <div className="w-full">
        <Button
          onClick={startRecording}
          className="w-full bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a] h-12"
        >
          <Mic className="w-4 h-4 mr-2" />
          Start Voice Recording
        </Button>
      </div>
    );
  }

  // Recording active view
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
                Stop & Submit
              </>
            )}
          </Button>
        </div>

        {/* Live Transcription */}
        <div className="p-4 bg-white/50 dark:bg-black/20 rounded-lg border border-white/20 min-h-[150px]">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            📝 Live Transcription
          </h3>
          <p className="text-base text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
            {transcription || 'Listening... Start speaking your answers.'}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
          <Mic className="w-4 h-4" />
          <span>Speak naturally - AI will match your answers to questions when you stop</span>
        </div>
      </Card>
    </div>
  );
}

