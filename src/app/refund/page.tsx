import Link from "next/link";
import { ArrowLeft, RefreshCw, CheckCircle2, Building2, HelpCircle, ShieldCheck, Mail, Clock } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata = {
  title: "Refund & Cancellation Policy — PropFolio",
  description: "Learn about PropFolio's 7-day money-back guarantee, subscription cancellation terms, and refund process.",
};

export default function RefundPage() {
  const lastUpdated = "November 13, 2026";

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#0a1128] transition-colors dark:bg-[#070b14] dark:text-slate-100">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#f8f9fa]/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#070b14]/90">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 transition hover:text-[#0a1128] dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-bold text-[#0a1128] dark:text-white"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0a1128] text-[#c5a059] border border-[#c5a059]/30 dark:bg-[#0f182e] dark:text-[#d4af37]">
                <Building2 className="h-4 w-4" />
              </div>
              <span>
                Prop<span className="text-[#c5a059]">Folio</span>
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Page Header */}
        <div className="border-b border-slate-200/80 pb-8 dark:border-slate-800">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c5a059]/40 bg-[#fbf6ec] px-3.5 py-1 text-xs font-semibold text-[#8a6828] dark:border-[#c5a059]/30 dark:bg-[#17130a] dark:text-[#d4af37]">
            <RefreshCw className="h-3.5 w-3.5 text-[#c5a059]" />
            <span>Transparent Billing & Consumer Protection</span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#0a1128] sm:text-4xl lg:text-5xl dark:text-white">
            Refund & Cancellation Policy
          </h1>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Last Updated: {lastUpdated} · Designed for real estate brokers and property agencies across India
          </p>
        </div>

        {/* Highlight Guarantee Box */}
        <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-50/50 p-6 dark:border-emerald-500/20 dark:bg-emerald-950/20">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-200">
                100% 7-Day Money-Back Guarantee
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-emerald-900/80 dark:text-emerald-300/80">
                We want you to be completely satisfied with PropFolio. If you upgrade to our <strong>Solo Broker Pro</strong> or <strong>Agency</strong> plan and feel it is not helping your brokerage within 7 calendar days of your initial purchase, we will refund your payment in full. No questions asked.
              </p>
            </div>
          </div>
        </div>

        {/* Policy Sections */}
        <div className="mt-10 space-y-10 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0a1128] dark:text-white flex items-center gap-2">
              <span className="text-[#c5a059]">01.</span> Overview
            </h2>
            <p>
              At <strong>PropFolio</strong> ("we", "our", or "us"), we provide software-as-a-service (SaaS) subscriptions enabling Indian real estate brokers and agencies to convert property details sent over WhatsApp into mobile-optimized web listing pages and downloadable PDF brochures.
            </p>
            <p>
              This policy outlines your rights regarding subscription cancellations, renewals, and refunds in accordance with the Consumer Protection (E-Commerce) Rules and payment partner standards (Razorpay, Stripe).
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0a1128] dark:text-white flex items-center gap-2">
              <span className="text-[#c5a059]">02.</span> Subscription Cancellation
            </h2>
            <p>You can cancel your subscription at any time without penalty or friction:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Self-Service Cancellation:</strong> You can cancel your paid subscription at any moment directly from your PropFolio web dashboard under <em>Settings → Billing & Subscription</em>.
              </li>
              <li>
                <strong>WhatsApp / Email Request:</strong> Alternatively, you can message our verified WhatsApp support number or email <code>billing@propfolio.in</code> with your registered phone number. Our team will process your cancellation within 24 business hours.
              </li>
              <li>
                <strong>End of Billing Period Access:</strong> When you cancel, your subscription will remain active until the end of your currently paid billing cycle (monthly or annual). After this date, your account reverts automatically to the free starter tier (1 active listing), and you will not be charged again.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0a1128] dark:text-white flex items-center gap-2">
              <span className="text-[#c5a059]">03.</span> Refund Eligibility & Guidelines
            </h2>
            <p>Refunds are evaluated under the following terms:</p>
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#0c1222]">
                <h4 className="font-bold text-[#0a1128] dark:text-white text-xs uppercase tracking-wider text-[#c5a059]">
                  A. Initial Subscription (7-Day Guarantee)
                </h4>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  New subscribers who request a refund within 7 days of their initial upgrade date receive a 100% full refund of the amount paid.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#0c1222]">
                <h4 className="font-bold text-[#0a1128] dark:text-white text-xs uppercase tracking-wider text-[#c5a059]">
                  B. Annual Plan Pro-Rata Policy
                </h4>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  If you purchase an Annual subscription and experience unexpected business closure or severe platform downtime after the 7-day window, you may request a pro-rated refund for the remaining unused months of your annual term.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#0c1222]">
                <h4 className="font-bold text-[#0a1128] dark:text-white text-xs uppercase tracking-wider text-[#c5a059]">
                  C. Accidental Renewal Charges
                </h4>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  If an automatic subscription renewal occurs and you did not intend to continue using PropFolio, notify us within 48 hours of the renewal charge (provided zero new listings were created in the new cycle), and we will gladly issue a full renewal refund.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0a1128] dark:text-white flex items-center gap-2">
              <span className="text-[#c5a059]">04.</span> Non-Refundable Items
            </h2>
            <p>The following fees are non-refundable:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Third-Party Custom Domain Registration:</strong> If you requested PropFolio to purchase a custom web domain (e.g. <code>.com</code> or <code>.in</code>) on your behalf through ICANN registrars, the registry domain cost is non-refundable as domain registries do not refund registration fees.
              </li>
              <li>
                <strong>Accounts Terminated for Fraud or Illegal Use:</strong> Accounts suspended due to fraud, deceptive property listings, RERA violations, or spam violations are not eligible for a refund.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0a1128] dark:text-white flex items-center gap-2">
              <span className="text-[#c5a059]">05.</span> Refund Processing Timeline & Method
            </h2>
            <p>
              Once your refund request is confirmed by our billing team:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Original Payment Method:</strong> Refunds are credited directly back to the original payment source (UPI VPA, debit/credit card, or net banking account).
              </li>
              <li>
                <strong>Processing Time:</strong> We initiate refunds within 24 hours of approval. Your bank or UPI provider typically takes <strong>5 to 7 business days</strong> to reflect the credited funds in your bank account.
              </li>
              <li>
                <strong>Tax & GST Credit Note:</strong> If a GST tax invoice was issued for your purchase, an official GST Credit Note will be generated and emailed to you for appropriate accounting reconciliation.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0a1128] dark:text-white flex items-center gap-2">
              <span className="text-[#c5a059]">06.</span> How to Request a Refund
            </h2>
            <p>To request a refund or raise a billing inquiry, simply contact us through any of the following channels:</p>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-[#c5a059]" />
                  <span className="font-bold text-[#0a1128] dark:text-white">Email Billing Support</span>
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Send your registered phone number & payment receipt to:
                </p>
                <a href="mailto:billing@propfolio.in" className="mt-1 block text-xs font-bold text-[#c5a059] hover:underline">
                  billing@propfolio.in
                </a>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-emerald-500" />
                  <span className="font-bold text-[#0a1128] dark:text-white">Direct WhatsApp Support</span>
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Message our team with "Refund Request" on WhatsApp:
                </p>
                <a
                  href="https://wa.me/919876543210?text=Hi%20PropFolio%2C%20I%20have%20a%20billing%20question%20regarding%20my%20subscription."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-xs font-bold text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  +91 98765 43210 (WhatsApp)
                </a>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-8 transition-colors dark:border-slate-900 dark:bg-[#05080f]">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 text-xs text-slate-500 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} PropFolio Technologies. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="hover:text-[#0a1128] dark:hover:text-white">Pricing</Link>
            <Link href="/contact" className="hover:text-[#0a1128] dark:hover:text-white">Contact</Link>
            <Link href="/privacy" className="hover:text-[#0a1128] dark:hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#0a1128] dark:hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

