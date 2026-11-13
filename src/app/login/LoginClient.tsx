"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  RefreshCw,
  Sparkles,
  Lock
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  // State
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Start Resend Timer
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

  // 1. Send WhatsApp OTP
  const handleSendOtp = async (e: React.FormEvent) => {
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

      setOtpSent(true);
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

  // 2. Verify WhatsApp OTP & Open Dashboard
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber, code: otpCode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      // Successful verification
      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid or expired OTP code");
    } finally {
      setLoading(false);
    }
  };

  // 3. Quick One-Click Demo / Test Account Login
  const handleQuickTestLogin = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      setPhoneNumber("9876543210");
      setOtpCode("123456");
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: "9876543210", code: "123456" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Demo login failed");

      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to log in with demo account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#f8f9fa] py-12 sm:px-6 lg:px-8 transition-colors dark:bg-[#070b14]">
      {/* Top Navbar Header */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between max-w-5xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0a1128] text-[#c5a059] border border-[#c5a059]/30 shadow-md shadow-[#0a1128]/20 dark:bg-[#0f182e] dark:text-[#d4af37]">
            <Building2 className="h-5 w-5" />
          </div>
          <span className="text-base font-bold text-[#0a1128] dark:text-white">
            Prop<span className="text-[#c5a059] dark:text-[#d4af37]">Folio</span>
          </span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Title */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fbf6ec] border border-[#e8d7b3] px-3 py-1 text-xs font-bold text-[#8a6828] dark:bg-[#1a1710] dark:border-[#3d331d] dark:text-[#d4af37]">
            <MessageCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Instant WhatsApp Verification</span>
          </div>

          <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0a1128] dark:text-white">
            {otpSent ? "Enter WhatsApp Code" : "Sign In with WhatsApp"}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {otpSent
              ? `We sent a 6-digit verification code to +91 ${phoneNumber}`
              : "No passwords to remember. Enter your number to access your dashboard."}
          </p>
        </div>

        {/* Main Card Container */}
        <div className="mt-8 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xl transition-all sm:p-8 dark:border-slate-800 dark:bg-[#0c1222]/90">
          
          {/* Quick Demo / Test Account Box */}
          <div className="mb-6 rounded-2xl border border-[#c5a059]/40 bg-[#fbf6ec] p-4 text-xs dark:border-[#c5a059]/30 dark:bg-[#15120a]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#c5a059] shrink-0" />
                <span className="font-bold text-[#8a6828] dark:text-[#d4af37]">
                  Instant Test Account
                </span>
              </div>
              <button
                type="button"
                onClick={handleQuickTestLogin}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0a1128] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#16234b] active:scale-95 transition dark:bg-[#c5a059] dark:text-[#0a1128] dark:hover:bg-[#d4af37]"
              >
                <span>⚡ 1-Click Login</span>
              </button>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-slate-400">
              <span>Mobile: <strong className="font-mono text-[#0a1128] dark:text-white">+91 98765 43210</strong></span>
              <span>OTP: <strong className="font-mono text-[#0a1128] dark:text-white">123456</strong></span>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-5 rounded-2xl bg-rose-50 border border-rose-200/80 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          {!otpSent ? (
            /* STEP 1: PHONE NUMBER INPUT */
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0a1128] dark:text-white">
                  WhatsApp Mobile Number
                </label>
                <div className="relative mt-2 flex items-center">
                  <div className="absolute left-3.5 flex items-center gap-1 text-xs font-bold text-slate-500">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    autoFocus
                    placeholder="98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="w-full rounded-2xl border border-slate-200 bg-[#f8f9fc] py-3.5 pl-16 pr-4 text-base font-semibold text-[#0a1128] shadow-sm transition outline-none focus:border-[#c5a059] focus:bg-white focus:ring-2 focus:ring-[#c5a059]/20 dark:border-slate-800 dark:bg-[#090e1c] dark:text-white dark:focus:border-[#c5a059]"
                  />
                </div>
                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#c5a059]" />
                  Your WhatsApp number is your permanent, secure broker ID.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || phoneNumber.length < 10}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4" />
                    <span>Send Login Code</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: OTP VERIFICATION */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-center text-xs font-bold text-slate-700 dark:text-slate-300">
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="• • • • • •"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#f8f9fc] py-3 text-center text-2xl font-mono tracking-widest font-black text-[#0a1128] shadow-sm transition outline-none focus:border-[#c5a059] focus:bg-white focus:ring-2 focus:ring-[#c5a059]/20 dark:border-slate-800 dark:bg-[#090e1c] dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Verify & Open Dashboard</span>
                    <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtpCode("");
                  }}
                  className="text-slate-500 hover:text-[#0a1128] dark:hover:text-white"
                >
                  Change Number
                </button>

                <button
                  type="button"
                  disabled={resendTimer > 0 || loading}
                  onClick={handleSendOtp}
                  className="font-semibold text-emerald-600 disabled:opacity-50 hover:underline dark:text-emerald-400"
                >
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend WhatsApp Code"}
                </button>
              </div>
            </form>
          )}

          {/* Quick Help Footer */}
          <div className="mt-6 border-t border-slate-100 pt-4 text-center text-[11px] text-slate-400 dark:border-slate-800 dark:text-slate-500">
            By continuing, you agree to receive property notifications and buyer inquiries on your WhatsApp.
          </div>
        </div>
      </div>
    </div>
  );
}
