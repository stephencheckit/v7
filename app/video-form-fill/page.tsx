"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Video, CheckCircle2, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Form {
  id: string;
  title: string;
  description: string;
  schema: {
    fields: Array<{
      id: string;
      label: string;
      type: string;
      options?: string[];
    }>;
  };
}

export default function VideoFormFillPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);

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

  const handleSelectForm = (form: Form) => {
    // Navigate to the public form page with video AI
    router.push(`/f/${form.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#000000] to-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#c4dfc4] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000000] to-[#0a0a0a] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">🎥 Fill Forms with AI Vision</h1>
          <p className="text-gray-400">
            Select a form to fill it using your camera and AI vision analysis
          </p>
        </div>

        {forms.length === 0 ? (
          <Card className="p-8 bg-[#1a1a1a] border-border/50 text-center">
            <p className="text-gray-400 mb-4">No forms found. Create a form first!</p>
            <Button
              onClick={() => router.push('/forms/builder')}
              className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a]"
            >
              Create Form
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {forms.map((form) => {
              const fieldCount = form.schema?.fields?.length || 0;
              return (
                <Card 
                  key={form.id} 
                  className="p-6 bg-[#1a1a1a] border-border/50 hover:border-[#c4dfc4]/50 transition-all cursor-pointer group"
                  onClick={() => handleSelectForm(form)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-[#c4dfc4] transition-colors">
                        {form.title}
                      </h3>
                      {form.description && (
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {form.description}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-[#c4dfc4] transition-colors" />
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Badge variant="outline" className="text-gray-400 border-gray-600">
                      {fieldCount} questions
                    </Badge>
                    <Badge variant="outline" className="text-[#c4dfc4] border-[#c4dfc4]/30">
                      <Video className="w-3 h-3 mr-1" />
                      AI Vision Ready
                    </Badge>
                  </div>
                  
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectForm(form);
                    }}
                    className="w-full mt-4 bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a] font-semibold"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Fill with AI Vision
                  </Button>
                </Card>
              );
            })}
          </div>
        )}

        {/* Test Form Option */}
        <div className="mt-8 p-6 bg-[#1a1a1a] border border-dashed border-gray-600 rounded-lg text-center">
          <p className="text-gray-400 mb-4">Want to test first?</p>
          <Button
            onClick={() => router.push('/test-video-ai')}
            variant="outline"
            className="border-[#c4dfc4] text-[#c4dfc4] hover:bg-[#c4dfc4]/10"
          >
            Try Demo Test Page
          </Button>
        </div>
      </div>
    </div>
  );
}

