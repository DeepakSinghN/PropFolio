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
    } catch {}
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
    company_name: customProfile?.company_name || "Exclusive Advisory",
    city: customProfile?.city || "India",
    avatar_url: customProfile?.avatar_url || "/brand-logo.png",
    plan_tier: "solo_pro",
    listing_credits: 30,
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
  } catch {}

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
  } catch {}
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
    phone_number: customProfile?.phone_number || (isEmail ? "+91 9876543210" : "+" + cleanKey),
    email: isEmail ? cleanKey : customProfile?.email,
    company_name: customProfile?.company_name || "Exclusive Advisory",
    city: customProfile?.city || "India",
    avatar_url: customProfile?.avatar_url || "/brand-logo.png",
    plan_tier: "solo_pro",
    listing_credits: 30,
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


