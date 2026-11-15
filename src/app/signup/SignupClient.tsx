"use client";

import { useState } from "react";
import Link from "next/link";
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
  Mail,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function SignupClient() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Profile & Credentials fields
  const [fullName, setFullName] = useState("");
  const [contactInput, setContactInput] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [city, setCity] = useState("");
  const [companyName, setCompanyName] = useState("");

  // Contact validation
  const isEmail = contactInput.includes("@");
  const isValidContact = isEmail
    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInput.trim())
    : contactInput.replace(/\D/g, "").length >= 10;

  // Handle Signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!isValidContact) {
      setErrorMsg("Please enter a valid 10-digit mobile number or email address");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          identifier: contactInput.trim(),
          password,
          city: city.trim(),
          company_name: companyName.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create account");

      // Successful signup, redirect directly to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create your account");
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
            Property<span className="text-amber-600"> Snaps</span>
          </span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg px-4">
        {/* Header Title */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Instant Broker Onboarding</span>
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

          <form onSubmit={handleSignup} className="space-y-4">
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

            {/* Phone number or email */}
            <div>
              <label className="block text-xs font-bold text-zinc-900 dark:text-white">
                Phone number or email
              </label>
              <div className="relative mt-1.5 flex items-center">
                <div className="absolute left-3.5 flex items-center gap-1 text-xs font-bold text-zinc-500">
                  {isEmail ? (
                    <Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
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
                  placeholder="e.g. 98765 43210 or broker@realty.com"
                  value={contactInput}
                  onChange={(e) => setContactInput(e.target.value)}
                  className={`w-full rounded-2xl border border-zinc-200 bg-[#fafaf9] py-3 text-sm font-semibold text-zinc-900 shadow-sm transition outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white ${
                    isEmail ? "pl-11 pr-4" : "pl-16 pr-4"
                  }`}
                />
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                {isEmail
                  ? "Used to log in to your account and receive buyer leads."
                  : "Connects your WhatsApp bot listings directly to your account."}
              </p>
            </div>

            {/* Create Password */}
            <div>
              <label className="block text-xs font-bold text-zinc-900 dark:text-white">
                Create Password
              </label>
              <div className="relative mt-1.5 flex items-center">
                <Lock className="absolute left-3.5 h-4 w-4 text-zinc-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200 bg-[#fafaf9] py-3 pl-10 pr-11 text-sm font-semibold text-zinc-900 shadow-sm transition outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
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
              disabled={loading || !fullName.trim() || !isValidContact || password.length < 6}
              className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Create Account & Open Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Switcher */}
          <div className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-amber-600 hover:underline dark:text-amber-400"
            >
              Sign in with password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
