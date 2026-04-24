# Phase 1: High-Res Imagery - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-23
**Phase:** 1 - High-Res Imagery
**Areas discussed:** Display approach, Fetch trigger, Caching strategy, Image size & quality

---

## Display approach

| Option | Description | Selected |
|--------|-------------|----------|
| Replace MapLibre with img+canvas | Remove MapLibre, display Nearmap image as `<img>` with canvas overlay. Lighter, direct image access for Phase 2. | ✓ |
| Keep MapLibre + overlay static image | Inject Nearmap image as overlay on MapLibre canvas. Preserves interactivity but adds complexity. | |
| Keep MapLibre, replace tile source | Serve static image as raster tile source. Awkward technically. | |

**User's choice:** Replace MapLibre with `<img>` + canvas overlay

---

| Option | Description | Selected |
|--------|-------------|----------|
| No — fixed view, no pan/zoom | Static photo at fixed zoom. Simplest, best for demos. | |
| Yes — CSS transform zoom/pan | Pinch-to-zoom via CSS transforms on `<img>`. | |
| You decide | Delegate to Claude. | ✓ |

**User's choice:** Claude's discretion — implement fixed view unless there's a good reason for zoom.

---

## Fetch trigger

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-fetch on preview page load | Fetch immediately on /preview. Best UX, costs on every unique address visit. | |
| User-triggered — 'Load high-res image' button | User clicks to fetch. Cost only on intent. Adds friction but controls spend. | ✓ |
| Background fetch while user sees MapLibre | Silent background fetch, swap when ready. Requires keeping MapLibre temporarily. | |

**User's choice:** User-triggered button — explicit cost control

---

| Option | Description | Selected |
|--------|-------------|----------|
| Static placeholder with prominent button | Grey box / address indicator + 'Load aerial photo' button front and centre. | ✓ |
| Keep MapLibre tiles as pre-load state | Show tile map until user clicks. Requires MapLibre in component. | |
| You decide | Delegate to Claude. | |

**User's choice:** Static placeholder with button — no MapLibre in pre-load state

---

## Caching strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Supabase Storage bucket | Store image in Supabase Storage, check cache before calling Nearmap API. Already integrated. | ✓ |
| Next.js fetch cache with long TTL | Cache at Next.js layer. Ephemeral — resets on redeploy. | |
| Vercel Blob / KV | Vercel-native storage. Requires new service and env vars. | |

**User's choice:** Supabase Storage bucket

---

| Option | Description | Selected |
|--------|-------------|----------|
| Google place_id | Stable, unique per property, already in URL params and leads table. | ✓ |
| Lat/lng rounded to 5 decimal places | Simple but fragile across geocoding calls. | |
| Normalised address string | Human-readable but brittle to formatting differences. | |

**User's choice:** Google `place_id` as cache key

---

## Image size & quality

| Option | Description | Selected |
|--------|-------------|----------|
| 1024×1024 px | Fits MAX_CAPTURE_DIM=1280 cap. Good balance of quality vs size (~300-500 KB). | ✓ |
| 2048×2048 px | Maximum sharpness. Larger transfer, may need server-side downsample. | |
| You decide | Delegate to Claude. | |

**User's choice:** 1024×1024 px

---

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — MapLibre as fallback on Nearmap error | Per Roadmap Success Criterion 4. | |
| No — clear error state with retry | Simpler, removes MapLibre entirely. | |
| You decide | Delegate to Claude. | ✓ |

**User's choice:** Claude's discretion — align with Roadmap Success Criterion 4 preferred

---

## Claude's Discretion

- Pan/zoom interaction (fixed view preferred)
- Fallback on Nearmap error (MapLibre fallback preferred per roadmap)
- Supabase Storage bucket naming and access policy
- Loading state during Nearmap fetch
- Whether new DB table is needed for cache index

## Deferred Ideas

- Image sharing/downloading — v2
- Multiple Nearmap survey date selection — out of scope
- Watermarking/attribution overlay — researcher to verify ToS requirement
