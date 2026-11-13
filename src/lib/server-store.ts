import fs from "fs";
import path from "path";
import { Listing, PropertyCollection } from "@/types/database";
import { INITIAL_LISTINGS } from "./store";

const dataDir = path.join(process.cwd(), ".data");
const dataFilePath = path.join(dataDir, "listings.json");
const collectionsFilePath = path.join(dataDir, "collections.json");
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

export function deleteListingFromDisk(slug: string): boolean {
  const map = ensureFileStore();
  const deleted = map.delete(slug);

  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const all = Array.from(map.values());
    fs.writeFileSync(dataFilePath, JSON.stringify(all, null, 2), "utf8");
  } catch (err) {
    console.error("Server store delete write error:", err);
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

  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const all = Array.from(map.values());
    fs.writeFileSync(dataFilePath, JSON.stringify(all, null, 2), "utf8");
  } catch (err) {
    console.error("Server store status write error:", err);
  }

  return item;
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

// -------------------------------------------------------------
// Curated Property Collections Store
// -------------------------------------------------------------

function ensureCollectionStore(): Map<string, PropertyCollection> {
  const map = new Map<string, PropertyCollection>();

  // Default sample collection
  const defaultCollection: PropertyCollection = {
    id: "col-default-1",
    broker_id: "demo-broker-1",
    title: "Ahmedabad Prime Luxury Shortlist",
    slug: "ahmedabad-prime-luxury",
    description: "Hand-picked high-end residential apartments in Satellite and Bodakdev. Ready-to-move homes with reserved car parking and premium amenities.",
    listing_slugs: [
      "3-bhk-satellite-ahmedabad",
      "4-bhk-bodakdev-ahmedabad"
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    views_count: 38
  };
  map.set(defaultCollection.slug, defaultCollection);

  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (fs.existsSync(collectionsFilePath)) {
      const content = fs.readFileSync(collectionsFilePath, "utf8");
      const list: PropertyCollection[] = JSON.parse(content);
      list.forEach((c) => map.set(c.slug, c));
    } else {
      fs.writeFileSync(collectionsFilePath, JSON.stringify([defaultCollection], null, 2), "utf8");
    }
  } catch (err) {
    console.error("Collections store read error:", err);
  }

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

  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const all = Array.from(map.values());
    fs.writeFileSync(collectionsFilePath, JSON.stringify(all, null, 2), "utf8");
  } catch (err) {
    console.error("Collections store write error:", err);
  }
}

export function deleteCollectionFromDisk(slug: string): boolean {
  const map = ensureCollectionStore();
  const deleted = map.delete(slug);

  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const all = Array.from(map.values());
    fs.writeFileSync(collectionsFilePath, JSON.stringify(all, null, 2), "utf8");
  } catch (err) {
    console.error("Collections store delete error:", err);
  }

  return deleted;
}
