# Requirements — Roofing Sydney AI Roof Visualizer

**Milestone:** v1 — AI Roof Visualization Uplift
**Defined:** 2026-04-23
**Status:** Active

---

## v1 Requirements

### Imagery

- [ ] **IMG-01**: System fetches a high-resolution aerial static image of the user's property from Nearmap pay-per-site API when the preview page loads (~$8 AUD per unique address)
- [ ] **IMG-02**: Nearmap images are cached per address — repeat visits serve cached image without re-charging

### Segmentation

- [ ] **SEG-01**: User can click their roof to trigger AI segmentation via SAM-2 (Replicate), producing a clean roof boundary mask
- [ ] **SEG-02**: Segmentation mask has clean edges with no bleeding outside the roof boundary

### Visualization

- [ ] **VIZ-01**: Instant colour picker remains — selecting a Colorbond colour applies a fast client-side preview over the mask (free, no AI cost)
- [ ] **VIZ-02**: "Generate AI Preview" button sends Nearmap image + SAM-2 mask + selected colour to FLUX.1 Fill (fal.ai) and returns a photorealistic roof render (~$0.05/image)
- [ ] **VIZ-03**: AI render replaces only the roof area — walls, garden, and surroundings remain unchanged

### UX

- [ ] **UX-01**: "Generate AI Preview" is a distinct user action from the colour picker — clearly labelled button with a time expectation ("takes ~10 seconds")
- [ ] **UX-02**: Loading state shown during AI generation with progress indicator
- [ ] **UX-03**: Result displayed as a before/after or side-by-side comparison

---

## v2 Requirements (Deferred)

- Download or share the generated preview image
- Multiple Colorbond colour comparison side-by-side
- Support for locations outside Sydney bounds
- Roof material presets (tile, metal, corrugated iron) as alternative to colour-only

---

## Out of Scope

- 3D rendering — 2D aerial view is sufficient for this showcase tool
- User authentication — stateless tool, no sign-in flow
- Multiple property comparison — single property per session
- Mobile app — web only

---

## Traceability

| REQ-ID | Phase | Plan |
|--------|-------|------|
| IMG-01 | 1 | TBD |
| IMG-02 | 1 | TBD |
| SEG-01 | 2 | TBD |
| SEG-02 | 2 | TBD |
| VIZ-01 | 2 | TBD |
| VIZ-02 | 3 | TBD |
| VIZ-03 | 3 | TBD |
| UX-01  | 3 | TBD |
| UX-02  | 3 | TBD |
| UX-03  | 3 | TBD |
