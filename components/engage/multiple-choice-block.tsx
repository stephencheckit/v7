"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import type { MultipleChoiceBlock as MultipleChoiceBlockType } from "@/lib/types/course";

interface MultipleChoiceBlockProps {
    block: MultipleChoiceBlockType;
    onAnswer: (correct: boolean, points: number) => void;
    initialAnswer?: number;
}

export function MultipleChoiceBlock({ block, onAnswer, initialAnswer }: MultipleChoiceBlockProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(initialAnswer ?? null);
    const [submitted, setSubmitted] = useState(initialAnswer !== undefined);

    const handleSubmit = () => {
        if (selectedIndex === null) return;

        const correct = selectedIndex === block.correct_index;
        setSubmitted(true);
        onAnswer(correct, correct ? block.points : 0);
    };

    const getOptionClass = (index: number) => {
        if (!submitted) {
            return selectedIndex === index
                ? "border-[#c4dfc4] bg-[#c4dfc4]/10"
                : "border-white/20 hover:border-[#c4dfc4]/50";
        }

        if (index === block.correct_index) {
            return "border-green-500 bg-green-500/10";
        }

        if (index === selectedIndex && index !== block.correct_index) {
            return "border-red-500 bg-red-500/10";
        }

        return "border-white/20 opacity-50";
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">
                {block.question}
            </h2>

            <div className="space-y-3">
                {block.options.map((option, index) => (
                    <Card
                        key={index}
                        className={`p-4 cursor-pointer transition-all ${getOptionClass(index)}`}
                        onClick={() => !submitted && setSelectedIndex(index)}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-white">
                                {String.fromCharCode(65 + index)}. {option}
                            </span>
                            {submitted && index === block.correct_index && (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                            )}
                            {submitted && index === selectedIndex && index !== block.correct_index && (
                                <XCircle className="h-5 w-5 text-red-500" />
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {!submitted && (
                <Button
                    onClick={handleSubmit}
                    disabled={selectedIndex === null}
                    className="w-full bg-[#c4dfc4] text-[#0a0a0a] hover:bg-[#b5d0b5] disabled:opacity-50"
                >
                    Submit Answer
                </Button>
            )}

            {submitted && (
                <Card className={`p-4 ${selectedIndex === block.correct_index ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'}`}>
                    <div className="flex items-start gap-3">
                        {selectedIndex === block.correct_index ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        ) : (
                            <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                        )}
                        <div className="space-y-2">
                            <p className={`font-semibold ${selectedIndex === block.correct_index ? 'text-green-400' : 'text-red-400'}`}>
                                {selectedIndex === block.correct_index ? 'Correct!' : 'Incorrect'}
                            </p>
                            <p className="text-gray-300">
                                {block.explanation}
                            </p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}

