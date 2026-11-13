import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const fontSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const fontSerif = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const fontMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://propfolio.co"
  ),
  title: "PropFolio — AI Real Estate Listing Engine",
  description: "Turn raw WhatsApp messages and photos into branded luxury property micro-sites in 60 seconds.",
  openGraph: {
    title: "PropFolio — Private Office AI",
    description: "Turn raw WhatsApp messages and photos into branded luxury property micro-sites in 60 seconds.",
    type: "website",
    siteName: "PropFolio",
    images: [
      {
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
        width: 1200,
        height: 630,
        alt: "PropFolio Luxury Real Estate",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PropFolio — Private Office AI",
    description: "Turn raw WhatsApp messages and photos into branded luxury property micro-sites in 60 seconds.",
    images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80"],
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
      className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} h-full antialiased light`}
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
