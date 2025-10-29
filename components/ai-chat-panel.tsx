"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sparkles, Send, PanelRightClose, PanelRightOpen, Loader2, Upload, FileSpreadsheet, X, ImagePlus, CheckCircle2, Plus, Mic, MicOff } from "lucide-react";
import type { FormField as FrontendFormField } from "@/app/forms/builder/page";
import type { FormSchema } from "@/lib/types/form-schema";
import { toast } from "sonner";
import { convertBackendFormToFrontend } from "@/lib/converters/form-types";
import { parseExcelFile, generateFormPrompt, type ParsedExcelData } from "@/lib/utils/excel-parser";
import { useAuth } from "@/lib/auth/auth-context";

type AIMode = 'strategy' | 'execution';

interface Message {
  role: "user" | "assistant";
  content: string;
  displayContent?: string;  // Cleaned text for display during streaming
  thinking?: string[];      // Operation indicators like "🔨 Creating form..."
  completed?: boolean;      // Mark as completed to show checkmark instead of spinner
  mode?: AIMode;           // What mode AI is operating in
}

interface AIChatPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  formId?: string | null;  // Current form ID or null for new forms
  currentPage?: 'builder' | 'distribution'; // What page/tab user is on
  context?: 'forms' | 'workflows';  // What context AI should operate in
  onFormUpdate?: (fields: FrontendFormField[], formMeta?: { title?: string; description?: string }) => void;
  currentFields?: FrontendFormField[];
  disabled?: boolean;  // Show as disabled with overlay (for Settings/Publish tabs)
  autoSubmitPrompt?: string;  // Auto-submit this prompt on mount
  onPromptSubmitted?: () => void;  // Callback when auto-submit completes
  onWorkflowCreated?: () => void;  // Callback when workflow is created
}

export function AIChatPanel({
  isOpen,
  onToggle,
  formId,
  currentPage = 'builder',
  context = 'forms',
  onFormUpdate,
  currentFields = [],
  disabled = false,
  autoSubmitPrompt,
  onPromptSubmitted,
  onWorkflowCreated
}: AIChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const processedMessageIds = useRef<Set<string>>(new Set());
  const [aiMode, setAiMode] = useState<AIMode | 'auto'>('auto'); // auto, strategy, or execution
  const [detectedMode, setDetectedMode] = useState<AIMode>('strategy');
  const previousFormIdRef = useRef<string | null | undefined>(undefined);
  const hasAutoSubmitted = useRef(false);
  const { workspaceId } = useAuth();
  
  // Track initial load to avoid reprocessing messages from database
  const isInitialLoad = useRef(true);
  const previousMessageCount = useRef(0);

  // Generate conversation ID based on context
  const getConversationId = (): string | null => {
    if (context === 'workflows' && workspaceId) {
      return `workflows_builder_${workspaceId}`;
    }
    if (formId && formId !== 'new') {
      return formId; // Use actual form ID
    }
    if (formId === 'new' && workspaceId) {
      return `new_form_${workspaceId}`;
    }
    return null;
  };

  const conversationId = getConversationId();

  // Ensure client-only rendering to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Cursor-style scroll: new messages appear at TOP of visible panel
  useEffect(() => {
    if (messages.length > 0 && scrollRef.current) {
      // Get the last message element (most recent)
      const messageElements = scrollRef.current.querySelectorAll('.space-y-4 > div');
      const lastMessage = messageElements[messageElements.length - 1];
      
      if (lastMessage) {
        // Scroll so the last message appears at the TOP of the chat panel
        lastMessage.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
      }
    }
  }, [messages.length]); // Only trigger when new messages arrive

  // Auto-submit prompt if provided (for "Let AI Build Draft" flow)
  useEffect(() => {
    if (autoSubmitPrompt && isMounted && !hasAutoSubmitted.current && !isLoading) {
      console.log('🤖 Auto-submitting AI prompt:', autoSubmitPrompt);
      hasAutoSubmitted.current = true;

      // Wait a moment for the component to fully render
      setTimeout(() => {
        handleSubmit(null, autoSubmitPrompt);
        onPromptSubmitted?.();
      }, 500);
    }
  }, [autoSubmitPrompt, isMounted, isLoading]);

  // Load conversation history when conversation ID changes
  useEffect(() => {
    if (!conversationId) {
      console.log('📝 No conversation ID, skipping load');
      return;
    }

    // Load existing conversation
    async function loadConversation() {
      try {
        console.log(`📝 Loading conversation: ${conversationId}`);
        const response = await fetch(`/api/ai/conversations/${conversationId}`);
        const data = await response.json();

        if (data.messages && data.messages.length > 0) {
          console.log(`📝 Loaded ${data.messages.length} messages for ${conversationId}`);
          setMessages(data.messages);
        } else {
          console.log(`📝 No saved conversation for ${conversationId}`);
          setMessages([]);
        }
      } catch (error) {
        console.error('❌ Error loading conversation:', error);
        setMessages([]);
      }
    }

    loadConversation();
  }, [conversationId]);

  // Save conversation to database after each message exchange
  useEffect(() => {
    console.log(`🔍 Save effect triggered - conversationId: ${conversationId}, messages: ${messages.length}`);

    if (!conversationId || messages.length === 0) {
      console.log(`⏭️ Skipping save - conversationId: ${conversationId}, messages.length: ${messages.length}`);
      return;
    }

    console.log(`⏰ Scheduling save in 1 second for conversation ${conversationId}...`);

    // Debounce saves to avoid excessive writes
    const timeoutId = setTimeout(async () => {
      console.log(`💾 Attempting to save ${messages.length} messages for conversation ${conversationId}...`);

      // Check if messages can be stringified
      try {
        const testStringify = JSON.stringify({ messages });
        console.log(`✅ Request body can be stringified, size: ${testStringify.length} bytes`);
        console.log(`📋 Message roles:`, messages.map(m => m.role));
      } catch (stringifyError) {
        console.error(`❌ Cannot stringify messages:`, stringifyError);
        return;
      }

      try {
        const response = await fetch(`/api/ai/conversations/${conversationId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Save failed with status ${response.status}:`, errorText);
          return;
        }

        const data = await response.json();
        console.log(`✅ Saved ${messages.length} messages for conversation ${conversationId}`, data);
      } catch (error) {
        console.error('❌ Error saving conversation:', error);
      }
    }, 1000); // 1 second debounce

    return () => {
      console.log(`🧹 Clearing save timeout for conversation ${conversationId}`);
      clearTimeout(timeoutId);
    };
  }, [messages, conversationId]);

  // Handle Excel file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's an Excel file
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv');
    if (!isExcel) {
      toast.error('Invalid file type', {
        description: 'Please upload an Excel file (.xlsx, .xls, or .csv)',
      });
      return;
    }

    setUploadedFile(file);
    setIsParsingFile(true);

    try {
      // Parse the Excel file
      const parsedData = await parseExcelFile(file);
      console.log('📊 Parsed Excel data:', parsedData);

      // Generate a prompt for the AI
      const prompt = generateFormPrompt(parsedData);
      console.log('🤖 Generated prompt:', prompt);

      // Add user message showing file upload
      setMessages(prev => [...prev, {
        role: 'user',
        content: `📎 Uploaded: ${file.name}\n\n${prompt}`
      }]);

      // Auto-submit to AI
      await handleSubmit(null, prompt);

    } catch (error) {
      console.error('Failed to parse Excel file:', error);
      toast.error('Failed to parse Excel file', {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsParsingFile(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle Image file upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's an image file
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      toast.error('Invalid file type', {
        description: 'Please upload an image file (JPG, PNG, etc.)',
      });
      return;
    }

    setUploadedImage(file);
    setIsParsingFile(true);

    try {
      console.log('📸 Processing image:', file.name, file.type, file.size);

      // Convert image to base64
      const reader = new FileReader();
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        throw new Error('Failed to read image file');
      };

      reader.onload = async (e) => {
        try {
          const base64Image = e.target?.result as string;
          console.log('✅ Image converted to base64, size:', base64Image.length);

          // Create a prompt for Claude Vision to analyze the image
          const prompt = `I've uploaded an image of a form or checklist. Please analyze this image and extract all the questions/fields you can see. Then create a digital form with those fields.

**Instructions:**
1. Read all text in the image carefully
2. Identify each question or field
3. Determine the appropriate field type for each (text, yes/no, multiple choice, number, date, etc.)
4. Preserve the original order and wording
5. Create the form using CREATE_FORM with all fields

Please extract and build the form now.`;

          // Add user message showing image upload
          setMessages(prev => [...prev, {
            role: 'user',
            content: `🖼️ Uploaded image: ${file.name}`
          }]);

          console.log('🚀 Sending image to API...');

          // Send to API with image data
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [...messages, {
                role: 'user',
                content: prompt
              }],
              image: base64Image, // Send image data
              currentPage,
              currentFields,
              workspaceId, // Send workspace ID for context
              context, // Send context type (forms or workflows)
            }),
          });

          console.log('📡 API response status:', response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('API error response:', errorText);
            throw new Error(`API error: ${response.status} - ${errorText}`);
          }

          const responseReader = response.body?.getReader();
          const decoder = new TextDecoder();
          let aiResponse = '';

          if (responseReader) {
            console.log('📖 Reading streamed response...');
            while (true) {
              const { done, value } = await responseReader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('0:')) {
                  const content = line.slice(2).trim().replace(/^"|"$/g, '');
                  if (content) {
                    aiResponse += content;
                  }
                }
              }
            }
            console.log('✅ Response complete, length:', aiResponse.length);
          }

          setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
          setIsParsingFile(false);
          setUploadedImage(null);
        } catch (innerError) {
          console.error('Error in onload handler:', innerError);
          throw innerError;
        }
      };

      reader.readAsDataURL(file);

    } catch (error) {
      console.error('❌ Failed to process image:', error);
      toast.error('Failed to process image', {
        description: error instanceof Error ? error.message : String(error),
      });
      setIsParsingFile(false);
      setUploadedImage(null);
    } finally {
      // Reset file input
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  // Clean message for display (doesn't modify state, just for rendering)
  const cleanMessageForDisplay = (msg: string) => {
    // Remove tool call blocks (all formats)
    let cleaned = msg.replace(/<tool name="[^"]*">\s*\{[\s\S]*?\}\s*<\/tool>/g, '');
    cleaned = cleaned.replace(/```\s*(?:add_field|create_form|update_field|remove_field|move_field|validate_form_schema)\s*\([^)]*\{[\s\S]*?\}\s*\)\s*```/g, '');
    cleaned = cleaned.replace(/(?:add_field|create_form|update_field|remove_field|move_field|validate_form_schema)\s*\(\s*\{[\s\S]*?\}\s*\)/g, '');

    // Remove mode announcements (redundant with badge)
    cleaned = cleaned.replace(/⚡\s*EXECUTION\s*Mode:?\s*/gi, '');
    cleaned = cleaned.replace(/🎯\s*STRATEGY\s*Mode:?\s*/gi, '');
    cleaned = cleaned.replace(/\[?(EXECUTION|STRATEGY)\s*Mode\]?:?\s*/gi, '');

    // Remove form operations - use same flexible regex as parser
    // This handles compact JSON without newlines and nested braces
    cleaned = cleaned.replace(/CREATE_FORM:\s*\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}/g, '');
    cleaned = cleaned.replace(/ADD_FIELD:\s*\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}/g, '');
    cleaned = cleaned.replace(/UPDATE_FIELD:\s*\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}/g, '');
    cleaned = cleaned.replace(/UPDATE_FORM_META:\s*\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}/g, '');
    cleaned = cleaned.replace(/REMOVE_FIELD:\s*\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}/g, '');
    cleaned = cleaned.replace(/MOVE_FIELD:\s*\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}/g, '');
    cleaned = cleaned.replace(/CLEAR_FORM:\s*\{\s*\}/g, '');
    cleaned = cleaned.replace(/CREATE_WORKFLOW:\s*\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}/g, '');

    // Remove reporting operations
    cleaned = cleaned.replace(/ADD_CHART:\s*```json[\s\S]*?```/g, '');
    cleaned = cleaned.replace(/ADD_INSIGHT:\s*```json[\s\S]*?```/g, '');
    cleaned = cleaned.replace(/UPDATE_SECTION:\s*```json[\s\S]*?```/g, '');
    cleaned = cleaned.replace(/REMOVE_SECTION:\s*```json[\s\S]*?```/g, '');
    cleaned = cleaned.replace(/GENERATE_REPORT:\s*```json[\s\S]*?```/g, '');

    // Clean up extra whitespace
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();

    // Only return fallback if message is completely empty
    // Allow short conversational responses through
    if (cleaned.length === 0 || cleaned === '') {
      return '✓ Done';
    }

    return cleaned;
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Watch for AI messages and extract form data from text
  // Only run when a COMPLETE message is received (not during streaming)
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    // Skip if no message, not from assistant, or currently loading (streaming)
    if (!lastMessage || lastMessage.role !== 'assistant' || isLoading) {
      return;
    }

    // 🚨 CRITICAL FIX: Only process NEW messages, not messages from initial conversation load
    // If this is the initial load (conversation just loaded from DB), mark it and skip processing
    if (isInitialLoad.current) {
      console.log('📂 Initial conversation load detected - skipping processing to avoid duplicates');
      isInitialLoad.current = false;
      previousMessageCount.current = messages.length;
      
      // Load processed IDs from localStorage for this conversation
      if (conversationId) {
        const storedIds = localStorage.getItem(`processed_${conversationId}`);
        if (storedIds) {
          try {
            const ids = JSON.parse(storedIds);
            processedMessageIds.current = new Set(ids);
            console.log(`📋 Loaded ${ids.length} processed message IDs from storage`);
          } catch (e) {
            console.warn('Failed to parse stored processed IDs', e);
          }
        }
      }
      return;
    }

    // Only process if message count increased (new message arrived)
    if (messages.length <= previousMessageCount.current) {
      console.log('⏸️ Message count unchanged - skipping processing');
      return;
    }
    previousMessageCount.current = messages.length;

    // Create a unique ID for this message to avoid reprocessing
    const messageId = `${lastMessage.content.substring(0, 100)}-${messages.length}-${Date.now()}`;

    // Skip if we've already processed this message
    if (processedMessageIds.current.has(messageId)) {
      console.log('⏭️ Already processed this message, skipping...');
      return;
    }

    console.log('🔄 Processing NEW AI message...');
    console.log('📨 Last message:', lastMessage);

    // Mark as processed BEFORE doing any work
    processedMessageIds.current.add(messageId);
    
    // Persist to localStorage
    if (conversationId) {
      try {
        const idsArray = Array.from(processedMessageIds.current);
        localStorage.setItem(`processed_${conversationId}`, JSON.stringify(idsArray));
        console.log('💾 Saved processed message ID to storage');
      } catch (e) {
        console.warn('Failed to save processed IDs', e);
      }
    }

    try {
      const content = lastMessage.content;
      console.log('📝 Parsing complete message (length:', content.length, ')');
      console.log('🎯 Current Page:', currentPage);

      // FORM MODE: Parse form operations
      // Extract create_form calls from multiple formats:
      // Format 1: CREATE_FORM:\n{...} (capture until we find a closing brace at the start of a line or followed by narrative text)
      // Format 2: <tool name="create_form">{...}</tool>
      // Format 3: create_form({...})

      // Better regex: capture from CREATE_FORM: to the end of the JSON object
      // Match CREATE_FORM: followed by JSON, handling various formatting scenarios
      // This handles: text before CREATE_FORM:, compact JSON, and formatted JSON
      let createFormMatch = content.match(/CREATE_FORM:\s*(\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})/);
      if (!createFormMatch) {
        createFormMatch = content.match(/<tool name="create_form">\s*\n?\s*(\{[\s\S]*?\})\s*\n?\s*<\/tool>/);
      }
      if (!createFormMatch) {
        createFormMatch = content.match(/create_form\s*\(\s*(\{[\s\S]*?\})\s*\)/);
      }

      if (createFormMatch) {
        let jsonStr = createFormMatch[1];
        console.log('Found create_form JSON (raw):', jsonStr.substring(0, 100) + '...');

        // Unescape JSON if it was escaped by the streaming format
        // The streaming format wraps content in quotes and escapes inner quotes
        if (jsonStr.includes('\\"')) {
          jsonStr = jsonStr.replace(/\\"/g, '"');
          console.log('Unescaped JSON:', jsonStr.substring(0, 100) + '...');
        }

        try {
          try {
            // Try to parse the JSON
            const formData = JSON.parse(jsonStr);
            console.log('Parsed form data:', formData);

            // Convert field names to IDs and map to backend format
            const backendForm = {
              id: `form-${Date.now()}`,
              title: formData.title || 'Untitled Form',
              description: formData.description || '',
              fields: formData.fields.map((field: any) => {
                // Convert options from string array to {label, value} format if needed
                let options = undefined;
                if (field.options && Array.isArray(field.options)) {
                  options = field.options.map((opt: any) => {
                    if (typeof opt === 'string') {
                      return {
                        label: opt,
                        value: opt.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                      };
                    }
                    return opt; // Already in correct format
                  });
                }

                // Clean up label - remove very long text
                let label = field.label;
                if (label && label.length > 150) {
                  // Truncate to first sentence or first 100 chars
                  const firstSentence = label.match(/^[^.!?]+[.!?]/);
                  label = firstSentence ? firstSentence[0] : label.substring(0, 100) + '...';
                }

                // Get widget metadata for this field type
                const getWidgetMetadata = (type: string) => {
                  const widgetMap: Record<string, { name: string; color: string }> = {
                    'text': { name: 'text', color: '#c4dfc4' },
                    'single-text': { name: 'single-text', color: '#c4dfc4' },
                    'textarea': { name: 'textarea', color: '#c4dfc4' },
                    'email': { name: 'email', color: '#c4dfc4' },
                    'phone': { name: 'phone', color: '#c4dfc4' },
                    'number': { name: 'number', color: '#c4dfc4' },
                    'dropdown': { name: 'dropdown', color: '#c8e0f5' },
                    'checkbox': { name: 'checkbox', color: '#c8e0f5' },
                    'radio': { name: 'radio', color: '#c8e0f5' },
                    'binary': { name: 'binary', color: '#c8e0f5' },
                    'thumbs': { name: 'thumbs', color: '#c8e0f5' },
                    'matrix': { name: 'matrix', color: '#c8e0f5' },
                    'date': { name: 'date', color: '#ddc8f5' },
                    'file': { name: 'file', color: '#ddc8f5' },
                    'image': { name: 'image', color: '#ddc8f5' },
                    'signature': { name: 'signature', color: '#ddc8f5' },
                  };
                  return widgetMap[type] || { name: type, color: '#c4dfc4' };
                };

                const widgetMeta = getWidgetMetadata(field.type);

                return {
                  id: field.name || field.id || `field-${Date.now()}-${Math.random()}`,
                  type: field.type,
                  name: widgetMeta.name,
                  label: label || 'Untitled Field',
                  placeholder: field.placeholder,
                  description: field.description,
                  required: field.required !== false,
                  color: widgetMeta.color,
                  icon: undefined, // Icon will be determined by the form builder based on type
                  options,
                };
              }),
              submitButton: { label: 'Submit' },
              createdAt: new Date().toISOString(),
              version: 1,
            };

            console.log('Backend form:', backendForm);
            const { fields, title, description } = convertBackendFormToFrontend(backendForm);
            console.log('Frontend fields:', fields);
            onFormUpdate?.(fields, { title, description });
          } catch (firstParseError) {
            // JSON parsing failed - try to log more details
            console.error('Failed to parse form JSON on first attempt:', firstParseError);
            console.error('JSON string (first 500 chars):', jsonStr.substring(0, 500));
            console.error('JSON string (last 500 chars):', jsonStr.substring(Math.max(0, jsonStr.length - 500)));

            // Show user-friendly error
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: '❌ Sorry, I generated invalid form data. This often happens with very long or complex field labels. Could you try uploading the file again, or describe the form you need in simpler terms?'
            }]);
          }
        } catch (parseError) {
          console.error('Failed to parse form JSON:', parseError);
        }
      } else {
        console.log('✅ No create_form - checking for update operations...');

        // First check for UPDATE_FORM_META (update form title/description)
        const updateFormMetaRegex = /UPDATE_FORM_META:\s*(\{[\s\S]*?\})(?=\s*\n\n|\s*\n[A-Z]|\s*$)/g;
        const formMetaMatches = Array.from(content.matchAll(updateFormMetaRegex));

        if (formMetaMatches.length > 0) {
          console.log(`📝 Found ${formMetaMatches.length} UPDATE_FORM_META match(es)`);

          for (const match of formMetaMatches) {
            try {
              const jsonStr = match[1].trim();
              const metaData = JSON.parse(jsonStr);
              console.log('Found update_form_meta:', metaData);

              // Call onFormUpdate with current fields but updated metadata
              const formMeta: { title?: string; description?: string } = {};
              if (metaData.title) formMeta.title = metaData.title;
              if (metaData.description) formMeta.description = metaData.description;

              console.log('✅ Updating form metadata:', formMeta);
              onFormUpdate?.(currentFields, formMeta);

              // Continue processing other operations (don't return)
            } catch (e) {
              console.error('Failed to parse update_form_meta JSON:', e);
            }
          }
        }

        // Check for UPDATE_FIELD
        // Match UPDATE_FIELD: {...} - capture until closing brace followed by newline or end
        const updateFieldRegex = /UPDATE_FIELD:\s*(\{[\s\S]*?\})(?=\s*\n\n|\s*\n[A-Z]|\s*$)/g;
        const updateMatches = Array.from(content.matchAll(updateFieldRegex));

        console.log(`🔍 Checking for UPDATE_FIELD... found ${updateMatches.length} match(es)`);
        if (updateMatches.length > 0) {
          console.log('📋 UPDATE_FIELD matches:', updateMatches.map((m, i) => `Match ${i + 1}: ${m[0].substring(0, 150)}...`));

          for (const match of updateMatches) {
            try {
              const jsonStr = match[1].trim();
              const updateData = JSON.parse(jsonStr);
              console.log('Found update_field:', updateData);

              const fieldId = updateData.id;
              const existingFieldIndex = currentFields.findIndex(f => f.id === fieldId);

              if (existingFieldIndex === -1) {
                console.warn('⚠️ Field not found for update:', fieldId);
                continue;
              }

              // Convert options if needed
              let options = undefined;
              if (updateData.options && Array.isArray(updateData.options)) {
                options = updateData.options.map((opt: any) => {
                  if (typeof opt === 'string') {
                    return {
                      label: opt,
                      value: opt.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                    };
                  }
                  return opt;
                });
              }

              // Create updated field by merging existing with updates
              const updatedFields = [...currentFields];
              const existingField = currentFields[existingFieldIndex];

              console.log('🔄 BEFORE update:', existingField);
              console.log('📝 UPDATE data:', updateData);
              console.log('📋 Converted options:', options);

              updatedFields[existingFieldIndex] = {
                ...existingField,
                ...updateData,
                options,
              };

              console.log('✅ AFTER update:', updatedFields[existingFieldIndex]);
              console.log('📊 Changed properties:', {
                type: existingField.type !== updatedFields[existingFieldIndex].type,
                label: existingField.label !== updatedFields[existingFieldIndex].label,
                options: JSON.stringify(existingField.options) !== JSON.stringify(updatedFields[existingFieldIndex].options),
                required: existingField.required !== updatedFields[existingFieldIndex].required,
              });

              // Convert to backend format and update
              const backendForm = {
                id: `form-${Date.now()}`,
                title: 'Food Safety Form',
                description: '',
                fields: updatedFields.map((field: any) => {
                  let fieldOptions = field.options;
                  if (fieldOptions && Array.isArray(fieldOptions) && fieldOptions.length > 0 && typeof fieldOptions[0] === 'string') {
                    fieldOptions = fieldOptions.map((opt: string) => ({
                      label: opt,
                      value: opt.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                    }));
                  }

                  return {
                    id: field.id,
                    type: field.type,
                    label: field.label,
                    placeholder: field.placeholder,
                    description: field.description,
                    required: field.required !== false,
                    options: fieldOptions,
                  };
                }),
                submitButton: { label: 'Submit' },
                createdAt: new Date().toISOString(),
                version: 1,
              };

              const { fields, title, description } = convertBackendFormToFrontend(backendForm);
              onFormUpdate?.(fields, { title, description });

              // Don't process add_field if we updated
              return;
            } catch (e) {
              console.error('Failed to parse update_field JSON:', e);
            }
          }
        }

        // Check for MOVE_FIELD (reorder fields)
        const moveFieldRegex = /MOVE_FIELD:\s*(\{[\s\S]*?\})(?=\s*\n\n|\s*\n[A-Z]|\s*$)/g;
        const moveMatches = Array.from(content.matchAll(moveFieldRegex));

        if (moveMatches.length > 0) {
          console.log(`🔍 Found ${moveMatches.length} move_field match(es)`);

          for (const match of moveMatches) {
            try {
              const jsonStr = match[1].trim();
              const moveData = JSON.parse(jsonStr);
              console.log('Found move_field:', moveData);

              const fieldId = moveData.id;
              const position = moveData.position;
              const targetId = moveData.target_id;

              const fieldIndex = currentFields.findIndex(f => f.id === fieldId);

              if (fieldIndex === -1) {
                console.warn('⚠️ Field not found for moving:', fieldId);
                continue;
              }

              // Remove the field from its current position
              const field = currentFields[fieldIndex];
              const updatedFields = [...currentFields];
              updatedFields.splice(fieldIndex, 1);

              // Insert at new position
              let newIndex = 0;
              if (position === 'top') {
                newIndex = 0;
              } else if (position === 'bottom') {
                newIndex = updatedFields.length;
              } else if (position === 'before' && targetId) {
                newIndex = updatedFields.findIndex(f => f.id === targetId);
                if (newIndex === -1) newIndex = 0;
              } else if (position === 'after' && targetId) {
                newIndex = updatedFields.findIndex(f => f.id === targetId) + 1;
                if (newIndex === 0) newIndex = updatedFields.length;
              }

              updatedFields.splice(newIndex, 0, field);

              console.log('✅ Moved field:', fieldId, 'to position:', position, newIndex);

              // Convert to backend format and update
              const backendForm = {
                id: `form-${Date.now()}`,
                title: 'Food Safety Form',
                description: '',
                fields: updatedFields.map((field: any) => {
                  let fieldOptions = field.options;
                  if (fieldOptions && Array.isArray(fieldOptions) && fieldOptions.length > 0 && typeof fieldOptions[0] === 'string') {
                    fieldOptions = fieldOptions.map((opt: string) => ({
                      label: opt,
                      value: opt.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                    }));
                  }

                  return {
                    id: field.id,
                    type: field.type,
                    label: field.label,
                    placeholder: field.placeholder,
                    description: field.description,
                    required: field.required !== false,
                    options: fieldOptions,
                  };
                }),
                submitButton: { label: 'Submit' },
                createdAt: new Date().toISOString(),
                version: 1,
              };

              const { fields, title, description } = convertBackendFormToFrontend(backendForm);
              onFormUpdate?.(fields, { title, description });

              // Don't process other operations if we moved
              return;
            } catch (e) {
              console.error('Failed to parse move_field JSON:', e);
            }
          }
        }

        // Check for REMOVE_FIELD
        // Match REMOVE_FIELD: {...} - capture until closing brace followed by newline or end
        const removeFieldRegex = /REMOVE_FIELD:\s*(\{[\s\S]*?\})(?=\s*\n\n|\s*\n[A-Z]|\s*$)/g;
        const removeMatches = Array.from(content.matchAll(removeFieldRegex));

        if (removeMatches.length > 0) {
          console.log(`🔍 Found ${removeMatches.length} remove_field match(es)`);

          for (const match of removeMatches) {
            try {
              const jsonStr = match[1].trim();
              const removeData = JSON.parse(jsonStr);
              console.log('Found remove_field:', removeData);

              const fieldId = removeData.id;
              const updatedFields = currentFields.filter(f => f.id !== fieldId);

              if (updatedFields.length === currentFields.length) {
                console.warn('⚠️ Field not found for removal:', fieldId);
                continue;
              }

              console.log('✅ Removed field:', fieldId);

              // Convert to backend format and update
              const backendForm = {
                id: `form-${Date.now()}`,
                title: 'Food Safety Form',
                description: '',
                fields: updatedFields.map((field: any) => {
                  let fieldOptions = field.options;
                  if (fieldOptions && Array.isArray(fieldOptions) && fieldOptions.length > 0 && typeof fieldOptions[0] === 'string') {
                    fieldOptions = fieldOptions.map((opt: string) => ({
                      label: opt,
                      value: opt.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                    }));
                  }

                  return {
                    id: field.id,
                    type: field.type,
                    label: field.label,
                    placeholder: field.placeholder,
                    description: field.description,
                    required: field.required !== false,
                    options: fieldOptions,
                  };
                }),
                submitButton: { label: 'Submit' },
                createdAt: new Date().toISOString(),
                version: 1,
              };

              const { fields, title, description } = convertBackendFormToFrontend(backendForm);
              onFormUpdate?.(fields, { title, description });

              // Don't process add_field if we removed
              return;
            } catch (e) {
              console.error('Failed to parse remove_field JSON:', e);
            }
          }
        }

        // Check for CLEAR_FORM (reset/clear all fields)
        const clearFormRegex = /CLEAR_FORM:\s*\{\s*\}/g;
        const clearMatches = Array.from(content.matchAll(clearFormRegex));

        if (clearMatches.length > 0) {
          console.log('🧹 Found CLEAR_FORM operation');

          // Clear all fields
          onFormUpdate?.([], { title: undefined, description: undefined });

          console.log('✅ Cleared all form fields');

          // Don't process other operations if we cleared
          return;
        }

        // Check for CREATE_WORKFLOW
        const createWorkflowMatch = content.match(/CREATE_WORKFLOW:\s*(\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})/);

        if (createWorkflowMatch) {
          let jsonStr = createWorkflowMatch[1];
          console.log('Found CREATE_WORKFLOW JSON (raw):', jsonStr.substring(0, 100) + '...');

          // Unescape JSON if it was escaped by the streaming format
          if (jsonStr.includes('\\"')) {
            jsonStr = jsonStr.replace(/\\"/g, '"');
          }

          try {
            const workflowData = JSON.parse(jsonStr);
            console.log('Parsed workflow data:', workflowData);

            // Call API to create workflow (using async IIFE to handle await)
            (async () => {
              try {
                const requestBody = {
                  workspace_id: workspaceId,
                  name: workflowData.name,
                  description: workflowData.description || '',
                  trigger_type: workflowData.trigger.type,
                  trigger_config: workflowData.trigger.config,
                  actions: workflowData.actions,
                };
                console.log('📤 Sending workflow creation request:', requestBody);

                const response = await fetch('/api/workflows', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(requestBody),
                });

                if (response.ok) {
                  const result = await response.json();
                  console.log('✅ Workflow created:', result.workflow);
                  toast.success(`Created workflow: ${workflowData.name}`);

                  // Call onWorkflowCreated callback if provided
                  if (onWorkflowCreated) {
                    onWorkflowCreated();
                  }
                } else {
                  const errorText = await response.text();
                  console.error('Failed to create workflow. Status:', response.status);
                  console.error('Response:', errorText);

                  try {
                    const error = JSON.parse(errorText);
                    toast.error(`Failed to create workflow: ${error.error || 'Unknown error'}`);
                  } catch {
                    toast.error(`Failed to create workflow (${response.status}). Check console for details.`);
                  }
                }
              } catch (error) {
                console.error('Failed to create workflow:', error);
                toast.error('Failed to create workflow');
              }
            })();
          } catch (parseError) {
            console.error('Failed to parse workflow JSON:', parseError);
            toast.error('Failed to parse workflow data');
          }
        }

        // Check for add_field calls in multiple formats:
        // Format 0: ADD_FIELD:\n{...}  (NEW EXPLICIT FORMAT)
        // Format 1: <tool name="add_field">{...}</tool>
        // Format 2: add_field({...}) or Calling add_field({...}) - need to handle nested braces
        // Format 3: ```add_field({...})```
        // Updated regex to handle nested braces (e.g., position: { "after": "..." })
        const addFieldRegex0 = /ADD_FIELD:\s*\n?\s*(\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})/g;
        const addFieldRegex1 = /<tool name="add_field">\s*\n?\s*(\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})\s*\n?\s*<\/tool>/g;

        // Better regex for nested JSON - capture everything between add_field( and )
        // Allow optional "Calling " prefix
        // Updated to handle two levels of nested braces
        const addFieldRegex2 = /(?:Calling\s+)?add_field\s*\(\s*(\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})\s*\)/g;
        const addFieldRegex3 = /```\s*(?:Calling\s+)?add_field\s*\(\s*(\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})\s*\)\s*```/g;

        const matches0 = Array.from(content.matchAll(addFieldRegex0));
        const matches1 = Array.from(content.matchAll(addFieldRegex1));
        const matches2 = Array.from(content.matchAll(addFieldRegex2));
        const matches3 = Array.from(content.matchAll(addFieldRegex3));
        const allMatches = [...matches0, ...matches1, ...matches2, ...matches3];

        console.log(`🔍 Found ${allMatches.length} add_field match(es)`);
        if (allMatches.length > 0) {
          console.log('📋 Match details:', allMatches.map((m, i) => `Match ${i + 1}: ${m[0].substring(0, 100)}...`));
        }

        const addedFields = [];
        for (const match of allMatches) {
          try {
            const jsonStr = match[1].trim();
            console.log('Attempting to parse add_field JSON:', jsonStr.substring(0, 200));
            const addFieldData = JSON.parse(jsonStr);
            console.log('Found add_field:', addFieldData);

            // Handle multiple formats:
            // Format 0: ADD_FIELD: { id, type, label, ... } (direct field object, no explanation wrapper)
            // Format 1: { explanation, field: {...} }
            // Format 2: { explanation, id, type, label, ... }
            // Format 3: { explanation, field_id, type, label, ... }
            // Format 4: { explanation, field_name, field_type, ... }

            // If it has 'explanation' key, extract the field data, otherwise use the whole object as field data
            const fieldData = addFieldData.explanation ? (addFieldData.field || addFieldData) : addFieldData;

            // Normalize field ID and type
            const fieldId = fieldData.id || fieldData.field_id || fieldData.field_name || `field-${Date.now()}-${Math.random()}`;
            const fieldType = fieldData.type || fieldData.field_type;

            if (fieldId && fieldType && fieldData.label) {
              // Check if this field already exists (avoid duplicates from multiple useEffect runs)
              const fieldExists = currentFields.some(f => f.id === fieldId);
              if (fieldExists) {
                console.log('⏭️ Field already exists, skipping:', fieldId);
                continue;
              }

              // Convert options from string array to {label, value} format if needed
              let options = undefined;
              if (fieldData.options && Array.isArray(fieldData.options)) {
                options = fieldData.options.map((opt: any) => {
                  if (typeof opt === 'string') {
                    return {
                      label: opt,
                      value: opt.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                    };
                  }
                  return opt; // Already in correct format
                });
              }

              // Get widget metadata for this field type
              const getWidgetMetadata = (type: string) => {
                const widgetMap: Record<string, { name: string; color: string }> = {
                  'text': { name: 'text', color: '#c4dfc4' },
                  'single-text': { name: 'single-text', color: '#c4dfc4' },
                  'textarea': { name: 'textarea', color: '#c4dfc4' },
                  'email': { name: 'email', color: '#c4dfc4' },
                  'phone': { name: 'phone', color: '#c4dfc4' },
                  'number': { name: 'number', color: '#c4dfc4' },
                  'dropdown': { name: 'dropdown', color: '#c8e0f5' },
                  'checkbox': { name: 'checkbox', color: '#c8e0f5' },
                  'radio': { name: 'radio', color: '#c8e0f5' },
                  'binary': { name: 'binary', color: '#c8e0f5' },
                  'thumbs': { name: 'thumbs', color: '#c8e0f5' },
                  'matrix': { name: 'matrix', color: '#c8e0f5' },
                  'date': { name: 'date', color: '#ddc8f5' },
                  'file': { name: 'file', color: '#ddc8f5' },
                  'image': { name: 'image', color: '#ddc8f5' },
                  'signature': { name: 'signature', color: '#ddc8f5' },
                };
                return widgetMap[type] || { name: type, color: '#c4dfc4' };
              };

              const widgetMeta = getWidgetMetadata(fieldType);

              const newField = {
                id: fieldId,
                type: fieldType,
                name: widgetMeta.name,
                label: fieldData.label,
                placeholder: fieldData.placeholder || fieldData.help_text,
                description: fieldData.description || fieldData.help_text,
                required: fieldData.required !== false,
                color: widgetMeta.color,
                icon: undefined, // Icon will be determined by the form builder based on type
                options,
                position: fieldData.position, // Preserve position instruction
              };
              console.log('✅ Adding field:', newField);
              addedFields.push(newField);
            } else {
              console.warn('⚠️ Invalid field data (missing id/type/label):', { fieldId, fieldType, label: fieldData.label, fieldData });
            }
          } catch (e) {
            console.error('Failed to parse add_field JSON:', e);
            console.error('Raw match:', match[0].substring(0, 300));
            console.error('Captured group:', match[1].substring(0, 300));
          }
        }

        // If we found add_field calls, merge with existing form
        if (addedFields.length > 0) {
          console.log('🎉 Adding fields to existing form:', addedFields);
          console.log('📋 Current fields:', currentFields);

          // Process each added field's position
          let updatedFields = [...currentFields];

          for (const newField of addedFields) {
            const position = newField.position;
            console.log(`🎯 Processing field "${newField.label}" with position:`, position);
            console.log(`📋 Current field IDs:`, updatedFields.map(f => f.id));

            if (!position || position === 'bottom') {
              // Default: add to end
              console.log(`➡️ Adding "${newField.label}" to end (no position/bottom)`);
              updatedFields.push(newField);
            } else if (position === 'top') {
              // Add to beginning
              console.log(`⬆️ Adding "${newField.label}" to beginning (top)`);
              updatedFields.unshift(newField);
            } else if (typeof position === 'number') {
              // Numeric position (1-based index)
              const index = Math.max(0, Math.min(position - 1, updatedFields.length));
              console.log(`🔢 Inserting "${newField.label}" at position ${position} (index ${index})`);
              updatedFields.splice(index, 0, newField);
            } else if (typeof position === 'object') {
              if (position.after) {
                // Insert after specific field
                const afterIndex = updatedFields.findIndex(f => f.id === position.after);
                console.log(`🔍 Looking for field "${position.after}", found at index: ${afterIndex}`);
                if (afterIndex >= 0) {
                  console.log(`✅ Inserting "${newField.label}" after index ${afterIndex}`);
                  updatedFields.splice(afterIndex + 1, 0, newField);
                } else {
                  console.log(`⚠️ Field "${position.after}" not found, adding to end`);
                  updatedFields.push(newField); // Fallback to end
                }
              } else if (position.before) {
                // Insert before specific field
                const beforeIndex = updatedFields.findIndex(f => f.id === position.before);
                console.log(`🔍 Looking for field "${position.before}", found at index: ${beforeIndex}`);
                if (beforeIndex >= 0) {
                  console.log(`✅ Inserting "${newField.label}" before index ${beforeIndex}`);
                  updatedFields.splice(beforeIndex, 0, newField);
                } else {
                  console.log(`⚠️ Field "${position.before}" not found, adding to beginning`);
                  updatedFields.unshift(newField); // Fallback to beginning
                }
              } else {
                console.log(`➡️ Position object has no after/before, adding to end`);
                updatedFields.push(newField); // Fallback
              }
            } else {
              console.log(`➡️ Unknown position type, adding to end`);
              updatedFields.push(newField); // Fallback
            }

            console.log(`📋 After adding "${newField.label}", field order:`, updatedFields.map(f => f.label));
          }

          // Clean up position property and ensure options format
          updatedFields = updatedFields.map((field: any) => {
            // Ensure options are in correct format
            let options = field.options;
            if (options && Array.isArray(options) && options.length > 0 && typeof options[0] === 'string') {
              options = options.map((opt: string) => ({
                label: opt,
                value: opt.toLowerCase().replace(/[^a-z0-9]+/g, '-')
              }));
            }

            // Preserve existing name, color, icon or use defaults
            const getWidgetMetadata = (type: string) => {
              const widgetMap: Record<string, { name: string; color: string }> = {
                'text': { name: 'text', color: '#c4dfc4' },
                'single-text': { name: 'single-text', color: '#c4dfc4' },
                'textarea': { name: 'textarea', color: '#c4dfc4' },
                'email': { name: 'email', color: '#c4dfc4' },
                'phone': { name: 'phone', color: '#c4dfc4' },
                'number': { name: 'number', color: '#c4dfc4' },
                'dropdown': { name: 'dropdown', color: '#c8e0f5' },
                'checkbox': { name: 'checkbox', color: '#c8e0f5' },
                'radio': { name: 'radio', color: '#c8e0f5' },
                'binary': { name: 'binary', color: '#c8e0f5' },
                'thumbs': { name: 'thumbs', color: '#c8e0f5' },
                'date': { name: 'date', color: '#ddc8f5' },
                'file': { name: 'file', color: '#ddc8f5' },
                'image': { name: 'image', color: '#ddc8f5' },
              };
              return widgetMap[type] || { name: type, color: '#c4dfc4' };
            };

            const widgetMeta = getWidgetMetadata(field.type);

            return {
              id: field.id,
              type: field.type,
              name: field.name || widgetMeta.name,
              label: field.label,
              placeholder: field.placeholder,
              description: field.description,
              required: field.required !== false,
              color: field.color || widgetMeta.color,
              icon: field.icon || undefined,
              options,
            };
          });
          const backendForm = {
            id: `form-${Date.now()}`,
            title: 'Contact Form', // Keep existing title
            description: '',
            fields: updatedFields,
            submitButton: { label: 'Submit' },
            createdAt: new Date().toISOString(),
            version: 1,
          };

          const { fields, title, description } = convertBackendFormToFrontend(backendForm as any);
          onFormUpdate?.(fields, { title, description });
        } else {
          console.log('⚠️ No fields were added (parsing may have failed)');
        }
      }

      // Note: We don't clean the message here to avoid infinite loops
      // The raw JSON blocks will be visible in the chat
      // TODO: Implement a display-only cleaning mechanism that doesn't trigger re-renders
    } catch (error) {
      console.error("❌ Failed to process AI response:", error);
    }
  }, [messages, isLoading, currentPage, onFormUpdate, currentFields]);

  const handleSubmit = async (e?: React.FormEvent | null, customPrompt?: string) => {
    if (e) e.preventDefault();
    const messageContent = customPrompt || input.trim();
    console.log('=== FORM SUBMITTED ===');
    console.log('Input value:', messageContent);
    console.log('Is loading:', isLoading);

    if (!messageContent || isLoading) {
      console.log('Rejected: empty input or loading');
      return;
    }

    const userMessage: Message = { role: 'user', content: messageContent };
    console.log('Sending message:', userMessage);

    // Only add message to state if it's not from Excel upload (already added)
    if (!customPrompt) {
      setMessages(prev => [...prev, userMessage]);
      setInput('');
    }

    setIsLoading(true);

    try {
      // Use single unified API endpoint
      const apiEndpoint = '/api/chat';
      console.log(`Making API call to ${apiEndpoint}...`);

      // Build context based on context prop (forms vs workflows)
      let systemContext = `\n\n**Current Context:**\n`;

      if (context === 'workflows') {
        systemContext += `User is on the WORKFLOWS page. They want to create workflow automations. Focus on workflow triggers (sensor alerts, form events, schedules) and actions (email, SMS, create task).`;
      } else {
        systemContext += `User is on the "${currentPage}" page.`;

        // Add form ID context
        if (formId) {
          systemContext += `\nForm ID: ${formId} (editing existing form)`;
        } else {
          systemContext += `\nNew form (not yet saved)`;
        }

        if (currentPage === 'builder' && currentFields.length > 0) {
          systemContext += `\n\n**Form State:**\nThe form currently has ${currentFields.length} field(s):\n${currentFields.map(f => `- ${f.label} (${f.type})`).join('\n')}`;
        } else if (currentPage === 'distribution') {
          systemContext += `\n\n**Distribution Settings:**\nUser is configuring WHO/WHEN/WHERE/HOW settings for form distribution.`;
        }
      }

      const contextualMessage = {
        ...userMessage,
        content: userMessage.content + systemContext
      };

      const requestBody: any = {
        messages: [...messages, contextualMessage],
        formId: formId || 'new', // Include form ID for context
        currentPage, // Let AI know what page we're on
        currentFields, // Always send current form state
        mode: aiMode === 'auto' ? detectedMode : aiMode, // Send current mode
        workspaceId, // Send workspace ID for context
        context // Send context type (forms or workflows)
      };

      console.log('📤 Request includes workspaceId:', workspaceId, 'context:', context);

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      console.log('Response received:', response.status, response.statusText);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error('Failed to get response');
      }

      console.log('Response is OK, starting to read stream...');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      if (!reader) {
        console.error('No reader available!');
        throw new Error('No stream reader');
      }

      console.log('Stream reader acquired, adding loading message...');
      // Add a temporary loading message
      setMessages(prev => [...prev, { role: 'assistant', content: '', thinking: [] }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        assistantMessage += chunk;

        // Extract thinking/operation indicators in real-time
        const thinking: string[] = [];

        // Detect mode based on operations
        // Start with manual mode if set, otherwise detect from operations
        let currentMode: AIMode = aiMode !== 'auto' ? (aiMode as AIMode) : 'strategy';

        // If in AUTO mode, detect based on operations
        if (aiMode === 'auto') {
          // If we see operations, we're in EXECUTION mode
          const hasOperations = assistantMessage.includes('CREATE_FORM:') ||
            assistantMessage.includes('ADD_FIELD:') ||
            assistantMessage.includes('UPDATE_FIELD:') ||
            assistantMessage.includes('REMOVE_FIELD:') ||
            assistantMessage.includes('UPDATE_FORM_META:') ||
            assistantMessage.includes('CLEAR_FORM:') ||
            assistantMessage.includes('CREATE_WORKFLOW:');

          if (hasOperations) {
            currentMode = 'execution';
            setDetectedMode('execution'); // Update state immediately
          }
        }

        // Build thinking indicators based on detected mode
        if (currentMode === 'execution' ||
          assistantMessage.includes('CREATE_FORM:') ||
          assistantMessage.includes('ADD_FIELD:') ||
          assistantMessage.includes('UPDATE_FIELD:') ||
          assistantMessage.includes('REMOVE_FIELD:') ||
          assistantMessage.includes('UPDATE_FORM_META:') ||
          assistantMessage.includes('CLEAR_FORM:') ||
          assistantMessage.includes('CREATE_WORKFLOW:')) {

          // EXECUTION mode - show operation indicators
          if (assistantMessage.includes('CREATE_FORM:')) {
            thinking.push('🔨 Creating form structure...');
          }
          if (assistantMessage.match(/ADD_FIELD:/g)) {
            const fieldCount = (assistantMessage.match(/ADD_FIELD:/g) || []).length;
            thinking.push(`📝 Adding ${fieldCount} field${fieldCount > 1 ? 's' : ''}...`);
          }
          if (assistantMessage.includes('UPDATE_FIELD:')) {
            thinking.push('✏️ Updating field...');
          }
          if (assistantMessage.includes('REMOVE_FIELD:')) {
            thinking.push('🗑️ Removing field...');
          }
          if (assistantMessage.includes('UPDATE_FORM_META:')) {
            thinking.push('📋 Updating form info...');
          }
          if (assistantMessage.includes('CLEAR_FORM:')) {
            thinking.push('🧹 Clearing form...');
          }
          if (assistantMessage.includes('CREATE_WORKFLOW:')) {
            thinking.push('⚡ Creating workflow...');
          }

          // If we detected operations, make sure mode is execution
          if (thinking.length > 0) {
            currentMode = 'execution';
          }
        }

        // If no operations detected, show STRATEGY indicator
        if (thinking.length === 0) {
          thinking.push('💭 Analyzing...');
          if (aiMode === 'auto') {
            currentMode = 'strategy';
            setDetectedMode('strategy');
          }
        }

        // Extract just the conversational text (hide JSON)
        // During streaming, JSON might be incomplete, so cut off at operation keywords
        let displayText = assistantMessage;

        // Remove mode announcements (redundant with badge)
        displayText = displayText.replace(/⚡\s*EXECUTION\s*Mode:?\s*/gi, '');
        displayText = displayText.replace(/🎯\s*STRATEGY\s*Mode:?\s*/gi, '');
        displayText = displayText.replace(/\[?(EXECUTION|STRATEGY)\s*Mode\]?:?\s*/gi, '');

        // Find the first occurrence of any operation keyword and truncate there
        const operationKeywords = ['CREATE_FORM:', 'ADD_FIELD:', 'UPDATE_FIELD:', 'UPDATE_FORM_META:', 'REMOVE_FIELD:', 'MOVE_FIELD:', 'CLEAR_FORM:', 'CREATE_WORKFLOW:'];
        let cutoffIndex = -1;

        for (const keyword of operationKeywords) {
          const index = displayText.indexOf(keyword);
          if (index !== -1 && (cutoffIndex === -1 || index < cutoffIndex)) {
            cutoffIndex = index;
          }
        }

        // If we found an operation, only show text before it
        if (cutoffIndex !== -1) {
          displayText = displayText.substring(0, cutoffIndex);
        }

        displayText = displayText.replace(/\n{3,}/g, '\n\n').trim();

        // Get previous message to check if we should freeze the display text
        setMessages(prev => {
          const newMessages = [...prev];
          const prevMessage = newMessages[newMessages.length - 1];

          // Once we have displayContent set, don't let it shrink (freeze it)
          // Only update if new displayText is LONGER or if we don't have displayContent yet
          const shouldUpdateDisplay = !prevMessage.displayContent ||
            displayText.length > (prevMessage.displayContent?.length || 0);

          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: assistantMessage,  // Store full for parsing
            displayContent: shouldUpdateDisplay ? (displayText || 'Thinking...') : prevMessage.displayContent,
            thinking: thinking.length > 0 ? thinking : ['💭 Analyzing...'],
            mode: aiMode === 'auto' ? currentMode : aiMode as AIMode
          };
          return newMessages;
        });
      }

      // Stream complete - final update will trigger useEffect to parse operations
      console.log('✅ Stream complete. Message length:', assistantMessage.length);

      setMessages(prev => {
        const newMessages = [...prev];
        const prevMessage = newMessages[newMessages.length - 1];

        // Detect final mode based on operations in the completed message
        const hasOperations = assistantMessage.includes('CREATE_FORM:') ||
          assistantMessage.includes('ADD_FIELD:') ||
          assistantMessage.includes('UPDATE_FIELD:') ||
          assistantMessage.includes('REMOVE_FIELD:') ||
          assistantMessage.includes('UPDATE_FORM_META:') ||
          assistantMessage.includes('CLEAR_FORM:') ||
          assistantMessage.includes('CREATE_WORKFLOW:');

        const finalMode: AIMode = aiMode === 'auto'
          ? (hasOperations ? 'execution' : 'strategy')
          : (aiMode as AIMode);

        // Keep thinking indicators as a completion log, convert to past tense
        const completedThinking = prevMessage.thinking?.map(step => {
          if (step.startsWith('💭')) {
            return '✓ Analyzed';
          }

          // Remove emoji and convert to past tense
          let completed = step.replace(/^[🔨📝✏️🗑️📋]\s*/, '');

          // Convert present progressive to past tense
          completed = completed
            .replace(/Creating form structure\.\.\./g, 'Created form structure')
            .replace(/Adding (\d+) fields\.\.\./g, 'Added $1 fields')
            .replace(/Adding (\d+) field\.\.\./g, 'Added $1 field')
            .replace(/Updating field\.\.\./g, 'Updated field')
            .replace(/Removing field\.\.\./g, 'Removed field')
            .replace(/Updating form info\.\.\./g, 'Updated form info');

          return `✓ ${completed}`;
        });

        newMessages[newMessages.length - 1] = {
          role: 'assistant',
          content: assistantMessage,
          displayContent: undefined,  // Clear display content, will use cleaned version
          thinking: completedThinking,  // Keep as completion log
          completed: true,  // Mark as completed to stop spinner
          mode: finalMode  // Use detected final mode
        };
        return newMessages;
      });

    } catch (error) {
      console.error('=== CHAT ERROR ===');
      console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('Error message:', error instanceof Error ? error.message : error);
      console.error('Full error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      console.log('=== FINALLY BLOCK - Setting isLoading to false ===');
      setIsLoading(false);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    console.log('Suggested prompt clicked:', prompt);
    setInput(prompt);
  };

  // Voice input handlers
  const startVoiceInput = () => {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Voice input not supported in this browser. Try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('🎤 Voice recording started');
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');

      console.log('🎤 Transcript:', transcript);
      setInput(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('🎤 Speech recognition error:', event.error);
      setIsRecording(false);

      if (event.error === 'no-speech') {
        toast.error('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please allow microphone access.');
      } else {
        toast.error('Voice input error. Please try again.');
      }
    };

    recognition.onend = () => {
      console.log('🎤 Voice recording ended');
      setIsRecording(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const toggleVoiceInput = () => {
    if (isRecording) {
      // Stop recording and immediately send
      stopVoiceInput();

      // Submit the transcribed text after a short delay to ensure state is updated
      setTimeout(() => {
        if (input.trim()) {
          handleSubmit();
        }
      }, 100);
    } else {
      startVoiceInput();
    }
  };

  // Static prompts - consistent across all tabs for persistent experience
  const suggestedPrompts = context === 'workflows' ? [
    "Alert when temp exceeds 40°F",
    "Email team on form submission",
    "Create task when sensor offline",
  ] : [
    "Create kitchen inspection checklist",
    "Build temperature log form",
    "Make food safety audit",
  ];

  return (
    <div
      className={`fixed top-0 right-0 h-screen border-l flex flex-col transition-all duration-300 z-50 ${isOpen
          ? "w-96 bg-gradient-to-b from-[#c4dfc4] via-[#d0e8d0] to-[#b5d0b5] border-border shadow-lg"
          : "w-12 bg-gradient-to-b from-[#c4dfc4] to-[#b5d0b5] border-[#c4dfc4]"
        }`}
    >
      {/* Header */}
      <div
        className={`flex items-center transition-all duration-300 ${isOpen
            ? "border-b border-white bg-gradient-to-r from-[#b5d0b5] to-[#c4dfc4] p-4 justify-between h-16"
            : "flex-col pt-4 pb-4 justify-center"
          }`}
      >
        {isOpen ? (
          <>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#c4dfc4] to-[#c8e0f5]">
                <Sparkles className="h-4 w-4 text-[#0a0a0a]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#0a0a0a]">AI Operator</h3>
                <p className="text-xs text-gray-600">
                  Chat to build and manage your forms
                </p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
              title="Collapse AI Operator"
            >
              <PanelRightClose className="h-4 w-4 text-gray-600" />
            </button>
          </>
        ) : (
          <div className="p-2">
            <Sparkles className="h-5 w-5 text-[#0a0a0a]" />
          </div>
        )}
      </div>

      {/* Mode Toggle */}
      {isOpen && (
        <div className="border-b border-white/20 px-4 py-2 bg-gradient-to-r from-[#b5d0b5] to-[#c4dfc4]">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-700 font-medium">AI Mode:</span>
            <div className="flex gap-1 bg-white/40 p-0.5 rounded-md">
              <button
                onClick={() => setAiMode('auto')}
                className={`text-xs px-3 py-1 rounded transition-all ${aiMode === 'auto'
                    ? 'bg-white text-gray-900 font-semibold shadow'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
                title="Auto-detect based on your request"
              >
                🔄 Auto
              </button>
              <button
                onClick={() => setAiMode('strategy')}
                className={`text-xs px-3 py-1 rounded transition-all ${aiMode === 'strategy'
                    ? 'bg-purple-500/20 text-purple-900 font-semibold border border-purple-500/30'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
                title="Strategy mode: AI will discuss and plan"
              >
                🎯 Strategy
              </button>
              <button
                onClick={() => setAiMode('execution')}
                className={`text-xs px-3 py-1 rounded transition-all ${aiMode === 'execution'
                    ? 'bg-blue-500/20 text-blue-900 font-semibold border border-blue-500/30'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
                title="Execution mode: AI will take action immediately"
              >
                ⚡ Execution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      {isOpen && (
        <>
          <div
            ref={scrollRef}
            className="flex-1 p-4 bg-gradient-to-b from-[#c4dfc4] via-[#d0e8d0] to-[#b5d0b5] overflow-y-auto overscroll-contain"
            onWheel={(e) => {
              // Prevent scroll bleed to main page
              const element = e.currentTarget;
              const atTop = element.scrollTop === 0;
              const atBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
              
              if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
                e.preventDefault();
              }
            }}
          >
            <div className="space-y-4">
              {/* Welcome Message */}
              {messages.length === 0 && (
                <div className="flex-1">
                  <p className="text-xs text-gray-800 leading-relaxed mb-3">
                    👋 Hi! I'm your AI operator. I can help you {context === 'workflows' ? 'create workflow automations, trigger actions based on events' : 'build forms, configure distribution settings, analyze data, or generate reports'} - just tell me what you need!
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedPrompts.map((prompt, idx) => (
                      <Badge
                        key={idx}
                        onClick={() => handleSuggestedPrompt(prompt)}
                        className="cursor-pointer bg-white/80 text-gray-700 hover:bg-white border-0 text-xs"
                      >
                        {prompt}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              {isMounted && messages.map((message: any, idx: number) => (
                <div key={idx}>
                  {/* Thinking indicators with MODE badge - OUTSIDE bubble, sticky status */}
                  {message.thinking && message.thinking.length > 0 && (
                    <div className="mb-3 flex items-center gap-2 text-gray-600">
                      {message.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-[#c4dfc4]" />
                      ) : (
                        <Loader2 className="h-4 w-4 text-[#0a0a0a] animate-spin" />
                      )}

                      {/* Mode badge - only show after completion to avoid flicker */}
                      {message.completed && message.mode && (
                        <Badge
                          className={`text-xs font-bold uppercase px-2 py-0.5 ${message.mode === 'execution'
                              ? 'bg-blue-500/20 text-blue-700 border-blue-500/30'
                              : 'bg-purple-500/20 text-purple-700 border-purple-500/30'
                            }`}
                          variant="outline"
                        >
                          {message.mode === 'execution' ? '⚡ EXECUTION' : '🎯 STRATEGY'}
                        </Badge>
                      )}

                      <div className="flex flex-wrap gap-1.5">
                        {message.thinking.map((step: string, i: number) => (
                          <span
                            key={i}
                            className={`text-xs font-medium ${message.completed ? 'text-gray-500' : 'text-gray-600'}`}
                          >
                            {step}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Only show bubble if there's actual content to display */}
                  {((message.role === "assistant" && (message.displayContent || message.content) && (message.displayContent || cleanMessageForDisplay(message.content)) !== 'Thinking...') || message.role === "user") && (
                    <div
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
                    >
                      {/* AI Message - No icon, transparent background */}
                      {message.role === "assistant" && (
                        <div className="flex-1">
                          <p className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">
                            {message.displayContent || cleanMessageForDisplay(message.content)}
                          </p>
                        </div>
                      )}

                      {/* User Message - White bubble, no icon */}
                      {message.role === "user" && (
                        <Card className="max-w-[85%] p-3 bg-white border-0 shadow-sm">
                          <p className="text-xs text-gray-800 whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </Card>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Invisible div to mark end of messages for Cursor-style auto-scroll */}
              <div ref={messagesEndRef} />

              {/* Loading handled by thinking indicators above */}
            </div>
          </div>

          {/* Chat Input */}
          <div className="border-t border-white/20 p-3 bg-gradient-to-r from-[#b5d0b5] to-[#c4dfc4]">
            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <form onSubmit={handleSubmit} className="flex gap-2">
              {/* Unified Upload Button (only on builder page) */}
              {currentPage === 'builder' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      disabled={isLoading || isParsingFile}
                      className="bg-white/80 border border-white/30 text-gray-700 hover:bg-white/90 shrink-0"
                      title="Add attachment"
                    >
                      {isParsingFile ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Upload File
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => imageInputRef.current?.click()}
                      className="cursor-pointer"
                    >
                      <ImagePlus className="h-4 w-4 mr-2" />
                      Upload Image
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isRecording ? "Listening..." : "Share anything"}
                disabled={isLoading || isParsingFile}
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                className="flex-1 min-h-[36px] max-h-[200px] resize-none overflow-y-auto bg-white/80 border-white/30 text-sm text-gray-800 placeholder:text-gray-500 py-2"
              />
              <Button
                type="button"
                size="icon"
                onClick={toggleVoiceInput}
                disabled={isLoading || isParsingFile}
                className={`shrink-0 ${isRecording ? 'bg-[#c4dfc4] text-[#0a0a0a] hover:bg-[#b5d0b5] animate-pulse' : 'bg-white/80 border border-white/30 text-gray-700 hover:bg-white/90'}`}
                title={isRecording ? "Click to send" : "Voice input"}
              >
                {isRecording ? (
                  <Send className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
              {!isRecording && (
                <Button
                  type="submit"
                  size="icon"
                  disabled={isLoading || !input.trim() || isParsingFile}
                  className="bg-[#c4dfc4] text-[#0a0a0a] hover:bg-[#b5d0b5] shrink-0 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              )}
            </form>
          </div>
        </>
      )}

      {/* Clickable area for collapsed sidebar on Builder tab */}
      {!isOpen && !disabled && (
        <div
          className="absolute inset-0 cursor-pointer hover:bg-white/10 transition-colors"
          onClick={onToggle}
          title="Open AI Operator"
        />
      )}

      {/* Disabled Overlay - shown on Settings/Publish tabs (both expanded and collapsed) */}
      {disabled && (
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-10 cursor-pointer"
          onClick={onToggle}
          title={isOpen ? "Click to collapse" : "Disabled on this tab"}
        >
          {isOpen && (
            <div className="text-center px-6 pointer-events-none">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-white/40" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Operator Disabled</h3>
              <p className="text-sm text-white/60 max-w-xs">
                AI Operator is only available on the Builder tab
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

