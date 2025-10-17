"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, PanelRightClose, PanelRightOpen, Loader2, Upload, FileSpreadsheet, X } from "lucide-react";
import type { FormField as FrontendFormField } from "@/app/forms/page";
import type { FormSchema } from "@/lib/types/form-schema";
import { convertBackendFormToFrontend } from "@/lib/converters/form-types";
import { parseExcelFile, generateFormPrompt, type ParsedExcelData } from "@/lib/utils/excel-parser";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  mode?: 'form' | 'reporting';
  onFormUpdate?: (fields: FrontendFormField[], formMeta?: { title?: string; description?: string }) => void;
  onReportUpdate?: (sections: any[]) => void;
  currentFields?: FrontendFormField[];
  currentSections?: any[];
  reportData?: any;
}

export function AIChatPanel({ 
  isOpen, 
  onToggle, 
  mode = 'form',
  onFormUpdate, 
  onReportUpdate,
  currentFields = [],
  currentSections = [],
  reportData
}: AIChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [statusMessages, setStatusMessages] = useState<string[]>([]);
  const processedMessageIds = useRef<Set<string>>(new Set());
  
  // Ensure client-only rendering to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Handle Excel file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check if it's an Excel file
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv');
    if (!isExcel) {
      alert('Please upload an Excel file (.xlsx, .xls, or .csv)');
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
      alert(`Failed to parse Excel file: ${error}`);
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
  
  // Extract operations and convert to user-friendly status messages
  const extractStatusMessages = (content: string): string[] => {
    const statuses: string[] = [];
    
    // Check for Excel upload
    if (content.includes('📎 Uploaded:')) {
      const fileMatch = content.match(/📎 Uploaded: (.+)/);
      if (fileMatch) {
        statuses.push(`📊 Analyzing ${fileMatch[1]}...`);
      }
      const questionMatch = content.match(/Questions Found \((\d+) total\)/);
      if (questionMatch) {
        statuses.push(`✅ Found ${questionMatch[1]} questions`);
      }
    }
    
    // Check for form operations
    if (content.includes('CREATE_FORM:')) {
      statuses.push('✨ Creating form...');
    }
    if (content.includes('ADD_FIELD:')) {
      const fieldMatches = content.match(/ADD_FIELD:/g);
      if (fieldMatches) {
        statuses.push(`📝 Adding ${fieldMatches.length} field${fieldMatches.length > 1 ? 's' : ''}...`);
      }
    }
    if (content.includes('UPDATE_FIELD:')) {
      statuses.push('🔄 Updating field...');
    }
    if (content.includes('UPDATE_FORM_META:')) {
      statuses.push('✏️ Updating form details...');
    }
    if (content.includes('REMOVE_FIELD:')) {
      statuses.push('🗑️ Removing field...');
    }
    if (content.includes('MOVE_FIELD:')) {
      statuses.push('↕️ Reordering fields...');
    }
    
    // Check for reporting operations
    if (content.includes('ADD_CHART:')) {
      statuses.push('📊 Adding chart...');
    }
    if (content.includes('ADD_INSIGHT:')) {
      statuses.push('💡 Adding insight...');
    }
    if (content.includes('GENERATE_REPORT:')) {
      statuses.push('📄 Generating report...');
    }
    
    return statuses;
  };
  
  // Clean message for display (doesn't modify state, just for rendering)
  const cleanMessageForDisplay = (msg: string) => {
    // Remove ALL code blocks (including json, javascript, etc.)
    let cleaned = msg.replace(/```[\s\S]*?```/g, '');
    
    // Remove any standalone JSON arrays or objects (the big culprit!)
    // This catches things like: ,\n{\n  "id": "something",\n  "type": "...",\n}
    cleaned = cleaned.replace(/,\s*\{[\s\S]*?\}/g, '');
    cleaned = cleaned.replace(/,\s*\[[\s\S]*?\]/g, '');
    
    // Remove JSON arrays that start a line
    cleaned = cleaned.replace(/^\s*\[[\s\S]*?\]\s*$/gm, '');
    cleaned = cleaned.replace(/^\s*\{[\s\S]*?\}\s*$/gm, '');
    
    // Remove tool call blocks (all formats)
    cleaned = cleaned.replace(/<tool name="[^"]*">\s*\{[\s\S]*?\}\s*<\/tool>/g, '');
    cleaned = cleaned.replace(/(?:add_field|create_form|update_field|remove_field|move_field|validate_form_schema)\s*\(\s*\{[\s\S]*?\}\s*\)/g, '');
    
    // Remove form operations with JSON (all variations, including incomplete ones)
    cleaned = cleaned.replace(/CREATE_FORM:[\s\S]*?(?=\n\n[A-Z]|\n\nThe |$)/g, '');
    cleaned = cleaned.replace(/ADD_FIELD:[\s\S]*?(?=\n\n[A-Z]|\n\nThe |$)/g, '');
    cleaned = cleaned.replace(/UPDATE_FIELD:[\s\S]*?(?=\n\n[A-Z]|\n\nThe |$)/g, '');
    cleaned = cleaned.replace(/UPDATE_FORM_META:[\s\S]*?(?=\n\n[A-Z]|\n\nThe |$)/g, '');
    cleaned = cleaned.replace(/REMOVE_FIELD:[\s\S]*?(?=\n\n[A-Z]|\n\nThe |$)/g, '');
    cleaned = cleaned.replace(/MOVE_FIELD:[\s\S]*?(?=\n\n[A-Z]|\n\nThe |$)/g, '');
    
    // Remove reporting operations with JSON
    cleaned = cleaned.replace(/ADD_CHART:\s*\{[\s\S]*?\}/g, '');
    cleaned = cleaned.replace(/ADD_INSIGHT:\s*\{[\s\S]*?\}/g, '');
    cleaned = cleaned.replace(/UPDATE_SECTION:\s*\{[\s\S]*?\}/g, '');
    cleaned = cleaned.replace(/REMOVE_SECTION:\s*\{[\s\S]*?\}/g, '');
    cleaned = cleaned.replace(/GENERATE_REPORT:\s*\{[\s\S]*?\}/g, '');
    
    // Remove Excel prompt sections
    cleaned = cleaned.replace(/\*\*Form Title:\*\*[\s\S]*?\*\*Questions Found[\s\S]*?Please:/g, '');
    cleaned = cleaned.replace(/Please:\s*\n\d+\.[\s\S]*?(\n\n|$)/g, '');
    
    // Remove any lines that look like JSON properties
    cleaned = cleaned.replace(/^\s*"[^"]+"\s*:\s*.+$/gm, '');
    cleaned = cleaned.replace(/^\s*\}\s*$/gm, '');
    cleaned = cleaned.replace(/^\s*\{\s*$/gm, '');
    cleaned = cleaned.replace(/^\s*\],?\s*$/gm, '');
    cleaned = cleaned.replace(/^\s*\[,?\s*$/gm, '');
    
    // Clean up extra whitespace and bullet points
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    cleaned = cleaned.replace(/^\d+\.\s+/gm, '');
    cleaned = cleaned.trim();
    
    // If message is now empty or just "...", show a default
    if (!cleaned || cleaned === '...' || cleaned.length < 3) {
      return '✅ Done!';
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
    
    // Create a unique ID for this message to avoid reprocessing
    const messageId = `${lastMessage.content.substring(0, 50)}-${messages.length}`;
    
    // Skip if we've already processed this message
    if (processedMessageIds.current.has(messageId)) {
      console.log('⏭️ Already processed this message, skipping...');
      return;
    }
    
    console.log('🔄 Processing complete AI message...');
    console.log('📨 Last message:', lastMessage);
    
    // Mark as processed BEFORE doing any work
    processedMessageIds.current.add(messageId);
    
    try {
      const content = lastMessage.content;
      console.log('📝 Parsing complete message (length:', content.length, ')');
      console.log('🎯 Mode:', mode);
      
      // REPORTING MODE: Parse report operations
      if (mode === 'reporting' && onReportUpdate) {
        console.log('📊 Parsing reporting operations...');
        
        // Parse ADD_CHART, ADD_INSIGHT, UPDATE_SECTION, etc.
        const addChartRegex = /ADD_CHART:\s*```json\s*(\{[\s\S]*?\})\s*```/g;
        const addInsightRegex = /ADD_INSIGHT:\s*```json\s*(\{[\s\S]*?\})\s*```/g;
        const generateReportRegex = /GENERATE_REPORT:\s*```json\s*(\{[\s\S]*?\})\s*```/g;
        
        const chartMatches = Array.from(content.matchAll(addChartRegex));
        const insightMatches = Array.from(content.matchAll(addInsightRegex));
        const reportMatches = Array.from(content.matchAll(generateReportRegex));
        
        const newSections = [...currentSections];
        
        // Process ADD_CHART
        for (const match of chartMatches) {
          try {
            const chartData = JSON.parse(match[1]);
            console.log('📊 Found ADD_CHART:', chartData);
            newSections.push({
              type: 'chart',
              id: chartData.id || `chart-${Date.now()}`,
              title: chartData.title,
              chartType: chartData.type || 'bar',
              dataSource: chartData.data_source,
              description: chartData.description
            });
          } catch (e) {
            console.error('Failed to parse ADD_CHART:', e);
          }
        }
        
        // Process ADD_INSIGHT
        for (const match of insightMatches) {
          try {
            const insightData = JSON.parse(match[1]);
            console.log('💡 Found ADD_INSIGHT:', insightData);
            newSections.push({
              type: 'insight',
              id: insightData.id || `insight-${Date.now()}`,
              title: insightData.title,
              content: insightData.content,
              importance: insightData.importance || 'medium'
            });
          } catch (e) {
            console.error('Failed to parse ADD_INSIGHT:', e);
          }
        }
        
        // Process GENERATE_REPORT (creates multiple sections at once)
        for (const match of reportMatches) {
          try {
            const reportData = JSON.parse(match[1]);
            console.log('📑 Found GENERATE_REPORT:', reportData);
            
            // Clear existing sections and add all sections from report
            newSections.length = 0;
            if (reportData.sections) {
              reportData.sections.forEach((section: any) => {
                newSections.push({
                  ...section,
                  id: section.id || `${section.type}-${Date.now()}-${Math.random()}`
                });
              });
            }
          } catch (e) {
            console.error('Failed to parse GENERATE_REPORT:', e);
          }
        }
        
        // Update report sections if any were added
        if (newSections.length !== currentSections.length) {
          console.log('✅ Updating report sections:', newSections.length);
          onReportUpdate(newSections);
        }
        
        return; // Don't process form operations in reporting mode
      }
      
      // FORM MODE: Parse form operations
      // Extract create_form calls from multiple formats:
      // Format 1: CREATE_FORM:\n{...} (capture until we find a closing brace at the start of a line or followed by narrative text)
      // Format 2: <tool name="create_form">{...}</tool>
      // Format 3: create_form({...})
      
      // Better regex: capture from CREATE_FORM: to the next pattern that looks like narrative text
      // Match until we see } followed by a newline and then text that starts with "I've" or similar
      let createFormMatch = content.match(/CREATE_FORM:\s*(\{[\s\S]*?\n\})\s*(?=\n\n|$)/);
      if (!createFormMatch) {
        createFormMatch = content.match(/<tool name="create_form">\s*\n?\s*(\{[\s\S]*?\})\s*\n?\s*<\/tool>/);
      }
      if (!createFormMatch) {
        createFormMatch = content.match(/create_form\s*\(\s*(\{[\s\S]*?\})\s*\)/);
      }
      
      if (createFormMatch) {
        const jsonStr = createFormMatch[1];
        console.log('Found create_form JSON:', jsonStr);
        
        try {
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
                
                return {
                  id: field.name || field.id || `field-${Date.now()}-${Math.random()}`,
                  type: field.type,
                  label: field.label,
                  placeholder: field.placeholder,
                  description: field.description,
                  required: field.required !== false,
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
            console.log('📋 UPDATE_FIELD matches:', updateMatches.map((m, i) => `Match ${i+1}: ${m[0].substring(0, 150)}...`));
            
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
          
          // Check for add_field calls in multiple formats:
        // Format 0: ADD_FIELD:\n{...}  (NEW EXPLICIT FORMAT)
        // Format 1: <tool name="add_field">{...}</tool>
        // Format 2: add_field({...}) or Calling add_field({...}) - need to handle nested braces
        // Format 3: ```add_field({...})```
        const addFieldRegex0 = /ADD_FIELD:\s*\n?\s*(\{[\s\S]*?\})/g;
        const addFieldRegex1 = /<tool name="add_field">\s*\n?\s*(\{[\s\S]*?\})\s*\n?\s*<\/tool>/g;
        
        // Better regex for nested JSON - capture everything between add_field( and )
        // Allow optional "Calling " prefix
        const addFieldRegex2 = /(?:Calling\s+)?add_field\s*\(\s*(\{(?:[^{}]|\{[^{}]*\})*\})\s*\)/g;
        const addFieldRegex3 = /```\s*(?:Calling\s+)?add_field\s*\(\s*(\{(?:[^{}]|\{[^{}]*\})*\})\s*\)\s*```/g;
        
        const matches0 = Array.from(content.matchAll(addFieldRegex0));
        const matches1 = Array.from(content.matchAll(addFieldRegex1));
        const matches2 = Array.from(content.matchAll(addFieldRegex2));
        const matches3 = Array.from(content.matchAll(addFieldRegex3));
        const allMatches = [...matches0, ...matches1, ...matches2, ...matches3];
        
        console.log(`🔍 Found ${allMatches.length} add_field match(es)`);
        if (allMatches.length > 0) {
          console.log('📋 Match details:', allMatches.map((m, i) => `Match ${i+1}: ${m[0].substring(0, 100)}...`));
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
                
                const newField = {
                  id: fieldId,
                  type: fieldType,
                  label: fieldData.label,
                  placeholder: fieldData.placeholder || fieldData.help_text,
                  description: fieldData.description || fieldData.help_text,
                  required: fieldData.required !== false,
                  options,
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
            const updatedFields = [...currentFields, ...addedFields].map((field: any) => {
              // Ensure options are in correct format
              let options = field.options;
              if (options && Array.isArray(options) && options.length > 0 && typeof options[0] === 'string') {
                options = options.map((opt: string) => ({
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
          
          const { fields, title, description } = convertBackendFormToFrontend(backendForm);
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
  }, [messages, isLoading, mode, onFormUpdate, onReportUpdate, currentFields, currentSections]);

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
      const apiEndpoint = mode === 'reporting' ? '/api/report-chat' : '/api/chat';
      console.log(`Making API call to ${apiEndpoint}...`);
      
      // Add context based on mode
      let systemContext = '';
      if (mode === 'form' && currentFields.length > 0) {
        systemContext = `\n\n**Current Form State:**\nThe form currently has ${currentFields.length} field(s):\n${currentFields.map(f => `- ${f.label} (${f.type})`).join('\n')}`;
      } else if (mode === 'reporting' && currentSections.length > 0) {
        systemContext = `\n\n**Current Report State:**\nThe report currently has ${currentSections.length} section(s):\n${currentSections.map((s, i) => `${i + 1}. [${s.type}] ${s.title}`).join('\n')}`;
      }
      
      const contextualMessage = {
        ...userMessage,
        content: userMessage.content + systemContext
      };
      
      const requestBody: any = {
        messages: [...messages, contextualMessage]
      };
      
      // Add report data when in reporting mode
      if (mode === 'reporting' && reportData) {
        requestBody.reportData = reportData;
      }
      
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
      setMessages(prev => [...prev, { role: 'assistant', content: 'thinking' }]);
      setStatusMessages([]);
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
          
          const chunk = decoder.decode(value, { stream: true });
          // Just append all text - it's already in plain text format
          assistantMessage += chunk;
          
          // Extract status messages as we stream
          const statuses = extractStatusMessages(assistantMessage);
          if (statuses.length > 0) {
            setStatusMessages(statuses);
          }
          
        // Store the RAW message (we'll clean it later AFTER parsing in useEffect)
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { 
            role: 'assistant', 
            content: assistantMessage  // Store RAW message for parsing
          };
          return newMessages;
        });
      }
      
      // Clear status messages when done
      setStatusMessages([]);
      
      // Raw message stored - useEffect will parse and clean it
      console.log('✅ Stream complete. Message length:', assistantMessage.length);
      
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

  const suggestedPrompts = mode === 'reporting' 
    ? [
        "Show me compliance trends",
        "Generate a report for Google",
        "What are the key findings?",
      ]
    : [
        "Create a contact form",
        "Build a feedback survey",
        "Make a registration form",
      ];

  return (
    <div
      className={`fixed top-0 right-0 h-screen border-l flex flex-col transition-all duration-300 z-50 ${
        isOpen
          ? "w-96 bg-gradient-to-b from-[#c4dfc4] via-[#d0e8d0] to-[#b5d0b5] border-border shadow-lg"
          : "w-12 bg-gradient-to-b from-[#c4dfc4] to-[#b5d0b5] border-[#c4dfc4]"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center transition-all duration-300 ${
          isOpen
            ? "border-b border-white/20 bg-gradient-to-r from-[#b5d0b5] to-[#c4dfc4] p-4 justify-between h-16"
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
                <h3 className="text-sm font-semibold text-[#0a0a0a]">AI Assistant</h3>
                <p className="text-xs text-gray-600">
                  {mode === 'reporting' ? 'Chat to build your report' : 'Chat to build your form'}
                </p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
              title="Collapse AI Assistant"
            >
              <PanelRightClose className="h-4 w-4 text-gray-600" />
            </button>
          </>
        ) : (
          <button
            onClick={onToggle}
            className="hover:bg-[#b5d0b5] p-2 rounded-lg transition-colors"
            title="Open AI Assistant"
          >
            <Sparkles className="h-5 w-5 text-[#0a0a0a]" />
          </button>
        )}
      </div>

      {/* Chat Messages */}
      {isOpen && (
        <>
          <div
            ref={scrollRef}
            className="flex-1 p-4 bg-gradient-to-b from-[#c4dfc4] via-[#d0e8d0] to-[#b5d0b5] overflow-y-auto"
          >
            <div className="space-y-4">
              {/* Welcome Message */}
              {messages.length === 0 && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#c4dfc4] to-[#c8e0f5]">
                    <Sparkles className="h-4 w-4 text-[#0a0a0a]" />
                  </div>
                  <Card className="flex-1 p-3 bg-white border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-800 mb-2">
                      {mode === 'reporting'
                        ? "📊 Hi! I'm your AI reporting assistant. Ask me to analyze your data or generate insights."
                        : "👋 Hi! I'm your AI form builder. Tell me what form you'd like to create and I'll build it for you."
                      }
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {suggestedPrompts.map((prompt, idx) => (
                        <Badge
                          key={idx}
                          onClick={() => handleSuggestedPrompt(prompt)}
                          className="cursor-pointer bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 text-xs"
                        >
                          {prompt}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* Chat Messages */}
              {isMounted && messages.map((message: any, idx: number) => {
                const isThinking = message.role === "assistant" && message.content === "thinking";
                const cleanedContent = message.role === "assistant" ? cleanMessageForDisplay(message.content) : message.content;
                
                // Skip rendering if it's a thinking placeholder and we have status messages
                if (isThinking && statusMessages.length > 0) {
                  return null;
                }
                
                return (
                  <div
                    key={idx}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#c4dfc4] to-[#c8e0f5]">
                        {isThinking ? (
                          <Loader2 className="h-4 w-4 text-[#0a0a0a] animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4 text-[#0a0a0a]" />
                        )}
                      </div>
                    )}
                    <Card
                      className={`p-3 shadow-sm ${
                        message.role === "user"
                          ? "max-w-[85%] bg-white border-0"
                          : "flex-1 bg-white border-gray-200"
                      }`}
                    >
                      {isThinking ? (
                        <p className="text-xs text-gray-500 italic flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Thinking...
                        </p>
                      ) : (
                        <p className="text-xs text-gray-800 whitespace-pre-wrap">
                          {cleanedContent}
                        </p>
                      )}
                    </Card>
                    {message.role === "user" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-200">
                        <span className="text-xs font-medium text-gray-700">U</span>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Status Messages During Processing */}
              {statusMessages.length > 0 && (
                <div className="space-y-2">
                  {statusMessages.map((status, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#c4dfc4] to-[#c8e0f5]">
                        <Loader2 className="h-4 w-4 text-[#0a0a0a] animate-spin" />
                      </div>
                      <Card className="flex-1 p-2 bg-gradient-to-r from-[#c4dfc4]/20 to-[#c8e0f5]/20 border-[#c4dfc4]/50">
                        <p className="text-xs text-gray-700 font-medium">{status}</p>
                      </Card>
                    </div>
                  ))}
                </div>
              )}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#c4dfc4] to-[#c8e0f5]">
                    <Loader2 className="h-4 w-4 text-[#0a0a0a] animate-spin" />
                  </div>
                  <Card className="flex-1 p-3 bg-white border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500">Thinking...</p>
                  </Card>
                </div>
              )}
            </div>
          </div>

          {/* Chat Input */}
          <div className="border-t border-white/20 p-3 bg-gradient-to-r from-[#b5d0b5] to-[#c4dfc4]">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <form onSubmit={handleSubmit} className="flex gap-2">
              {/* File Upload Button (only in form mode) */}
              {mode === 'form' && (
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || isParsingFile}
                  size="icon"
                  className="bg-white/80 border border-white/30 text-gray-700 hover:bg-white/90 shrink-0"
                  title="Upload Excel file"
                >
                  {isParsingFile ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4" />
                  )}
                </Button>
              )}
              
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'reporting' ? "Ask me anything..." : "Describe your form or upload Excel..."}
                disabled={isLoading || isParsingFile}
                className="flex-1 bg-white/80 border-white/30 text-sm text-gray-800 placeholder:text-gray-500"
              />
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
            </form>
          </div>
        </>
      )}
    </div>
  );
}

