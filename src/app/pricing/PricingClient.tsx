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
  const [activeTab, setActiveTab] = useState<string>("pro");

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
      ctaHref: "https://wa.me/919876543210?text=Hi%20Property%20Snaps%20Team%2C%20I%20want%20to%20try%20the%20free%20listing%20creator.",
      highlight: false,
      features: [
        "1 Active Property Listing",
        "Instant WhatsApp Bot generator",
        "Mobile-first responsive web page",
        "HD Photo gallery (up to 10 photos)",
        "Direct WhatsApp inquiry button for buyers",
        "Google Maps location integration",
        "Standard propertysnaps.in link",
      ],
      notIncluded: [
        "Branded PDF brochure generator",
        "Custom broker profile subdomain",
        "Remove Property Snaps watermark",
        "Multi-agent team accounts",
      ],
    },
    {
      id: "pay_per_listing",
      name: "Pay Per Listing",
      badge: "No Subscription",
      description: "Only have 2–3 properties to market? Pay only when you publish. Zero recurring commitments.",
      monthlyPrice: 79,
      yearlyPrice: 79,
      period: "/ listing",
      ctaText: "Create Listing (₹79)",
      ctaHref: "/dashboard/listings/new",
      highlight: false,
      features: [
        "₹79 per single live listing",
        "Active online for full 60 days",
        "Instant WhatsApp Bot generator",
        "HD Photo gallery (up to 15 photos)",
        "Direct buyer WhatsApp inquiry button",
        "1-Click Branded PDF Brochure",
        "No monthly renewal / cancel anytime",
      ],
      notIncluded: [
        "Custom broker profile subdomain",
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
        "Custom broker subdomain (propertysnaps.in/yourname)",
        "1-Click Branded PDF Brochure Generator",
        "Remove Property Snaps watermark",
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
        "High-Speed Cloud Hosting & SSL",
        "Dedicated Account Manager on WhatsApp",
        "White-label client sharing options",
        "Bulk listing import assistance",
      ],
      notIncluded: [],
    },
  ];

  const comparisonRows = [
    { name: "Active Property Listings", free: "1 Listing", payg: "Pay as you go", pro: "25 Listings", agency: "Unlimited" },
    { name: "Cost / Pricing", free: "₹0 Free", payg: "₹79 / listing", pro: "₹499 / mo", agency: "₹1,499 / mo" },
    { name: "Listing Validity", free: "Unlimited", payg: "60 Days / listing", pro: "Unlimited (Active)", agency: "Unlimited (Active)" },
    { name: "WhatsApp AI Bot Generation", free: "Standard", payg: "Standard (~45s)", pro: "Priority (~30s)", agency: "Instant Priority" },
    { name: "Downloadable PDF Brochures", free: "—", payg: "✓ 1-Click Printable", pro: "✓ 1-Click Printable", agency: "✓ Custom Agency PDF" },
    { name: "Custom Broker Subdomain", free: "—", payg: "—", pro: "✓ propertysnaps.in/you", agency: "✓ Custom Domain" },
    { name: "Remove Property Snaps Watermark", free: "—", payg: "—", pro: "✓ Included", agency: "✓ Fully White-labeled" },
    { name: "Team WhatsApp Numbers", free: "1 Number", payg: "1 Number", pro: "1 Number", agency: "Up to 5 Agents" },
    { name: "Lead Inquiry Alerts", free: "Direct WhatsApp", payg: "Direct WhatsApp", pro: "Direct WhatsApp + Counter", agency: "Centralized Lead CRM" },
    { name: "HD Photos Per Listing", free: "Up to 10 Photos", payg: "Up to 15 Photos", pro: "Up to 25 Photos", agency: "Unlimited Photos" },
    { name: "Support Channel", free: "Community WhatsApp", payg: "WhatsApp Support", pro: "Priority WhatsApp Support", agency: "Dedicated Account Manager" },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#0a1128] transition-colors dark:bg-[#070b14] dark:text-slate-100">

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-white via-[#862e9f]/5 to-[#f8f9fa] py-16 sm:py-24 dark:border-slate-800/80 dark:from-[#0b1020] dark:via-[#090d18] dark:to-[#070b14]">
        <div className="absolute inset-0 bg-[radial-gradient(#862e9f_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#862e9f]/30 bg-[#862e9f]/10 px-4 py-1.5 text-xs font-semibold text-[#862e9f] dark:border-[#862e9f]/30 dark:bg-[#862e9f]/15 dark:text-[#a845c4]">
            <Sparkles className="h-3.5 w-3.5 text-[#862e9f]" />
            <span>Simple, honest pricing. No hidden fees.</span>
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#0a1128] sm:text-5xl dark:text-white">
            Invest in Your Deals, <span className="text-[#862e9f]">Not in Overhead</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 dark:text-slate-400">
            Start completely free. Upgrade when your agency is closing more transactions and needs custom branding, PDF brochures, and multi-agent access.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="mt-8 inline-flex items-center rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-xl px-5 py-2 text-xs font-bold transition-all ${billingCycle === "monthly"
                ? "bg-[#0a1128] text-white shadow dark:bg-[#862e9f] dark:text-white"
                : "text-slate-600 hover:text-[#0a1128] dark:text-slate-400 dark:hover:text-white"
                }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold transition-all ${billingCycle === "yearly"
                ? "bg-[#0a1128] text-white shadow dark:bg-[#862e9f] dark:text-white"
                : "text-slate-600 hover:text-[#0a1128] dark:text-slate-400 dark:hover:text-white"
                }`}
            >
              <span>Annual Billing</span>
              <span className="rounded-full bg-[#00974e]/10 px-2 py-0.5 text-[10px] font-extrabold text-[#00974e] dark:bg-[#00974e]/20 dark:text-[#00b85f]">
                Save 33%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        {/* Mobile Plan Switcher Tabs (< lg screens) */}
        <div className="mb-8 lg:hidden">
          <div className="text-center mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Select plan to view details:
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {plans.map((p) => {
              const isActive = activeTab === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActiveTab(p.id)}
                  className={`relative flex flex-col items-center justify-center rounded-2xl py-3 px-2 text-center transition-all cursor-pointer ${isActive
                    ? "bg-white text-[#0a1128] shadow-md border-2 border-[#862e9f] dark:bg-[#0c1222] dark:text-white"
                    : "bg-slate-100/90 text-slate-600 hover:bg-slate-200/70 border border-slate-200/80 dark:bg-slate-900/60 dark:text-slate-400 dark:border-slate-800"
                    }`}
                >
                  {p.highlight && (
                    <span className="absolute -top-2.5 rounded-full bg-[#862e9f] px-2 py-0.5 text-[9px] font-extrabold uppercase text-white shadow-xs">
                      ★ Popular
                    </span>
                  )}
                  <span className={`text-xs font-bold leading-tight ${isActive ? "text-[#862e9f] dark:text-[#a845c4]" : ""}`}>
                    {p.name}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-1">
                    {p.id === "free"
                      ? "₹0 Free"
                      : p.id === "pay_per_listing"
                        ? "₹79 / listing"
                        : p.id === "pro"
                          ? (billingCycle === "yearly" ? "₹333 / mo" : "₹499 / mo")
                          : (billingCycle === "yearly" ? "₹999 / mo" : "₹1,499 / mo")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cards Grid: 1 column on mobile (filtered by activeTab), 4 columns on desktop */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-4 xl:gap-5">
          {plans.map((plan) => {
            const isPayPerListing = plan.id === "pay_per_listing";
            const isFree = plan.id === "free";
            const displayPrice = isFree
              ? "₹0"
              : isPayPerListing
                ? "₹79"
                : billingCycle === "yearly"
                  ? `₹${plan.yearlyPrice.toLocaleString("en-IN")}`
                  : `₹${plan.monthlyPrice.toLocaleString("en-IN")}`;

            const subtext = isFree
              ? "Forever free to try"
              : isPayPerListing
                ? "Pay once per listing (60-day validity)"
                : billingCycle === "yearly"
                  ? `Billed annually (equals ₹${Math.round(plan.yearlyPrice / 12)}/month)`
                  : "Billed monthly, cancel anytime";

            const isSelectedMobile = activeTab === plan.id;

            return (
              <div
                key={plan.id}
                className={`${isSelectedMobile ? "flex" : "hidden lg:flex"
                  } relative flex-col justify-between rounded-3xl p-6 transition-all ${plan.highlight
                    ? "border-2 border-[#862e9f] bg-white shadow-2xl shadow-[#862e9f]/15 dark:border-[#862e9f] dark:bg-[#0c1222]"
                    : "border border-slate-200/80 bg-white shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-[#0c1222]/60"
                  }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#862e9f] bg-[#0a1128] px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md">
                    ★ {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[#0a1128] dark:text-white">
                      {plan.name}
                    </h3>
                    {!plan.highlight && (
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <p className="mt-2.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mt-5 flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold tracking-tight text-[#0a1128] sm:text-4xl dark:text-white">
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
                  <div className="mt-5">
                    <Link
                      href={plan.ctaHref}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all active:scale-95 ${plan.highlight
                        ? "bg-[#00974e] text-white shadow-lg shadow-[#00974e]/25 hover:bg-[#008042]"
                        : isPayPerListing
                          ? "bg-[#862e9f] text-white shadow-md shadow-[#862e9f]/20 hover:bg-[#722687]"
                          : "border border-slate-200 bg-slate-50 text-[#0a1128] hover:bg-slate-100 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                        }`}
                    >
                      <span>{plan.ctaText}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {/* Features List */}
                  <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800/80">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-black dark:text-slate-500">
                      Included in this plan:
                    </h4>
                    <ul className="mt-3 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-3.5 w-3.5 shrink-0 text-[#00974e] mt-0.5" />
                          <span className="leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.notIncluded.length > 0 && (
                      <ul className="mt-2.5 space-y-1.5 text-xs text-slate-400 dark:text-slate-600 line-through">
                        {plan.notIncluded.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="h-3.5 w-3.5 shrink-0 text-center text-slate-300 dark:text-slate-700 font-bold">—</span>
                            <span className="leading-snug">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 text-[10px] text-slate-400 dark:border-slate-800/80">
                  {plan.id === "free"
                    ? "No credit card required"
                    : plan.id === "pay_per_listing"
                      ? "Instant access upon payment"
                      : "7-day money-back guarantee"}
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
              Clear breakdown of all features, limits, and pricing models
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[640px]">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
                    <th className="py-4 px-5 font-bold uppercase tracking-wider text-[11px]">Feature</th>
                    <th className="py-4 px-5 font-bold uppercase tracking-wider text-[11px]">Starter (₹0)</th>
                    <th className="py-4 px-5 font-bold uppercase tracking-wider text-[11px] text-[#00974e]">Pay-Per-Listing (₹79)</th>
                    <th className="py-4 px-5 font-bold uppercase tracking-wider text-[11px] text-[#862e9f]">Solo Pro (₹499)</th>
                    <th className="py-4 px-5 font-bold uppercase tracking-wider text-[11px]">Agency (₹1,499)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {comparisonRows.map((row, idx) => (
                    <tr key={idx} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-4 px-5 font-semibold text-[#0a1128] dark:text-white">
                        {row.name}
                      </td>
                      <td className="py-4 px-5 text-slate-600 dark:text-slate-400">
                        {row.free}
                      </td>
                      <td className="py-4 px-5 font-semibold text-[#00974e] dark:text-[#00b85f]">
                        {row.payg}
                      </td>
                      <td className="py-4 px-5 font-bold text-[#862e9f] dark:text-[#a845c4]">
                        {row.pro}
                      </td>
                      <td className="py-4 px-5 text-slate-700 dark:text-slate-300">
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
            <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">
              Everything you need to know about billing, payments, and cancellations
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
              <h3 className="text-sm font-bold text-[#0a1128] dark:text-white">
                How does the Pay Per Listing (₹79) plan work?
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                If you only have 1 or 2 occasional listings to close, you don’t need an ongoing monthly subscription. Pay ₹79 once per listing to get your dedicated web page, 1-click printable PDF brochure, and direct WhatsApp buyer inquiries active for a full 60 days.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
              <h3 className="text-sm font-bold text-[#0a1128] dark:text-white">
                How does the 7-day money-back guarantee work?
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                If you subscribe to Solo Pro or Agency and feel Property Snaps is not helping your brokerage within 7 days, simply email <code>billing@propertysnaps.in</code> or message us on WhatsApp. We will refund 100% of your payment, no questions asked.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
              <h3 className="text-sm font-bold text-[#0a1128] dark:text-white">
                What happens when a property is sold?
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                You can mark the listing as "Sold" or "Archived" from your dashboard. Once archived, that slot frees up immediately so you can create a new property listing without hitting your plan limit.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
              <h3 className="text-sm font-bold text-[#0a1128] dark:text-white">
                Can I edit my property listing after publishing?
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Yes, absolutely! You can update photos, prices, descriptions, or specs anytime directly from your dashboard. All changes reflect instantly on your live web page and shared brochure.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
              <h3 className="text-sm font-bold text-[#0a1128] dark:text-white">
                Can I pay using Google Pay, PhonePe, or UPI?
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Yes, our checkout supports all Indian UPI apps (Google Pay, PhonePe, Paytm, BHIM), Net Banking, RuPay cards, and international debit/credit cards.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="mt-20 rounded-3xl border border-[#862e9f]/30 bg-[#0a1128] p-8 text-center text-white shadow-2xl sm:p-12 dark:bg-[#0c1222]">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#862e9f]/40 bg-white/5 px-4 py-1 text-xs font-semibold text-[#862e9f]">
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
              href="https://wa.me/919876543210?text=Hi%20Property%20Snaps%2C%20I%20want%20to%20create%20a%20listing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00974e] px-6 py-3.5 text-xs font-bold text-white shadow-lg transition hover:bg-[#008042] sm:w-auto active:scale-95"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Send Property on WhatsApp</span>
            </a>
            <Link
              href="/dashboard"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-xs font-bold text-slate-200 transition hover:bg-slate-800 hover:text-white sm:w-auto"
            >
              <span>Explore Dashboard Demo</span>
              <ArrowRight className="h-4 w-4 text-[#862e9f]" />
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-8 transition-colors dark:border-slate-900 dark:bg-[#05080f]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Property Snaps Technologies. All rights reserved.</p>
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

