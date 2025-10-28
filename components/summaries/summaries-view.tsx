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
  statusFilter?: string;
  createModalOpen?: boolean;
  onCreateModalClose?: () => void;
}

export function SummariesView({ 
  workspaceId, 
  statusFilter: externalStatusFilter,
  createModalOpen: externalCreateModalOpen,
  onCreateModalClose
}: SummariesViewProps) {
  const [summaries, setSummaries] = useState<SummaryReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [internalCreateModalOpen, setInternalCreateModalOpen] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<SummaryReport | null>(null);
  const [viewerModalOpen, setViewerModalOpen] = useState(false);
  const [internalStatusFilter, setInternalStatusFilter] = useState<string>("all");
  
  // Use external or internal state
  const statusFilter = externalStatusFilter !== undefined ? externalStatusFilter : internalStatusFilter;
  const createModalOpen = externalCreateModalOpen !== undefined ? externalCreateModalOpen : internalCreateModalOpen;
  const handleCreateModalClose = () => {
    if (onCreateModalClose) {
      onCreateModalClose();
    } else {
      setInternalCreateModalOpen(false);
    }
  };

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
      {/* Header Controls - Only show if not controlled externally */}
      {externalStatusFilter === undefined && (
        <div className="flex items-center justify-between">
          <select
            value={statusFilter}
            onChange={(e) => setInternalStatusFilter(e.target.value)}
            className="bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-2 text-white"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="generating">Generating</option>
            <option value="scheduled">Scheduled</option>
            <option value="failed">Failed</option>
          </select>
          
          <Button
            onClick={() => setInternalCreateModalOpen(true)}
            className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-black"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Summary
          </Button>
        </div>
      )}

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
            onClick={() => setInternalCreateModalOpen(true)}
            className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-black"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Summary
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {summaries.map((summary) => (
            <div
              key={summary.id}
              onClick={() => handleViewSummary(summary)}
              className="group relative bg-gradient-to-br from-[#1a1a1a] to-[#111111] border border-gray-700 rounded-2xl p-6 hover:border-gray-600 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* Top gradient line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 pr-3">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {summary.name}
                  </h3>
                  {summary.parent_summary_id && (
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-400 mb-2">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Derivative
                    </div>
                  )}
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${getStatusColor(summary.status)}`}>
                  {getStatusIcon(summary.status)}
                  <span className="capitalize">{summary.status}</span>
                </div>
              </div>

              {summary.description && (
                <p className="text-sm text-gray-400 mb-5 line-clamp-2 leading-relaxed">
                  {summary.description}
                </p>
              )}

              {/* Key Metrics */}
              {summary.metrics?.completion_rate !== undefined && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-400">Completion Rate</span>
                    <span className="text-xl font-bold text-blue-400">
                      {summary.metrics.completion_rate.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${summary.metrics.completion_rate}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-gray-400">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-300 font-medium">
                    {new Date(summary.date_range_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(summary.date_range_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-gray-400">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="text-gray-300">
                    {(summary.cadence_ids?.length || 0) + (summary.form_ids?.length || 0)} {(summary.cadence_ids?.length || 0) > 0 ? 'cadences' : 'forms'}
                  </span>
                </div>

                {summary.generated_at && (
                  <div className="flex items-center gap-3 text-gray-400">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-300">
                      {new Date(summary.generated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                )}
              </div>

              {/* Hover indicator */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Summary Modal */}
      <CreateSummaryModal
        open={createModalOpen}
        onClose={handleCreateModalClose}
        workspaceId={workspaceId}
        onSuccess={() => {
          fetchSummaries();
          handleCreateModalClose();
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

