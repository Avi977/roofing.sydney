# Phase 4: Main Site Rebrand + CTA Integration — Pattern Map

**Mapped:** 2026-04-25
**Files analyzed:** 7
**Analogs found:** 7 / 7 (all files are self-analogs — every file IS the target; patterns extracted directly from current state)

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/app/layout.tsx` | config (root metadata) | request-response (SSR) | Self — `src/app/layout.tsx` | exact |
| `src/app/page.tsx` | component (page) | request-response (SSR) + client nav | Self — `src/app/page.tsx` | exact |
| `src/components/site-header.tsx` | component (layout) | request-response (client render) | Self — `src/components/site-header.tsx` | exact |
| `src/components/site-footer.tsx` | component (layout) | request-response (client render) | Self — `src/components/site-footer.tsx` | exact |
| `src/app/privacy/page.tsx` | component (page) | request-response (SSR) | `src/app/terms/page.tsx` | role-match |
| `src/app/terms/page.tsx` | component (page) | request-response (SSR) | `src/app/privacy/page.tsx` | role-match |
| `src/lib/email.ts` | service (email) | request-response (API) | Self — `src/lib/email.ts` | exact |

---

## Pattern Assignments

### `src/app/layout.tsx` (config, root metadata)

**Change type:** Metadata string replacements — `title` flat string → `title` object with `default`+`template`, `openGraph.title` update.

**Current state** (lines 10–21):
```typescript
export const metadata: Metadata = {
  title: "roofing.sydney — See your new Colorbond roof before you commit",
  description:
    "Pick a Colorbond colour and see a realistic preview on your actual Sydney home. Free aerial visualisation, free quote, no obligation.",
  metadataBase: new URL("https://roofing.sydney"),
  openGraph: {
    title: "See your new Colorbond roof before you commit",
    description:
      "Pick a colour. See it on your actual roof. Book a free quote.",
    type: "website",
  },
};
```

**Target state** (replace lines 10–21):
```typescript
export const metadata: Metadata = {
  title: {
    default: "Australian Roofing Contractors — See your new Colorbond roof before you commit",
    template: "%s — Australian Roofing Contractors",
  },
  description:
    "Pick a Colorbond colour and see a realistic preview on your actual Sydney home. Free aerial visualisation, free quote, no obligation.",
  metadataBase: new URL("https://roofing.sydney"),
  openGraph: {
    title: "Australian Roofing Contractors — See your new Colorbond roof",
    description:
      "Pick a colour. See it on your actual roof. Book a free quote.",
    type: "website",
  },
};
```

**Invariants (DO NOT CHANGE):**
- `metadataBase: new URL("https://roofing.sydney")` — line 14, infrastructure URL
- `description` — line 12–13, no brand text, no change needed
- `openGraph.description` — line 18, no brand text, no change needed
- `inter` font setup — lines 1–8 + 23–33, no change

---

### `src/app/page.tsx` (component, page — CTA insertion)

**Change type:** Insert new JSX `<section>` block. Also add `Link` import from `next/link`.

**Current imports** (lines 1–3):
```tsx
import { AddressAutocomplete } from "@/components/address-autocomplete";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
```

**Target imports** (add `Link`):
```tsx
import Link from "next/link";
import { AddressAutocomplete } from "@/components/address-autocomplete";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
```

**Insertion boundary** (lines 39–41 — current code):
```tsx
        </section>                              {/* ← hero closes here, line 39 */}

        <section id="how" className="border-t border-border bg-surface">  {/* ← line 41 */}
```

**New CTA section to insert between lines 39 and 41:**
```tsx
        <section className="border-t border-border">
          <div className="mx-auto max-w-5xl px-6 py-12 text-center">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Ready to see your new roof?
            </h2>
            <p className="mt-3 mx-auto max-w-md text-sm text-muted">
              Use our free AI visualiser to preview Colorbond colours on your actual
              home — then book a no-obligation quote.
            </p>
            <Link
              href="/preview"
              className="mt-6 inline-flex items-center rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90"
            >
              Check My Roof Design
            </Link>
          </div>
        </section>
```

**Existing pill button pattern (analog source for CTA button classes)** — `src/components/site-header.tsx` lines 22–27:
```tsx
<Link
  href="/#how"
  className="rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-surface"
>
  Free quote
</Link>
```
CTA button scales up: `px-5 py-2.5 text-sm font-semibold` vs nav `px-3.5 py-1.5 text-xs font-medium`; inverted fill `bg-foreground text-background` vs nav `bg-background text-foreground`.

**Invariants (DO NOT CHANGE):**
- All existing sections: hero (lines 11–39), `#how` (lines 41–64), Trust (lines 66–72)
- `Step` and `Trust` helper functions (lines 80–99)

---

### `src/components/site-header.tsx` (component, layout)

**Change type:** Single text node replacement in logo `<span>`.

**Current state** (lines 9–11):
```tsx
          <span className="text-sm font-semibold tracking-tight text-foreground">
            roofing.sydney
          </span>
```

**Target state** (lines 9–11):
```tsx
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Australian Roofing Contractors
          </span>
```

**Invariants (DO NOT CHANGE):**
- All Tailwind classes on the `<span>` — no class changes
- `LogoMark` SVG (lines 34–52)
- Nav links (lines 13–28)
- `Link href="/"` wrapper (line 7)

---

### `src/components/site-footer.tsx` (component, layout)

**Change type:** Single brand text replacement in copyright line.

**Current state** (lines 6–8):
```tsx
        <div>
          &copy; {new Date().getFullYear()} roofing.sydney &middot; Licensed
          metal roofing contractor
        </div>
```

**Target state** (lines 6–8):
```tsx
        <div>
          &copy; {new Date().getFullYear()} Australian Roofing Contractors &middot; Licensed
          metal roofing contractor
        </div>
```

**Invariants (DO NOT CHANGE):**
- `&copy;`, `{new Date().getFullYear()}`, `&middot;`, `Licensed metal roofing contractor` — all unchanged
- Privacy / Terms nav links (lines 9–15)
- All Tailwind classes

---

### `src/app/privacy/page.tsx` (component, legal page)

**Change type:** Three replacements — metadata `title`, metadata `description`, body paragraph text.

**Current metadata** (lines 5–8):
```tsx
export const metadata = {
  title: "Privacy Policy — roofing.sydney",
  description: "How roofing.sydney collects, uses and protects your personal information.",
};
```

**Target metadata** (lines 5–8):
```tsx
export const metadata = {
  title: "Privacy Policy",
  description: "How Australian Roofing Contractors collects, uses and protects your personal information.",
};
```

Note: `title` becomes short-form only (`"Privacy Policy"`) because root `layout.tsx` template will auto-append `" — Australian Roofing Contractors"`. Full rendered title = `Privacy Policy — Australian Roofing Contractors`.

**Current body text** (lines 27–31):
```tsx
              <p className="mt-2 text-muted">
                roofing.sydney is operated by a licensed metal roofing contractor based in Sydney,
                New South Wales, Australia. We offer an online roof colour preview tool and connect
                homeowners with our quoting team.
              </p>
```

**Target body text** (lines 27–31):
```tsx
              <p className="mt-2 text-muted">
                Australian Roofing Contractors is operated by a licensed metal roofing contractor based in Sydney,
                New South Wales, Australia. We offer an online roof colour preview tool and connect
                homeowners with our quoting team.
              </p>
```

**Invariants (DO NOT CHANGE):**
- `privacy@roofing.sydney` email address (line 127–129) — live mail routing
- All section headings, all other body paragraphs
- All Tailwind classes, `Link`, `SiteHeader`, `SiteFooter` imports

---

### `src/app/terms/page.tsx` (component, legal page)

**Change type:** Three replacements — metadata `title`, metadata `description`, two body text occurrences.

**Current metadata** (lines 5–8):
```tsx
export const metadata = {
  title: "Terms of Service — roofing.sydney",
  description: "Terms governing your use of the roofing.sydney website.",
};
```

**Target metadata** (lines 5–8):
```tsx
export const metadata = {
  title: "Terms of Service",
  description: "Terms governing your use of the Australian Roofing Contractors website.",
};
```

Note: same short-form `title` pattern as privacy — template appends suffix automatically.

**Current body text occurrence 1** (lines 27–30, section 1 "Acceptance"):
```tsx
              <p className="mt-2 text-muted">
                By accessing or using roofing.sydney (&ldquo;the Service&rdquo;) you agree to be
                bound by these Terms. If you do not agree, please do not use the Service.
              </p>
```

**Target body text occurrence 1**:
```tsx
              <p className="mt-2 text-muted">
                By accessing or using Australian Roofing Contractors (&ldquo;the Service&rdquo;) you agree to be
                bound by these Terms. If you do not agree, please do not use the Service.
              </p>
```

**Current body text occurrence 2** (lines 82–85, section 7 "Intellectual property"):
```tsx
              <p className="mt-2 text-muted">
                All content on the Service, except aerial imagery, is owned by or licensed to
                roofing.sydney. You may not reproduce, distribute or create derivative works
                without our express written consent.
              </p>
```

**Target body text occurrence 2**:
```tsx
              <p className="mt-2 text-muted">
                All content on the Service, except aerial imagery, is owned by or licensed to
                Australian Roofing Contractors. You may not reproduce, distribute or create derivative works
                without our express written consent.
              </p>
```

**Invariants (DO NOT CHANGE):**
- `hello@roofing.sydney` email address (lines 117–119) — live mail routing
- All other section bodies (sections 2–6, 8–10)
- All Tailwind classes, imports

---

### `src/lib/email.ts` (service, email)

**Change type:** Two string replacements — `from:` display name (line 28), first line of `buildText` array (line 39).

**Current `from:` field** (line 28):
```typescript
    from: `roofing.sydney <${from}>`,
```

**Target `from:` field** (line 28):
```typescript
    from: `Australian Roofing Contractors <${from}>`,
```

**Current `buildText` first line** (line 39):
```typescript
    `New quote request from roofing.sydney`,
```

**Target `buildText` first line** (line 39):
```typescript
    `New quote request from Australian Roofing Contractors`,
```

**Invariants (DO NOT CHANGE):**
- `<${from}>` template variable — this is the actual email address, domain must stay unchanged
- `subject` line (line 23): `"New roofing quote request — ${lead.name}"` — no brand text, no change
- `buildHtml` H1 (line 68): `"New roofing quote request"` — generic, no brand text, no change
- All Resend API call structure, all other fields
- `RESEND_API_KEY`, `CONTRACTOR_NOTIFICATION_EMAIL`, `LEAD_NOTIFICATION_FROM` env vars — unchanged

---

## Shared Patterns

### Next.js `<Link>` Client Navigation Pattern
**Source:** `src/components/site-header.tsx` lines 7, 22–27
**Apply to:** New CTA section in `src/app/page.tsx`
```tsx
import Link from "next/link";
// ...
<Link href="/preview" className="...">
  Check My Roof Design
</Link>
```
Rule: Internal routes always use `<Link href="...">` — never `<a href>` for internal navigation. No `target="_blank"`. No `rel` attribute needed.

### Inverted Pill Button Pattern
**Source:** `src/components/site-header.tsx` lines 22–27
**Apply to:** CTA button in `src/app/page.tsx`
```tsx
// Nav pill (smaller, outlined):
className="rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-surface"

// CTA pill (larger, filled — copy this pattern, scale up):
className="mt-6 inline-flex items-center rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90"
```

### Metadata Short-Title Pattern
**Source:** `src/app/privacy/page.tsx` and `src/app/terms/page.tsx` (post-edit)
**Apply to:** Both legal page files
```typescript
// Page-level: short title only — template in root layout appends suffix
export const metadata = {
  title: "Privacy Policy",   // renders as: Privacy Policy — Australian Roofing Contractors
};
// Root layout provides:
title: { default: "...", template: "%s — Australian Roofing Contractors" }
```

### Section Container Pattern
**Source:** `src/app/page.tsx` lines 41–64 (`#how` section)
**Apply to:** New CTA section in `src/app/page.tsx`
```tsx
// Existing #how uses: border-t border-border bg-surface + max-w-5xl px-6 py-16
// CTA section uses:   border-t border-border           + max-w-5xl px-6 py-12
// (no bg-surface — CTA stays in hero white band; py-12 vs py-16 signals supporting hierarchy)
```

---

## BRD-02 Verification Task

**No code changes required.** Plan must include a verification grep step only:

```bash
grep -r "tile\|terracotta\|slate\|concrete\|clay\|asphalt\|shingle" src/ --include="*.ts" --include="*.tsx"
```

Expected result: zero matches. If zero matches confirmed, close BRD-02 in the commit message:
`chore: verify BRD-02 — zero non-metal roof type references in src/`

---

## No Analog Found

None. All 7 files are pre-existing in the codebase and were read directly. No new files are created in this phase. No file requires a pattern from outside the codebase.

---

## Critical Anti-Patterns (from RESEARCH.md — enforce in planning)

| Anti-Pattern | File | What to Avoid |
|---|---|---|
| Changing `metadataBase` | `src/app/layout.tsx` line 14 | `new URL("https://roofing.sydney")` — keep exactly as-is |
| Changing email addresses | `src/app/privacy/page.tsx` line 127, `src/app/terms/page.tsx` line 117 | `privacy@roofing.sydney`, `hello@roofing.sydney` — keep exactly as-is |
| Changing email domain in `from:` | `src/lib/email.ts` line 28 | `<${from}>` — only the display name prefix changes |
| Flat string `title` in layout | `src/app/layout.tsx` | Must use `{ default, template }` object — not `title: "string"` |
| External `<a>` for CTA | `src/app/page.tsx` | Must use `<Link href="/preview">` — not `<a href="https://roofing.sydney">` |

---

## Metadata

**Analog search scope:** All 7 target files read directly (self-analogs). No external analog search required — this phase is entirely in-place edits with exact before/after context extracted.
**Files scanned:** 7 source files + 3 planning documents (CONTEXT.md, RESEARCH.md, UI-SPEC.md)
**Pattern extraction date:** 2026-04-25
