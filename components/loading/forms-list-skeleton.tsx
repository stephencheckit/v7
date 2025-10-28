import { SkeletonCard, SkeletonText } from "./skeleton-card";

export function FormsListSkeleton() {
  return (
    <div className="w-full h-full overflow-auto overflow-x-hidden">
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
                <SkeletonText className="h-4 w-64" />
              </div>
              <SkeletonCard className="h-10 w-32" />
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} className="h-24" />
            ))}
          </div>

          {/* Table Skeleton */}
          <div className="bg-white/5 rounded-lg p-4 md:p-6 space-y-4">
            {/* Table Header */}
            <SkeletonText className="h-6 w-32" />
            
            {/* Table Rows */}
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex gap-4 items-center">
                  <SkeletonText className="h-12 flex-1" />
                  <SkeletonText className="h-12 w-24 hidden md:block" />
                  <SkeletonText className="h-12 w-24 hidden md:block" />
                  <SkeletonText className="h-12 w-20" />
                  <SkeletonText className="h-12 w-24 hidden md:block" />
                  <SkeletonText className="h-12 w-32" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

