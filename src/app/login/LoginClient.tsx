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
          {errorMsg && (
            <div className="mb-5 rounded-xl bg-rose-50 border border-rose-200/80 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          {authMode === "password" ? (
            /* ================= PASSWORD LOGIN FORM ================= */
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              {/* Phone or Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Phone number or email
                </label>
                <div className="relative mt-1.5 flex items-center">
                  <div className="pointer-events-none absolute left-3.5 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    {isEmail ? (
                      <Mail className="h-4 w-4 text-slate-400" />
                    ) : (
                      <>
                        <span className="text-sm">🇮🇳</span>
                        <span className="text-slate-700 dark:text-slate-300 font-bold">+91</span>
                        <span className="h-3.5 w-px bg-slate-300 dark:bg-slate-700 ml-0.5" />
                      </>
                    )}
                  </div>
                  <input
                    type={isEmail ? "email" : "text"}
                    required
                    autoFocus
                    placeholder={isEmail ? "name@example.com" : "98765 43210"}
                    value={contactInput}
                    onChange={(e) => setContactInput(e.target.value)}
                    className={`w-full rounded-xl border border-slate-200/90 bg-slate-50/60 py-2.5 sm:py-3 pr-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#862e9f] focus:bg-white focus:ring-2 focus:ring-[#862e9f]/15 dark:border-slate-800 dark:bg-slate-900/70 dark:text-white dark:focus:border-[#862e9f] dark:focus:bg-slate-900 ${
                      isEmail ? "pl-10" : "pl-18"
                    }`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Password
                </label>
                <div className="relative mt-1.5 flex items-center">
                  <Lock className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/90 bg-slate-50/60 py-2.5 sm:py-3 pl-10 pr-10 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#862e9f] focus:bg-white focus:ring-2 focus:ring-[#862e9f]/15 dark:border-slate-800 dark:bg-slate-900/70 dark:text-white dark:focus:border-[#862e9f] dark:focus:bg-slate-900"
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
                disabled={loading || !isValidContact || !password}
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
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Phone number or email for OTP
                    </label>
                    <div className="relative mt-1.5 flex items-center">
                      <div className="pointer-events-none absolute left-3.5 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                        {isEmail ? (
                          <Mail className="h-4 w-4 text-slate-400" />
                        ) : (
                          <>
                            <span className="text-sm">🇮🇳</span>
                            <span className="text-slate-700 dark:text-slate-300 font-bold">+91</span>
                            <span className="h-3.5 w-px bg-slate-300 dark:bg-slate-700 ml-0.5" />
                          </>
                        )}
                      </div>
                      <input
                        type={isEmail ? "email" : "text"}
                        required
                        autoFocus
                        placeholder={isEmail ? "name@example.com" : "98765 43210"}
                        value={contactInput}
                        onChange={(e) => setContactInput(e.target.value)}
                        className={`w-full rounded-xl border border-slate-200/90 bg-slate-50/60 py-2.5 sm:py-3 pr-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#862e9f] focus:bg-white focus:ring-2 focus:ring-[#862e9f]/15 dark:border-slate-800 dark:bg-slate-900/70 dark:text-white dark:focus:border-[#862e9f] dark:focus:bg-slate-900 ${
                          isEmail ? "pl-10" : "pl-18"
                        }`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !isValidContact}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#00974e] py-3 text-sm font-bold text-white shadow-md shadow-[#00974e]/20 transition-all hover:bg-[#008042] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="text-xs font-semibold text-slate-500 hover:text-[#862e9f] dark:hover:text-[#a845c4] underline decoration-slate-300 underline-offset-4"
                    >
                      ← Back to Password Login
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-center text-xs font-semibold text-slate-700 dark:text-slate-300">
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
                      className="mt-2 w-full rounded-xl border border-slate-200/90 bg-slate-50/60 py-3 text-center text-2xl font-mono tracking-widest font-black text-[#0a1128] outline-none transition focus:border-[#862e9f] focus:bg-white focus:ring-2 focus:ring-[#862e9f]/15 dark:border-slate-800 dark:bg-slate-900/70 dark:text-white dark:focus:border-[#862e9f] dark:focus:bg-slate-900"
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
                      className="font-semibold text-[#00974e] disabled:opacity-50 hover:underline dark:text-[#00b85f]"
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
              className="font-bold text-[#862e9f] hover:underline dark:text-[#a845c4]"
            >
              Sign up for free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
