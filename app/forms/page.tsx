"use client";

import { useState } from "react";
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
import { Plus, Eye, Calendar, Users, FileText, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";

// Mock data for forms
const mockForms = [
  {
    id: "1",
    name: "Kitchen Daily Inspection",
    questions: 12,
    lastUsed: "2 hours ago",
    responses: 847,
    types: ["Yes/No", "Temperature", "Multiple Choice"],
    createdBy: "Sarah M.",
    schedule: "Daily - AM/PM",
    status: "Active",
  },
  {
    id: "2",
    name: "Food Temperature Log",
    questions: 8,
    lastUsed: "5 hours ago",
    responses: 1234,
    types: ["Number", "Text", "Date/Time"],
    createdBy: "John D.",
    schedule: "Every 4 hours",
    status: "Active",
  },
  {
    id: "3",
    name: "Dining Room Checklist",
    questions: 15,
    lastUsed: "1 day ago",
    responses: 523,
    types: ["Yes/No", "Text", "File Upload"],
    createdBy: "Maria G.",
    schedule: "Daily - PM",
    status: "Active",
  },
  {
    id: "4",
    name: "Storage Area Audit",
    questions: 10,
    lastUsed: "3 days ago",
    responses: 156,
    types: ["Multiple Choice", "Yes/No", "Text"],
    createdBy: "David L.",
    schedule: "Weekly",
    status: "Draft",
  },
  {
    id: "5",
    name: "Equipment Maintenance",
    questions: 18,
    lastUsed: "1 week ago",
    responses: 89,
    types: ["Yes/No", "Date", "File Upload"],
    createdBy: "Sarah M.",
    schedule: "Monthly",
    status: "Active",
  },
];

export default function FormsPage() {
  const router = useRouter();
  const [forms] = useState(mockForms);

  const handleCreateNew = () => {
    router.push("/forms/builder");
  };

  const handleViewForm = (formId: string) => {
    router.push(`/forms/builder?id=${formId}`);
  };

  return (
    <AppLayout>
      <div className="w-full h-full overflow-auto">
        <div className="p-8">
          <div className="mx-auto max-w-[1600px] space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-4xl font-bold tracking-tight text-white">
                  Forms
                </h1>
                <Button
                  onClick={handleCreateNew}
                  size="sm"
                  variant="outline"
                  className="text-white hover:bg-gradient-to-r hover:from-[#c4dfc4] hover:to-[#c8e0f5] hover:text-[#0a0a0a] border-white hover:border-[#c8e0f5] transition-all"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New
                </Button>
              </div>
              <p className="text-muted-foreground">
                Manage and create inspection checklists and forms
              </p>
            </div>

            {/* Stats Cards */}
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
                      {forms.reduce((sum, form) => sum + form.responses, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-[#f5edc8] to-[#f5edc8]/80 border-0 p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-[#0a0a0a]" />
                  <div>
                    <p className="text-sm text-[#0a0a0a]/70">Active Forms</p>
                    <p className="text-2xl font-bold text-[#0a0a0a]">
                      {forms.filter(f => f.status === "Active").length}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-[#ddc8f5] to-[#ddc8f5]/80 border-0 p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-[#0a0a0a]" />
                  <div>
                    <p className="text-sm text-[#0a0a0a]/70">Avg Questions</p>
                    <p className="text-2xl font-bold text-[#0a0a0a]">
                      {Math.round(forms.reduce((sum, form) => sum + form.questions, 0) / forms.length)}
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
                      <TableHead className="text-gray-400">Field Types</TableHead>
                      <TableHead className="text-gray-400">Schedule</TableHead>
                      <TableHead className="text-gray-400">Created By</TableHead>
                      <TableHead className="text-gray-400">Last Used</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-right text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {forms.map((form) => (
                      <TableRow 
                        key={form.id} 
                        className="border-gray-700 hover:bg-gray-800/50 cursor-pointer"
                        onClick={() => handleViewForm(form.id)}
                      >
                        <TableCell className="font-medium text-white">{form.name}</TableCell>
                        <TableCell className="text-gray-300">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            {form.questions}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {form.responses.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {form.types.slice(0, 2).map((type, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs bg-gray-800 text-gray-300 border-gray-600"
                              >
                                {type}
                              </Badge>
                            ))}
                            {form.types.length > 2 && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-gray-800 text-gray-300 border-gray-600"
                              >
                                +{form.types.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {form.schedule}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">{form.createdBy}</TableCell>
                        <TableCell className="text-gray-300">{form.lastUsed}</TableCell>
                        <TableCell>
                          <Badge
                            variant={form.status === "Active" ? "default" : "secondary"}
                            className={
                              form.status === "Active"
                                ? "bg-[#c4dfc4] text-[#0a0a0a]"
                                : "bg-gray-700 text-gray-300"
                            }
                          >
                            {form.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewForm(form.id);
                            }}
                            className="text-[#c4dfc4] hover:text-[#c4dfc4] hover:bg-[#c4dfc4]/10"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

