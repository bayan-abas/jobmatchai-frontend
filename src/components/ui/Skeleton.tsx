type SkeletonProps = {
  className?: string;
};

// Base shimmer block. Replaces plain "Loading..." text and bespoke animate-pulse divs scattered
// per-page with one consistent primitive - never renders fake/placeholder DATA, only shape.
export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse rounded-control bg-white/[0.07] ${className}`} />;
}

// A generic content card's loading placeholder (job card, application card, dashboard stat card).
export function CardSkeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`rounded-panel border border-white/10 bg-white/[0.03] p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <Skeleton className="h-14 w-14 shrink-0 rounded-2xl" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-3.5 w-1/3" />
        </div>
      </div>
      <div className="mt-5 space-y-2.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  );
}

// A repeated list of CardSkeletons, for job/application/notification list loading states.
export function ListSkeleton({ count = 3, className = "" }: { count?: number; className?: string }) {
  return (
    <div className={`space-y-4 ${className}`} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// A dashboard stat-card grid loading state.
export function StatSkeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`rounded-panel border border-white/10 bg-white/[0.03] p-6 ${className}`}>
      <div className="mb-6 flex items-start justify-between">
        <Skeleton className="h-12 w-12 rounded-2xl" />
      </div>
      <Skeleton className="mb-2 h-8 w-16" />
      <Skeleton className="h-3.5 w-24" />
    </div>
  );
}
