import fs from "fs";
import path from "path";
import os from "os";
import { Listing, PropertyCollection } from "@/types/database";
import { INITIAL_LISTINGS } from "@/lib/store";

// Global cache across serverless warm invocations
const g = globalThis as unknown as {
  __propfolioListingsMap?: Map<string, Listing>;
  __propfolioCollectionsMap?: Map<string, PropertyCollection>;
  __propfolioSessionsMap?: Map<string, UserSession>;
};

function getActiveDataDir(): string {
  // 1. Try project root .data
  const preferred = path.join(process.cwd(), ".data");
  try {
    if (!fs.existsSync(preferred)) {
      fs.mkdirSync(preferred, { recursive: true });
    }
    const testFile = path.join(preferred, ".test-write");
    fs.writeFileSync(testFile, "ok");
    fs.unlinkSync(testFile);
    return preferred;
  } catch {
    // 2. Read-only environment (e.g. Vercel Serverless / AWS Lambda) -> Use os.tmpdir()
    const tmpDir = path.join(os.tmpdir(), "propfolio-data");
    try {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      return tmpDir;
    } catch {
      return os.tmpdir();
    }
  }
}

function getFilePath(filename: string): string {
  return path.join(getActiveDataDir(), filename);
}

function ensureFileStore(): Map<string, Listing> {
  if (g.__propfolioListingsMap) {
    return g.__propfolioListingsMap;
  }

  const map = new Map<string, Listing>();

  const dataFilePath = getFilePath("listings.json");
  try {
    if (fs.existsSync(dataFilePath)) {
      const content = fs.readFileSync(dataFilePath, "utf8");
      const list: Listing[] = JSON.parse(content);
      list.forEach((l) => map.set(l.slug, l));
    } else {
      fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2), "utf8");
    }
  } catch (err) {
    console.warn("Server store read notice:", err);
  }

  g.__propfolioListingsMap = map;
  return map;
}

export function saveListingToDisk(listing: Listing) {
  const map = ensureFileStore();
  map.set(listing.slug, listing);
  g.__propfolioListingsMap = map;

  const dataFilePath = getFilePath("listings.json");
  try {
    const all = Array.from(map.values());
    fs.writeFileSync(dataFilePath, JSON.stringify(all, null, 2), "utf8");
  } catch (err) {
    console.warn("Server store write notice:", err);
  }
}

export function getListingFromDisk(slug: string): Listing | undefined {
  const map = ensureFileStore();
  return map.get(slug) || INITIAL_LISTINGS.find((l) => l.slug === slug);
}

export function getAllListingsFromDisk(): Listing[] {
  const map = ensureFileStore();
  const list = Array.from(map.values());
  const slugs = new Set(list.map((l) => l.slug));
  for (const init of INITIAL_LISTINGS) {
    if (!slugs.has(init.slug)) {
      list.push(init);
    }
  }
  return list;
}

export function deleteListingFromDisk(slug: string): boolean {
  const map = ensureFileStore();
  const deleted = map.delete(slug);
  g.__propfolioListingsMap = map;

  const dataFilePath = getFilePath("listings.json");
  try {
    const all = Array.from(map.values());
    fs.writeFileSync(dataFilePath, JSON.stringify(all, null, 2), "utf8");
  } catch (err) {
    console.warn("Server store delete write notice:", err);
  }

  return deleted;
}

export function updateListingStatusOnDisk(slug: string, status: "active" | "sold" | "draft"): Listing | null {
  const map = ensureFileStore();
  const item = map.get(slug);
  if (!item) return null;

  item.status = status;
  item.updated_at = new Date().toISOString();
  map.set(slug, item);
  g.__propfolioListingsMap = map;

  const dataFilePath = getFilePath("listings.json");
  try {
    const all = Array.from(map.values());
    fs.writeFileSync(dataFilePath, JSON.stringify(all, null, 2), "utf8");
  } catch (err) {
    console.warn("Server store status write notice:", err);
  }

  return item;
}

// -------------------------------------------------------------
// WhatsApp User Multi-Message Session Store ("done" command buffer)
// -------------------------------------------------------------

export interface UserSession {
  phone: string;
  contactName?: string;
  notes: string[];
  photos: string[];
  askedForPhotos: boolean;
  hasAcknowledged?: boolean;
  mediaFailed?: boolean;
  lang?: "en" | "hinglish";
  updatedAt: number;
}

function loadSessions(): Map<string, UserSession> {
  if (g.__propfolioSessionsMap) {
    return g.__propfolioSessionsMap;
  }
  const map = new Map<string, UserSession>();
  const sessionsFilePath = getFilePath("sessions.json");
  try {
    if (fs.existsSync(sessionsFilePath)) {
      const data: Record<string, UserSession> = JSON.parse(fs.readFileSync(sessionsFilePath, "utf8"));
      Object.entries(data).forEach(([phone, sess]) => map.set(phone, sess));
    }
  } catch (err) {
    console.warn("Load sessions notice:", err);
  }
  g.__propfolioSessionsMap = map;
  return map;
}

function saveSessions(map: Map<string, UserSession>) {
  g.__propfolioSessionsMap = map;
  const sessionsFilePath = getFilePath("sessions.json");
  try {
    const obj = Object.fromEntries(map);
    fs.writeFileSync(sessionsFilePath, JSON.stringify(obj, null, 2), "utf8");
  } catch (err) {
    console.warn("Save sessions notice:", err);
  }
}

export function appendUserSession(phone: string, text?: string, photo?: string, contactName?: string): UserSession {
  const map = loadSessions();
  const session = map.get(phone) || {
    phone,
    contactName: contactName?.trim() || undefined,
    notes: [],
    photos: [],
    askedForPhotos: false,
    updatedAt: Date.now(),
  };

  if (contactName && contactName.trim() && !session.contactName) {
    session.contactName = contactName.trim();
  }

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

export function setSessionMediaFailed(phone: string, failed: boolean) {
  const map = loadSessions();
  const session = map.get(phone) || {
    phone,
    notes: [],
    photos: [],
    askedForPhotos: false,
    updatedAt: Date.now(),
  };
  session.mediaFailed = failed;
  session.updatedAt = Date.now();
  map.set(phone, session);
  saveSessions(map);
}

export function setSessionLang(phone: string, lang: "en" | "hinglish") {
  const map = loadSessions();
  const session = map.get(phone);
  if (session) {
    session.lang = lang;
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

// -------------------------------------------------------------
// Curated Property Collections Store
// -------------------------------------------------------------

function ensureCollectionStore(): Map<string, PropertyCollection> {
  if (g.__propfolioCollectionsMap) {
    return g.__propfolioCollectionsMap;
  }

  const map = new Map<string, PropertyCollection>();

  const collectionsFilePath = getFilePath("collections.json");
  try {
    if (fs.existsSync(collectionsFilePath)) {
      const content = fs.readFileSync(collectionsFilePath, "utf8");
      const list: PropertyCollection[] = JSON.parse(content);
      list.forEach((c) => map.set(c.slug, c));
    } else {
      fs.writeFileSync(collectionsFilePath, JSON.stringify([], null, 2), "utf8");
    }
  } catch (err) {
    console.warn("Collections store read notice:", err);
  }

  g.__propfolioCollectionsMap = map;
  return map;
}

export function getAllCollectionsFromDisk(): PropertyCollection[] {
  const map = ensureCollectionStore();
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function getCollectionFromDisk(slug: string): PropertyCollection | undefined {
  const map = ensureCollectionStore();
  return map.get(slug);
}

export function saveCollectionToDisk(collection: PropertyCollection) {
  const map = ensureCollectionStore();
  map.set(collection.slug, collection);
  g.__propfolioCollectionsMap = map;

  const collectionsFilePath = getFilePath("collections.json");
  try {
    const all = Array.from(map.values());
    fs.writeFileSync(collectionsFilePath, JSON.stringify(all, null, 2), "utf8");
  } catch (err) {
    console.warn("Collections store write notice:", err);
  }
}

export function deleteCollectionFromDisk(slug: string): boolean {
  const map = ensureCollectionStore();
  const deleted = map.delete(slug);
  g.__propfolioCollectionsMap = map;

  const collectionsFilePath = getFilePath("collections.json");
  try {
    const all = Array.from(map.values());
    fs.writeFileSync(collectionsFilePath, JSON.stringify(all, null, 2), "utf8");
  } catch (err) {
    console.warn("Collections store delete notice:", err);
  }

  return deleted;
}
