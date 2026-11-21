export default function ListingSkeleton() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-32 sm:pb-36 text-[#0a1128] antialiased dark:bg-[#070b14] dark:text-slate-100">
      {/* Top Navbar Placeholder */}
      <div className="border-b border-slate-200/80 bg-white/80 py-3.5 px-4 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#0c1222]/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-5 w-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <div className="h-4 w-32 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-8 w-28 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>

      {/* Main Grid Container */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 pt-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* LEFT COLUMN: Gallery & Details (8 Cols) */}
          <div className="space-y-6 lg:col-span-8">
            
            {/* 1. Hero Photo Gallery Skeleton */}
            <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
              {/* Big Cover Image */}
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse">
                <div className="absolute top-4 left-4 h-6 w-24 rounded-full bg-slate-300/80 dark:bg-slate-700/80" />
                <div className="absolute bottom-4 right-4 h-6 w-20 rounded-full bg-slate-300/80 dark:bg-slate-700/80" />
              </div>
              {/* Thumbnails Row */}
              <div className="mt-2 grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-[4/3] rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* 2. Title & Pricing Header Skeleton */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0c1222] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3">
                <div className="h-9 w-44 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-6 w-32 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-7 w-3/4 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-4 w-1/2 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
              </div>

              {/* Key Specs Pills */}
              <div className="flex flex-wrap gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-28 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* 3. AI Highlights Skeleton */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0c1222] space-y-4">
              <div className="h-6 w-40 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-5 w-5 shrink-0 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
                    <div className="h-4 w-full rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Description Skeleton */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0c1222] space-y-3">
              <div className="h-6 w-36 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="h-4 w-full rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="h-4 w-5/6 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="h-4 w-4/6 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
            </div>

            {/* 5. Amenities Grid Skeleton */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0c1222] space-y-4">
              <div className="h-6 w-32 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"
                  />
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Sticky Broker Card & Inquiry CTA (4 Cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-5">
              
              {/* Broker Profile Card */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0c1222] space-y-5">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 shrink-0 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-32 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
                    <div className="h-4 w-24 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  </div>
                </div>

                {/* Verified Broker Badge */}
                <div className="h-8 w-full rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />

                {/* Primary WhatsApp Action Button Skeleton */}
                <div className="h-14 w-full rounded-2xl bg-slate-300 dark:bg-slate-700 animate-pulse" />

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="h-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  <div className="h-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                </div>
              </div>

              {/* Safety / Verification Trust Box Skeleton */}
              <div className="rounded-2xl border border-slate-200/60 bg-white/60 p-4 shadow-sm dark:border-slate-800/60 dark:bg-[#0c1222]/60 space-y-2">
                <div className="h-4 w-3/4 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-3 w-5/6 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

