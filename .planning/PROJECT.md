# Roofing Sydney — AI Roof Visualizer

## What This Is

A lead-generation tool for Sydney roofing contractors that lets homeowners enter their address, see their home from aerial view, and preview a new roof in photorealistic quality — then submit their details to get a quote. Built in Next.js 15, deployed on Vercel.

## Core Value

A homeowner can see exactly what their home will look like with a new roof — accurately segmented, photorealistic — before committing to a quote.

## Requirements

### Validated

- ✓ User can enter address with Google Places autocomplete — existing
- ✓ User sees aerial satellite map of their property via MapLibre — existing
- ✓ User can select from Colorbond colour palette — existing
- ✓ User can click roof to apply colour (flood-fill) — existing
- ✓ User can submit lead form (name, phone, email) — existing
- ✓ Lead stored in Supabase, contractor notified via Resend — existing
- ✓ Privacy and Terms pages — existing

### Active

- [ ] High-resolution aerial static image sourced from Nearmap pay-per-site API (~$8 AUD/property)
- [ ] AI roof segmentation via SAM-2 on Replicate — replaces flood-fill for the AI render path (~$0.021/run)
- [ ] Photorealistic roof replacement via FLUX.1 Fill on fal.ai (~$0.05/image)
- [ ] Polished roof preview UI — colour picker, generate button, before/after display

### Out of Scope

- 3D rendering — 2D aerial is sufficient for this milestone
- User authentication — stateless lead tool, no accounts needed
- Multiple property comparison — single property focus
- Mobile app — web only

## Context

- Client project for a Sydney roofing contractor
- Current pain points: Mapbox tile quality too low-res for close-up roof inspection; client-side flood-fill bleeds outside roof boundaries and looks unprofessional
- Developer funding initial API costs to demo quality; if convincing, client takes over billing
- Nearmap is already integrated in codebase (`TILE_PROVIDER=nearmap`) but using tile streaming — not yet using their pay-per-site high-res static image endpoint
- SAM-2 integration existed (Replicate) but was removed in favour of client-side flood-fill — needs to be re-enabled with improved prompting
- Stack: Next.js 15 App Router, TypeScript, Tailwind CSS 4, Supabase, Resend, Vercel

## Constraints

- **Tech stack**: Next.js 15 + Vercel — no framework changes
- **Geography**: Sydney AU only — bounds checking already in place
- **Cost per generation**: ~$0.07/click acceptable for testing phase
- **ToS**: Google Maps Static API cannot be used as AI input — Nearmap used for imagery pipeline
- **Backwards compat**: Supabase schema and Resend lead notifications must keep working

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Nearmap pay-per-site for imagery | Licensed for roofing/AI use, 15cm/pixel AU coverage, ~$8 AUD/property, cached per address | — Pending |
| SAM-2 via Replicate for segmentation | Was in codebase, best open-source roof boundary detection, $0.021/run | — Pending |
| FLUX.1 Fill via fal.ai for inpainting | Structure-preserving inpainting with mask support, $0.05/image, best quality available | — Pending |
| Flood-fill retained as instant preview | Client-side colour picker stays free; AI render is explicit user action | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-23 after initialization*
