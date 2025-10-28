import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn("bg-white/5 rounded-lg animate-pulse", className)} />
  );
}

interface SkeletonTextProps {
  className?: string;
}

export function SkeletonText({ className }: SkeletonTextProps) {
  return (
    <div className={cn("bg-white/5 rounded animate-pulse", className)} />
  );
}

interface SkeletonTableRowProps {
  columns?: number;
}

export function SkeletonTableRow({ columns = 4 }: SkeletonTableRowProps) {
  return (
    <div className="flex gap-4 p-4 bg-white/5 rounded animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <div 
          key={i} 
          className={`h-4 bg-white/10 rounded ${i === 0 ? 'flex-1' : 'w-24'}`} 
        />
      ))}
    </div>
  );
}

