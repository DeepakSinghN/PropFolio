# PropertySnaps — Payment & Feature Integration Notes

> Yeh file ek reference document hai un sabke liye jo baad mein is codebase ko samjhenge.  
> Har section mein **kya kiya**, **kyun kiya**, aur **kaise kiya** explain kiya gaya hai.

---

## 1. Razorpay Payment Gateway Integration

### Kyun Razorpay?

Cashfree vs Razorpay compare kiya:

| Feature | Razorpay | Cashfree |
|---|---|---|
| Indian UPI Support | ✅ Built-in | ✅ Built-in |
| Developer Docs | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐ Average |
| Checkout Popup | ✅ Native, no redirect | ⚠️ Redirect-based |
| Test Mode | ✅ Full test environment | ✅ Available |
| Webhook Reliability | ✅ Industry standard | ⚠️ Less stable |
| npm Package | `razorpay` (official) | Third-party only |

**Decision: Razorpay chosen** — better DX, native checkout, trusted by most Indian startups.

---

### Architecture (Security-First Design)

```
User clicks "Buy Plan" (PricingClient.tsx)
     │
     ▼
POST /api/payments/create-order          ← Server checks auth cookie
     │  Plan amount from PLAN_CONFIG       ← NEVER from client
     │  Returns: orderId, amount, keyId   ← Secret key NEVER exposed
     ▼
Razorpay Checkout Popup (client-side only for UI)
     │  User pays via UPI/Card/NetBanking
     ▼
POST /api/payments/verify                ← HMAC-SHA256 signature verify
     │  razorpay_order_id|razorpay_payment_id signed with secret
     │  Uses crypto.timingSafeEqual()     ← Prevents timing attacks
     ▼
updateUserPlan() in auth-store.ts        ← ONLY after signature verified
     │  Updates Supabase profiles table
     │  Updates local session file
     ▼
Redirect to /dashboard
```

### Files Created/Modified

| File | Purpose |
|---|---|
| `src/lib/razorpay.ts` | Server-side: `PLAN_CONFIG`, `createRazorpayOrder()`, `verifyRazorpaySignature()` |
| `src/lib/session.ts` | `getUserFromSession()` — reads `propfolio-phone-session` cookie |
| `src/lib/auth-store.ts` | Added `updateUserPlan()` function |
| `src/app/api/payments/create-order/route.ts` | Creates Razorpay order server-side |
| `src/app/api/payments/verify/route.ts` | Verifies signature, upgrades plan |
| `src/app/pricing/PricingClient.tsx` | Checkout popup, success screen, login redirect |

---

### Plan Prices (Server-Side Only — NEVER change on client)

```typescript
// src/lib/razorpay.ts — PLAN_CONFIG
pay_per_listing  → ₹79    (7900 paise)
pro_monthly      → ₹499   (49900 paise)
pro_yearly       → ₹3999  (399900 paise)
agency_monthly   → ₹1499  (149900 paise)
agency_yearly    → ₹11999 (1199900 paise)
```

> ⚠️ **IMPORTANT**: Client sirf `plan` key bhejta hai (e.g. `"pro_monthly"`). Amount server pe `PLAN_CONFIG` se aata hai. Client se amount kabhi accept mat karo.

---

### Security Checklist ✅

- [x] `RAZORPAY_KEY_SECRET` sirf server-side (`.env.local`, never `NEXT_PUBLIC_`)
- [x] `NEXT_PUBLIC_RAZORPAY_KEY_ID` — only public key exposed to client
- [x] HMAC-SHA256: `razorpay_order_id|razorpay_payment_id` signed with secret
- [x] `crypto.timingSafeEqual()` — prevents timing attacks
- [x] Plan upgrade ONLY after signature verification passes
- [x] `receipt` mein `userId` include — cross-account assignment impossible
- [x] Unauthenticated request → 401 → redirect `/login?redirect=/pricing`

---

### Environment Variables Required

```bash
# .env.local (local dev)
RAZORPAY_KEY_ID=rzp_test_U3W1OxTsb69d1o
RAZORPAY_KEY_SECRET=V6RYNdGBQA4HDj1QwghBR8Ms
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_U3W1OxTsb69d1o

# Vercel Dashboard mein bhi yahi add karo (production ke liye live keys use karna)
```

---

### Testing (Localhost + Vercel Test Mode)

Razorpay test mode **localhost pe bhi kaam karta hai** — no tunnel needed.

**Test Cards:**
| Card | Result |
|---|---|
| `4111 1111 1111 1111` | ✅ Success |
| `4000 0000 0000 0002` | ❌ Decline |

**Test UPI IDs:**
| UPI ID | Result |
|---|---|
| `success@razorpay` | ✅ Success |
| `failure@razorpay` | ❌ Failure |

- Expiry: koi bhi future date (e.g. `12/28`)
- CVV: koi bhi 3 digits (`123`)

**Flow to test:**
1. `npm run dev` → `localhost:3000`
2. `/login` → Phone OTP se login karo
3. `/pricing` → "Get Solo Pro" click karo
4. Test card/UPI use karo
5. Success → Dashboard redirect hoga
6. Plan upgrade check karo (dashboard header mein "Solo Broker Pro" dikhega)

---

## 2. Dashboard Plan-Based UI

### Problem

Dashboard mein hardcoded tha:
```typescript
const planLimit = broker.plan_limit || 30; // ❌ Hardcoded 30
```

Matlab **har user ko 30 listings dikhta tha** chahe uska plan Free (1 listing) ho ya Agency (unlimited) ho.

### Solution

`broker.plan_tier` field se dynamically plan info derive kiya:

```typescript
// PlanInfo Map — src/app/dashboard/DashboardClient.tsx
free            → 1 listing limit  | Slate theme
pay_per_listing → 1 listing limit  | Emerald theme
solo_pro        → 25 listing limit | Violet theme  
agency_starter  → Unlimited        | Amber theme
```

### Plan Alert Bar Behavior

| Plan | Alert Bar Shows |
|---|---|
| `free` | "1/1 listing used · Upgrade to Pro" (orange warning) |
| `solo_pro` | "X/25 listings used · Upgrade to Agency" (violet, low urgency) |
| `agency_starter` | "Unlimited listings · Agency & Builder" (green success bar) |
| Limit reached | Red warning + "Upgrade Now" CTA |

---

## 3. WhatsApp OTP Template Integration

### Problem

WhatsApp plain-text OTP messages sirf **24-hour customer service window** mein deliver hote hain. Naye users ko OTP nahi milta tha.

### Solution

Meta Business Manager mein `propertysnaps_otp` **Authentication Template** approve karaya:
- Template ID: `1543435027818846`
- Status: `Active · Quality Pending`
- Language: English

Code: `src/lib/whatsapp.ts` → `sendWhatsAppOtpTemplate()` function:
1. 4 candidate payloads try karta hai (en/en_US, with button/without button)
2. Token expire (error 190) detect karta hai → `tokenExpired: true` return
3. Template fail ho → plain text fallback

```typescript
// API route: src/app/api/auth/send-otp/route.ts
// sendWhatsAppMessage() → sendWhatsAppOtpTemplate() changed
```

---

## 4. Skeleton Loading Screens

### Files Created

| File | Kya dikhata hai |
|---|---|
| `src/components/BrandedSpinner.tsx` | Property Snaps logo + dual-color spin ring (Emerald + Purple) |
| `src/components/ListingSkeleton.tsx` | Property page shimmer (gallery, price, specs, broker card) |
| `src/components/DashboardSkeleton.tsx` | Dashboard shimmer (header, KPI cards, listings grid) |
| `src/app/loading.tsx` | Global loading (BrandedSpinner) |
| `src/app/dashboard/loading.tsx` | Dashboard loading (DashboardSkeleton) |
| `src/app/[slug]/loading.tsx` | Broker profile loading |
| `src/app/[slug]/[listingSlug]/loading.tsx` | Listing page loading (ListingSkeleton) |

---

## 5. Demo Data Removal

### Kyun Remove Kiya?

Production mein demo data visible ho raha tha — "Ramesh Shah" test account, hardcoded listings, etc.

### Kya Remove Kiya?

- `DEMO_BROKER` → `DEFAULT_BROKER` (generic placeholder)
- `verifyUserPassword()` se demo bypass remove
- `LoginClient.tsx` se "1-Click Demo Login" button remove
- `/api/auth/verify-otp` se "Ramesh Shah" hardcoded profile remove
- WhatsApp bot → `senderBroker` ab dynamic hai sender ke phone number se
- `.data/listings.json`, `.data/collections.json` → `[]` reset
- `.data/users.json`, `.data/auth-sessions.json`, `.data/otps.json` → `{}` reset

---

## 6. OTP Reliability Fix (Multi-Instance Vercel)

### Problem

Vercel serverless functions stateless hain — file-based OTP store alag instances pe share nahi hota. OTP save karo ek instance pe, verify karo doosre pe → mismatch.

### Solution: HMAC-SHA256 Signed Stateless Token

```typescript
// Token structure (base64url encoded):
{
  target: "919876543210",   // normalized phone
  expiresAt: 1700000000000, // Unix ms
  signature: "abc123..."    // HMAC-SHA256(target:code:expiresAt, secret)
}
```

Token cookie + JSON body dono mein bheja jata hai. Verify ke waqt token se signature validate karo — no DB/file needed.

---

## 7. Git Commits Reference

| Commit | Description |
|---|---|
| `0441d8b` | feat: remove all demo data, demo accounts, test bypasses |
| `c36ae38` | feat: WhatsApp OTP Authentication template integration |
| `401679c` | feat: skeleton loading screens (BrandedSpinner, ListingSkeleton, DashboardSkeleton) |
| `f092fe0` | feat: Razorpay payment gateway with HMAC-SHA256 secure verification |
| Latest | feat: dashboard plan-based UI (limits, colors, upgrade CTAs per plan) |

---

## 8. Known Limitations & Next Steps

| Item | Status |
|---|---|
| Razorpay Webhook (`/api/payments/webhook`) | ❌ Not implemented — payment verify server-to-server |
| Subscription auto-renewal | ❌ Manual for now |
| Agency plan Razorpay payment | ❌ `/contact` page → manual sales |
| WhatsApp access token refresh | ⚠️ Manual — expires periodically, update in Vercel env + Meta |
| Supabase fully connected | ⚠️ Local: empty keys. Production: Vercel env has real keys |

> 💡 **Webhook Note:** Abhi payment verify client-callback se ho raha hai (Razorpay handler). Production-grade ke liye Razorpay Webhook (`/api/payments/webhook`) bhi add karo — yeh server-to-server verification hai jo client-side bypass nahi kar sakta.

---

*Last updated: November 2026 — PropertySnaps v1.0 Payment Integration*

