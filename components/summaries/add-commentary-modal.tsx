"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
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

  useEffect(() => {
    if (open) {
      setCommentary("");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!commentary.trim()) {
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
          user_commentary: commentary,
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
            <Label>Your Commentary</Label>
            <Textarea
              value={commentary}
              onChange={(e) => setCommentary(e.target.value)}
              placeholder="Example: I noticed that morning checklists are often missed on Mondays. Can you analyze why this might be happening and provide specific recommendations?"
              className="bg-[#1a1a1a] border-gray-700 min-h-[150px]"
              rows={6}
            />
            <p className="text-xs text-gray-500 mt-2">
              Your commentary will guide the AI to focus on specific aspects of the data
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

