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
  Lock,
  Mail,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  // Login Mode: "password" (default) or "otp"
  const [authMode, setAuthMode] = useState<"password" | "otp">("password");

  // State
  const [contactInput, setContactInput] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Check email vs phone
  const isEmail = contactInput.includes("@");
  const isValidContact = isEmail
    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInput.trim())
    : contactInput.replace(/\D/g, "").length >= 10;

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
          identifier: contactInput.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid phone/email or password");
    } finally {
      setLoading(false);
    }
  };

  // 2. Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: contactInput.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code");

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

  // 3. Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: contactInput.trim(), code: otpCode }),
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

  // 4. Quick One-Click Demo / Test Account Login
  const handleQuickTestLogin = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      setContactInput("demo@propertysnaps.co");
      setPassword("demo123");
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: "demo@propertysnaps.co",
          password: "demo",
        }),
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
            Property<span className="text-[#c5a059] dark:text-[#d4af37]"> Snaps</span>
          </span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Title */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fbf6ec] border border-[#e8d7b3] px-3 py-1 text-xs font-bold text-[#8a6828] dark:bg-[#1a1710] dark:border-[#3d331d] dark:text-[#d4af37]">
            <Sparkles className="h-3.5 w-3.5 text-[#c5a059]" />
            <span>Broker Portal Sign In</span>
          </div>

          <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0a1128] dark:text-white">
            {authMode === "otp" && otpSent
              ? "Enter Verification Code"
              : "Sign in to your account"}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {authMode === "otp" && otpSent
              ? `We sent a code to ${isEmail ? contactInput.trim() : `+91 ${contactInput.replace(/\D/g, "")}`}`
              : "Enter your phone number or email and password to access your dashboard."}
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
                  Instant Demo Account
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
              <span>User: <strong className="font-mono text-[#0a1128] dark:text-white">demo@propertysnaps.co</strong></span>
              <span>Pass: <strong className="font-mono text-[#0a1128] dark:text-white">demo123</strong></span>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-5 rounded-2xl bg-rose-50 border border-rose-200/80 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          {authMode === "password" ? (
            /* ================= PASSWORD LOGIN FORM ================= */
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              {/* Phone or Email */}
              <div>
                <label className="block text-xs font-bold text-[#0a1128] dark:text-white">
                  Phone number or email
                </label>
                <div className="relative mt-2 flex items-center">
                  <div className="absolute left-3.5 flex items-center gap-1 text-xs font-bold text-slate-500">
                    {isEmail ? (
                      <Mail className="h-4 w-4 text-[#c5a059]" />
                    ) : (
                      <>
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </>
                    )}
                  </div>
                  <input
                    type={isEmail ? "email" : "text"}
                    required
                    autoFocus
                    placeholder="98765 43210 or name@example.com"
                    value={contactInput}
                    onChange={(e) => setContactInput(e.target.value)}
                    className={`w-full rounded-2xl border border-slate-200 bg-[#f8f9fc] py-3.5 pr-4 text-sm sm:text-base font-semibold text-[#0a1128] shadow-sm transition outline-none focus:border-[#c5a059] focus:bg-white focus:ring-2 focus:ring-[#c5a059]/20 dark:border-slate-800 dark:bg-[#090e1c] dark:text-white dark:focus:border-[#c5a059] ${
                      isEmail ? "pl-11" : "pl-16"
                    }`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#0a1128] dark:text-white">
                    Password
                  </label>
                </div>
                <div className="relative mt-2 flex items-center">
                  <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-[#f8f9fc] py-3.5 pl-10 pr-11 text-sm sm:text-base font-semibold text-[#0a1128] shadow-sm transition outline-none focus:border-[#c5a059] focus:bg-white focus:ring-2 focus:ring-[#c5a059]/20 dark:border-slate-800 dark:bg-[#090e1c] dark:text-white dark:focus:border-[#c5a059]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !isValidContact || !password}
                className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
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
                  className="text-xs font-semibold text-slate-500 hover:text-[#0a1128] dark:hover:text-white underline decoration-slate-300 underline-offset-4"
                >
                  Forgot password? Or sign in with OTP code
                </button>
              </div>
            </form>
          ) : (
            /* ================= OTP LOGIN FLOW ================= */
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0a1128] dark:text-white">
                      Phone number or email for OTP
                    </label>
                    <div className="relative mt-2 flex items-center">
                      <div className="absolute left-3.5 flex items-center gap-1 text-xs font-bold text-slate-500">
                        {isEmail ? (
                          <Mail className="h-4 w-4 text-[#c5a059]" />
                        ) : (
                          <>
                            <span>🇮🇳</span>
                            <span>+91</span>
                          </>
                        )}
                      </div>
                      <input
                        type={isEmail ? "email" : "text"}
                        required
                        autoFocus
                        placeholder="98765 43210 or name@example.com"
                        value={contactInput}
                        onChange={(e) => setContactInput(e.target.value)}
                        className={`w-full rounded-2xl border border-slate-200 bg-[#f8f9fc] py-3.5 pr-4 text-sm sm:text-base font-semibold text-[#0a1128] shadow-sm transition outline-none focus:border-[#c5a059] focus:bg-white focus:ring-2 focus:ring-[#c5a059]/20 dark:border-slate-800 dark:bg-[#090e1c] dark:text-white dark:focus:border-[#c5a059] ${
                          isEmail ? "pl-11" : "pl-16"
                        }`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !isValidContact}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <MessageCircle className="h-4 w-4" />
                        <span>Send Verification Code</span>
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
                      className="text-xs font-semibold text-slate-500 hover:text-[#0a1128] dark:hover:text-white underline decoration-slate-300 underline-offset-4"
                    >
                      ← Back to Password Login
                    </button>
                  </div>
                </form>
              ) : (
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
                      Edit details
                    </button>

                    <button
                      type="button"
                      disabled={resendTimer > 0 || loading}
                      onClick={handleSendOtp}
                      className="font-semibold text-emerald-600 disabled:opacity-50 hover:underline dark:text-emerald-400"
                    >
                      {resendTimer > 0
                        ? `Resend in ${resendTimer}s`
                        : "Resend Code"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Bottom Link to Sign Up */}
          <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
            Don&apos;t have an account yet?{" "}
            <Link
              href="/signup"
              className="font-bold text-amber-600 hover:underline dark:text-amber-400"
            >
              Sign up for free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
