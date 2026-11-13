"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
} from "lucide-react";

export default function ContactClient() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    subject: "General Inquiry",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    setIsSubmitting(true);
    // Simulate instantaneous delivery
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const whatsappInquiryUrl = `https://wa.me/919876543210?text=${encodeURIComponent(
    `Hi PropFolio Support Team! My name is ${formData.name || "a real estate broker"}. I have an inquiry regarding PropFolio: ${formData.message || "I would like to know more about your plans."}`
  )}`;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#0a1128] transition-colors dark:bg-[#070b14] dark:text-slate-100">
      {/* Header Banner */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-white via-[#fbf6ec]/30 to-[#f8f9fa] py-16 dark:border-slate-800/80 dark:from-[#0b1020] dark:via-[#090d18] dark:to-[#070b14]">
        <div className="absolute inset-0 bg-[radial-gradient(#c5a059_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c5a059]/40 bg-[#fbf6ec] px-4 py-1.5 text-xs font-semibold text-[#8a6828] dark:border-[#c5a059]/30 dark:bg-[#17130a] dark:text-[#d4af37]">
            <Sparkles className="h-3.5 w-3.5 text-[#c5a059]" />
            <span>We are here to assist real estate brokers 7 days a week</span>
          </div>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-[#0a1128] sm:text-5xl dark:text-white">
            Get in Touch with <span className="text-[#c5a059]">PropFolio</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 dark:text-slate-400">
            Have questions about creating listing pages, WhatsApp bot integration, or custom agency plans?
            Reach out via WhatsApp, phone, or email. We typically respond within 15 minutes.
          </p>
        </div>
      </section>

      {/* Main Grid: Contact Channels + Direct Form */}
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          
          {/* Left Column: Direct Channels & Office Info */}
          <div className="space-y-6 lg:col-span-5">
            <div>
              <h2 className="text-xl font-bold text-[#0a1128] dark:text-white">
                Contact Channels
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Choose the fastest way to reach our support engineering team.
              </p>
            </div>

            {/* Quick WhatsApp Action Card */}
            <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/50 p-6 transition-all hover:border-emerald-500 dark:border-emerald-500/20 dark:bg-emerald-950/20">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Fastest Response (~5 mins)
                  </div>
                  <h3 className="mt-1 text-base font-bold text-emerald-950 dark:text-emerald-200">
                    Chat on WhatsApp
                  </h3>
                  <p className="mt-1 text-xs text-emerald-900/80 dark:text-emerald-300/80">
                    Connect directly with our broker support team. Send your questions or request a live walkthrough.
                  </p>
                  <a
                    href="https://wa.me/919876543210?text=Hi%20PropFolio%20Team%2C%20I%20have%20a%20question%20regarding%20the%20platform."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-emerald-700 active:scale-95"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Open WhatsApp Chat</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Official Email */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a1128] text-[#c5a059] border border-[#c5a059]/30 dark:bg-[#0f182e]">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Email Support
                  </h4>
                  <a
                    href="mailto:support@propfolio.in"
                    className="text-sm font-bold text-[#0a1128] hover:text-[#c5a059] dark:text-white dark:hover:text-[#c5a059]"
                  >
                    support@propfolio.in
                  </a>
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                For account verification, invoice copies, billing requests, or technical bug reports.
              </p>
            </div>

            {/* Phone & Working Hours */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a1128] text-[#c5a059] border border-[#c5a059]/30 dark:bg-[#0f182e]">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Support Hours
                  </h4>
                  <p className="text-sm font-bold text-[#0a1128] dark:text-white">
                    Monday to Saturday, 9:30 AM – 7:30 PM IST
                  </p>
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Emergency WhatsApp listing assistance is available 7 days a week.
              </p>
            </div>

            {/* Office Locations */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0a1128] text-[#c5a059] border border-[#c5a059]/30 dark:bg-[#0f182e]">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Headquarters (Gujarat)
                    </h4>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      PropFolio Technologies, Sindhu Bhavan Road, Bodakdev, Ahmedabad, Gujarat 380054
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Regional Branch (Rajasthan)
                    </h4>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Mansarovar & Vaishali Nagar, Jaipur, Rajasthan 302020
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/40 sm:p-8 dark:border-slate-800 dark:bg-[#0c1222] dark:shadow-none">
              
              {submitted ? (
                <div className="py-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="mt-4 text-2xl font-bold text-[#0a1128] dark:text-white">
                    Message Received!
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
                    Thank you, <strong>{formData.name}</strong>. Our real estate specialist will contact you on WhatsApp at <strong>{formData.phone}</strong> shortly.
                  </p>
                  <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <a
                      href={whatsappInquiryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-emerald-700"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Continue to WhatsApp</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({
                          name: "",
                          phone: "",
                          city: "",
                          subject: "General Inquiry",
                          message: "",
                        });
                      }}
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-[#0a1128] dark:text-white">
                      Send Us a Message
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Fill out the form below. We will reply directly via WhatsApp or email.
                    </p>
                  </div>

                  {/* Name & Phone */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Patel"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-[#0a1128] outline-none transition focus:border-[#c5a059] focus:bg-white focus:ring-2 focus:ring-[#c5a059]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-[#c5a059]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 98250 12345"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-[#0a1128] outline-none transition focus:border-[#c5a059] focus:bg-white focus:ring-2 focus:ring-[#c5a059]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-[#c5a059]"
                      />
                    </div>
                  </div>

                  {/* City & Subject */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        City / Market
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Ahmedabad, Jaipur, Mumbai"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-[#0a1128] outline-none transition focus:border-[#c5a059] focus:bg-white focus:ring-2 focus:ring-[#c5a059]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-[#c5a059]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Subject
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-[#0a1128] outline-none transition focus:border-[#c5a059] focus:bg-white focus:ring-2 focus:ring-[#c5a059]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-[#c5a059]"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Agency Plan & Multi-Agent">Agency Plan & Multi-Agent</option>
                        <option value="Custom Domain Setup">Custom Domain Setup</option>
                        <option value="WhatsApp Bot Help">WhatsApp Bot Assistance</option>
                        <option value="Billing & Invoicing">Billing & Invoicing</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      How Can We Help You? *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Tell us about your real estate agency, the number of active listings you manage, or any questions you have..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-[#0a1128] outline-none transition focus:border-[#c5a059] focus:bg-white focus:ring-2 focus:ring-[#c5a059]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-[#c5a059]"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a1128] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#0a1128]/20 border border-[#c5a059]/40 transition hover:bg-[#16234b] active:scale-95 disabled:opacity-60 dark:bg-[#0f182e] dark:hover:bg-[#1b2746]"
                    >
                      {isSubmitting ? (
                        <span>Sending message...</span>
                      ) : (
                        <>
                          <Send className="h-4 w-4 text-[#c5a059]" />
                          <span>Submit Inquiry</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-center text-[11px] text-slate-400 dark:text-slate-500">
                    We value your privacy. Your phone number is strictly used to reply to this inquiry.
                  </p>
                </form>
              )}

            </div>
          </div>

        </div>

        {/* Quick FAQ Section */}
        <section className="mt-20 border-t border-slate-200/80 pt-16 dark:border-slate-800">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-[#0a1128] sm:text-3xl dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Quick answers to common broker queries
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
              <h3 className="text-sm font-bold text-[#0a1128] dark:text-white">
                How does the WhatsApp Bot work?
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Save our verified WhatsApp number, forward any property text message and photos. Our AI reads the details, organizes the specs, and replies with a live link in 60 seconds.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
              <h3 className="text-sm font-bold text-[#0a1128] dark:text-white">
                Can I use my own brand and logo?
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Yes! On our Solo Pro and Agency plans, your agency name, logo, phone number, and custom subdomain appear on all listing pages and PDF brochures.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0c1222]">
              <h3 className="text-sm font-bold text-[#0a1128] dark:text-white">
                What payment methods do you support?
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                We accept UPI (Google Pay, PhonePe, Paytm), Net Banking, RuPay, Visa, and Mastercard cards. GST tax invoices are generated automatically.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-8 transition-colors dark:border-slate-900 dark:bg-[#05080f]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-xs text-slate-500 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} PropFolio Technologies. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="hover:text-[#0a1128] dark:hover:text-white">Pricing</Link>
            <Link href="/privacy" className="hover:text-[#0a1128] dark:hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#0a1128] dark:hover:text-white">Terms of Service</Link>
            <Link href="/refund" className="hover:text-[#0a1128] dark:hover:text-white">Refund Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

