"use client";

import { useState, useEffect } from "react";
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
  X,
  Globe,
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
  const [subdomain, setSubdomain] = useState("");
  const [isManualSlug, setIsManualSlug] = useState(false);
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [slugReason, setSlugReason] = useState("");
  const [slugSuggestions, setSlugSuggestions] = useState<string[]>([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [city, setCity] = useState("");
  const [companyName, setCompanyName] = useState("");

  const handleFullNameChange = (val: string) => {
    setFullName(val);
    if (!isManualSlug) {
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-+|-+$)/g, "");
      setSubdomain(autoSlug);
    }
  };

  useEffect(() => {
    const clean = subdomain.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "");
    if (!clean) {
      setSlugStatus("idle");
      setSlugReason("");
      setSlugSuggestions([]);
      return;
    }
    if (clean.length < 3) {
      setSlugStatus("invalid");
      setSlugReason("Subdomain must be at least 3 characters");
      setSlugSuggestions([]);
      return;
    }

    setSlugStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-slug?slug=${encodeURIComponent(clean)}`);
        const data = await res.json();
        if (data.available) {
          setSlugStatus("available");
          setSlugReason("Available!");
          setSlugSuggestions([]);
        } else {
          setSlugStatus("taken");
          setSlugReason(data.reason || `'${clean}' is already taken`);
          setSlugSuggestions(data.suggestions || []);
        }
      } catch {
        setSlugStatus("idle");
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [subdomain]);

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

    if (!subdomain.trim() || slugStatus === "taken" || slugStatus === "invalid" || slugStatus === "checking") {
      setErrorMsg("Please choose an available subdomain before proceeding");
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
          slug: subdomain.trim().toLowerCase(),
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
                  Full Name / Contact Person <span className="text-rose-500">*</span>
                </label>
                <div className="relative mt-1.5 flex items-center">
                  <User className="absolute left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Deepak Sharma"
                    value={fullName}
                    onChange={(e) => handleFullNameChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/90 bg-slate-50/60 py-2.5 sm:py-3 pl-10 pr-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#862e9f] focus:bg-white focus:ring-2 focus:ring-[#862e9f]/15 dark:border-slate-800 dark:bg-slate-900/70 dark:text-white"
                  />
                </div>
              </div>

              {/* Subdomain / Website Link with Realtime Availability Checker */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Your Personal Website Subdomain <span className="text-rose-500">*</span>
                  </label>
                  {slugStatus === "checking" && (
                    <span className="text-[11px] text-amber-500 flex items-center gap-1 font-medium">
                      <RefreshCw className="h-2.5 w-2.5 animate-spin" /> Checking...
                    </span>
                  )}
                  {slugStatus === "available" && (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="h-3 w-3" /> Available
                    </span>
                  )}
                  {slugStatus === "taken" && (
                    <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                      <X className="h-3 w-3" /> Taken
                    </span>
                  )}
                </div>

                <div className={`relative mt-1.5 flex items-center rounded-xl border transition ${
                  slugStatus === "available"
                    ? "border-emerald-500/80 bg-emerald-50/30 dark:bg-emerald-950/20"
                    : slugStatus === "taken" || slugStatus === "invalid"
                    ? "border-rose-500/80 bg-rose-50/30 dark:bg-rose-950/20"
                    : "border-slate-200/90 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/70"
                }`}>
                  <Globe className="absolute left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="deepak-sharma"
                    value={subdomain}
                    onChange={(e) => {
                      setIsManualSlug(true);
                      setSubdomain(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]+/g, "")
                      );
                    }}
                    className="w-full bg-transparent py-2.5 sm:py-3 pl-10 pr-2 font-mono text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none dark:text-white"
                  />
                  <span className="pr-3 text-xs font-mono font-medium text-slate-400 select-none shrink-0">
                    .propertysnaps.in
                  </span>
                </div>

                {/* Subdomain Helper & Suggestions */}
                {slugStatus === "available" && (
                  <p className="mt-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    ✓ Your link will be: <strong>{subdomain}.propertysnaps.in</strong>
                  </p>
                )}
                {slugStatus === "taken" && (
                  <div className="mt-1.5 space-y-1">
                    <p className="text-[11px] font-medium text-rose-500">
                      ✕ {slugReason}
                    </p>
                    {slugSuggestions.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-0.5">
                        <span className="text-[10px] text-slate-400">Suggestions:</span>
                        {slugSuggestions.map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => {
                              setIsManualSlug(true);
                              setSubdomain(sug);
                            }}
                            className="rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-400 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                          >
                            +{sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {slugStatus === "invalid" && (
                  <p className="mt-1 text-[11px] text-rose-500 font-medium">
                    ✕ {slugReason}
                  </p>
                )}
                {slugStatus === "idle" && (
                  <p className="mt-1 text-[11px] text-slate-400">
                    Your link: <strong>{subdomain || "yourname"}.propertysnaps.in</strong>
                  </p>
                )}
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
                disabled={loading || !fullName.trim() || !subdomain.trim() || slugStatus === "taken" || slugStatus === "invalid" || slugStatus === "checking" || !isValidPhone || password.length < 6}
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
