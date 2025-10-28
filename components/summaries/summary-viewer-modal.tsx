"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Filter, MessageSquarePlus, Share, FileDown, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
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
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`/api/summaries/${summary.id}/regenerate`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to refresh summary');
      }

      toast.success('Summary is being regenerated with updated formatting');
      onUpdate(); // Refresh the parent list
      
      // Optionally close and reopen after a delay to show loading state
      setTimeout(() => {
        onUpdate();
      }, 3000);
      
    } catch (error) {
      console.error('Error refreshing summary:', error);
      toast.error('Failed to refresh summary');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-[#0a0a0a] border-gray-700 text-white !max-w-[96vw] w-[96vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <DialogTitle className="text-4xl font-bold mb-3">{summary.name}</DialogTitle>
                <div className="flex items-center gap-4 text-base text-gray-400">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">
                      {new Date(summary.date_range_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(summary.date_range_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <span className="text-gray-600">•</span>
                  {getStatusBadge(summary.status)}
                </div>
                {summary.parent_summary_id && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm text-blue-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Derivative Summary
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="border-gray-700 hover:bg-gray-800"
                  disabled={summary.status !== 'completed' || isRefreshing}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterModalOpen(true)}
                  className="border-gray-700 hover:bg-gray-800"
                  disabled={summary.status !== 'completed'}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter & Regenerate
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCommentaryModalOpen(true)}
                  className="border-gray-700 hover:bg-gray-800"
                  disabled={summary.status !== 'completed'}
                >
                  <MessageSquarePlus className="w-4 h-4 mr-2" />
                  Add Commentary
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="border-gray-700 hover:bg-gray-800"
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
                    // Strip markdown code fences if present
                    let cleanedText = aiContent.trim();
                    if (cleanedText.startsWith('```')) {
                      cleanedText = cleanedText.replace(/^```(?:json)?\n?/, '');
                      cleanedText = cleanedText.replace(/\n?```$/, '');
                    }
                    aiContent = JSON.parse(cleanedText.trim());
                  } catch (e) {
                    console.error('Failed to parse AI content:', e);
                    // If parsing fails, display as-is
                    aiContent = {
                      executive_summary: aiContent,
                      insights: [],
                      recommendations: []
                    };
                  }
                }

                return (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Key Metrics - Left Column */}
                      {summary.metrics && (
                        <div className="lg:col-span-1">
                          <h3 className="text-2xl font-bold mb-6">Key Metrics</h3>
                          <div className="grid grid-cols-1 gap-4">
                            {/* Total Instances */}
                            <div className="group relative p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700 hover:border-gray-600 transition-all">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">Total</p>
                                  <p className="text-4xl font-black text-white">{summary.metrics.total_instances}</p>
                                </div>
                                <div className="p-3 bg-gray-700/30 rounded-xl">
                                  <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                              </div>
                            </div>

                            {/* Completed */}
                            <div className="group relative p-6 bg-gradient-to-br from-green-900/20 to-green-950/30 rounded-xl border border-green-700/40 hover:border-green-600/60 transition-all">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-medium uppercase tracking-wider text-green-400/70 mb-1">Completed</p>
                                  <p className="text-4xl font-black text-green-400">{summary.metrics.completed}</p>
                                </div>
                                <div className="p-3 bg-green-500/20 rounded-xl">
                                  <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                              </div>
                              <div className="h-1 bg-green-950 rounded-full mt-3">
                                <div className="h-1 bg-green-500 rounded-full" style={{ width: `${(summary.metrics.completed / summary.metrics.total_instances) * 100}%` }}></div>
                              </div>
                            </div>

                            {/* Missed */}
                            <div className="group relative p-6 bg-gradient-to-br from-red-900/20 to-red-950/30 rounded-xl border border-red-700/40 hover:border-red-600/60 transition-all">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-medium uppercase tracking-wider text-red-400/70 mb-1">Missed</p>
                                  <p className="text-4xl font-black text-red-400">{summary.metrics.missed}</p>
                                </div>
                                <div className="p-3 bg-red-500/20 rounded-xl">
                                  <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                              </div>
                              <div className="h-1 bg-red-950 rounded-full mt-3">
                                <div className="h-1 bg-red-500 rounded-full" style={{ width: `${(summary.metrics.missed / summary.metrics.total_instances) * 100}%` }}></div>
                              </div>
                            </div>

                            {/* Completion Rate */}
                            <div className="group relative p-6 bg-gradient-to-br from-blue-900/20 to-blue-950/30 rounded-xl border border-blue-700/40 hover:border-blue-600/60 transition-all">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-medium uppercase tracking-wider text-blue-400/70 mb-1">Rate</p>
                                  <p className="text-4xl font-black text-blue-400">
                                    {summary.metrics.completion_rate.toFixed(1)}%
                                  </p>
                                </div>
                                <div className="p-3 bg-blue-500/20 rounded-xl">
                                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                  </svg>
                                </div>
                              </div>
                              <div className="h-1 bg-blue-950 rounded-full mt-3">
                                <div className="h-1 bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${summary.metrics.completion_rate}%` }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Executive Summary - Right Columns */}
                      <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-purple-500/20 rounded-lg">
                            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <h3 className="text-2xl font-bold">Executive Summary</h3>
                        </div>
                        <div className="relative p-8 bg-gradient-to-br from-[#1a1a1a] to-[#111111] rounded-2xl border border-gray-700 shadow-xl h-full">
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 rounded-t-2xl"></div>
                          <p className="text-gray-200 whitespace-pre-wrap leading-relaxed text-lg">
                            {aiContent?.executive_summary || 'No summary available'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </TabsContent>

            {/* Cadence Details Tab */}
            <TabsContent value="cadences" className="space-y-6 mt-6">
              {summary.metrics?.by_cadence && summary.metrics.by_cadence.length > 0 ? (
                summary.metrics.by_cadence.map((cadence, idx) => (
                  <div key={cadence.cadence_id} className="group relative p-8 bg-gradient-to-br from-[#1a1a1a] to-[#111111] rounded-2xl border border-gray-700 hover:border-gray-600 transition-all">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm">
                            {idx + 1}
                          </div>
                          <h4 className="text-2xl font-bold">{cadence.cadence_name}</h4>
                        </div>
                        <p className="text-base text-gray-400 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {cadence.completed} of {cadence.total} completed
                        </p>
                      </div>
                      {cadence.avg_completion_time_minutes && (
                        <div className="text-right p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                          <p className="text-sm font-medium text-blue-400/70 mb-1">Average Time</p>
                          <p className="text-3xl font-bold text-blue-400">{Math.round(cadence.avg_completion_time_minutes)}<span className="text-lg ml-1">min</span></p>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-400">Overall Completion</span>
                        <span className="text-lg font-bold text-white">{cadence.completion_rate.toFixed(1)}%</span>
                      </div>
                      <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${cadence.completion_rate}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-5 bg-green-500/10 rounded-xl border border-green-500/30 hover:bg-green-500/15 transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <p className="text-xs font-semibold uppercase tracking-wider text-green-400/70">Completed</p>
                        </div>
                        <p className="text-4xl font-black text-green-400">{cadence.completed}</p>
                      </div>
                      <div className="p-5 bg-red-500/10 rounded-xl border border-red-500/30 hover:bg-red-500/15 transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <p className="text-xs font-semibold uppercase tracking-wider text-red-400/70">Missed</p>
                        </div>
                        <p className="text-4xl font-black text-red-400">{cadence.missed}</p>
                      </div>
                      <div className="p-5 bg-blue-500/10 rounded-xl border border-blue-500/30 hover:bg-blue-500/15 transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          <p className="text-xs font-semibold uppercase tracking-wider text-blue-400/70">Success Rate</p>
                        </div>
                        <p className="text-4xl font-black text-blue-400">{cadence.completion_rate.toFixed(0)}%</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 bg-[#1a1a1a] rounded-2xl border border-gray-700 text-center">
                  <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-400 text-lg">No cadence details available</p>
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
                    // Strip markdown code fences if present
                    let cleanedText = aiContent.trim();
                    if (cleanedText.startsWith('```')) {
                      cleanedText = cleanedText.replace(/^```(?:json)?\n?/, '');
                      cleanedText = cleanedText.replace(/\n?```$/, '');
                    }
                    aiContent = JSON.parse(cleanedText.trim());
                  } catch (e) {
                    console.error('Failed to parse AI content:', e);
                    return null;
                  }
                }
                
                return aiContent?.insights && aiContent.insights.length > 0 ? (
                <>
                  <div className="space-y-5">
                    {aiContent.insights.map((insight, idx) => {
                      const severityConfig = {
                        high: { 
                          color: 'from-red-900/20 to-red-950/30', 
                          border: 'border-red-700/40',
                          badge: 'bg-red-500/20 text-red-400 border-red-500/30',
                          icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                        },
                        medium: { 
                          color: 'from-yellow-900/20 to-yellow-950/30', 
                          border: 'border-yellow-700/40',
                          badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
                          icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                        },
                        low: { 
                          color: 'from-green-900/20 to-green-950/30', 
                          border: 'border-green-700/40',
                          badge: 'bg-green-500/20 text-green-400 border-green-500/30',
                          icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                        }
                      };
                      const config = severityConfig[insight.severity as keyof typeof severityConfig] || severityConfig.low;

                      return (
                        <div key={idx} className={`group relative p-6 bg-gradient-to-br ${config.color} rounded-2xl border ${config.border} hover:border-opacity-60 transition-all`}>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="p-3 bg-white/5 rounded-xl">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-xl text-white mb-2">{insight.title}</h4>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full mb-3">
                                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">{insight.category}</span>
                                </div>
                              </div>
                            </div>
                            {insight.severity && (
                              <Badge className={`${config.badge} border text-sm px-3 py-1`}>
                                {insight.severity.toUpperCase()}
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-200 leading-relaxed text-base pl-[4.5rem]">{insight.description}</p>
                        </div>
                      );
                    })}
                  </div>

                  {aiContent.recommendations && aiContent.recommendations.length > 0 && (
                    <div className="mt-8">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                          <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold">Recommendations</h3>
                      </div>
                      <div className="relative p-8 bg-gradient-to-br from-emerald-900/10 to-emerald-950/20 rounded-2xl border border-emerald-700/30">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-400 rounded-t-2xl"></div>
                        <ul className="space-y-4">
                          {aiContent.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-4 group hover:translate-x-1 transition-transform">
                              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center mt-0.5">
                                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <span className="text-gray-200 text-base leading-relaxed flex-1">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </>
                ) : (
                  <div className="p-12 bg-[#1a1a1a] rounded-2xl border border-gray-700 text-center">
                    <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className="text-gray-400 text-lg">No insights available yet</p>
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

