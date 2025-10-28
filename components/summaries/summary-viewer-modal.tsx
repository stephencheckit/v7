"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Filter, MessageSquarePlus, Share, FileDown, Loader2, AlertTriangle } from "lucide-react";
import { SummaryReport, SummaryWithCadences } from "@/lib/types/summary";
import { FilterRegenerateModal } from "./filter-regenerate-modal";
import { AddCommentaryModal } from "./add-commentary-modal";
import { toast } from "sonner";

interface SummaryViewerModalProps {
  summary: SummaryReport;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function SummaryViewerModal({ summary, open, onClose, onUpdate }: SummaryViewerModalProps) {
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [commentaryModalOpen, setCommentaryModalOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      completed: "bg-green-500/10 text-green-400 border-green-500/20",
      generating: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      failed: "bg-red-500/10 text-red-400 border-red-500/20",
      draft: "bg-gray-500/10 text-gray-400 border-gray-500/20",
      scheduled: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
    };

    return (
      <Badge className={`border ${variants[status] || variants.draft}`}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const handleShare = () => {
    const url = `${window.location.origin}/cadences?tab=summaries&view=${summary.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-[#0a0a0a] border-gray-700 text-white max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl mb-2">{summary.name}</DialogTitle>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span>
                    {new Date(summary.date_range_start).toLocaleDateString()} - {new Date(summary.date_range_end).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  {getStatusBadge(summary.status)}
                </div>
                {summary.parent_summary_id && (
                  <div className="mt-2 text-sm text-blue-400">
                    📎 Derivative Summary
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterModalOpen(true)}
                  className="border-gray-700"
                  disabled={summary.status !== 'completed'}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter & Regenerate
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCommentaryModalOpen(true)}
                  className="border-gray-700"
                  disabled={summary.status !== 'completed'}
                >
                  <MessageSquarePlus className="w-4 h-4 mr-2" />
                  Add Commentary
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="border-gray-700"
                >
                  <Share className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {summary.description && (
            <p className="text-gray-400 -mt-2 mb-4">{summary.description}</p>
          )}

          {/* Content Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-[#1a1a1a] border border-gray-700">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="cadences">Cadence Details</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="raw">Raw Data</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              {summary.status === 'generating' && (
                <div className="flex items-center justify-center p-12 bg-[#1a1a1a] rounded-lg border border-gray-700">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-400 mr-3" />
                  <div>
                    <p className="font-medium">Generating Summary...</p>
                    <p className="text-sm text-gray-400">This may take a few moments</p>
                  </div>
                </div>
              )}

              {summary.status === 'failed' && (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-red-400 mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">Generation Failed</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {summary.ai_content?.executive_summary || 'An error occurred while generating this summary'}
                  </p>
                </div>
              )}

              {summary.status === 'completed' && (() => {
                // Parse AI content if it's a string
                let aiContent = summary.ai_content;
                if (typeof aiContent === 'string') {
                  try {
                    aiContent = JSON.parse(aiContent);
                  } catch (e) {
                    console.error('Failed to parse AI content:', e);
                  }
                }

                return (
                  <>
                    {/* Executive Summary */}
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Executive Summary</h3>
                      <div className="p-6 bg-[#1a1a1a] rounded-lg border border-gray-700">
                        <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-base">
                          {aiContent?.executive_summary || 'No summary available'}
                        </p>
                      </div>
                    </div>

                  {/* Key Metrics */}
                  {summary.metrics && (
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Key Metrics</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-[#1a1a1a] rounded-lg border border-gray-700">
                          <p className="text-sm text-gray-400">Total Instances</p>
                          <p className="text-3xl font-bold text-white mt-1">{summary.metrics.total_instances}</p>
                        </div>
                        <div className="p-4 rounded-lg border border-green-700/30 bg-green-500/5">
                          <p className="text-sm text-gray-400">Completed</p>
                          <p className="text-3xl font-bold text-green-400 mt-1">{summary.metrics.completed}</p>
                        </div>
                        <div className="p-4 rounded-lg border border-red-700/30 bg-red-500/5">
                          <p className="text-sm text-gray-400">Missed</p>
                          <p className="text-3xl font-bold text-red-400 mt-1">{summary.metrics.missed}</p>
                        </div>
                        <div className="p-4 rounded-lg border border-blue-700/30 bg-blue-500/5">
                          <p className="text-sm text-gray-400">Completion Rate</p>
                          <p className="text-3xl font-bold text-blue-400 mt-1">
                            {summary.metrics.completion_rate.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  </>
                );
              })()}
            </TabsContent>

            {/* Cadence Details Tab */}
            <TabsContent value="cadences" className="space-y-4 mt-6">
              {summary.metrics?.by_cadence && summary.metrics.by_cadence.length > 0 ? (
                summary.metrics.by_cadence.map((cadence) => (
                  <div key={cadence.cadence_id} className="p-6 bg-[#1a1a1a] rounded-lg border border-gray-700">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold">{cadence.cadence_name}</h4>
                        <p className="text-sm text-gray-400">
                          {cadence.completed} of {cadence.total} completed ({cadence.completion_rate.toFixed(1)}%)
                        </p>
                      </div>
                      {cadence.avg_completion_time_minutes && (
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Avg. Time</p>
                          <p className="font-medium">{Math.round(cadence.avg_completion_time_minutes)} min</p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-green-500/10 rounded border border-green-500/20">
                        <p className="text-xs text-gray-400">Completed</p>
                        <p className="text-xl font-bold text-green-400">{cadence.completed}</p>
                      </div>
                      <div className="p-3 bg-red-500/10 rounded border border-red-500/20">
                        <p className="text-xs text-gray-400">Missed</p>
                        <p className="text-xl font-bold text-red-400">{cadence.missed}</p>
                      </div>
                      <div className="p-3 bg-blue-500/10 rounded border border-blue-500/20">
                        <p className="text-xs text-gray-400">Rate</p>
                        <p className="text-xl font-bold text-blue-400">{cadence.completion_rate.toFixed(0)}%</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 bg-[#1a1a1a] rounded-lg border border-gray-700 text-center">
                  <p className="text-gray-400">No cadence details available</p>
                </div>
              )}
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="space-y-4 mt-6">
              {summary.status === 'completed' && (() => {
                // Parse AI content if it's a string
                let aiContent = summary.ai_content;
                if (typeof aiContent === 'string') {
                  try {
                    aiContent = JSON.parse(aiContent);
                  } catch (e) {
                    console.error('Failed to parse AI content:', e);
                    return null;
                  }
                }
                
                return aiContent?.insights && aiContent.insights.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {aiContent.insights.map((insight, idx) => (
                      <div key={idx} className="p-5 bg-[#1a1a1a] rounded-lg border border-gray-700">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-lg">{insight.title}</h4>
                          {insight.severity && (
                            <Badge className={`${
                              insight.severity === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              insight.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                              'bg-green-500/10 text-green-400 border-green-500/20'
                            } border`}>
                              {insight.severity}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-2 uppercase tracking-wide">{insight.category}</p>
                        <p className="text-gray-300">{insight.description}</p>
                      </div>
                    ))}
                  </div>

                  {aiContent.recommendations && aiContent.recommendations.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-xl font-semibold mb-3">Recommendations</h3>
                      <div className="p-5 bg-[#1a1a1a] rounded-lg border border-gray-700">
                        <ul className="space-y-2">
                          {aiContent.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <span className="text-[#c4dfc4] mt-1">✓</span>
                              <span className="text-gray-300">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </>
                ) : (
                  <div className="p-8 bg-[#1a1a1a] rounded-lg border border-gray-700 text-center">
                    <p className="text-gray-400">No insights available yet</p>
                  </div>
                );
              })()}
            </TabsContent>

            {/* Raw Data Tab */}
            <TabsContent value="raw" className="space-y-4 mt-6">
              <div className="p-4 bg-[#1a1a1a] rounded-lg border border-gray-700">
                <h4 className="font-semibold mb-2">Summary Configuration</h4>
                <pre className="text-xs text-gray-400 overflow-x-auto">
                  {JSON.stringify({
                    date_range: {
                      start: summary.date_range_start,
                      end: summary.date_range_end
                    },
                    cadence_ids: summary.cadence_ids,
                    filter_config: summary.filter_config,
                    schedule_type: summary.schedule_type,
                    recipients: summary.recipients
                  }, null, 2)}
                </pre>
              </div>

              {summary.metrics && (
                <div className="p-4 bg-[#1a1a1a] rounded-lg border border-gray-700">
                  <h4 className="font-semibold mb-2">Metrics Data</h4>
                  <pre className="text-xs text-gray-400 overflow-x-auto">
                    {JSON.stringify(summary.metrics, null, 2)}
                  </pre>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Filter & Regenerate Modal */}
      <FilterRegenerateModal
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        summary={summary}
        onSuccess={() => {
          setFilterModalOpen(false);
          onUpdate();
          onClose();
        }}
      />

      {/* Add Commentary Modal */}
      <AddCommentaryModal
        open={commentaryModalOpen}
        onClose={() => setCommentaryModalOpen(false)}
        summary={summary}
        onSuccess={() => {
          setCommentaryModalOpen(false);
          onUpdate();
          onClose();
        }}
      />
    </>
  );
}

