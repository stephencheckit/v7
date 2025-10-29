"use client";

import type { TextBlock as TextBlockType } from "@/lib/types/course";

interface TextBlockProps {
    block: TextBlockType;
}

export function TextBlock({ block }: TextBlockProps) {
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">
                {block.title}
            </h2>
            <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {block.body}
            </div>
        </div>
    );
}

