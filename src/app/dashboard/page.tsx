import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPhoneSession, ensureProfileNotExpired } from "@/lib/auth-store";
import { createAdminClient } from "@/lib/supabase/server";
import { getAllCollectionsFromDisk, getAllListingsFromDisk } from "@/lib/server-store";
import { DEMO_BROKER } from "@/lib/store";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

function isValidUUID(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const phoneCookie = cookieStore.get("propfolio-phone-session");

  let broker: any = null;
  let brokerId: string | null = null;
  let isAuthenticated = false;

  if (phoneCookie?.value) {
    const session = getPhoneSession(phoneCookie.value);
    if (session?.profile) {
      broker = { ...DEMO_BROKER, ...session.profile };
      isAuthenticated = true;
      if (isValidUUID(session.profile.id)) {
        brokerId = session.profile.id;
      }
    }
  }

  const supabase = createAdminClient();

  // If not authenticated via phone cookie, check Supabase Auth session
  if (!isAuthenticated) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const clientSupabase = await createClient();
      const {
        data: { user },
      } = await clientSupabase.auth.getUser();

      if (user) {
        isAuthenticated = true;
        broker = {
          ...DEMO_BROKER,
          id: user.id,
          user_id: user.id,
          email: user.email,
          phone_number: user.phone || "",
          full_name: user.user_metadata?.full_name || "Real Estate Broker",
          ...user.user_metadata,
        };
        brokerId = user.id;
      }
    } catch {}
  }

  // Security: Unauthenticated users are redirected to login
  if (!isAuthenticated || !broker) {
    redirect("/login?redirect=/dashboard");
  }

  // If brokerId is not a UUID, resolve it from Supabase profiles
  if (supabase && !brokerId && (broker.slug || broker.email || broker.phone_number)) {
    try {
      if (broker.slug) {
        const { data: p } = await supabase
          .from("profiles")
          .select("*")
          .eq("slug", broker.slug)
          .maybeSingle();
        if (p?.id && isValidUUID(p.id)) {
          broker = { ...DEMO_BROKER, ...p };
          brokerId = p.id;
        }
      }
      if (!brokerId && broker.email) {
        const emailPrefix = broker.email.split("@")[0];
        const { data: p } = await supabase
          .from("profiles")
          .select("*")
          .ilike("slug", `%${emailPrefix}%`)
          .limit(1)
          .maybeSingle();
        if (p?.id && isValidUUID(p.id)) {
          broker = { ...DEMO_BROKER, ...p };
          brokerId = p.id;
        }
      }
    } catch {}
  }

  // Auto-downgrade expired subscription/trial to Free before loading dashboard
  broker = await ensureProfileNotExpired(broker);

  // PARALLEL SERVER FETCH: Zero client-side waterfall
  let initialListings: any[] = [];
  let initialCollections: any[] = [];

  const [listingsRes, collectionsRes] = await Promise.allSettled([
    (async () => {
      if (supabase && brokerId) {
        const { data } = await supabase
          .from("listings")
          .select("*, listing_photos(*)")
          .eq("broker_id", brokerId)
          .order("created_at", { ascending: false });

        if (data && Array.isArray(data)) {
          return data.map((l: any) => {
            const photos = (l.listing_photos || []).sort(
              (a: any, b: any) => (a.display_order || 0) - (b.display_order || 0)
            );
            return {
              ...l,
              photos: photos.length > 0 ? photos : l.photos || [],
            };
          });
        }
      }
      return [];
    })(),
    (async () => {
      const cols = getAllCollectionsFromDisk();
      const diskListings = getAllListingsFromDisk();
      const map = new Map(diskListings.map((l) => [l.slug, l]));
      return cols.map((col) => {
        const items = col.listing_slugs.map((s) => map.get(s)).filter(Boolean);
        const totalValue = items.reduce((sum, item: any) => sum + (item.price_amount || 0), 0);
        return {
          ...col,
          listing_count: col.listing_slugs.length,
          total_value: totalValue,
          sample_photos: items.flatMap((i: any) => (i.photos || []).map((p: any) => p.photo_url)).slice(0, 4),
        };
      });
    })(),
  ]);

  if (listingsRes.status === "fulfilled") {
    initialListings = listingsRes.value;
  }
  if (collectionsRes.status === "fulfilled") {
    initialCollections = collectionsRes.value;
  }

  return (
    <DashboardClient
      initialBroker={broker}
      initialListings={initialListings}
      initialCollections={initialCollections}
    />
  );
}
