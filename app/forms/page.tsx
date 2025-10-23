"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Eye, Calendar, FileText, BarChart3, Share2, Loader2, Copy, ExternalLink, X, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface SimpleForm {
  id: string;
  title: string;
  description: string;
  schema: any;
  created_at: string;
  simple_form_stats: Array<{
    total_submissions: number;
    last_submission_at: string | null;
  }>;
}

export default function FormsPage() {
  const router = useRouter();
  const [forms, setForms] = useState<SimpleForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedFormUrl, setSelectedFormUrl] = useState<string>("");

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const response = await fetch('/api/forms');
      if (response.ok) {
        const data = await response.json();
        setForms(data.forms || []);
      }
    } catch (error) {
      console.error('Failed to load forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    router.push("/forms/builder");
  };

  const handleViewForm = (formId: string) => {
    router.push(`/forms/builder?id=${formId}`);
  };

  const handleShare = (formId: string) => {
    const appUrl = window.location.origin;
    const shareUrl = `${appUrl}/f/${formId}`;
    setSelectedFormUrl(shareUrl);
    setShowShareModal(true);
  };

  const handleReport = (formId: string) => {
    router.push(`/forms/${formId}/report`);
  };

  const handleDelete = async (formId: string, formTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${formTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete form');
      }

      alert('Form deleted successfully');
      loadForms(); // Reload the forms list
    } catch (error) {
      console.error('Error deleting form:', error);
      alert('Failed to delete form. Please try again.');
    }
  };

  const copyShareUrl = () => {
    if (selectedFormUrl) {
      navigator.clipboard.writeText(selectedFormUrl);
      alert('Share URL copied to clipboard!');
    }
  };

  const totalResponses = forms.reduce((sum, form) => {
    const stats = form.simple_form_stats?.[0];
    return sum + (stats?.total_submissions || 0);
  }, 0);

  const avgQuestions = forms.length > 0
    ? Math.round(forms.reduce((sum, form) => sum + (form.schema?.fields?.length || 0), 0) / forms.length)
    : 0;

  return (
    <AppLayout>
      <div className="w-full h-full overflow-auto">
        <div className="p-8">
          <div className="mx-auto max-w-[1600px] space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-white">
                    Forms
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Manage and create inspection checklists and forms
                  </p>
                </div>
                <Button
                  onClick={handleCreateNew}
                  size="sm"
                  className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#c4dfc4] animate-spin" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-4">
                  <Card className="bg-gradient-to-br from-[#c4dfc4] to-[#c4dfc4]/80 border-0 p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-[#0a0a0a]" />
                      <div>
                        <p className="text-sm text-[#0a0a0a]/70">Total Forms</p>
                        <p className="text-2xl font-bold text-[#0a0a0a]">{forms.length}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-gradient-to-br from-[#c8e0f5] to-[#c8e0f5]/80 border-0 p-4">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-8 w-8 text-[#0a0a0a]" />
                      <div>
                        <p className="text-sm text-[#0a0a0a]/70">Total Responses</p>
                        <p className="text-2xl font-bold text-[#0a0a0a]">
                          {totalResponses.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-gradient-to-br from-[#f5edc8] to-[#f5edc8]/80 border-0 p-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-8 w-8 text-[#0a0a0a]" />
                      <div>
                        <p className="text-sm text-[#0a0a0a]/70">Forms Created</p>
                        <p className="text-2xl font-bold text-[#0a0a0a]">
                          {forms.length}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-gradient-to-br from-[#ddc8f5] to-[#ddc8f5]/80 border-0 p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-[#0a0a0a]" />
                      <div>
                        <p className="text-sm text-[#0a0a0a]/70">Avg Questions</p>
                        <p className="text-2xl font-bold text-[#0a0a0a]">
                          {avgQuestions}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

            {/* Forms Table */}
            <Card className="shadow-lg border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-white">All Forms</h2>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-transparent">
                      <TableHead className="text-gray-400">Form Name</TableHead>
                      <TableHead className="text-gray-400">Questions</TableHead>
                      <TableHead className="text-gray-400">Responses</TableHead>
                      <TableHead className="text-gray-400">Created</TableHead>
                      <TableHead className="text-right text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {forms.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-gray-400">
                          No forms yet. Create your first form to get started!
                        </TableCell>
                      </TableRow>
                    ) : (
                      forms.map((form) => {
                        const fieldCount = form.schema?.fields?.length || 0;
                        const stats = form.simple_form_stats?.[0];
                        const responseCount = stats?.total_submissions || 0;
                        const createdDate = new Date(form.created_at).toLocaleDateString();

                        return (
                          <TableRow 
                            key={form.id} 
                            className="border-gray-700 hover:bg-gray-800/50 cursor-pointer transition-colors"
                            onClick={() => handleViewForm(form.id)}
                          >
                            <TableCell className="font-medium text-white">
                              <div>
                                <div>{form.title}</div>
                                {form.description && (
                                  <div className="text-xs text-gray-400 mt-1">{form.description}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-300">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-400" />
                                {fieldCount}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {responseCount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-gray-300">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                {createdDate}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShare(form.id);
                                  }}
                                  className="text-[#c4dfc4] hover:text-[#c4dfc4] hover:bg-[#c4dfc4]/10"
                                >
                                  <Share2 className="h-4 w-4 mr-1" />
                                  Share
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReport(form.id);
                                  }}
                                  className="text-[#c8e0f5] hover:text-[#c8e0f5] hover:bg-[#c8e0f5]/10"
                                >
                                  <BarChart3 className="h-4 w-4 mr-1" />
                                  Report
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(form.id, form.title);
                                  }}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && selectedFormUrl && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
          <Card className="bg-[#1a1a1a] border-[#c4dfc4]/30 p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <Share2 className="w-16 h-16 text-[#c4dfc4] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Share Form</h2>
              <p className="text-gray-400 mb-6">Anyone with this link can fill out the form:</p>
              
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={selectedFormUrl}
                  readOnly
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm"
                />
                <Button 
                  onClick={copyShareUrl}
                  className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a]"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => window.open(selectedFormUrl, '_blank')}
                  className="flex-1"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Form
                </Button>
                <Button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a]"
                >
                  Done
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </AppLayout>
  );
}
