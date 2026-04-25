---
phase: 04-main-site-rebrand-cta
plan: 01
subsystem: ui
tags: [nextjs, tailwind, metadata, branding, cta, resend, email]

# Dependency graph
requires: []
provides:
  - Brand identity updated across all visible text to "Australian Roofing Contractors"
  - Root metadata title.template pattern enabling short-form page titles
  - CTA section on home page linking to /preview AI tool
  - BRD-01, BRD-02, BRD-03 requirements closed
affects:
  - Phase 1 (High-Res Imagery) — /preview route now visible on home page
  - All future UI phases — brand string canonical reference established

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Next.js title.template object in root layout for automatic brand suffix appending"
    - "Inverted pill CTA button: bg-foreground text-background rounded-full — matches site-header.tsx nav button pattern at larger scale"

key-files:
  created: []
  modified:
    - src/app/layout.tsx
    - src/components/site-header.tsx
    - src/components/site-footer.tsx
    - src/lib/email.ts
    - src/app/page.tsx
    - src/app/privacy/page.tsx
    - src/app/terms/page.tsx

key-decisions:
  - "title.template object in root layout.tsx enables short-form page titles (Privacy Policy, Terms of Service) with automatic brand suffix — avoids duplicating brand string in every page metadata"
  - "metadataBase URL https://roofing.sydney kept unchanged — deployment URL, not brand label"
  - "Email from domain kept unchanged — only display name changed to Australian Roofing Contractors"
  - "CTA links to /preview via Next.js Link — internal client-side navigation, no target=_blank"
  - "BRD-02: zero code changes needed — codebase already metal/Colorbond-only; grep tile matches are map tile API references, not roof material copy"

patterns-established:
  - "Brand string canonical: Australian Roofing Contractors (Title Case, exactly)"
  - "Infrastructure references (metadataBase, email addresses, sitemap URLs) are never brand labels — never replace them"

requirements-completed: [BRD-01, BRD-02, BRD-03]

# Metrics
duration: 4min
completed: 2026-04-25
---

# Phase 4 Plan 01: Main Site Rebrand + CTA Summary

**Rebranded roofing.sydney to "Australian Roofing Contractors" across all visible text and added a "Check My Roof Design" CTA section on the home page linking to /preview**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-04-25T05:21:33Z
- **Completed:** 2026-04-25T05:25:20Z
- **Tasks:** 4
- **Files modified:** 7

## Accomplishments

- Brand identity updated across all visible surfaces: header logo, footer copyright, root metadata, OG title, email display name, legal page titles/descriptions/body text
- Root layout.tsx now uses title.template object — page-level short-form titles (Privacy Policy, Terms of Service) automatically get "— Australian Roofing Contractors" appended
- "Check My Roof Design" CTA section inserted between hero and #how sections on home page, linking to /preview via Next.js Link with inverted pill button styling
- BRD-02 confirmed satisfied: grep of src/ for non-metal roof type terms (tile, terracotta, slate, concrete, clay, asphalt, shingle) returned zero user-facing copy matches — only map tile API references

## Task Commits

Each task was committed atomically:

1. **Task 1: Update root metadata in layout.tsx** - `1a7e1b9` (feat)
2. **Task 2: Update site-header, site-footer, and email.ts brand text** - `0235ede` (feat)
3. **Task 3: Insert CTA section into page.tsx** - `e1f600c` (feat)
4. **Task 4: Update legal pages + verify BRD-02** - `2b3a6fe` (feat)

## Files Created/Modified

- `src/app/layout.tsx` — Title changed from flat string to {default, template} object; openGraph.title updated; metadataBase unchanged
- `src/components/site-header.tsx` — Logo span text: roofing.sydney -> Australian Roofing Contractors
- `src/components/site-footer.tsx` — Copyright line: roofing.sydney -> Australian Roofing Contractors
- `src/lib/email.ts` — from: display name and notification text updated; email domain and Resend config unchanged
- `src/app/page.tsx` — Link import added; CTA section inserted between hero and #how sections
- `src/app/privacy/page.tsx` — Short-form title, updated description, body text brand-swapped; privacy@roofing.sydney email unchanged
- `src/app/terms/page.tsx` — Short-form title, updated description, sections 1+7 body text brand-swapped; hello@roofing.sydney email unchanged

## Decisions Made

- Used title.template object in layout.tsx (D-10) — avoids duplicating brand string in every page's metadata export
- CTA links to /preview via Next.js `<Link>` not `<a href>` — correct for internal client-side navigation; no target=_blank
- Email domain left unchanged (D-03) — only display name before `<${from}>` changed; altering domain would break Resend DKIM/SPF
- BRD-02 required no code changes — research + grep verification confirmed zero non-metal roof type references

## Deviations from Plan

None — plan executed exactly as written.

## BRD-02 Verification Result

```
grep -rn "tile|terracotta|slate|concrete|clay|asphalt|shingle" src/ --include="*.ts" --include="*.tsx"
```

Matches found: 8 lines — all contain the word "tile" and all refer to **map tiles** (Nearmap/Mapbox satellite tile API route, roof-editor.tsx tile config). Zero matches for terracotta, slate, concrete, clay, asphalt, or shingle. Zero user-facing copy about non-metal roof types.

**BRD-02 status: CLOSED — codebase is metal/Colorbond-only.**

## Requirements Closed

| Requirement | Description | Status |
|-------------|-------------|--------|
| BRD-01 | Brand identity updated to "Australian Roofing Contractors" across all visible text | CLOSED |
| BRD-02 | No non-metal roof type references in src/ | CLOSED — confirmed by grep |
| BRD-03 | Home page has "Check My Roof Design" CTA linking to /preview AI tool | CLOSED |

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required. All changes are in-place text edits and one JSX section insertion. No new dependencies, no environment variable changes.

## Next Phase Readiness

- Brand foundation established — all future UI phases should use canonical string "Australian Roofing Contractors"
- /preview route is now surfaced on the home page — Phase 1 (High-Res Imagery) work will be directly accessible to visitors
- title.template pattern in place — any new page can use short-form title in its metadata export

## Self-Check

Checking files exist and commits are present:

- `src/app/layout.tsx` — modified (contains "Australian Roofing Contractors")
- `src/components/site-header.tsx` — modified (contains "Australian Roofing Contractors")
- `src/components/site-footer.tsx` — modified (contains "Australian Roofing Contractors")
- `src/lib/email.ts` — modified (contains "Australian Roofing Contractors" x2)
- `src/app/page.tsx` — modified (contains CTA section + href="/preview")
- `src/app/privacy/page.tsx` — modified (contains "Australian Roofing Contractors" x2)
- `src/app/terms/page.tsx` — modified (contains "Australian Roofing Contractors" x3)
- Commit `1a7e1b9` — Task 1
- Commit `0235ede` — Task 2
- Commit `e1f600c` — Task 3
- Commit `2b3a6fe` — Task 4
- TypeScript: `npx tsc --noEmit` exits 0

## Self-Check: PASSED

---
*Phase: 04-main-site-rebrand-cta*
*Completed: 2026-04-25*
