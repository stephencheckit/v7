"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Clock, CheckCircle, XCircle, Calendar } from "lucide-react";
import { SummaryReport } from "@/lib/types/summary";
import { CreateSummaryModal } from "./create-summary-modal";
import { SummaryViewerModal } from "./summary-viewer-modal";
import { toast } from "sonner";

interface SummariesViewProps {
  workspaceId: string;
}

export function SummariesView({ workspaceId }: SummariesViewProps) {
  const [summaries, setSummaries] = useState<SummaryReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<SummaryReport | null>(null);
  const [viewerModalOpen, setViewerModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchSummaries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ workspace_id: workspaceId });
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const response = await fetch(`/api/summaries?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch summaries");
      }

      const { summaries } = await response.json();
      setSummaries(summaries || []);
    } catch (error) {
      console.error("Error fetching summaries:", error);
      toast.error("Failed to load summaries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, [workspaceId, statusFilter]);

  const handleViewSummary = (summary: SummaryReport) => {
    setSelectedSummary(summary);
    setViewerModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "generating":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "scheduled":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "failed":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "generating":
        return <Clock className="w-4 h-4 animate-spin" />;
      case "scheduled":
        return <Calendar className="w-4 h-4" />;
      case "failed":
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Summary Reports</h2>
          <p className="text-gray-400 mt-1">
            AI-generated compliance summaries and insights
          </p>
        </div>
        
        <Button
          onClick={() => setCreateModalOpen(true)}
          className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-black"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Summary
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-2 text-white"
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="generating">Generating</option>
          <option value="scheduled">Scheduled</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Summaries Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="text-gray-400">Loading summaries...</div>
        </div>
      ) : summaries.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-[#1a1a1a] rounded-lg border border-gray-700">
          <FileText className="w-16 h-16 text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Summaries Yet</h3>
          <p className="text-gray-400 mb-6 text-center max-w-md">
            Create your first summary to start analyzing compliance data and generating insights
          </p>
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-black"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Summary
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {summaries.map((summary) => (
            <div
              key={summary.id}
              onClick={() => handleViewSummary(summary)}
              className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex-1 pr-3">
                  {summary.name}
                </h3>
                <div className={`flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium ${getStatusColor(summary.status)}`}>
                  {getStatusIcon(summary.status)}
                  <span className="capitalize">{summary.status}</span>
                </div>
              </div>

              {summary.description && (
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                  {summary.description}
                </p>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between text-gray-400">
                  <span>Date Range:</span>
                  <span className="text-white">
                    {new Date(summary.date_range_start).toLocaleDateString()} - {new Date(summary.date_range_end).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-gray-400">
                  <span>Cadences:</span>
                  <span className="text-white">{summary.cadence_ids?.length || 0}</span>
                </div>

                {summary.metrics?.completion_rate !== undefined && (
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Completion Rate:</span>
                    <span className="text-white font-medium">
                      {summary.metrics.completion_rate.toFixed(1)}%
                    </span>
                  </div>
                )}

                {summary.generated_at && (
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Generated:</span>
                    <span className="text-white">
                      {new Date(summary.generated_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {summary.parent_summary_id && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <span className="text-xs text-blue-400">📎 Derivative Summary</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Summary Modal */}
      <CreateSummaryModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        workspaceId={workspaceId}
        onSuccess={() => {
          fetchSummaries();
          setCreateModalOpen(false);
        }}
      />

      {/* Summary Viewer Modal */}
      {selectedSummary && (
        <SummaryViewerModal
          summary={selectedSummary}
          open={viewerModalOpen}
          onClose={() => {
            setViewerModalOpen(false);
            setSelectedSummary(null);
          }}
          onUpdate={fetchSummaries}
        />
      )}
    </div>
  );
}

