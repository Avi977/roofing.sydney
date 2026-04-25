# Production Readiness Checklist — roofing.sydney

> Everything that must be done before this site goes to production. Grouped by priority.
> Updated: 2026-04-25

---

## 🔴 Blockers — Must Fix Before Launch

### Content & Legal

- [ ] **Replace placeholder hero stats** — "2,400+ Sydney roofs", "25yr warranty", "4.9/5 Google reviews" are fake. ACCC liability if published. Get real numbers from client via `docs/client-intake.md`.
- [ ] **Add NSW Fair Trading licence number** — display in footer (minimum) and on contact/quote pages. Client must supply.
- [ ] **Add ABN** — footer, standard AU business credibility requirement.
- [ ] **Add real phone number** — no phone number exists anywhere on the site. This is the #1 conversion driver for mobile tradie searches. Add to site header (click-to-call `<a href="tel:...">`).
- [ ] **Replace testimonials** — current testimonials are placeholder. Get 5+ real Google reviews from client.
- [ ] **Review Privacy Policy** — must list Supabase (PII storage), Resend (email PII), and GA4 (analytics). Update if needed once client provides their details.

### Infrastructure & Environment

- [ ] **Verify all env vars in Vercel dashboard** — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `NEARMAP_API_KEY` (when Phase 1 ships), `REPLICATE_API_TOKEN`, `FAL_KEY`. None should use `.env.local` values in production.
- [ ] **Custom domain verified** — `roofing.sydney` with HTTPS active on Vercel.
- [ ] **`metadataBase`** — confirm `https://roofing.sydney` (already set in `layout.tsx`, verify after domain activation).

---

## 🟠 High Priority — Before Any Paid Traffic

### SEO Foundations

- [ ] **Homepage title tag** — current: "Australian Roofing Contractors". Update to: `Metal Roofing Sydney | Colorbond Re-Roofing & Repairs | Australian Roofing Contractors` (client must confirm brand name is final).
- [ ] **Homepage meta description** — add one that includes "Sydney", "Colorbond", and a CTA. 150–160 chars.
- [ ] **Schema markup (JSON-LD)** — add `RoofingContractor` + `AggregateRating` + `LocalBusiness` to `src/app/layout.tsx`. Template in research doc. Requires real phone, address, and review count from client.
- [ ] **Google Search Console** — verify site ownership, submit `sitemap.xml`.
- [ ] **`sitemap.xml`** — currently basic (robots.ts + sitemap.ts exist). Expand to include all pages once suburb pages are built.
- [ ] **Google Business Profile** — client must confirm they own/manage their GBP. Add website URL, ensure NAP matches site exactly.

### Conversion & Trust

- [ ] **Phone number in header** — sticky on mobile, visible in desktop header. Single biggest conversion improvement available.
- [ ] **Click-to-call on mobile** — wrap phone number in `<a href="tel:+61XXXXXXXXX">`.
- [ ] **Quote form: add suburb/service fields** — current form captures name/phone/email. Add suburb (text or dropdown) and service type (button group) to qualify leads better.
- [ ] **Licence number in footer** — `NSW Fair Trading Licence #XXXXXXXX`.

### Analytics

- [ ] **GA4** — add Google Analytics 4 measurement ID to `layout.tsx` (via `@next/third-parties/google` or manual script tag). Verify pageview events fire.
- [ ] **Form submission event** — fire `ga4.event('generate_lead')` when quote form is submitted. Wire to existing Supabase insert in `/api/leads`.
- [ ] **Google Search Console** — submit sitemap, monitor for crawl errors post-launch.

---

## 🟡 Medium Priority — Within First Month

### Security Headers

Add to `next.config.ts`:

```ts
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];
```

- [ ] Implement security headers in `next.config.ts`
- [ ] Add honeypot field to contact form (hidden `website` field — reject if populated)
- [ ] Rate-limit `/api/leads` route — add middleware or Vercel Edge Config check
- [ ] Confirm Supabase RLS policies are enabled on `leads` table

### Content Pages

- [ ] **Individual service pages** — `/services/colorbond-reroofing`, `/services/leak-repairs`, `/services/gutters` (requires client content)
- [ ] **About page** — team, history, licences, insurance (requires client bio + photos)
- [ ] **Areas Served page** — links to suburb pages (requires client to supply suburb list)
- [ ] **Gallery page** — before/after photos (requires client to supply 20+ photos)
- [ ] **Contact page** — NAP, embedded Google Map, form, office hours

### Performance

- [ ] **Run Lighthouse on production URL** — target LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms
- [ ] **Hero image optimisation** — `aluminum-roofing.jpg` (444KB+) should be converted to WebP and properly sized. Use `next/image` `sizes` prop correctly.
- [ ] **Font loading** — verify Inter + Fraunces load with `display: swap` and no CLS
- [ ] **Image alt text audit** — all `<Image>` components must have descriptive alt text (SEO + accessibility)

---

## 🟢 Nice to Have — Post-Launch

### Local SEO

- [ ] **Suburb landing pages** — one page per major service area (minimum 10 suburbs). Template: `/roofing-[suburb]`. Each needs 400+ words of unique content. Highest-leverage long-term SEO investment.
- [ ] **FAQ page** — target long-tail searches ("how much does a metal roof cost Sydney", "how long does a Colorbond roof last"). Add `FAQPage` schema.
- [ ] **Blog** — 3 cornerstone posts to start: (1) Colorbond colour guide 2025, (2) Metal vs tile roof cost comparison, (3) How to spot roof damage in Sydney weather.

### Conversion Optimisation

- [ ] **Sticky mobile header** — phone number + "Get Quote" button pinned to top on mobile viewport
- [ ] **WhatsApp Business link** — `wa.me/61XXXXXXXXX` as a floating button or in contact section
- [ ] **Emergency repair CTA** — prominent pathway for "leaking roof NOW" searches (separate form or phone-priority CTA)
- [ ] **Chat / messaging** — Tidio or similar; only if someone will actively respond

### Analytics Depth

- [ ] **Google Ads conversion tracking** — conversion action for form submissions + calls
- [ ] **Call tracking** — unique phone number per traffic source (Google Ads vs organic vs GBP). CallRail AU or similar.
- [ ] **Heatmaps** — Hotjar or Microsoft Clarity (free) to watch where users drop off

### Technical Debt

- [ ] **CSP (Content Security Policy)** — add `Content-Security-Policy-Report-Only` header first, then tighten to block mode after testing inline scripts
- [ ] **Vercel Preview Protection** — password-protect preview deployments so the client can review without it being indexed
- [ ] **Error monitoring** — add Sentry (free tier) for runtime JS error tracking in production
- [ ] **Edge Config** — use for feature flags on AI visualiser rollout (rate limits, kill switch)

---

## Current Status Summary

| Area | Status | Blocker? |
|------|--------|----------|
| Homepage design | ✅ Done | — |
| Phase 4 rebrand (ARC branding) | ✅ Done | — |
| AI visualiser (hero demo) | ✅ Functional (demo mode) | Phase 1 not yet built |
| Real images | ✅ Added | — |
| Phone number | ❌ Missing | Yes — add before launch |
| Licence number | ❌ Missing | Yes — need from client |
| Real stats/testimonials | ❌ Placeholder | Yes — need from client |
| Schema markup | ❌ Missing | High — needed for SEO |
| GA4 analytics | ❌ Not connected | High |
| Security headers | ❌ Not set | Medium |
| Service pages | ❌ Not built | Medium |
| Suburb pages | ❌ Not built | Medium (SEO) |
| About page | ❌ Not built | Medium |
| Gallery | ❌ Not built | Medium |
| Contact page | ❌ Not built | Medium |

---

## Files to Reference

- `docs/client-intake.md` — send to client to collect all missing information
- `.planning/quick/260425-hkq-research-au-roofing-website-best-practic/260425-hkq-RESEARCH.md` — full research backing this checklist
