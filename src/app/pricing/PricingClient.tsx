"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Sparkles,
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  Building2,
  FileText,
  Zap,
  HelpCircle,
  CreditCard,
  CheckCircle2,
} from "lucide-react";

export default function PricingClient() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  const plans = [
    {
      id: "free",
      name: "Starter Free",
      badge: "Best for trying out",
      description: "Experience the magic of turning a WhatsApp message into a listing web page.",
      monthlyPrice: 0,
      yearlyPrice: 0,
      period: "forever",
      ctaText: "Start Free on WhatsApp",
      ctaHref: "https://wa.me/919876543210?text=Hi%20PropFolio%20Team%2C%20I%20want%20to%20try%20the%20free%20listing%20creator.",
      highlight: false,
      features: [
        "1 Active Property Listing",
        "Instant WhatsApp Bot generator",
        "Mobile-first responsive web page",
        "HD Photo gallery (up to 10 photos)",
        "Direct WhatsApp inquiry button for buyers",
        "Google Maps location integration",
        "Standard propfolio.in link",
      ],
      notIncluded: [
        "Branded PDF brochure generator",
        "Custom broker profile subdomain",
        "Remove PropFolio watermark",
        "Multi-agent team accounts",
      ],
    },
    {
      id: "pro",
      name: "Solo Broker Pro",
      badge: "Most Popular for Brokers",
      description: "Designed for active property consultants who want to close deals faster and look 10x more professional.",
      monthlyPrice: 499,
      yearlyPrice: 3999, // ~333/mo
      period: billingCycle === "yearly" ? "/year" : "/month",
      ctaText: "Get Solo Pro",
      ctaHref: "/dashboard",
      highlight: true,
      features: [
        "25 Active Property Listings",
        "Custom broker subdomain (propfolio.in/yourname)",
        "1-Click Branded PDF Brochure Generator",
        "Remove PropFolio watermark",
        "Instant WhatsApp lead notification alerts",
        "Full Web Dashboard for easy edits",
        "Buyer view counter & engagement stats",
        "Priority AI WhatsApp Bot processing",
        "Full Dark / Light mode presentation",
      ],
      notIncluded: [
        "Multi-agent team accounts",
        "Custom agency domain (.com / .in)",
      ],
    },
    {
      id: "agency",
      name: "Agency & Builder",
      badge: "For Real Estate Firms",
      description: "For agencies and developer sales teams managing high listing volumes with multiple agents.",
      monthlyPrice: 1499,
      yearlyPrice: 11999, // ~999/mo
      period: billingCycle === "yearly" ? "/year" : "/month",
      ctaText: "Upgrade to Agency",
      ctaHref: "/contact",
      highlight: false,
      features: [
        "Unlimited Property Listings",
        "Up to 5 Broker WhatsApp phone numbers",
        "Custom Domain Support (properties.yourfirm.com)",
        "Video walkthrough embed (YouTube / Drive)",
        "Confidential broker notes & co-broking rules",
        "GST Invoices for business tax deductions",
        "Dedicated Account Manager on WhatsApp",
        "White-label client sharing options",
        "Bulk listing import assistance",
      ],
      notIncluded: [],
    },
  ];

  const comparisonRows = [
    { name: "Active Property Listings", free: "1 Listing", pro: "25 Listings", agency: "Unlimited" },
    { name: "WhatsApp AI Bot Generation", free: "Standard", pro: "Priority (~30s)", agency: "Instant Priority" },
    { name: "Custom Broker Subdomain", free: "—", pro: "✓ (propfolio.in/you)", agency: "✓ (Custom Domain)" },
    { name: "Downloadable PDF Brochures", free: "—", pro: "✓ 1-Click Printable", agency: "✓ Custom Agency PDF" },
    { name: "Remove PropFolio Watermark", free: "—", pro: "✓ Included", agency: "✓ Fully White-labeled" },
    { name: "Team WhatsApp Numbers", free: "1 Number", pro: "1 Number", agency: "Up to 5 Agents" },
    { name: "Lead Inquiry Alerts", free: "Direct WhatsApp", pro: "Direct WhatsApp + Counter", agency: "Centralized Lead CRM" },
    { name: "GST Business Tax Invoice", free: "—", pro: "✓ 18% Input Credit", agency: "✓ 18% Input Credit" },
    { name: "Support Channel", free: "Community WhatsApp", pro: "Priority WhatsApp Support", agency: "Dedicated Account Manager" },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#0a1128] transition-colors dark:bg-[#070b14] dark:text-slate-100">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-white via-[#fbf6ec]/30 to-[#f8f9fa] py-16 sm:py-24 dark:border-slate-800/80 dark:from-[#0b1020] dark:via-[#090d18] dark:to-[#070b14]">
        <div className="absolute inset-0 bg-[radial-gradient(#c5a059_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c5a059]/40 bg-[#fbf6ec] px-4 py-1.5 text-xs font-semibold text-[#8a6828] dark:border-[#c5a059]/30 dark:bg-[#17130a] dark:text-[#d4af37]">
            <Sparkles className="h-3.5 w-3.5 text-[#c5a059]" />
            <span>Simple, honest pricing. No hidden fees.</span>
          </div>

          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-[#0a1128] sm:text-5xl dark:text-white">
            Invest in Your Deals, <span className="text-[#c5a059]">Not in Overhead</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 dark:text-slate-400">
            Start completely free. Upgrade when your agency is closing more transactions and needs custom branding, PDF brochures, and multi-agent access.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="mt-8 inline-flex items-center rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-xl px-5 py-2 text-xs font-bold transition-all ${
                billingCycle === "monthly"
                  ? "bg-[#0a1128] text-white shadow dark:bg-[#c5a059] dark:text-[#0a1128]"
                  : "text-slate-600 hover:text-[#0a1128] dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold transition-all ${
                billingCycle === "yearly"
                  ? "bg-[#0a1128] text-white shadow dark:bg-[#c5a059] dark:text-[#0a1128]"
                  : "text-slate-600 hover:text-[#0a1128] dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <span>Annual Billing</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                Save 33%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan) => {
            const displayPrice =
              plan.id === "free"
                ? "₹0"
                : billingCycle === "yearly"
                ? `₹${plan.yearlyPrice.toLocaleString("en-IN")}`
                : `₹${plan.monthlyPrice.toLocaleString("en-IN")}`;

            const subtext =
              plan.id === "free"
                ? "Forever free to try"
                : billingCycle === "yearly"
                ? `Billed annually (equals ₹${Math.round(plan.yearlyPrice / 12)}/month)`
                : "Billed monthly, cancel anytime";

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-3xl p-8 transition-all ${
                  plan.highlight
                    ? "border-2 border-[#c5a059] bg-white shadow-2xl shadow-[#c5a059]/15 dark:border-[#c5a059] dark:bg-[#0c1222]"
                    : "border border-slate-200/80 bg-white shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-[#0c1222]/60"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full border border-[#c5a059] bg-[#0a1128] px-4 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#c5a059] shadow-md">
                    ★ {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[#0a1128] dark:text-white">
                      {plan.name}
                    </h3>
                    {!plan.highlight && (
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mt-6 flex items-baseline gap-1.5">
                    <span className="text-4xl font-extrabold tracking-tight text-[#0a1128] sm:text-5xl dark:text-white">
                      {displayPrice}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {plan.period}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                    {subtext}
                  </p>

                  {/* CTA Button */}
                  <div className="mt-6">
                    <Link
                      href={plan.ctaHref}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all active:scale-95 ${
                        plan.highlight
                          ? "bg-[#0a1128] text-white shadow-lg shadow-[#0a1128]/25 border border-[#c5a059] hover:bg-[#16234b] dark:bg-[#c5a059] dark:text-[#0a1128] dark:hover:bg-[#d4af37]"
                          : "border border-slate-200 bg-slate-50 text-[#0a1128] hover:bg-slate-100 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                      }`}
                    >
                      <span>{plan.ctaText}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {/* Features List */}
                  <div className="mt-8 border-t border-slate-100 pt-6 dark:border-slate-800/80">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Included in this plan:
                    </h4>
                    <ul className="mt-3 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <Check className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.notIncluded.length > 0 && (
                      <ul className="mt-3 space-y-2 text-xs text-slate-400 dark:text-slate-600 line-through">
                        {plan.notIncluded.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span className="h-4 w-4 shrink-0 text-center text-slate-300 dark:text-slate-700 font-bold">—</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 dark:border-slate-800/80">
                  {plan.id === "free" ? "No credit card required" : "100% 7-day money-back guarantee"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <section className="mt-24">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-[#0a1128] sm:text-3xl dark:text-white">
              Compare Features Across Plans
            </h2>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Clear breakdown of all features and limits
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
                    <th className="py-4 px-6 font-bold uppercase tracking-wider text-[11px]">Feature</th>
                    <th className="py-4 px-6 font-bold uppercase tracking-wider text-[11px]">Starter (₹0)</th>
                    <th className="py-4 px-6 font-bold uppercase tracking-wider text-[11px] text-[#c5a059]">Solo Pro (₹499)</th>
                    <th className="py-4 px-6 font-bold uppercase tracking-wider text-[11px]">Agency (₹1,499)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {comparisonRows.map((row, idx) => (
                    <tr key={idx} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-4 px-6 font-semibold text-[#0a1128] dark:text-white">
                        {row.name}
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                        {row.free}
                      </td>
                      <td className="py-4 px-6 font-bold text-[#0a1128] dark:text-[#c5a059]">
                        {row.pro}
                      </td>
                      <td className="py-4 px-6 text-slate-700 dark:text-slate-300">
                        {row.agency}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Pricing FAQs */}
        <section className="mt-24 border-t border-slate-200/80 pt-16 dark:border-slate-800">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-[#0a1128] sm:text-3xl dark:text-white">
              Broker Pricing FAQs
            </h2>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Everything you need to know about billing, payments, and cancellations
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
              <h3 className="text-sm font-bold text-[#0a1128] dark:text-white">
                How does the 7-day money-back guarantee work?
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                If you subscribe to Solo Pro or Agency and feel PropFolio is not helping your brokerage within 7 days, simply email <code>billing@propfolio.in</code> or message us on WhatsApp. We will refund 100% of your payment, no questions asked.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
              <h3 className="text-sm font-bold text-[#0a1128] dark:text-white">
                What happens when a property is sold?
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                You can mark the listing as "Sold" or "Archived" from your dashboard. Once archived, that slot frees up immediately so you can create a new property listing without hitting your plan limit.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
              <h3 className="text-sm font-bold text-[#0a1128] dark:text-white">
                Can I claim GST input tax credit?
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Yes! When checking out, enter your agency’s GSTIN and registered business address. You will receive an official tax invoice with 18% GST itemized for your accountant.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
              <h3 className="text-sm font-bold text-[#0a1128] dark:text-white">
                Can I pay using Google Pay, PhonePe, or UPI?
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Yes, our checkout supports all Indian UPI apps (Google Pay, PhonePe, Paytm, BHIM), Net Banking, RuPay cards, and international debit/credit cards.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="mt-20 rounded-3xl border border-[#c5a059]/40 bg-[#0a1128] p-8 text-center text-white shadow-2xl sm:p-12 dark:bg-[#0c1222]">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c5a059]/40 bg-white/5 px-4 py-1 text-xs font-semibold text-[#c5a059]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Try it right now in 60 seconds</span>
          </div>
          <h2 className="mt-4 text-2xl font-extrabold sm:text-4xl text-white">
            Send Your First Property on WhatsApp Today
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm text-slate-300">
            No credit card, no complex software to install. Just forward your property photos to our WhatsApp bot.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="https://wa.me/919876543210?text=Hi%20PropFolio%2C%20I%20want%20to%20create%20a%20listing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg transition hover:bg-emerald-700 sm:w-auto active:scale-95"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Send Property on WhatsApp</span>
            </a>
            <Link
              href="/dashboard"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-xs font-bold text-slate-200 transition hover:bg-slate-800 hover:text-white sm:w-auto"
            >
              <span>Explore Dashboard Demo</span>
              <ArrowRight className="h-4 w-4 text-[#c5a059]" />
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-8 transition-colors dark:border-slate-900 dark:bg-[#05080f]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} PropFolio Technologies. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/contact" className="hover:text-[#0a1128] dark:hover:text-white">Contact Us</Link>
            <Link href="/privacy" className="hover:text-[#0a1128] dark:hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#0a1128] dark:hover:text-white">Terms of Service</Link>
            <Link href="/refund" className="hover:text-[#0a1128] dark:hover:text-white">Refund Policy</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

