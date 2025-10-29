import { SkeletonCard, SkeletonText } from "./skeleton-card";

export function WorkflowsSkeleton() {
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
                    <SkeletonText className="h-8 w-32" />
                  </div>
                  <SkeletonText className="h-4 w-96" />
                </div>
                <div className="flex items-center gap-2">
                  <SkeletonCard className="h-10 w-32" />
                  <SkeletonCard className="h-10 w-40" />
                </div>
              </div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} className="h-28" />
              ))}
            </div>

            {/* Workflow Cards Skeleton */}
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} className="h-32" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

