"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Pencil, MessageSquare, Wand2, Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface FormCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FormCreationModal({ isOpen, onClose }: FormCreationModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<'select' | 'ai-draft'>('select');
  const [isCreating, setIsCreating] = useState(false);
  const [creatingOption, setCreatingOption] = useState<'scratch' | 'chat' | 'draft' | null>(null);
  
  // AI Draft form fields
  const [formGoal, setFormGoal] = useState('');
  const [dataNeeded, setDataNeeded] = useState('');
  const [formLength, setFormLength] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const handleClose = () => {
    // Reset state
    setStep('select');
    setFormGoal('');
    setDataNeeded('');
    setFormLength('');
    setAdditionalNotes('');
    setIsCreating(false);
    setCreatingOption(null);
    onClose();
  };

  const createBlankForm = async (aiChatMode: 'collapsed' | 'expanded') => {
    const option = aiChatMode === 'collapsed' ? 'scratch' : 'chat';
    setCreatingOption(option);
    setIsCreating(true);
    try {
      // Create blank form with timestamp name
      const timestamp = new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      const formName = `Form - ${timestamp}`;
      
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formName,
          description: '',
          schema: {
            fields: [],
            submitButton: { label: 'Submit' }
          }
        })
      });

      if (!response.ok) throw new Error('Failed to create form');
      
      const data = await response.json();
      const formId = data.form.id;
      
      // Navigate to builder with mode param
      // Don't close modal - let navigation handle it to prevent flash
      router.push(`/forms/builder?id=${formId}&chatMode=${aiChatMode}`);
    } catch (error) {
      console.error('Failed to create form:', error);
      alert('Failed to create form. Please try again.');
      setIsCreating(false);
    }
  };

  const handleAIDraft = async () => {
    if (!formGoal.trim()) {
      alert('Please describe the goal of your form');
      return;
    }
    
    setCreatingOption('draft');
    setIsCreating(true);
    try {
      // Create a blank form first with temporary name
      const tempName = `Form - ${new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })}`;
      
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: tempName,
          description: '',
          schema: {
            fields: [],
            submitButton: { label: 'Submit' }
          }
        })
      });

      if (!response.ok) throw new Error('Failed to create form');
      
      const data = await response.json();
      const formId = data.form.id;
      
      // Build AI prompt from requirements
      const aiPrompt = `Create a form with the following requirements:

**Goal:** ${formGoal}
${dataNeeded ? `\n**Data Needed:** ${dataNeeded}` : ''}
${formLength ? `\n**Length:** ${formLength}` : ''}
${additionalNotes ? `\n**Additional Notes:** ${additionalNotes}` : ''}

Please create the form now with appropriate fields and a descriptive title.`;
      
      // Navigate to builder with AI prompt
      // Don't close modal - let navigation handle it to prevent flash
      router.push(`/forms/builder?id=${formId}&chatMode=expanded&aiPrompt=${encodeURIComponent(aiPrompt)}`);
    } catch (error) {
      console.error('Failed to create form:', error);
      alert('Failed to create form. Please try again.');
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={isCreating ? undefined : handleClose}>
      <DialogContent className="max-w-[90vw] lg:max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {/* Loading Overlay */}
          {isCreating && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center">
              <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-[#c4dfc4] mx-auto" />
                <div className="space-y-2">
                  <p className="text-white font-semibold text-lg">
                    {creatingOption === 'scratch' && 'Creating blank form...'}
                    {creatingOption === 'chat' && 'Setting up AI chat...'}
                    {creatingOption === 'draft' && 'Generating form with AI...'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    This will only take a moment
                  </p>
                </div>
              </div>
            </div>
          )}

        {step === 'select' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">
                What kind of form do you want to build?
              </DialogTitle>
              <p className="text-sm text-muted-foreground text-center">
                Choose your starting point
              </p>
            </DialogHeader>

            <div className="flex flex-col gap-3 mt-6">
              {/* Option 1: Build from Scratch */}
              <Card 
                className={`p-4 cursor-pointer hover:border-[#c4dfc4] hover:shadow-xl transition-all group ${
                  isCreating ? 'opacity-50 pointer-events-none' : ''
                }`}
                onClick={() => !isCreating && createBlankForm('collapsed')}
              >
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#c4dfc4] to-[#b5d0b5] flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <Pencil className="h-8 w-8 text-[#0a0a0a]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1">Build from Scratch</h3>
                    <p className="text-sm text-muted-foreground">
                      Start with a blank canvas and add fields manually
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="group-hover:bg-[#c4dfc4]/10 px-6 py-2 text-sm flex-shrink-0"
                    disabled={isCreating}
                  >
                    {creatingOption === 'scratch' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Start Building'}
                  </Button>
                </div>
              </Card>

              {/* Option 2: Build with Conversational AI */}
              <Card 
                className={`p-4 cursor-pointer hover:border-[#c8e0f5] hover:shadow-xl transition-all group ${
                  isCreating ? 'opacity-50 pointer-events-none' : ''
                }`}
                onClick={() => !isCreating && createBlankForm('expanded')}
              >
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#c8e0f5] to-[#b5d0e5] flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <MessageSquare className="h-8 w-8 text-[#0a0a0a]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1">Build with AI Chat</h3>
                    <p className="text-sm text-muted-foreground">
                      Chat with AI to build your form step-by-step
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="group-hover:bg-[#c8e0f5]/10 px-6 py-2 text-sm flex-shrink-0"
                    disabled={isCreating}
                  >
                    {creatingOption === 'chat' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Start Chatting'}
                  </Button>
                </div>
              </Card>

              {/* Option 3: Let AI Build First Draft */}
              <Card 
                className={`p-4 cursor-pointer hover:border-[#ddc8f5] hover:shadow-xl transition-all group ${
                  isCreating ? 'opacity-50 pointer-events-none' : ''
                }`}
                onClick={() => !isCreating && setStep('ai-draft')}
              >
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#ddc8f5] to-[#cdb8e5] flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <Wand2 className="h-8 w-8 text-[#0a0a0a]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1">Let AI Build Draft</h3>
                    <p className="text-sm text-muted-foreground">
                      Describe your needs and AI creates the form
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="group-hover:bg-[#ddc8f5]/10 px-6 py-2 text-sm flex-shrink-0"
                  >
                    Describe Form
                  </Button>
                </div>
              </Card>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Describe Your Form
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Tell us about your form and AI will create a first draft
              </p>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="goal" className="text-sm font-medium">
                  What is the goal of this form? <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="goal"
                  placeholder="E.g., Daily kitchen inspection checklist to ensure food safety compliance"
                  value={formGoal}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormGoal(e.target.value)}
                  className="mt-1.5 min-h-[80px]"
                />
              </div>

              <div>
                <Label htmlFor="data" className="text-sm font-medium">
                  What data do you need to collect?
                </Label>
                <Textarea
                  id="data"
                  placeholder="E.g., Temperature readings, cleanliness checks, equipment status, staff signatures"
                  value={dataNeeded}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDataNeeded(e.target.value)}
                  className="mt-1.5 min-h-[80px]"
                />
              </div>

              <div>
                <Label htmlFor="length" className="text-sm font-medium">
                  How long should the form be?
                </Label>
                <Input
                  id="length"
                  placeholder="E.g., 10-15 questions, Quick 5-minute form, Comprehensive 30-field checklist"
                  value={formLength}
                  onChange={(e) => setFormLength(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm font-medium">
                  Any other requirements or notes?
                </Label>
                <Textarea
                  id="notes"
                  placeholder="E.g., Must include photo uploads, needs to follow FDA guidelines, should have section for corrective actions"
                  value={additionalNotes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdditionalNotes(e.target.value)}
                  className="mt-1.5 min-h-[80px]"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setStep('select')}
                className="flex-1"
                disabled={isCreating}
              >
                Back
              </Button>
              <Button
                onClick={handleAIDraft}
                className="flex-1 bg-[#ddc8f5] hover:bg-[#cdb8e5] text-[#0a0a0a]"
                disabled={isCreating || !formGoal.trim()}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    Generate Form
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

