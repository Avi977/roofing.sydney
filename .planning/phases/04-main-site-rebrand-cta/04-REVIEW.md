---
phase: 04-main-site-rebrand-cta
reviewed: 2026-04-25T00:00:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - src/app/layout.tsx
  - src/components/site-header.tsx
  - src/components/site-footer.tsx
  - src/lib/email.ts
  - src/app/page.tsx
  - src/app/privacy/page.tsx
  - src/app/terms/page.tsx
findings:
  critical: 0
  warning: 3
  info: 4
  total: 7
status: issues_found
---

# Phase 4: Code Review Report

**Reviewed:** 2026-04-25T00:00:00Z
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

Seven source files covering the main site layout, header, footer, home page, email notification module, and legal pages were reviewed. No security vulnerabilities or critical bugs were found. Three warnings were identified: a missing `font-sans` (or equivalent) base class in the root `<body>`, a raw `<a>` tag used instead of Next.js `<Link>` for internal routes in the footer, and an unescaped Google Maps URL built from user-supplied coordinates passed directly into an HTML `href` attribute without URL encoding. Four informational items cover minor quality improvements.

---

## Warnings

### WR-01: Google Maps URL in HTML email is not URL-encoded

**File:** `src/lib/email.ts:71`
**Issue:** `mapsLink` is constructed by interpolating `lead.lat` and `lead.lng` directly into a URL string (line 20) and then inserted into the HTML body via template literal interpolation (line 71) without going through `escapeHtml`. Although `lat`/`lng` are asserted to be `number` at construction time (line 19), the resulting URL string is later placed inside an `href` attribute in raw HTML without HTML-escaping. If the validated `LeadInput` type were ever extended to allow string lat/lng (e.g. from an API change), the raw interpolation on line 71 would be an XSS vector in the email client. Additionally, the URL is never percent-encoded, which could produce a broken link if coordinates are unusual (e.g. negative values with a `-` already handled, but scientific notation edge cases exist).

**Fix:** Pass `mapsLink` through `escapeHtml` at the point of HTML insertion:
```typescript
// line 71 — replace the raw interpolation
${mapsLink ? `<p style="font-size:14px"><a href="${escapeHtml(mapsLink)}">Open in Google Maps</a></p>` : ""}
```

---

### WR-02: Footer uses `<a>` instead of `<Link>` for internal routes

**File:** `src/components/site-footer.tsx:10-14`
**Issue:** Privacy and Terms links use native `<a href="/privacy">` and `<a href="/terms">`. In a Next.js App Router project these are same-origin routes. Using `<a>` instead of `<Link>` forces a full-page navigation (and a new network request), discarding the client-side navigation optimisation and prefetch behaviour that `<Link>` provides. This is a correctness issue when the rest of the site uses `<Link>` (header, page.tsx) consistently.

**Fix:**
```tsx
import Link from "next/link";
// ...
<Link href="/privacy" className="hover:text-foreground">Privacy</Link>
<Link href="/terms" className="hover:text-foreground">Terms</Link>
```

---

### WR-03: `<body>` class does not apply the CSS custom font variable

**File:** `src/app/layout.tsx:33`
**Issue:** The Inter font is loaded and assigned to the CSS variable `--font-inter`, but the `<body>` only applies `inter.variable` (which sets the CSS var) and `antialiased`. There is no `font-sans` or `font-[var(--font-inter)]` class, so `--font-inter` is declared on the element but never consumed by any Tailwind utility unless `tailwind.config` maps `fontFamily.sans` to `var(--font-inter)`. If that mapping is absent the entire site falls back to the browser's default sans-serif rather than Inter, meaning the font is loaded but silently unused.

**Fix:** Verify `tailwind.config.ts` has:
```ts
theme: {
  extend: {
    fontFamily: {
      sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
    },
  },
},
```
If that mapping does not exist, add `font-[family-name:var(--font-inter)]` or a `font-sans` utility to the `<body>` class explicitly:
```tsx
<body className={`${inter.variable} font-sans antialiased`}>{children}</body>
```

---

## Info

### IN-01: OpenGraph metadata is missing `url` and `images` fields

**File:** `src/app/layout.tsx:18-23`
**Issue:** The `openGraph` block omits `url` and `images`. Without `url`, some crawlers and link-preview tools may not resolve the canonical URL. Without `images`, the social card for the home page will render as a text-only card.

**Fix:**
```ts
openGraph: {
  url: "https://roofing.sydney",
  title: "...",
  description: "...",
  type: "website",
  images: [{ url: "https://roofing.sydney/og-image.jpg", width: 1200, height: 630 }],
},
```

---

### IN-02: `LogoMark` SVG is missing a `title` for screen readers

**File:** `src/components/site-header.tsx:36-51`
**Issue:** The SVG has `aria-hidden` set, which removes it from the accessibility tree. That is correct if the adjacent text "Australian Roofing Contractors" provides the accessible label for the link. However, the wrapping `<Link>` has no `aria-label`, so the link's accessible name is derived entirely from the visible text span. This is correct as-is, but a linked `aria-label` on the `<Link>` would be more explicit and resilient to future text changes.

**Fix:** Add `aria-label` to the anchor for robustness:
```tsx
<Link href="/" aria-label="Australian Roofing Contractors — home" className="flex items-center gap-2">
```

---

### IN-03: Privacy page uses `prose` class with manual `text-sm` overrides throughout

**File:** `src/app/privacy/page.tsx:24`
**Issue:** The container uses `className="prose mt-8 space-y-8 text-sm ..."` but then every child `<p>` and `<ul>` individually re-specifies `text-muted`, `text-sm`, and `mt-2`. The `prose` class from `@tailwindcss/typography` already sets typography defaults; mixing it with per-element overrides creates redundant and brittle styling. The Terms page (`src/app/terms/page.tsx:24`) does not apply `prose` and is internally consistent — the two pages use different patterns for the same content type.

**Fix:** Either remove `prose` and keep the manual classes (consistent with terms page), or fully embrace `prose` and remove per-element utility overrides. Align both pages to the same pattern.

---

### IN-04: Hardcoded `"onboarding@resend.dev"` fallback sender domain

**File:** `src/lib/email.ts:15`
**Issue:** The `from` address falls back to `onboarding@resend.dev` when `LEAD_NOTIFICATION_FROM` is unset. Resend's `onboarding@resend.dev` is a shared sandbox domain and is not intended for production use. Emails sent from this address are rate-limited and may be filtered. In production without the env var set, lead notifications would silently be sent from an unbranded address or fail delivery without any thrown error.

**Fix:** Either remove the fallback and throw when the env var is absent (matching the `CONTRACTOR_NOTIFICATION_EMAIL` pattern), or document the default as development-only with a warning log:
```ts
const from = process.env.LEAD_NOTIFICATION_FROM;
if (!from) throw new Error("LEAD_NOTIFICATION_FROM is not set");
```

---

_Reviewed: 2026-04-25T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
