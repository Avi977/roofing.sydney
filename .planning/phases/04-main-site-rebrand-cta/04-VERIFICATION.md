---
phase: 04-main-site-rebrand-cta
verified: 2026-04-25T00:00:00Z
status: human_needed
score: 5/5 must-haves verified
overrides_applied: 1
overrides:
  - must_have: "Home page has a 'Check My Roof Design' CTA section between the hero and the #how section, linking to /preview"
    reason: "ROADMAP SC-3 says CTA links to https://roofing.sydney (external), but CONTEXT.md D-05 explicitly resolved the ambiguity — this IS the roofing.sydney app, so /preview is the correct internal destination. RESEARCH.md Pitfall 1 and Open Question #1 flagged this; Ace made the call in CONTEXT.md. The implementation matches the decided intent, not the stale roadmap wording."
    accepted_by: "ace (via CONTEXT.md D-05)"
    accepted_at: "2026-04-25T00:00:00Z"
human_verification:
  - test: "Render the home page in a browser and confirm the CTA section is visually present between the hero and the 'How it works' band"
    expected: "A white-background section with heading 'Ready to see your new roof?', body subtext, and an inverted pill button reading 'Check My Roof Design' appears between the hero address entry area and the grey 'How it works' band"
    why_human: "Section structure is in the JSX but rendering depends on Tailwind CSS compilation and browser viewport — cannot confirm visual layout or click-through without a browser"
  - test: "Click 'Check My Roof Design' button on the home page"
    expected: "Client-side navigation to /preview — no full page reload, no new tab, no 404"
    why_human: "Verifying Next.js Link client-side navigation requires a running dev server"
  - test: "Navigate to /privacy and /terms; inspect the browser tab title"
    expected: "Tab reads 'Privacy Policy — Australian Roofing Contractors' and 'Terms of Service — Australian Roofing Contractors' respectively"
    why_human: "The title.template mechanism is a Next.js runtime behaviour — the short-form page titles combined with the root layout template can only be verified in a running app; cannot be confirmed by static analysis alone"
  - test: "Submit a lead quote form and inspect the received email sender name"
    expected: "Email arrives showing 'Australian Roofing Contractors <sender@domain>' in the From field; domain portion is unchanged"
    why_human: "Requires a live Resend send to verify the display name renders correctly in an email client"
---

# Phase 4: Main Site Rebrand + CTA Verification Report

**Phase Goal:** Rebrand the main Australian Roofing Contractors website — metal roofing only, rename all branding, and add a prominent "Check My Roof Design" CTA that routes users to /preview for the AI roof visualizer tool.
**Verified:** 2026-04-25
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Every visible 'roofing.sydney' brand label reads 'Australian Roofing Contractors' across header, footer, metadata, and legal pages | VERIFIED | Header span (site-header.tsx:10), footer copyright (site-footer.tsx:6), layout default title (layout.tsx:12), OG title (layout.tsx:19), privacy description+body (privacy/page.tsx:7,28), terms description+body (terms/page.tsx:7,28,83), email from+notification (email.ts:28,39) — all confirmed by grep |
| 2 | No non-metal roof type terms (tile, terracotta, slate, concrete, clay, asphalt, shingle) appear anywhere in src/ | VERIFIED | All 8 grep matches are map-tile API references (route.ts:18,23,38,62; roof-editor.tsx:59,60,89; privacy/page.tsx:118 — "map tile requests"). Zero user-facing copy about non-metal roof types. BRD-02 confirmed satisfied. |
| 3 | Home page has a 'Check My Roof Design' CTA section between the hero and the #how section, linking to /preview | VERIFIED (override) | CTA section present at page.tsx:42–58. Button text "Check My Roof Design" at line 55. href="/preview" at line 52. Section is positioned between closing hero </section> (line 40) and <section id="how"> (line 60). Link import confirmed at line 1. Override applied — see override note below. |
| 4 | Infrastructure references (metadataBase URL, email addresses, sitemap URLs) are unchanged | VERIFIED | metadataBase: new URL("https://roofing.sydney") at layout.tsx:17. privacy@roofing.sydney at privacy/page.tsx:127–128. hello@roofing.sydney at terms/page.tsx:117–118. robots.ts and sitemap.ts untouched (deployment URLs confirmed by grep). |
| 5 | Email sender display name sends as 'Australian Roofing Contractors \<sender@domain\>' — domain unchanged | VERIFIED | email.ts:28 — from: \`Australian Roofing Contractors <${from}>\`. Template variable ${from} (the actual domain address) is structurally unchanged. Notification text email.ts:39 — "New quote request from Australian Roofing Contractors". |

**Score:** 5/5 truths verified (1 with override)

---

### Override Note — SC-3 CTA Link Target

ROADMAP Success Criterion 3 states: "Home page has a prominent CTA linking to `https://roofing.sydney` that opens correctly."

The implementation links to `/preview` (internal Next.js route) rather than `https://roofing.sydney` (external).

This deviation is intentional and documented. RESEARCH.md Pitfall 1 (line 205–208) and Open Question #1 (lines 224–228) explicitly flagged this as a critical ambiguity: the ROADMAP was written assuming a separate contractor site would exist, but this codebase IS roofing.sydney — linking to `https://roofing.sydney` externally from within the same site would be a no-op self-referential loop.

CONTEXT.md Decision D-05 (line 27) explicitly resolved the question: "CTA links to /preview via Next.js \<Link href="/preview"\> — client-side navigation, no target=_blank. (Resolved: this IS the roofing.sydney app; /preview is the AI tool entry point.)"

This is a documented architectural decision by the project owner. The override is appropriate.

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/app/layout.tsx` | Title object with default+template, updated OG title | VERIFIED | title.default at line 12, template at line 13, openGraph.title at line 19 — all confirmed |
| `src/components/site-header.tsx` | Logo span reads 'Australian Roofing Contractors' | VERIFIED | Line 10 confirmed |
| `src/components/site-footer.tsx` | Copyright reads 'Australian Roofing Contractors' | VERIFIED | Line 6 confirmed |
| `src/lib/email.ts` | from: display name updated, domain unchanged | VERIFIED | Lines 28 and 39 confirmed; ${from} template variable structurally intact |
| `src/app/page.tsx` | CTA section between hero and #how, Link import added | VERIFIED | CTA section lines 42–58, Link import line 1, id="how" at line 60 |
| `src/app/privacy/page.tsx` | Short-form title, updated description and body text | VERIFIED | title "Privacy Policy" line 6, description line 7, body text line 28 |
| `src/app/terms/page.tsx` | Short-form title, updated description and body text (2 occurrences) | VERIFIED | title "Terms of Service" line 6, description line 7, body text lines 28 and 83 |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/app/layout.tsx` title.template | `src/app/privacy/page.tsx` + `src/app/terms/page.tsx` | template: "%s — Australian Roofing Contractors" at layout.tsx:13; both pages use short-form title strings | WIRED | Both legal pages export title: "Privacy Policy" and "Terms of Service" — template auto-appends brand suffix at runtime |
| `src/app/page.tsx` CTA Link | /preview route | `<Link href="/preview">` at page.tsx:52; `import Link from "next/link"` at page.tsx:1 | WIRED | Import present, href correct, no target=_blank, no external URL |

---

### Data-Flow Trace (Level 4)

Not applicable — this phase is pure static text/metadata edits and a static JSX section insertion. No dynamic data sources, no state variables, no fetch calls in the modified code paths. The CTA section contains no data-driven rendering.

---

### Behavioral Spot-Checks

Step 7b: SKIPPED — The changes are static text replacements and a static JSX section. No new runnable entry points were created. Cannot verify Next.js metadata template rendering or Link navigation without a running server.

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| BRD-01 | 04-01-PLAN.md | Rebrand site to Australian Roofing Contractors | SATISFIED | Brand string present in all 7 modified files; zero residual brand-label uses of "roofing.sydney" outside infrastructure references |
| BRD-02 | 04-01-PLAN.md | Metal roofing only — remove non-metal roof types | SATISFIED | Grep of src/ returns 8 "tile" matches — all map API references, zero user-facing non-metal roof copy |
| BRD-03 | 04-01-PLAN.md | "Check My Roof Design" CTA linking to AI tool | SATISFIED (with override) | CTA section in page.tsx links to /preview; see override note |

**Note on REQUIREMENTS.md:** BRD-01, BRD-02, BRD-03 are defined in ROADMAP.md (lines 144–146) and are Phase 4-specific branding requirements. They do not appear in the v1 REQUIREMENTS.md file, which tracks only the AI visualizer feature requirements (IMG-xx, SEG-xx, VIZ-xx, UX-xx). This is consistent — the ROADMAP is the authoritative source for BRD-series requirements.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None found | — | — | — | — |

Scanned all 7 modified files. No TODOs, FIXMEs, placeholder comments, empty implementations, hardcoded empty arrays/objects flowing to render, or stub handlers found.

---

### Human Verification Required

#### 1. CTA Section Visual Rendering

**Test:** Load the home page at `https://roofing.sydney` (or `http://localhost:3000`) in a browser.
**Expected:** A distinct section with white background, heading "Ready to see your new roof?", supporting subtext, and an inverted black pill button "Check My Roof Design" — visually positioned between the hero address-entry area and the grey "How it works" band below.
**Why human:** The section structure is confirmed in JSX, but visual correctness (padding, spacing, button appearance, background band) requires rendered CSS. Tailwind class compilation and responsive behavior cannot be verified statically.

#### 2. CTA Button Navigation

**Test:** Click the "Check My Roof Design" button.
**Expected:** Client-side navigation to /preview — the URL changes to /preview without a full page reload, no new tab opens. The /preview page loads correctly.
**Why human:** Next.js Link client-side routing requires a running dev server to confirm. Also verifies /preview route exists and is accessible.

#### 3. Legal Page Title Template

**Test:** Navigate to /privacy and /terms; check the browser tab title.
**Expected:** Tab reads "Privacy Policy — Australian Roofing Contractors" and "Terms of Service — Australian Roofing Contractors" respectively.
**Why human:** The title.template mechanism is a Next.js App Router runtime behaviour. The short-form page export (`title: "Privacy Policy"`) combined with root layout template (`"%s — Australian Roofing Contractors"`) produces the full title at request time — cannot be confirmed without a running server.

#### 4. Email Sender Display Name (Optional — for full BRD-01 coverage)

**Test:** Submit a test quote request via the lead form. Check the received email in the contractor notification inbox.
**Expected:** Email From field displays "Australian Roofing Contractors \<sender@domain\>" where domain is unchanged from before.
**Why human:** Requires a live Resend API call. Verifies that the display name change renders correctly in real email clients and that the domain remains valid for DKIM/SPF.

---

### Gaps Summary

No gaps blocking goal achievement. All 5 observable truths verified, all 7 required artifacts present and substantive, all key links wired. One roadmap wording deviation was found (CTA target `/preview` vs documented `https://roofing.sydney`) but this is covered by an override — the deviation is intentional and documented in CONTEXT.md D-05.

Status is `human_needed` because 4 behavioral items require a running browser/server to verify visual rendering, navigation, and runtime metadata templating. Automated checks are complete and passing.

---

_Verified: 2026-04-25_
_Verifier: Claude (gsd-verifier)_
