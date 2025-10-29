import { SkeletonCard, SkeletonText } from "./skeleton-card";

export function CanvasSkeleton() {
  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a]">
      {/* Header Skeleton */}
      <div className="border-b border-white/20 bg-gradient-to-r from-[#0a0a0a] to-[#0f0f0f] p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <SkeletonCard className="h-6 w-6 rounded" />
              <SkeletonText className="h-6 w-24" />
            </div>
            <SkeletonText className="h-4 w-80" />
          </div>
          <div className="flex items-center gap-2">
            <SkeletonCard className="h-10 w-32" />
            <SkeletonCard className="h-10 w-32" />
          </div>
        </div>
      </div>

      {/* Canvas Area Skeleton */}
      <div className="flex-1 relative bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-pulse">
            <SkeletonCard className="h-12 w-12 rounded-lg mx-auto mb-4" />
            <SkeletonText className="h-4 w-48 mx-auto" />
          </div>
        </div>

        {/* Mini node placeholders */}
        <div className="absolute inset-0 flex items-center justify-center gap-8 opacity-20">
          <div className="space-y-4">
            <SkeletonCard className="h-16 w-32 rounded-lg" />
            <SkeletonCard className="h-16 w-32 rounded-lg" />
            <SkeletonCard className="h-16 w-32 rounded-lg" />
          </div>
          <div className="space-y-4">
            <SkeletonCard className="h-16 w-32 rounded-lg" />
            <SkeletonCard className="h-16 w-32 rounded-lg" />
          </div>
          <div className="space-y-4">
            <SkeletonCard className="h-16 w-32 rounded-lg" />
            <SkeletonCard className="h-16 w-32 rounded-lg" />
            <SkeletonCard className="h-16 w-32 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Legend Skeleton */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <SkeletonCard className="h-12 w-96 rounded-lg" />
      </div>
    </div>
  );
}

