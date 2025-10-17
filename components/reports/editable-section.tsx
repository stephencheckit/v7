"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Check, X } from "lucide-react";
import { useState } from "react";

export interface EditableSectionProps {
  id: string;
  title: string;
  content: string;
  importance?: 'high' | 'medium' | 'low';
  onUpdate?: (title: string, content: string) => void;
  onRemove?: () => void;
}

export function EditableSection({ 
  id, 
  title, 
  content, 
  importance = 'medium',
  onUpdate,
  onRemove 
}: EditableSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editContent, setEditContent] = useState(content);
  const [isHovered, setIsHovered] = useState(false);

  const handleSave = () => {
    onUpdate?.(editTitle, editContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(title);
    setEditContent(content);
    setIsEditing(false);
  };

  const importanceColors = {
    high: 'border-l-red-500',
    medium: 'border-l-yellow-500',
    low: 'border-l-blue-500'
  };

  return (
    <Card 
      className={`bg-[#0a0a0a] border-border/50 border-l-4 ${importanceColors[importance]} p-6 relative`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isEditing ? (
        <>
          {/* Edit Mode */}
          <div className="space-y-4">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="text-lg font-semibold bg-[#1a1a1a] border-border/50"
              placeholder="Section title"
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full min-h-[100px] p-3 rounded-md bg-[#1a1a1a] border border-border/50 text-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-[#c4dfc4]"
              placeholder="Section content"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                className="bg-[#c4dfc4] text-[#0a0a0a] hover:bg-[#b5d0b5]"
              >
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* View Mode */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-100 mb-3">{title}</h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{content}</p>
            </div>

            {/* Action Buttons - Show on hover */}
            {isHovered && (
              <div className="flex gap-1">
                {onUpdate && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onRemove && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-red-500/20"
                    onClick={onRemove}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
}

