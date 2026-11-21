import Image from "next/image";

interface BrandedSpinnerProps {
  message?: string;
  subMessage?: string;
  fullScreen?: boolean;
}

export default function BrandedSpinner({
  message = "Loading...",
  subMessage = "Please wait a moment",
  fullScreen = true,
}: BrandedSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center justify-center text-center p-6 select-none">
      {/* Branded Glowing Ring with Logo */}
      <div className="relative flex items-center justify-center">
        {/* Soft Ambient Radial Glow */}
        <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-[#00974e]/20 via-[#862e9f]/20 to-[#00974e]/10 blur-xl animate-pulse" />

        {/* Dual-color spinning progress ring */}
        <div className="relative h-20 w-20 rounded-full border-2 border-slate-200 dark:border-slate-800">
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#00974e] border-r-[#862e9f] animate-spin" />
          
          {/* Centered Brand Mark / Mini Logo */}
          <div className="absolute inset-2 flex items-center justify-center rounded-full bg-white dark:bg-[#0c1222] shadow-sm">
            <Image
              src="/brand-logo.png"
              alt="Property Snaps"
              width={48}
              height={48}
              priority
              className="h-7 w-auto object-contain transition-transform duration-700 ease-in-out hover:scale-105"
            />
          </div>
        </div>
      </div>

      {/* Loading Typography */}
      <h3 className="mt-5 text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">
        {message}
      </h3>
      {subMessage && (
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 font-medium">
          {subMessage}
        </p>
      )}

      {/* Shimmer mini bar */}
      <div className="mt-4 h-1 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-[#00974e] to-[#862e9f] animate-pulse" />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f8f9fa]/90 backdrop-blur-md dark:bg-[#070b14]/90 transition-colors">
        {content}
      </div>
    );
  }

  return (
    <div className="flex min-h-[300px] w-full items-center justify-center py-12">
      {content}
    </div>
  );
}

