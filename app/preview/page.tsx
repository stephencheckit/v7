"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Type,
  AlignLeft,
  Mail,
  Phone,
  Calendar,
  Image as ImageIcon,
  List,
  CheckSquare,
  Hash,
  Upload,
  Circle,
  ThumbsUp,
  Layers,
} from "lucide-react";

interface FormField {
  id: string;
  type: string;
  name: string;
  label: string;
  placeholder: string;
  required: boolean;
  color: string;
  icon: any;
  description?: string;
  options?: string[];
  multiSelect?: boolean;
  dateRange?: boolean;
}

interface FormData {
  name: string;
  description: string;
  fields: FormField[];
  submitButtonText: string;
}

export default function PreviewPage() {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  useEffect(() => {
    // Load form data from localStorage
    const savedForm = localStorage.getItem("formPreviewData");
    if (savedForm) {
      setFormData(JSON.parse(savedForm));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formValues);
    alert("Form submitted! Check console for values.");
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#000000] to-[#0a0a0a]">
        <p className="text-gray-400">Loading form preview...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000000] to-[#0a0a0a] py-12">
      <Card className="max-w-3xl mx-auto p-12 bg-[#1a1a1a] border-border/50 shadow-xl">
        {/* Form Header */}
        <div className="mb-10 pb-8 border-b border-border/50 bg-gradient-to-br from-[#1a1a1a] to-[#151515] -mx-12 -mt-12 px-12 pt-12 rounded-t-lg">
          <h1 className="text-4xl font-bold text-gray-100 mb-3">
            {formData.name}
          </h1>
          {formData.description && (
            <p className="text-lg text-muted-foreground">
              {formData.description}
            </p>
          )}
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {formData.fields.map((field) => {
            // Skip group headers in basic preview for now, or render them differently
            if (field.type === "group") {
              return (
                <div
                  key={field.id}
                  className="py-4 px-4 rounded-lg border-l-4 mb-6 mt-8"
                  style={{ 
                    borderLeftColor: field.color,
                    backgroundColor: `${field.color}40`
                  }}
                >
                  <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                    <Layers className="h-6 w-6" style={{ color: field.color }} />
                    {field.label.toUpperCase()}
                  </h2>
                  {field.description && (
                    <p className="text-sm text-white/80 mt-1">{field.description}</p>
                  )}
                </div>
              );
            }

            return (
              <div key={field.id} className="space-y-2">
                <label className="block text-base font-medium text-gray-100">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.description && (
                  <p className="text-sm text-muted-foreground mb-2">{field.description}</p>
                )}
                
                {/* Render different input types */}
                {field.type === "textarea" ? (
                  <textarea
                    placeholder={field.placeholder}
                    required={field.required}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full min-h-[120px] rounded-lg border border-border bg-background px-4 py-3 text-base text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#c4dfc4]/50 focus:border-transparent"
                  />
                ) : field.type === "dropdown" ? (
                  <select
                    required={field.required}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-base text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#c4dfc4]/50 focus:border-transparent"
                  >
                    <option value="">Select an option...</option>
                    {field.options?.map((option, idx) => (
                      <option key={idx} value={option}>{option}</option>
                    ))}
                  </select>
                ) : field.type === "checkbox" ? (
                  <div className="space-y-2">
                    {field.options?.map((option, idx) => (
                      <label key={idx} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type={field.multiSelect ? "checkbox" : "radio"}
                          name={field.id}
                          value={option}
                          onChange={(e) => {
                            if (field.multiSelect) {
                              const current = formValues[field.id] || [];
                              if (e.target.checked) {
                                handleInputChange(field.id, [...current, option]);
                              } else {
                                handleInputChange(field.id, current.filter((v: string) => v !== option));
                              }
                            } else {
                              handleInputChange(field.id, option);
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-[#c4dfc4] focus:ring-[#c4dfc4]"
                        />
                        <span className="text-base text-gray-100">{option}</span>
                      </label>
                    ))}
                  </div>
                ) : field.type === "radio" ? (
                  <div className="space-y-2">
                    {field.options?.map((option, idx) => (
                      <label key={idx} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={field.id}
                          value={option}
                          required={field.required}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className="h-4 w-4 border-gray-300 text-[#c4dfc4] focus:ring-[#c4dfc4]"
                        />
                        <span className="text-base text-gray-100">{option}</span>
                      </label>
                    ))}
                  </div>
                ) : field.type === "thumbs" ? (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={field.id}
                        value="thumbs-up"
                        required={field.required}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className="h-4 w-4 border-gray-300 text-[#c4dfc4] focus:ring-[#c4dfc4]"
                      />
                      <span className="text-base text-gray-100">👍 Thumbs Up</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={field.id}
                        value="thumbs-down"
                        required={field.required}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className="h-4 w-4 border-gray-300 text-[#c4dfc4] focus:ring-[#c4dfc4]"
                      />
                      <span className="text-base text-gray-100">👎 Thumbs Down</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={field.id}
                        value="na"
                        required={field.required}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className="h-4 w-4 border-gray-300 text-[#c4dfc4] focus:ring-[#c4dfc4]"
                      />
                      <span className="text-base text-muted-foreground">N/A</span>
                    </label>
                  </div>
                ) : field.type === "date" ? (
                  <div className="flex gap-3">
                    <Input
                      type="date"
                      required={field.required}
                      onChange={(e) => handleInputChange(field.id + "_start", e.target.value)}
                      className="flex-1 px-4 py-3 text-base bg-background text-gray-100 border-border"
                    />
                    {field.dateRange && (
                      <>
                        <span className="self-center text-muted-foreground">to</span>
                        <Input
                          type="date"
                          required={field.required}
                          onChange={(e) => handleInputChange(field.id + "_end", e.target.value)}
                          className="flex-1 px-4 py-3 text-base bg-background text-gray-100 border-border"
                        />
                      </>
                    )}
                  </div>
                ) : field.type === "file" || field.type === "image" ? (
                  <Input
                    type="file"
                    accept={field.type === "image" ? "image/*" : undefined}
                    required={field.required}
                    onChange={(e) => handleInputChange(field.id, e.target.files?.[0])}
                    className="px-4 py-3 text-base bg-background text-gray-100 border-border"
                  />
                ) : (
                  <Input
                    type={field.type === "email" ? "email" : field.type === "number" ? "number" : field.type === "phone" ? "tel" : "text"}
                    placeholder={field.placeholder}
                    required={field.required}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="px-4 py-3 text-base bg-background text-gray-100 placeholder:text-gray-500 border-border"
                  />
                )}
              </div>
            );
          })}

          {/* Submit Button */}
          <div className="pt-6">
            <Button
              type="submit"
              className="w-full bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a] font-semibold py-4 text-lg rounded-lg transition-colors"
            >
              {formData.submitButtonText}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

