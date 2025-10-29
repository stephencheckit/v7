"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Mic, Send } from "lucide-react";
import { SummaryReport } from "@/lib/types/summary";
import { toast } from "sonner";

interface AddCommentaryModalProps {
  open: boolean;
  onClose: () => void;
  summary: SummaryReport;
  onSuccess: () => void;
}

export function AddCommentaryModal({ open, onClose, summary, onSuccess }: AddCommentaryModalProps) {
  const [loading, setLoading] = useState(false);
  const [commentary, setCommentary] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (open) {
      setCommentary("");
      setIsRecording(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  }, [open]);

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice input not supported', {
        description: 'Please use Chrome, Edge, or Safari for voice input.'
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsRecording(true);
    };
    
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Update the commentary with both final and interim results
      if (finalTranscript) {
        setCommentary(prev => (prev + ' ' + finalTranscript).trim());
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      
      if (event.error === 'no-speech') {
        toast.error('No speech detected', {
          description: 'Please try again and speak clearly.'
        });
      } else if (event.error === 'not-allowed') {
        toast.error('Microphone permission denied', {
          description: 'Please allow microphone access in your browser settings.'
        });
      }
    };
    
    recognition.onend = () => {
      setIsRecording(false);
    };
    
    recognitionRef.current = recognition;
    recognition.start();
  };
  
  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const toggleVoiceInput = () => {
    if (isRecording) {
      stopVoiceInput();
    } else {
      startVoiceInput();
    }
  };

  const cleanupCommentary = (text: string): string => {
    // Clean up common speech-to-text artifacts
    let cleaned = text.trim();
    
    // Capitalize first letter of sentences
    cleaned = cleaned.replace(/(^\w|[.!?]\s+\w)/g, (match) => match.toUpperCase());
    
    // Remove multiple spaces
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    // Fix common punctuation issues
    cleaned = cleaned.replace(/\s+([,.!?])/g, '$1');
    
    return cleaned;
  };

  const handleSubmit = async () => {
    const cleanedCommentary = cleanupCommentary(commentary);
    
    if (!cleanedCommentary.trim()) {
      toast.error("Please enter some commentary");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/summaries/${summary.id}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent_summary_id: summary.id,
          user_commentary: cleanedCommentary,
          name: `${summary.name} (with Commentary)`
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create derivative summary');
      }

      toast.success('New summary with commentary is being generated');
      onSuccess();
    } catch (error: any) {
      console.error('Error creating derivative summary:', error);
      toast.error(error.message || 'Failed to create derivative summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0a0a0a] border-gray-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Commentary & Regenerate</DialogTitle>
          <p className="text-sm text-gray-400 mt-2">
            Add your observations or questions to create a focused derivative summary
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Your Commentary</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={toggleVoiceInput}
                disabled={loading}
                className={`border-gray-700 ${isRecording ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse' : ''}`}
              >
                {isRecording ? (
                  <>
                    <Mic className="h-3 w-3 mr-1.5" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-3 w-3 mr-1.5" />
                    Voice Input
                  </>
                )}
              </Button>
            </div>
            <Textarea
              value={commentary}
              onChange={(e) => setCommentary(e.target.value)}
              placeholder={isRecording ? "Listening..." : "Example: I noticed that morning checklists are often missed on Mondays. Can you analyze why this might be happening and provide specific recommendations?"}
              className="bg-[#1a1a1a] border-gray-700 min-h-[150px]"
              rows={6}
              disabled={isRecording}
            />
            <p className="text-xs text-gray-500 mt-2">
              {isRecording 
                ? "🎤 Speak your commentary... The AI will clean up and structure your input."
                : "Your commentary will guide the AI to focus on specific aspects of the data. Use voice input for hands-free entry."}
            </p>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-400">
              💡 Tip: Be specific about what you want to learn. The AI will tailor its analysis based on your input.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
          <Button variant="outline" onClick={onClose} className="border-gray-700">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !commentary.trim()}
            className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-black"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate with Commentary'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

