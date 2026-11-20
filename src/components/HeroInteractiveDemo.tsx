"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowDown, Sparkles, MessageCircle, ExternalLink, CheckCircle2 } from "lucide-react";

export default function HeroInteractiveDemo() {
  return (
    <div className="mx-auto w-full">
      {/* Visual Showcase Box */}
      <div className="overflow-hidden p-4 sm:p-8">

        {/* Comparison Flow Grid */}
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-11 lg:gap-8">

          {/* LEFT: FROM THIS (Raw WhatsApp Forward) */}
          <div className="flex flex-col items-center text-center md:col-span-5">
            {/* Header / Label */}
            <div className="mb-4 space-y-1.5">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                <span>Raw WhatsApp Forward</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
                From This
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Unorganized text and loose photos that get lost in client chats.
              </p>
            </div>

            {/* Mobile Mockup Phone */}
            <div className="relative w-full max-w-[270px] sm:max-w-[300px] transition-transform duration-300 hover:scale-[1.02]">
              <div className="relative flex justify-center drop-shadow-[0_20px_25px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_20px_25px_rgba(0,0,0,0.5)]">
                <Image
                  src="/showcase-from.webp"
                  alt="From This: Raw WhatsApp Chat Forward"
                  width={490}
                  height={1002}
                  priority
                  className="h-auto w-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* MIDDLE: TRANSITION ARROW (Desktop & Mobile) */}
          <div className="flex items-center justify-center md:col-span-1 py-1 md:py-0">
            {/* Desktop Center Connector */}
            <div className="hidden md:flex flex-col items-center justify-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center">
                <ArrowRight className="h-10 w-10 text-[#00974e]" />
              </div>
              <span className="text-[10px] font-black  tracking-wider text-[#862e9f] dark:text-[#a845c4] text-center leading-tight">
                CONVERTED<br />IN 60s.
              </span>
            </div>

            {/* Mobile Divider with Down Arrow */}
            <div className="flex w-full md:hidden items-center justify-center gap-3 my-1">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent" />
              <div className="inline-flex items-center gap-2 rounded-full bg-[#00974e] px-4 py-1.5 text-xs font-bold text-white shadow-md">
                <span>Converted in 60s</span>
                <ArrowDown className="h-3.5 w-3.5" />
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent" />
            </div>
          </div>

          {/* RIGHT: TO THIS (Clean Property Snaps Page) */}
          <div className="flex flex-col items-center text-center md:col-span-5">
            {/* Header / Label */}
            <div className="mb-4 space-y-1.5">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#00974e]/30 bg-[#00974e]/10 px-3 py-1 text-xs font-bold text-[#00974e] dark:border-[#00974e]/30 dark:bg-[#00974e]/20 dark:text-[#00b85f]">
                <Sparkles className="h-3.5 w-3.5 text-[#862e9f] dark:text-[#a845c4]" />
                <span>Live PropertySnaps Page</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-[#00974e] dark:text-[#00b85f] mt-1">
                To This
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Clean, mobile-optimized listing that builds trust and closes deals faster.
              </p>
            </div>

            {/* Mobile Mockup Phone with Subtle Glow */}
            <div className="relative w-full max-w-[270px] sm:max-w-[300px] transition-transform duration-300 hover:scale-[1.02]">
              {/* Soft Ambient Brand Glow Behind the Phone */}
              <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-[#862e9f]/20 via-[#00974e]/15 to-[#862e9f]/20 blur-2xl opacity-80 pointer-events-none" />

              <div className="relative flex justify-center drop-shadow-[0_25px_30px_rgba(134,46,159,0.22)] dark:drop-shadow-[0_25px_30px_rgba(134,46,159,0.35)]">
                <Image
                  src="/showcase-to.webp"
                  alt="To This: Clean Property Snaps Listing Page"
                  width={490}
                  height={1002}
                  priority
                  className="h-auto w-full object-contain"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Bottom CTA / Verification Strip */}
        <div className="mt-8 border-t border-slate-200/80 pt-6 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              <CheckCircle2 className="h-4 w-4 text-[#00974e] shrink-0" />
              <span>Works directly inside WhatsApp. No app installation required.</span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:border-[#862e9f] hover:text-[#862e9f] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-[#862e9f]"
              >
                <span>Get Started Free</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>

              <a
                href="https://wa.me/919876543210?text=Hi%20Property%20Snaps%20Team%2C%20I%20want%20to%20try%20the%20free%20listing%20creator."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#00974e] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#00974e]/20 transition hover:bg-[#008042] active:scale-95"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>Try on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
