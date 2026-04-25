# Phase 4: Main Site Rebrand + CTA Integration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-24
**Phase:** 4 — Main Site Rebrand + CTA Integration
**Areas discussed:** Privacy/Terms descriptions, BRD-02 close-out

---

## Context Before Discussion

UI-SPEC (`04-UI-SPEC.md`, status: approved) and Research (`04-RESEARCH.md`) were complete before this session. The majority of implementation decisions were pre-locked:
- All copy strings (CTA, headings, titles, footer, email)
- CTA link destination resolved: `/preview` internal route (not external `https://roofing.sydney`)
- File change map: 7 files identified
- BRD-02 confirmed already satisfied by grep

Two areas remained open and were discussed.

---

## Privacy/Terms Meta Descriptions

| Option | Description | Selected |
|--------|-------------|----------|
| Brand swap only | Replace 'roofing.sydney' → 'Australian Roofing Contractors' in existing sentences | ✓ |
| Leave unchanged | Don't touch meta descriptions for legal pages | |
| Full rewrite | Write fresh, professionally worded descriptions | |

**User's choice:** Brand swap only
**Notes:** Minimal change; accurate descriptions; low-SEO-value pages.

---

## BRD-02 Close-Out

| Option | Description | Selected |
|--------|-------------|----------|
| Verify + commit note | Plan runs grep, confirms zero non-metal refs, closes BRD-02 in commit message | ✓ |
| Verify + add code comment | Add comment in page.tsx or .env.example confirming audit | |
| Skip — trust the research | Research already confirmed it, no re-verification in plan | |

**User's choice:** Verify + commit note
**Notes:** Re-grep during plan execution for completeness; close via commit message, no code changes.

---

## Claude's Discretion

- Exact wording for updated privacy/terms `metadata.description` (brand-swap, no rewrite)
- Order of file edits within the execution wave
- Commit message wording for BRD-02 verification close-out

## Deferred Ideas

None surfaced during discussion.
