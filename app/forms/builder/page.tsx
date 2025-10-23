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
  Share2,
  Plus,
  Circle,
  Copy,
  ThumbsUp,
  Layers,
  Loader2,
  X,
  CheckCircle2,
  Eye,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  TouchSensor,
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

function SortableFormField({ field, onRemove, onUpdate, onDuplicate, isOver, questionCount, isDraggingNewWidget }: { 
  field: FormField; 
  onRemove: (id: string) => void; 
  onUpdate: (id: string, updates: Partial<FormField>) => void;
  onDuplicate: (id: string) => void;
  isOver?: boolean;
  questionCount?: number;
  isDraggingNewWidget?: boolean;
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
  } = useSortable({ 
    id: field.id,
    transition: {
      duration: 200,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1)',
    opacity: isDragging ? 0.4 : 1,
    position: 'relative' as const,
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
    <div className="relative">
      {/* Drop Indicator - shows where item will be inserted */}
      {isOver && (
        <div className="absolute -top-1 left-0 right-0 h-1 bg-[#c4dfc4] rounded-full z-20 shadow-lg shadow-[#c4dfc4]/50">
          <div className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-3 h-3 bg-[#c4dfc4] rounded-full" />
        </div>
      )}
      
      <div
        ref={setNodeRef}
        style={style}
        className={`group relative p-4 rounded-lg border-2 transition-all duration-200 bg-card/30 ${
          isDraggingNewWidget ? '' : 'hover:bg-muted/50'
        } ${
          isOver ? 'border-[#c4dfc4] mt-2 scale-[0.98]' : 'border-transparent hover:border-opacity-50'
        }`}
        onMouseEnter={(e) => {
          if (!isOver && !isDraggingNewWidget) {
            e.currentTarget.style.borderColor = field.color;
          }
        }}
        onMouseLeave={(e) => {
          if (!isOver && !isDraggingNewWidget) {
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
    </div>
  );
}

// Helper function to format time since last save
function formatTimeSince(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function FormsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingFormId = searchParams.get('id');
  const isEditMode = !!editingFormId;
  
  const [isMounted, setIsMounted] = useState(false);
  
  // Initialize AI chat state from localStorage
  const getInitialChatState = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ai-chat-open');
      // Default to true if not set
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  };
  
  const [isChatOpen, setIsChatOpen] = useState(getInitialChatState);
  
  // Function to toggle chat and save to localStorage
  const toggleChat = () => {
    const newState = !isChatOpen;
    setIsChatOpen(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai-chat-open', String(newState));
    }
  };
  
  const [activeTab, setActiveTab] = useState<"builder" | "settings" | "publish" | "report">("builder");
  const [activeSettingsSection, setActiveSettingsSection] = useState<"general" | "thankyou">("general");
  const [activePublishSection, setActivePublishSection] = useState<"share">("share");
  const [selectedResponseId, setSelectedResponseId] = useState<string | "all">("all");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [formStatus, setFormStatus] = useState<"published" | "draft">("published");
  const [submitButtonText, setSubmitButtonText] = useState("Submit");
  
  // Thank You Page Settings
  const [thankYouMessage, setThankYouMessage] = useState("Thank you for your submission!");
  const [allowAnotherSubmission, setAllowAnotherSubmission] = useState(true);
  const [showCloseButton, setShowCloseButton] = useState(false);
  const [allowSocialShare, setAllowSocialShare] = useState(false);
  const [showResponseSummary, setShowResponseSummary] = useState(true);
  const [redirectUrl, setRedirectUrl] = useState("");
  const [redirectDelay, setRedirectDelay] = useState(0);
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
  
  const [formFields, setFormFields] = useState<FormField[]>([]);

  const [activeWidget, setActiveWidget] = useState<any>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [isDraggingNewWidget, setIsDraggingNewWidget] = useState(false);
  
  // Save & Share state
  const [saving, setSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [lastSavedFormId, setLastSavedFormId] = useState<string | null>(null);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const shouldAutoSave = React.useRef(false);
  const autoSaveTimeout = React.useRef<NodeJS.Timeout | null>(null);
  
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
      setFormStatus(form.status || 'published');
      
      // Load thank you settings
      if (form.thank_you_settings) {
        setThankYouMessage(form.thank_you_settings.message || "Thank you for your submission!");
        setAllowAnotherSubmission(form.thank_you_settings.allowAnotherSubmission ?? true);
        setShowResponseSummary(form.thank_you_settings.showResponseSummary ?? true);
        setShowCloseButton(form.thank_you_settings.showCloseButton ?? false);
        setAllowSocialShare(form.thank_you_settings.allowSocialShare ?? false);
        setRedirectUrl(form.thank_you_settings.redirectUrl || "");
        setRedirectDelay(form.thank_you_settings.redirectDelay || 0);
      }
      
      setShareUrl(`${window.location.origin}/f/${form.id}`);
      setLastSavedFormId(form.id);
      setLastSaveTime(new Date()); // Set initial save time
    } catch (error) {
      console.error('Error loading form:', error);
      alert('Failed to load form');
    } finally {
      setLoadingForm(false);
    }
  }

  // Auto-save functionality - saves after 2 seconds of inactivity
  React.useEffect(() => {
    // Don't auto-save while loading
    if (loadingForm) return;
    
    // Don't auto-save if form is empty
    if (formFields.length === 0 && formName === 'Untitled Form') return;
    
    // Clear existing timeout
    if (autoSaveTimeout.current) {
      clearTimeout(autoSaveTimeout.current);
    }
    
    // Set new timeout to save after 2 seconds of inactivity
    autoSaveTimeout.current = setTimeout(() => {
      if (!saving) {
        console.log('💾 Auto-saving form...');
        handleAutoSave();
      }
    }, 2000);
    
    // Cleanup
    return () => {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }
    };
  }, [formFields, formName, formDescription, formStatus, thankYouMessage, allowAnotherSubmission, showResponseSummary, showCloseButton, allowSocialShare, redirectUrl, redirectDelay, loadingForm]);

  // Auto-save when AI creates a form (immediate)
  React.useEffect(() => {
    if (shouldAutoSave.current && formFields.length > 0 && formName && !saving && !loadingForm && !isEditMode) {
      console.log('🤖 Auto-saving AI-generated form...');
      shouldAutoSave.current = false; // Reset flag
      handleAutoSave();
    }
  }, [formFields, formName, formDescription, saving, loadingForm, isEditMode]);

  // Update CSS variable for header margin (AI chat always visible but may be disabled)
  React.useEffect(() => {
    document.documentElement.style.setProperty(
      '--ai-chat-width',
      isChatOpen ? '384px' : '48px'
    );
  }, [isChatOpen]);

  // Fetch submissions when Report tab is active
  React.useEffect(() => {
    if (activeTab === "report" && (editingFormId || lastSavedFormId)) {
      const formId = editingFormId || lastSavedFormId;
      console.log('📊 Frontend: Fetching submissions for form:', formId);
      setLoadingSubmissions(true);
      fetch(`/api/forms/${formId}/submissions`)
        .then(async res => {
          const data = await res.json();
          if (!res.ok) {
            console.error('❌ API Error Response:', data);
            throw new Error(data.details || data.error || 'Failed to fetch');
          }
          return data;
        })
        .then(data => {
          console.log('📊 Frontend: Received submissions:', data.submissions?.length || 0);
          console.log('📊 Frontend: Submissions data:', data.submissions);
          setSubmissions(data.submissions || []);
          setLoadingSubmissions(false);
        })
        .catch(err => {
          console.error('❌ Frontend: Error fetching submissions:', err);
          setLoadingSubmissions(false);
        });
    }
  }, [activeTab, editingFormId, lastSavedFormId]);

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
        distance: 3, // Reduced distance for better responsiveness
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  // Custom modifiers to adjust cursor offset
  const modifiers = [
    (args: any) => {
      return {
        ...args.transform,
        y: args.transform.y - 20, // Adjust vertical offset so cursor aligns with indicator
      };
    },
  ];

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    
    // Check if it's a widget from the sidebar
    if (active.id.toString().startsWith("widget-")) {
      const widgetId = active.id.toString().replace("widget-", "");
      const widget = widgetTypes
        .flatMap((cat) => cat.items)
        .find((w) => w.id === widgetId);
      setActiveWidget(widget);
      setIsDraggingNewWidget(true);
    } else {
      setIsDraggingNewWidget(false);
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
    setIsDraggingNewWidget(false);
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


  const handleAutoSave = async () => {
    // Silent auto-save - no alerts
    if (formFields.length === 0) return;

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
          status: formStatus,
          thank_you_settings: {
            message: thankYouMessage,
            allowAnotherSubmission,
            showResponseSummary,
            showCloseButton,
            allowSocialShare,
            redirectUrl,
            redirectDelay,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save form');
      }

      const data = await response.json();
      
      // Save form ID and timestamp
      setLastSavedFormId(data.id || editingFormId);
      setLastSaveTime(new Date());
      
      // Set share URL
      if (data.shareUrl) {
        setShareUrl(data.shareUrl);
      }
      
      // If this was a new form, redirect to edit mode so the URL includes the form ID
      if (!isEditMode && data.id) {
        router.push(`/forms/builder?id=${data.id}`);
      }
      
      console.log('✅ Form auto-saved');
    } catch (error: any) {
      console.error('Auto-save error:', error);
      // Silent failure for auto-save
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (!lastSavedFormId && !editingFormId) {
      alert('Please add at least one field and wait for auto-save before previewing.');
      return;
    }
    
    const formId = lastSavedFormId || editingFormId;
    const previewUrl = `${window.location.origin}/f/${formId}?preview=true`;
    window.open(previewUrl, '_blank');
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
              {activeTab === "builder" ? (
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
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="text-white font-medium truncate max-w-xs">
                        {formName || "Untitled Form"}
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "builder" | "settings" | "publish" | "report")} className="w-auto">
                        <TabsList className="bg-[#1a1a1a]">
                          <TabsTrigger value="builder">Builder</TabsTrigger>
                          <TabsTrigger value="settings">Settings</TabsTrigger>
                          <TabsTrigger value="publish">Publish</TabsTrigger>
                          <TabsTrigger value="report">Report</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                    <div className="flex items-center gap-3 justify-end flex-1">
                      {/* Auto-save indicator */}
                      {saving && (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Saving...</span>
                        </div>
                      )}
                      {!saving && lastSaveTime && (
                        <div className="text-xs text-gray-500">
                          Saved {formatTimeSince(lastSaveTime)}
                        </div>
                      )}
                      
                      {/* Preview button */}
                      <Button 
                        size="sm" 
                        className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a]"
                        onClick={handlePreview}
                        disabled={saving || loadingForm || (!lastSavedFormId && !editingFormId)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
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
                <SortableContext
                  items={formFields.map((f) => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {formFields.length === 0 ? (
                      <div className="flex items-center justify-center py-24 text-center">
                        <p className="text-gray-500 text-lg">
                          Drag widgets onto the builder to start, or chat with AI to generate your form
                        </p>
                      </div>
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
                            isDraggingNewWidget={isDraggingNewWidget}
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
              ) : activeTab === "settings" ? (
                <>
                  {/* Settings View */}
                  {/* Left Panel - Settings Navigation */}
                  <div className="w-80 border-r border-white bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#000000] overflow-y-auto shadow-sm">
                    <div className="p-3 space-y-1">
                      <button
                        onClick={() => setActiveSettingsSection("general")}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                          activeSettingsSection === "general"
                            ? "bg-[#c4dfc4]/20 text-white font-medium"
                            : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                        }`}
                      >
                        <div className="text-sm">General</div>
                        <div className="text-xs text-gray-500">Name, status, description</div>
                      </button>
                      
                      <button
                        onClick={() => setActiveSettingsSection("thankyou")}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                          activeSettingsSection === "thankyou"
                            ? "bg-[#c4dfc4]/20 text-white font-medium"
                            : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                        }`}
                      >
                        <div className="text-sm">Thank You Page</div>
                        <div className="text-xs text-gray-500">Post-submission experience</div>
                      </button>
                    </div>
                  </div>

                  {/* Middle Panel - Settings Content */}
                  <div className="flex-1 bg-gradient-to-b from-[#000000] to-[#0a0a0a] flex flex-col" style={{ marginRight: 'var(--ai-chat-width, 48px)' }}>
                    {/* Settings Sub-Header */}
                    <div className="sticky top-0 z-30 border-b border-white bg-gradient-to-r from-[#000000] to-[#0a0a0a]">
                      <div className="flex items-center justify-between gap-4 px-6 py-2">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="text-white font-medium truncate max-w-xs">
                            {formName || "Untitled Form"}
                          </div>
                        </div>
                        <div className="flex items-center justify-center">
                          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "builder" | "settings" | "publish" | "report")} className="w-auto">
                            <TabsList className="bg-[#1a1a1a]">
                              <TabsTrigger value="builder">Builder</TabsTrigger>
                              <TabsTrigger value="settings">Settings</TabsTrigger>
                              <TabsTrigger value="publish">Publish</TabsTrigger>
                              <TabsTrigger value="report">Report</TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </div>
                        <div className="flex items-center gap-3 justify-end flex-1">
                          {/* Auto-save indicator */}
                          {saving && (
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Saving...</span>
                            </div>
                          )}
                          {!saving && lastSaveTime && (
                            <div className="text-xs text-gray-500">
                              Saved {formatTimeSince(lastSaveTime)}
                            </div>
                          )}
                          
                          {/* Preview button */}
                          <Button 
                            size="sm" 
                            className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a]"
                            onClick={handlePreview}
                            disabled={saving || loadingForm || (!lastSavedFormId && !editingFormId)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Settings Content */}
                    <div className="flex-1 overflow-y-auto">
                      <ScrollArea className="h-full p-8">
                        <Card className="max-w-2xl mx-auto p-8 bg-[#1a1a1a] border-border/50">
                          {activeSettingsSection === "general" && (
                          <div className="space-y-8">
                            {/* Form Name */}
                            <div className="space-y-3">
                              <label className="text-sm font-medium text-gray-300">Form Name</label>
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
                                  className="text-2xl font-bold border-2 border-[#c4dfc4]/30 focus:border-[#c4dfc4] px-4 py-3 bg-[#0a0a0a] text-gray-100"
                                  placeholder="Untitled Form"
                                />
                              ) : (
                                <div
                                  onClick={() => setIsEditingFormName(true)}
                                  className="text-2xl font-bold cursor-text text-gray-100 hover:text-gray-300 transition-colors border-2 border-transparent hover:border-[#c4dfc4]/30 px-4 py-3 rounded-lg"
                                >
                                  {formName || "Untitled Form"}
                                </div>
                              )}
                            </div>

                            {/* Form Description */}
                            <div className="space-y-3">
                              <label className="text-sm font-medium text-gray-300">Form Description</label>
                              <textarea
                                value={formDescription}
                                onChange={(e) => setFormDescription(e.target.value)}
                                rows={3}
                                className="w-full rounded-lg border-2 border-border/50 bg-[#0a0a0a] px-4 py-3 text-base text-gray-100 focus:border-[#c4dfc4] focus:outline-none transition-colors resize-none"
                                placeholder="Add a description for your form..."
                              />
                              <p className="text-xs text-gray-400 italic">This description helps users understand the purpose of your form</p>
                            </div>
                          </div>
                          )}

                          {activeSettingsSection === "thankyou" && (
                          <div className="space-y-8">
                            {/* Section Header */}
                            <div>
                              <h3 className="text-xl font-semibold text-white mb-2">Thank You Page</h3>
                              <p className="text-sm text-gray-400">Customize what users see after submitting your form</p>
                            </div>

                            {/* Thank You Message */}
                            <div className="space-y-3">
                              <label className="text-sm font-medium text-gray-300">Thank You Message</label>
                              <textarea
                                value={thankYouMessage}
                                onChange={(e) => setThankYouMessage(e.target.value)}
                                rows={4}
                                className="w-full rounded-lg border-2 border-border/50 bg-[#0a0a0a] px-4 py-3 text-base text-gray-100 focus:border-[#c4dfc4] focus:outline-none transition-colors resize-none"
                                placeholder="Enter your thank you message..."
                              />
                              <p className="text-xs text-gray-400 italic">This message will be displayed to users after they submit the form</p>
                            </div>

                            {/* Post-Submission Options */}
                            <div className="space-y-4">
                              <h4 className="text-base font-medium text-white">Post-Submission Options</h4>
                              
                              {/* Allow Another Submission */}
                              <div className="flex items-start gap-3 p-4 rounded-lg bg-[#0a0a0a] border border-border/30">
                                <input
                                  type="checkbox"
                                  id="allowAnother"
                                  checked={allowAnotherSubmission}
                                  onChange={(e) => setAllowAnotherSubmission(e.target.checked)}
                                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#c4dfc4] focus:ring-[#c4dfc4]"
                                />
                                <div className="flex-1">
                                  <label htmlFor="allowAnother" className="text-sm font-medium text-gray-200 cursor-pointer">
                                    Allow another submission
                                  </label>
                                  <p className="text-xs text-gray-500 mt-1">Users can click a button to submit another response</p>
                                </div>
                              </div>

                              {/* Show Response Summary */}
                              <div className="flex items-start gap-3 p-4 rounded-lg bg-[#0a0a0a] border border-border/30">
                                <input
                                  type="checkbox"
                                  id="showSummary"
                                  checked={showResponseSummary}
                                  onChange={(e) => setShowResponseSummary(e.target.checked)}
                                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#c4dfc4] focus:ring-[#c4dfc4]"
                                />
                                <div className="flex-1">
                                  <label htmlFor="showSummary" className="text-sm font-medium text-gray-200 cursor-pointer">
                                    Show response summary
                                  </label>
                                  <p className="text-xs text-gray-500 mt-1">Display a summary of what the user submitted</p>
                                </div>
                              </div>

                              {/* Show Close Button */}
                              <div className="flex items-start gap-3 p-4 rounded-lg bg-[#0a0a0a] border border-border/30">
                                <input
                                  type="checkbox"
                                  id="showClose"
                                  checked={showCloseButton}
                                  onChange={(e) => setShowCloseButton(e.target.checked)}
                                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#c4dfc4] focus:ring-[#c4dfc4]"
                                />
                                <div className="flex-1">
                                  <label htmlFor="showClose" className="text-sm font-medium text-gray-200 cursor-pointer">
                                    Show close button
                                  </label>
                                  <p className="text-xs text-gray-500 mt-1">Display a button to close/exit the form</p>
                                </div>
                              </div>

                              {/* Allow Social Sharing */}
                              <div className="flex items-start gap-3 p-4 rounded-lg bg-[#0a0a0a] border border-border/30">
                                <input
                                  type="checkbox"
                                  id="socialShare"
                                  checked={allowSocialShare}
                                  onChange={(e) => setAllowSocialShare(e.target.checked)}
                                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#c4dfc4] focus:ring-[#c4dfc4]"
                                />
                                <div className="flex-1">
                                  <label htmlFor="socialShare" className="text-sm font-medium text-gray-200 cursor-pointer">
                                    Allow social sharing
                                  </label>
                                  <p className="text-xs text-gray-500 mt-1">Let users share this form on social media</p>
                                </div>
                              </div>
                            </div>

                            {/* Auto-Redirect */}
                            <div className="space-y-4">
                              <h4 className="text-base font-medium text-white">Auto-Redirect (Optional)</h4>
                              
                              <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-300">Redirect URL</label>
                                <Input
                                  value={redirectUrl}
                                  onChange={(e) => setRedirectUrl(e.target.value)}
                                  className="bg-[#0a0a0a] border-border/50 text-gray-100"
                                  placeholder="https://example.com/thank-you"
                                />
                                <p className="text-xs text-gray-400 italic">Leave empty to stay on the thank you page</p>
                              </div>

                              {redirectUrl && (
                                <div className="space-y-3">
                                  <label className="text-sm font-medium text-gray-300">Redirect Delay (seconds)</label>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="30"
                                    value={redirectDelay}
                                    onChange={(e) => setRedirectDelay(parseInt(e.target.value) || 0)}
                                    className="bg-[#0a0a0a] border-border/50 text-gray-100"
                                  />
                                  <p className="text-xs text-gray-400 italic">
                                    {redirectDelay === 0 
                                      ? "Redirect immediately after submission" 
                                      : `Wait ${redirectDelay} second${redirectDelay === 1 ? '' : 's'} before redirecting`}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Preview */}
                            <div className="space-y-3">
                              <h4 className="text-base font-medium text-white">Preview</h4>
                              <div className="p-6 rounded-lg bg-gradient-to-br from-[#c4dfc4]/10 to-[#b5d0b5]/10 border-2 border-[#c4dfc4]/30">
                                <div className="text-center space-y-4">
                                  <div className="text-4xl">✓</div>
                                  <p className="text-lg font-medium text-white whitespace-pre-wrap">{thankYouMessage}</p>
                                  
                                  {showResponseSummary && (
                                    <div className="text-sm text-gray-400 italic">
                                      [Response summary would appear here]
                                    </div>
                                  )}
                                  
                                  <div className="flex flex-wrap gap-2 justify-center pt-4">
                                    {allowAnotherSubmission && (
                                      <div className="px-4 py-2 rounded-lg bg-[#c4dfc4] text-[#0a0a0a] text-sm font-medium">
                                        Submit Another Response
                                      </div>
                                    )}
                                    {showCloseButton && (
                                      <div className="px-4 py-2 rounded-lg border-2 border-gray-600 text-gray-300 text-sm font-medium">
                                        Close
                                      </div>
                                    )}
                                    {allowSocialShare && (
                                      <div className="px-4 py-2 rounded-lg border-2 border-gray-600 text-gray-300 text-sm font-medium">
                                        Share
                                      </div>
                                    )}
                                  </div>

                                  {redirectUrl && (
                                    <p className="text-xs text-gray-500 italic pt-2">
                                      {redirectDelay === 0 
                                        ? "Redirecting now..." 
                                        : `Redirecting in ${redirectDelay} second${redirectDelay === 1 ? '' : 's'}...`}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          )}
                        </Card>
                      </ScrollArea>
                    </div>
                  </div>
                </>
              ) : activeTab === "publish" ? (
                <>
                  {/* Publish View */}
                  {/* Left Panel - Publish Navigation */}
                  <div className="w-80 border-r border-white bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#000000] overflow-y-auto shadow-sm">
                    <div className="p-3 space-y-1">
                      <button
                        onClick={() => setActivePublishSection("share")}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                          activePublishSection === "share"
                            ? "bg-[#c4dfc4]/20 text-white font-medium"
                            : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                        }`}
                      >
                        <div className="text-sm">Share</div>
                        <div className="text-xs text-gray-500">Links and sharing options</div>
                      </button>
                    </div>
                  </div>

                  {/* Middle Panel - Publish Content */}
                  <div className="flex-1 bg-gradient-to-b from-[#000000] to-[#0a0a0a] flex flex-col" style={{ marginRight: 'var(--ai-chat-width, 48px)' }}>
                    {/* Publish Sub-Header */}
                    <div className="sticky top-0 z-30 border-b border-white bg-gradient-to-r from-[#000000] to-[#0a0a0a]">
                      <div className="flex items-center justify-between gap-4 px-6 py-2">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="text-white font-medium truncate max-w-xs">
                            {formName || "Untitled Form"}
                          </div>
                        </div>
                        <div className="flex items-center justify-center">
                          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "builder" | "settings" | "publish" | "report")} className="w-auto">
                            <TabsList className="bg-[#1a1a1a]">
                              <TabsTrigger value="builder">Builder</TabsTrigger>
                              <TabsTrigger value="settings">Settings</TabsTrigger>
                              <TabsTrigger value="publish">Publish</TabsTrigger>
                              <TabsTrigger value="report">Report</TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </div>
                        <div className="flex items-center gap-3 justify-end flex-1">
                          {/* Auto-save indicator */}
                          {saving && (
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Saving...</span>
                            </div>
                          )}
                          {!saving && lastSaveTime && (
                            <div className="text-xs text-gray-500">
                              Saved {formatTimeSince(lastSaveTime)}
                            </div>
                          )}
                          
                          {/* Preview button */}
                          <Button 
                            size="sm" 
                            className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a]"
                            onClick={handlePreview}
                            disabled={saving || loadingForm || (!lastSavedFormId && !editingFormId)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Publish Content */}
                    <div className="flex-1 overflow-y-auto">
                      <ScrollArea className="h-full p-8">
                        <Card className="max-w-2xl mx-auto p-8 bg-[#1a1a1a] border-border/50">
                          {activePublishSection === "share" && (
                          <div className="space-y-8">
                            {/* Form Status */}
                            <div className="space-y-3">
                              <label className="text-sm font-medium text-gray-300">Form Status</label>
                              <select
                                value={formStatus}
                                onChange={(e) => setFormStatus(e.target.value as "published" | "draft")}
                                className="w-full rounded-lg border-2 border-border/50 bg-[#0a0a0a] px-4 py-3 text-base text-gray-100 focus:border-[#c4dfc4] focus:outline-none transition-colors"
                              >
                                <option value="published">Published - Can receive responses</option>
                                <option value="draft">Draft - Preview mode only</option>
                              </select>
                              <p className="text-xs text-gray-400 italic">
                                {formStatus === "published" 
                                  ? "This form is live and can collect responses from users."
                                  : "This form is a draft and will only work in preview mode."}
                              </p>
                            </div>
                            
                            {shareUrl && (
                              <div>
                                <label className="text-sm font-medium text-gray-300 block mb-2">Form URL</label>
                                <div className="flex gap-2">
                                  <Input
                                    value={shareUrl}
                                    readOnly
                                    className="bg-[#0a0a0a] border-border/50 text-gray-100 font-mono text-sm"
                                  />
                                  <Button
                                    onClick={() => {
                                      navigator.clipboard.writeText(shareUrl);
                                      alert('Link copied to clipboard!');
                                    }}
                                    className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a]"
                                  >
                                    Copy
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                          )}
                        </Card>
                      </ScrollArea>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Report View */}
                  {/* Left Panel - Responses List */}
                  <div className="w-80 border-r border-white bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#000000] overflow-y-auto shadow-sm">
                    <div className="p-3 space-y-1">
                      {/* All Responses (Summary View) */}
                      <button
                        onClick={() => setSelectedResponseId("all")}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                          selectedResponseId === "all"
                            ? "bg-[#c4dfc4]/20 text-white font-medium"
                            : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                        }`}
                      >
                        <div className="text-sm">All Responses</div>
                        <div className="text-xs text-gray-500">{submissions.length} total submissions</div>
                      </button>

                      {/* Individual Responses */}
                      {loadingSubmissions ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-[#c4dfc4]" />
                        </div>
                      ) : submissions.length > 0 ? (
                        <>
                          <Separator className="my-3 bg-white/10" />
                          <div className="space-y-1">
                            {submissions.map((submission: any) => {
                              const submittedDate = new Date(submission.submitted_at).toLocaleString();
                              const identifier = submission.data?.email || 
                                                submission.data?.name || 
                                                `Response ${submission.id.toString().slice(0, 8)}`;
                              
                              return (
                                <button
                                  key={submission.id}
                                  onClick={() => setSelectedResponseId(submission.id)}
                                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                                    selectedResponseId === submission.id
                                      ? "bg-[#c4dfc4]/20 text-white font-medium"
                                      : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                                  }`}
                                >
                                  <div className="text-sm truncate">{identifier}</div>
                                  <div className="text-xs text-gray-500">{submittedDate}</div>
                                </button>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <div className="px-4 py-8 text-center text-gray-500 text-sm">
                          No responses yet
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Middle Panel - Report Content */}
                  <div className="flex-1 bg-gradient-to-b from-[#000000] to-[#0a0a0a] flex flex-col" style={{ marginRight: 'var(--ai-chat-width, 48px)' }}>
                    {/* Report Sub-Header */}
                    <div className="sticky top-0 z-30 border-b border-white bg-gradient-to-r from-[#000000] to-[#0a0a0a]">
                      <div className="flex items-center justify-between gap-4 px-6 py-2">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="text-white font-medium truncate max-w-xs">
                            {formName || "Untitled Form"}
                          </div>
                        </div>
                        <div className="flex items-center justify-center">
                          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "builder" | "settings" | "publish" | "report")} className="w-auto">
                            <TabsList className="bg-[#1a1a1a]">
                              <TabsTrigger value="builder">Builder</TabsTrigger>
                              <TabsTrigger value="settings">Settings</TabsTrigger>
                              <TabsTrigger value="publish">Publish</TabsTrigger>
                              <TabsTrigger value="report">Report</TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </div>
                        <div className="flex items-center gap-3 justify-end flex-1">
                          {/* Auto-save indicator */}
                          {saving && (
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Saving...</span>
                            </div>
                          )}
                          {!saving && lastSaveTime && (
                            <div className="text-xs text-gray-500">
                              Saved {formatTimeSince(lastSaveTime)}
                            </div>
                          )}
                          
                          <Button 
                            size="sm" 
                            className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a]"
                            onClick={handlePreview}
                            disabled={saving || loadingForm || (!lastSavedFormId && !editingFormId)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Report Content */}
                    <div className="flex-1 overflow-y-auto">
                      <ScrollArea className="h-full p-8">
                        {submissions.length === 0 ? (
                          <Card className="max-w-2xl mx-auto p-12 bg-[#1a1a1a] border-border/50 text-center">
                            <h3 className="text-xl font-semibold text-white mb-2">No Responses Yet</h3>
                            <p className="text-gray-400">
                              Responses will appear here once people start submitting your form.
                            </p>
                          </Card>
                        ) : selectedResponseId === "all" ? (
                          <Card className="max-w-4xl mx-auto p-8 bg-[#1a1a1a] border-border/50">
                            <div className="space-y-6">
                              {/* Summary Stats */}
                              <div>
                                <h2 className="text-2xl font-bold text-white mb-4">All Responses</h2>
                                <div className="grid grid-cols-2 gap-4">
                                  <Card className="p-4 bg-[#0a0a0a] border-border/50">
                                    <div className="text-sm text-gray-400">Total Submissions</div>
                                    <div className="text-3xl font-bold text-white mt-1">{submissions.length}</div>
                                  </Card>
                                  <Card className="p-4 bg-[#0a0a0a] border-border/50">
                                    <div className="text-sm text-gray-400">Last Submission</div>
                                    <div className="text-lg font-medium text-white mt-1">
                                      {submissions.length > 0 
                                        ? new Date(submissions[0].submitted_at).toLocaleDateString()
                                        : 'N/A'
                                      }
                                    </div>
                                  </Card>
                                </div>
                              </div>

                              {/* Export Button */}
                              <div>
                                <Button
                                  className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a]"
                                  onClick={() => {
                                    // TODO: Implement CSV export
                                    alert('CSV export coming soon!');
                                  }}
                                >
                                  Export as CSV
                                </Button>
                              </div>

                              {/* Responses Table */}
                              <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Recent Submissions</h3>
                                <div className="space-y-2">
                                  {submissions.map((submission: any) => (
                                    <Card 
                                      key={submission.id}
                                      className="p-4 bg-[#0a0a0a] border-border/50 cursor-pointer hover:bg-[#0a0a0a]/80 transition-colors"
                                      onClick={() => setSelectedResponseId(submission.id)}
                                    >
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <div className="text-sm font-medium text-white">
                                            {submission.data?.email || 
                                             submission.data?.name || 
                                             `Response ${submission.id.toString().slice(0, 8)}`}
                                          </div>
                                          <div className="text-xs text-gray-500 mt-1">
                                            {new Date(submission.submitted_at).toLocaleString()}
                                          </div>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                          View Details
                                        </Badge>
                                      </div>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </Card>
                        ) : (
                          (() => {
                            const submission = submissions.find((s: any) => s.id === selectedResponseId);
                            if (!submission) return null;
                            
                            return (
                              <Card className="max-w-2xl mx-auto p-8 bg-[#1a1a1a] border-border/50">
                                <div className="space-y-6">
                                  <div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Response Details</h2>
                                    <p className="text-sm text-gray-400">
                                      Submitted: {new Date(submission.submitted_at).toLocaleString()}
                                    </p>
                                  </div>

                                  <Separator className="bg-white/10" />

                                  {/* Response Data */}
                                  <div className="space-y-4">
                                    {Object.entries(submission.data || {}).map(([key, value]: [string, any]) => (
                                      <div key={key} className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300 capitalize">
                                          {key.replace(/_/g, ' ')}
                                        </label>
                                        <div className="p-3 rounded-lg bg-[#0a0a0a] border border-border/50 text-white">
                                          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </Card>
                            );
                          })()
                        )}
                      </ScrollArea>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          </DndContext>
        )}
      </AppLayout>

      {/* Right Panel - AI Chat - Dynamic with Real API - Always visible but disabled on Settings/Publish */}
      <AIChatPanel
        isOpen={isChatOpen}
        onToggle={toggleChat}
        formId={editingFormId}
        currentPage="builder"
        currentFields={formFields}
        disabled={activeTab !== "builder"}
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

      <DragOverlay dropAnimation={null} modifiers={modifiers}>
          {activeWidget ? (
            <Card
              className="p-3 shadow-2xl border-2 rotate-3 opacity-90 cursor-grabbing"
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
