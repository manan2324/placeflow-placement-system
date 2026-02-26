/**
 * Reusable skeleton / shimmer components.
 * Use these in place of full-page spinners while API data loads –
 * they keep the page visually stable (better CLS) and give the browser
 * enough content to paint a meaningful LCP element early.
 */

/** Base rectangular shimmer block */
export function SkeletonBox({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded-lg ${className}`}
      aria-hidden="true"
    />
  );
}

/** A single stat card placeholder (matches Card layout) */
export function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          <SkeletonBox className="h-4 w-28" />
          <SkeletonBox className="h-8 w-16" />
        </div>
        <SkeletonBox className="h-10 w-10 rounded-lg shrink-0 ml-2" />
      </div>
    </div>
  );
}

/** Row placeholder for list / table items */
export function SkeletonRow({ cols = 3 }) {
  return (
    <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg">
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonBox
          key={i}
          className={`h-4 rounded ${i === 0 ? "flex-1" : "w-20"}`}
        />
      ))}
    </div>
  );
}

/** Full student-dashboard skeleton */
export function StudentDashboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <SkeletonBox className="h-7 w-56" />
        <SkeletonBox className="h-4 w-40" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Recent applications card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm space-y-4">
        <SkeletonBox className="h-6 w-44" />
        <SkeletonBox className="h-4 w-64" />
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonRow key={i} cols={3} />
        ))}
      </div>
    </div>
  );
}

/** Full admin-dashboard skeleton */
export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Charts / tables row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm space-y-3">
          <SkeletonBox className="h-6 w-40" />
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} cols={4} />
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm space-y-3">
          <SkeletonBox className="h-6 w-40" />
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} cols={3} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Generic page-level loading skeleton (table pages) */
export function TablePageSkeleton({ rows = 8 }) {
  return (
    <div className="space-y-4">
      {/* Title + filter bar */}
      <div className="flex items-center justify-between">
        <SkeletonBox className="h-8 w-40" />
        <SkeletonBox className="h-9 w-24 rounded-lg" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <SkeletonRow cols={5} />
        <hr className="border-gray-100" />
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonRow key={i} cols={5} />
        ))}
      </div>
    </div>
  );
}
