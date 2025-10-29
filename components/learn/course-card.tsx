"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Course } from "@/lib/types/course";

interface CourseCardProps {
    course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
    const router = useRouter();

    const handleStart = () => {
        router.push(`/learn/${course.id}`);
    };

    return (
        <Card className="p-6 hover:border-[#c4dfc4] transition-all cursor-pointer group" onClick={handleStart}>
            <div className="space-y-4">
                {/* Title and Description */}
                <div>
                    <h3 className="text-xl font-semibold text-white group-hover:text-[#c4dfc4] transition-colors">
                        {course.title}
                    </h3>
                    {course.description && (
                        <p className="text-muted-foreground mt-1 line-clamp-2">
                            {course.description}
                        </p>
                    )}
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>{course.estimated_minutes} min</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Trophy className="h-4 w-4" />
                        <span>{course.total_points} points</span>
                    </div>
                    <div className="text-muted-foreground/70">
                        {course.blocks.length} blocks
                    </div>
                </div>

                {/* Action Button */}
                <Button
                    onClick={handleStart}
                    className="w-full bg-[#c4dfc4] text-[#0a0a0a] hover:bg-[#b5d0b5]"
                >
                    Start Course
                </Button>
            </div>
        </Card>
    );
}

