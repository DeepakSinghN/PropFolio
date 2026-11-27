import { ImageResponse } from "next/og";

export const alt = "Property Snaps — AI Real Estate Listing Engine";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function RootOpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 68px",
          background: "linear-gradient(135deg, #071912 0%, #0f2e20 55%, #1c5436 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "#00974e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: 800,
                color: "#ffffff",
              }}
            >
              P
            </div>
            <span style={{ fontSize: "26px", fontWeight: 700, color: "#e2f5ea" }}>
              Property Snaps
            </span>
          </div>

          <div
            style={{
              padding: "10px 20px",
              borderRadius: "999px",
              backgroundColor: "rgba(255, 255, 255, 0.12)",
              border: "1px solid rgba(255, 255, 255, 0.22)",
              fontSize: "18px",
              fontWeight: 600,
              color: "#a7f3d0",
            }}
          >
            For Real Estate Brokers
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div
            style={{
              fontSize: "58px",
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
              color: "#ffffff",
            }}
          >
            Send a property on WhatsApp. Get a listing page in minutes.
          </div>
          <div style={{ fontSize: "26px", color: "#cbd5e1", lineHeight: 1.4 }}>
            Branded property micro-sites, PDF brochures, and personal broker portfolios.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.16)",
            fontSize: "22px",
            fontWeight: 700,
            color: "#6ee7b7",
          }}
        >
          <span>propertysnaps.in</span>
          <span>No app required • Instant PDF & Link</span>
        </div>
      </div>
    ),
    { ...size }
  );
}

