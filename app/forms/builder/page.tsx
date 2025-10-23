"use client";

import { useState, useEffect as React_useEffect, Suspense } from "react";
import * as React from "react";
import { AppLayout } from "@/components/app-layout";
import { AIChatPanel } from "@/components/ai-chat-panel";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  Send,
  Sparkles,
  GripVertical,
  Trash2,
  PanelRightClose,
  PanelRightOpen,
  Users,
  Share2,
  Mic,
  FileText,
  Camera,
  Link as LinkIcon,
  Zap,
  Plus,
  Circle,
  Copy,
  ThumbsUp,
  Layers,
  ChevronRight,
  Loader2,
  X,
  CheckCircle2,
} from "lucide-react";
import NextLink from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const widgetTypes = [
  {
    category: "Basic Inputs",
    items: [
      { id: "text", name: "Text Input", icon: Type, description: "Single-line text field", color: "#c4dfc4" },
      { id: "textarea", name: "Text Area", icon: AlignLeft, description: "Multi-line text", color: "#c4dfc4" },
      { id: "email", name: "Email", icon: Mail, description: "Email validation", color: "#c4dfc4" },
      { id: "phone", name: "Phone", icon: Phone, description: "Phone number", color: "#c4dfc4" },
      { id: "number", name: "Number", icon: Hash, description: "Numeric input", color: "#c4dfc4" },
    ],
  },
  {
    category: "Selection",
    items: [
      { id: "dropdown", name: "Dropdown", icon: List, description: "Single select", color: "#c8e0f5" },
      { id: "checkbox", name: "Checkboxes", icon: CheckSquare, description: "Multi-select", color: "#c8e0f5" },
      { id: "radio", name: "Radio Buttons", icon: Circle, description: "Single choice", color: "#c8e0f5" },
      { id: "thumbs", name: "Thumbs Up/Down", icon: ThumbsUp, description: "Thumbs feedback", color: "#c8e0f5" },
    ],
  },
  {
    category: "Advanced",
    items: [
      { id: "date", name: "Date Picker", icon: Calendar, description: "Date selection", color: "#ddc8f5" },
      { id: "file", name: "File Upload", icon: Upload, description: "Upload files", color: "#ddc8f5" },
      { id: "image", name: "Image Upload", icon: ImageIcon, description: "Upload images", color: "#ddc8f5" },
    ],
  },
  {
    category: "MISC",
    items: [
      { id: "group", name: "Group", icon: Layers, description: "Section divider", color: "#f5edc8" },
    ],
  },
];

export interface FormField {
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

function SortableOption({ 
  option, 
  index, 
  onUpdate, 
  onRemove,
  onAddNew,
  fieldId,
  fieldType,
  multiSelect
}: { 
  option: string; 
  index: number; 
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  onAddNew: () => void;
  fieldId: string;
  fieldType: string;
  multiSelect?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${fieldId}-option-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2">
      <button
        className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
      {(fieldType === 'checkbox' || fieldType === 'radio') && (
        <input
          type={fieldType === 'radio' ? "radio" : (multiSelect ? "checkbox" : "radio")}
          className="h-4 w-4 rounded border-gray-300"
          disabled
        />
      )}
      <Input
        value={option}
        onChange={(e) => onUpdate(index, e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onAddNew();
          }
        }}
        className="flex-1 text-sm"
        placeholder={`Option ${index + 1}`}
      />
      <button
        onClick={() => onRemove(index)}
        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function SortableFormField({ field, onRemove, onUpdate, onDuplicate, isOver, questionCount }: { 
  field: FormField; 
  onRemove: (id: string) => void; 
  onUpdate: (id: string, updates: Partial<FormField>) => void;
  onDuplicate: (id: string) => void;
  isOver?: boolean;
  questionCount?: number;
}) {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [showDescription, setShowDescription] = useState(!!field.description);
  const labelInputRef = React.useRef<HTMLInputElement>(null);
  const descriptionInputRef = React.useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  React_useEffect(() => {
    if (isEditingLabel && labelInputRef.current) {
      labelInputRef.current.focus();
    }
  }, [isEditingLabel]);

  React_useEffect(() => {
    if (showDescription && !field.description) {
      setIsEditingDescription(true);
    }
  }, [showDescription]);

  React_useEffect(() => {
    if (isEditingDescription && descriptionInputRef.current) {
      descriptionInputRef.current.focus();
    }
  }, [isEditingDescription]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative p-4 rounded-lg hover:bg-muted/50 border-2 transition-all bg-card/30 ${
        isOver ? 'border-t-4 border-t-[#c4dfc4] pt-8' : 'border-transparent hover:border-opacity-50'
      }`}
      onMouseEnter={(e) => {
        if (!isOver) {
          e.currentTarget.style.borderColor = field.color;
        }
      }}
      onMouseLeave={(e) => {
        if (!isOver) {
          e.currentTarget.style.borderColor = 'transparent';
        }
      }}
    >
      <div className="flex items-start gap-3">
        <button
          className="cursor-grab active:cursor-grabbing mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="flex-1 space-y-3">
          {field.type !== "group" && (
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-1">
                {isEditingLabel ? (
                  <Input
                    ref={labelInputRef}
                    value={field.label || ''}
                    onChange={(e) => onUpdate(field.id, { label: e.target.value })}
                    onBlur={() => setIsEditingLabel(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setIsEditingLabel(false);
                      }
                    }}
                    className="flex-1 font-medium text-sm border-none px-0 py-0 h-auto focus-visible:ring-0 bg-transparent"
                    placeholder="Field label"
                  />
                ) : (
                  <div
                    onClick={() => setIsEditingLabel(true)}
                    className="flex-1 font-medium text-sm cursor-text px-0 py-0 h-auto"
                  >
                    {field.label || "Field label"}
                  </div>
                )}
                {field.required && <span className="text-red-500 font-medium">*</span>}
              </div>
              <label className="flex items-center gap-2 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => onUpdate(field.id, { required: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-[#c4dfc4] focus:ring-[#c4dfc4]"
                />
                <span className="text-xs text-muted-foreground">Required</span>
              </label>
            </div>
          )}
          
          {/* Description - Only for non-group fields */}
          {field.type !== "group" && (
            <>
              {showDescription || field.description ? (
                <div className="flex items-center gap-2">
                  {isEditingDescription ? (
                    <Input
                      ref={descriptionInputRef}
                      value={field.description || ''}
                      onChange={(e) => onUpdate(field.id, { description: e.target.value })}
                      onBlur={() => {
                        setIsEditingDescription(false);
                        if (!field.description) {
                          setShowDescription(false);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setIsEditingDescription(false);
                        }
                      }}
                      className="flex-1 text-xs border-none px-0 py-0 h-auto focus-visible:ring-0 bg-transparent text-muted-foreground italic"
                      placeholder="Add description..."
                    />
                  ) : (
                    <div
                      onClick={() => setIsEditingDescription(true)}
                      className="flex-1 text-xs cursor-text px-0 py-0 h-auto text-muted-foreground italic"
                    >
                      {field.description || "Add description..."}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      onUpdate(field.id, { description: '' });
                      setShowDescription(false);
                      setIsEditingDescription(false);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground hover:text-destructive"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDescription(true)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
                >
                  <Plus className="h-3 w-3" />
                  Add description
                </button>
              )}
            </>
          )}
          
          {/* Field Input */}
          {field.type === "group" ? (
            <div 
              className="w-full px-4 py-3 rounded-lg border-l-4 font-semibold text-base"
              style={{ 
                backgroundColor: `${field.color}40`,
                borderLeftColor: field.color,
                color: '#0a0a0a'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <Layers className="h-5 w-5" style={{ color: field.color }} />
                  {isEditingLabel ? (
                    <Input
                      ref={labelInputRef}
                      value={field.label || ''}
                      onChange={(e) => onUpdate(field.id, { label: e.target.value })}
                      onBlur={() => setIsEditingLabel(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setIsEditingLabel(false);
                        }
                      }}
                      className="font-semibold text-base border-none px-0 py-0 h-auto focus-visible:ring-0 bg-transparent text-[#0a0a0a] uppercase"
                      placeholder="Group name"
                    />
                  ) : (
                    <span 
                      onClick={() => setIsEditingLabel(true)}
                      className="cursor-text"
                    >
                      {field.label.toUpperCase()}
                    </span>
                  )}
                </div>
                {questionCount !== undefined && (
                  <Badge 
                    variant="secondary" 
                    className="font-normal text-xs"
                    style={{ 
                      backgroundColor: `${field.color}80`,
                      color: '#0a0a0a',
                      borderColor: field.color
                    }}
                  >
                    {questionCount} {questionCount === 1 ? 'question' : 'questions'}
                  </Badge>
                )}
              </div>
              
              {/* Group Description */}
              {showDescription || field.description ? (
                <div className="flex items-center gap-2 mt-2">
                  {isEditingDescription ? (
                    <Input
                      ref={descriptionInputRef}
                      value={field.description || ''}
                      onChange={(e) => onUpdate(field.id, { description: e.target.value })}
                      onBlur={() => {
                        setIsEditingDescription(false);
                        if (!field.description) {
                          setShowDescription(false);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setIsEditingDescription(false);
                        }
                      }}
                      className="flex-1 text-xs border-none px-0 py-0 h-auto focus-visible:ring-0 bg-transparent text-white font-normal"
                      placeholder="Add description..."
                    />
                  ) : (
                    <div
                      onClick={() => setIsEditingDescription(true)}
                      className="flex-1 text-xs cursor-text px-0 py-0 h-auto text-white font-normal"
                    >
                      {field.description || "Add description..."}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      onUpdate(field.id, { description: '' });
                      setShowDescription(false);
                      setIsEditingDescription(false);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white/70 hover:text-destructive"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDescription(true)}
                  className="text-xs text-white/70 hover:text-white transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100 mt-2"
                >
                  <Plus className="h-3 w-3" />
                  Add description
                </button>
              )}
            </div>
          ) : field.type === "textarea" ? (
            <textarea
              className="w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm"
              placeholder={field.placeholder}
            />
          ) : field.type === "dropdown" || field.type === "checkbox" || field.type === "radio" ? (
            <div className="space-y-2">
              {(field.type === "checkbox" || field.type === "dropdown") && (
                <div className="flex items-center gap-4 pb-2 border-b border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!field.multiSelect}
                      onChange={() => onUpdate(field.id, { multiSelect: false })}
                      className="h-3.5 w-3.5"
                    />
                    <span className="text-xs text-muted-foreground">Single select</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={field.multiSelect}
                      onChange={() => onUpdate(field.id, { multiSelect: true })}
                      className="h-3.5 w-3.5"
                    />
                    <span className="text-xs text-muted-foreground">Multi-select</span>
                  </label>
                </div>
              )}
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={(event) => {
                  const { active, over } = event;
                  if (over && active.id !== over.id) {
                    const oldIndex = field.options?.findIndex((_, i) => `${field.id}-option-${i}` === active.id) ?? -1;
                    const newIndex = field.options?.findIndex((_, i) => `${field.id}-option-${i}` === over.id) ?? -1;
                    if (oldIndex !== -1 && newIndex !== -1) {
                      const newOptions = arrayMove(field.options || [], oldIndex, newIndex);
                      onUpdate(field.id, { options: newOptions });
                    }
                  }
                }}
              >
                <SortableContext
                  items={field.options?.map((_, i) => `${field.id}-option-${i}`) || []}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-1.5">
                    {field.options?.map((option, index) => (
                      <SortableOption
                        key={`${field.id}-option-${index}`}
                        option={option}
                        index={index}
                        fieldId={field.id}
                        fieldType={field.type}
                        multiSelect={field.multiSelect}
                        onUpdate={(idx, value) => {
                          const newOptions = [...(field.options || [])];
                          newOptions[idx] = value;
                          onUpdate(field.id, { options: newOptions });
                        }}
                        onRemove={(idx) => {
                          const newOptions = field.options?.filter((_, i) => i !== idx);
                          onUpdate(field.id, { options: newOptions });
                        }}
                        onAddNew={() => {
                          const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
                          onUpdate(field.id, { options: newOptions });
                        }}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
                  onUpdate(field.id, { options: newOptions });
                }}
                className="w-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Option
              </Button>
            </div>
          ) : field.type === "thumbs" ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`thumbs-${field.id}`}
                  className="h-4 w-4"
                  disabled
                />
                <span className="text-sm">👍 Thumbs Up</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`thumbs-${field.id}`}
                  className="h-4 w-4"
                  disabled
                />
                <span className="text-sm">👎 Thumbs Down</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`thumbs-${field.id}`}
                  className="h-4 w-4"
                  disabled
                />
                <span className="text-sm text-muted-foreground">N/A</span>
              </div>
            </div>
          ) : field.type === "date" ? (
            <div className="space-y-2">
              <div className="flex items-center gap-4 pb-2 border-b border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!field.dateRange}
                    onChange={() => onUpdate(field.id, { dateRange: false })}
                    className="h-3.5 w-3.5"
                  />
                  <span className="text-xs text-muted-foreground">Single date</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={field.dateRange}
                    onChange={() => onUpdate(field.id, { dateRange: true })}
                    className="h-3.5 w-3.5"
                  />
                  <span className="text-xs text-muted-foreground">Date range</span>
                </label>
              </div>
              <div className="flex gap-2">
                <Input 
                  type="date" 
                  className="flex-1"
                  placeholder={field.dateRange ? "Start date" : "Select date"}
                />
                {field.dateRange && (
                  <>
                    <span className="self-center text-muted-foreground">to</span>
                    <Input 
                      type="date" 
                      className="flex-1"
                      placeholder="End date"
                    />
                  </>
                )}
              </div>
            </div>
          ) : field.type === "file" || field.type === "image" ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input 
                  type="file"
                  className="flex-1"
                  accept={field.type === "image" ? "image/*" : undefined}
                />
              </div>
              <p className="text-xs text-muted-foreground italic">
                {field.type === "image" ? "Accepted formats: JPG, PNG, GIF, WebP" : "Maximum file size: 10MB"}
              </p>
            </div>
          ) : (
            <Input placeholder={field.placeholder} type={field.type === "email" ? "email" : field.type === "number" ? "number" : "text"} />
          )}
        </div>
        <button
          onClick={() => onRemove(field.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
          title="Delete field"
        >
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
      <button
        onClick={() => onDuplicate(field.id)}
        className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#c4dfc4]"
        title="Duplicate field"
      >
        <Copy className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
}

function FormsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingFormId = searchParams.get('id');
  const isEditMode = !!editingFormId;
  
  const [isMounted, setIsMounted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [activeView, setActiveView] = useState<"builder" | "distribution">("builder");
  const [activeDistributionSection, setActiveDistributionSection] = useState<"who" | "when" | "where" | "how" | null>("who");
  const [submitButtonText, setSubmitButtonText] = useState("Submit");
  const [isEditingSubmitButton, setIsEditingSubmitButton] = useState(false);
  const submitButtonInputRef = React.useRef<HTMLInputElement>(null);
  
  // Fix hydration issues with DnD library
  React_useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const [formName, setFormName] = useState("Untitled Form");
  const [formDescription, setFormDescription] = useState("Add a description for your form");
  const [isEditingFormName, setIsEditingFormName] = useState(false);
  const [isEditingFormDescription, setIsEditingFormDescription] = useState(false);
  const [showFormDescription, setShowFormDescription] = useState(true);
  const formNameInputRef = React.useRef<HTMLInputElement>(null);
  const formDescriptionInputRef = React.useRef<HTMLInputElement>(null);
  
  // Distribution settings
  const [distributionWho, setDistributionWho] = useState<string>("Public");
  const [distributionWhen, setDistributionWhen] = useState<string>("Always");
  const [distributionWhere, setDistributionWhere] = useState<string[]>(["URL"]);
  const [distributionHow, setDistributionHow] = useState<string[]>(["Text"]);
  
  const [formFields, setFormFields] = useState<FormField[]>([]);

  const [activeWidget, setActiveWidget] = useState<any>(null);
  const [overId, setOverId] = useState<string | null>(null);
  
  // Save & Share state
  const [saving, setSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedFormId, setLastSavedFormId] = useState<string | null>(null);
  const shouldAutoSave = React.useRef(false);
  
  // Load form data when in edit mode
  React_useEffect(() => {
    if (isEditMode && editingFormId) {
      loadFormForEditing(editingFormId);
    }
  }, [isEditMode, editingFormId]);

  async function loadFormForEditing(formId: string) {
    setLoadingForm(true);
    try {
      const response = await fetch(`/api/forms/${formId}`);
      if (!response.ok) {
        alert('Failed to load form');
        return;
      }
      const { form } = await response.json();
      
      // Populate state with existing form data
      setFormName(form.title);
      setFormDescription(form.description || 'Add a description for your form');
      setFormFields(form.schema.fields || []);
      setShareUrl(`${window.location.origin}/f/${form.id}`);
      setLastSavedFormId(form.id);
      setHasUnsavedChanges(false); // Reset unsaved changes when loading
    } catch (error) {
      console.error('Error loading form:', error);
      alert('Failed to load form');
    } finally {
      setLoadingForm(false);
    }
  }

  // Track unsaved changes
  React.useEffect(() => {
    // Only mark as unsaved if form has been loaded or if creating new
    if (!loadingForm && (formFields.length > 0 || formName !== 'Untitled Form' || formDescription !== 'Add a description for your form')) {
      setHasUnsavedChanges(true);
    }
  }, [formFields, formName, formDescription, loadingForm]);

  // Auto-save when AI creates a form
  React.useEffect(() => {
    if (shouldAutoSave.current && formFields.length > 0 && formName && !saving && !loadingForm && !isEditMode) {
      console.log('🤖 Auto-saving AI-generated form...');
      shouldAutoSave.current = false; // Reset flag
      handleSaveAndShare();
    }
  }, [formFields, formName, formDescription, saving, loadingForm, isEditMode]);

  // Update CSS variable for header margin
  React.useEffect(() => {
    document.documentElement.style.setProperty(
      '--ai-chat-width',
      isChatOpen ? '384px' : '48px'
    );
  }, [isChatOpen]);

  React_useEffect(() => {
    if (isEditingSubmitButton && submitButtonInputRef.current) {
      submitButtonInputRef.current.focus();
      submitButtonInputRef.current.select();
    }
  }, [isEditingSubmitButton]);

  React_useEffect(() => {
    if (isEditingFormName && formNameInputRef.current) {
      formNameInputRef.current.focus();
      formNameInputRef.current.select();
    }
  }, [isEditingFormName]);

  React_useEffect(() => {
    if (isEditingFormDescription && formDescriptionInputRef.current) {
      formDescriptionInputRef.current.focus();
      formDescriptionInputRef.current.select();
    }
  }, [isEditingFormDescription]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    
    // Check if it's a widget from the sidebar
    if (active.id.toString().startsWith("widget-")) {
      const widgetId = active.id.toString().replace("widget-", "");
      const widget = widgetTypes
        .flatMap((cat) => cat.items)
        .find((w) => w.id === widgetId);
      setActiveWidget(widget);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over?.id as string | null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveWidget(null);
      return;
    }

    // If dragging from widget sidebar
    if (active.id.toString().startsWith("widget-")) {
      const widgetId = active.id.toString().replace("widget-", "");
      const widget = widgetTypes
        .flatMap((cat) => cat.items)
        .find((w) => w.id === widgetId);

      if (widget) {
        const newField: FormField = {
          id: `field-${Date.now()}`,
          type: widget.id,
          name: widget.id,
          label: widget.name,
          placeholder: `Enter ${widget.name.toLowerCase()}...`,
          required: false,
          color: widget.color,
          icon: widget.icon,
          options: widget.id === 'dropdown' || widget.id === 'checkbox' || widget.id === 'radio' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
          multiSelect: widget.id === 'checkbox' || widget.id === 'dropdown' ? false : undefined,
          dateRange: widget.id === 'date' ? false : undefined,
        };

        // Check if dropping over the drop zone or a specific field
        if (over.id === "form-drop-zone") {
          // Add to end if dropping in empty area
          setFormFields([...formFields, newField]);
        } else {
          // Insert at the position of the field we're over
          const overIndex = formFields.findIndex((f) => f.id === over.id);
          if (overIndex !== -1) {
            const newFields = [...formFields];
            newFields.splice(overIndex, 0, newField);
            setFormFields(newFields);
          } else {
            setFormFields([...formFields, newField]);
          }
        }
      }
    } else if (active.id !== over.id) {
      // Reordering existing fields
      setFormFields((fields) => {
        const oldIndex = fields.findIndex((f) => f.id === active.id);
        const newIndex = fields.findIndex((f) => f.id === over.id);
        return arrayMove(fields, oldIndex, newIndex);
      });
    }

    setActiveWidget(null);
    setOverId(null);
  };

  const handleRemoveField = (id: string) => {
    setFormFields(formFields.filter((f) => f.id !== id));
  };

  const handleDuplicateField = (id: string) => {
    const fieldToDuplicate = formFields.find((f) => f.id === id);
    if (fieldToDuplicate) {
      const duplicatedField: FormField = {
        ...fieldToDuplicate,
        id: `field-${Date.now()}`,
        name: fieldToDuplicate.name + Date.now(),
      };
      const index = formFields.findIndex((f) => f.id === id);
      const newFields = [...formFields];
      newFields.splice(index + 1, 0, duplicatedField);
      setFormFields(newFields);
    }
  };

  const handleAddWidgetToTop = (widget: any) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: widget.id,
      name: widget.id + Date.now(),
      label: widget.name,
      placeholder: `Enter ${widget.name.toLowerCase()}`,
      required: false,
      color: widget.color,
      icon: widget.icon,
      options: widget.id === 'dropdown' || widget.id === 'checkbox' || widget.id === 'radio' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
      multiSelect: widget.id === 'checkbox' || widget.id === 'dropdown' ? false : undefined,
      dateRange: widget.id === 'date' ? false : undefined,
    };
    setFormFields([newField, ...formFields]);
  };

  const handleUpdateField = (id: string, updates: Partial<FormField>) => {
    setFormFields(formFields.map((f) => 
      f.id === id ? { ...f, ...updates } : f
    ));
  };


  const handleSaveAndShare = async () => {
    if (formFields.length === 0) {
      alert('Please add at least one field to your form before sharing.');
      return;
    }

    setSaving(true);
    try {
      // Build form schema
      const schema = {
        fields: formFields.map(field => ({
          id: field.id,
          type: field.type,
          name: field.name || field.id,
          label: field.label,
          placeholder: field.placeholder || '',
          required: field.required,
          options: field.options || [],
          description: field.description || '',
        })),
      };

      // Determine endpoint and method based on edit mode
      const endpoint = isEditMode ? `/api/forms/${editingFormId}` : '/api/forms';
      const method = isEditMode ? 'PUT' : 'POST';

      // Save form to database
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formName,
          description: formDescription,
          schema,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save form');
      }

      const data = await response.json();
      
      // Reset unsaved changes and save form ID
      setHasUnsavedChanges(false);
      setLastSavedFormId(data.id || editingFormId);
      
      // Set share URL (but don't show modal - less intrusive)
      if (data.shareUrl) {
        setShareUrl(data.shareUrl);
      }
      
      // If this was a new form, redirect to edit mode so the URL includes the form ID
      // This enables conversation persistence
      if (!isEditMode && data.id) {
        router.push(`/forms/builder?id=${data.id}`);
      }
      
      // Don't auto-show share modal - form creation should be silent
      // if (!isEditMode) {
      //   setShowShareModal(true);
      // }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const copyShareUrl = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      alert('Share URL copied to clipboard!');
    }
  };

  return (
    <div className="flex h-screen">
      <AppLayout>
        {!isMounted ? (
          <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex h-[calc(100vh-4rem)] relative">
            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
              {activeView === "builder" && (
                <>
                  {/* Left Panel - Widget Navigation - GRADIENT BLACK */}
                  <div className="w-80 border-r border-white bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#000000] overflow-y-auto shadow-sm">
                    <div className="p-3 space-y-3">
                      <div className="border-b border-white/10 pb-2">
                        <h2 className="text-sm font-semibold text-gray-100">Form Widgets</h2>
                        <p className="text-xs text-gray-400">
                          Drag to add
                        </p>
                      </div>

              {widgetTypes.map((group, idx) => (
                <div key={idx} className="space-y-1.5">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
                    {group.category}
                  </h3>
                  <div className="space-y-1.5">
                    {group.items.map((widget) => (
                      <DraggableWidget key={widget.id} widget={widget} onAddToTop={handleAddWidgetToTop} />
                    ))}
                  </div>
                  {idx < widgetTypes.length - 1 && <Separator className="my-3 bg-white/10" />}
                </div>
              ))}
            </div>
          </div>

              {/* Middle Panel - Form Editor - GRADIENT BLACK */}
              <div className="flex-1 bg-gradient-to-b from-[#000000] to-[#0a0a0a] flex flex-col" style={{ marginRight: 'var(--ai-chat-width, 48px)' }}>
                {/* Form Sub-Header - Only for Middle Panel */}
                <div className="sticky top-0 z-30 border-b border-white bg-gradient-to-r from-[#000000] to-[#0a0a0a]">
                  <div className="flex items-center justify-between gap-4 px-6 py-2">
                    <div className="flex items-center gap-3">
                      {/* Breadcrumb */}
                      <div className="flex items-center gap-2 text-sm text-gray-400 mr-4">
                        <NextLink href="/forms" className="hover:text-white transition-colors">
                          Forms
                        </NextLink>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-white">{formName || "New Form"}</span>
                      </div>
                      {/* Tabs */}
                        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "builder" | "distribution")} className="w-auto">
                          <TabsList className="bg-[#1a1a1a]">
                            <TabsTrigger value="builder">Builder</TabsTrigger>
                            <TabsTrigger value="distribution">Distribution</TabsTrigger>
                          </TabsList>
                        </Tabs>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasUnsavedChanges && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="hover:bg-white/5" 
                          onClick={() => {
                            if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                              router.push('/forms');
                            }
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                      {hasUnsavedChanges || !lastSavedFormId ? (
                        <Button 
                          size="sm" 
                          className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a]"
                          onClick={handleSaveAndShare}
                          disabled={saving || loadingForm}
                        >
                          {saving ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Share2 className="w-4 h-4 mr-2" />
                              Save & Share
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a]"
                          onClick={() => setShowShareModal(true)}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Editor Content */}
                <div className="flex-1 overflow-y-auto">
                  {loadingForm ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#c4dfc4]" />
                        <p className="text-gray-400">Loading form...</p>
                      </div>
                    </div>
                  ) : (
                  <ScrollArea className="h-full p-8">
              <Card className="max-w-2xl mx-auto p-8 bg-[#1a1a1a] border-border/50">
                {/* Form Name and Description */}
                <div className="mb-8 pb-8 border-b border-border/50 bg-gradient-to-br from-[#1a1a1a] to-[#151515] -mx-8 -mt-8 px-8 pt-8 rounded-t-lg">
                  {/* Form Name */}
                  {isEditingFormName ? (
                    <Input
                      ref={formNameInputRef}
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      onBlur={() => setIsEditingFormName(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setIsEditingFormName(false);
                        }
                      }}
                      className="text-4xl font-bold border-none px-0 py-0 h-auto focus-visible:ring-0 bg-transparent text-gray-100 mb-3"
                      placeholder="Untitled Form"
                    />
                  ) : (
                    <h1
                      onClick={() => setIsEditingFormName(true)}
                      className="text-4xl font-bold cursor-text text-gray-100 mb-3 hover:text-gray-300 transition-colors"
                    >
                      {formName || "Untitled Form"}
                    </h1>
                  )}
                  
                  {/* Form Description */}
                  {showFormDescription ? (
                    isEditingFormDescription ? (
                      <Input
                        ref={formDescriptionInputRef}
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        onBlur={() => {
                          setIsEditingFormDescription(false);
                          if (!formDescription) {
                            setShowFormDescription(false);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setIsEditingFormDescription(false);
                          }
                        }}
                        className="text-lg border-none px-0 py-0 h-auto focus-visible:ring-0 bg-transparent text-muted-foreground"
                        placeholder="Add a description..."
                      />
                    ) : (
                      <p
                        onClick={() => setIsEditingFormDescription(true)}
                        className="text-lg cursor-text text-muted-foreground hover:text-gray-400 transition-colors"
                      >
                        {formDescription || "Add a description..."}
                      </p>
                    )
                  ) : (
                    <button
                      onClick={() => setShowFormDescription(true)}
                      className="text-lg text-muted-foreground hover:text-gray-400 transition-colors"
                    >
                      + Add description
                    </button>
                  )}
                </div>

                <SortableContext
                  items={formFields.map((f) => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {formFields.length === 0 ? (
                      <EmptyDropZone isOver={overId === "form-drop-zone"} />
                    ) : (
                      formFields.map((field, index) => {
                        // Calculate question count for group fields
                        let questionCount: number | undefined = undefined;
                        if (field.type === 'group') {
                          questionCount = 0;
                          for (let i = index + 1; i < formFields.length; i++) {
                            if (formFields[i].type === 'group') break;
                            questionCount++;
                          }
                        }
                        
                        return (
                          <SortableFormField
                            key={field.id}
                            field={field}
                            onRemove={handleRemoveField}
                            onUpdate={handleUpdateField}
                            onDuplicate={handleDuplicateField}
                            isOver={overId === field.id && activeWidget !== null}
                            questionCount={questionCount}
                          />
                        );
                      })
                    )}
                  </div>
                </SortableContext>

                {formFields.length > 0 && (
                  <div className="w-full mt-6 group/submit">
                    {isEditingSubmitButton ? (
                      <Input
                        ref={submitButtonInputRef}
                        value={submitButtonText}
                        onChange={(e) => setSubmitButtonText(e.target.value)}
                        onBlur={() => setIsEditingSubmitButton(false)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setIsEditingSubmitButton(false);
                          }
                        }}
                        className="w-full text-center font-medium bg-[#c4dfc4] text-[#0a0a0a] border-[#c4dfc4]"
                      />
                    ) : (
                      <Button 
                        onClick={() => setIsEditingSubmitButton(true)}
                        className="w-full bg-[#c4dfc4] text-[#0a0a0a] hover:bg-[#b5d0b5] relative group-hover/submit:ring-2 ring-[#c4dfc4]/50"
                      >
                        {submitButtonText}
                        <span className="absolute right-2 text-xs opacity-0 group-hover/submit:opacity-50 transition-opacity">
                          Click to edit
                        </span>
                      </Button>
                    )}
                  </div>
                )}
              </Card>
                  </ScrollArea>
                  )}
                </div>
              </div>
                </>
              )}

              {activeView === "distribution" && (
                <>
                  {/* Left Panel - Distribution Options */}
                  <div className="w-80 border-r border-white bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#000000] overflow-y-auto shadow-sm">
                    <div className="p-3 space-y-3">

                      <div className="space-y-1.5">
                        {/* WHO Section */}
                        <Card 
                          onClick={() => setActiveDistributionSection("who")}
                          className={`p-3 cursor-pointer transition-all border-0 hover:bg-[#c4dfc4]/20 ${
                            activeDistributionSection === "who" ? "bg-[#c4dfc4]/30 ring-1 ring-[#c4dfc4]/50" : "bg-[#1a1a1a]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div className="h-8 w-8 rounded-lg bg-[#c4dfc4] flex items-center justify-center shrink-0">
                                <Users className="h-4 w-4 text-[#0a0a0a]" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-gray-100">WHO</div>
                                <div className="text-xs text-gray-400">Audience settings</div>
                              </div>
                            </div>
                            {distributionWho && (
                              <Badge className="bg-[#c4dfc4] text-[#0a0a0a] hover:bg-[#c4dfc4] text-xs shrink-0">
                                {distributionWho}
                              </Badge>
                            )}
                          </div>
                        </Card>

                        {/* WHEN Section */}
                        <Card 
                          onClick={() => setActiveDistributionSection("when")}
                          className={`p-3 cursor-pointer transition-all border-0 hover:bg-[#c8e0f5]/20 ${
                            activeDistributionSection === "when" ? "bg-[#c8e0f5]/30 ring-1 ring-[#c8e0f5]/50" : "bg-[#1a1a1a]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div className="h-8 w-8 rounded-lg bg-[#c8e0f5] flex items-center justify-center shrink-0">
                                <Calendar className="h-4 w-4 text-[#0a0a0a]" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-gray-100">WHEN</div>
                                <div className="text-xs text-gray-400">Schedule & timing</div>
                              </div>
                            </div>
                            {distributionWhen && (
                              <Badge className="bg-[#c8e0f5] text-[#0a0a0a] hover:bg-[#c8e0f5] text-xs shrink-0">
                                {distributionWhen}
                              </Badge>
                            )}
                          </div>
                        </Card>

                        {/* WHERE Section */}
                        <Card 
                          onClick={() => setActiveDistributionSection("where")}
                          className={`p-3 cursor-pointer transition-all border-0 hover:bg-[#ddc8f5]/20 ${
                            activeDistributionSection === "where" ? "bg-[#ddc8f5]/30 ring-1 ring-[#ddc8f5]/50" : "bg-[#1a1a1a]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div className="h-8 w-8 rounded-lg bg-[#ddc8f5] flex items-center justify-center shrink-0">
                                <Share2 className="h-4 w-4 text-[#0a0a0a]" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-gray-100">WHERE</div>
                                <div className="text-xs text-gray-400">Distribution methods</div>
                              </div>
                            </div>
                            {distributionWhere.length > 0 && (
                              distributionWhere.length === 1 ? (
                                <Badge className="bg-[#ddc8f5] text-[#0a0a0a] hover:bg-[#ddc8f5] text-xs shrink-0">
                                  {distributionWhere[0]}
                                </Badge>
                              ) : (
                                <Badge className="bg-[#ddc8f5] text-[#0a0a0a] hover:bg-[#ddc8f5] text-xs shrink-0 font-semibold">
                                  {distributionWhere.length}
                                </Badge>
                              )
                            )}
                          </div>
                        </Card>

                        {/* HOW Section */}
                        <Card 
                          onClick={() => setActiveDistributionSection("how")}
                          className={`p-3 cursor-pointer transition-all border-0 hover:bg-[#f5edc8]/20 ${
                            activeDistributionSection === "how" ? "bg-[#f5edc8]/30 ring-1 ring-[#f5edc8]/50" : "bg-[#1a1a1a]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div className="h-8 w-8 rounded-lg bg-[#f5edc8] flex items-center justify-center shrink-0">
                                <Zap className="h-4 w-4 text-[#0a0a0a]" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-gray-100">HOW</div>
                                <div className="text-xs text-gray-400">Input methods</div>
                              </div>
                            </div>
                            {distributionHow.length > 0 && (
                              distributionHow.length === 1 ? (
                                <Badge className="bg-[#f5edc8] text-[#0a0a0a] hover:bg-[#f5edc8] text-xs shrink-0">
                                  {distributionHow[0]}
                                </Badge>
                              ) : (
                                <Badge className="bg-[#f5edc8] text-[#0a0a0a] hover:bg-[#f5edc8] text-xs shrink-0 font-semibold">
                                  {distributionHow.length}
                                </Badge>
                              )
                            )}
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>

                  {/* Middle Panel - Distribution Content */}
                  <div className="flex-1 bg-gradient-to-b from-[#000000] to-[#0a0a0a] flex flex-col" style={{ marginRight: 'var(--ai-chat-width, 48px)' }}>
                    {/* Form Sub-Header - Only for Middle Panel */}
                    <div className="sticky top-0 z-30 border-b border-white bg-gradient-to-r from-[#000000] to-[#0a0a0a]">
                      <div className="flex items-center justify-between gap-4 px-6 py-2">
                        <div className="flex items-center gap-3">
                          {/* Breadcrumb */}
                          <div className="flex items-center gap-2 text-sm text-gray-400 mr-4">
                            <NextLink href="/forms" className="hover:text-white transition-colors">
                              Forms
                            </NextLink>
                            <ChevronRight className="h-4 w-4" />
                            <span className="text-white">{formName || "New Form"}</span>
                          </div>
                          {/* Tabs */}
                        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "builder" | "distribution")} className="w-auto">
                          <TabsList className="bg-[#1a1a1a]">
                            <TabsTrigger value="builder">Builder</TabsTrigger>
                            <TabsTrigger value="distribution">Distribution</TabsTrigger>
                          </TabsList>
                        </Tabs>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                            Draft
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Distribution Content */}
                    <ScrollArea className="flex-1">
                      <div className="p-8">
                        {activeDistributionSection === "who" && (
                          <Card className="bg-[#c4dfc4] border-0 p-8">
                            <h3 className="text-2xl font-bold text-[#0a0a0a] mb-6">WHO can access this form?</h3>
                            <div className="space-y-5">
                              <div className="flex items-center gap-3">
                                <input 
                                  type="radio" 
                                  name="who" 
                                  id="public" 
                                  checked={distributionWho === "Public"} 
                                  onChange={() => setDistributionWho("Public")}
                                  className="h-4 w-4 cursor-pointer" 
                                />
                                <label htmlFor="public" className="text-base font-medium text-[#0a0a0a] cursor-pointer">Public - Anyone with the link</label>
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <input 
                                    type="radio" 
                                    name="who" 
                                    id="locations" 
                                    checked={distributionWho === "Specific locations"} 
                                    onChange={() => setDistributionWho("Specific locations")}
                                    className="h-4 w-4 cursor-pointer" 
                                  />
                                  <label htmlFor="locations" className="text-base font-medium text-[#0a0a0a] cursor-pointer">Specific locations</label>
                                </div>
                                <select className="ml-7 w-full max-w-md rounded-lg border-0 bg-white/50 px-4 py-3 text-sm text-[#0a0a0a]">
                                  <option>Select locations...</option>
                                  <option>North America</option>
                                  <option>Europe</option>
                                  <option>Asia Pacific</option>
                                  <option>South America</option>
                                  <option>Africa</option>
                                  <option>Middle East</option>
                                </select>
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <input 
                                    type="radio" 
                                    name="who" 
                                    id="private" 
                                    checked={distributionWho === "Private"} 
                                    onChange={() => setDistributionWho("Private")}
                                    className="h-4 w-4 cursor-pointer" 
                                  />
                                  <label htmlFor="private" className="text-base font-medium text-[#0a0a0a] cursor-pointer">Private - Specific people</label>
                                </div>
                                <Input 
                                  placeholder="Enter email addresses (comma separated)" 
                                  className="ml-7 w-full max-w-md bg-white/50 border-0 text-[#0a0a0a] placeholder:text-[#0a0a0a]/50 py-3"
                                />
                              </div>
                            </div>
                          </Card>
                        )}

                        {activeDistributionSection === "when" && (
                          <Card className="bg-[#c8e0f5] border-0 p-8">
                            <h3 className="text-2xl font-bold text-[#0a0a0a] mb-6">WHEN should this form be available?</h3>
                            <div className="space-y-5">
                              <div className="flex items-center gap-3">
                                <input 
                                  type="radio" 
                                  name="when" 
                                  id="always" 
                                  checked={distributionWhen === "Always"} 
                                  onChange={() => setDistributionWhen("Always")}
                                  className="h-4 w-4 cursor-pointer" 
                                />
                                <label htmlFor="always" className="text-base font-medium text-[#0a0a0a] cursor-pointer">Always available</label>
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <input 
                                    type="radio" 
                                    name="when" 
                                    id="one-time" 
                                    checked={distributionWhen === "One-time"} 
                                    onChange={() => setDistributionWhen("One-time")}
                                    className="h-4 w-4 cursor-pointer" 
                                  />
                                  <label htmlFor="one-time" className="text-base font-medium text-[#0a0a0a] cursor-pointer">One-time event</label>
                                </div>
                                <div className="ml-7 flex gap-3 max-w-md">
                                  <Input type="date" className="bg-white/50 border-0 text-[#0a0a0a] py-3" />
                                  <Input type="time" className="bg-white/50 border-0 text-[#0a0a0a] py-3" />
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <input 
                                    type="radio" 
                                    name="when" 
                                    id="recurring" 
                                    checked={distributionWhen === "Recurring"} 
                                    onChange={() => setDistributionWhen("Recurring")}
                                    className="h-4 w-4 cursor-pointer" 
                                  />
                                  <label htmlFor="recurring" className="text-base font-medium text-[#0a0a0a] cursor-pointer">Recurring schedule</label>
                                </div>
                                <select className="ml-7 w-full max-w-md rounded-lg border-0 bg-white/50 px-4 py-3 text-sm text-[#0a0a0a]">
                                  <option>Select frequency...</option>
                                  <option>Daily</option>
                                  <option>Weekly on Monday</option>
                                  <option>Weekly on Tuesday</option>
                                  <option>Weekly on Wednesday</option>
                                  <option>Monthly - 1st of month</option>
                                  <option>Monthly - 15th of month</option>
                                  <option>Custom schedule</option>
                                </select>
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <input 
                                    type="radio" 
                                    name="when" 
                                    id="date-range" 
                                    checked={distributionWhen === "Date range"} 
                                    onChange={() => setDistributionWhen("Date range")}
                                    className="h-4 w-4 cursor-pointer" 
                                  />
                                  <label htmlFor="date-range" className="text-base font-medium text-[#0a0a0a] cursor-pointer">Date range</label>
                                </div>
                                <div className="ml-7 flex items-center gap-3 max-w-md">
                                  <Input type="date" placeholder="Start" className="bg-white/50 border-0 text-[#0a0a0a] py-3" />
                                  <span className="text-[#0a0a0a] font-medium">to</span>
                                  <Input type="date" placeholder="End" className="bg-white/50 border-0 text-[#0a0a0a] py-3" />
                                </div>
                              </div>
                            </div>
                          </Card>
                        )}

                        {activeDistributionSection === "where" && (
                          <Card className="bg-[#ddc8f5] border-0 p-8">
                            <h3 className="text-2xl font-bold text-[#0a0a0a] mb-6">WHERE will people access this form?</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <Card 
                                className={`border-0 p-5 cursor-pointer transition-all hover:scale-105 ${
                                  distributionWhere.includes("URL") ? "bg-white ring-2 ring-[#0a0a0a]" : "bg-white/50 hover:bg-white/70"
                                }`}
                                onClick={() => {
                                  if (distributionWhere.includes("URL")) {
                                    setDistributionWhere(distributionWhere.filter(m => m !== "URL"));
                                  } else {
                                    setDistributionWhere([...distributionWhere, "URL"]);
                                  }
                                }}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-lg bg-[#0a0a0a] flex items-center justify-center shrink-0">
                                    <span className="text-2xl">🔗</span>
                                  </div>
                                  <div>
                                    <div className="font-bold text-[#0a0a0a]">Share Link</div>
                                    <div className="text-xs text-[#0a0a0a]/70">Copy direct URL</div>
                                  </div>
                                </div>
                              </Card>

                              <Card 
                                className={`border-0 p-5 cursor-pointer transition-all hover:scale-105 ${
                                  distributionWhere.includes("QR") ? "bg-white ring-2 ring-[#0a0a0a]" : "bg-white/50 hover:bg-white/70"
                                }`}
                                onClick={() => {
                                  if (distributionWhere.includes("QR")) {
                                    setDistributionWhere(distributionWhere.filter(m => m !== "QR"));
                                  } else {
                                    setDistributionWhere([...distributionWhere, "QR"]);
                                  }
                                }}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-lg bg-[#0a0a0a] flex items-center justify-center shrink-0">
                                    <span className="text-2xl">📱</span>
                                  </div>
                                  <div>
                                    <div className="font-bold text-[#0a0a0a]">QR Code</div>
                                    <div className="text-xs text-[#0a0a0a]/70">Generate scannable code</div>
                                  </div>
                                </div>
                              </Card>

                              <Card 
                                className={`border-0 p-5 cursor-pointer transition-all hover:scale-105 ${
                                  distributionWhere.includes("Email") ? "bg-white ring-2 ring-[#0a0a0a]" : "bg-white/50 hover:bg-white/70"
                                }`}
                                onClick={() => {
                                  if (distributionWhere.includes("Email")) {
                                    setDistributionWhere(distributionWhere.filter(m => m !== "Email"));
                                  } else {
                                    setDistributionWhere([...distributionWhere, "Email"]);
                                  }
                                }}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-lg bg-[#0a0a0a] flex items-center justify-center shrink-0">
                                    <span className="text-2xl">📧</span>
                                  </div>
                                  <div>
                                    <div className="font-bold text-[#0a0a0a]">Email</div>
                                    <div className="text-xs text-[#0a0a0a]/70">Send via email</div>
                                  </div>
                                </div>
                              </Card>

                              <Card 
                                className={`border-0 p-5 cursor-pointer transition-all hover:scale-105 ${
                                  distributionWhere.includes("Slack") ? "bg-white ring-2 ring-[#0a0a0a]" : "bg-white/50 hover:bg-white/70"
                                }`}
                                onClick={() => {
                                  if (distributionWhere.includes("Slack")) {
                                    setDistributionWhere(distributionWhere.filter(m => m !== "Slack"));
                                  } else {
                                    setDistributionWhere([...distributionWhere, "Slack"]);
                                  }
                                }}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-lg bg-[#0a0a0a] flex items-center justify-center shrink-0">
                                    <span className="text-2xl">💬</span>
                                  </div>
                                  <div>
                                    <div className="font-bold text-[#0a0a0a]">Slack</div>
                                    <div className="text-xs text-[#0a0a0a]/70">Share in Slack</div>
                                  </div>
                                </div>
                              </Card>

                              <Card 
                                className={`border-0 p-5 cursor-pointer transition-all hover:scale-105 ${
                                  distributionWhere.includes("Embed") ? "bg-white ring-2 ring-[#0a0a0a]" : "bg-white/50 hover:bg-white/70"
                                }`}
                                onClick={() => {
                                  if (distributionWhere.includes("Embed")) {
                                    setDistributionWhere(distributionWhere.filter(m => m !== "Embed"));
                                  } else {
                                    setDistributionWhere([...distributionWhere, "Embed"]);
                                  }
                                }}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-lg bg-[#0a0a0a] flex items-center justify-center shrink-0">
                                    <span className="text-2xl">🔌</span>
                                  </div>
                                  <div>
                                    <div className="font-bold text-[#0a0a0a]">Embed</div>
                                    <div className="text-xs text-[#0a0a0a]/70">Embed on website</div>
                                  </div>
                                </div>
                              </Card>

                              <Card 
                                className={`border-0 p-5 cursor-pointer transition-all hover:scale-105 ${
                                  distributionWhere.includes("SMS") ? "bg-white ring-2 ring-[#0a0a0a]" : "bg-white/50 hover:bg-white/70"
                                }`}
                                onClick={() => {
                                  if (distributionWhere.includes("SMS")) {
                                    setDistributionWhere(distributionWhere.filter(m => m !== "SMS"));
                                  } else {
                                    setDistributionWhere([...distributionWhere, "SMS"]);
                                  }
                                }}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-lg bg-[#0a0a0a] flex items-center justify-center shrink-0">
                                    <span className="text-2xl">🔔</span>
                                  </div>
                                  <div>
                                    <div className="font-bold text-[#0a0a0a]">SMS</div>
                                    <div className="text-xs text-[#0a0a0a]/70">Send via text</div>
                                  </div>
                                </div>
                              </Card>

                              <Card 
                                className={`border-0 p-5 cursor-pointer transition-all hover:scale-105 ${
                                  distributionWhere.includes("Social") ? "bg-white ring-2 ring-[#0a0a0a]" : "bg-white/50 hover:bg-white/70"
                                }`}
                                onClick={() => {
                                  if (distributionWhere.includes("Social")) {
                                    setDistributionWhere(distributionWhere.filter(m => m !== "Social"));
                                  } else {
                                    setDistributionWhere([...distributionWhere, "Social"]);
                                  }
                                }}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-lg bg-[#0a0a0a] flex items-center justify-center shrink-0">
                                    <span className="text-2xl">🌐</span>
                                  </div>
                                  <div>
                                    <div className="font-bold text-[#0a0a0a]">Social Media</div>
                                    <div className="text-xs text-[#0a0a0a]/70">Share on socials</div>
                                  </div>
                                </div>
                              </Card>

                              <Card 
                                className={`border-0 p-5 cursor-pointer transition-all hover:scale-105 ${
                                  distributionWhere.includes("API") ? "bg-white ring-2 ring-[#0a0a0a]" : "bg-white/50 hover:bg-white/70"
                                }`}
                                onClick={() => {
                                  if (distributionWhere.includes("API")) {
                                    setDistributionWhere(distributionWhere.filter(m => m !== "API"));
                                  } else {
                                    setDistributionWhere([...distributionWhere, "API"]);
                                  }
                                }}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-lg bg-[#0a0a0a] flex items-center justify-center shrink-0">
                                    <span className="text-2xl">⚡</span>
                                  </div>
                                  <div>
                                    <div className="font-bold text-[#0a0a0a]">API</div>
                                    <div className="text-xs text-[#0a0a0a]/70">Use via API</div>
                                  </div>
                                </div>
                              </Card>
                            </div>
                          </Card>
                        )}

                        {activeDistributionSection === "how" && (
                          <Card className="bg-[#f5edc8] border-0 p-8">
                            <h3 className="text-2xl font-bold text-[#0a0a0a] mb-6">HOW will people fill out this form?</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <Card className="bg-white/50 border-0 p-5 hover:bg-white/70 cursor-pointer transition-all hover:scale-105">
                                <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-lg bg-[#0a0a0a] flex items-center justify-center shrink-0">
                                    <Type className="h-6 w-6 text-white" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-[#0a0a0a]">Text Input</div>
                                    <div className="text-xs text-[#0a0a0a]/70">Traditional manual entry</div>
                                  </div>
                                </div>
                              </Card>

                              <Card className="bg-white/50 border-0 p-5 hover:bg-white/70 cursor-pointer transition-all hover:scale-105">
                                <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                                    <Mic className="h-6 w-6 text-white" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-[#0a0a0a]">Audio Automation</div>
                                    <div className="text-xs text-[#0a0a0a]/70">Record audio to auto-fill</div>
                                  </div>
                                </div>
                              </Card>

                              <Card className="bg-white/50 border-0 p-5 hover:bg-white/70 cursor-pointer transition-all hover:scale-105">
                                <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
                                    <FileText className="h-6 w-6 text-white" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-[#0a0a0a]">Content Automation</div>
                                    <div className="text-xs text-[#0a0a0a]/70">Paste text to auto-populate</div>
                                  </div>
                                </div>
                              </Card>

                              <Card className="bg-white/50 border-0 p-5 hover:bg-white/70 cursor-pointer transition-all hover:scale-105">
                                <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shrink-0">
                                    <Camera className="h-6 w-6 text-white" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-[#0a0a0a]">Vision Automation</div>
                                    <div className="text-xs text-[#0a0a0a]/70">Camera vision to auto-fill</div>
                                  </div>
                                </div>
                              </Card>

                              <Card className="bg-white/50 border-0 p-5 hover:bg-white/70 cursor-pointer transition-all hover:scale-105">
                                <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shrink-0">
                                    <Upload className="h-6 w-6 text-white" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-[#0a0a0a]">Upload Automation</div>
                                    <div className="text-xs text-[#0a0a0a]/70">Upload docs to extract data</div>
                                  </div>
                                </div>
                              </Card>

                              <Card className="bg-white/50 border-0 p-5 hover:bg-white/70 cursor-pointer transition-all hover:scale-105">
                                <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0">
                                    <LinkIcon className="h-6 w-6 text-white" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-[#0a0a0a]">URL Automation</div>
                                    <div className="text-xs text-[#0a0a0a]/70">Scrape content from links</div>
                                  </div>
                                </div>
                              </Card>

                              <Card className="bg-white/50 border-0 p-5 hover:bg-white/70 cursor-pointer transition-all hover:scale-105">
                                <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shrink-0">
                                    <span className="text-2xl">📊</span>
                                  </div>
                                  <div>
                                    <div className="font-bold text-[#0a0a0a]">Import Automation</div>
                                    <div className="text-xs text-[#0a0a0a]/70">Sync from external services</div>
                                  </div>
                                </div>
                              </Card>

                              <Card className="bg-white/50 border-0 p-5 hover:bg-white/70 cursor-pointer transition-all hover:scale-105">
                                <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shrink-0">
                                    <span className="text-2xl">📷</span>
                                  </div>
                                  <div>
                                    <div className="font-bold text-[#0a0a0a]">Barcode/QR Scan</div>
                                    <div className="text-xs text-[#0a0a0a]/70">Scan codes to populate</div>
                                  </div>
                                </div>
                              </Card>

                              <Card className="bg-white/50 border-0 p-5 hover:bg-white/70 cursor-pointer transition-all hover:scale-105">
                                <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shrink-0">
                                    <Sparkles className="h-6 w-6 text-white" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-[#0a0a0a]">AI Assistant</div>
                                    <div className="text-xs text-[#0a0a0a]/70">Conversational guidance</div>
                                  </div>
                                </div>
                              </Card>
                            </div>
                          </Card>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </>
              )}
            </div>
          </div>

          </DndContext>
        )}
      </AppLayout>

      {/* Right Panel - AI Chat - Dynamic with Real API */}
      <AIChatPanel
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        formId={editingFormId}
        currentPage={activeView}
        currentFields={formFields}
        onFormUpdate={(fields, formMeta) => {
          setFormFields(fields);
          if (formMeta?.title) setFormName(formMeta.title);
          if (formMeta?.description) setFormDescription(formMeta.description);
          
          // Mark for auto-save when AI creates a complete form
          if (fields.length > 0 && formMeta?.title && !isEditMode) {
            shouldAutoSave.current = true;
          }
        }}
      />

      <DragOverlay>
          {activeWidget ? (
            <Card
              className="p-3 shadow-2xl border-2 rotate-3 opacity-90"
              style={{
                backgroundImage: `linear-gradient(to right, ${activeWidget.color}, ${activeWidget.color}dd)`,
                width: '280px',
              }}
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-black/10 p-2">
                  <activeWidget.icon className="h-4 w-4 text-[#0a0a0a]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#0a0a0a]">
                    {activeWidget.name}
                  </div>
                  <div className="text-xs text-[#0a0a0a]/70">
                    {activeWidget.description}
                  </div>
                </div>
              </div>
            </Card>
          ) : null}
      </DragOverlay>

      {/* Share Modal */}
      {showShareModal && shareUrl && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
          <Card className="bg-[#1a1a1a] border-[#c4dfc4]/30 p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-[#c4dfc4] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Form Saved!</h2>
              <p className="text-gray-400 mb-6">Share this link with anyone to collect responses:</p>
              
              <div className="flex gap-2 mb-6">
                <Input
                  value={shareUrl}
                  readOnly
                  className="bg-white/5 border-white/10 text-white font-mono text-sm"
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
                  onClick={() => window.open(shareUrl, '_blank')}
                  className="flex-1"
                >
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
    </div>
  );
}

function EmptyDropZone({ isOver }: { isOver: boolean }) {
  const { setNodeRef } = useDroppable({
    id: "form-drop-zone",
  });

  return (
    <div
      ref={setNodeRef}
      className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
        isOver
          ? "border-[#c4dfc4] bg-[#c4dfc4]/10 scale-105"
          : "border-border/50"
      }`}
    >
      <p className="text-muted-foreground text-sm">
        {isOver
          ? "Drop here to add field"
          : "Drag widgets from the left panel to start building your form"}
      </p>
    </div>
  );
}

function DraggableWidget({ widget, onAddToTop }: { widget: any; onAddToTop: (widget: any) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useSortable({ id: `widget-${widget.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group"
    >
      <Card
        className="p-2 hover:shadow-lg transition-all border-0 bg-gradient-to-r relative"
        style={{
          backgroundImage: `linear-gradient(to right, ${widget.color}, ${widget.color}dd)`,
        }}
      >
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-black/10 p-1.5">
            <widget.icon className="h-3.5 w-3.5 text-[#0a0a0a]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-[#0a0a0a]">
              {widget.name}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToTop(widget);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 transition-opacity rounded-md bg-black/20 hover:bg-black/30 p-1"
            title="Add to form"
          >
            <Plus className="h-3.5 w-3.5 text-[#0a0a0a]" />
          </button>
        </div>
      </Card>
    </div>
  );
}

export default function FormsPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-gray-400">Loading form builder...</div>
      </div>
    }>
      <FormsPageContent />
    </Suspense>
  );
}
