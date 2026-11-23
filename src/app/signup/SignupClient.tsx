"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  MapPin,
  Briefcase,
  User,
  RefreshCw,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  MessageCircle,
  KeyRound,
  Check,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function SignupClient() {
  const router = useRouter();

  // Wizard Step: "details" (Step 1) -> "otp" (Step 2)
  const [step, setStep] = useState<"details" | "otp">("details");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [city, setCity] = useState("");
  const [companyName, setCompanyName] = useState("");

  // OTP Fields
  const [otpCode, setOtpCode] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Clean phone number (10 digits)
  const cleanPhoneDigits = phoneNumber.replace(/\D/g, "");
  const isValidPhone = cleanPhoneDigits.length >= 10;

  // Countdown timer for OTP resend
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

  // 1. Submit Details -> Trigger WhatsApp OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName.trim()) {
      setErrorMsg("Please enter your full name");
      return;
    }

    if (!isValidPhone) {
      setErrorMsg("Please enter a valid 10-digit WhatsApp mobile number");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhoneDigits }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send WhatsApp verification code");

      if (data.otp_token) {
        setOtpToken(data.otp_token);
      }

      setStep("otp");
      startCountdown();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send verification code. Please check the number.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Resend WhatsApp OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhoneDigits }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend code");

      if (data.otp_token) {
        setOtpToken(data.otp_token);
      }
      startCountdown();
    } catch (err: any) {
      setErrorMsg(err.message || "Could not resend verification code");
    } finally {
      setLoading(false);
    }
  };

  // 3. Verify OTP + Create User Account
  const handleVerifyAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setErrorMsg("Please enter the complete 6-digit WhatsApp code");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          identifier: cleanPhoneDigits,
          password,
          otp_code: otpCode.trim(),
          otp_token: otpToken,
          city: city.trim() || "India",
          company_name: companyName.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      // Successfully registered & session set, redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid or expired OTP code. Please try again.");
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

      <div className="sm:mx-auto sm:w-full sm:max-w-lg px-4">
        
        {/* Header Title */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#00974e]/10 border border-[#00974e]/20 px-3.5 py-1 text-xs font-bold text-[#00974e] dark:bg-[#00974e]/20 dark:border-[#00974e]/30 dark:text-[#00b85f]">
            <MessageCircle className="h-3.5 w-3.5" />
            <span>WhatsApp-Verified Sign Up</span>
          </div>

          <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0a1128] dark:text-white">
            {step === "details" ? "Create your Broker Account" : "Confirm WhatsApp Number"}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {step === "details"
              ? "Set your details once. Daily login requires only your WhatsApp number & password."
              : `We sent a 6-digit confirmation code on WhatsApp to +91 ${cleanPhoneDigits.slice(-10)}.`}
          </p>
        </div>

        {/* Form Card */}
        <div className="mt-8 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xl transition-all sm:p-8 dark:border-slate-800 dark:bg-[#0c1222]/90">
          
          {errorMsg && (
            <div className="mb-5 rounded-2xl bg-rose-50 border border-rose-200/80 p-3.5 text-xs text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          {step === "details" ? (
            /* ================= STEP 1: REGISTRATION DETAILS ================= */
            <form onSubmit={handleRequestOtp} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Full Name / Contact Person
                </label>
                <div className="relative mt-1.5 flex items-center">
                  <User className="absolute left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Ramesh Shah"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/90 bg-slate-50/60 py-2.5 sm:py-3 pl-10 pr-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#862e9f] focus:bg-white focus:ring-2 focus:ring-[#862e9f]/15 dark:border-slate-800 dark:bg-slate-900/70 dark:text-white"
                  />
                </div>
              </div>

              {/* WhatsApp Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  WhatsApp Mobile Number <span className="text-[#00974e]">(For verification OTP)</span>
                </label>
                <div className="relative mt-1.5 flex items-center">
                  <div className="absolute left-3.5 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="text-sm">🇮🇳</span>
                    <span>+91</span>
                    <span className="h-4 w-px bg-slate-300 dark:bg-slate-700 ml-0.5" />
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="w-full rounded-xl border border-slate-200/90 bg-slate-50/60 py-2.5 sm:py-3 pl-18 pr-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#862e9f] focus:bg-white focus:ring-2 focus:ring-[#862e9f]/15 dark:border-slate-800 dark:bg-slate-900/70 dark:text-white"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  We will send a 6-digit confirmation code to this WhatsApp number.
                </p>
              </div>

              {/* Set Password */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Create Password <span className="text-slate-400 font-normal">(For your daily sign in)</span>
                </label>
                <div className="relative mt-1.5 flex items-center">
                  <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/90 bg-slate-50/60 py-2.5 sm:py-3 pl-10 pr-11 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#862e9f] focus:bg-white focus:ring-2 focus:ring-[#862e9f]/15 dark:border-slate-800 dark:bg-slate-900/70 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* City & Agency (Optional 2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Primary City
                  </label>
                  <div className="relative mt-1 flex items-center">
                    <MapPin className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Ahmedabad"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-xl border border-slate-200/90 bg-slate-50/60 py-2 pl-9 pr-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#862e9f] focus:bg-white dark:border-slate-800 dark:bg-slate-900/70 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Agency / Firm Name (Optional)
                  </label>
                  <div className="relative mt-1 flex items-center">
                    <Briefcase className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Shah Realty"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200/90 bg-slate-50/60 py-2 pl-9 pr-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#862e9f] focus:bg-white dark:border-slate-800 dark:bg-slate-900/70 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                type="submit"
                disabled={loading || !fullName.trim() || !isValidPhone || password.length < 6}
                className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#00974e] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#00974e]/25 transition-all hover:bg-[#008042] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4" />
                    <span>Verify WhatsApp & Continue</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ================= STEP 2: WHATSAPP OTP VERIFICATION ================= */
            <form onSubmit={handleVerifyAndSignup} className="space-y-5">
              
              <div className="rounded-2xl bg-[#00974e]/5 border border-[#00974e]/20 p-4 text-center dark:bg-[#00974e]/10">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#00974e] text-white shadow-sm mb-2">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Verification code sent to WhatsApp:
                </div>
                <div className="text-sm font-extrabold text-[#00974e] dark:text-[#00b85f] mt-0.5">
                  +91 {cleanPhoneDigits}
                </div>
              </div>

              {/* OTP Input */}
              <div>
                <label className="block text-center text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
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
                  className="w-full text-center tracking-[0.4em] font-mono rounded-xl border border-slate-200/90 bg-slate-50/60 py-3 text-2xl font-bold text-slate-900 placeholder:text-slate-300 outline-none transition focus:border-[#862e9f] focus:bg-white focus:ring-2 focus:ring-[#862e9f]/15 dark:border-slate-800 dark:bg-slate-900/70 dark:text-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  type="submit"
                  disabled={loading || otpCode.length < 6}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#00974e] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#00974e]/25 transition-all hover:bg-[#008042] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Confirm & Open Dashboard</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("details");
                      setOtpCode("");
                      setErrorMsg("");
                    }}
                    className="font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white underline underline-offset-4"
                  >
                    ← Edit phone number
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || loading}
                    className="font-bold text-[#862e9f] hover:underline disabled:opacity-50 dark:text-[#a845c4]"
                  >
                    {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend WhatsApp Code"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Bottom Switcher */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
            Already registered?{" "}
            <Link
              href="/login"
              className="font-bold text-[#862e9f] hover:underline dark:text-[#a845c4]"
            >
              Sign in with WhatsApp Number & Password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
