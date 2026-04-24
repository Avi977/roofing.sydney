# Roadmap — Roofing Sydney AI Roof Visualizer

**Milestone:** v1 — AI Roof Visualization Uplift
**Granularity:** Coarse
**Created:** 2026-04-23
**Status:** Ready to plan

---

## Phase Overview

| # | Phase | Goal | Requirements | Status |
|---|-------|------|--------------|--------|
| 1 | High-Res Imagery | Replace tile streaming with Nearmap pay-per-site static image | IMG-01, IMG-02 | Not started |
| 2 | AI Segmentation | Replace flood-fill with SAM-2 for clean roof masks + live colour preview | SEG-01, SEG-02, VIZ-01 | Not started |
| 3 | AI Render + UX Polish | FLUX.1 Fill photorealistic render with before/after UX | VIZ-02, VIZ-03, UX-01, UX-02, UX-03 | Not started |

---

## Phase 1: High-Res Imagery

**Goal:** Replace tile streaming with a Nearmap pay-per-site high-resolution static image so the preview page shows a sharp, AI-ready aerial photo of the user's property.

**Requirements:** IMG-01, IMG-02

**Scope:**
- Add Nearmap pay-per-site API integration (new API endpoint `/api/nearmap-image`)
- Fetch static aerial image at maximum available resolution for given lat/lng
- Cache result per address (Supabase or filesystem) to avoid repeat charges
- Render the static Nearmap image in the preview page alongside or replacing the MapLibre map tiles
- Add `NEARMAP_API_KEY` and `NEARMAP_SURVEY_ID` env vars

**Success Criteria:**
1. Preview page displays a Nearmap static image at visibly higher resolution than current Mapbox tiles for a Sydney address
2. Fetching the same address twice does not trigger a second Nearmap API call (cache hit confirmed in logs)
3. Image renders without distortion at the required dimensions for the canvas/segmentation pipeline
4. Existing MapLibre map tile view remains functional as fallback

**Depends on:** Nearmap API account with pay-per-site access

---

## Phase 2: AI Segmentation

**Goal:** Replace the client-side flood-fill with SAM-2 (via Replicate) to produce accurate, clean roof boundary masks — and apply the Colorbond colour picker cleanly over the mask.

**Requirements:** SEG-01, SEG-02, VIZ-01

**Scope:**
- Re-enable/rewrite the `/api/segment` endpoint using SAM-2 via Replicate
- Accept: Nearmap image URL or base64 + click coordinates
- Return: clean roof mask (polygon or pixel mask)
- Apply mask client-side for instant Colorbond colour overlay (replaces flood-fill)
- Remove old flood-fill code path or keep as fallback
- Add `REPLICATE_API_TOKEN` env var (may already exist)

**Success Criteria:**
1. Clicking the roof sends a SAM-2 request and returns a mask within 10 seconds
2. Mask cleanly follows the roofline — no significant edge bleeding compared to flood-fill
3. Selecting any Colorbond colour instantly applies it over the SAM-2 mask (client-side, no AI cost)
4. Mask remains stable when changing colours (not re-fetched)

**Depends on:** Phase 1 (Nearmap image used as SAM-2 input)

---

## Phase 3: AI Render + UX Polish

**Goal:** Add a "Generate AI Preview" button that sends the Nearmap image + SAM-2 mask + selected colour to FLUX.1 Fill (fal.ai) and shows the result as a polished before/after comparison — ready to present to the client.

**Requirements:** VIZ-02, VIZ-03, UX-01, UX-02, UX-03

**Scope:**
- Integrate fal.ai FLUX.1 Fill API (new server action or API route `/api/generate-render`)
- Accept: Nearmap image + SAM-2 mask + Colorbond colour hex + colour name for prompt
- Return: photorealistic inpainted image (roof only modified)
- Display result in a before/after toggle or side-by-side UI
- Add loading state with estimated time ("Generating preview — ~10 seconds")
- "Generate AI Preview" button clearly distinct from instant colour picker
- Add `FAL_KEY` env var
- Update `.env.example` with new env vars from Phases 1–3

**Success Criteria:**
1. Clicking "Generate AI Preview" returns a photorealistic image with the selected Colorbond colour on the roof within 20 seconds
2. Walls, garden, and surroundings in the generated image match the original — only roof modified
3. Before/after comparison is functional and clearly shows the difference
4. Loading state is visible throughout generation
5. UI is polished enough to demonstrate to a client

**Depends on:** Phase 1 (Nearmap image), Phase 2 (SAM-2 mask)

---

## Requirement Coverage

| REQ-ID | Description | Phase |
|--------|-------------|-------|
| IMG-01 | Nearmap pay-per-site aerial image on preview page | 1 |
| IMG-02 | Cache Nearmap images per address | 1 |
| SEG-01 | SAM-2 roof segmentation on click | 2 |
| SEG-02 | Clean mask edges, no bleeding | 2 |
| VIZ-01 | Instant client-side colour picker over mask | 2 |
| VIZ-02 | FLUX.1 Fill photorealistic render | 3 |
| VIZ-03 | AI render modifies roof only | 3 |
| UX-01  | Distinct "Generate AI Preview" button | 3 |
| UX-02  | Loading state during generation | 3 |
| UX-03  | Before/after comparison display | 3 |

**Coverage:** 10/10 v1 requirements mapped ✓

---

*Roadmap created: 2026-04-23*
