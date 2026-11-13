"use client";

import Link from "next/link";
import {
  MessageCircle,
  ArrowRight,
  Sparkles,
  Smartphone,
  Globe2,
  FileText,
  Share2,
  Building2,
  Check,
  Zap,
  Sliders,
  Eye
} from "lucide-react";
import HeroInteractiveDemo from "@/components/HeroInteractiveDemo";

export default function HomePage() {
  const waBotNumber = "+1 (555) 175-6346";
  const waBotLink = "https://wa.me/15551756346?text=Create%20listing";

  return (
    <div className="flex-1 bg-[#f8f9fa] text-[#0a1128] transition-colors selection:bg-[#c5a059]/20 selection:text-[#0a1128] dark:bg-[#070b14] dark:text-slate-100 dark:selection:bg-[#c5a059]/30">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-14 pb-16 sm:pt-20 sm:pb-24">
        {/* Subtle Ambient Navy/Gold Glow */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#c5a059]/15 via-slate-100/20 to-transparent dark:from-[#c5a059]/10 dark:via-transparent" />

        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c5a059]/40 bg-[#fbf6ec] px-4 py-1.5 text-xs font-semibold text-[#8a6828] shadow-sm backdrop-blur-md dark:border-[#c5a059]/30 dark:bg-[#17130a] dark:text-[#d4af37]">
            <span className="flex h-2 w-2 rounded-full bg-[#c5a059] animate-pulse" />
            <span>For Real Estate Brokers & Property Agents</span>
          </div>

          {/* Master Headline - Simple, Punchy, English */}
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-[#0a1128] sm:text-5xl lg:text-6xl sm:leading-[1.18] dark:text-white">
            Send a property on WhatsApp. <br />
            <span className="bg-gradient-to-r from-[#0a1128] via-[#1a2850] to-[#c5a059] bg-clip-text text-transparent dark:from-white dark:via-[#e2e8f0] dark:to-[#d4af37]">
              Get a listing page in 60 seconds.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
            Stop sending 20 scattered photos in WhatsApp chats. PropFolio turns your photos and text into a clean website link and PDF brochure that buyers take seriously.
          </p>

          {/* High-Intent CTAs */}
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={waBotLink}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-emerald-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700 active:scale-95 sm:w-auto"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Create Free Listing on WhatsApp</span>
            </a>

            <Link
              href="/ramesh/4-bhk-villa-malviya-nagar-jaipur-terrace-garden"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-[#0a1128] shadow-sm transition hover:border-[#c5a059] hover:bg-slate-50 active:scale-95 sm:w-auto dark:border-slate-800 dark:bg-[#0f182e] dark:text-slate-200 dark:hover:border-[#c5a059]"
            >
              <Eye className="h-4 w-4 text-[#c5a059]" />
              <span>View Sample Listing</span>
            </Link>
          </div>

          <div className="mt-4 flex items-center justify-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-500" /> No app to download
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-500" /> First listing is 100% free
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-500" /> Opens on any phone
            </span>
          </div>

          {/* Interactive Hero Showcase */}
          <HeroInteractiveDemo />
        </div>
      </section>

      {/* 2. THE THREE EASY STEPS */}
      <section className="border-t border-slate-200/80 bg-white py-16 transition-colors sm:py-24 dark:border-slate-800/80 dark:bg-[#070b14]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#c5a059] dark:text-[#d4af37]">
              How It Works
            </span>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#0a1128] sm:text-3xl dark:text-white">
              From a WhatsApp message to a listing page in 3 easy steps
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-400">
              No complicated software to learn. You work from WhatsApp the way you already do.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Step 1 */}
            <div className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-[#f8f9fc] p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-[#0c1222]/50">
              <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#090e1c]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
                    WhatsApp
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Step 1
                  </span>
                </div>

                <div className="mt-3.5 space-y-2">
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-3 text-left text-xs leading-relaxed text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-200">
                    <div className="mb-1.5 flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                      <span>📸 6 Photos Attached</span>
                    </div>
                    3 BHK Flat, Satellite Ahmedabad. 1,750 sqft, fully furnished, 2 car parking, lift, gym. 1.35 Cr final.
                    <div className="mt-1.5 text-right text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                      7:04 PM ✓✓
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <span className="text-xs font-bold text-[#c5a059] dark:text-[#d4af37]">STEP 1</span>
                <h3 className="mt-1 text-base font-bold text-[#0a1128] dark:text-white">
                  Send it on WhatsApp
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Send photos and 2 lines of details, the way you normally text your clients.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-[#f8f9fc] p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-[#0c1222]/50">
              <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#090e1c]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#c5a059]" />
                    PropFolio AI
                  </span>
                  <span className="rounded-full bg-[#fbf6ec] border border-[#e8d7b3] px-2 py-0.5 text-[10px] font-bold text-[#8a6828] dark:bg-[#1a1710] dark:border-[#3d331d] dark:text-[#d4af37]">
                    Step 2
                  </span>
                </div>

                <div className="mt-3.5 space-y-2 text-left">
                  <div className="mt-1 flex items-center justify-between rounded-xl bg-slate-50 p-2.5 dark:bg-[#0f182e] border border-slate-200/60 dark:border-slate-800">
                    <span className="text-xs font-bold text-[#0a1128] dark:text-white">3 BHK Satellite Flat</span>
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">₹1.35 Cr</span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">1,750 sqft</span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">Furnished</span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">Parking</span>
                  </div>
                  <p className="text-[11px] text-emerald-600 font-semibold pt-1">
                    ✓ Full Photo Gallery + Loan EMI Ready
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <span className="text-xs font-bold text-[#c5a059] dark:text-[#d4af37]">STEP 2</span>
                <h3 className="mt-1 text-base font-bold text-[#0a1128] dark:text-white">
                  PropFolio builds the page
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Title, price, photos gallery, carpet area, highlights, and loan EMI are laid out automatically in 60 seconds.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-[#f8f9fc] p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-[#0c1222]/50">
              <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#090e1c]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Share2 className="h-3.5 w-3.5 text-[#0a1128] dark:text-slate-300" />
                    Shareable Link
                  </span>
                  <span className="rounded-full bg-[#0a1128] px-2 py-0.5 text-[10px] font-bold text-white dark:bg-white dark:text-[#0a1128]">
                    Step 3
                  </span>
                </div>

                <div className="mt-3.5 space-y-2 text-left">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-[11px] font-mono text-slate-600 dark:border-slate-800 dark:bg-[#0f182e] dark:text-slate-400 truncate">
                    propfolio.in/ramesh/3-bhk-satellite
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      <Check className="h-3 w-3" /> Opens on any phone
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#fbf6ec] border border-[#e8d7b3] px-2.5 py-1 text-[10px] font-semibold text-[#8a6828] dark:bg-[#1a1710] dark:border-[#3d331d] dark:text-[#d4af37]">
                      <FileText className="h-3 w-3" /> PDF Brochure
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <span className="text-xs font-bold text-[#c5a059] dark:text-[#d4af37]">STEP 3</span>
                <h3 className="mt-1 text-base font-bold text-[#0a1128] dark:text-white">
                  Share one clean link
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Send one link to your buyer or broadcast group. Buyers view HD photos and tap to call or WhatsApp you directly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. EVERYTHING A BROKER NEEDS */}
      <section className="border-t border-slate-200/80 bg-[#f8f9fa] py-16 transition-colors sm:py-24 dark:border-slate-800/80 dark:bg-[#05080f]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-left md:text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#c5a059] dark:text-[#d4af37]">
              Broker Features
            </span>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#0a1128] sm:text-3xl dark:text-white">
              Everything you need to close deals faster
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-400">
              Simple tools that build trust, make your properties look professional, and bring you direct leads.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1: Your Own Website */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-[#c5a059]/50 dark:border-slate-800 dark:bg-[#0c1222]/80">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0a1128] text-[#c5a059] border border-[#c5a059]/30 dark:bg-[#0f182e] dark:text-[#d4af37]">
                <Globe2 className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#0a1128] dark:text-white">
                Your Own Website
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                All your listings under one personalized link with your name, photo, and phone number. Looks like your own private agency site.
              </p>
              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-[11px] font-mono text-slate-600 dark:border-slate-800 dark:bg-[#090e1c] dark:text-slate-400">
                yourname.propfolio.in
              </div>
            </div>

            {/* Feature 2: Fullscreen Gallery */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-[#c5a059]/50 dark:border-slate-800 dark:bg-[#0c1222]/80">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0a1128] text-[#c5a059] border border-[#c5a059]/30 dark:bg-[#0f182e] dark:text-[#d4af37]">
                <Smartphone className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#0a1128] dark:text-white">
                Full-Screen Photo Gallery
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Every photo opens in full HD. Buyers can swipe through photos smoothly like a mobile app without downloading dozens of files.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-[#8a6828] dark:text-[#d4af37]">
                <Check className="h-3.5 w-3.5 text-emerald-500" /> Full HD Touch Gallery
              </div>
            </div>

            {/* Feature 3: Printable PDF Brochure */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-[#c5a059]/50 dark:border-slate-800 dark:bg-[#0c1222]/80">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0a1128] text-[#c5a059] border border-[#c5a059]/30 dark:bg-[#0f182e] dark:text-[#d4af37]">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#0a1128] dark:text-white">
                1-Tap PDF Brochure
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Whenever a client asks for a brochure, generate a clean printable A4 PDF in one second, complete with a QR code and your contact info.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-[#8a6828] dark:text-[#d4af37]">
                <Check className="h-3.5 w-3.5 text-emerald-500" /> Print & WhatsApp Ready
              </div>
            </div>

            {/* Feature 4: Write the Way You Talk */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-[#c5a059]/50 dark:border-slate-800 dark:bg-[#0c1222]/80">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0a1128] text-[#c5a059] border border-[#c5a059]/30 dark:bg-[#0f182e] dark:text-[#d4af37]">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#0a1128] dark:text-white">
                Write the Way You Talk
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Write naturally in Hinglish, Hindi, or English: "3 BHK ready to move, 1.35 Cr final, Satellite". Our AI parses the details automatically.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-[#8a6828] dark:text-[#d4af37]">
                <Check className="h-3.5 w-3.5 text-emerald-500" /> Smart Multi-lingual AI
              </div>
            </div>

            {/* Feature 5: Home Loan & EMI Calculator */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-[#c5a059]/50 dark:border-slate-800 dark:bg-[#0c1222]/80">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0a1128] text-[#c5a059] border border-[#c5a059]/30 dark:bg-[#0f182e] dark:text-[#d4af37]">
                <Sliders className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#0a1128] dark:text-white">
                Home Loan & EMI Calculator
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Buyers can check their estimated monthly loan EMI directly on the listing page so they can make purchase decisions faster.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-[#8a6828] dark:text-[#d4af37]">
                <Check className="h-3.5 w-3.5 text-emerald-500" /> Live EMI Calculator
              </div>
            </div>

            {/* Feature 6: Direct WhatsApp Inquiries */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-[#c5a059]/50 dark:border-slate-800 dark:bg-[#0c1222]/80">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                <MessageCircle className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#0a1128] dark:text-white">
                Buyers Reach You Directly
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                No portals stealing your leads. Buyers tap one button to send you a pre-filled WhatsApp message or call you directly.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <Check className="h-3.5 w-3.5" /> 100% Direct Leads to Broker
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. REAL PROPERTY SAMPLES */}
      <section className="border-t border-slate-200/80 bg-white py-16 transition-colors sm:py-24 dark:border-slate-800/80 dark:bg-[#070b14]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#c5a059] dark:text-[#d4af37]">
                Sample Listings
              </span>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#0a1128] sm:text-3xl dark:text-white">
                Live property pages created with PropFolio
              </h2>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0a1128] hover:text-[#c5a059] dark:text-slate-200 dark:hover:text-[#d4af37]"
            >
              <span>Open Broker Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#c5a059]" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Property 1 */}
            <Link
              href="/ramesh/4-bhk-villa-malviya-nagar-jaipur-terrace-garden"
              className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-lg hover:border-[#c5a059]/50 dark:border-slate-800 dark:bg-[#0c1222]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-[#090e1c]">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80"
                  alt="4 BHK Luxury Villa"
                  className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 rounded-full bg-[#0a1128]/80 border border-[#c5a059]/40 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
                  VILLA · FOR SALE
                </div>
                <div className="absolute bottom-3 right-3 rounded-full bg-[#0a1128]/80 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-md">
                  6 Photos
                </div>
              </div>
              <div className="p-5 text-left">
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    ₹3.80 Cr
                  </span>
                  <span className="text-xs text-slate-500">4,200 sq.ft</span>
                </div>
                <h4 className="mt-1.5 text-sm font-bold text-[#0a1128] transition group-hover:text-[#c5a059] dark:text-white dark:group-hover:text-[#d4af37]">
                  4 BHK Luxury Villa with Sky Terrace
                </h4>
                <p className="mt-1 text-xs text-slate-500">
                  Malviya Nagar, Jaipur
                </p>
              </div>
            </Link>

            {/* Property 2 */}
            <Link
              href="/ramesh/3-bhk-satellite-ahmedabad"
              className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-lg hover:border-[#c5a059]/50 dark:border-slate-800 dark:bg-[#0c1222]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-[#090e1c]">
                <img
                  src="https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1000&auto=format&fit=crop&q=80"
                  alt="3 BHK Furnished Flat"
                  className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 rounded-full bg-[#0a1128]/80 border border-[#c5a059]/40 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
                  APARTMENT · FOR SALE
                </div>
                <div className="absolute bottom-3 right-3 rounded-full bg-[#0a1128]/80 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-md">
                  4 Photos
                </div>
              </div>
              <div className="p-5 text-left">
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    ₹1.35 Cr
                  </span>
                  <span className="text-xs text-slate-500">1,750 sq.ft</span>
                </div>
                <h4 className="mt-1.5 text-sm font-bold text-[#0a1128] transition group-hover:text-[#c5a059] dark:text-white dark:group-hover:text-[#d4af37]">
                  Luxurious 3 BHK Furnished Flat
                </h4>
                <p className="mt-1 text-xs text-slate-500">
                  Satellite, Near ISRO, Ahmedabad
                </p>
              </div>
            </Link>

            {/* Property 3 */}
            <Link
              href="/ramesh/200-sq-yd-corner-plot-noida-sector-150"
              className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-lg hover:border-[#c5a059]/50 dark:border-slate-800 dark:bg-[#0c1222]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-[#090e1c]">
                <img
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&auto=format&fit=crop&q=80"
                  alt="Corner Plot"
                  className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 rounded-full bg-[#0a1128]/80 border border-[#c5a059]/40 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
                  PLOT · FOR SALE
                </div>
                <div className="absolute bottom-3 right-3 rounded-full bg-[#0a1128]/80 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-md">
                  2 Photos
                </div>
              </div>
              <div className="p-5 text-left">
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    ₹2.10 Cr
                  </span>
                  <span className="text-xs text-slate-500">200 sq.yd</span>
                </div>
                <h4 className="mt-1.5 text-sm font-bold text-[#0a1128] transition group-hover:text-[#c5a059] dark:text-white dark:group-hover:text-[#d4af37]">
                  Prime Corner Residential Plot
                </h4>
                <p className="mt-1 text-xs text-slate-500">
                  Sector 150, Noida Expressway
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION BANNER */}
      <section className="relative overflow-hidden border-t border-slate-800 bg-[#0a1128] py-16 text-white sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 px-3.5 py-1 text-xs font-semibold text-[#d4af37]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ready in 60 Seconds</span>
          </div>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
            Your next deal starts with a link.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm text-slate-300 sm:text-base">
            No credit card, no software to learn. Send a property on WhatsApp right now — your first listing is completely free.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <a
              href={waBotLink}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-emerald-600/30 transition hover:bg-emerald-700 active:scale-95 sm:w-auto"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Send Property on WhatsApp</span>
            </a>

            <Link
              href="/dashboard"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/80 px-8 py-4 text-sm font-semibold text-slate-200 shadow-sm transition hover:bg-slate-800 hover:text-white active:scale-95 sm:w-auto"
            >
              <span>Open Broker Dashboard</span>
              <ArrowRight className="h-4 w-4 text-[#c5a059]" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. SYSTEM FOOTER */}
      <footer className="border-t border-slate-200/80 bg-white py-14 transition-colors dark:border-slate-900 dark:bg-[#05080f]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
            
            {/* Brand Summary */}
            <div className="space-y-4 md:col-span-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0a1128] text-[#c5a059] border border-[#c5a059]/30 shadow-md">
                  <Building2 className="h-4 w-4" />
                </div>
                <span className="text-base font-bold text-[#0a1128] dark:text-white">
                  Prop<span className="text-[#c5a059]">Folio</span>
                </span>
              </div>
              <p className="max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                The fastest way for Indian real estate brokers to turn messy WhatsApp chats and property photos into high-converting, branded listing pages and PDF brochures.
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Meta WhatsApp API Connected
                </span>
              </div>
            </div>

            {/* Product Links */}
            <div className="space-y-3 md:col-span-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0a1128] dark:text-white">
                Product
              </h4>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <li>
                  <Link href="/pricing" className="hover:text-[#0a1128] dark:hover:text-white transition">
                    Pricing & Plans
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-[#0a1128] dark:hover:text-white transition">
                    Broker Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/listings/new" className="hover:text-[#0a1128] dark:hover:text-white transition">
                    Create Listing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support & Contact */}
            <div className="space-y-3 md:col-span-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0a1128] dark:text-white">
                Support
              </h4>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <li>
                  <Link href="/contact" className="hover:text-[#0a1128] dark:hover:text-white transition">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <a
                    href="https://wa.me/919876543210?text=Hi%20PropFolio%20Support%2C%20I%20need%20help."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#0a1128] dark:hover:text-white transition flex items-center gap-1"
                  >
                    <span>WhatsApp Help</span>
                  </a>
                </li>
                <li>
                  <a href="mailto:support@propfolio.in" className="hover:text-[#0a1128] dark:hover:text-white transition">
                    support@propfolio.in
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal & Compliance */}
            <div className="space-y-3 md:col-span-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0a1128] dark:text-white">
                Legal & Compliance
              </h4>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <li>
                  <Link href="/privacy" className="hover:text-[#0a1128] dark:hover:text-white transition">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-[#0a1128] dark:hover:text-white transition">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/refund" className="hover:text-[#0a1128] dark:hover:text-white transition">
                    Refund & Cancellation
                  </Link>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 text-xs text-slate-400 sm:flex-row dark:border-slate-800/80 dark:text-slate-600">
            <p>© {new Date().getFullYear()} PropFolio Technologies. All rights reserved.</p>
            <p className="text-center sm:text-right">
              Built for real estate brokers & property consultants in India.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
