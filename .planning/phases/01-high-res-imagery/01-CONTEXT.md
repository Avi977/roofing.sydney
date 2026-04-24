# Phase 1: High-Res Imagery - Context

**Gathered:** 2026-04-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Integrate the Nearmap pay-per-site static image API so the preview page displays a single high-resolution aerial JPEG of the user's property. The MapLibre tile-streaming approach is replaced with a user-triggered static image fetch. Images are cached per address in Supabase Storage to avoid repeat API charges.

This phase does NOT add AI segmentation or colour overlay changes — those are Phase 2.

</domain>

<decisions>
## Implementation Decisions

### Display Architecture
- **D-01:** Replace MapLibre entirely with a `<img>` element + transparent `<canvas>` overlay. Remove MapLibre from the roof-editor component for the static image flow. The canvas layer sits on top of the `<img>` for colour painting (flood-fill in Phase 1, SAM-2 mask in Phase 2).
- **D-02:** Pan/zoom — **Claude's discretion.** For a demo, a fixed view (no pan/zoom) is likely the right call. If adding zoom, prefer CSS transform on the `<img>` rather than a map library.
- **D-03:** Fallback if Nearmap fetch fails — **Claude's discretion.** Roadmap Success Criterion 4 says "MapLibre map tile view remains functional as fallback" — implement accordingly if feasible without significant complexity.

### Fetch Trigger
- **D-04:** The Nearmap image is **NOT** fetched automatically on page load. It is fetched when the user explicitly clicks a "Load aerial photo" button.
- **D-05:** Pre-load state shows a static placeholder (address pin / grey box / minimal aerial indicator) with the "Load aerial photo" button front and centre. No live tile map in the pre-load state.

### Caching
- **D-06:** Cache fetched Nearmap images in a **Supabase Storage bucket** (new bucket: `nearmap-images` or similar). On fetch, check bucket first — serve cached image if present, else call Nearmap API and store result.
- **D-07:** Cache key: **Google `place_id`** from the address autocomplete (already present in URL params and leads table). Filename pattern: `{place_id}.jpg`.

### Image Size
- **D-08:** Request **1024×1024 px** from Nearmap pay-per-site API. This fits within the existing `MAX_CAPTURE_DIM = 1280` canvas cap and gives good quality for SAM-2 input in Phase 2.

### Claude's Discretion
- Pan/zoom interaction on the static image (D-02) — implement fixed view unless there's a strong reason for zoom
- Fallback behaviour on Nearmap API error (D-03) — align with Roadmap Success Criterion 4 (MapLibre tiles as fallback preferred)
- Supabase Storage bucket naming and access policy
- Whether to use `place_id` as filename or a hash (either is fine)
- How to handle the loading state during the Nearmap fetch (spinner, progress message)
- Whether to add a new DB table for the cache index or rely on Supabase Storage list API

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above.

### Project Planning
- `.planning/ROADMAP.md` — Phase 1 scope, success criteria, and depends-on notes
- `.planning/REQUIREMENTS.md` — IMG-01, IMG-02 requirement definitions

### Existing Code (read before modifying)
- `src/components/roof-editor.tsx` — Main editor component to restructure; MapLibre init and flood-fill logic
- `src/app/api/tiles/[z]/[x]/[y]/route.ts` — Existing tile proxy; Nearmap tile-streaming approach being superseded
- `src/lib/supabase.ts` — Supabase singleton pattern to follow for new storage operations
- `supabase/schema.sql` — Existing schema; assess whether a new cache-lookup table is needed
- `.env.example` — Env var documentation to update with `NEARMAP_API_KEY` and `NEARMAP_SURVEY_ID`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/supabase.ts` (`getSupabaseAdmin()`): Lazy singleton for Supabase service-role client. Follow this pattern for all Supabase Storage calls in the new API route.
- `src/app/api/tiles/[z]/[x]/[y]/route.ts`: Shows how to proxy external image APIs server-side with `Cache-Control` headers. Pattern for `export const runtime = "nodejs"` and `export const maxDuration`.
- `src/lib/replicate.ts` (deprecated): Shows the SDK singleton pattern (`getReplicate()`) — follow for any new `src/lib/nearmap.ts` utility.

### Established Patterns
- API routes: `export const runtime = "nodejs"` + `export const maxDuration = N` at top of route files.
- Error handling: Try-catch, return `NextResponse.json({ error })` with appropriate HTTP status. Log errors to `console.error`.
- Env vars: Server-only vars have no prefix; validate presence at route invocation, return 500 with descriptive message if missing.
- TypeScript: Discriminated union return types (e.g., `string | { error: string }`) for functions that can fail — see `buildUpstreamUrl` in tile route.

### Integration Points
- `src/app/preview/page.tsx` passes `lat`, `lng`, `address`, `placeId` as props to `RoofEditor` — `placeId` is the cache key for D-07.
- `src/components/roof-editor.tsx`: The `aerialBitmapRef` + `maskAlphaRef` + `imgDimsRef` trio is how the aerial image feeds into the canvas painting pipeline — new static image approach must populate `aerialBitmapRef` in the same way.
- `src/app/api/leads/route.ts`: Uses `getSupabaseAdmin()` and Supabase service role — same pattern for Storage bucket access.

### New Files Required
- `src/app/api/nearmap-image/route.ts` — POST or GET endpoint: check Supabase Storage cache → call Nearmap API → store result → return image URL or blob
- `src/lib/nearmap.ts` (optional) — Nearmap API utility (URL builder, response types)
- Supabase Storage bucket: `nearmap-images` (create via Supabase dashboard or migration)

</code_context>

<specifics>
## Specific Ideas

- The "Load aerial photo" button should make it clear this is a paid/premium step — consider wording like "Load high-res aerial photo" with a brief note that it fetches real imagery.
- The `place_id` cache key means the same property is always served from cache regardless of which user visits — shared cache across all sessions.
- Nearmap pay-per-site endpoint is distinct from the tile-streaming endpoint already in the codebase. The researcher should investigate the correct Nearmap Static Maps API endpoint and authentication scheme.

</specifics>

<deferred>
## Deferred Ideas

- Sharing or downloading the fetched Nearmap image — v2 requirement, not in scope
- Multiple Nearmap surveys (date selection) — out of scope for this phase
- Image watermarking or attribution overlay — defer unless Nearmap ToS requires it (researcher to verify)

</deferred>

---

*Phase: 01-high-res-imagery*
*Context gathered: 2026-04-23*
