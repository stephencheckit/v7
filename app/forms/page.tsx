"use client";

import { useState, useEffect } from "react";
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
import { Plus, Eye, Calendar, FileText, BarChart3, Share2, Loader2, Copy, ExternalLink, X, CheckCircle2, ArrowUpDown, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormCreationModal } from "@/components/form-creation-modal";
import { FormsListSkeleton } from "@/components/loading";
import { toast } from "sonner";

interface SimpleForm {
  id: string;
  title: string;
  description: string;
  schema: any;
  status: 'draft' | 'published';
  created_at: string;
  simple_form_stats: Array<{
    total_submissions: number;
    last_submission_at: string | null;
  }>;
}

type SortColumn = 'name' | 'questions' | 'responses' | 'status' | 'created';
type SortDirection = 'asc' | 'desc';

export default function FormsPage() {
  const router = useRouter();
  const [forms, setForms] = useState<SimpleForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFormUrl, setSelectedFormUrl] = useState<string>("");
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [sortColumn, setSortColumn] = useState<SortColumn>('created');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Load sort preferences from localStorage
  useEffect(() => {
    const savedColumn = localStorage.getItem('forms-sort-column');
    const savedDirection = localStorage.getItem('forms-sort-direction');

    if (savedColumn) {
      setSortColumn(savedColumn as SortColumn);
    }
    if (savedDirection) {
      setSortDirection(savedDirection as SortDirection);
    }
  }, []);

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
    setShowCreationModal(true);
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

  const handleDeleteClick = (formId: string) => {
    setSelectedFormId(formId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFormId) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/forms/${selectedFormId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the form from the list
        setForms(forms.filter(f => f.id !== selectedFormId));
        setShowDeleteModal(false);
        setSelectedFormId(null);
        toast.success('Form deleted successfully', {
          description: 'The form and all its submissions have been removed.',
        });
      } else {
        const error = await response.json();
        toast.error('Failed to delete form', {
          description: error.error || 'Unknown error occurred',
        });
      }
    } catch (error) {
      console.error('Failed to delete form:', error);
      toast.error('Failed to delete form', {
        description: 'Please try again or contact support.',
      });
    } finally {
      setDeleting(false);
    }
  };

  const copyShareUrl = () => {
    if (selectedFormUrl) {
      navigator.clipboard.writeText(selectedFormUrl);
      toast.success('Link copied to clipboard!', {
        description: 'Share this link to collect form responses.',
      });
    }
  };

  const handleSort = (column: SortColumn) => {
    let newDirection: SortDirection;

    if (sortColumn === column) {
      // Toggle direction if clicking the same column
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new column and default to ascending
      newDirection = 'asc';
    }

    setSortColumn(column);
    setSortDirection(newDirection);

    // Save to localStorage
    localStorage.setItem('forms-sort-column', column);
    localStorage.setItem('forms-sort-direction', newDirection);
  };

  const getSortedForms = () => {
    const sorted = [...forms].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortColumn) {
        case 'name':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'questions':
          aValue = a.schema?.fields?.length || 0;
          bValue = b.schema?.fields?.length || 0;
          break;
        case 'responses':
          aValue = a.simple_form_stats?.[0]?.total_submissions || 0;
          bValue = b.simple_form_stats?.[0]?.total_submissions || 0;
          break;
        case 'status':
          aValue = a.status || 'draft';
          bValue = b.status || 'draft';
          break;
        case 'created':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  const sortedForms = getSortedForms();

  const totalResponses = forms.reduce((sum, form) => {
    const stats = form.simple_form_stats?.[0];
    return sum + (stats?.total_submissions || 0);
  }, 0);

  const avgQuestions = forms.length > 0
    ? Math.round(forms.reduce((sum, form) => sum + (form.schema?.fields?.length || 0), 0) / forms.length)
    : 0;

  if (loading) {
    return <FormsListSkeleton />;
  }

  return (
    <>
      <div className="w-full h-full overflow-auto">
        <div className="p-4 md:p-8">
          <div className="mx-auto max-w-[1600px] space-y-6 md:space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-2 md:gap-3">
                    <FileText className="h-6 w-6 md:h-10 md:w-10 text-[#c4dfc4]" />
                    Forms
                  </h1>
                  <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
                    Manage and create inspection checklists and forms
                  </p>
                </div>
                <Button
                  onClick={handleCreateNew}
                  size="sm"
                  className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a] shrink-0"
                >
                  <Plus className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Create New</span>
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4">
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
              <div className="p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold mb-4 text-white">All Forms</h2>
                <div className="overflow-x-auto -mx-4 md:mx-0 scrollbar-thin">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow className="border-gray-700 hover:bg-transparent">
                        <TableHead className="text-gray-400 min-w-[200px]">
                          <button
                            onClick={() => handleSort('name')}
                            className="flex items-center gap-1 hover:text-white transition-colors"
                          >
                            Form Name
                            {sortColumn === 'name' ? (
                              sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-30" />
                            )}
                          </button>
                        </TableHead>
                        <TableHead className="text-gray-400 hidden lg:table-cell">
                          <button
                            onClick={() => handleSort('questions')}
                            className="flex items-center gap-1 hover:text-white transition-colors"
                          >
                            Questions
                            {sortColumn === 'questions' ? (
                              sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-30" />
                            )}
                          </button>
                        </TableHead>
                        <TableHead className="text-gray-400 hidden md:table-cell">
                          <button
                            onClick={() => handleSort('responses')}
                            className="flex items-center gap-1 hover:text-white transition-colors"
                          >
                            Responses
                            {sortColumn === 'responses' ? (
                              sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-30" />
                            )}
                          </button>
                        </TableHead>
                        <TableHead className="text-gray-400">
                          <button
                            onClick={() => handleSort('status')}
                            className="flex items-center gap-1 hover:text-white transition-colors"
                          >
                            Status
                            {sortColumn === 'status' ? (
                              sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-30" />
                            )}
                          </button>
                        </TableHead>
                        <TableHead className="text-gray-400 hidden lg:table-cell">
                          <button
                            onClick={() => handleSort('created')}
                            className="flex items-center gap-1 hover:text-white transition-colors"
                          >
                            Created
                            {sortColumn === 'created' ? (
                              sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-30" />
                            )}
                          </button>
                        </TableHead>
                        <TableHead className="text-right text-gray-400 min-w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedForms.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12 text-gray-400">
                            No forms yet. Create your first form to get started!
                          </TableCell>
                        </TableRow>
                      ) : (
                        sortedForms.map((form) => {
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
                              <TableCell className="font-medium text-white whitespace-normal md:whitespace-nowrap">
                                <div>
                                  <div className="text-sm md:text-base">{form.title}</div>
                                  {form.description && (
                                    <div className="text-xs text-gray-400 mt-1 line-clamp-1">{form.description}</div>
                                  )}
                                  {/* Mobile-only: show questions and responses inline */}
                                  <div className="flex gap-3 mt-2 lg:hidden text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                      <FileText className="h-3 w-3" />
                                      {fieldCount} Q
                                    </span>
                                    <span className="md:hidden">{responseCount} responses</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-300 hidden lg:table-cell">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-gray-400" />
                                  {fieldCount}
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-300 hidden md:table-cell">
                                {responseCount.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-gray-300">
                                <Badge
                                  variant={form.status === 'published' ? 'default' : 'secondary'}
                                  className={form.status === 'published'
                                    ? 'bg-[#c4dfc4]/20 text-[#c4dfc4] border-[#c4dfc4]/30 text-xs'
                                    : 'bg-gray-700/50 text-gray-400 border-gray-600/50 text-xs'
                                  }
                                >
                                  {form.status === 'published' ? 'Published' : 'Draft'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-300 hidden lg:table-cell">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  {createdDate}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1 md:gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleShare(form.id);
                                    }}
                                    className="text-[#c4dfc4] hover:text-[#c4dfc4] hover:bg-[#c4dfc4]/10 px-2 md:px-3"
                                  >
                                    <Share2 className="h-4 w-4 md:mr-1" />
                                    <span className="hidden md:inline">Share</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleReport(form.id);
                                    }}
                                    className="text-[#c8e0f5] hover:text-[#c8e0f5] hover:bg-[#c8e0f5]/10 px-2 md:px-3"
                                  >
                                    <BarChart3 className="h-4 w-4 md:mr-1" />
                                    <span className="hidden md:inline">Report</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteClick(form.id);
                                    }}
                                    className="text-red-400 hover:text-red-400 hover:bg-red-400/10 px-2 md:px-3"
                                  >
                                    <Trash2 className="h-4 w-4 md:mr-1" />
                                    <span className="hidden md:inline">Delete</span>
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
              </div>
            </Card>
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
                  value={selectedFormUrl || ''}
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

      {/* Form Creation Modal */}
      <FormCreationModal
        isOpen={showCreationModal}
        onClose={() => setShowCreationModal(false)}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !deleting && setShowDeleteModal(false)}>
          <Card className="bg-[#1a1a1a] border-red-400/30 p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Delete Form</h2>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete this form? This action cannot be undone and will also delete all submissions.
              </p>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
