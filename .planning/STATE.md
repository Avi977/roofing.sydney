# Project State — Roofing Sydney AI Roof Visualizer

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-04-23)

**Core value:** A homeowner can see exactly what their home will look like with a new roof — accurately segmented, photorealistic — before committing to a quote.

**Current focus:** Not started — ready to plan Phase 1

---

## Status

**Milestone:** v1 — AI Roof Visualization Uplift
**Phase:** 0 of 3 complete
**Progress:** ░░░░░░░░░░ 0%

---

## Phase Tracker

| # | Phase | Status | Plans |
|---|-------|--------|-------|
| 1 | High-Res Imagery | Not started | — |
| 2 | AI Segmentation | Not started | — |
| 3 | AI Render + UX Polish | Not started | — |

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

**Last activity:** 2026-04-23 — Phase 1 context gathered
**Stopped at:** Phase 1 context gathered — `.planning/phases/01-high-res-imagery/01-CONTEXT.md`
**Next action:** `/gsd-plan-phase 1`

---

## Open Questions

- Nearmap pay-per-site account: does developer have API credentials yet?
- fal.ai: trial credits available on signup — use those for FLUX.1 Fill testing
- Replicate: `REPLICATE_API_TOKEN` may already be in `.env` (was used for old SAM-2 integration)
