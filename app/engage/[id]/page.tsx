"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Trophy, X } from "lucide-react";
import { TextBlock } from "@/components/engage/text-block";
import { MultipleChoiceBlock } from "@/components/engage/multiple-choice-block";
import { TrueFalseBlock } from "@/components/engage/true-false-block";
import { CenteredSpinner } from "@/components/loading";
import type { Course, CourseBlock } from "@/lib/types/course";

interface CourseViewerPageProps {
    params: Promise<{ id: string }>;
}

export default function CourseViewerPage({ params }: CourseViewerPageProps) {
    const router = useRouter();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, any>>({});
    const [score, setScore] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [courseId, setCourseId] = useState<string | null>(null);

    // Unwrap params
    useEffect(() => {
        params.then(p => setCourseId(p.id));
    }, [params]);

    useEffect(() => {
        if (courseId) {
            loadCourse();
        }
    }, [courseId]);

    const loadCourse = async () => {
        if (!courseId) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/courses/${courseId}`);

            if (!response.ok) {
                console.error('Failed to load course:', response.status);
                return;
            }

            const data = await response.json();
            setCourse(data.course);
        } catch (error) {
            console.error('Error loading course:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (blockIndex: number, correct: boolean, points: number) => {
        setAnswers(prev => ({ ...prev, [blockIndex]: { correct, points } }));
        if (correct) {
            setScore(prev => prev + points);
        }
    };

    const handleNext = () => {
        if (course && currentBlockIndex < course.blocks.length - 1) {
            setCurrentBlockIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentBlockIndex > 0) {
            setCurrentBlockIndex(prev => prev - 1);
        }
    };

    const handleComplete = () => {
        setCompleted(true);
    };

    const handleBackToLibrary = () => {
        router.push('/engage');
    };

    if (loading || !courseId) {
        return <CenteredSpinner />;
    }

    if (!course) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center space-y-4">
                    <p className="text-muted-foreground">Course not found</p>
                    <Button onClick={handleBackToLibrary}>Back to Library</Button>
                </div>
            </div>
        );
    }

    if (completed) {
        const percentage = course.total_points > 0
            ? Math.round((score / course.total_points) * 100)
            : 100;

        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <Card className="p-8 max-w-2xl w-full text-center space-y-6">
                    <div className="space-y-4">
                        <Trophy className="h-16 w-16 text-[#c4dfc4] mx-auto" />
                        <h1 className="text-3xl font-bold text-white">Course Complete!</h1>
                        <p className="text-muted-foreground">
                            Congratulations on completing {course.title}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="text-center">
                            <div className="text-5xl font-bold text-[#c4dfc4] mb-2">
                                {score} / {course.total_points}
                            </div>
                            <div className="text-muted-foreground">points earned</div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Score</span>
                                <span>{percentage}%</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                        </div>
                    </div>

                    <Button
                        onClick={handleBackToLibrary}
                        className="w-full bg-[#c4dfc4] text-[#0a0a0a] hover:bg-[#b5d0b5]"
                    >
                        Back to Library
                    </Button>
                </Card>
            </div>
        );
    }

    const currentBlock = course.blocks[currentBlockIndex];
    const progress = ((currentBlockIndex + 1) / course.blocks.length) * 100;
    const isLastBlock = currentBlockIndex === course.blocks.length - 1;
    const canGoNext = currentBlock.type === 'text' || answers[currentBlockIndex];

    return (
        <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <Card className="p-4 sticky top-4 z-10 bg-[#0a0a0a]/95 backdrop-blur-sm border-white/20">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-lg font-semibold text-white">{course.title}</h1>
                                <p className="text-sm text-muted-foreground">
                                    Block {currentBlockIndex + 1} of {course.blocks.length}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <div className="text-sm font-semibold text-[#c4dfc4]">
                                        {score} / {course.total_points}
                                    </div>
                                    <div className="text-xs text-muted-foreground">points</div>
                                </div>
                                <Button
                                    onClick={handleBackToLibrary}
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-white"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                </Card>

                {/* Block Content */}
                <Card className="p-6 md:p-8">
                    {currentBlock.type === 'text' && (
                        <TextBlock block={currentBlock} />
                    )}
                    {currentBlock.type === 'multiple_choice' && (
                        <MultipleChoiceBlock
                            block={currentBlock}
                            onAnswer={(correct, points) => handleAnswer(currentBlockIndex, correct, points)}
                            initialAnswer={answers[currentBlockIndex]?.correct !== undefined ?
                                (currentBlock.options.findIndex((_, i) => i === answers[currentBlockIndex]?.selectedIndex)) :
                                undefined
                            }
                        />
                    )}
                    {currentBlock.type === 'true_false' && (
                        <TrueFalseBlock
                            block={currentBlock}
                            onAnswer={(correct, points) => handleAnswer(currentBlockIndex, correct, points)}
                            initialAnswer={answers[currentBlockIndex]?.selectedAnswer}
                        />
                    )}
                </Card>

                {/* Navigation */}
                <div className="flex items-center justify-between gap-4">
                    <Button
                        onClick={handlePrevious}
                        disabled={currentBlockIndex === 0}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                    </Button>

                    {isLastBlock ? (
                        <Button
                            onClick={handleComplete}
                            className="bg-[#c4dfc4] text-[#0a0a0a] hover:bg-[#b5d0b5]"
                        >
                            Complete Course
                            <Trophy className="h-4 w-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleNext}
                            disabled={!canGoNext}
                            className="bg-[#c4dfc4] text-[#0a0a0a] hover:bg-[#b5d0b5] disabled:opacity-50"
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

