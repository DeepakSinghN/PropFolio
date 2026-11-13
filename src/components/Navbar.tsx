"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, Sparkles, LayoutDashboard, LogIn, LogOut } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

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

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
    router.push("/login");
    router.refresh();
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
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-[#f8f9fa]/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#070b14]/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo - Sotheby's Royal Style */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a1128] text-[#c5a059] border border-[#c5a059]/30 shadow-md shadow-[#0a1128]/15 dark:bg-[#0f182e] dark:text-[#d4af37]">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-[#0a1128] dark:text-white">
                Prop<span className="text-[#c5a059] dark:text-[#d4af37]">Folio</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Private Office AI
              </span>
            </div>
          </Link>

          {/* Navigation Links for Desktop */}
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

        {/* Action Links */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <ThemeToggle />

          {currentUser ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-[#0a1128] transition hover:border-[#c5a059] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                <LayoutDashboard className="h-4 w-4 text-[#c5a059]" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                title="Logout"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-rose-600 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-rose-400 pointer-events-auto"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#0a1128] shadow-sm transition hover:border-[#c5a059] hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-[#c5a059]"
            >
              <LogIn className="h-3.5 w-3.5 text-[#c5a059]" />
              <span>Sign In</span>
            </Link>
          )}

          <Link
            href="/dashboard/listings/new"
            className="flex items-center gap-2 rounded-xl bg-[#0a1128] px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#0a1128]/20 border border-[#c5a059]/40 transition-all hover:bg-[#16234b] active:scale-95 dark:bg-[#0f182e] dark:hover:bg-[#1b2746]"
          >
            <Sparkles className="h-4 w-4 text-[#c5a059] dark:text-[#d4af37]" />
            <span className="hidden sm:inline">Create Listing</span>
            <span className="sm:hidden">+ New</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
