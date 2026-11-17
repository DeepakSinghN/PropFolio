"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  RefreshCw,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Check,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  // Login Mode: "password" (Default) or "otp" (Fallback / Forgot Password)
  const [authMode, setAuthMode] = useState<"password" | "otp">("password");

  // State
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Phone validation (10 digits)
  const cleanPhoneDigits = phoneNumber.replace(/\D/g, "");
  const isValidPhone = cleanPhoneDigits.length >= 10;

  // Start Resend Timer for OTP
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

  // 1. Password-based Login (Primary)
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: cleanPhoneDigits,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid WhatsApp number or password");
    } finally {
      setLoading(false);
    }
  };

  // 2. Send OTP (Fallback Mode)
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhoneDigits }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send WhatsApp code");

      setOtpSent(true);
      if (data.devOtp) {
        setDevOtp(data.devOtp);
      }
      startCountdown();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send WhatsApp code");
    } finally {
      setLoading(false);
    }
  };

  // 3. Verify OTP (Fallback Mode)
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: cleanPhoneDigits, code: otpCode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid or expired OTP code");
    } finally {
      setLoading(false);
    }
  };

  // 4. Quick Demo Login Helper
  const handleDemoLogin = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: "9876543210",
          password: "demo",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Demo login failed");

      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Could not log into demo account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#f8f9fa] py-12 sm:px-6 lg:px-8 transition-colors dark:bg-[#070b14]">
      {/* Top Navbar Header */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between max-w-5xl mx-auto">
        <Link href="/" className="flex items-center transition-opacity hover:opacity-90">
          <Image
            src="/brand-logo.png"
            alt="PropertySnaps"
            width={180}
            height={53}
            priority
            className="h-10 sm:h-11 w-auto object-contain"
          />
        </Link>
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Title */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#862e9f]/10 border border-[#862e9f]/20 px-3 py-1 text-xs font-bold text-[#862e9f] dark:bg-[#862e9f]/20 dark:border-[#862e9f]/30 dark:text-[#a845c4]">
            <Sparkles className="h-3.5 w-3.5 text-[#862e9f]" />
            <span>Broker Portal Access</span>
          </div>

          <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0a1128] dark:text-white">
            {authMode === "otp" && otpSent
              ? "Verify WhatsApp Code"
              : authMode === "otp"
              ? "Sign in with WhatsApp OTP"
              : "Sign in to Dashboard"}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {authMode === "otp" && otpSent
              ? `Enter the 6-digit code sent to +91 ${cleanPhoneDigits.slice(-10)}`
              : authMode === "otp"
              ? "Enter your WhatsApp number to receive an instant login code."
              : "Enter your registered WhatsApp number and password."}
          </p>
        </div>

        {/* Main Card Container */}
        <div className="mt-8 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xl transition-all sm:p-8 dark:border-slate-800 dark:bg-[#0c1222]/90">
          
          {errorMsg && (
            <div className="mb-5 rounded-2xl bg-rose-50 border border-rose-200/80 p-3.5 text-xs text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          {authMode === "password" ? (
            /* ================= 1. PRIMARY: PASSWORD LOGIN FORM ================= */
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              
              {/* WhatsApp Number */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  WhatsApp Mobile Number
                </label>
                <div className="relative mt-1.5 flex items-center">
                  <div className="pointer-events-none absolute left-3.5 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="text-sm">🇮🇳</span>
                    <span>+91</span>
                    <span className="h-4 w-px bg-slate-300 dark:bg-slate-700 ml-0.5" />
                  </div>
                  <input
                    type="tel"
                    required
                    autoFocus
                    maxLength={10}
                    placeholder="98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="w-full rounded-xl border border-slate-200/90 bg-slate-50/60 py-2.5 sm:py-3 pl-18 pr-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#862e9f] focus:bg-white focus:ring-2 focus:ring-[#862e9f]/15 dark:border-slate-800 dark:bg-slate-900/70 dark:text-white"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg("");
                      setAuthMode("otp");
                    }}
                    className="text-[11px] font-bold text-[#862e9f] hover:underline dark:text-[#a845c4]"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative mt-1.5 flex items-center">
                  <Lock className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/90 bg-slate-50/60 py-2.5 sm:py-3 pl-10 pr-10 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#862e9f] focus:bg-white focus:ring-2 focus:ring-[#862e9f]/15 dark:border-slate-800 dark:bg-slate-900/70 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !isValidPhone || !password}
                className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#00974e] py-3 text-sm font-bold text-white shadow-md shadow-[#00974e]/20 transition-all hover:bg-[#008042] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* Switch to OTP */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg("");
                    setAuthMode("otp");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0a1128] dark:text-slate-400 dark:hover:text-white"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-[#00974e]" />
                  <span>Or sign in using WhatsApp OTP</span>
                </button>
              </div>
            </form>
          ) : (
            /* ================= 2. FALLBACK: WHATSAPP OTP LOGIN FLOW ================= */
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      WhatsApp Mobile Number
                    </label>
                    <div className="relative mt-1.5 flex items-center">
                      <div className="pointer-events-none absolute left-3.5 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span className="text-sm">🇮🇳</span>
                        <span>+91</span>
                        <span className="h-4 w-px bg-slate-300 dark:bg-slate-700 ml-0.5" />
                      </div>
                      <input
                        type="tel"
                        required
                        autoFocus
                        maxLength={10}
                        placeholder="98765 43210"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="w-full rounded-xl border border-slate-200/90 bg-slate-50/60 py-2.5 sm:py-3 pl-18 pr-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#862e9f] focus:bg-white focus:ring-2 focus:ring-[#862e9f]/15 dark:border-slate-800 dark:bg-slate-900/70 dark:text-white"
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      We will send a 6-digit one-time login code to this number via WhatsApp.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !isValidPhone}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#00974e] py-3 text-sm font-bold text-white shadow-md shadow-[#00974e]/20 transition-all hover:bg-[#008042] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <MessageCircle className="h-4 w-4" />
                        <span>Send OTP on WhatsApp</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg("");
                        setAuthMode("password");
                      }}
                      className="text-xs font-semibold text-slate-500 hover:text-[#0a1128] dark:hover:text-white"
                    >
                      ← Back to password sign in
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="rounded-2xl bg-[#00974e]/5 border border-[#00974e]/20 p-3.5 text-center dark:bg-[#00974e]/10">
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Code sent to WhatsApp:
                    </div>
                    <div className="text-sm font-extrabold text-[#00974e] dark:text-[#00b85f]">
                      +91 {cleanPhoneDigits}
                    </div>

                    {devOtp && (
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-emerald-100/90 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        <span>Dev OTP: {devOtp}</span>
                        <button
                          type="button"
                          onClick={() => setOtpCode(devOtp)}
                          className="ml-1 text-[11px] underline cursor-pointer text-emerald-900 dark:text-white"
                        >
                          (Fill)
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-center text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                      Enter 6-Digit Code
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      maxLength={6}
                      placeholder="• • • • • •"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="w-full text-center tracking-[0.35em] font-mono rounded-xl border border-slate-200/90 bg-slate-50/60 py-2.5 text-2xl font-bold text-slate-900 placeholder:text-slate-300 outline-none transition focus:border-[#862e9f] focus:bg-white focus:ring-2 focus:ring-[#862e9f]/15 dark:border-slate-800 dark:bg-slate-900/70 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length < 6}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#00974e] py-3 text-sm font-bold text-white shadow-md shadow-[#00974e]/20 transition-all hover:bg-[#008042] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Verify & Open Dashboard</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpCode("");
                      }}
                      className="font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                      ← Change number
                    </button>

                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={resendTimer > 0 || loading}
                      className="font-bold text-[#862e9f] hover:underline disabled:opacity-50 dark:text-[#a845c4]"
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Quick Demo Broker Testing Shortcut */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#862e9f]/40 bg-[#862e9f]/5 py-2.5 text-xs font-bold text-[#862e9f] hover:bg-[#862e9f]/10 transition cursor-pointer dark:bg-[#862e9f]/10 dark:text-[#a845c4]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>1-Click Demo Login (Ramesh Shah)</span>
            </button>
          </div>

          {/* Bottom Switcher */}
          <div className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-bold text-[#00974e] hover:underline dark:text-[#00b85f]"
            >
              Sign up with WhatsApp Number
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
