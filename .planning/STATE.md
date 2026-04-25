---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: in_progress
stopped_at: session resumed 2026-04-25
last_updated: "2026-04-25T12:00:00.000Z"
last_activity: 2026-04-25
progress:
  total_phases: 4
  completed_phases: 1
  total_plans: 3
  completed_plans: 1
  percent: 25
---

# Project State — Roofing Sydney AI Roof Visualizer

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-04-23)

**Core value:** A homeowner can see exactly what their home will look like with a new roof — accurately segmented, photorealistic — before committing to a quote.

**Current focus:** Phase 1 — High-Res Imagery

---

## Status

**Milestone:** v1 — AI Roof Visualization Uplift
**Phase:** 1 of 4 complete (Phase 4 — human UAT pending)
**Progress:** ██░░░░░░░░ 25%

---

## Phase Tracker

| # | Phase | Status | Plans |
|---|-------|--------|-------|
| 1 | High-Res Imagery | Ready to execute | 2 |
| 2 | AI Segmentation | Not started | — |
| 3 | AI Render + UX Polish | Not started | — |
| 4 | Main Site Rebrand + CTA | ✓ Complete (human UAT pending) | 1/1 |

---

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-23 | Nearmap pay-per-site for imagery | Licensed for AI use, 15cm/pixel AU, ~$8 AUD/property |
| 2026-04-23 | SAM-2 via Replicate for segmentation | $0.021/run, was already in codebase |
| 2026-04-23 | FLUX.1 Fill via fal.ai for render | $0.05/image, best structure-preserving inpainting available |
| 2026-04-23 | YOLO mode, coarse granularity | Fast iteration, developer-led project |

---

## Session Continuity

**Last activity:** 2026-04-25
**Stopped at:** session resumed — Phase 4 confirmed complete (committed 46718dc)
**Next action:** Execute Phase 1 — High-Res Imagery (2 plans: Nearmap static image API integration)

---

## Accumulated Context

### Roadmap Evolution

- Phase 4 added: Main Site Rebrand + CTA — rename to Australian Roofing Contractors, metal roofing only, add "Check My Roof Design" CTA → roofing.sydney (independent of AI phases)

---

## Open Questions

- Nearmap pay-per-site account: does developer have API credentials yet?
- fal.ai: trial credits available on signup — use those for FLUX.1 Fill testing
- Replicate: `REPLICATE_API_TOKEN` may already be in `.env` (was used for old SAM-2 integration)
