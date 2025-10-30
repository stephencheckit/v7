"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, SwitchCamera, ChevronUp, ChevronDown } from 'lucide-react';
import { useVideoRecording } from '@/hooks/use-video-recording';
import { Badge } from '@/components/ui/badge';

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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [snapshotCount, setSnapshotCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const snapshotCountRef = useRef(0);
  
  const {
    isCameraOn,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    captureSnapshot,
  } = useVideoRecording();

  // Calculate total questions
  const totalQuestions = formSchema.fields.length;

  // Update answered count based on current values
  useEffect(() => {
    const answered = formSchema.fields.filter(field => {
      const value = currentValues[field.name];
      return value !== undefined && value !== null && value !== '';
    }).length;
    setAnsweredCount(answered);
  }, [currentValues, formSchema.fields]);

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
    const success = await startCamera(facingMode);
    if (success) {
      setIsActive(true);
      setSnapshotCount(0);
      snapshotCountRef.current = 0;
    }
  };

  const handleStop = () => {
    setIsActive(false);
    stopCamera();
  };

  const handleFlipCamera = async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    
    // Restart camera with new facing mode
    if (isActive) {
      stopCamera();
      const success = await startCamera(newFacingMode);
      if (!success) {
        // If failed, revert
        setFacingMode(facingMode);
        await startCamera(facingMode);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = () => {
    const percentage = (answeredCount / totalQuestions) * 100;
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 50) return 'text-yellow-400';
    return 'text-gray-400';
  };

  if (!isActive && !isCameraOn) {
    return (
      <div className="w-full">
        <Button
          onClick={handleStart}
          className="w-full bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a] h-12"
        >
          <Camera className="w-4 h-4 mr-2" />
          Start AI Vision
        </Button>
      </div>
    );
  }

  // Collapsed view - thin bar at top
  if (isCollapsed) {
    return (
      <div className="w-full bg-gradient-to-r from-[#c4dfc4]/10 to-[#c8e0f5]/10 border border-[#c4dfc4]/30 rounded-lg p-3 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-black/70 px-2 py-1 rounded">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs text-white font-medium">Recording</span>
            </div>
            <Badge variant="outline" className={`text-xs font-mono ${getProgressColor()}`}>
              {answeredCount} / {totalQuestions} answered
            </Badge>
            {isAnalyzing && (
              <span className="text-xs text-[#c4dfc4] flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-[#c4dfc4] rounded-full animate-pulse" />
                Analyzing...
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-mono">{formatTime(timeElapsed)}</span>
            <Button
              onClick={() => setIsCollapsed(false)}
              size="sm"
              variant="ghost"
              className="h-8 px-2"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleStop}
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-red-400 hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Expanded view - video at top
  return (
    <div className="w-full mb-6 bg-gradient-to-r from-[#c4dfc4]/10 to-[#c8e0f5]/10 border border-[#c4dfc4]/30 rounded-lg overflow-hidden">
      {/* Video Feed - Takes up 20-30% of viewport height */}
      <div className="relative bg-black" style={{ height: 'min(30vh, 300px)' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Recording Indicator */}
        <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/70 px-3 py-1.5 rounded-lg">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs text-white font-medium">Recording</span>
        </div>

        {/* Progress Indicator */}
        <div className="absolute top-3 right-3 bg-black/70 px-3 py-1.5 rounded-lg">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-xs font-mono ${getProgressColor()}`}>
              {answeredCount} / {totalQuestions}
            </Badge>
            {isAnalyzing && (
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-[#c4dfc4] rounded-full animate-pulse" />
                <span className="text-xs text-[#c4dfc4]">Analyzing</span>
              </div>
            )}
          </div>
        </div>

        {/* Camera Controls Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
          <Button
            onClick={handleFlipCamera}
            size="sm"
            className="bg-black/70 hover:bg-black/80 border border-white/20"
          >
            <SwitchCamera className="w-4 h-4 mr-1.5" />
            Flip
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsCollapsed(true)}
              size="sm"
              className="bg-black/70 hover:bg-black/80 border border-white/20"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleStop}
              size="sm"
              className="bg-red-500/80 hover:bg-red-500 border border-red-400/30"
            >
              <X className="w-4 h-4 mr-1.5" />
              Stop
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-[#0a0a0a]/50 border-t border-white/10 px-4 py-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="text-gray-400">
              Snapshots: <span className="text-white font-medium">{snapshotCount}</span>
            </span>
            <span className="text-gray-400">
              Time: <span className="text-white font-mono">{formatTime(timeElapsed)}</span>
            </span>
          </div>
          <span className="text-gray-500 italic">
            AI is watching and filling fields automatically
          </span>
        </div>
      </div>
    </div>
  );
}


