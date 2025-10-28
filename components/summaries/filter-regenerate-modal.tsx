"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { SummaryReport, DerivativeSummaryRequest } from "@/lib/types/summary";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface FilterRegenerateModalProps {
  open: boolean;
  onClose: () => void;
  summary: SummaryReport;
  onSuccess: () => void;
}

interface Cadence {
  id: string;
  name: string;
  form: {
    title: string;
  };
}

export function FilterRegenerateModal({ open, onClose, summary, onSuccess }: FilterRegenerateModalProps) {
  const [loading, setLoading] = useState(false);
  const [cadences, setCadences] = useState<Cadence[]>([]);
  const [selectedCadences, setSelectedCadences] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [userCommentary, setUserCommentary] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedCadences(summary.cadence_ids || []);
      setStatusFilter(summary.filter_config?.status_filter || []);
      setUserCommentary("");
      setName(`${summary.name} (Filtered)`);
      fetchCadences();
    }
  }, [open, summary]);

  const fetchCadences = async () => {
    try {
      const supabase = createClient();
      // Cast to any to avoid TypeScript errors with form_cadences table
      const { data } = await (supabase as any)
        .from('form_cadences')
        .select('id, name, form:simple_forms(title)')
        .in('id', summary.cadence_ids || []);
      
      setCadences(data || []);
    } catch (error) {
      console.error('Error fetching cadences:', error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const request: DerivativeSummaryRequest = {
        parent_summary_id: summary.id,
        user_commentary: userCommentary || undefined,
        name,
        filter_config: {
          cadence_filter: selectedCadences,
          status_filter: statusFilter.length > 0 ? statusFilter as any : undefined
        }
      };

      const response = await fetch(`/api/summaries/${summary.id}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create derivative summary');
      }

      toast.success('Derivative summary is being generated');
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
          <DialogTitle>Filter & Regenerate Summary</DialogTitle>
          <p className="text-sm text-gray-400 mt-2">
            Adjust filters and add commentary to create a derivative summary
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Name */}
          <div>
            <Label>Summary Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Derivative Summary Name"
              className="bg-[#1a1a1a] border-gray-700"
            />
          </div>

          {/* Cadence Filter */}
          <div>
            <Label className="mb-2 block">Cadences</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {cadences.map((cadence) => (
                <div
                  key={cadence.id}
                  className="flex items-center space-x-3 p-2 bg-[#1a1a1a] rounded-lg border border-gray-700"
                >
                  <Checkbox
                    id={`filter-${cadence.id}`}
                    checked={selectedCadences.includes(cadence.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCadences([...selectedCadences, cadence.id]);
                      } else {
                        setSelectedCadences(selectedCadences.filter(id => id !== cadence.id));
                      }
                    }}
                  />
                  <label htmlFor={`filter-${cadence.id}`} className="flex-1 cursor-pointer text-sm">
                    {cadence.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <Label className="mb-2 block">Status Filter</Label>
            <div className="grid grid-cols-2 gap-2">
              {['completed', 'missed', 'in_progress', 'ready'].map((status) => (
                <div
                  key={status}
                  className="flex items-center space-x-2 p-2 bg-[#1a1a1a] rounded-lg border border-gray-700"
                >
                  <Checkbox
                    id={`status-${status}`}
                    checked={statusFilter.includes(status)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setStatusFilter([...statusFilter, status]);
                      } else {
                        setStatusFilter(statusFilter.filter(s => s !== status));
                      }
                    }}
                  />
                  <label htmlFor={`status-${status}`} className="cursor-pointer text-sm capitalize">
                    {status.replace('_', ' ')}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* User Commentary */}
          <div>
            <Label>Commentary (Optional)</Label>
            <Textarea
              value={userCommentary}
              onChange={(e) => setUserCommentary(e.target.value)}
              placeholder="Add any specific focus areas or questions you want the AI to address..."
              className="bg-[#1a1a1a] border-gray-700"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be included in the AI prompt to focus the analysis
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
          <Button variant="outline" onClick={onClose} className="border-gray-700">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || selectedCadences.length === 0}
            className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-black"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate New Summary'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

