"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, MessageCircle, ShieldCheck, MapPin } from "lucide-react";

export default function HeroInteractiveDemo() {
  const [activeTab, setActiveTab] = useState<"after" | "before">("after");

  return (
    <div className="mx-auto mt-12 max-w-4xl">
      {/* Interactive Switcher Pill */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-2xl border border-slate-200 bg-white/90 p-1.5 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-[#0f182e]/90">
          <button
            onClick={() => setActiveTab("after")}
            type="button"
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === "after"
                ? "bg-[#0a1128] text-white shadow-md shadow-[#0a1128]/25 border border-[#c5a059]/40 dark:bg-[#16234b]"
                : "text-slate-600 hover:text-[#0a1128] dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-[#c5a059] dark:text-[#d4af37]" />
            <span>PropFolio Page (Clean & Professional)</span>
          </button>

          <button
            onClick={() => setActiveTab("before")}
            type="button"
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
              activeTab === "before"
                ? "bg-slate-900 text-white shadow-md dark:bg-slate-800"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <span>Raw WhatsApp Forward</span>
          </button>
        </div>
      </div>

      {/* Visual Showcase Box */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-2 sm:p-4 shadow-xl transition-all dark:border-slate-800 dark:bg-[#0c1222]">
        {activeTab === "after" ? (
          <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-[#f8f9fc] p-4 sm:p-6 dark:border-slate-800 dark:bg-[#090e1c]">
            {/* Top Micro-Bar */}
            <div className="flex items-center justify-between border-b border-slate-200/70 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80"
                  alt="Ramesh Shah"
                  className="h-9 w-9 rounded-full object-cover border border-[#c5a059]/40"
                />
                <div>
                  <p className="text-xs font-bold text-[#0a1128] dark:text-white flex items-center gap-1">
                    Ramesh Shah <ShieldCheck className="h-3.5 w-3.5 text-[#c5a059]" />
                  </p>
                  <p className="text-[10px] text-slate-500">Shah Realty · Ahmedabad</p>
                </div>
              </div>
              <span className="rounded-full bg-[#fbf6ec] border border-[#e8d7b3] px-2.5 py-0.5 text-[10px] font-bold text-[#8a6828] dark:bg-[#1a1710] dark:border-[#3d331d] dark:text-[#d4af37]">
                Live Listing Page
              </span>
            </div>

            {/* Micro Hero & Specs */}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-12 sm:items-center">
              <div className="sm:col-span-6 relative aspect-[16/10] overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900 shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80"
                  alt="Property"
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-2 left-2 rounded-md bg-[#0a1128]/75 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-md">
                  1 / 6 Photos
                </div>
              </div>

              <div className="sm:col-span-6 space-y-2 text-left">
                <span className="text-[10px] font-bold text-[#c5a059] dark:text-[#d4af37] uppercase tracking-wider">
                  FOR SALE · LUXURY VILLA
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-[#0a1128] dark:text-white leading-snug">
                  4 BHK Luxury Villa with Terrace Garden
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-[#c5a059]" /> Malviya Nagar, Jaipur
                </p>

                <div className="pt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    ₹3.80 Cr
                  </span>
                  <span className="text-xs text-slate-400">· 4,200 sq.ft carpet</span>
                </div>

                <div className="pt-3 flex items-center gap-2">
                  <Link
                    href="/ramesh/4-bhk-villa-malviya-nagar-jaipur-terrace-garden"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#0a1128] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#16234b] border border-[#c5a059]/30 dark:bg-white dark:text-[#0a1128]"
                  >
                    <span>Open Live Page</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#c5a059]" />
                  </Link>

                  <a
                    href="https://wa.me/919876543210"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-left font-mono text-xs text-emerald-400 dark:bg-black">
            <div className="flex items-center gap-2 text-slate-400 pb-3 border-b border-slate-800 text-[11px]">
              <span className="h-2 w-2 rounded-full bg-rose-500"></span>
              <span>Raw WhatsApp chat forward (Clients ignore or start price bargaining)</span>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-emerald-950/60 border border-emerald-800/40 p-3 max-w-md text-emerald-200 font-sans leading-relaxed">
                4 BHK luxury villa for sale in Malviya Nagar Jaipur. 4200 sqft, private terrace garden, lift, modular kitchen, car parking. 3.80 Cr final. 6 photos attached...
              </div>
              <div className="flex gap-2">
                <div className="h-16 w-16 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] text-slate-500 border border-slate-700">Photo 1</div>
                <div className="h-16 w-16 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] text-slate-500 border border-slate-700">Photo 2</div>
                <div className="h-16 w-16 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] text-slate-500 border border-slate-700">+4 more</div>
              </div>
              <p className="text-[11px] text-slate-500 italic pt-2">
                ⚠️ Buyer's photo gallery gets cluttered, unorganized text looks unprofessional.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
