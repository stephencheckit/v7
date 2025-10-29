import { SkeletonCard, SkeletonText } from "./skeleton-card";

export function LearnSkeleton() {
  return (
    <div className="flex w-full h-full overflow-hidden">
      <div className="flex-1 h-full overflow-auto">
        <div className="p-4 md:p-8">
          <div className="mx-auto max-w-[1600px] space-y-6 md:space-y-8">
            {/* Header Skeleton */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <SkeletonCard className="h-10 w-10 rounded-lg" />
                    <SkeletonText className="h-8 w-24" />
                  </div>
                  <SkeletonText className="h-4 w-80" />
                </div>
                <SkeletonCard className="h-10 w-40" />
              </div>
            </div>

            {/* Course Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} className="h-48" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

