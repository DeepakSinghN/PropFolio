import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/server";
import { DEMO_BROKER } from "@/lib/store";
import { getAllListingsFromDisk } from "@/lib/server-store";

export const alt = "Broker Property Portfolio — Property Snaps";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function BrokerOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let brokerName = DEMO_BROKER.full_name;
  let companyName = DEMO_BROKER.company_name || "Real Estate Advisory";
  let city = DEMO_BROKER.city || "India";
  let avatarUrl: string | null = null;
  let listingsCount = 0;

  const supabase = createAdminClient();
  if (supabase) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, company_name, city, avatar_url")
        .eq("slug", slug)
        .maybeSingle();

      if (profile) {
        brokerName = profile.full_name || brokerName;
        companyName = profile.company_name || "Verified Property Advisor";
        city = profile.city || "";
        if (
          profile.avatar_url &&
          (profile.avatar_url.startsWith("https://") ||
            profile.avatar_url.startsWith("http://"))
        ) {
          avatarUrl = profile.avatar_url;
        }

        const { count } = await supabase
          .from("listings")
          .select("id", { count: "exact", head: true })
          .eq("broker_id", profile.id);

        if (typeof count === "number") {
          listingsCount = count;
        }
      }
    } catch {
      // Fallback to defaults below
    }
  }

  if (listingsCount === 0) {
    const diskListings = getAllListingsFromDisk();
    listingsCount = diskListings.length;
  }

  const initial = (brokerName?.trim()?.charAt(0) || "P").toUpperCase();
  const subdomainUrl = `${slug}.propertysnaps.in`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          background: "linear-gradient(135deg, #071912 0%, #0f2e20 55%, #1c5436 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Top Row: Brand + Verified Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#00974e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                fontWeight: 800,
                color: "#ffffff",
              }}
            >
              P
            </div>
            <span
              style={{
                fontSize: "24px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "#e2f5ea",
              }}
            >
              Property Snaps
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 20px",
              borderRadius: "999px",
              backgroundColor: "rgba(255, 255, 255, 0.12)",
              border: "1px solid rgba(255, 255, 255, 0.22)",
              fontSize: "18px",
              fontWeight: 600,
              color: "#a7f3d0",
            }}
          >
            Verified Broker Portfolio
          </div>
        </div>

        {/* Center Row: Broker Avatar + Name + Company */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "36px",
            marginTop: "12px",
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              width={136}
              height={136}
              style={{
                borderRadius: "999px",
                objectFit: "cover",
                border: "4px solid #34d399",
              }}
            />
          ) : (
            <div
              style={{
                width: "136px",
                height: "136px",
                borderRadius: "999px",
                backgroundColor: "#00974e",
                border: "4px solid #6ee7b7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "60px",
                fontWeight: 800,
                color: "#ffffff",
              }}
            >
              {initial}
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              maxWidth: "820px",
            }}
          >
            <div
              style={{
                fontSize: "58px",
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                color: "#ffffff",
              }}
            >
              {brokerName}
            </div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: 500,
                color: "#cbd5e1",
                display: "flex",
                alignItems: "center",
              }}
            >
              {city ? `${companyName}  •  ${city}` : companyName}
            </div>
          </div>
        </div>

        {/* Bottom Row: Subdomain Pill + Listings Count */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.16)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 24px",
              borderRadius: "14px",
              backgroundColor: "#ffffff",
              color: "#0f2e20",
              fontSize: "22px",
              fontWeight: 700,
            }}
          >
            {subdomainUrl}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: "22px",
              fontWeight: 600,
              color: "#d1fae5",
            }}
          >
            <span>
              {listingsCount > 0
                ? `${listingsCount} Verified ${listingsCount === 1 ? "Property" : "Properties"}`
                : "Explore Verified Properties"}
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

