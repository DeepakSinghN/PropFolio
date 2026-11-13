<div align="center">

# 🏛️ PropFolio

### The WhatsApp-First AI Listing Engine for Real Estate Brokers

Turn messy WhatsApp property descriptions and photos into high-converting, branded property micro-sites and printable PDF brochures in under 60 seconds.

[![Next.js](https://img.shields.io/badge/Next.js-15.1.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=flat-square&logo=google)](https://aistudio.google.com/)
[![Meta WhatsApp API](https://img.shields.io/badge/Meta_WhatsApp-Cloud_API-25D366?style=flat-square&logo=whatsapp)](https://developers.facebook.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)

</div>

---

## 📌 The Problem
In the Indian real estate market (covering Ahmedabad, Jaipur, Mumbai, NCR, Bengaluru, etc.), over **90% of real estate deals and inventory discovery happen on WhatsApp**.

However, brokers share inventory as:
- Cluttered, unstructured forwarded WhatsApp text blocks filled with abbreviations (`3BHK FF 1750sqft nr Lotus Sch, 1.35Cr neg`).
- Uncompressed batches of 15–20 phone photos mixed together in the buyer's gallery.
- Zero tracking of who actually viewed the property.
- Watermark loss when properties are reshared across broker networks.

---

## 💡 The Solution: PropFolio
**PropFolio** bridges this gap by turning raw WhatsApp chats directly into luxury, branded web listing pages without leaving WhatsApp:

1. **Broker forwards photos and property text to the PropFolio WhatsApp Bot.**
2. **PropFolio AI (Gemini Flash)** parses configurations (BHK, carpet area, facing, floor, furnishing), amenities, price breakdown (Crores / Lakhs), and cleans up property titles.
3. **In 60 seconds**, the bot replies with a live, responsive listing link: `propfolio.in/ramesh/3-bhk-satellite-ahmedabad`.
4. **Buyers receive a luxury, Sotheby's Royal-styled web page** featuring an interactive photo gallery, Google Maps location, EMI loan calculator, and a direct WhatsApp inquiry button routed straight back to the listing broker.

---

## ✨ Key Features

### 1. ⚡ WhatsApp-First Experience
- **No Complex Apps:** Brokers don't need to learn a new CRM or install heavy apps. Everything works via WhatsApp and a lightweight mobile web browser.
- **WhatsApp OTP Authentication:** No forgotten passwords or email friction. 100% phone-number-based WhatsApp OTP login (+91 Indian format).

### 2. 🎨 "Sotheby's Royal" Luxury Design System
- High-contrast, editorial typography with **Deep Midnight Navy (`#0a1128`)** and **Champagne Gold (`#c5a059`)**.
- Built-in Dark Mode and Light Mode support with smooth CSS variable transitions and persistent theme state.

### 3. 📄 1-Click Printable PDF Brochure Generator
- Generate client-ready printable presentation brochures with broker branding, photo highlights, RERA disclaimers, and QR codes.

### 4. 🧮 Interactive Financial Tools for Buyers
- Real-time **Home Loan EMI Calculator** (Principal, Interest %, Tenure in Years) with monthly installment breakdown.
- Investment breakdown (Price per Sq. Ft., Furnishing status, Super built-up vs. Carpet area).

### 5. 🛡️ Comprehensive Compliance & Legal Suite
- **Privacy Policy (`/privacy`):** Meta WhatsApp Cloud API verification and Indian DPDP Act compliant.
- **Terms of Service (`/terms`):** Clear SaaS technology provider disclaimer, broker RERA compliance obligations, and IP protections.
- **Pricing & Plans (`/pricing`):** Free Starter (₹0), Solo Broker Pro (₹499/mo), and Agency & Builder Elite (₹1,499/mo) with GST invoicing support.
- **Contact Us (`/contact`):** Direct WhatsApp support integration, verified email (`support@propfolio.in`), and interactive inquiry form.
- **Refund & Cancellation Policy (`/refund`):** 7-day money-back guarantee, cancellation policy, and UPI/card refund timelines.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 15](https://nextjs.org) (App Router, Server Actions, Dynamic Routes) |
| **UI Library** | [React 19](https://react.dev) + [Tailwind CSS](https://tailwindcss.com) |
| **Icons & UI** | [Lucide React](https://lucide.dev) |
| **AI Parsing** | [Google Gemini 2.5 Flash](https://aistudio.google.com) |
| **Messaging API** | [Meta WhatsApp Business Cloud API](https://developers.facebook.com) |
| **Database & Auth** | [Supabase](https://supabase.com) (PostgreSQL, Storage, Realtime) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org) |

---

## 📂 Project Architecture

```
real-estate/
├── public/
│   ├── images/
│   │   └── from-this-to-this.jpg   # Hero visual comparison mockup
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/               # WhatsApp OTP Login, Verify, Logout, Me
│   │   │   ├── listings/           # CRUD endpoints for properties
│   │   │   └── webhook/whatsapp/   # Meta Cloud API Webhook handler
│   │   ├── contact/                # Contact Us page & interactive form
│   │   ├── dashboard/              # Broker inventory management portal
│   │   ├── login/                  # WhatsApp phone OTP login
│   │   ├── pricing/                # Plans, feature matrix, and FAQs
│   │   ├── privacy/                # Meta-compliant Privacy Policy
│   │   ├── refund/                 # 7-day money-back Refund Policy
│   │   ├── signup/                 # New broker onboarding
│   │   ├── terms/                  # Terms of Service & RERA disclaimers
│   │   ├── [slug]/                 # Broker micro-sites & listings
│   │   │   └── [listingSlug]/      # Buyer-facing property viewer
│   │   ├── globals.css             # Sotheby's Royal design tokens
│   │   ├── layout.tsx              # Root layout & theme bootstrap
│   │   └── page.tsx                # Main conversion landing page
│   ├── components/
│   │   ├── HeroInteractiveDemo.tsx # Live interactive demo widget
│   │   ├── Navbar.tsx              # Unified brand navigation
│   │   └── ThemeToggle.tsx         # Dark/Light mode switcher
│   ├── data/
│   │   └── listings.json           # Local fallback property storage
│   ├── lib/
│   │   ├── auth.ts                 # JWT session & phone OTP verification
│   │   ├── gemini.ts               # Google Gemini property parser
│   │   ├── supabase.ts             # Supabase database & storage client
│   │   └── whatsapp.ts             # Meta WhatsApp Cloud API helper
└── package.json
```

---

## 🚀 Quickstart & Installation

### 1. Clone the repository
```bash
git clone https://github.com/DeepakSinghN/PropFolio.git
cd PropFolio
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Duplicate `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your configuration keys:
```env
# 1. Supabase (Database & Storage)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# 2. Google Gemini AI (Listing Synthesis)
GEMINI_API_KEY=AIzaSy...

# 3. Meta WhatsApp Cloud API (WhatsApp Bot)
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_meta_system_user_token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token

# 4. Domain
NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000
```

### 4. Run the Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🤖 WhatsApp Cloud API Webhook Setup

1. In the **Meta for Developers Console**, go to **WhatsApp → Configuration**.
2. Set the **Callback URL** to:
   ```
   https://your-domain.com/api/webhook/whatsapp
   ```
3. Set the **Verify Token** to the value of `WHATSAPP_WEBHOOK_VERIFY_TOKEN` in your `.env.local`.
4. Subscribe to the `messages` webhook field.
5. When a broker sends photos and text to your WhatsApp test number, the webhook automatically triggers Gemini AI synthesis and replies with the generated listing URL!

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).

---

<div align="center">
  <b>Built for Indian Real Estate Brokers & Property Consultants 🇮🇳</b>
</div>
