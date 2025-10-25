"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SignatureDisplay } from "@/components/signature-display";
import { Loader2, ArrowLeft, Download, Calendar, Users, Shield, ChevronDown, ChevronUp } from "lucide-react";

interface FieldStat {
  fieldId: string;
  label: string;
  type: string;
  totalResponses: number;
  responseCounts: Record<string, number>;
  allResponses: any[];
}

interface ReportData {
  form: {
    id: string;
    title: string;
    description: string;
    created_at: string;
  };
  stats: {
    total: number;
    lastSubmission: string | null;
  };
  submissions: any[];
  fieldStats: FieldStat[];
}

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadReport();
  }, [formId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/forms/${formId}/report`);
      
      if (!response.ok) {
        throw new Error('Failed to load report');
      }

      const data = await response.json();
      setReport(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleSubmissionExpanded = (submissionId: string) => {
    const newExpanded = new Set(expandedSubmissions);
    if (newExpanded.has(submissionId)) {
      newExpanded.delete(submissionId);
    } else {
      newExpanded.add(submissionId);
    }
    setExpandedSubmissions(newExpanded);
  };

  // Count submissions with signatures
  const signedSubmissionsCount = report?.submissions.filter(
    (s: any) => s.signatures && s.signatures.length > 0
  ).length || 0;

  if (loading) {
    return (
      
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-[#c4dfc4] animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading report...</p>
          </div>
        </div>
      
    );
  }

  if (error || !report) {
    return (
      
        <div className="flex items-center justify-center min-h-screen">
          <Card className="bg-[#1a1a1a] border-red-500/30 p-8 max-w-md text-center">
            <h1 className="text-xl font-bold text-white mb-2">Error</h1>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button onClick={() => router.back()} variant="outline">
              Go Back
            </Button>
          </Card>
        </div>
      
    );
  }

  return (
    
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/forms')}
            className="mb-4 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forms
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{report.form.title}</h1>
              {report.form.description && (
                <p className="text-gray-400">{report.form.description}</p>
              )}
            </div>
            <Button className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a]">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-[#c4dfc4]/20 to-transparent border-[#c4dfc4]/30 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-[#c4dfc4]" />
              <h3 className="text-sm font-medium text-gray-400">Total Submissions</h3>
            </div>
            <p className="text-4xl font-bold text-white">{report.stats.total}</p>
          </Card>

          <Card className="bg-gradient-to-br from-[#ddc8f5]/20 to-transparent border-[#ddc8f5]/30 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-6 h-6 text-[#ddc8f5]" />
              <h3 className="text-sm font-medium text-gray-400">Signed Submissions</h3>
            </div>
            <p className="text-4xl font-bold text-white">{signedSubmissionsCount}</p>
            {signedSubmissionsCount > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {((signedSubmissionsCount / report.stats.total) * 100).toFixed(0)}% of total
              </p>
            )}
          </Card>

          <Card className="bg-gradient-to-br from-[#c8e0f5]/20 to-transparent border-[#c8e0f5]/30 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 text-[#c8e0f5]" />
              <h3 className="text-sm font-medium text-gray-400">Last Submission</h3>
            </div>
            <p className="text-lg font-semibold text-white">{formatDate(report.stats.lastSubmission)}</p>
          </Card>

          <Card className="bg-gradient-to-br from-[#e0c8f5]/20 to-transparent border-[#e0c8f5]/30 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 text-[#e0c8f5]" />
              <h3 className="text-sm font-medium text-gray-400">Created</h3>
            </div>
            <p className="text-lg font-semibold text-white">{formatDate(report.form.created_at)}</p>
          </Card>
        </div>

        {/* Field Statistics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Field Statistics</h2>
          <div className="space-y-4">
            {report.fieldStats.map((fieldStat) => (
              <Card key={fieldStat.fieldId} className="bg-[#1a1a1a] border-white/10 p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">{fieldStat.label}</h3>
                    <Badge variant="outline" className="text-gray-400">
                      {fieldStat.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">
                    {fieldStat.totalResponses} of {report.stats.total} responses
                  </p>
                </div>

                {/* Response Breakdown */}
                {Object.keys(fieldStat.responseCounts).length > 0 && (
                  <div className="space-y-2">
                    {Object.entries(fieldStat.responseCounts).map(([value, count]) => {
                      const percentage = ((count / report.stats.total) * 100).toFixed(1);
                      return (
                        <div key={value} className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-300">{value}</span>
                              <span className="text-sm text-gray-400">{count} ({percentage}%)</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#c4dfc4] rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Raw Submissions Table */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">All Submissions</h2>
          <Card className="bg-[#1a1a1a] border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Submitted At
                    </th>
                    {report.fieldStats.slice(0, 5).map((field) => (
                      <th key={field.fieldId} className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {field.label}
                      </th>
                    ))}
                    {report.fieldStats.length > 5 && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        + {report.fieldStats.length - 5} more
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {report.submissions.length === 0 ? (
                    <tr>
                      <td colSpan={report.fieldStats.length + 1} className="px-6 py-8 text-center text-gray-400">
                        No submissions yet
                      </td>
                    </tr>
                  ) : (
                    report.submissions.map((submission) => (
                      <tr key={submission.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {new Date(submission.submitted_at).toLocaleString()}
                        </td>
                        {report.fieldStats.slice(0, 5).map((field) => {
                          const value = submission.data[field.fieldId] || submission.data[field.label.toLowerCase().replace(/\s+/g, '_')];
                          return (
                            <td key={field.fieldId} className="px-6 py-4 text-sm text-gray-300">
                              {Array.isArray(value) ? value.join(', ') : String(value || '-')}
                            </td>
                          );
                        })}
                        {report.fieldStats.length > 5 && (
                          <td className="px-6 py-4 text-sm text-gray-400">...</td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Detailed Submissions with Signatures */}
        {signedSubmissionsCount > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-4">Signed Submissions</h2>
            <div className="space-y-4">
              {report.submissions
                .filter((s: any) => s.signatures && s.signatures.length > 0)
                .map((submission: any) => {
                  const isExpanded = expandedSubmissions.has(submission.id);
                  return (
                    <Card key={submission.id} className="bg-[#1a1a1a] border-white/10 overflow-hidden">
                      {/* Submission Header */}
                      <div 
                        className="p-4 cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between"
                        onClick={() => toggleSubmissionExpanded(submission.id)}
                      >
                        <div className="flex items-center gap-4">
                          <Shield className="w-5 h-5 text-purple-400" />
                          <div>
                            <div className="text-sm font-medium text-white">
                              {submission.data?.email || 
                               submission.data?.name || 
                               `Submission ${submission.id.toString().slice(0, 8)}`}
                            </div>
                            <div className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                              <span>{new Date(submission.submitted_at).toLocaleString()}</span>
                              <Badge variant="outline" className="text-xs bg-purple-500/10 border-purple-500/30 text-purple-400">
                                {submission.signatures.length} Signature{submission.signatures.length > 1 ? 's' : ''}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="border-t border-white/10 p-6 space-y-6">
                          {/* Signatures */}
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-4">Electronic Signatures</h3>
                            <div className="space-y-4">
                              {submission.signatures.map((signature: any, idx: number) => (
                                <SignatureDisplay 
                                  key={signature.id || idx}
                                  signature={signature}
                                  showDetails={true}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Audit Trail */}
                          {submission.signature_audit && submission.signature_audit.length > 0 && (
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-4">Audit Trail</h3>
                              <Card className="bg-[#0a0a0a] border-border/50 p-4">
                                <div className="space-y-3">
                                  {submission.signature_audit.map((audit: any, idx: number) => (
                                    <div key={idx} className="flex items-start gap-3 p-3 bg-[#1a1a1a] rounded-lg border border-border/30">
                                      <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm font-medium text-white capitalize">
                                            {audit.action.replace(/_/g, ' ')}
                                          </span>
                                          <Badge variant="outline" className="text-xs">
                                            {new Date(audit.timestamp).toLocaleString()}
                                          </Badge>
                                        </div>
                                        <div className="text-xs text-gray-400 space-y-0.5">
                                          {audit.signatureId && (
                                            <div>Signature ID: {audit.signatureId}</div>
                                          )}
                                          {audit.userId && (
                                            <div>User ID: {audit.userId}</div>
                                          )}
                                          {audit.ipAddress && (
                                            <div>IP: {audit.ipAddress}</div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </Card>
                            </div>
                          )}

                          {/* Form Data */}
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-4">Form Responses</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {Object.entries(submission.data || {}).map(([key, value]: [string, any]) => {
                                // Skip signature data objects (they're shown above)
                                if (typeof value === 'object' && value !== null && 'signatureData' in value) {
                                  return null;
                                }
                                
                                return (
                                  <div key={key} className="space-y-1">
                                    <label className="text-xs font-medium text-gray-400 capitalize">
                                      {key.replace(/_/g, ' ')}
                                    </label>
                                    <div className="p-2 rounded bg-[#0a0a0a] border border-border/50 text-sm text-white">
                                      {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    
  );
}


