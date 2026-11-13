import fs from "fs";
import path from "path";
import { DEMO_BROKER } from "./store";
import { Profile } from "@/types/database";

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
export function saveOtp(phone: string, code: string): void {
  const cleanPhone = phone.replace(/\D/g, "");
  const store = ensureStore<Record<string, OtpEntry>>(otpFile, {});
  store[cleanPhone] = {
    phone: cleanPhone,
    code,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  };
  saveStore(otpFile, store);
}

export function verifyOtp(phone: string, code: string): boolean {
  const cleanPhone = phone.replace(/\D/g, "");
  const store = ensureStore<Record<string, OtpEntry>>(otpFile, {});
  const entry = store[cleanPhone];
  if (!entry) return false;

  const isValid = entry.code === code.trim() && Date.now() < entry.expiresAt;
  if (isValid) {
    delete store[cleanPhone];
    saveStore(otpFile, store);
  }
  return isValid;
}

// ------------------------------------------------------------------
// Active Phone Sessions Store
// ------------------------------------------------------------------
export function createPhoneSession(phone: string, customProfile?: Partial<Profile>): PhoneSession {
  const cleanPhone = phone.replace(/\D/g, "");
  const store = ensureStore<Record<string, PhoneSession>>(sessionsFile, {});
  const sessionId = "sess_" + Math.random().toString(36).substring(2) + Date.now().toString(36);

  const profile: Profile = {
    id: "prof_" + cleanPhone,
    user_id: "usr_" + cleanPhone,
    full_name: customProfile?.full_name || "Real Estate Broker",
    slug: customProfile?.slug || "broker-" + cleanPhone.slice(-4),
    phone_number: "+" + cleanPhone,
    company_name: customProfile?.company_name || "Exclusive Advisory",
    city: customProfile?.city || "India",
    avatar_url: customProfile?.avatar_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80",
    plan_tier: "solo_pro",
    listing_credits: 25,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const session: PhoneSession = {
    sessionId,
    phone: cleanPhone,
    profile,
    createdAt: Date.now(),
  };

  store[sessionId] = session;
  saveStore(sessionsFile, store);
  return session;
}

export function getPhoneSession(sessionId: string): PhoneSession | null {
  if (!sessionId) return null;
  const store = ensureStore<Record<string, PhoneSession>>(sessionsFile, {});
  return store[sessionId] || null;
}

export function deletePhoneSession(sessionId: string): void {
  if (!sessionId) return;
  const store = ensureStore<Record<string, PhoneSession>>(sessionsFile, {});
  delete store[sessionId];
  saveStore(sessionsFile, store);
}

