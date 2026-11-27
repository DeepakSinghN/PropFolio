"use client";

import { useState, useCallback, useEffect } from "react";
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
  Loader2,
  Globe,
} from "lucide-react";
import {
  PLAN_DEFINITIONS,
  CURRENCY_RATES,
  CurrencyCode,
  formatPlanPrice,
} from "@/lib/plans";

// ─── Razorpay window type ──────────────────────────────────────────────────
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

// ─── Load Razorpay script once ────────────────────────────────────────────
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PricingClient() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [currency, setCurrency] = useState<CurrencyCode>("INR");
  const [activeTab, setActiveTab] = useState<string>("solo_pro");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  // Auto-detect India vs International for default currency
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      const lang = (navigator.language || "").toLowerCase();
      const isIndia =
        tz.includes("Kolkata") || tz.includes("Calcutta") || lang.endsWith("-in");
      setCurrency(isIndia ? "INR" : "USD");
    } catch {
      setCurrency("INR");
    }
  }, []);

  const plans = [
    {
      id: "free",
      name: PLAN_DEFINITIONS.free.name,
      badge: PLAN_DEFINITIONS.free.badge,
      description: PLAN_DEFINITIONS.free.description,
      monthlyInr: 0,
      yearlyInr: 0,
      monthlyUsd: 0,
      yearlyUsd: 0,
      period: "/ 30 days",
      ctaText: "Start Free",
      ctaHref: "/signup",
      highlight: false,
      payable: false,
      features: [
        "1 Active Property Listing",
        "30-day starter validity",
        "4 Photos per listing",
        "Instant WhatsApp Bot generator",
        "Mobile-first responsive web page",
        "Direct WhatsApp inquiry button",
      ],
      notIncluded: [
        "Downloadable PDF brochure",
        "Custom broker subdomain",
        "Property video walkthroughs",
      ],
    },
    {
      id: "pay_per_listing",
      name: PLAN_DEFINITIONS.pay_per_listing.name,
      badge: PLAN_DEFINITIONS.pay_per_listing.badge,
      description: PLAN_DEFINITIONS.pay_per_listing.description,
      monthlyInr: PLAN_DEFINITIONS.pay_per_listing.monthlyPriceInr,
      yearlyInr: PLAN_DEFINITIONS.pay_per_listing.yearlyPriceInr,
      monthlyUsd: PLAN_DEFINITIONS.pay_per_listing.monthlyPriceUsd,
      yearlyUsd: PLAN_DEFINITIONS.pay_per_listing.yearlyPriceUsd,
      period: "/ listing",
      ctaText: `Pay ${formatPlanPrice(99, 1.07, currency)} & Publish`,
      ctaHref: null,
      highlight: false,
      payable: true,
      planKey: "pay_per_listing",
      features: [
        "+1 Active Listing credit",
        "30-day listing validity",
        "10 Photos per listing",
        "1-Click PDF Brochure",
        "1 Client Collection",
        "No recurring subscription",
      ],
      notIncluded: [
        "Custom broker subdomain",
        "Property video walkthroughs",
      ],
    },
    {
      id: "solo_pro",
      name: PLAN_DEFINITIONS.solo_pro.name,
      badge: PLAN_DEFINITIONS.solo_pro.badge,
      description: PLAN_DEFINITIONS.solo_pro.description,
      monthlyInr: PLAN_DEFINITIONS.solo_pro.monthlyPriceInr,
      yearlyInr: PLAN_DEFINITIONS.solo_pro.yearlyPriceInr,
      monthlyUsd: PLAN_DEFINITIONS.solo_pro.monthlyPriceUsd,
      yearlyUsd: PLAN_DEFINITIONS.solo_pro.yearlyPriceUsd,
      period: billingCycle === "yearly" ? "/year" : "/month",
      ctaText: `Get Solo Broker`,
      ctaHref: null,
      highlight: true,
      payable: true,
      planKey: billingCycle === "yearly" ? "pro_yearly" : "pro_monthly",
      features: [
        "20 Active Property Listings",
        "20 Photos per listing + Videos",
        "Custom subdomain (you.propertysnaps.in)",
        "Clean Branded PDF (No watermark)",
        "Up to 10 Client Collections",
        "Full Buyer View Stats & Analytics",
        "Priority WhatsApp AI Bot",
      ],
      notIncluded: [
        "Multi-agent team accounts",
        "Custom agency domain (.com / .in)",
      ],
    },
    {
      id: "builder_pro",
      name: PLAN_DEFINITIONS.builder_pro.name,
      badge: PLAN_DEFINITIONS.builder_pro.badge,
      description: PLAN_DEFINITIONS.builder_pro.description,
      monthlyInr: PLAN_DEFINITIONS.builder_pro.monthlyPriceInr,
      yearlyInr: PLAN_DEFINITIONS.builder_pro.yearlyPriceInr,
      monthlyUsd: PLAN_DEFINITIONS.builder_pro.monthlyPriceUsd,
      yearlyUsd: PLAN_DEFINITIONS.builder_pro.yearlyPriceUsd,
      period: billingCycle === "yearly" ? "/year" : "/month",
      ctaText: `Get Builder Pro`,
      ctaHref: null,
      highlight: false,
      payable: true,
      planKey: billingCycle === "yearly" ? "builder_yearly" : "builder_monthly",
      features: [
        "60 Active Property Listings",
        "Unlimited Photos per listing + Videos",
        "Custom subdomain (you.propertysnaps.in)",
        "Clean Branded PDF (No watermark)",
        "Unlimited Client Collections",
        "Full Portfolio View Stats",
        "Priority WhatsApp Support",
      ],
      notIncluded: [
        "Multi-agent team accounts",
      ],
    },
    {
      id: "agency_starter",
      name: PLAN_DEFINITIONS.agency_starter.name,
      badge: PLAN_DEFINITIONS.agency_starter.badge,
      description: PLAN_DEFINITIONS.agency_starter.description,
      monthlyInr: 0,
      yearlyInr: 0,
      monthlyUsd: 0,
      yearlyUsd: 0,
      period: "Custom",
      ctaText: "Contact Us",
      ctaHref: "/contact",
      highlight: false,
      payable: false,
      features: [
        "Unlimited Property Listings",
        "Unlimited Photos per listing + Videos",
        "5+ / Custom Agent WhatsApp numbers",
        "Custom Domain (properties.yourfirm.com)",
        "100% White-label Web & PDF",
        "Centralized Team Lead Stats",
        "Dedicated Account Manager",
      ],
      notIncluded: [],
    },
  ];

  const comparisonRows = [
    {
      name: "Active Property Listings",
      free: "1 Listing",
      payg: "+1 / purchase",
      pro: "20 Listings",
      builder: "60 Listings",
      agency: "Unlimited",
    },
    {
      name: "Plan / Listing Validity",
      free: "30 Days",
      payg: "30 Days",
      pro: billingCycle === "yearly" ? "365 Days" : "30 Days",
      builder: billingCycle === "yearly" ? "365 Days" : "30 Days",
      agency: "Custom",
    },
    {
      name: "Photos per listing",
      free: "4 Photos",
      payg: "10 Photos",
      pro: "20 Photos + Videos",
      builder: "Unlimited + Videos",
      agency: "Unlimited + Videos",
    },
    {
      name: "Downloadable PDF Brochure",
      free: "—",
      payg: "✓ Included",
      pro: "✓ No Watermark",
      builder: "✓ No Watermark",
      agency: "✓ White-label PDF",
    },
    {
      name: "Custom Broker Subdomain",
      free: "—",
      payg: "—",
      pro: "✓ you.propertysnaps.in",
      builder: "✓ you.propertysnaps.in",
      agency: "✓ Custom Domain",
    },
    {
      name: "Client Collections",
      free: "—",
      payg: "1 Collection",
      pro: "Up to 10",
      builder: "Unlimited",
      agency: "Unlimited",
    },
    {
      name: "Buyer View Stats",
      free: "Basic",
      payg: "Total Views",
      pro: "✓ Full View Counter",
      builder: "✓ Full Portfolio Stats",
      agency: "✓ Team Analytics",
    },
    {
      name: "Team / Agent Accounts",
      free: "1 Number",
      payg: "1 Number",
      pro: "1 Number",
      builder: "1 Number",
      agency: "✓ 5+ / Custom Agents",
    },
  ];

  // ─── Payment handler ──────────────────────────────────────────────────────
  const handlePayment = useCallback(async (planKey: string, planName: string) => {
    setLoadingPlan(planKey);

    try {
      // 1. Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert("Razorpay load nahi hua. Internet check karo aur dobara try karo.");
        setLoadingPlan(null);
        return;
      }

      // 2. Create order server-side
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        if (orderRes.status === 401) {
          // Not logged in — redirect to login
          window.location.href = `/login?redirect=/pricing`;
          return;
        }
        alert(orderData.error || "Order create nahi hua. Dobara try karo.");
        setLoadingPlan(null);
        return;
      }

      // 3. Open Razorpay checkout popup
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Property Snaps",
        description: planName,
        order_id: orderData.orderId,
        prefill: {
          contact: orderData.userPhone,
          name: orderData.userName,
        },
        theme: {
          color: "#862e9f",
        },
        modal: {
          ondismiss: () => {
            setLoadingPlan(null);
          },
        },
        // ── Payment success handler ───────────────────────────────────────
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // 4. Verify signature server-side — plan upgrades ONLY here
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planKey,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              setPaymentSuccess(planName);
              setLoadingPlan(null);
              // Redirect to dashboard after 2s
              setTimeout(() => {
                window.location.href = "/dashboard";
              }, 2000);
            } else {
              alert(verifyData.error || "Payment verify nahi hua. Support se contact karo.");
              setLoadingPlan(null);
            }
          } catch {
            alert("Verification mein error aaya. Support ko payment ID bhaijo.");
            setLoadingPlan(null);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment shuru karne mein error aaya. Dobara try karo.");
      setLoadingPlan(null);
    }
  }, []);

  // ─── Payment success banner ───────────────────────────────────────────────
  if (paymentSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa] dark:bg-[#070b14]">
        <div className="text-center px-6">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#00974e]/10 mb-6">
            <CheckCircle2 className="h-10 w-10 text-[#00974e]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#0a1128] dark:text-white mb-2">
            Payment Successful! 🎉
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">
            <strong>{paymentSuccess}</strong> plan activate ho gaya.
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Dashboard pe redirect ho raha hai...
          </p>
        </div>
      </div>
    );
  }

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

          {/* Billing Cycle Switcher + Currency Selector */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
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
                  2 Months Free
                </span>
              </button>
            </div>

            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
              <Globe className="h-3.5 w-3.5 text-slate-400" />
              <select
                aria-label="Select Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="bg-transparent text-xs font-bold text-[#0a1128] outline-none dark:text-white cursor-pointer"
              >
                {(Object.keys(CURRENCY_RATES) as CurrencyCode[]).map((code) => (
                  <option key={code} value={code} className="dark:bg-[#0c1222]">
                    {CURRENCY_RATES[code].label}
                  </option>
                ))}
              </select>
            </div>
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
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {plans.map((p) => {
              const isActive = activeTab === p.id;
              const shortPrice =
                p.id === "free"
                  ? `${formatPlanPrice(0, 0, currency)}`
                  : p.id === "agency_starter"
                    ? "Custom"
                    : p.id === "pay_per_listing"
                      ? `${formatPlanPrice(p.monthlyInr, p.monthlyUsd, currency)} / listing`
                      : billingCycle === "yearly"
                        ? `${formatPlanPrice(p.yearlyInr, p.yearlyUsd, currency)} / yr`
                        : `${formatPlanPrice(p.monthlyInr, p.monthlyUsd, currency)} / mo`;
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
                      ☆ Popular
                    </span>
                  )}
                  <span className={`text-xs font-bold leading-tight ${isActive ? "text-[#862e9f] dark:text-[#a845c4]" : ""}`}>
                    {p.name}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-1">
                    {shortPrice}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cards Grid: 1 column on mobile (filtered by activeTab), 5 columns on desktop */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-4">
          {plans.map((plan) => {
            const isPayPerListing = plan.id === "pay_per_listing";
            const isFree = plan.id === "free";
            const isAgency = plan.id === "agency_starter";
            const displayPrice = isAgency
              ? "Custom"
              : isFree
                ? formatPlanPrice(0, 0, currency)
                : isPayPerListing
                  ? formatPlanPrice(plan.monthlyInr, plan.monthlyUsd, currency)
                  : billingCycle === "yearly"
                    ? formatPlanPrice(plan.yearlyInr, plan.yearlyUsd, currency)
                    : formatPlanPrice(plan.monthlyInr, plan.monthlyUsd, currency);

            const subtext = isFree
              ? "30-day starter validity"
              : isPayPerListing
                ? "Pay once per listing (30-day validity)"
                : isAgency
                  ? "Tailored for multi-agent teams"
                  : billingCycle === "yearly"
                    ? `Billed annually (${formatPlanPrice(Math.round(plan.yearlyInr / 12), +(plan.yearlyUsd / 12).toFixed(2), currency)}/mo)`
                    : "Billed monthly, cancel anytime";

            const isSelectedMobile = activeTab === plan.id;
            const isLoading = loadingPlan === (plan as any).planKey;

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
                    ☆ {plan.badge}
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
                    {plan.payable && (plan as any).planKey ? (
                      <button
                        type="button"
                        disabled={!!loadingPlan}
                        onClick={() => handlePayment((plan as any).planKey, plan.name)}
                        className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${plan.highlight
                          ? "bg-[#00974e] text-white shadow-lg shadow-[#00974e]/25 hover:bg-[#008042]"
                          : "bg-[#862e9f] text-white shadow-md shadow-[#862e9f]/20 hover:bg-[#722687]"
                          }`}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-3.5 w-3.5" />
                            <span>{plan.ctaText}</span>
                          </>
                        )}
                      </button>
                    ) : plan.ctaHref ? (
                      <Link
                        href={plan.ctaHref}
                        target={plan.ctaHref.startsWith("http") ? "_blank" : undefined}
                        rel={plan.ctaHref.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all active:scale-95 border border-slate-200 bg-slate-50 text-[#0a1128] hover:bg-slate-100 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                      >
                        <span>{plan.ctaText}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : null}
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
                      : plan.id === "agency"
                        ? "Custom pricing available"
                        : "7-day money-back guarantee"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Security Trust Badge */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-[#00974e]" />
            Razorpay Secured Checkout
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-[#862e9f]" />
            UPI · Cards · Net Banking · Wallets
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#00974e]" />
            7-day money-back guarantee
          </span>
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
                    <th className="py-4 px-4 font-bold uppercase tracking-wider text-[11px]">Feature</th>
                    <th className="py-4 px-4 font-bold uppercase tracking-wider text-[11px]">Free ({formatPlanPrice(0, 0, currency)})</th>
                    <th className="py-4 px-4 font-bold uppercase tracking-wider text-[11px] text-[#00974e]">Pay-Per-Listing ({formatPlanPrice(99, 1.07, currency)})</th>
                    <th className="py-4 px-4 font-bold uppercase tracking-wider text-[11px] text-[#862e9f]">Solo Broker ({formatPlanPrice(699, 7.53, currency)})</th>
                    <th className="py-4 px-4 font-bold uppercase tracking-wider text-[11px] text-indigo-600 dark:text-indigo-400">Builder Pro ({formatPlanPrice(1999, 21.54, currency)})</th>
                    <th className="py-4 px-4 font-bold uppercase tracking-wider text-[11px]">Agency Pro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {comparisonRows.map((row, idx) => (
                    <tr key={idx} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-4 px-4 font-semibold text-[#0a1128] dark:text-white">
                        {row.name}
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-400">
                        {row.free}
                      </td>
                      <td className="py-4 px-4 font-semibold text-[#00974e] dark:text-[#00b85f]">
                        {row.payg}
                      </td>
                      <td className="py-4 px-4 font-bold text-[#862e9f] dark:text-[#a845c4]">
                        {row.pro}
                      </td>
                      <td className="py-4 px-4 font-semibold text-indigo-600 dark:text-indigo-400">
                        {row.builder}
                      </td>
                      <td className="py-4 px-4 text-slate-700 dark:text-slate-300">
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
                If you only have 1 or 2 occasional listings to close, you don&apos;t need an ongoing monthly subscription. Pay ₹79 once per listing to get your dedicated web page, 1-click printable PDF brochure, and direct WhatsApp buyer inquiries active for a full 60 days.
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
                You can mark the listing as &quot;Sold&quot; or &quot;Archived&quot; from your dashboard. Once archived, that slot frees up immediately so you can create a new property listing without hitting your plan limit.
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
              <span>Explore Dashboard</span>
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
