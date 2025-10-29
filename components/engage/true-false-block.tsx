"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import type { TrueFalseBlock as TrueFalseBlockType } from "@/lib/types/course";

interface TrueFalseBlockProps {
    block: TrueFalseBlockType;
    onAnswer: (correct: boolean, points: number) => void;
    initialAnswer?: boolean;
}

export function TrueFalseBlock({ block, onAnswer, initialAnswer }: TrueFalseBlockProps) {
    const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(initialAnswer ?? null);
    const [submitted, setSubmitted] = useState(initialAnswer !== undefined);

    const handleAnswer = (answer: boolean) => {
        if (submitted) return;

        setSelectedAnswer(answer);
        setSubmitted(true);
        const correct = answer === block.correct_answer;
        onAnswer(correct, correct ? block.points : 0);
    };

    const getButtonClass = (value: boolean) => {
        if (!submitted) {
            return "bg-white/10 hover:bg-[#c4dfc4]/20 border-white/20";
        }

        if (value === block.correct_answer) {
            return "bg-green-500/20 border-green-500 text-green-400";
        }

        if (value === selectedAnswer && value !== block.correct_answer) {
            return "bg-red-500/20 border-red-500 text-red-400";
        }

        return "bg-white/5 border-white/10 opacity-50";
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">
                {block.statement}
            </h2>

            <div className="grid grid-cols-2 gap-4">
                <Button
                    onClick={() => handleAnswer(true)}
                    disabled={submitted}
                    className={`h-24 text-lg font-semibold ${getButtonClass(true)}`}
                    variant="outline"
                >
                    <div className="flex items-center gap-2">
                        <span>True</span>
                        {submitted && block.correct_answer && (
                            <CheckCircle2 className="h-5 w-5" />
                        )}
                        {submitted && selectedAnswer === true && !block.correct_answer && (
                            <XCircle className="h-5 w-5" />
                        )}
                    </div>
                </Button>

                <Button
                    onClick={() => handleAnswer(false)}
                    disabled={submitted}
                    className={`h-24 text-lg font-semibold ${getButtonClass(false)}`}
                    variant="outline"
                >
                    <div className="flex items-center gap-2">
                        <span>False</span>
                        {submitted && !block.correct_answer && (
                            <CheckCircle2 className="h-5 w-5" />
                        )}
                        {submitted && selectedAnswer === false && block.correct_answer && (
                            <XCircle className="h-5 w-5" />
                        )}
                    </div>
                </Button>
            </div>

            {submitted && (
                <Card className={`p-4 ${selectedAnswer === block.correct_answer ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'}`}>
                    <div className="flex items-start gap-3">
                        {selectedAnswer === block.correct_answer ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        ) : (
                            <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                        )}
                        <div className="space-y-2">
                            <p className={`font-semibold ${selectedAnswer === block.correct_answer ? 'text-green-400' : 'text-red-400'}`}>
                                {selectedAnswer === block.correct_answer ? 'Correct!' : 'Incorrect'}
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

