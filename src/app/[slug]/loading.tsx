export default function BrokerProfileLoading() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-24 text-[#0a1128] antialiased dark:bg-[#070b14] dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-8 space-y-8">
        
        {/* Broker Header Skeleton */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {/* Avatar circle */}
            <div className="h-24 w-24 shrink-0 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
            
            <div className="space-y-3 flex-1">
              <div className="h-7 w-48 mx-auto sm:mx-0 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="h-4 w-64 mx-auto sm:mx-0 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                <div className="h-7 w-28 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
                <div className="h-7 w-24 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
              </div>
            </div>

            <div className="h-11 w-40 rounded-2xl bg-slate-300 dark:bg-slate-700 animate-pulse" />
          </div>
        </div>

        {/* Portfolio Tabs Skeleton */}
        <div className="flex gap-3 border-b border-slate-200/80 pb-4 dark:border-slate-800/80">
          <div className="h-10 w-32 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-10 w-28 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>

        {/* Listings Grid Skeleton */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0c1222] space-y-4"
            >
              <div className="aspect-[16/10] w-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="p-5 pt-0 space-y-3">
                <div className="h-6 w-24 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-5 w-3/4 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-4 w-1/2 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

