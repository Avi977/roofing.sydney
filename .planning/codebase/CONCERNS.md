# Codebase Concerns

**Analysis Date:** 2026-04-24

## Tech Debt

**Missing test suite:**
- Issue: Zero test coverage across 22 TypeScript/TSX files. No unit tests, integration tests, or E2E tests in place.
- Files: `src/` (all files)
- Impact: Difficult to refactor with confidence. Validation logic, API handlers, and complex flood-fill algorithm are unverified. Regressions will be caught only in production.
- Fix approach: Establish test infrastructure (Jest or Vitest). Prioritize: `src/lib/leads.ts` (validation rules), `src/components/roof-editor.tsx` (flood-fill algorithm), `src/app/api/leads/route.ts` (lead persistence flow).

**Unvalidated image size limits:**
- Issue: Image size guard in `src/app/api/segment/route.ts` line 28 is rough (8 MB hardcoded). No validation of image format or actual dimension constraints.
- Files: `src/app/api/segment/route.ts:28`
- Impact: Could accept malformed images, cause downstream sharp processing failures, or memory spikes.
- Fix approach: Add explicit format validation (JPEG/PNG only), parse image headers, validate actual dimensions match tile resolution, add rate limiting.

**Unsafe flood-fill parameters:**
- Issue: Flood-fill tolerance (55) and max fill ratio (45%) are hardcoded magic numbers in `src/components/roof-editor.tsx` lines 28-29 with no documentation or user-facing tuning.
- Files: `src/components/roof-editor.tsx:28-29`
- Impact: Detection quality depends on roof colour and lighting. Dark roofs or poor imagery may fail silently. No fallback if fill < 200 pixels.
- Fix approach: Document these values with rationale. Consider exposing tolerance slider in UI, or implement adaptive tolerance based on histogram analysis.

**Default Resend notification email:**
- Issue: `src/lib/email.ts` line 15 defaults to "onboarding@resend.dev" if LEAD_NOTIFICATION_FROM is missing.
- Files: `src/lib/email.ts:15`
- Impact: Production emails may silently route to Resend's test account instead of contractor. Leads could be lost without detection.
- Fix approach: Remove fallback. Throw error immediately if LEAD_NOTIFICATION_FROM is not set. Make this a required environment variable.

**Insufficient error context in API responses:**
- Issue: API errors include minimal detail. `src/app/api/leads/route.ts` lines 48, 55, 66 log full errors to console but return generic user messages.
- Files: `src/app/api/leads/route.ts:48,55,66`, `src/app/api/segment/route.ts:50`, `src/app/api/segment/[id]/route.ts:98-100`
- Impact: Console logs are server-side only. Prod errors are invisible unless accessing logs. Client can't diagnose failures.
- Fix approach: Implement structured logging (e.g., Pino, Winston). Send error IDs to client. Establish error code taxonomy. Track error counts by type.

---

## Known Bugs

**Session token rotation race condition:**
- Symptoms: If user clicks multiple addresses rapidly, session token may be consumed by concurrent Details requests, causing quota underuse or token mismanagement.
- Files: `src/components/address-autocomplete.tsx:52,125`
- Trigger: Click autocomplete → while resolving, click another address → both may reference same token
- Workaround: Add client-side debounce (already present at 180ms) and disable Continue button during resolution. Current code is safe but fragile.

**Mask area counting uses wrong channel:**
- Symptoms: Pixel area calculation in `src/app/api/segment/[id]/route.ts` line 94-96 counts all greyscale pixels > 127 as "area". Uses only first channel of greyscale buffer.
- Files: `src/app/api/segment/[id]/route.ts:94-96`
- Trigger: SAM2 model returns mask with varying intensities. Greyscale conversion may not preserve all mask data.
- Workaround: Works in practice because sharp greyscale is uniform, but semantically incorrect. Should verify output format from SAM2.

---

## Security Considerations

**Serviceaccount key in environment (acceptable but sensitive):**
- Risk: `SUPABASE_SERVICE_ROLE_KEY` in `src/lib/supabase.ts:8` grants unrestricted database access. If leaked, attacker can modify/delete all leads.
- Files: `src/lib/supabase.ts:8`
- Current mitigation: Supabase isolates to project-level. Next.js environment variables are server-side only. `.env.local` should be in .gitignore.
- Recommendations: (1) Verify .env.local and .env.production are in .gitignore. (2) Implement Supabase RLS (Row-Level Security) policies to restrict service role scope. (3) Rotate key regularly.

**Unvalidated Tile provider switching:**
- Risk: `src/app/api/tiles/[z]/[x]/[y]/route.ts:10` allows switching between Mapbox and Nearmap via TILE_PROVIDER env var. No request-level gating. If either provider key is leaked, attacker can proxy expensive requests.
- Files: `src/app/api/tiles/[z]/[x]/[y]/route.ts:9-12`
- Current mitigation: Cache-Control header (line 61) limits 1h client cache, 24h CDN cache. No per-IP rate limit.
- Recommendations: (1) Add IP-based rate limiting to tile endpoint. (2) Implement request signing or nonce validation. (3) Consider dedicated CDN caching layer (Cloudflare, Akamai) in front.

**Email template HTML escaping:**
- Risk: `src/lib/email.ts:76-82` implements custom HTML escaping. If escapeHtml is incomplete or bypassed, HTML injection in user notes could compromise contractor email client.
- Files: `src/lib/email.ts:54-73`, `src/lib/email.ts:76-82`
- Current mitigation: Notes field truncated at 2000 chars (`src/lib/leads.ts:69`). HTML escaping covers &, <, >, ", '.
- Recommendations: (1) Use a library (DOMPurify, sanitize-html) instead of manual escaping. (2) Test with payloads like `<img src=x onerror="...">`. (3) Consider rendering email as plaintext + link instead of HTML.

**Honeypot silently trips without revealing why:**
- Risk: `src/lib/leads.ts:49-52` returns generic "Invalid submission" error when honeypot filled. User won't know why request failed.
- Files: `src/lib/leads.ts:49-52`
- Current mitigation: Hidden input has `tabIndex={-1}` and `aria-hidden` in form (`src/components/lead-form.tsx:161-167`).
- Recommendations: Add logging to detect honeypot triggers separately from normal validation failures. Track bot patterns.

**XSS risk in error messages:**
- Risk: `src/components/address-autocomplete.tsx:56,95` display error.message directly. If Google Places API error contains HTML, could render unsanitized.
- Files: `src/components/address-autocomplete.tsx:54-56`, `src/components/address-autocomplete.tsx:94-95`
- Current mitigation: Browser renders user-supplied content in text context (no dangerouslySetInnerHTML). Modern React auto-escapes.
- Recommendations: (1) Explicitly sanitize error messages. (2) Define error code whitelist, show templated messages instead. (3) Log full error server-side for debugging.

---

## Performance Bottlenecks

**Synchronous flood-fill on main thread:**
- Problem: `src/components/roof-editor.tsx:287-333` runs BFS flood-fill algorithm in blocking JS. Large tiles (1280x1280) with low tolerance can freeze UI.
- Files: `src/components/roof-editor.tsx:287-333`, `src/components/roof-editor.tsx:101-153`
- Cause: Loop processes up to width*height*0.45 pixels (~730k for 1280px). Called after capture and yield (line 112), but not in Web Worker.
- Improvement path: (1) Move to Web Worker. (2) Implement optional GPU acceleration (WebGPU). (3) Add progress callback for UX feedback. (4) Reduce capture dimension or tile zoom.

**Sharp image processing on every mask poll:**
- Problem: `src/app/api/segment/[id]/route.ts:74-107` calls `sharp().greyscale().raw()` for every mask URL. If 10+ masks and user polls 5x, that's 50+ decodings.
- Files: `src/app/api/segment/[id]/route.ts:79-102`
- Cause: No caching of decoded masks. Replicate stores masks as PNG URLs; each fetch + decode is ~100-200ms.
- Improvement path: (1) Cache decoded buffer by URL. (2) Batch mask processing. (3) Consider Replicate's `output_file_prefix` to store masks on persistent storage instead of temp URLs.

**Tile proxy has no connection pooling:**
- Problem: `src/app/api/tiles/[z]/[x]/[y]/route.ts:47` uses default fetch() for every tile request. Creates new TCP connection per tile.
- Files: `src/app/api/tiles/[z]/[x]/[y]/route.ts:47`
- Cause: Next.js fetch handler doesn't reuse HTTP agents. Each tile request incurs connection overhead (~50-100ms).
- Improvement path: (1) Implement HTTP agent pooling. (2) Move tile serving to edge function (Vercel Edge, Cloudflare Workers). (3) Cache responses aggressively (current: 1h client, 24h CDN). (4) Use Mapbox SDK instead of raw fetch.

**Google Places API quota consumed on every keystroke:**
- Problem: `src/components/address-autocomplete.tsx:69-97` debounces at 180ms, but each keystroke triggers a `fetchAutocompleteSuggestions` call after debounce.
- Files: `src/components/address-autocomplete.tsx:69-97`
- Cause: Session token rotation (line 125) consumes API quota. Typing 10-character address = ~10 API calls if backspacing/correcting.
- Improvement path: (1) Increase debounce to 300-500ms. (2) Implement client-side prefix matching cache. (3) Use requestSession billing instead of individual calls. (4) Add quota monitoring.

---

## Fragile Areas

**Roof detection relies on exact minimum threshold:**
- Files: `src/components/roof-editor.tsx:131-133`
- Why fragile: Hard-coded minimum fill of 200 pixels (line 131). If user clicks edge of roof, shadow, or gutter, fill may be 190-210 pixels and fail randomly. No adaptive threshold.
- Safe modification: Add configurable tolerance range. Test with edge cases (small roofs, flat roofs, complex shapes). Consider image histogram analysis to set threshold per image.
- Test coverage: Zero tests for this logic.

**Canvas context retrieval doesn't check null consistently:**
- Files: `src/components/roof-editor.tsx:119-120`, `src/components/roof-editor.tsx:279`, `src/components/roof-editor.tsx:346-347`
- Why fragile: Line 119 throws if ctx is null. Line 346 silently returns. Inconsistent error handling.
- Safe modification: Consolidate null checks. Choose throw or return-early, apply consistently.
- Test coverage: Zero tests for canvas context failures.

**Email template building assumes fields are present:**
- Files: `src/lib/email.ts:54-73`
- Why fragile: Ternary checks for selectedColourName and bestTime, but not for phone/email/address. If validator strips required fields unexpectedly, email template will include empty cells.
- Safe modification: Add optional chaining and fallback text for all fields. Unit test email generation with edge cases (empty notes, missing colour).
- Test coverage: Zero tests for email generation.

**Supabase query has no retry logic:**
- Files: `src/app/api/leads/route.ts:31`
- Why fragile: Single `insert()` call. If Supabase connection is transient, lead is silently dropped and logged to console (line 48).
- Safe modification: Wrap in exponential backoff retry (3 attempts). Consider message queue (Bull/RabbitMQ) for async persistence.
- Test coverage: Zero tests for Supabase failures.

---

## Scaling Limits

**Tile proxy bandwidth:**
- Current capacity: Proxy fetches from Mapbox/Nearmap on-demand. No caching headers on Mapbox/Nearmap response.
- Limit: If 1000 users load same roof area simultaneously, 1000 identical tile requests hit upstream. Costs scale linearly.
- Scaling path: (1) Enable CDN caching on Vercel/Cloudflare. (2) Add server-side cache (Redis) for decoded tiles. (3) Negotiate caching agreements with Mapbox/Nearmap.

**Replicate API rate limit:**
- Current capacity: Replicate allows ~1 concurrent prediction per API token.
- Limit: If 5+ users click roof simultaneously, requests queue or fail. SAM2 model version may sunset without notice.
- Scaling path: (1) Implement client-side queue with exponential backoff. (2) Add prediction timeout and fallback (lower resolution, client-side segmentation). (3) Replicate as pinned model version OK, but monitor for updates.

**Supabase database rows:**
- Current capacity: Free tier allows 500K rows.
- Limit: ~500K leads stored before hitting quota. No archiving strategy.
- Scaling path: (1) Set up automated backups to S3. (2) Archive old leads to data warehouse. (3) Implement data retention policy (90 days).

**Sharp image buffer memory:**
- Current capacity: `src/app/api/segment/[id]/route.ts` decodes each mask PNG into Buffer. At 1280x1280 RGBA = ~6.5 MB per mask.
- Limit: 10 concurrent mask decoding = 65 MB memory. May OOM on small instances.
- Scaling path: (1) Use streaming decode. (2) Implement instance memory monitoring and request queueing. (3) Deploy on instances with >2GB RAM.

---

## Dependencies at Risk

**Replicate API version pinning:**
- Risk: `src/lib/replicate.ts:18-19` hard-codes SAM2 model version. If Replicate deprecates or modifies output schema, entire segmentation breaks.
- Impact: Roof detection endpoint returns no data. Users see "No segment contains clicked point".
- Migration plan: (1) Monitor Replicate changelog. (2) Test new versions before pinning. (3) Implement version fallback strategy (SAM1, different model). (4) Add schema validation for Sam2Output type.

**Google Places API deprecation:**
- Risk: Google deprecates or restricts Places API. Code will break silently (error state shown to user).
- Impact: Address input fails. User can't access preview.
- Migration plan: (1) Add fallback to geocoding API. (2) Implement local address validation with postal code database. (3) Monitor Google API status page.

**Mapbox/Nearmap credentials:**
- Risk: Both tile providers can revoke or rate-limit tokens. No fallback provider configured in code.
- Impact: Tile endpoint returns 401/403. Map shows blank with error message (line 89).
- Migration plan: (1) Implement provider fallback (Mapbox → Nearmap → local tile cache). (2) Pre-generate tiles during lead onboarding. (3) Cache at edge location (Cloudflare).

---

## Missing Critical Features

**No input rate limiting:**
- Problem: Forms accept any number of submissions. Leads endpoint has no per-IP throttling.
- Blocks: Spam protection, DDoS protection, cost control.
- Fix approach: Implement rate limiting middleware (e.g., `next-rate-limit`). Limit to 5 leads per IP per hour. Return 429 Too Many Requests.

**No request signing or CSRF protection:**
- Problem: Lead submission endpoint accepts raw POST with no token/signature validation.
- Blocks: Could be abused to flood lead database from automated scripts.
- Fix approach: Add CSRF token to form. Verify Origin header. Implement honeypot validation (already present, but not logged).

**No analytics or lead funnel tracking:**
- Problem: No visibility into user drop-off. Can't measure how many users reach each step (address → roof detection → colour pick → submit).
- Blocks: Can't optimize conversion or identify performance bottlenecks.
- Fix approach: Add event tracking to each step (address entered, roof detected, colour selected, lead submitted). Use Posthog, Mixpanel, or custom event store.

**No error recovery UI:**
- Problem: If roof detection fails (image too small, segmentation timeout), user must "Try again" manually. No automatic retry or alternative paths.
- Blocks: Poor UX for edge cases (small roofs, bad imagery).
- Fix approach: Implement automatic retry with exponential backoff. Offer manual polygon drawing as fallback.

**No loading state persistence:**
- Problem: User selects colour, form state is lost if they navigate away. No session recovery.
- Blocks: Frustration if user accidentally refreshes during quote form.
- Fix approach: Store form state in localStorage or URL params. Restore on mount.

---

## Test Coverage Gaps

**Validation logic untested:**
- What's not tested: `src/lib/leads.ts:24-72` — all regex patterns, field constraints, honeypot detection.
- Files: `src/lib/leads.ts`
- Risk: A typo in NAME_RE or PHONE_RE could silently reject valid Australian names/numbers. Honeypot could be bypassed.
- Priority: High

**Flood-fill algorithm untested:**
- What's not tested: `src/components/roof-editor.tsx:287-333` — edge cases (click outside bounds, 1x1 image, solid color, no fill).
- Files: `src/components/roof-editor.tsx`
- Risk: Edge case inputs cause silent failure or infinite loop. Hard to debug in production.
- Priority: High

**API route error handling untested:**
- What's not tested: `src/app/api/leads/route.ts`, `src/app/api/segment/route.ts`, `src/app/api/segment/[id]/route.ts` — Supabase failure, Replicate timeout, network error recovery.
- Files: `src/app/api/*/route.ts`
- Risk: Error paths are never exercised. Exception handling may fail silently or with poor messages.
- Priority: High

**Google Places integration untested:**
- What's not tested: `src/components/address-autocomplete.tsx` — session token lifecycle, Places API errors, edge cases (no lat/lng, duplicate suggestions).
- Files: `src/components/address-autocomplete.tsx`
- Risk: Race conditions or API changes go undetected. Hard to mock Google's SDK.
- Priority: Medium

**Email generation untested:**
- What's not tested: `src/lib/email.ts` — HTML escaping, missing fields, long notes truncation, Resend API errors.
- Files: `src/lib/email.ts`
- Risk: Malformed emails sent to contractor. Escapehtml function could be incomplete.
- Priority: Medium

**Tile proxy untested:**
- What's not tested: `src/app/api/tiles/[z]/[x]/[y]/route.ts` — invalid coords, upstream errors, cache headers, provider switching.
- Files: `src/app/api/tiles/[z]/[x]/[y]/route.ts`
- Risk: Bad tile coords might not be rejected. Upstream errors are passed through without retries.
- Priority: Low

---

*Concerns audit: 2026-04-24*
