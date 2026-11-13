import Link from "next/link";
import { ArrowLeft, Scale, CheckCircle2, Building2 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata = {
  title: "Terms of Service — PropFolio",
  description: "Terms and conditions governing your use of PropFolio's real estate listing platform and WhatsApp bot.",
};

export default function TermsPage() {
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
            <Scale className="h-3.5 w-3.5 text-[#c5a059]" />
            <span>Agreement & User Responsibilities</span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#0a1128] sm:text-4xl lg:text-5xl dark:text-white">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Last Updated: {lastUpdated} · Please read these terms carefully before using PropFolio.
          </p>
        </div>

        {/* Legal Text Body */}
        <div className="mt-10 space-y-10 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0a1128] dark:text-white flex items-center gap-2">
              <span className="text-[#c5a059]">01.</span> Agreement to Terms
            </h2>
            <p>
              By accessing or using the services provided by <strong>PropFolio</strong> ("Platform", "we", "us"), including our website (<strong>propfolio.in</strong>), WhatsApp Cloud API bot, and broker dashboard, you agree to be bound by these Terms of Service. If you do not agree to these terms, you must discontinue using our services immediately.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0a1128] dark:text-white flex items-center gap-2">
              <span className="text-[#c5a059]">02.</span> Scope of Service
            </h2>
            <p>
              PropFolio provides software and artificial intelligence technology designed to format, host, and display real estate listings and generate downloadable promotional materials (such as PDF brochures).
            </p>
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-300">
              <strong>Important Notice:</strong> PropFolio is a technology platform and <u>not</u> a licensed real estate broker, agent, valuer, or legal advisor. We do not participate in property negotiations, do not hold customer funds in escrow, and do not guarantee the completion or legality of any real estate transaction executed between buyers and brokers.
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0a1128] dark:text-white flex items-center gap-2">
              <span className="text-[#c5a059]">03.</span> Broker Responsibilities & RERA Compliance
            </h2>
            <p>As a broker or listing creator on PropFolio, you affirm and warrant that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Authorization:</strong> You hold legal authorization, brokerage mandate, or owner consent to market the property described in your listing.
              </li>
              <li>
                <strong>Accuracy:</strong> All property details, including carpet area, asking price, amenities, and furnishings, are accurate and truthful to the best of your knowledge.
              </li>
              <li>
                <strong>RERA Compliance:</strong> You are solely responsible for ensuring your listings comply with the Real Estate (Regulation and Development) Act (RERA) 2016 and applicable state RERA regulations, including displaying valid RERA project registration numbers where legally required.
              </li>
              <li>
                <strong>No Misrepresentation:</strong> You will not post fraudulent listings, bait-and-switch pricing, or fake photos designed to mislead buyers.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0a1128] dark:text-white flex items-center gap-2">
              <span className="text-[#c5a059]">04.</span> Intellectual Property & Photo Rights
            </h2>
            <p>
              You retain all ownership rights to the photographs, descriptions, and logos you upload. By submitting content through our WhatsApp bot or dashboard, you grant PropFolio a worldwide, non-exclusive, royalty-free license to host, format, optimize, and display this content for the sole purpose of providing your listing service.
            </p>
            <p>
              You agree not to upload copyrighted images, watermarked third-party photography, or architectural renders without appropriate legal license or permission from the copyright owner.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0a1128] dark:text-white flex items-center gap-2">
              <span className="text-[#c5a059]">05.</span> WhatsApp Bot Fair Usage
            </h2>
            <p>
              Our automated WhatsApp service is intended for legitimate property generation by real estate professionals. Automated scraping, reverse-engineering of bot prompts, high-volume stress testing, or sending abusive or defamatory text to the bot is strictly prohibited and will result in immediate phone number blacklisting.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0a1128] dark:text-white flex items-center gap-2">
              <span className="text-[#c5a059]">06.</span> Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by Indian law, PropFolio shall not be liable for any indirect, incidental, punitive, or consequential damages, including loss of brokerage commission, buyer disputes, property title defects, or site visit cancellations arising from your use of the platform.
            </p>
            <p>
              Property financial estimations (such as estimated monthly loan EMI) are provided for illustrative purposes only and do not constitute an official loan approval or interest rate commitment by any financial institution.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0a1128] dark:text-white flex items-center gap-2">
              <span className="text-[#c5a059]">07.</span> Governing Law & Jurisdiction
            </h2>
            <p>
              These Terms of Service are governed by and construed in accordance with the laws of India. Any legal dispute or claim arising out of or related to our platform shall be subject to the exclusive jurisdiction of the competent courts in Ahmedabad, Gujarat, India.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0a1128] dark:text-white flex items-center gap-2">
              <span className="text-[#c5a059]">08.</span> Contact & Legal Inquiries
            </h2>
            <p>
              If you have any questions regarding these terms or wish to report an infringing listing, please contact:
            </p>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
              <p className="font-bold text-[#0a1128] dark:text-white">PropFolio Legal Department</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Legal & Compliance</p>
              <p className="mt-2 text-xs">
                Email: <a href="mailto:legal@propfolio.in" className="text-[#c5a059] font-semibold hover:underline">legal@propfolio.in</a>
              </p>
              <p className="text-xs mt-1">
                Support: <a href="mailto:support@propfolio.in" className="text-[#c5a059] font-semibold hover:underline">support@propfolio.in</a>
              </p>
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
            <Link href="/refund" className="hover:text-[#0a1128] dark:hover:text-white">Refund Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
