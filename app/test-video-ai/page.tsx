"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useVideoRecording } from "@/hooks/use-video-recording";
import {
  Video,
  VideoOff,
  Sparkles,
  Loader2,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

const TEST_FORM = {
  fields: [
    { id: "field_1", label: "Are people visible in the frame?", type: "radio", options: ["Yes", "No"] },
    { id: "field_2", label: "What objects do you see?", type: "text" },
    { id: "field_3", label: "Is there good lighting?", type: "radio", options: ["Yes", "No", "N/A"] },
    { id: "field_4", label: "How many items can you count?", type: "number" },
  ],
};

export default function TestVideoAIPage() {
  const [mounted, setMounted] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [snapshotCount, setSnapshotCount] = useState(0);
  const [analysisFeed, setAnalysisFeed] = useState<any[]>([]);
  const [savedAnswers, setSavedAnswers] = useState<Record<string, any>>({});
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

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

  // Store cleanup function
  cleanupRef.current = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    stopCamera();
  };

  useEffect(() => {
    console.log('[Video AI] Component mounted');
    setMounted(true);
    
    return () => {
      console.log('[Video AI] Component unmounting, cleaning up...');
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []); // Only run on mount/unmount

  if (!mounted) {
    return null; // Prevent hydration issues
  }

  const handleStartCamera = async () => {
    if (isStartingCamera || isCameraOn) {
      console.log('[Video AI] Camera already starting or on, ignoring...');
      return;
    }
    
    console.log('[Video AI] Starting camera...');
    setIsStartingCamera(true);
    
    try {
      const success = await startCamera();
      console.log('[Video AI] Camera start result:', success);
      if (!success) {
        alert('Failed to start camera. Please check permissions.');
      }
    } finally {
      setIsStartingCamera(false);
    }
  };

  const handleStartRecording = async () => {
    console.log('[Video AI] handleStartRecording called');
    console.log('[Video AI] isCameraOn:', isCameraOn);
    
    if (!isCameraOn) {
      console.log('[Video AI] Camera not on, need to start camera first');
      alert('Please start the camera first by clicking "Start Camera"');
      return;
    }
    
    console.log('[Video AI] Calling startRecording()...');
    startRecording();
    setSnapshotCount(0);
    setAnalysisFeed([]);
    setSavedAnswers({}); // Clear previous answers
    
    console.log('[Video AI] Waiting 2 seconds for video to fully load...');
    
    // Wait 2 seconds for video to be fully ready
    setTimeout(() => {
      console.log('[Video AI] Setting up interval to capture every 4 seconds...');
      const interval = setInterval(async () => {
        console.log('[Video AI] Interval tick - attempting snapshot capture...');
        const snapshot = captureSnapshot();
        console.log('[Video AI] Snapshot result:', snapshot ? 'SUCCESS (length: ' + snapshot.length + ')' : 'FAILED');
        if (!snapshot) {
          console.warn('[Video AI] No snapshot captured, skipping this cycle');
          return;
        }

      setIsAnalyzing(true);
      const currentSnapshot = snapshotCount + 1;
      setSnapshotCount(currentSnapshot);

      try {
        console.log(`[Video AI] Sending snapshot #${currentSnapshot} to API...`);
        
        const response = await fetch('/api/analyze-video-form', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: snapshot,
            questions: TEST_FORM.fields,
          }),
        });

        console.log(`[Video AI] API responded with status: ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[Video AI] API error response:', errorText);
          throw new Error(`API error ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log('[Video AI] Full response:', result);
        
        const { answers = {}, confidence = {} } = result;

        setAnalysisFeed(prev => [{
          timestamp: new Date().toLocaleTimeString(),
          snapshotNumber: currentSnapshot,
          answers,
          confidence,
          answeredCount: Object.keys(answers).length,
        }, ...prev].slice(0, 20));

        // Save answers (only update if confidence is higher or answer doesn't exist)
        setSavedAnswers(prev => {
          const updated = { ...prev };
          Object.entries(answers).forEach(([fieldId, answer]) => {
            const existingConfidence = prev[fieldId]?.confidence || 0;
            const newConfidence = confidence[fieldId] || 0;
            
            if (!prev[fieldId] || newConfidence > existingConfidence) {
              updated[fieldId] = {
                value: answer,
                confidence: newConfidence,
                timestamp: new Date().toISOString()
              };
              console.log(`[Video AI] Saved answer for ${fieldId}: ${answer} (${newConfidence}% confident)`);
            }
          });
          return updated;
        });

      } catch (error) {
        console.error('Error analyzing snapshot:', error);
        
        setAnalysisFeed(prev => [{
          timestamp: new Date().toLocaleTimeString(),
          snapshotNumber: currentSnapshot,
          answers: {},
          confidence: {},
          answeredCount: 0,
          error: error instanceof Error ? error.message : String(error),
        }, ...prev].slice(0, 20));
      } finally {
        setIsAnalyzing(false);
      }
    }, 4000); // Capture every 4 seconds

      intervalRef.current = interval;
    }, 2000); // Wait 2 seconds before starting
  };

  const handleStopRecording = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    stopRecording();
    stopCamera();
    setIsAnalyzing(false);
  };

  const getQuestionLabel = (fieldId: string) => {
    return TEST_FORM.fields.find(f => f.id === fieldId)?.label || fieldId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000000] to-[#0a0a0a] py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">🎥 AI Video Form Filler Test</h1>
          <p className="text-gray-400">
            Test the AI vision feature - point your camera at something and watch it analyze!
          </p>
        </div>

        {/* Video AI Controls */}
        <Card className="mb-6 p-6 bg-[#1a1a1a] border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                Camera Controls
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                {!isCameraOn && "Start camera to begin"}
                {isCameraOn && !isRecording && "Camera ready - click Start Recording"}
                {isRecording && "Recording - AI analyzing every 4 seconds"}
              </p>
            </div>
            <div className="flex gap-2">
              {!isCameraOn && (
                <Button 
                  onClick={handleStartCamera} 
                  disabled={isStartingCamera}
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isStartingCamera ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Video className="h-4 w-4 mr-2" />
                      Start Camera
                    </>
                  )}
                </Button>
              )}
              {isCameraOn && !isRecording && (
                <Button onClick={handleStartRecording} size="sm" className="bg-green-600 hover:bg-green-700">
                  <Video className="h-4 w-4 mr-2" />
                  Start Recording
                </Button>
              )}
              {isRecording && (
                <Button onClick={handleStopRecording} size="sm" variant="destructive">
                  <VideoOff className="h-4 w-4 mr-2" />
                  Stop Recording
                </Button>
              )}
            </div>
          </div>

          {isCameraOn && (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                {isRecording && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-full">
                    <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    <span className="text-sm font-medium">Recording</span>
                  </div>
                )}
              </div>

              {isRecording && (
                <div className="flex gap-4">
                  <Badge variant="outline" className="text-white border-white/20">
                    <Video className="h-3 w-3 mr-1" />
                    Snapshots: {snapshotCount}
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

          <canvas ref={canvasRef} className="hidden" />
        </Card>

        {/* AI Analysis Feed */}
        {isRecording && (
          <Card className="mb-6 p-6 bg-[#1a1a1a] border-border/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              AI Analysis Feed
              {isAnalyzing && (
                <Badge variant="outline" className="text-blue-400 border-blue-400/30 ml-2">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Analyzing...
                </Badge>
              )}
            </h3>
            <ScrollArea className="h-96 pr-4">
              {analysisFeed.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  Waiting for first snapshot analysis...
                </div>
              ) : (
                <div className="space-y-3">
                  {analysisFeed.map((entry, idx) => (
                    <div key={idx} className="p-4 bg-[#0a0a0a] border border-white/10 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-400">
                          Snapshot #{entry.snapshotNumber}
                        </span>
                        <span className="text-xs text-gray-500">{entry.timestamp}</span>
                      </div>
                      
                      {entry.error ? (
                        <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-400">
                          <div className="font-semibold mb-1">Error:</div>
                          {entry.error}
                        </div>
                      ) : Object.keys(entry.answers).length > 0 ? (
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
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>
        )}

        {/* Saved Answers */}
        <Card className="p-6 bg-[#1a1a1a] border-border/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#c4dfc4]" />
            Saved Answers ({Object.keys(savedAnswers).length}/{TEST_FORM.fields.length})
          </h3>
          
          {Object.keys(savedAnswers).length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              Start recording to see AI-filled answers appear here...
            </p>
          ) : (
            <div className="space-y-4">
              {TEST_FORM.fields.map((field, idx) => {
                const saved = savedAnswers[field.id];
                return (
                  <div key={field.id} className={`p-3 rounded-lg border ${saved ? 'bg-[#c4dfc4]/10 border-[#c4dfc4]/30' : 'bg-[#0a0a0a] border-white/10'}`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-sm text-gray-400">
                        {idx + 1}. {field.label}
                      </span>
                      {saved && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            saved.confidence >= 90 
                              ? 'text-green-400 border-green-400/30' 
                              : 'text-yellow-400 border-yellow-400/30'
                          }`}
                        >
                          {saved.confidence}%
                        </Badge>
                      )}
                    </div>
                    {saved ? (
                      <div className="text-white font-medium">
                        {String(saved.value)}
                      </div>
                    ) : (
                      <div className="text-gray-600 text-sm italic">
                        Not yet answered
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

