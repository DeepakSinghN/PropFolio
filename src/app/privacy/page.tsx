import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata = {
  title: "Privacy Policy — Property Snaps",
  description: "Learn how Property Snaps protects your data, WhatsApp communications, and property listings.",
};

export default function PrivacyPolicyPage() {
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
              className="flex items-center transition-opacity hover:opacity-90"
            >
              <Image
                src="/brand-logo.png"
                alt="PropertySnaps"
                width={140}
                height={41}
                className="h-8 w-auto object-contain"
              />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Page Header */}
        <div className="border-b border-slate-200/80 pb-8 dark:border-slate-800">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#862e9f]/30 bg-[#862e9f]/10 px-3.5 py-1 text-xs font-semibold text-[#862e9f] dark:border-[#862e9f]/30 dark:bg-[#862e9f]/20 dark:text-[#a845c4]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#862e9f]" />
            <span>Compliance & Data Protection</span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#0a1128] sm:text-4xl lg:text-5xl dark:text-white">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Last Updated: {lastUpdated} · Effective for all users across India
          </p>
        </div>

        {/* Legal Text Body */}
        <div className="mt-10 space-y-10 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0a1128] dark:text-white flex items-center gap-2">
              <span className="text-[#862e9f]">01.</span> Introduction
            </h2>
            <p>
              Welcome to <strong>Property Snaps</strong> ("we", "our", or "us"). Property Snaps provides a technology platform that allows real estate brokers, property consultants, and real estate professionals to turn raw WhatsApp messages and photos into professional web listing pages and downloadable PDF brochures.
            </p>
            <p>
              We respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and safeguard your data when you visit our website (<strong>propertysnaps.in</strong>), interact with our Meta WhatsApp Cloud API Bot, or use our broker dashboard.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0a1128] dark:text-white flex items-center gap-2">
              <span className="text-[#862e9f]">02.</span> Information We Collect
            </h2>
            <p>We only collect information necessary to provide our listing services to you:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>WhatsApp Information:</strong> When you message our WhatsApp bot, we receive your phone number (e.g., +91...), message timestamp, text descriptions of properties, and any photos you upload.
              </li>
              <li>
                <strong>Broker Account Information:</strong> If you sign in to our web portal, we associate your phone number with your profile, full name, agency name, city, and preferred subdomain slug (e.g. <code>propertysnaps.in/ramesh</code>).
              </li>
              <li>
                <strong>Property Listing Data:</strong> Asking prices, carpet area, property type, amenities, location highlights, and photographs that you explicitly submit to generate public listing links.
              </li>
              <li>
                <strong>Technical & Usage Data:</strong> IP address, device type, browser information, and view counts on public listing pages to display view metrics on your dashboard.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0a1128] dark:text-white flex items-center gap-2">
              <span className="text-[#862e9f]">03.</span> Meta WhatsApp Cloud API Compliance
            </h2>
            <p>
              Our automated listing generation operates via the official <strong>Meta WhatsApp Business Cloud API</strong>. In strict compliance with Meta’s Platform Terms and WhatsApp Business Messaging Policies:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>We never send unsolicited promotional broadcasts or spam messages.</li>
              <li>We only respond when you initiate a property creation session or request a login verification OTP code.</li>
              <li>We do not sell, rent, or trade your phone number or your clients' contact information to third-party telemarketers or advertisers.</li>
              <li>Authentication OTP codes sent to your WhatsApp expire within 10 minutes and are never stored in plain text.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0a1128] dark:text-white flex items-center gap-2">
              <span className="text-[#862e9f]">04.</span> How We Use Your Information
            </h2>
            <p>Your data is processed for the following legitimate purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To parse and format property descriptions and calculate financial estimates (such as carpet area and loan EMI).</li>
              <li>To host your public property webpages and generate downloadable print-ready PDF brochures.</li>
              <li>To provide direct click-to-WhatsApp and click-to-call links connecting interested property buyers directly with you.</li>
              <li>To authenticate your identity on the broker dashboard without requiring passwords.</li>
              <li>To prevent fraud, misuse, and illegal property advertisements.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0a1128] dark:text-white flex items-center gap-2">
              <span className="text-[#862e9f]">05.</span> Data Storage and Security
            </h2>
            <p>
              Your data is stored in secure, encrypted cloud databases (utilizing industry-standard TLS encryption in transit and AES-256 encryption at rest). Uploaded property photos are stored on high-speed Content Delivery Networks (CDNs) optimized for fast loading on buyers' mobile devices.
            </p>
            <p>
              While no Internet transmission is 100% immune, we implement role-based access control, periodic security reviews, and strict firewall parameters to guard against unauthorized access.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0a1128] dark:text-white flex items-center gap-2">
              <span className="text-[#862e9f]">06.</span> Your Data Rights & Deletion
            </h2>
            <p>
              Under Indian Digital Personal Data Protection (DPDP) standards and global privacy practices, you have full ownership over your content:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Edit or Update:</strong> You can edit or mark any listing as "Sold" or "Archived" anytime from your dashboard.</li>
              <li><strong>Complete Deletion:</strong> You can request immediate and permanent deletion of your profile, phone number, and all associated property photographs by emailing <code>privacy@propertysnaps.in</code>. Upon verification, your data will be permanently wiped within 7 business days.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0a1128] dark:text-white flex items-center gap-2">
              <span className="text-[#862e9f]">07.</span> Contact Us
            </h2>
            <p>
              If you have any questions, feedback, or privacy concerns regarding this policy, please reach out to our grievance officer:
            </p>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
              <p className="font-bold text-[#0a1128] dark:text-white">Property Snaps Technologies</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Grievance & Privacy Officer</p>
              <p className="mt-2 text-xs">
                Email: <a href="mailto:privacy@propertysnaps.in" className="text-[#862e9f] font-semibold hover:underline">privacy@propertysnaps.in</a>
              </p>
              <p className="text-xs mt-1">
                Support: <a href="mailto:support@propertysnaps.in" className="text-[#862e9f] font-semibold hover:underline">support@propertysnaps.in</a>
              </p>
              <p className="text-xs text-slate-500 mt-1">Headquarters: Ahmedabad, Gujarat, India</p>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-8 transition-colors dark:border-slate-900 dark:bg-[#05080f]">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 text-xs text-slate-500 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Property Snaps Technologies. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="hover:text-[#0a1128] dark:hover:text-white">Pricing</Link>
            <Link href="/contact" className="hover:text-[#0a1128] dark:hover:text-white">Contact</Link>
            <Link href="/terms" className="hover:text-[#0a1128] dark:hover:text-white">Terms of Service</Link>
            <Link href="/refund" className="hover:text-[#0a1128] dark:hover:text-white">Refund Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
