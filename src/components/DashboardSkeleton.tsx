export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-24 text-[#0a1128] antialiased dark:bg-[#070b14] dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-8">
        
        {/* 1. Header Greeting & Action Bar Skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-4 w-72 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-11 w-32 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-11 w-36 rounded-2xl bg-slate-300 dark:bg-slate-700 animate-pulse" />
          </div>
        </div>

        {/* 2. Top KPI Stat Cards Skeleton (3 Cards) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0c1222] space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              </div>
              <div className="h-8 w-20 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="h-3 w-36 rounded-lg bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
            </div>
          ))}
        </div>

        {/* 3. Filter Tabs & Search Bar Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-800/80">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-9 w-24 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse"
              />
            ))}
          </div>
          <div className="h-9 w-64 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>

        {/* 4. Grid of Property Cards Skeleton (6 Cards) */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0c1222] space-y-4"
            >
              {/* Image Box */}
              <div className="relative aspect-[16/10] w-full bg-slate-200 dark:bg-slate-800 animate-pulse">
                <div className="absolute top-3 left-3 h-5 w-20 rounded-full bg-slate-300/80 dark:bg-slate-700/80" />
                <div className="absolute bottom-3 right-3 h-5 w-16 rounded-full bg-slate-300/80 dark:bg-slate-700/80" />
              </div>

              {/* Card Content */}
              <div className="p-5 pt-0 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div className="h-6 w-24 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  <div className="h-4 w-16 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
                </div>
                <div className="h-5 w-3/4 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-4 w-1/2 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />

                {/* Card Actions Bottom */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="h-9 flex-1 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  <div className="h-9 w-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  <div className="h-9 w-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

