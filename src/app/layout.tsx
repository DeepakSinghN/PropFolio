import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const fontSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://www.propertysnaps.in"
  ),
  title: "Property Snaps: Your Own Website in Minutes",
  description:
    "Upload photos and notes on WhatsApp or our site. Get a listing page with your own link, gallery, PDF brochure and contact button in minutes.",
  openGraph: {
    title: "Property Snaps: Your Own Website in Minutes",
    description:
      "Upload photos and notes on WhatsApp or our site. Get a listing page with your own link, gallery, PDF brochure and contact button in minutes.",
    type: "website",
    siteName: "Property Snaps",
  },
  twitter: {
    card: "summary_large_image",
    title: "Property Snaps: Your Own Website in Minutes",
    description:
      "Upload photos and notes on WhatsApp or our site. Get a listing page with your own link, gallery, PDF brochure and contact button in minutes.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontSans.variable} h-full antialiased light`}
    >
      <body className="min-h-full flex flex-col bg-[#f8f9fa] text-[#0a1128] transition-colors duration-200 dark:bg-[#070b14] dark:text-slate-100 font-sans">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('propfolio-theme');
                  if (t === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
