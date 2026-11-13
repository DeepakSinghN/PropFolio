"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  MapPin,
  Briefcase,
  User,
  RefreshCw
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function SignupClient() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Profile fields
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("");
  const [companyName, setCompanyName] = useState("");

  // OTP field
  const [otpCode, setOtpCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const startCountdown = () => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Submit Profile & Send WhatsApp OTP
  const handleStartSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");

      setStep(2);
      startCountdown();
      if (data.devOtp) {
        console.log(`[Dev Helper] Your OTP code is: ${data.devOtp}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Create Broker Account
  const handleVerifySignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneNumber,
          code: otpCode,
          full_name: fullName,
          city,
          company_name: companyName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      // Redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Verification code invalid or expired");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#fafaf9] py-12 sm:px-6 lg:px-8 transition-colors dark:bg-[#0c0d0e]">
      {/* Top Navbar */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between max-w-5xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
            <Building2 className="h-5 w-5" />
          </div>
          <span className="text-base font-bold text-zinc-900 dark:text-white">
            Prop<span className="text-amber-600">Folio</span>
          </span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg px-4">
        {/* Header Title */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <MessageCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Fast WhatsApp Onboarding</span>
          </div>

          <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Create your Broker Portal
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Get your own personalized micro-site link and unlimited listing creation.
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xl transition-all sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/90">
          {errorMsg && (
            <div className="mb-5 rounded-2xl bg-rose-50 border border-rose-200/80 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleStartSignup} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-zinc-900 dark:text-white">
                  Full Name / Contact Person
                </label>
                <div className="relative mt-1.5 flex items-center">
                  <User className="absolute left-3.5 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Shah"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-200 bg-[#fafaf9] py-3 pl-10 pr-4 text-sm font-semibold text-zinc-900 shadow-sm transition outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
              </div>

              {/* WhatsApp Phone */}
              <div>
                <label className="block text-xs font-bold text-zinc-900 dark:text-white">
                  WhatsApp Mobile Number
                </label>
                <div className="relative mt-1.5 flex items-center">
                  <div className="absolute left-3.5 flex items-center gap-1 text-xs font-bold text-zinc-500">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="w-full rounded-2xl border border-zinc-200 bg-[#fafaf9] py-3 pl-16 pr-4 text-sm font-semibold text-zinc-900 shadow-sm transition outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
                <p className="mt-1 text-[11px] text-zinc-400">
                  This connects your WhatsApp bot listings directly to your account.
                </p>
              </div>

              {/* City & Agency (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 dark:text-white">
                    Primary City / Market
                  </label>
                  <div className="relative mt-1.5 flex items-center">
                    <MapPin className="absolute left-3.5 h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ahmedabad"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-2xl border border-zinc-200 bg-[#fafaf9] py-3 pl-10 pr-4 text-sm font-semibold text-zinc-900 shadow-sm transition outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-900 dark:text-white">
                    Agency / Firm Name (Optional)
                  </label>
                  <div className="relative mt-1.5 flex items-center">
                    <Briefcase className="absolute left-3.5 h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="e.g. Shah Realty"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full rounded-2xl border border-zinc-200 bg-[#fafaf9] py-3 pl-10 pr-4 text-sm font-semibold text-zinc-900 shadow-sm transition outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                type="submit"
                disabled={loading || !fullName.trim() || phoneNumber.length < 10}
                className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Verify with WhatsApp Code</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifySignup} className="space-y-4">
              <div className="text-center pb-2">
                <span className="text-xs text-zinc-500">
                  Enter the 6-digit WhatsApp code sent to
                </span>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">
                  +91 {phoneNumber}
                </p>
              </div>

              <div>
                <label className="block text-center text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="• • • • • •"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-[#fafaf9] py-3 text-center text-xl font-mono tracking-widest font-black text-zinc-900 shadow-sm transition outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Complete Signup & Open Dashboard</span>
                    <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                >
                  Edit Details
                </button>

                <button
                  type="button"
                  disabled={resendTimer > 0 || loading}
                  onClick={handleStartSignup}
                  className="font-semibold text-emerald-600 disabled:opacity-50 hover:underline dark:text-emerald-400"
                >
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend WhatsApp Code"}
                </button>
              </div>
            </form>
          )}

          {/* Bottom Switcher */}
          <div className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-amber-600 hover:underline dark:text-amber-400"
            >
              Sign in with WhatsApp
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
