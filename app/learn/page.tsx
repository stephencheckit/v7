"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus } from "lucide-react";
import { CourseCard } from "@/components/learn/course-card";
import { AIChatPanel } from "@/components/ai-chat-panel";
import { CenteredSpinner } from "@/components/loading";
import type { Course } from "@/lib/types/course";

export default function LearnPage() {
    const { workspaceId, isLoading: authLoading } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAI, setShowAI] = useState(false);

    // Load initial chat state from localStorage after mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('learn-ai-chat-open');
            if (saved === 'true') {
                setShowAI(true);
            }
        }
    }, []);

    // Save AI chat state to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('learn-ai-chat-open', String(showAI));
        }
    }, [showAI]);

    useEffect(() => {
        if (workspaceId && !authLoading) {
            loadCourses();
        }
    }, [workspaceId, authLoading]);

    const loadCourses = async () => {
        if (!workspaceId) {
            console.log('No workspaceId yet, skipping course load');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`/api/courses?workspace_id=${workspaceId}`);

            if (!response.ok) {
                console.error('Failed to load courses:', response.status, response.statusText);
                setCourses([]);
                return;
            }

            const data = await response.json();
            setCourses(data.courses || []);
        } catch (error) {
            console.error('Error loading courses:', error);
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return <CenteredSpinner />;
    }

    return (
        <div className="flex w-full h-full overflow-hidden">
            {/* Main Content */}
            <div className={`flex-1 h-full overflow-auto transition-all duration-300 ${showAI ? 'mr-96' : 'mr-12'}`}>
                <div className="p-4 md:p-8">
                    <div className="mx-auto max-w-[1600px] space-y-6 md:space-y-8">
                        {/* Header */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-2 md:gap-3">
                                        <Sparkles className="h-6 w-6 md:h-10 md:w-10 text-[#c4dfc4]" />
                                        Learn
                                    </h1>
                                    <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
                                        Interactive training courses for your team
                                    </p>
                                </div>

                                <Button
                                    onClick={() => setShowAI(!showAI)}
                                    className="bg-[#c4dfc4] text-[#0a0a0a] hover:bg-[#b5d0b5] shrink-0"
                                >
                                    <Plus className="h-4 w-4 md:mr-2" />
                                    <span className="hidden md:inline">Create with AI</span>
                                </Button>
                            </div>
                        </div>

                        {/* Course Grid */}
                        {courses.length === 0 ? (
                            <div className="text-center py-16 space-y-4">
                                <Sparkles className="h-16 w-16 text-muted-foreground/50 mx-auto" />
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        No courses yet
                                    </h3>
                                    <p className="text-muted-foreground mb-6">
                                        Create your first course using AI in seconds
                                    </p>
                                    <Button
                                        onClick={() => setShowAI(true)}
                                        className="bg-[#c4dfc4] text-[#0a0a0a] hover:bg-[#b5d0b5]"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Course
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                {courses.map((course) => (
                                    <CourseCard key={course.id} course={course} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Chat Panel */}
      <AIChatPanel
        isOpen={showAI}
        onToggle={() => setShowAI(!showAI)}
        context="courses"
        onCourseCreated={loadCourses}
      />
        </div>
    );
}

