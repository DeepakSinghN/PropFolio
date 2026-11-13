"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  Sparkles,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  X,
  CreditCard,
  Headphones,
  User,
  ChevronRight,
  Sun,
  Moon
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Sync auth state
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => setCurrentUser(null));
  }, [pathname]);

  // Sync dark mode state for mobile menu toggle
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
    setMobileMenuOpen(false);
    router.push("/login");
    router.refresh();
  };

  const toggleTheme = () => {
    const nextDark = !isDark;
    if (nextDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      try {
        localStorage.setItem("propfolio-theme", "dark");
      } catch (err) {}
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      try {
        localStorage.setItem("propfolio-theme", "light");
      } catch (err) {}
    }
    setIsDark(nextDark);
  };

  // Standalone legal readers have their own focused top bar
  const isStandaloneDoc =
    pathname === "/privacy" ||
    pathname === "/terms" ||
    pathname === "/refund";

  // Hide global app navbar on public broker micro-sites (e.g. /ramesh/3-bhk-satellite-ahmedabad)
  const isPublicListing =
    pathname &&
    pathname !== "/" &&
    pathname !== "/pricing" &&
    pathname !== "/contact" &&
    !pathname.startsWith("/dashboard") &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/signup") &&
    !pathname.startsWith("/api");

  if (isStandaloneDoc || isPublicListing) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-[#f8f9fa]/95 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#070b14]/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3.5 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6 lg:gap-8 min-w-0">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 transition-opacity hover:opacity-90 shrink-0">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-[#0a1128] text-[#c5a059] border border-[#c5a059]/30 shadow-md shadow-[#0a1128]/15 dark:bg-[#0f182e] dark:text-[#d4af37]">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-[#0a1128] dark:text-white leading-tight">
                Prop<span className="text-[#c5a059] dark:text-[#d4af37]">Folio</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Private Office AI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <Link
              href="/pricing"
              className={`transition hover:text-[#0a1128] dark:hover:text-white ${
                pathname === "/pricing" ? "text-[#c5a059] font-bold dark:text-[#c5a059]" : ""
              }`}
            >
              Pricing & Plans
            </Link>
            <Link
              href="/contact"
              className={`transition hover:text-[#0a1128] dark:hover:text-white ${
                pathname === "/contact" ? "text-[#c5a059] font-bold dark:text-[#c5a059]" : ""
              }`}
            >
              Contact Support
            </Link>
          </nav>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          
          {/* Desktop Only: Theme Toggle */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {/* Desktop Only: Logged-in Dashboard & Logout */}
          {currentUser ? (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#0a1128] transition hover:border-[#c5a059] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 ${
                  pathname === "/dashboard" ? "border-[#c5a059] bg-[#fbf6ec]/40 dark:bg-slate-800" : ""
                }`}
              >
                <LayoutDashboard className="h-4 w-4 text-[#c5a059]" />
                <span>Dashboard</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                title="Logout"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-rose-600 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-rose-400"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#0a1128] shadow-sm transition hover:border-[#c5a059] hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                <LogIn className="h-3.5 w-3.5 text-[#c5a059]" />
                <span>Sign In</span>
              </Link>
            </div>
          )}

          {/* Primary CTA (Always visible, adapts on mobile) */}
          <Link
            href="/dashboard/listings/new"
            className="flex items-center gap-1.5 rounded-xl bg-[#0a1128] px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#0a1128]/15 border border-[#c5a059]/40 transition hover:bg-[#16234b] active:scale-95 dark:bg-[#c5a059] dark:text-[#0a1128] dark:hover:bg-[#d4af37]"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#c5a059] dark:text-[#0a1128]" />
            <span className="hidden sm:inline">Create Listing</span>
            <span className="sm:hidden text-xs font-bold">+ New</span>
          </Link>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-[#0a1128] shadow-sm transition hover:border-[#c5a059] active:scale-90 dark:border-slate-800 dark:bg-[#0f182e] dark:text-slate-200"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-[#c5a059]" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Down Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 z-50 md:hidden border-b border-slate-200 bg-white/95 backdrop-blur-xl shadow-2xl dark:border-slate-800 dark:bg-[#070b14]/95 animate-in slide-in-from-top-2 duration-200">
          <div className="max-h-[calc(100vh-4rem)] overflow-y-auto px-4 py-5 space-y-4">
            
            {/* User Profile Card (if logged in) */}
            {currentUser ? (
              <div className="rounded-2xl border border-slate-200/90 bg-[#f8f9fa] p-3.5 dark:border-slate-800 dark:bg-[#0c1222]">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0a1128] text-white font-bold text-sm border border-[#c5a059]/40 dark:bg-[#c5a059] dark:text-[#0a1128]">
                    {currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : "B"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-sm text-[#0a1128] dark:text-white truncate">
                        {currentUser.full_name || "Verified Broker"}
                      </p>
                      <span className="rounded bg-[#fbf6ec] border border-[#e8d7b3] px-1.5 py-0.2 text-[9px] font-bold text-[#8a6828] dark:bg-[#1a1710] dark:border-[#3d331d] dark:text-[#d4af37]">
                        PRO
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {currentUser.phone_number || currentUser.phone || currentUser.company_name || "Active Broker Session"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200/90 bg-[#f8f9fa] p-3.5 dark:border-slate-800 dark:bg-[#0c1222]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[#0a1128] dark:text-white">Join PropFolio Pro</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Build instant luxury real estate micro-sites</p>
                  </div>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl bg-[#0a1128] px-3.5 py-2 text-xs font-bold text-white shadow-sm dark:bg-[#c5a059] dark:text-[#0a1128]"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <div className="space-y-1">
              <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Navigation
              </p>

              {currentUser && (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    pathname === "/dashboard"
                      ? "bg-[#0a1128] text-white dark:bg-[#c5a059] dark:text-[#0a1128]"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className="h-4 w-4 text-[#c5a059]" />
                    <span>My Dashboard</span>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </Link>
              )}

              <Link
                href="/dashboard/listings/new"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  pathname === "/dashboard/listings/new"
                    ? "bg-[#0a1128] text-white dark:bg-[#c5a059] dark:text-[#0a1128]"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-[#c5a059]" />
                  <span>Create New Listing (AI)</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </Link>

              <Link
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  pathname === "/pricing"
                    ? "bg-[#0a1128] text-white dark:bg-[#c5a059] dark:text-[#0a1128]"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-[#c5a059]" />
                  <span>Pricing & Plans</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </Link>

              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  pathname === "/contact"
                    ? "bg-[#0a1128] text-white dark:bg-[#c5a059] dark:text-[#0a1128]"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Headphones className="h-4 w-4 text-[#c5a059]" />
                  <span>Contact Support</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </Link>
            </div>

            {/* Quick Settings & Actions */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              {/* Theme Toggle in Mobile Menu */}
              <div className="flex items-center justify-between rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-900/60">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isDark ? (
                    <Moon className="h-4 w-4 text-[#d4af37]" />
                  ) : (
                    <Sun className="h-4 w-4 text-[#c5a059]" />
                  )}
                  <span>Appearance</span>
                </div>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-[#0a1128] shadow-sm transition hover:border-[#c5a059] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {isDark ? "Dark Theme" : "Light Theme"}
                </button>
              </div>

              {/* Logout / Login Button */}
              {currentUser ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200/80 bg-rose-50/50 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-400"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out of PropFolio</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a1128] py-2.5 text-xs font-bold text-white shadow-sm dark:bg-[#c5a059] dark:text-[#0a1128]"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
