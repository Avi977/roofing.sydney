# Phase 4: Main Site Rebrand + CTA Integration - Context

**Gathered:** 2026-04-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Rebrand the visible text of this Next.js app (roofing.sydney) to "Australian Roofing Contractors", confirm that no non-metal roofing copy exists (BRD-02), and add a "Check My Roof Design" CTA section on the home page that links to `/preview`.

All changes are in-place edits to existing files. No new dependencies, no schema changes, no API work. The CTA destination is the `/preview` internal route — not an external URL.

</domain>

<decisions>
## Implementation Decisions

### Brand Text
- **D-01:** Replace all visible "roofing.sydney" brand references with "Australian Roofing Contractors" (Title Case, exactly). Canonical string: `Australian Roofing Contractors`.
- **D-02:** Do NOT change: `metadataBase` URL (`https://roofing.sydney`), email addresses (`privacy@roofing.sydney`, `hello@roofing.sydney`), sitemap/robots URLs, `package.json` name. These are infrastructure references, not brand labels.
- **D-03:** Email `from:` field — update display name only: `Australian Roofing Contractors <${from}>`. Keep domain unchanged.

### Privacy/Terms Meta Descriptions
- **D-04:** Brand swap only — replace `"roofing.sydney"` with `"Australian Roofing Contractors"` in the existing `metadata.description` sentences for privacy and terms pages. No rewrite.

### CTA Section
- **D-05:** CTA links to `/preview` via Next.js `<Link href="/preview">` — client-side navigation, no `target="_blank"`. (Resolved: this IS the roofing.sydney app; `/preview` is the AI tool entry point.)
- **D-06:** CTA placement: between the hero `</section>` and `<section id="how"` in `src/app/page.tsx`.
- **D-07:** CTA copy: heading "Ready to see your new roof?", button "Check My Roof Design", subtext "Use our free AI visualiser to preview Colorbond colours on your actual home — then book a no-obligation quote."
- **D-08:** CTA button style: `rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90` — matches existing inverted pill pattern in site-header.tsx.

### BRD-02 Close-Out
- **D-09:** No code changes required for BRD-02. Plan must run a grep to verify zero non-metal roof type references (`tile`, `terracotta`, `slate`, `concrete`, `clay`, `asphalt`, `shingle`) in `src/**/*.{ts,tsx}`, then close the requirement in the commit message. Research already confirmed zero matches.

### Metadata Title Pattern
- **D-10:** Use `title: { default: "...", template: "..." }` object in root `layout.tsx` — not a flat string. Page-level titles set only the short name (e.g., `"Privacy Policy"`); the template appends the brand suffix automatically.

### Claude's Discretion
- Exact wording for updated privacy/terms `metadata.description` (brand-swap, no rewrite needed — format: "How Australian Roofing Contractors collects…")
- Order of file edits within the single execution wave
- Commit message wording for BRD-02 verification

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design Contract
- `.planning/phases/04-main-site-rebrand-cta/04-UI-SPEC.md` — Complete visual and interaction contract. Exact Tailwind classes, CTA HTML structure, all copy strings, file change map, brand text rules, interaction contract. MUST read before writing any code.

### Research
- `.planning/phases/04-main-site-rebrand-cta/04-RESEARCH.md` — Full branding audit (all 9 files with brand text identified), BRD-02 verification, anti-patterns, pitfalls. Contains complete file change table.

### Project Planning
- `.planning/ROADMAP.md` — BRD-01, BRD-02, BRD-03 requirement definitions and success criteria
- `.planning/REQUIREMENTS.md` — v1 requirement context

### Existing Code (read before modifying)
- `src/app/layout.tsx` — Root metadata; update `title`, `title.template`, `openGraph.title`
- `src/app/page.tsx` — Home page; insert CTA section between hero and `#how`
- `src/components/site-header.tsx` — Logo span text update
- `src/components/site-footer.tsx` — Copyright text update
- `src/app/privacy/page.tsx` — Metadata title, description (brand swap), body text line 28
- `src/app/terms/page.tsx` — Metadata title, description (brand swap), body text lines 28 and 83
- `src/lib/email.ts` — `from:` display name (line 28), notification text (line 39)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `site-header.tsx` inverted pill button (`rounded-full bg-foreground px-3.5 py-1.5`): CTA button reuses this pattern at larger scale (`px-5 py-2.5`)
- `next/link` `<Link>` component: used throughout for client-side navigation — CTA uses the same pattern

### Established Patterns
- Tailwind CSS 4 utility classes only — no custom CSS
- `export const metadata: Metadata` in each page file for metadata
- `title.template` pattern in root layout (to be introduced in this phase)

### Integration Points
- `src/app/page.tsx`: Hero section closes with `</section>` before `<section id="how"` — CTA section is inserted at this boundary
- `src/lib/email.ts` line 28: `from:` field string — only display name portion changes, domain stays

### Files With No Changes Needed
- `src/app/sitemap.ts` — deployment URL, keep as-is
- `src/app/robots.ts` — deployment URL, keep as-is
- `src/app/preview/page.tsx` — no brand text
- All API routes — no brand text

</code_context>

<specifics>
## Specific Ideas

- CTA section exact HTML per UI-SPEC: `<Link href="/preview">` wrapped in `<section className="border-t border-border">` with `py-12` vertical padding
- Heading: `text-xl font-semibold tracking-tight` (matches step heading hierarchy in "How it works")
- Footer copyright: `© {year} Australian Roofing Contractors · Licensed metal roofing contractor`
- OG title: `Australian Roofing Contractors — See your new Colorbond roof`
- Root default title: `Australian Roofing Contractors — See your new Colorbond roof before you commit`

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-main-site-rebrand-cta*
*Context gathered: 2026-04-24*
