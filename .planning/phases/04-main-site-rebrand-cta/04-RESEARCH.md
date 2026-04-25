# Phase 4: Main Site Rebrand + CTA Integration — Research

**Researched:** 2026-04-24
**Domain:** Next.js 15 App Router — metadata, copy, UI component editing
**Confidence:** HIGH

---

## Summary

Phase 4 is a pure content/branding edit on THIS Next.js app (roofing.sydney). There is no separate "Australian Roofing Contractors" website — the ROADMAP description is aspirational branding for this same codebase. The goal is to rename visible brand text from "roofing.sydney" to "Australian Roofing Contractors" across metadata, header, footer, and legal pages, and to add a prominent "Check My Roof Design" CTA section on the home page that links externally to `https://roofing.sydney`.

**Key disambiguation:** The ROADMAP says "rebrand the main Australian Roofing Contractors website" but there is only one codebase in this repo — the roofing.sydney Next.js app. The rebrand IS this app. The CTA links OUT to `https://roofing.sydney` — which is the live deployment URL of this very app. This is a slight contradiction in the roadmap: the site being rebranded IS roofing.sydney, and the CTA destination IS roofing.sydney. The planner must clarify with Ace before execution — see Open Questions.

Phase scope is well-bounded: no new dependencies, no schema changes, no API work. All changes are in existing files. The BRD-02 requirement (remove non-metal roof types) is a near-no-op — the current copy already only references metal roofing and Colorbond. No tile, terracotta, or slate references exist in user-facing copy. The email templates and footer already say "licensed metal roofing contractor".

**Primary recommendation:** Treat Phase 4 as two discrete tasks: (1) copy/metadata find-and-replace across identified files, and (2) add a new CTA section component to `src/app/page.tsx`. Both tasks are independent and can be executed sequentially in one wave.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Site title / meta tags | Frontend Server (SSR) | — | Next.js `export const metadata` in layout.tsx and page-level files |
| Logo / header brand text | Browser / Client | — | `site-header.tsx` renders the visible brand name |
| Footer copyright text | Browser / Client | — | `site-footer.tsx` static text |
| Legal page brand text | Frontend Server (SSR) | — | `privacy/page.tsx`, `terms/page.tsx` — static content |
| "Check My Roof Design" CTA | Browser / Client | — | New JSX section in `page.tsx`, external `<a>` tag |
| Email notification sender name | API / Backend | — | `email.ts` — Resend `from:` field |

---

## Branding Audit (Current State)

Complete inventory of all "roofing.sydney" brand text in source, found via grep. No CONTEXT.md exists for this phase — no prior locked decisions.

### Files Containing Visible Brand Text

| File | Location | Current Text | BRD-01 Action |
|------|----------|-------------|---------------|
| `src/app/layout.tsx` | `metadata.title` | `"roofing.sydney — See your new Colorbond roof before you commit"` | Update |
| `src/app/layout.tsx` | `metadata.description` | `"...roofing.sydney..."` — does not contain brand name literally | No change needed |
| `src/app/layout.tsx` | `metadata.metadataBase` | `new URL("https://roofing.sydney")` | Keep — this is the deployment URL, not a brand label |
| `src/app/layout.tsx` | `openGraph.title` | `"See your new Colorbond roof before you commit"` | Consider updating |
| `src/components/site-header.tsx` | Logo span text | `roofing.sydney` | Update to `Australian Roofing Contractors` |
| `src/components/site-footer.tsx` | Copyright text | `roofing.sydney · Licensed metal roofing contractor` | Update |
| `src/app/privacy/page.tsx` | `metadata.title` | `"Privacy Policy — roofing.sydney"` | Update |
| `src/app/privacy/page.tsx` | `metadata.description` | `"How roofing.sydney collects..."` | Update |
| `src/app/privacy/page.tsx` | Body text (line 28) | `roofing.sydney is operated by...` | Update |
| `src/app/privacy/page.tsx` | Contact email link (line 127-128) | `privacy@roofing.sydney` | Keep — live email address, not brand label |
| `src/app/terms/page.tsx` | `metadata.title` | `"Terms of Service — roofing.sydney"` | Update |
| `src/app/terms/page.tsx` | `metadata.description` | `"Terms governing...roofing.sydney..."` | Update |
| `src/app/terms/page.tsx` | Body text (lines 28, 83) | `roofing.sydney` (2 occurrences) | Update |
| `src/app/terms/page.tsx` | Contact email link (line 117-118) | `hello@roofing.sydney` | Keep — live email address |
| `src/lib/email.ts` | `from:` field (line 28) | `roofing.sydney <${from}>` | Update sender name only, keep domain |
| `src/lib/email.ts` | `buildText` (line 39) | `"New quote request from roofing.sydney"` | Update |
| `src/app/sitemap.ts` | `base` URL | `"https://roofing.sydney"` | Keep — deployment URL |
| `src/app/robots.ts` | Sitemap URL | `"https://roofing.sydney/sitemap.xml"` | Keep — deployment URL |

### Files With No Brand Text to Change

- `src/app/page.tsx` — No "roofing.sydney" text; hero copy uses "Colorbond", "Sydney", "metal roofer"
- `src/app/preview/page.tsx` — No brand text
- All API routes — No brand text
- All lib files except `email.ts` — No brand text

### BRD-02: Non-Metal Roof Type Audit

Searched all `*.tsx` and `*.ts` source files for: tile, terracotta, slate, concrete, clay, asphalt, shingle.

**Result: Zero matches in user-facing copy.** [VERIFIED: grep across full src/]

The current codebase is already metal/Colorbond-only in its copy. The "How it works" step 3 says "licensed metal roofer". The lead-form says "local metal roofer". The footer says "Licensed metal roofing contractor". BRD-02 is effectively already satisfied — the plan should verify this and mark it complete with no code changes required.

---

## Standard Stack

No new dependencies needed for this phase. All work uses the existing stack.

### Existing Stack (Relevant to This Phase)

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| Next.js | 15.5.15 | App Router, metadata API | [VERIFIED: package.json] |
| React | 19.1.0 | Component rendering | [VERIFIED: package.json] |
| Tailwind CSS | ^4 | Styling for CTA section | [VERIFIED: package.json] |

**No `npm install` required for this phase.**

---

## Architecture Patterns

### How Next.js 15 Metadata Works [ASSUMED — standard App Router pattern]

Metadata is set per-route via `export const metadata` (static) or `export async function generateMetadata()` (dynamic). The root `layout.tsx` sets site-wide defaults. Individual page files can override with their own `export const metadata`.

For this phase, update:
1. `src/app/layout.tsx` — root metadata (title template + description)
2. `src/app/privacy/page.tsx` — page-level override
3. `src/app/terms/page.tsx` — page-level override

### Recommended Title Pattern [ASSUMED — convention]

Use a title template in layout.tsx so page titles are consistent:

```typescript
// src/app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: "Australian Roofing Contractors",
    template: "%s — Australian Roofing Contractors",
  },
  description: "...",
};
```

Page-level metadata then only needs to set `title: "Privacy Policy"` and the template applies automatically.

### CTA Section Pattern

The "Check My Roof Design" CTA links to `https://roofing.sydney` which is the live URL of this same deployed app. This creates a self-referential link — see Open Questions. Regardless, the implementation is a standard `<a>` tag with `target="_blank" rel="noopener noreferrer"` since the ROADMAP specifies treating it as an external product link.

Placement: After the hero section, before or after the "How it works" section. Given the page structure, inserting between the hero and "How it works" is the highest-visibility position.

```tsx
// New section in src/app/page.tsx — between hero and #how sections
<section className="border-t border-border">
  <div className="mx-auto max-w-5xl px-6 py-12 text-center">
    <h2 className="text-xl font-semibold text-foreground">
      Ready to see your new roof?
    </h2>
    <p className="mt-3 text-sm text-muted">
      Use our AI roof visualiser to preview Colorbond colours on your actual home.
    </p>
    <a
      href="https://roofing.sydney"
      target="_blank"
      rel="noopener noreferrer"
      className="mt-6 inline-flex items-center rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90"
    >
      Check My Roof Design
    </a>
  </div>
</section>
```

### Recommended Project Structure

No structural changes. All edits are in-place within existing files:

```
src/
├── app/
│   ├── layout.tsx          (metadata update)
│   ├── page.tsx            (add CTA section)
│   ├── privacy/page.tsx    (metadata + body text update)
│   └── terms/page.tsx      (metadata + body text update)
├── components/
│   ├── site-header.tsx     (logo text update)
│   └── site-footer.tsx     (copyright text update)
└── lib/
    └── email.ts            (sender name update)
```

### Anti-Patterns to Avoid

- **Changing `metadataBase` URL:** `new URL("https://roofing.sydney")` in layout.tsx must stay — it controls OG image resolution and sitemap. Do not change to "Australian Roofing Contractors".
- **Changing email addresses:** `privacy@roofing.sydney` and `hello@roofing.sydney` are live email addresses. Renaming them would break real mail routing. Only update the display name in the `from:` field.
- **Changing sitemap/robots URLs:** These reference the deployment domain. Leave them alone.
- **Over-scoping BRD-02:** No non-metal roof types exist in current copy. Do not rewrite copy unnecessarily — just verify and document.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CTA button styling | Custom CSS | Tailwind utility classes (existing pattern in codebase) | Consistent with `rounded-full`, `px-3.5`, `py-1.5` used in header nav |
| Metadata title templating | Manual string concat in each page | Next.js `title.template` in root layout | Built-in, eliminates repetition across pages |

---

## Runtime State Inventory

> This is a branding/copy phase, not a rename/refactor of infrastructure. However, checking for runtime state with the old brand name is warranted.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | Email sender name `roofing.sydney` in Resend sends — historical emails sent are immutable, future sends update via `email.ts` code edit | Code edit only (email.ts line 28, 39) |
| Live service config | Resend sender domain is tied to DNS records for `roofing.sydney` — sender name changes but domain stays same | No DNS change needed |
| OS-registered state | None — Vercel deployment, no OS-level registration | None |
| Secrets/env vars | `CONTRACTOR_NOTIFICATION_EMAIL`, `RESEND_API_KEY`, `LEAD_NOTIFICATION_FROM` — none reference brand name | None |
| Build artifacts | None — Vercel builds from source on each deploy | None |

**Nothing found in category:** OS-registered state — verified by inspection. Secrets/env vars — verified by grep.

---

## Common Pitfalls

### Pitfall 1: Self-Referential CTA Link
**What goes wrong:** The CTA is meant to link to roofing.sydney "as a separate product", but this IS the roofing.sydney app. Linking to `https://roofing.sydney` from within the same site just reloads the home page. The CTA has no destination that is distinct from the current site.
**Why it happens:** The ROADMAP was written assuming a separate contractor site would exist, from which this app would be linked.
**How to avoid:** Clarify with Ace — see Open Questions. Likely interpretation: the "main site" refers to a hypothetical future separate contractor business site, and this phase's work is pre-building what that site would look like. Or, the CTA destination should be the `/preview` path of roofing.sydney, not the home.
**Warning signs:** If CTA links to `https://roofing.sydney` from `https://roofing.sydney`, it just reloads the same page. The ROADMAP success criterion says "links to `https://roofing.sydney` that opens correctly" — which is trivially satisfiable by any `<a>` tag.

### Pitfall 2: Breaking Email Sender Domain
**What goes wrong:** Updating `from: 'roofing.sydney <${from}>'` to use "Australian Roofing Contractors" in the display name while keeping the domain is correct. Accidentally changing the FROM email address domain breaks Resend DKIM/SPF verification.
**Why it happens:** Confusion between display name and email domain in the `from:` field.
**How to avoid:** Only update the display name portion. Keep `<${from}>` unchanged.

### Pitfall 3: Metadata Override Conflicts
**What goes wrong:** If the root layout sets `title: "Australian Roofing Contractors"` as a plain string instead of a template object, page-level `export const metadata = { title: "Privacy Policy — Australian Roofing Contractors" }` works but you lose the template pattern and must manually suffix every page.
**Why it happens:** Forgetting Next.js supports `title.template`.
**How to avoid:** Use `title: { default: "...", template: "%s — Australian Roofing Contractors" }` in root layout. Update page-level titles to just `"Privacy Policy"` etc.

---

## Open Questions

1. **CTA Link Destination — Critical Ambiguity**
   - What we know: The ROADMAP says add a CTA to "roofing.sydney" — but this IS the roofing.sydney site. Linking to `https://roofing.sydney` from the same site creates a no-op link.
   - What's unclear: Does Ace want the CTA to link to `/preview` (the AI tool section within the same site)? Or is Phase 4 meant to be applied to a FUTURE separate contractor business site (not yet built)?
   - Recommendation: Ask Ace before execution. Most likely: CTA should link to `https://roofing.sydney` and open the address entry flow (i.e., the home page or `/preview`). If this is for the existing site, the CTA is a scroll-down anchor or an internal route. If this is pre-work for a future separate site, implement as written and note it won't make sense until the other site exists.

2. **Scope of "Australian Roofing Contractors" branding**
   - What we know: Phase 4 renames the brand on this site to "Australian Roofing Contractors".
   - What's unclear: Does this mean the `package.json` `"name"` field changes too? Does the `metadataBase` URL change? Does the domain change?
   - Recommendation: No — only change visible user-facing text. Keep `metadataBase`, sitemap URLs, email addresses, and `package.json` name as-is. These reference infrastructure, not brand display.

---

## Code Examples

### Metadata Update in layout.tsx [ASSUMED — standard Next.js 15 pattern]

```typescript
// src/app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: "Australian Roofing Contractors",
    template: "%s — Australian Roofing Contractors",
  },
  description:
    "Pick a Colorbond colour and see a realistic preview on your actual Sydney home. Free aerial visualisation, free quote, no obligation.",
  metadataBase: new URL("https://roofing.sydney"), // KEEP — deployment URL
  openGraph: {
    title: "Australian Roofing Contractors — See your new Colorbond roof",
    description: "Pick a colour. See it on your actual roof. Book a free quote.",
    type: "website",
  },
};
```

### Header Logo Text Update

```tsx
// src/components/site-header.tsx
<span className="text-sm font-semibold tracking-tight text-foreground">
  Australian Roofing Contractors
</span>
```

### Footer Copyright Update

```tsx
// src/components/site-footer.tsx
&copy; {new Date().getFullYear()} Australian Roofing Contractors &middot; Licensed
metal roofing contractor
```

### Email Sender Display Name Update

```typescript
// src/lib/email.ts
from: `Australian Roofing Contractors <${from}>`,
// ...
`New quote request from Australian Roofing Contractors`,
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `title: string` (flat) in Next.js metadata | `title: { default, template }` object | Next.js 13+ App Router | Enables automatic title suffixing without per-page repetition |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Next.js 15 supports `title.template` object in Metadata export | Code Examples | Low — this is core App Router API, very stable; worst case use flat string |
| A2 | Changing the `from:` display name in Resend does not require domain re-verification | Runtime State Inventory | Medium — if wrong, email delivery fails; verify in Resend dashboard before deploying |
| A3 | CTA intended to link to `https://roofing.sydney` as an external URL, not an anchor | Architecture Patterns | High — see Open Questions; this is the primary ambiguity of the phase |

---

## Environment Availability

Step 2.6: SKIPPED — Phase 4 is purely code/copy edits within the existing Next.js codebase. No new external tools, services, CLIs, runtimes, databases, or APIs are required.

---

## Sources

### Primary (HIGH confidence)
- Codebase grep (full src/ scan) — all branding occurrences verified [VERIFIED]
- `src/app/layout.tsx`, `site-header.tsx`, `site-footer.tsx`, `email.ts`, `privacy/page.tsx`, `terms/page.tsx`, `page.tsx` — read directly [VERIFIED]
- `package.json` — stack versions confirmed [VERIFIED]
- `.planning/ROADMAP.md` — BRD-01, BRD-02, BRD-03 definitions [VERIFIED]
- `.planning/config.json` — `nyquist_validation: false` confirmed [VERIFIED]

### Secondary (MEDIUM confidence)
- Next.js 15 metadata title template pattern [ASSUMED — training knowledge, stable API]

---

## Metadata

**Confidence breakdown:**
- File inventory / branding audit: HIGH — direct grep + file reads
- BRD-02 (non-metal removal): HIGH — confirmed zero occurrences in source
- CTA implementation pattern: HIGH — standard HTML/Tailwind in existing style
- CTA link destination intent: LOW — ambiguous from ROADMAP wording; see Open Questions
- Next.js metadata title template: MEDIUM — training knowledge, stable API

**Research date:** 2026-04-24
**Valid until:** 2026-05-24 (stable domain — Next.js metadata API rarely changes)

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BRD-01 | Rebrand site to Australian Roofing Contractors | 9 files identified with brand text; complete change list in Branding Audit table |
| BRD-02 | Metal roofing only — remove non-metal roof types | No non-metal references found in copy; BRD-02 is already satisfied — plan should verify and close |
| BRD-03 | "Check My Roof Design" CTA → roofing.sydney | CTA section pattern documented; destination ambiguity flagged as Open Question requiring Ace input |
</phase_requirements>
