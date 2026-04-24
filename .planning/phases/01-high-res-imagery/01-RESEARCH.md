# Phase 1: High-Res Imagery - Research

**Researched:** 2026-04-23
**Domain:** Nearmap pay-per-site static image API + Supabase Storage + Next.js API route
**Confidence:** MEDIUM (Nearmap API workflow has confirmed structure but survey ID requirement
is a BLOCKING unknown — see Open Questions)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Replace MapLibre with `<img>` + transparent `<canvas>` overlay. Remove MapLibre from roof-editor for the static image flow. Canvas layer sits on top of `<img>` for colour painting.
- **D-04:** Nearmap image fetched on user button click ("Load aerial photo"), NOT on page load.
- **D-05:** Pre-load state shows a static placeholder (grey box) with the "Load aerial photo" button. No live tile map in pre-load.
- **D-06:** Cache fetched images in Supabase Storage bucket `nearmap-images`. Check bucket first; serve cached image if present, else call Nearmap API and store result.
- **D-07:** Cache key is Google `place_id`. Filename pattern: `{place_id}.jpg`.
- **D-08:** Request 1024×1024 px from Nearmap API.

### Claude's Discretion
- Pan/zoom on the static image (D-02) — implement fixed view (no zoom) unless strong reason
- Fallback behaviour on Nearmap API error (D-03) — align with Roadmap Success Criterion 4 (MapLibre tiles as fallback preferred)
- Supabase Storage bucket naming and access policy
- Whether to add a new DB table for cache index or rely on Supabase Storage list API
- Loading state during Nearmap fetch (spinner, progress message)

### Deferred Ideas (OUT OF SCOPE)
- Sharing or downloading the fetched Nearmap image
- Multiple Nearmap surveys (date selection)
- Image watermarking or attribution overlay (unless Nearmap ToS requires it)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| IMG-01 | System fetches a high-resolution aerial static image from Nearmap pay-per-site API when user clicks "Load aerial photo" | Nearmap Transactional API: 2-step workflow (coverage → image). Legacy staticmap endpoint may exist as simpler path — SURVEY_ID requirement is a blocking unknown. |
| IMG-02 | Nearmap images cached per address — repeat visits serve cached image without re-charging | Supabase Storage: `upload()` + `getPublicUrl()` + `list()` or `.exists()` pattern verified. |
</phase_requirements>

---

## Summary

Phase 1 replaces the MapLibre tile-streaming approach with a single static 1024×1024 px JPEG
from the Nearmap API, cached per address in Supabase Storage. The user triggers the fetch
explicitly by clicking "Load aerial photo". On cache hit the image URL is returned immediately;
on miss the API is called, the image stored, and the public URL returned to the client.

The Nearmap API has two access patterns: (1) the **Transactional Content API** — a two-step
flow (coverage call → image fetch) where credits are deducted on the coverage call and a
`transactionToken` plus `surveyId` are returned for the image fetch step; and (2) the
**legacy staticmap endpoint** — a simpler single-call pattern using `center=LAT,LNG&size=WxH&zoom=Z&apikey=KEY`
that returns JPEG bytes directly. Whether the developer's Nearmap account has access to the
legacy endpoint or only the Transactional API is the single most important unknown this phase
must accommodate.

The Supabase Storage patterns are well-understood: `getSupabaseAdmin().storage.from('nearmap-images').upload(path, buffer, { contentType: 'image/jpeg' })` followed by `getPublicUrl(path)`. Bucket must be created as **public** in the Supabase dashboard.

**Primary recommendation:** Build `src/app/api/nearmap-image/route.ts` as a GET/POST endpoint
that wraps the Nearmap API call and Supabase cache check in a single server-side step. Return
only a `{ url: string }` JSON response to the client. The `<img src={url}>` replaces the
MapLibre container.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Nearmap API call | API / Backend (Next.js route) | — | API key must stay server-side; response is binary, buffered before storage |
| Supabase Storage check + upload | API / Backend (Next.js route) | — | Requires service role key, not safe client-side |
| Cache hit check | API / Backend (Next.js route) | — | List/exists call needs service role |
| Return image URL to client | API / Backend → Client | — | Route returns JSON `{ url }`, client renders `<img>` |
| `<img>` display + `<canvas>` overlay | Browser / Client | — | Static `<img>` + transparent canvas; no server involvement |
| aerialBitmapRef population | Browser / Client | — | `createImageBitmap(imgElement)` after load event |
| MapLibre fallback | Browser / Client | — | Kept as fallback, only mounted on error state |
| Placeholder / loading UI | Browser / Client | — | React state machine within RoofEditor |

---

## Standard Stack

### Core (already in project — no new installs)

| Library | Version (in use) | Purpose | Note |
|---------|-----------------|---------|------|
| `@supabase/supabase-js` | `^2.103.3` (latest: 2.104.1) | Supabase Storage upload, list, getPublicUrl | Follow `getSupabaseAdmin()` singleton pattern |
| `next` | 15.5.15 | API route, runtime config | `export const runtime = "nodejs"` required |
| `sharp` | `^0.34.5` | JPEG validation / resize if needed | Already in project; optional for phase 1 |

### No New Packages Required

All functionality is achievable with the existing project dependencies. No new npm installs
for Phase 1.

**Version verification:** `npm view @supabase/supabase-js version` → `2.104.1` on 2026-04-23.
[VERIFIED: npm registry]

---

## Architecture Patterns

### System Architecture Diagram

```
User clicks "Load aerial photo"
        │
        ▼
Client: POST /api/nearmap-image
        body: { placeId, lat, lng }
        │
        ▼
 API Route: src/app/api/nearmap-image/route.ts
        │
        ├─► Supabase Storage: list("nearmap-images", "{place_id}.jpg")
        │       │
        │       ├─ HIT ──► getPublicUrl("{place_id}.jpg")
        │       │               │
        │       │               └─► return { url } to client ──► <img src={url}>
        │       │
        │       └─ MISS ─► Nearmap API call
        │                       │
        │                 ┌─────┴──────────────────────┐
        │                 │ TRANSACTIONAL PATH          │ LEGACY PATH (if available)
        │                 │ 1. GET /coverage/v2/point/  │ GET api.nearmap.com/staticmap
        │                 │    {lng},{lat}?apikey=...   │   ?center={lat},{lng}
        │                 │    → surveyId + txToken     │   &size=1024x1024
        │                 │ 2. GET /staticmap/v3/       │   &zoom=21&apikey=...
        │                 │    surveys/{surveyId}/      │   → JPEG bytes directly
        │                 │    Vert.jpg?point=...       │
        │                 │    &size=1024x1024          │
        │                 │    &transactionToken=...    │
        │                 └─────────────────────────────┘
        │                       │
        │                 arrayBuffer (JPEG bytes)
        │                       │
        │                 Supabase Storage: upload(
        │                   "nearmap-images",
        │                   "{place_id}.jpg",
        │                   buffer,
        │                   { contentType: "image/jpeg", upsert: false }
        │                 )
        │                       │
        │                 getPublicUrl("{place_id}.jpg")
        │                       │
        └─────────────────────► return { url } to client ──► <img src={url}>

Client: receives { url }
        │
        ▼
 <img src={url} onLoad={...}>
        │
        ▼
 createImageBitmap(imgRef.current)
        → aerialBitmapRef.current = bitmap
        → imgDimsRef.current = { w: 1024, h: 1024 }
        → maskAlphaRef.current = null (reset)
        → status: "preview" (crosshair cursor, ready for click-to-segment)
```

### Recommended Project Structure

```
src/
├── app/
│   └── api/
│       └── nearmap-image/
│           └── route.ts          # New: cache check → Nearmap call → Storage upload → return URL
├── lib/
│   ├── nearmap.ts                # New (optional): URL builder, type definitions
│   └── supabase.ts               # Existing: getSupabaseAdmin() — use as-is
└── components/
    └── roof-editor.tsx           # Modify: add imageState, "Load aerial photo" button, <img> display
supabase/
└── schema.sql                    # No change needed — Storage bucket created via dashboard
.env.example                      # Update: add NEARMAP_API_KEY, NEARMAP_SURVEY_ID (optional)
```

### Pattern 1: Nearmap Transactional API (Two-Step)

The documented current path requires two API calls. Credits deducted on Step 1.

```typescript
// Source: https://developer.nearmap.com/docs/transactional-content-api
// Source: https://developer.nearmap.com/reference/get_surveys-surveyid-type-format-1

// Step 1: Coverage call — returns surveyId + transactionToken
// Deduction happens HERE, not on Step 2
const coverageUrl =
  `https://api.nearmap.com/coverage/v2/point/${lng},${lat}` +
  `?apikey=${encodeURIComponent(apiKey)}&limit=1&resources=Vert`;

const coverageRes = await fetch(coverageUrl);
const coverage = await coverageRes.json();
const survey = coverage.surveys?.[0];    // Latest survey
const surveyId = survey?.id;             // e.g. "dc26410e-6331-11ea-9feb-eb1617c46d8e"
const txToken = survey?.transactionToken; // Used to authenticate image fetch

// Step 2: Fetch image — no additional credit deduction
// point format: "LONG,LAT"
const imageUrl =
  `https://api.nearmap.com/staticmap/v3/surveys/${surveyId}/Vert.jpg` +
  `?point=${lng},${lat}&radius=100&size=1024x1024&transactionToken=${txToken}`;
// Returns: JPEG image bytes (Content-Type: image/jpeg)
```

[CITED: developer.nearmap.com/docs/transactional-content-api]
[CITED: developer.nearmap.com/reference/get_surveys-surveyid-type-format-1]

### Pattern 2: Nearmap Legacy Staticmap (Single-Step, Simpler)

This older endpoint has been observed in Nearmap docs and third-party integrations. It does NOT
require a survey ID and returns JPEG bytes directly in one call. Availability depends on the
account plan.

```typescript
// Source: https://docs.nearmap.com/display/ND/Image+API (legacy docs)
// ASSUMED: still operational for subscription accounts — UNVERIFIED for pay-per-site accounts

// center format: "LAT,LNG" (NOTE: lat first, unlike Transactional API's "LNG,LAT")
const legacyUrl =
  `https://api.nearmap.com/staticmap` +
  `?center=${lat},${lng}&size=1024x1024&zoom=21&apikey=${encodeURIComponent(apiKey)}`;
// Returns: JPEG image bytes directly
```

[CITED: docs.nearmap.com/display/ND/Image+API]
[ASSUMED: legacy endpoint available on the developer's account type]

**Recommendation for planning:** Implement the Transactional (two-step) flow as primary, with
a compile-time flag or env var (`NEARMAP_USE_LEGACY=true`) to switch to the legacy single-call
path. This lets the developer test whichever their account supports on first run.

### Pattern 3: Nearmap Tile API (No-Survey-ID Path — already in codebase)

The existing `/api/tiles/[z]/[x]/[y]/route.ts` uses this:
```
https://api.nearmap.com/tiles/v3/Vert/{z}/{x}/{y}.jpg?apikey={key}
```
This works without a survey ID and uses the latest survey automatically.
[VERIFIED: existing codebase at src/app/api/tiles/[z]/[x]/[y]/route.ts]

However, this tile approach requires assembling a full static image from multiple 256×256 tiles
(at zoom 21, a 1024×1024 area = stitching 4×4 = 16 tiles). This is complex and was intentionally
replaced by the pay-per-site static image approach.

### Pattern 4: Supabase Storage — Cache Check + Upload + Public URL

```typescript
// Source: https://supabase.com/docs/guides/storage/uploads/standard-uploads
// Source: https://supabase.com/docs/reference/javascript/storage-from-upload
// Source: verified against existing getSupabaseAdmin() pattern in src/lib/supabase.ts

import { getSupabaseAdmin } from "@/lib/supabase";

const BUCKET = "nearmap-images";

async function getCachedImageUrl(placeId: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const path = `${placeId}.jpg`;

  // Check if file exists using list() — no native .exists() in JS SDK
  // [CITED: https://nesin.io/blog/check-if-file-exists-supabase-storage]
  const { data: files } = await supabase.storage
    .from(BUCKET)
    .list("", { search: path });

  const found = files?.some((f) => f.name === path);
  if (!found) return null;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl; // e.g. "https://<project>.supabase.co/storage/v1/object/public/nearmap-images/{placeId}.jpg"
}

async function uploadImage(placeId: string, jpegBytes: ArrayBuffer): Promise<string> {
  const supabase = getSupabaseAdmin();
  const path = `${placeId}.jpg`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, jpegBytes, {
      contentType: "image/jpeg",
      cacheControl: "31536000", // 1 year — immutable cache per place_id
      upsert: false,            // fail loudly if somehow exists; caller should check first
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
```

[CITED: supabase.com/docs/guides/storage/uploads/standard-uploads]
[VERIFIED: getSupabaseAdmin() pattern matches src/lib/supabase.ts]

### Pattern 5: Next.js API Route — Established Project Pattern

```typescript
// Source: VERIFIED from src/app/api/tiles/[z]/[x]/[y]/route.ts + src/app/api/leads/route.ts

export const runtime = "nodejs";
export const maxDuration = 30; // Nearmap + Supabase upload may take 10-20s

export async function POST(req: Request) {
  const apiKey = process.env.NEARMAP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "NEARMAP_API_KEY not configured" }, { status: 500 });
  }

  const { placeId, lat, lng } = await req.json();
  if (!placeId || !lat || !lng) {
    return NextResponse.json({ error: "Missing required params" }, { status: 400 });
  }

  try {
    // 1. Check cache
    const cached = await getCachedImageUrl(placeId);
    if (cached) return NextResponse.json({ url: cached, cache: "hit" });

    // 2. Fetch from Nearmap
    const jpegBuffer = await fetchNearmapImage(apiKey, lat, lng);

    // 3. Upload to Supabase Storage
    const url = await uploadImage(placeId, jpegBuffer);

    return NextResponse.json({ url, cache: "miss" });
  } catch (err) {
    console.error("[nearmap-image]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Fetch failed" },
      { status: 502 }
    );
  }
}
```

### Pattern 6: aerialBitmapRef Population from Static `<img>`

The existing flood-fill + segmentation pipeline reads from `aerialBitmapRef.current` (an
`ImageBitmap`). The new static image approach must populate it identically.

```typescript
// VERIFIED from src/components/roof-editor.tsx lines 117-118:
// aerialBitmapRef.current = await createImageBitmap(captured.canvas);
// imgDimsRef.current = { w: captured.width, h: captured.height };

// New approach — after <img> loads at 1024×1024:
const imgEl = imgRef.current; // <img> element
aerialBitmapRef.current = await createImageBitmap(imgEl);
imgDimsRef.current = { w: imgEl.naturalWidth, h: imgEl.naturalHeight }; // 1024 × 1024
maskAlphaRef.current = null; // reset mask

// The rest of the segmentation and renderComposite pipeline is UNCHANGED.
// renderComposite() already accepts aerialBitmapRef.current (ImageBitmap) — no change needed.
```

[VERIFIED: src/components/roof-editor.tsx — createImageBitmap call at line 117]

### Anti-Patterns to Avoid

- **Fetching Nearmap image client-side:** The API key would be exposed in browser network tab. Always proxy through the Next.js API route.
- **Storing Nearmap image as base64 in DB:** Use Supabase Storage binary blob, not a DB column. Schema has no image column and DB roundtrip for base64 is wasteful.
- **Using `upsert: true` blindly:** Check for existence first. If somehow two concurrent requests for the same `place_id` race, the second upload will fail cleanly (400) — catch and return the existing URL instead of overwriting.
- **Requesting image without size param:** The Transactional API's `size` parameter defaults to 5000×5000. Always specify `size=1024x1024` to control cost and fit the canvas pipeline.
- **Assuming survey ID is optional in Transactional path:** The `/staticmap/v3/surveys/{surveyId}/Vert.jpg` endpoint requires `surveyId` in the URL path. It cannot be omitted.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| File existence check | Custom DB cache table | Supabase Storage `list()` with search filter | Storage IS the cache — no separate index needed |
| Image resize / format conversion | Canvas-based JPEG encoder | `sharp` (already in project) or just pass Nearmap bytes directly | Nearmap returns JPEG already; sharp available if validation needed |
| Image tile stitching | Multi-tile fetch + canvas compose | Nearmap static image API | Tile stitching requires 16 tiles at zoom 21 for 1024×1024 — brittle, expensive |
| Binary streaming in API route | Custom stream piping | `await upstream.arrayBuffer()` then `new NextResponse(body, ...)` | Pattern already established in tile route |

**Key insight:** Nearmap returns the full JPEG in one HTTP response body. The route reads it as
`arrayBuffer()`, passes that buffer to Supabase Storage, and returns the public URL. No client-side image handling until the `<img>` element loads.

---

## Common Pitfalls

### Pitfall 1: Survey ID Requirement (BLOCKING)

**What goes wrong:** Developer calls `POST /api/nearmap-image` → route calls Transactional API →
coverage endpoint returns 200 but `surveys` array is empty (address outside coverage, or plan
limitation) → route crashes with "Cannot read properties of undefined" on `survey.id`.

**Why it happens:** Nearmap coverage is not 100% of AU. Sydney metro has good coverage but
specific addresses can fall in gaps. Also, the Transactional API's pay-per-site credit model
requires the account to be provisioned for this endpoint type — a standard tile-only account
will not have Transactional access.

**How to avoid:**
1. Check `surveys?.length > 0` before using `surveys[0]`.
2. Return a clear 404 error: `"No Nearmap coverage available for this location"` so the client can trigger the MapLibre fallback.
3. Verify account has Transactional Content API access BEFORE planning tasks that depend on the two-step flow.

**Warning signs:** Coverage endpoint returns empty `surveys` array, or 403/401 on the coverage call.

### Pitfall 2: Coordinate Order Inversion

**What goes wrong:** Image fetched from wrong location, or API returns 400.

**Why it happens:** Nearmap uses `LONG,LAT` order for the Transactional API point parameter
(`/coverage/v2/point/{lng},{lat}`) but the existing codebase and Google Maps use `LAT,LNG`.
The legacy staticmap endpoint uses `center=LAT,LNG`. These are opposite conventions.

**How to avoid:** Add explicit comments in code: `// Nearmap: LONG, LAT order`. Verify with a
known Sydney address (e.g., -33.8688, 151.2093) — Sydney CBD should produce recognizable imagery.

**Warning signs:** Image renders but shows ocean or wrong suburb.

### Pitfall 3: `place_id` Contains Characters Unsafe for Storage Paths

**What goes wrong:** Supabase Storage upload fails with 400 or creates unexpected path.

**Why it happens:** Google `place_id` values look like `ChIJP3Sa8ziYEmsRUKgyFmh9AQM` — all
alphanumeric+underscores. But this is not guaranteed across all place types. If a place_id
contains `/` or other special chars, the filename could malform the path.

**How to avoid:** Sanitize: `placeId.replace(/[^a-zA-Z0-9_-]/g, '_')` before using as filename.
Or just trust the Google Places API format (consistently alphanumeric in practice).

**Warning signs:** Supabase returns 400 on upload with path-related error.

### Pitfall 4: Bucket Not Public

**What goes wrong:** `getPublicUrl()` returns a URL that 403s when loaded in `<img>`.

**Why it happens:** Supabase `getPublicUrl()` does NOT verify bucket public status. It silently
generates a URL that requires auth to access, which `<img>` elements cannot supply.

**How to avoid:** Create the `nearmap-images` bucket as **public** in Supabase dashboard
(Storage → New bucket → toggle "Public bucket"). Include this as a Wave 0 / setup task in the plan.

**Warning signs:** `<img>` shows broken image icon; network tab shows 403 on the Supabase URL.

### Pitfall 5: `maxDuration` Too Low

**What goes wrong:** API route times out mid-flight; client gets 504.

**Why it happens:** Nearmap Transactional path requires two serial HTTP requests. Nearmap
coverage call: ~1-3s. Nearmap image fetch: ~3-8s (1024×1024 JPEG). Supabase upload: ~1-3s.
Total worst case: ~14s. Next.js default serverless timeout may be 10s.

**How to avoid:** Set `export const maxDuration = 30` in the route file. Matches pattern from
CONTEXT.md established patterns.

**Warning signs:** Client receives 504 or empty response for first (uncached) addresses.

### Pitfall 6: Concurrent Requests for Same place_id Race to Upload

**What goes wrong:** Two users hit "Load aerial photo" for same address simultaneously. Both
check cache (miss), both call Nearmap (double charge), second upload fails with "Asset Already
Exists" (400) if `upsert: false`.

**How to avoid:** Catch the "already exists" error on upload, then fall through to `getPublicUrl()`.
This costs one extra Nearmap charge in the race case but is safe and simple. In-flight deduplication
(mutex/lock) is over-engineering for v1.

---

## Code Examples

### Full API Route Skeleton

```typescript
// src/app/api/nearmap-image/route.ts
// Source: patterns from src/app/api/tiles/[z]/[x]/[y]/route.ts + src/app/api/leads/route.ts

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 30;

const BUCKET = "nearmap-images";

export async function POST(req: Request) {
  const apiKey = process.env.NEARMAP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "NEARMAP_API_KEY not configured" }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const { placeId, lat, lng } = body ?? {};
  if (!placeId || typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ error: "Missing placeId, lat, or lng" }, { status: 400 });
  }

  const safeName = `${String(placeId).replace(/[^a-zA-Z0-9_-]/g, "_")}.jpg`;

  try {
    // 1. Cache check
    const supabase = getSupabaseAdmin();
    const { data: listed } = await supabase.storage
      .from(BUCKET)
      .list("", { search: safeName });
    if (listed?.some((f) => f.name === safeName)) {
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(safeName);
      return NextResponse.json({ url: data.publicUrl, cache: "hit" });
    }

    // 2. Nearmap fetch (implement fetchNearmapImage — see nearmap.ts)
    const jpegBuffer = await fetchNearmapImage(apiKey, lat, lng);

    // 3. Upload to Supabase Storage
    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(safeName, jpegBuffer, {
        contentType: "image/jpeg",
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadErr && !uploadErr.message.includes("already exists")) {
      throw new Error(`Storage upload: ${uploadErr.message}`);
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(safeName);
    return NextResponse.json({ url: data.publicUrl, cache: "miss" });
  } catch (err) {
    console.error("[nearmap-image]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
```

### Client-Side: Load Button + Image Display in RoofEditor

```typescript
// Additions to src/components/roof-editor.tsx

type ImageState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "loaded"; url: string }
  | { kind: "error"; message: string }
  | { kind: "fallback" }; // MapLibre shown

// State
const [imageState, setImageState] = useState<ImageState>({ kind: "idle" });
const imgRef = useRef<HTMLImageElement>(null);

// Handler for "Load aerial photo" button
const loadAerialPhoto = useCallback(async () => {
  setImageState({ kind: "loading" });
  try {
    const res = await fetch("/api/nearmap-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placeId, lat, lng }),
    });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({}));
      throw new Error(error ?? `HTTP ${res.status}`);
    }
    const { url } = await res.json();
    setImageState({ kind: "loaded", url });
  } catch (err) {
    console.error("[loadAerialPhoto]", err);
    setImageState({
      kind: "error",
      message: err instanceof Error ? err.message : "Unknown error",
    });
  }
}, [placeId, lat, lng]);

// After <img> loads: populate aerialBitmapRef for the segmentation pipeline
const onImageLoad = useCallback(async () => {
  const img = imgRef.current;
  if (!img) return;
  aerialBitmapRef.current?.close();
  aerialBitmapRef.current = await createImageBitmap(img);
  imgDimsRef.current = { w: img.naturalWidth, h: img.naturalHeight };
  maskAlphaRef.current = null;
  setStatus({ kind: "preview" });
}, []);
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| MapLibre tile streaming (256px tiles) | Nearmap static JPEG (1024×1024 px) | Phase 1 | Sharper imagery, single HTTP request, AI-ready |
| Nearmap tile-stream via `/api/tiles` | Nearmap pay-per-site Transactional API | Phase 1 | Per-address billing, one charge per unique address |
| No image caching | Supabase Storage cache per `place_id` | Phase 1 | Repeat visits are free |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Legacy Nearmap staticmap endpoint (`api.nearmap.com/staticmap?center=...`) is operational for the developer's account type | Pattern 2 | If unavailable, must use 2-step Transactional flow |
| A2 | The Transactional Content API returns a `transactionToken` field alongside `surveyId` in the coverage response | Pattern 1 | If token structure differs, image fetch auth will fail |
| A3 | Google `place_id` values are always safe alphanumeric strings (no `/` or `?`) | Pitfall 3 | If special chars present, filename sanitization must be applied |
| A4 | Nearmap imagery is available for the Sydney test address at zoom/resolution sufficient for SAM-2 segmentation | Open Questions | If coverage gap, user sees error and MapLibre fallback |
| A5 | Caching Nearmap JPEG in Supabase Storage for repeat display constitutes "internal business use" within Nearmap's licence | ToS section | If ToS prohibits server-side caching, must change to signed URL per-request |

---

## Open Questions

1. **BLOCKING: Which API path does the developer's Nearmap account support?**
   - What we know: Two paths exist. Transactional API (2-step, requires coverage call + surveyId) is the documented current path. Legacy staticmap (1-step, `center=LAT,LNG&size=...&apikey=...`) is simpler but account-plan dependent.
   - What's unclear: Is the developer's account provisioned for Transactional Content API? Or tile-only? Does the account have AU pay-per-site credits?
   - Recommendation: Plan should include a Wave 0 task: developer verifies which endpoint their account can hit by making a test curl call to `https://api.nearmap.com/coverage/v2/point/151.2093,-33.8688?apikey=KEY&limit=1`. If it returns surveys, Transactional path works. If 403, try legacy path. Document result before code tasks begin.

2. **MEDIUM: Does `NEARMAP_SURVEY_ID` need to be a static env var or is it fetched per-request?**
   - What we know: ROADMAP.md mentions `NEARMAP_SURVEY_ID` as an env var to add. The Transactional API returns a survey ID per coverage call (not static).
   - What's unclear: Did the roadmap author intend a hardcoded "default survey" fallback, or was this written before understanding the Transactional API structure?
   - Recommendation: Do NOT use a static `NEARMAP_SURVEY_ID` env var. The coverage call returns the latest survey ID dynamically for the given lat/lng. If the developer has a specific known survey ID they want to pin, it could be an optional fallback — but the coverage call is more robust.

3. **LOW: Nearmap ToS for AI inference on downloaded images**
   - What we know: Nearmap ToS restricts using Nearmap's *pre-computed AI Attributes* as ML training data. It does not explicitly address using *raw imagery* as input to third-party AI models (SAM-2, FLUX.1) for internal application purposes.
   - What's unclear: Does "Permitted ML" clause cover using the image as SAM-2 input for a client-facing demo tool? The terms mention "internal use by the Licensee."
   - Recommendation: This is a demo / showcase tool, not a competing ML product. The risk is LOW for a single-developer showcase. For a commercial deployment, legal review of the licence is required. Flag for the developer; do not block Phase 1.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| NEARMAP_API_KEY env var | Nearmap API call | Unknown | — | Plan includes env var setup task |
| Supabase Storage bucket `nearmap-images` | Cache layer | Unknown (not in schema.sql) | — | Bucket creation is a Wave 0 task |
| `NEXT_PUBLIC_SUPABASE_URL` | getSupabaseAdmin() | In .env.example, not verified set | — | Existing lead submission uses it; assumed set |
| `SUPABASE_SERVICE_ROLE_KEY` | getSupabaseAdmin() | In .env.example, not verified set | — | As above |
| Node.js / Next.js 15 | API route | Confirmed in package.json | 15.5.15 | — |

**Missing dependencies with no fallback:**
- `NEARMAP_API_KEY` — must be obtained from Nearmap account before any Nearmap code can run
- `nearmap-images` Supabase Storage bucket — must be created as public via Supabase dashboard

**Missing dependencies with fallback:**
- None identified beyond what MapLibre already provides (existing fallback path)

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No user auth; server-to-server API key only |
| V3 Session Management | No | Stateless API route |
| V4 Access Control | Partial | Supabase service role key — never exposed client-side |
| V5 Input Validation | Yes | Validate `placeId`, `lat`, `lng` before passing to API URLs |
| V6 Cryptography | No | No crypto operations |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| API key exposure | Information Disclosure | `NEARMAP_API_KEY` is server-only env var (no `NEXT_PUBLIC_` prefix) |
| SSRF via lat/lng injection | Tampering | Validate lat/lng are finite floats within AU bounds (matches existing preview page guard) |
| Supabase Storage public URL enumeration | Information Disclosure | `place_id` is opaque Google-generated string; not guessable — acceptable for v1 |
| Nearmap over-billing via repeated non-cached calls | Elevation of Privilege | Cache check runs BEFORE Nearmap call; race condition handled via upload error catch |
| Malicious `placeId` with path traversal | Tampering | Sanitize with `replace(/[^a-zA-Z0-9_-]/g, '_')` before using as filename |

---

## Sources

### Primary (HIGH confidence)
- [VERIFIED: src/components/roof-editor.tsx] — aerialBitmapRef population, captureMap pattern, RoofEditor structure
- [VERIFIED: src/app/api/tiles/[z]/[x]/[y]/route.ts] — Nearmap tile URL format, route patterns
- [VERIFIED: src/lib/supabase.ts] — getSupabaseAdmin() singleton pattern
- [VERIFIED: src/app/api/leads/route.ts pattern] — error handling, response format
- [VERIFIED: npm registry 2026-04-23] — @supabase/supabase-js latest version 2.104.1
- [CITED: developer.nearmap.com/docs/transactional-content-api] — Transactional API 2-step workflow
- [CITED: developer.nearmap.com/reference/get_surveys-surveyid-type-format-1] — image endpoint parameters
- [CITED: developer.nearmap.com/docs/nearmap-api-standards] — apikey as query param `?apikey=`
- [CITED: developer.nearmap.com/docs/retrieve-metadata-for-a-given-point] — coverage endpoint URL format
- [CITED: supabase.com/docs/guides/storage/uploads/standard-uploads] — upload method signature
- [CITED: supabase.com/docs/reference/javascript/storage-from-getpublicurl] — getPublicUrl, public bucket requirement

### Secondary (MEDIUM confidence)
- [CITED: developer.nearmap.com/docs/tile-api] — Tile API works without survey ID, defaults to latest survey
- [CITED: nesin.io/blog/check-if-file-exists-supabase-storage] — list() pattern for file existence check (no native exists() in JS SDK)

### Tertiary (LOW confidence)
- [ASSUMED: docs.nearmap.com/display/ND/Image+API] — Legacy staticmap endpoint format (docs redirect, content not fully rendered)
- [ASSUMED: nearmap.com/legal/product-specific-terms] — ToS interpretation for AI inference; page rendered but policy language is complex and product-specific

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages are in existing project, no new installs
- Architecture: HIGH — patterns match existing codebase exactly
- Nearmap API (Transactional path): MEDIUM — endpoint structure confirmed from official docs, but account-type access unverified
- Nearmap API (Legacy path): LOW — format confirmed from multiple sources but operational status unverified
- Supabase Storage: HIGH — official docs + existing codebase pattern confirmed
- ToS for AI use: LOW — complex licence, not fully parsed

**Research date:** 2026-04-23
**Valid until:** 2026-05-23 (Nearmap docs are stable; Supabase JS SDK minor updates unlikely to break patterns)

---

## RESEARCH COMPLETE
