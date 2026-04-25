# Research: Australian Roofing Website Best Practices

**Researched:** 2026-04-25
**Domain:** AU trade/home-services website — design, SEO, CTA, compliance, production
**Confidence:** MEDIUM-HIGH (general roofing SEO is well-documented; some AU-specific compliance claims are ASSUMED where no authoritative regulation text was surfaced)

---

## Current Site Assessment

The site (`roofing.sydney`) is a Next.js 15 / Vercel build with:
- **Brand:** Australian Roofing Contractors — metal/Colorbond specialist, Sydney only
- **Differentiator:** AI roof colour visualiser (the main product hook)
- **Homepage bands:** Hero (AI swatch demo) → TrustBar → Services → Process → Testimonials → QuoteBand → Footer
- **Metadata:** Title, description, and OG tags set; `lang="en-AU"` correct; `metadataBase` pointing to `roofing.sydney`
- **Missing:** No schema markup, no call-tracking setup, no suburb/area pages, no Google Business Profile link, placeholder stats (2,400 roofs, 4.9/5 stars — need real data from client)

---

## 1. Australian Roofing Market Context

### Search Intent (Sydney roofing)
- **High-intent transactional:** "metal roofing Sydney", "Colorbond roof replacement Sydney", "roof repair Sydney", "leaking roof Sydney emergency" — these are the money terms
- **Local modifiers dominate:** Suburb-level searches ("roofing Parramatta", "roof repair Bondi") convert better than generic national terms
- **Informational long-tail:** "Colorbond colours 2025", "how much does a new roof cost Sydney", "metal vs tile roof Australia" — blog fodder that builds authority
- **National chains competing:** Jim's Roofing, Roof Doctors, Programmed Facility Management — these have domain authority; a local specialist wins on suburb pages and GBP proximity [ASSUMED based on standard local SEO patterns]

### Trust Signals That Matter in AU
- **Licence numbers displayed prominently** — Australian consumers expect to see the licence number; not showing it is a red flag
- **ABN visible** — standard for AU business credibility
- **QBCC / NSW Fair Trading / VBA registration** — state-specific, must match the states served
- **Insurance (public liability + home warranty)** — clients ask; show it on About/FAQ page
- **Manufacturer certifications:** Colorbond accredited installer / BlueScope partner status is a strong signal for metal roofing
- **Google reviews count + rating** (social proof; 93% of AU consumers check reviews before engaging a tradie) [CITED: traffira.com/ultimate-roofing-seo-checklist-2025]
- **Years in business + jobs completed** — quantified proof beats vague claims

### Licence Display Requirements by State
| State | Regulator | Trigger | What to Display |
|-------|-----------|---------|-----------------|
| NSW | NSW Fair Trading | Work >$5,000 incl. materials | Contractor Licence number |
| VIC | VBA | Work >$10,000 | Registration number |
| QLD | QBCC | Work >$3,300 incl. GST | QBCC licence number |

**Site is Sydney-focused → NSW Fair Trading licence is the primary requirement.** [CITED: nsw.gov.au/business-and-economy/licences-and-credentials/building-and-trade-licences-and-registrations]

Displaying licence in footer AND on contact/quote pages is AU best practice. No explicit legal mandate for website display was found in regulation text, but omitting it is a material trust signal loss and some states' codes of practice imply it. [ASSUMED: mandatory website display; verified: display is standard expectation]

---

## 2. Design & UX Best Practices

### Above the Fold — What Converts
- **H1 must state location + service:** Google and users need "Sydney" in the first screen. Current H1 ("See your roof in a new colour") is differentiator-led — good for brand, but add "Sydney" explicitly or ensure hero subtext is prominent.
- **Phone number in header** — click-to-call `<a href="tel:...">` is the #1 conversion driver for mobile trade sites. The current site has no phone number visible at all.
- **Primary CTA above fold** — "Get a Free Quote" or "Book Inspection" needs to be on-screen without scrolling. Current hero has two CTAs ("Try Sydney Roofing" + "Book an inspection") — good, but the quote CTA scrolls to `#quote`; consider a floating sticky bar on mobile.
- **Hero image:** Real job photography (before/after) outperforms stock for trade sites. The AI swatch panel is the differentiator — keep it. The background behind the left copy panel (`/images/aluminum-roofing.jpg`) should be a real completed Sydney job.

### Mobile-First (Critical for Tradies Audience)
- 65–75% of local service searches happen on mobile [ASSUMED; aligns with general AU mobile internet usage trends]
- Tap targets ≥ 44px, phone number tappable, forms with minimal fields
- Sticky header with phone number + "Get Quote" button on mobile
- Page speed on mobile is the biggest technical trust signal

### Colour Psychology
The current palette (warm cream hero, dark navy, Colorbond red accent) is solid for a premium trade brand. Blues/greens signal trust and stability; the red accent is appropriate for urgency CTAs (emergency repairs, quote CTAs). No change needed here — the palette is professional.

---

## 3. CTA Strategy

### Primary vs Secondary CTAs
| CTA | Placement | Purpose |
|-----|-----------|---------|
| **"Get a Free Quote"** | Header, hero, footer, every service section | Primary lead capture |
| **Click-to-call (phone)** | Sticky header on mobile, hero, contact page | Instant conversion for emergency/impatient leads |
| **"Book a Roof Inspection"** | Hero secondary, services pages | Lower-friction entry for undecided homeowners |
| **"Report a Leak / Emergency"** | Services section for repairs | High-urgency, converts when roof is actively leaking |
| **"Try the AI Visualiser"** | Hero, unique to this site | Top-of-funnel differentiation; drives session depth |

### Form Best Practices
- **3 fields maximum for initial form:** Name, Phone, Suburb. Email optional. Longer forms kill conversion.
- Ask for roof type / service type via buttons (not dropdowns) for UX on mobile
- A confirmation SMS/email back to the lead increases show-up rate dramatically [ASSUMED]
- The existing QuoteBand form (name/phone/email via Supabase → Resend) is structurally correct; ensure suburb/service-type capture is added

### Chat Widgets
- LiveChat or Tidio are common; adds complexity and requires someone to actually respond
- For a small roofing contractor, a WhatsApp Business link is simpler and more authentic to AU tradie culture [ASSUMED based on market observation]

---

## 4. SEO Content Requirements

### Local SEO Essentials
1. **Google Business Profile** — complete, verified, with >20 photos, weekly posts, respond to all reviews. GBP proximity is the #1 local ranking factor.
2. **NAP consistency** — Business Name, Address, Phone must be identical across website, GBP, Yelp, TrueLocal, hipages, HiPages, Yellow Pages AU
3. **Suburb landing pages** — one page per major service area (e.g., `/roofing-parramatta`, `/roofing-bondi`, `/roofing-chatswood`). Minimum 500 words, unique content per page.
4. **"Areas We Serve" page** — links to all suburb pages; helps crawlability

### Schema Markup (JSON-LD, homepage `<head>`)
```json
{
  "@context": "https://schema.org",
  "@type": "RoofingContractor",
  "name": "Australian Roofing Contractors",
  "url": "https://roofing.sydney",
  "telephone": "+61-X-XXXX-XXXX",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Sydney",
    "addressRegion": "NSW",
    "addressCountry": "AU"
  },
  "areaServed": ["Sydney", "Greater Sydney", "NSW"],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "XXX"
  },
  "sameAs": ["https://www.google.com/maps/...", "https://www.facebook.com/..."]
}
```
Also add `FAQPage` schema on any FAQ section, and `Service` schema on each service page. [CITED: roofingseo.services/technical-seo/how-to-implement-schema-markup-for-roofers]

### Core Pages Required
| Page | Priority | Notes |
|------|----------|-------|
| Homepage | Done | Needs phone, licence, schema |
| Services (individual) | High | One page per service; currently single section only |
| About Us | High | Team, history, licences, certifications, insurance |
| Contact / Get a Quote | High | NAP, map embed, form, response time promise |
| Areas Served + Suburb Pages | High | Local SEO backbone |
| Gallery / Portfolio | Medium | Before/after, filterable by job type |
| Testimonials / Reviews | Medium | Real Google reviews embedded or quoted |
| FAQ | Medium | Targets long-tail, earns featured snippets |
| Blog | Low (initially) | 2-3 cornerstone posts: cost guide, Colorbond colours, roof lifespan |
| Privacy Policy | Done | Exists |
| Terms of Service | Done | Exists |

### Title Tag / Meta Description Patterns
- Homepage: `Metal Roofing Sydney | Colorbond Re-Roofing & Repairs | [Brand]`
- Service page: `Colorbond Roof Replacement Sydney — Free Quote | [Brand]`
- Suburb page: `Roofing Contractors Parramatta | Same-Week Response | [Brand]`
- Meta descriptions: 150–160 chars, include suburb + service + CTA ("Get a free quote today")

---

## 5. Production-Readiness Checklist

### Performance (Core Web Vitals — Global Google Thresholds, no AU-specific targets)
| Metric | Target | Notes |
|--------|--------|-------|
| LCP | ≤ 2.5s | Hero image + AI panel are the risk; use `priority` on LCP image (already done) |
| INP | ≤ 200ms | Interactive AI swatch panel — test with Lighthouse |
| CLS | ≤ 0.1 | Font swap (`display: swap` set), ensure image dimensions declared |

[CITED: web.dev/articles/defining-core-web-vitals-thresholds]

### Security
- [ ] HTTPS — Vercel provides automatically
- [ ] Security headers via `next.config.ts` (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS)
- [ ] CSP — start with Report-Only; tighten after testing (nonces needed for inline scripts in layout.tsx)
- [ ] Contact form honeypot field (add hidden `website` field; reject if populated)
- [ ] Rate-limit the `/api/leads` route (Vercel Edge Config or middleware)
- [ ] Supabase RLS policies on leads table — verify enabled
- [ ] No secrets with `NEXT_PUBLIC_` prefix

### Compliance
- **Australian Privacy Act:** Site uses GA4, Supabase (stores PII), Resend (sends PII). A Privacy Policy is present (good). Cookie consent banner is **not legally mandatory** for AU-only businesses under the $3M turnover exemption, but recommended if running Google Ads. [CITED: didomi.io/blog/australian-regulation-cookies-consent]
- **Required:** Privacy Policy must list all data collected, who it's shared with, and how to request deletion. Review current policy against this.
- **ABN display:** Not legally required on all pages, but good practice in footer.

### Analytics & Tracking
- [ ] GA4 property — connected, data stream live
- [ ] Google Ads conversion action — "Quote form submitted" event
- [ ] Google Ads call extension + call conversion tracking
- [ ] Google Search Console — site verified, sitemap submitted
- [ ] Call tracking (CallRail AU or similar) — assigns unique numbers per traffic source; critical for proving ROI from ads [ASSUMED: CallRail available in AU]

### Vercel Deployment
- [ ] All env vars set in Vercel dashboard (not just `.env.local`)
- [ ] Custom domain (`roofing.sydney`) with HTTPS — verified
- [ ] `metadataBase` set to production URL (done in `layout.tsx`)
- [ ] `next.config.ts` security headers configured
- [ ] Preview deployments password-protected (Vercel Deployment Protection)
- [ ] Edge Config / KV store for feature flags if needed for AI feature rollout
- [ ] `robots.txt` — allow all for now; add `sitemap` URL reference
- [ ] `sitemap.xml` — generate via `next-sitemap` or Next.js App Router built-in

---

## 6. Client Information Required (for `client-intake.md`)

### Business Identity
- Legal business name
- Trading name (if different)
- ABN
- ACN (if a company)
- Year established / years in business
- Physical address (or service-area-only — no shop front?)
- Primary phone number (for website + GBP)
- Primary email (for website + GBP)
- Website URL (confirm `roofing.sydney` is the canonical domain)

### Licences & Certifications
- NSW Fair Trading Contractor Licence number (and class)
- Any VBA / QBCC numbers if operating interstate
- BlueScope Colorbond accreditation / approved installer status
- Other manufacturer certs (e.g., Lysaght, Stramit)
- Public liability insurance provider + cover amount
- Home Warranty Insurance details (NSW: iCare HBC for work >$20,000)

### Services
- Complete list of services offered (with correct names — e.g., standing seam, corrugated, Longline, gutters, fascia, skylights, solar integration)
- Residential only, commercial only, or both?
- Emergency/after-hours repairs offered? What's the response time?
- Do they supply materials, or labour-only?
- Minimum job size?

### Service Area
- Exact suburbs/LGAs covered (for suburb pages)
- Any areas explicitly NOT covered
- Any specialisation by area (e.g., "mainly Inner West and Eastern Suburbs")

### Pricing & Warranties
- Indicative price ranges per service (homeowners search for this — "how much does a new roof cost")
- Workmanship warranty period and what it covers
- Materials warranty (BlueScope Colorbond is 30+ years on steel)
- Does the warranty transfer on property sale?
- Payment terms / deposits / payment methods

### Social Proof
- Google Business Profile URL (and current review count + rating)
- Facebook page URL
- Instagram handle (before/after photos)
- Any other directories (hipages, ServiceSeeking, Houzz)
- Top 5–10 Google reviews (text) to quote on website
- Video testimonials or case studies available?

### Team & About
- Owner/director name and brief bio
- Number of full-time staff / subcontractors
- Key staff bios (optional but builds trust)
- Founding story / why they started

### Visual Assets
- Company logo (SVG or high-res PNG, light + dark variants)
- Before/after photos of completed jobs (minimum 20, labelled by suburb and job type)
- Team photos (on-site preferred)
- Any existing brand guidelines or colour preferences

### Existing Digital Presence
- Current website (if any) — to audit for content to migrate
- Existing GBP — login access or confirm ownership
- Google Ads account — existing or starting fresh?
- Current social media accounts and login access
- Any existing reviews on other platforms (Word of Mouth, True Local, hipages)

### Legal & Compliance
- Privacy Policy owner / who to contact for data requests
- Terms of trade / payment dispute process
- Any pending disputes, legal issues that should NOT be referenced on site

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Mandatory website licence display is best practice but not explicitly legislated | Licence Display | If legislation exists, site is non-compliant |
| A2 | 65–75% of local service searches on mobile in AU | Design/UX | Low — directional guidance only |
| A3 | WhatsApp Business is culturally appropriate for AU tradies | CTA | Low — easily changed |
| A4 | CallRail is available in AU with local number tracking | Analytics | Medium — verify before recommending to client |
| A5 | Suburb pages are the primary local SEO lever over other strategies | SEO | Low — standard local SEO advice |
| A6 | Placeholder stats (2,400 roofs, 25yr warranty, 4.9/5) need client verification | Trust Signals | HIGH — fake stats are a legal risk in AU (ACCC) |

**A6 is the highest priority assumption: the current hero stats are placeholders. The client MUST provide real numbers before launch.**

---

## Sources

- [Traffira: Ultimate Roofing SEO Checklist 2025](https://traffira.com/ultimate-roofing-seo-checklist-2025/)
- [NSW Fair Trading — Building and Trade Licences](https://www.nsw.gov.au/business-and-economy/licences-and-credentials/building-and-trade-licences-and-registrations)
- [Oz Roofers — Roofing Licensing Requirements by State](https://ozroofers.com.au/guides/roofing-licensing-requirements/)
- [Roofing SEO Services — Schema Markup for Roofers](https://roofingseo.services/technical-seo/how-to-implement-schema-markup-for-roofers/)
- [web.dev — Core Web Vitals Thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds)
- [Didomi — Australian Cookie Consent Requirements](https://www.didomi.io/blog/australian-regulation-cookies-consent)
- [LegalVision AU — Cookie Consent Pop-Up](https://legalvision.com.au/cookie-consent-pop-up/)
- [Vercel — Production Checklist](https://vercel.com/docs/production-checklist)
- [Vercel — Security Headers / CSP](https://vercel.com/docs/headers/security-headers)
- [Roofing Revenue Marketing — Website Conversion](https://www.roofingrevenuemarketing.com/roofing-website-conversion-turn-traffic-into-roof-jobs/)
