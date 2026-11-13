import fs from "fs";
import path from "path";
import { Listing } from "@/types/database";
import { INITIAL_LISTINGS } from "./store";

const dataDir = path.join(process.cwd(), ".data");
const dataFilePath = path.join(dataDir, "listings.json");
const sessionsFilePath = path.join(dataDir, "sessions.json");

function ensureFileStore(): Map<string, Listing> {
  const map = new Map<string, Listing>();
  INITIAL_LISTINGS.forEach((l) => map.set(l.slug, l));

  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (fs.existsSync(dataFilePath)) {
      const content = fs.readFileSync(dataFilePath, "utf8");
      const list: Listing[] = JSON.parse(content);
      list.forEach((l) => map.set(l.slug, l));
    } else {
      fs.writeFileSync(dataFilePath, JSON.stringify(INITIAL_LISTINGS, null, 2), "utf8");
    }
  } catch (err) {
    console.error("Server store read error:", err);
  }

  return map;
}

export function saveListingToDisk(listing: Listing) {
  const map = ensureFileStore();
  map.set(listing.slug, listing);

  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const all = Array.from(map.values());
    fs.writeFileSync(dataFilePath, JSON.stringify(all, null, 2), "utf8");
  } catch (err) {
    console.error("Server store write error:", err);
  }
}

export function getListingFromDisk(slug: string): Listing | undefined {
  const map = ensureFileStore();
  return map.get(slug);
}

export function getAllListingsFromDisk(): Listing[] {
  const map = ensureFileStore();
  return Array.from(map.values());
}

// -------------------------------------------------------------
// WhatsApp User Multi-Message Session Store ("done" command buffer)
// -------------------------------------------------------------

export interface UserSession {
  phone: string;
  notes: string[];
  photos: string[];
  askedForPhotos: boolean;
  hasAcknowledged?: boolean;
  updatedAt: number;
}

function loadSessions(): Map<string, UserSession> {
  const map = new Map<string, UserSession>();
  try {
    if (fs.existsSync(sessionsFilePath)) {
      const data: Record<string, UserSession> = JSON.parse(fs.readFileSync(sessionsFilePath, "utf8"));
      Object.entries(data).forEach(([phone, sess]) => map.set(phone, sess));
    }
  } catch (err) {
    console.error("Load sessions error:", err);
  }
  return map;
}

function saveSessions(map: Map<string, UserSession>) {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const obj = Object.fromEntries(map);
    fs.writeFileSync(sessionsFilePath, JSON.stringify(obj, null, 2), "utf8");
  } catch (err) {
    console.error("Save sessions error:", err);
  }
}

export function appendUserSession(phone: string, text?: string, photo?: string): UserSession {
  const map = loadSessions();
  const session = map.get(phone) || {
    phone,
    notes: [],
    photos: [],
    askedForPhotos: false,
    updatedAt: Date.now(),
  };

  if (text && text.trim()) {
    session.notes.push(text.trim());
  }
  if (photo) {
    session.photos.push(photo);
  }
  session.updatedAt = Date.now();

  map.set(phone, session);
  saveSessions(map);
  return session;
}

export function markSessionAcknowledged(phone: string) {
  const map = loadSessions();
  const session = map.get(phone);
  if (session) {
    session.hasAcknowledged = true;
    map.set(phone, session);
    saveSessions(map);
  }
}

export function setSessionAskedForPhotos(phone: string, asked: boolean) {
  const map = loadSessions();
  const session = map.get(phone);
  if (session) {
    session.askedForPhotos = asked;
    map.set(phone, session);
    saveSessions(map);
  }
}

export function getUserSession(phone: string): UserSession | undefined {
  const map = loadSessions();
  return map.get(phone);
}

export function clearUserSession(phone: string) {
  const map = loadSessions();
  map.delete(phone);
  saveSessions(map);
}
