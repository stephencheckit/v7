/**
 * Course Types for V7 Engage
 * AI-generated training content with interactive blocks
 */

// ============================================================================
// Block Types
// ============================================================================

export type BlockType = 'text' | 'multiple_choice' | 'true_false';

export interface TextBlock {
    type: 'text';
    title: string;
    body: string;
}

export interface MultipleChoiceBlock {
    type: 'multiple_choice';
    question: string;
    options: string[]; // 4 options (A, B, C, D)
    correct_index: number; // 0-3
    explanation: string;
    points: number;
}

export interface TrueFalseBlock {
    type: 'true_false';
    statement: string;
    correct_answer: boolean;
    explanation: string;
    points: number;
}

export type CourseBlock = TextBlock | MultipleChoiceBlock | TrueFalseBlock;

// ============================================================================
// Course
// ============================================================================

export interface Course {
    id: string;
    workspace_id: string;
    creator_id: string;
    title: string;
    description?: string;
    blocks: CourseBlock[];
    total_points: number;
    estimated_minutes: number;
    created_at: string;
}

// ============================================================================
// Client-side progress tracking (session only, not persisted)
// ============================================================================

export interface CourseProgress {
    currentBlockIndex: number;
    answers: Record<number, any>; // blockIndex -> answer
    score: number;
    completed: boolean;
}

