"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, Loader2, Check } from 'lucide-react';
import { useVideoRecording } from '@/hooks/use-video-recording';

interface AIVisionAssistantProps {
  formSchema: { fields: any[] };
  currentValues: Record<string, any>;
  onFieldSuggestion: (fieldId: string, value: any, confidence: number, reasoning: string) => void;
  onAnalysisComplete?: (snapshot: number, answers: any, confidence: any) => void;
}

export function AIVisionAssistant({ 
  formSchema, 
  currentValues, 
  onFieldSuggestion,
  onAnalysisComplete 
}: AIVisionAssistantProps) {
  const [isActive, setIsActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [snapshotCount, setSnapshotCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const snapshotCountRef = useRef(0); // Use ref to avoid dependency issues
  
  const {
    isCameraOn,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    captureSnapshot,
  } = useVideoRecording();

  // Timer: counts up from 0
  useEffect(() => {
    if (isActive) {
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
  }, [isActive]);

  // Snapshot capture loop (every 3 seconds)
  useEffect(() => {
    if (isActive && isCameraOn) {
      const captureAndAnalyze = async () => {
        const snapshot = captureSnapshot();
        if (!snapshot) return;

        // Increment using ref to avoid dependency issues
        snapshotCountRef.current += 1;
        setSnapshotCount(snapshotCountRef.current);
        await analyzeSnapshot(snapshot, snapshotCountRef.current);
      };

      // Capture immediately, then every 3 seconds
      captureAndAnalyze();
      intervalRef.current = setInterval(captureAndAnalyze, 3000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isCameraOn]);

  const analyzeSnapshot = async (imageBase64: string, currentSnapshotNumber: number) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai/vision-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageBase64,
          formSchema,
          currentValues
        })
      });

      if (!response.ok) {
        console.error('Vision analysis failed:', response.statusText);
        return;
      }

      const { suggestions } = await response.json();

      // Process suggestions
      const answers: any = {};
      const confidences: any = {};
      
      Object.entries(suggestions || {}).forEach(([fieldId, suggestion]: any) => {
        answers[fieldId] = suggestion.value;
        confidences[fieldId] = Math.round(suggestion.confidence * 100);
        
        if (suggestion.confidence >= 0.80) {
          onFieldSuggestion(
            fieldId,
            suggestion.value,
            suggestion.confidence,
            suggestion.reasoning
          );
        }
      });

      // Notify parent of analysis completion
      if (onAnalysisComplete) {
        onAnalysisComplete(currentSnapshotNumber, answers, confidences);
      }
    } catch (error) {
      console.error('Vision analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStart = async () => {
    const success = await startCamera();
    if (success) {
      setIsActive(true);
      setSnapshotCount(0);
      snapshotCountRef.current = 0; // Reset ref too
    }
  };

  const handleStop = () => {
    setIsActive(false);
    stopCamera();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeElapsed < 120) return 'text-green-400';
    if (timeElapsed < 150) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!isActive && !isCameraOn) {
    return (
      <div className="mb-6">
        <Button
          onClick={handleStart}
          className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a]"
        >
          <Camera className="w-4 h-4 mr-2" />
          Enable AI Vision Assistant
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Corner Video Overlay */}
      <div className="fixed bottom-4 right-4 z-50 w-64 rounded-lg overflow-hidden border-2 border-[#c4dfc4] bg-[#1a1a1a] shadow-2xl">
        {/* Video Feed */}
        <div className="relative h-48 bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Analyzing Overlay */}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#c4dfc4] animate-spin" />
            </div>
          )}

          {/* Recording Indicator */}
          <div className="absolute top-2 left-2 flex items-center gap-2 bg-black/70 px-2 py-1 rounded">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs text-white font-medium">Recording</span>
          </div>
        </div>

        {/* Controls */}
        <div className="p-3 bg-[#1a1a1a] border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-400">
              Snapshots: <span className="text-white font-medium">{snapshotCount}</span>
            </div>
            <div className={`text-sm font-mono font-bold ${getTimerColor()}`}>
              {formatTime(timeElapsed)}
            </div>
          </div>
          
          {timeElapsed >= 120 && (
            <div className="text-xs text-yellow-400 mb-2 text-center">
              Tip: Consider wrapping up
            </div>
          )}

          <Button
            onClick={handleStop}
            size="sm"
            variant="outline"
            className="w-full hover:bg-white/5"
          >
            <X className="w-4 h-4 mr-2" />
            Stop AI Assistant
          </Button>
        </div>
      </div>
    </>
  );
}


