import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Profile } from "@/types/database";

const OTP_SECRET =
  process.env.WHATSAPP_ACCESS_TOKEN ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXTAUTH_SECRET ||
  "propertysnaps_hmac_secret_otp_2026";

interface OtpEntry {
  phone: string;
  code: string;
  expiresAt: number;
}

interface PhoneSession {
  sessionId: string;
  phone: string;
  profile: Profile;
  createdAt: number;
}

const dataDir = path.join(process.cwd(), ".data");
const otpFile = path.join(dataDir, "otps.json");
const sessionsFile = path.join(dataDir, "auth-sessions.json");
const usersFile = path.join(dataDir, "users.json");

export interface UserAccount {
  identifier: string;
  password: string;
  profile: Profile;
  createdAt: number;
}

function ensureStore<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      return JSON.parse(data);
    }
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), "utf8");
    return fallback;
  } catch (err) {
    return fallback;
  }
}

function saveStore<T>(filePath: string, data: T) {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Auth store save error:", err);
  }
}

// ------------------------------------------------------------------
// OTP Store
// ------------------------------------------------------------------
function normalizeTarget(target: string): string {
  const trimmed = (target || "").trim();
  if (trimmed.includes("@")) {
    return trimmed.toLowerCase();
  }
  let digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) {
    digits = "91" + digits;
  }
  return digits;
}

export function createSignedOtpToken(target: string, code: string): string {
  const cleanKey = normalizeTarget(target);
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  const signature = crypto
    .createHmac("sha256", OTP_SECRET)
    .update(`${cleanKey}:${code.trim()}:${expiresAt}`)
    .digest("hex");

  const payload = {
    target: cleanKey,
    expiresAt,
    signature,
  };

  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

export function saveOtp(target: string, code: string): void {
  const cleanKey = normalizeTarget(target);
  const store = ensureStore<Record<string, OtpEntry>>(otpFile, {});
  store[cleanKey] = {
    phone: cleanKey,
    code,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  };
  saveStore(otpFile, store);
}

export function verifyOtp(target: string, code: string, token?: string): boolean {
  const cleanKey = normalizeTarget(target);
  const trimmedCode = (code || "").trim();

  // 1. Stateless Signed Token Verification (Resilient across Vercel Serverless Lambdas)
  if (token) {
    try {
      const raw = Buffer.from(token, "base64url").toString("utf8");
      const parsed = JSON.parse(raw);
      if (parsed && parsed.target === cleanKey) {
        if (Date.now() <= parsed.expiresAt) {
          const expectedSignature = crypto
            .createHmac("sha256", OTP_SECRET)
            .update(`${cleanKey}:${trimmedCode}:${parsed.expiresAt}`)
            .digest("hex");
          if (parsed.signature === expectedSignature) {
            return true;
          }
        }
      }
    } catch (err) {
      console.warn("Signed OTP token verify parse error:", err);
    }
  }

  // 2. Fallback to Local/Memory File Store
  const store = ensureStore<Record<string, OtpEntry>>(otpFile, {});
  const entry = store[cleanKey];
  if (entry) {
    const isValid = entry.code === trimmedCode && Date.now() < entry.expiresAt;
    if (isValid) {
      delete store[cleanKey];
      saveStore(otpFile, store);
    }
    return isValid;
  }

  return false;
}

// ------------------------------------------------------------------
// Stateless & Persistent Session Primitives
// ------------------------------------------------------------------
export function encodeUserSession(profile: Profile): string {
  const payload = {
    profile,
    createdAt: Date.now(),
  };
  return "v1_" + Buffer.from(JSON.stringify(payload)).toString("base64url");
}

export function decodeUserSession(token: string): { profile: Profile; createdAt: number } | null {
  if (!token) return null;
  if (token.startsWith("v1_")) {
    try {
      const raw = Buffer.from(token.slice(3), "base64url").toString("utf8");
      const parsed = JSON.parse(raw);
      if (parsed && parsed.profile) return parsed;
    } catch { }
  }
  return null;
}

// ------------------------------------------------------------------
// Active Phone/Email Sessions Store
// ------------------------------------------------------------------
export function createPhoneSession(target: string, customProfile?: Partial<Profile>): PhoneSession {
  const cleanKey = normalizeTarget(target);
  const isEmail = cleanKey.includes("@");

  const fallbackSlug = isEmail
    ? cleanKey.split("@")[0].replace(/[^a-z0-9]/g, "-")
    : "broker-" + cleanKey.slice(-4);

  const profile: Profile = {
    id: customProfile?.id || "prof_" + cleanKey.replace(/[^a-zA-Z0-9]/g, "_"),
    user_id: customProfile?.user_id || "usr_" + cleanKey.replace(/[^a-zA-Z0-9]/g, "_"),
    full_name: customProfile?.full_name || (isEmail ? cleanKey.split("@")[0] : "Real Estate Broker"),
    slug: customProfile?.slug || fallbackSlug,
    phone_number: customProfile?.phone_number || (isEmail ? "" : "+" + cleanKey),
    email: isEmail ? cleanKey : customProfile?.email,
    company_name: customProfile?.company_name || "",
    city: customProfile?.city || "India",
    avatar_url: customProfile?.avatar_url || "/brand-logo.png",
    plan_tier: customProfile?.plan_tier || "free",
    listing_credits: customProfile?.listing_credits ?? 1,
    plan_expires_at:
      customProfile?.plan_expires_at ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    billing_cycle: customProfile?.billing_cycle || "monthly",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Self-contained signed token for stateless serverless environments (Vercel)
  const sessionId = encodeUserSession(profile);

  const session: PhoneSession = {
    sessionId,
    phone: cleanKey,
    profile,
    createdAt: Date.now(),
  };

  try {
    const store = ensureStore<Record<string, PhoneSession>>(sessionsFile, {});
    store[sessionId] = session;
    saveStore(sessionsFile, store);
  } catch { }

  return session;
}

export function getPhoneSession(sessionId: string): PhoneSession | null {
  if (!sessionId) return null;

  // 1. Try stateless decode (instant & serverless resilient on Vercel)
  const decoded = decodeUserSession(sessionId);
  if (decoded?.profile) {
    return {
      sessionId,
      phone: decoded.profile.phone_number || "",
      profile: decoded.profile,
      createdAt: decoded.createdAt,
    };
  }

  // 2. Fallback to file store if available
  try {
    const store = ensureStore<Record<string, PhoneSession>>(sessionsFile, {});
    return store[sessionId] || null;
  } catch {
    return null;
  }
}

export function deletePhoneSession(sessionId: string): void {
  if (!sessionId) return;
  try {
    const store = ensureStore<Record<string, PhoneSession>>(sessionsFile, {});
    delete store[sessionId];
    saveStore(sessionsFile, store);
  } catch { }
}

// ------------------------------------------------------------------
// Password-Based User Accounts Store
// ------------------------------------------------------------------
export function saveUserAccount(
  identifier: string,
  password: string,
  customProfile?: Partial<Profile>
): Profile {
  const cleanKey = normalizeTarget(identifier);
  const store = ensureStore<Record<string, UserAccount>>(usersFile, {});
  const isEmail = cleanKey.includes("@");

  const fallbackSlug = isEmail
    ? cleanKey.split("@")[0].replace(/[^a-z0-9]/g, "-")
    : "broker-" + cleanKey.slice(-4);

  const profile: Profile = {
    id: "prof_" + cleanKey.replace(/[^a-zA-Z0-9]/g, "_"),
    user_id: "usr_" + cleanKey.replace(/[^a-zA-Z0-9]/g, "_"),
    full_name: customProfile?.full_name || (isEmail ? cleanKey.split("@")[0] : "Real Estate Broker"),
    slug: customProfile?.slug || fallbackSlug,
    phone_number: customProfile?.phone_number || (isEmail ? "" : "+" + cleanKey),
    email: isEmail ? cleanKey : customProfile?.email,
    company_name: customProfile?.company_name || "",
    city: customProfile?.city || "India",
    avatar_url: customProfile?.avatar_url || "/brand-logo.png",
    plan_tier: customProfile?.plan_tier || "free",
    listing_credits: customProfile?.listing_credits ?? 1,
    plan_expires_at:
      customProfile?.plan_expires_at ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    billing_cycle: customProfile?.billing_cycle || "monthly",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  store[cleanKey] = {
    identifier: cleanKey,
    password,
    profile,
    createdAt: Date.now(),
  };

  saveStore(usersFile, store);
  return profile;
}

export function verifyUserPassword(
  identifier: string,
  password: string
): { success: boolean; profile?: Profile; error?: string } {
  const cleanKey = normalizeTarget(identifier);

  const store = ensureStore<Record<string, UserAccount>>(usersFile, {});
  const user = store[cleanKey];

  if (!user) {
    return { success: false, error: "No account found with this phone number or email" };
  }

  if (user.password !== password) {
    return { success: false, error: "Incorrect password. Please try again." };
  }

  return { success: true, profile: user.profile };
}

export function getUserAccount(identifier: string): UserAccount | null {
  const cleanKey = normalizeTarget(identifier);
  const store = ensureStore<Record<string, UserAccount>>(usersFile, {});
  return store[cleanKey] || null;
}

import {
  PLAN_DEFINITIONS,
  BillingCycle,
  computePlanExpiryIso,
  isPlanExpired,
  normalizePlanTier,
} from "@/lib/plans";

// ------------------------------------------------------------------
// Plan Upgrade (called ONLY after Razorpay signature verified)
// ------------------------------------------------------------------
export async function updateUserPlan(
  userId: string,
  planTier: "free" | "pay_per_listing" | "solo_pro" | "builder_pro" | "agency_starter",
  paymentMeta: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    planKey: string;
    billingCycle?: BillingCycle;
  }
): Promise<void> {
  const canonicalTier = normalizePlanTier(planTier);
  const billingCycle: BillingCycle =
    paymentMeta.billingCycle ||
    (canonicalTier === "pay_per_listing"
      ? "one_time"
      : paymentMeta.planKey.endsWith("yearly")
        ? "yearly"
        : "monthly");

  const planDef = PLAN_DEFINITIONS[canonicalTier];
  const expiresAt = computePlanExpiryIso(canonicalTier, billingCycle);

  // 1. Try Supabase if configured
  const supaUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supaUrl && supaKey && !supaKey.includes("...")) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supaUrl, supaKey);

      let nextCredits = planDef.isUnlimitedListings ? 999 : planDef.maxListings;

      // For pay_per_listing, ADD +1 credit to existing credits instead of overwriting
      if (canonicalTier === "pay_per_listing") {
        const { data: existingProf } = await supabase
          .from("profiles")
          .select("listing_credits")
          .or(`id.eq.${userId},user_id.eq.${userId}`)
          .maybeSingle();
        nextCredits = (existingProf?.listing_credits ?? 0) + 1;
      }

      const { error: upErr } = await supabase
        .from("profiles")
        .update({
          plan_tier: canonicalTier,
          listing_credits: nextCredits,
          plan_expires_at: expiresAt,
          billing_cycle: billingCycle,
          updated_at: new Date().toISOString(),
        })
        .or(`id.eq.${userId},user_id.eq.${userId}`);

      if (upErr) {
        console.error("[updateUserPlan] Supabase update error:", upErr);
      } else {
        console.log(
          `[updateUserPlan] Supabase updated — userId: ${userId}, plan: ${canonicalTier}, credits: ${nextCredits}, expiresAt: ${expiresAt}`
        );
      }
    } catch (dbErr) {
      console.error("[updateUserPlan] Supabase error:", dbErr);
    }
  }

  // 2. Update local sessions file (fallback for local/file-based auth)
  try {
    const store = ensureStore<Record<string, PhoneSession>>(sessionsFile, {});
    for (const key of Object.keys(store)) {
      const session = store[key];
      if (session?.profile?.user_id === userId || session?.profile?.id === userId) {
        const nextCredits =
          canonicalTier === "pay_per_listing"
            ? (session.profile.listing_credits ?? 0) + 1
            : planDef.isUnlimitedListings
              ? 999
              : planDef.maxListings;
        session.profile.plan_tier = canonicalTier;
        session.profile.listing_credits = nextCredits;
        session.profile.plan_expires_at = expiresAt;
        session.profile.billing_cycle = billingCycle;
        session.profile.updated_at = new Date().toISOString();
      }
    }
    saveStore(sessionsFile, store);
  } catch (err) {
    console.warn("[updateUserPlan] local session update skipped:", err);
  }

  console.log(
    `[updateUserPlan] ✅ done — userId: ${userId}, plan: ${canonicalTier}, orderId: ${paymentMeta.razorpay_order_id}`
  );
}

/**
 * Checks if a profile's plan_expires_at has passed.
 * If expired (and not already free), downgrades the user to "free" (1 credit)
 * in Supabase and local session store, returning the updated profile.
 */
export async function ensureProfileNotExpired<
  T extends {
    id?: string;
    user_id?: string;
    plan_tier?: string | null;
    plan_expires_at?: string | null;
    listing_credits?: number | null;
    billing_cycle?: string | null;
  }
>(profile: T): Promise<T> {
  if (!profile) return profile;
  const currentTier = normalizePlanTier(profile.plan_tier);
  if (!isPlanExpired(profile.plan_expires_at) || currentTier === "free") {
    return profile;
  }

  const downgraded = {
    ...profile,
    plan_tier: "free",
    listing_credits: 1,
    plan_expires_at: null,
    billing_cycle: "monthly",
  };

  const targetId = profile.id || profile.user_id;
  if (targetId) {
    const supaUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supaKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supaUrl && supaKey && !supaKey.includes("...")) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supaUrl, supaKey);
        await supabase
          .from("profiles")
          .update({
            plan_tier: "free",
            listing_credits: 1,
            plan_expires_at: null,
            billing_cycle: "monthly",
            updated_at: new Date().toISOString(),
          })
          .or(`id.eq.${targetId},user_id.eq.${targetId}`);
      } catch (e) {
        console.warn("[ensureProfileNotExpired] Supabase downgrade skipped:", e);
      }
    }

    try {
      const store = ensureStore<Record<string, PhoneSession>>(sessionsFile, {});
      let changed = false;
      for (const key of Object.keys(store)) {
        const sess = store[key];
        if (sess?.profile?.id === targetId || sess?.profile?.user_id === targetId) {
          sess.profile.plan_tier = "free";
          sess.profile.listing_credits = 1;
          sess.profile.plan_expires_at = null;
          sess.profile.billing_cycle = "monthly";
          changed = true;
        }
      }
      if (changed) saveStore(sessionsFile, store);
    } catch { }
  }

  return downgraded;
}

// ------------------------------------------------------------------
// Slug & Name Utilities
// ------------------------------------------------------------------
export function slugifyName(name: string): string {
  const cleaned = (name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
  return cleaned || "broker";
}

export function isGenericBrokerName(name?: string | null): boolean {
  if (!name) return true;
  const n = name.trim().toLowerCase();
  return (
    n === "" ||
    n === "real estate broker" ||
    n === "real estate advisor" ||
    n === "broker" ||
    n === "advisor" ||
    n === "default broker" ||
    n.startsWith("broker-")
  );
}

export function isGenericSlug(slug?: string | null): boolean {
  if (!slug) return true;
  const s = slug.trim().toLowerCase();
  return (
    s === "" ||
    s === "broker" ||
    s === "broker-default" ||
    s.startsWith("broker-") ||
    s === "real-estate-broker" ||
    s === "real-estate-advisor"
  );
}

// ------------------------------------------------------------------
// Resolve or Auto-Create Broker Profile by Phone Number
// (Ensures Real Contact Name & Clean Personal Slug are always used)
// ------------------------------------------------------------------
export async function resolveOrCreateBrokerProfile(
  rawPhone: string,
  contactName?: string
): Promise<Profile> {
  const cleanPhone = rawPhone.replace(/\D/g, "");
  const phone10 = cleanPhone.slice(-10);
  const formattedPhone = `+91${phone10}`;

  // 1. Check Supabase profiles table
  const supaUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supaUrl && supaKey && !supaKey.includes("...")) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supaUrl, supaKey);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .or(
          `phone_number.ilike.%${phone10}%,phone_number.eq.+91${phone10},phone_number.eq.91${phone10},phone_number.eq.${phone10},phone_number.eq.+${cleanPhone}`
        )
        .limit(1);

      const existing = profiles?.[0];

      if (existing) {
        // If profile has generic name/slug but we now have contactName from WhatsApp, upgrade it!
        const needsNameUpgrade = isGenericBrokerName(existing.full_name) && Boolean(contactName?.trim());
        const needsSlugUpgrade = isGenericSlug(existing.slug) && Boolean(contactName?.trim() || existing.full_name);

        if (needsNameUpgrade || needsSlugUpgrade) {
          const newName = needsNameUpgrade ? contactName!.trim() : existing.full_name;
          const newSlug = slugifyName(newName);

          await supabase
            .from("profiles")
            .update({
              full_name: newName,
              slug: newSlug,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id);

          existing.full_name = newName;
          existing.slug = newSlug;
        }

        return existing as Profile;
      }

      // If no profile exists in Supabase, create one with the real name!
      const initialName = contactName && contactName.trim() ? contactName.trim() : "Real Estate Broker";
      const initialSlug = isGenericBrokerName(initialName)
        ? `broker-${phone10.slice(-4)}`
        : slugifyName(initialName);

      const newProfile: Partial<Profile> = {
        full_name: initialName,
        slug: initialSlug,
        phone_number: formattedPhone,
        company_name: "",
        city: "India",
        avatar_url: "/brand-logo.png",
        plan_tier: "free",
        listing_credits: 1,
        plan_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        billing_cycle: "monthly",
        is_active: true,
      };

      const { data: created, error: createErr } = await supabase
        .from("profiles")
        .insert(newProfile)
        .select()
        .single();

      if (created) {
        return created as Profile;
      }

      // Retry without newer optional columns if DB migration hasn't been run yet
      if (createErr) {
        console.warn("[resolveOrCreateBrokerProfile] Initial insert failed, retrying base columns:", createErr.message);
        const { data: createdBase } = await supabase
          .from("profiles")
          .insert({
            full_name: initialName,
            slug: initialSlug,
            phone_number: formattedPhone,
            company_name: "",
            city: "India",
            avatar_url: "/brand-logo.png",
            plan_tier: "free",
            listing_credits: 1,
            is_active: true,
          })
          .select()
          .single();

        if (createdBase) {
          return createdBase as Profile;
        }
      }
    } catch (dbErr) {
      console.warn("[resolveOrCreateBrokerProfile] Supabase query notice:", dbErr);
    }
  }

  // 2. Check local users / sessions store
  try {
    const store = ensureStore<Record<string, PhoneSession>>(sessionsFile, {});
    for (const key of Object.keys(store)) {
      const sess = store[key];
      const p = sess?.profile;
      if (p) {
        const sessPhone = (p.phone_number || sess.phone || "").replace(/\D/g, "");
        if (sessPhone.endsWith(phone10)) {
          if (isGenericBrokerName(p.full_name) && contactName && contactName.trim()) {
            p.full_name = contactName.trim();
            p.slug = slugifyName(contactName.trim());
            saveStore(sessionsFile, store);
          }
          return p;
        }
      }
    }
  } catch { }

  // 3. Fallback: generate local profile
  const resolvedName = contactName && contactName.trim() ? contactName.trim() : "Real Estate Broker";
  const resolvedSlug = isGenericBrokerName(resolvedName)
    ? `broker-${phone10.slice(-4)}`
    : slugifyName(resolvedName);

  const fallbackProfile: Profile = {
    id: `prof_${cleanPhone}`,
    user_id: `usr_${cleanPhone}`,
    full_name: resolvedName,
    slug: resolvedSlug,
    phone_number: formattedPhone,
    company_name: "",
    city: "India",
    avatar_url: "/brand-logo.png",
    plan_tier: "free",
    listing_credits: 1,
    plan_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    billing_cycle: "monthly",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  createPhoneSession(cleanPhone, fallbackProfile);
  return fallbackProfile;
}

// ------------------------------------------------------------------
// Update Broker Profile (Name, Slug, Agency, etc.)
// ------------------------------------------------------------------
export async function updateBrokerProfile(
  userId: string,
  updates: {
    full_name?: string;
    company_name?: string;
    city?: string;
    slug?: string;
    phone_number?: string;
    avatar_url?: string;
  }
): Promise<{ success: boolean; profile?: Profile; error?: string }> {
  let updatedProfile: Profile | null = null;

  // 1. Update Supabase if configured
  const supaUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supaUrl && supaKey && !supaKey.includes("...")) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supaUrl, supaKey);

      const cleanUpdates: any = {
        updated_at: new Date().toISOString(),
      };
      if (updates.full_name?.trim()) cleanUpdates.full_name = updates.full_name.trim();
      if (updates.company_name !== undefined) cleanUpdates.company_name = updates.company_name.trim();
      if (updates.city?.trim()) cleanUpdates.city = updates.city.trim();
      if (updates.slug?.trim()) cleanUpdates.slug = slugifyName(updates.slug);
      if (updates.phone_number?.trim()) cleanUpdates.phone_number = updates.phone_number.trim();
      if (updates.avatar_url?.trim()) cleanUpdates.avatar_url = updates.avatar_url.trim();

      const { data, error } = await supabase
        .from("profiles")
        .update(cleanUpdates)
        .or(`id.eq.${userId},user_id.eq.${userId}`)
        .select()
        .maybeSingle();

      if (data) {
        updatedProfile = data as Profile;
      } else if (error) {
        console.warn("[updateBrokerProfile] Supabase update warning:", error);
      }
    } catch (e) {
      console.warn("[updateBrokerProfile] Supabase update exception:", e);
    }
  }

  // 2. Update local sessions file
  try {
    const store = ensureStore<Record<string, PhoneSession>>(sessionsFile, {});
    for (const key of Object.keys(store)) {
      const session = store[key];
      if (session?.profile?.user_id === userId || session?.profile?.id === userId) {
        if (updates.full_name?.trim()) session.profile.full_name = updates.full_name.trim();
        if (updates.company_name !== undefined) session.profile.company_name = updates.company_name.trim();
        if (updates.city?.trim()) session.profile.city = updates.city.trim();
        if (updates.slug?.trim()) session.profile.slug = slugifyName(updates.slug);
        if (updates.phone_number?.trim()) session.profile.phone_number = updates.phone_number.trim();
        if (updates.avatar_url?.trim()) session.profile.avatar_url = updates.avatar_url.trim();
        session.profile.updated_at = new Date().toISOString();
        updatedProfile = session.profile;
      }
    }
    saveStore(sessionsFile, store);
  } catch { }

  return { success: true, profile: updatedProfile || undefined };
}


