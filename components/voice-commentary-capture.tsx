"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, X, MicOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface VoiceCommentaryCaptureProps {
  formSchema: { fields: any[] };
  currentValues: Record<string, any>;
  onFieldUpdate: (fieldId: string, value: any) => void;
  onCommentaryCapture?: (commentary: string) => void;
}

export function VoiceCommentaryCapture({
  formSchema,
  currentValues,
  onFieldUpdate,
  onCommentaryCapture
}: VoiceCommentaryCaptureProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [formAnswers, setFormAnswers] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      setFormAnswers([]);
      setAdditionalNotes([]);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
          // Process this chunk
          processTranscriptionChunk(transcript);
        } else {
          interimTranscript += transcript;
        }
      }

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

  const stopRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(false);
      recognitionRef.current.stop();
      recognitionRef.current = null;
      
      // Send final commentary
      if (onCommentaryCapture && transcription) {
        onCommentaryCapture(transcription);
      }
    }
  };

  const processTranscriptionChunk = async (chunk: string) => {
    // Debounce processing
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }

    processingTimeoutRef.current = setTimeout(async () => {
      setIsProcessing(true);
      
      try {
        // Send to AI parser
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
          const { field_updates, unstructured_notes } = await response.json();
          
          // Update form fields
          if (field_updates && Object.keys(field_updates).length > 0) {
            Object.entries(field_updates).forEach(([fieldId, value]) => {
              onFieldUpdate(fieldId, value);
              
              // Add to form answers display
              const field = formSchema.fields.find(f => f.id === fieldId || f.name === fieldId);
              if (field) {
                setFormAnswers(prev => [...prev, `${field.label}: ${value}`]);
              }
            });
          }
          
          // Add unstructured notes
          if (unstructured_notes && unstructured_notes.length > 0) {
            setAdditionalNotes(prev => [...prev, ...unstructured_notes]);
          }
        }
      } catch (error) {
        console.error('Error processing transcription:', error);
      } finally {
        setIsProcessing(false);
      }
    }, 1500); // Wait 1.5s after last speech before processing
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
      <Card className="bg-gradient-to-r from-[#c4dfc4]/10 to-[#c8e0f5]/10 border-[#c4dfc4]/30 p-4">
        {/* Header with recording indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/30">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm text-red-600 dark:text-red-400 font-medium">Recording</span>
            </div>
            <Badge variant="outline" className="text-sm font-mono">
              {formatTime(timeElapsed)}
            </Badge>
            {isProcessing && (
              <span className="text-xs text-[#c4dfc4] flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-[#c4dfc4] rounded-full animate-pulse" />
                Processing...
              </span>
            )}
          </div>
          <Button
            onClick={stopRecording}
            size="sm"
            className="bg-red-500/80 hover:bg-red-500 border border-red-400/30"
          >
            <MicOff className="w-4 h-4 mr-2" />
            Stop Recording
          </Button>
        </div>

        {/* Live Transcription */}
        <div className="mb-4 p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-white/20">
          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
            Live Transcription
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 min-h-[40px]">
            {transcription || 'Listening...'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Form Answers */}
          <div className="p-3 bg-green-50/50 dark:bg-green-900/10 rounded-lg border border-green-200/30">
            <h3 className="text-xs font-medium text-green-700 dark:text-green-400 uppercase mb-2 flex items-center gap-2">
              ✓ Form Answers
              <Badge variant="outline" className="text-xs">
                {formAnswers.length}
              </Badge>
            </h3>
            <div className="space-y-1 max-h-[120px] overflow-y-auto">
              {formAnswers.length > 0 ? (
                formAnswers.map((answer, idx) => (
                  <p key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                    • {answer}
                  </p>
                ))
              ) : (
                <p className="text-xs text-gray-500 italic">
                  Waiting for answers...
                </p>
              )}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-200/30">
            <h3 className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase mb-2 flex items-center gap-2">
              📝 Additional Notes
              <Badge variant="outline" className="text-xs">
                {additionalNotes.length}
              </Badge>
            </h3>
            <div className="space-y-1 max-h-[120px] overflow-y-auto">
              {additionalNotes.length > 0 ? (
                additionalNotes.map((note, idx) => (
                  <p key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                    • {note}
                  </p>
                ))
              ) : (
                <p className="text-xs text-gray-500 italic">
                  Waiting for observations...
                </p>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center italic">
          AI is listening and separating form answers from observations
        </p>
      </Card>
    </div>
  );
}

