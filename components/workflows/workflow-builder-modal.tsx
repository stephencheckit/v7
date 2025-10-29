"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/auth-context";

interface WorkflowBuilderModalProps {
  onClose: () => void;
  onSave: () => void;
}

export function WorkflowBuilderModal({ onClose, onSave }: WorkflowBuilderModalProps) {
  const { workspaceId } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a workflow name");
      return;
    }
    
    // For MVP, show message directing to AI
    toast.info("Use the AI chat to create workflows for now. Manual builder coming soon!");
    onClose();
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Workflow</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Info Message */}
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> Use the AI chat to create workflows quickly! Just describe what you want:
              <br />"Alert me when temperature exceeds 32°F"
              <br />"Email manager when checklist is overdue"
            </p>
          </div>
          
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Workflow Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Freezer Temperature Alert"
                className="mt-1.5"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this workflow does..."
                className="mt-1.5"
                rows={3}
              />
            </div>
          </div>
          
          {/* Coming Soon Message */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-sm text-yellow-500/90">
              <strong>Manual workflow builder coming soon!</strong>
              <br />
              For now, please use the AI chat to create workflows. It's faster and easier!
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a]"
          >
            {isSaving ? 'Saving...' : 'Continue with AI'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

