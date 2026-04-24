# Phase 1: High-Res Imagery - Pattern Map

**Mapped:** 2026-04-23
**Files analyzed:** 4 (2 new, 2 modified)
**Analogs found:** 4 / 4

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/app/api/nearmap-image/route.ts` | API route | request-response + file-I/O | `src/app/api/tiles/[z]/[x]/[y]/route.ts` + `src/app/api/leads/route.ts` | exact (composite) |
| `src/lib/nearmap.ts` | utility / SDK wrapper | request-response | `src/lib/replicate.ts` | exact |
| `src/components/roof-editor.tsx` (modify) | component | event-driven + request-response | self (existing file) | exact — modify in-place |
| `.env.example` (modify) | config | — | self (existing file) | exact — append pattern |

---

## Pattern Assignments

### `src/app/api/nearmap-image/route.ts` (API route, request-response + file-I/O)

**Primary analog:** `src/app/api/tiles/[z]/[x]/[y]/route.ts`
**Secondary analog:** `src/app/api/leads/route.ts`

**Imports pattern** — copy from tiles route (lines 1) + leads route (lines 1-4):
```typescript
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
// (import nearmap helpers from @/lib/nearmap when that file exists)
```

**Runtime + duration declaration** — copy from leads route (lines 6-7); increase maxDuration:
```typescript
export const runtime = "nodejs";
export const maxDuration = 30;   // Nearmap 2-step + Supabase upload worst-case ~14 s
```
Note: `tiles/route.ts` omits `maxDuration`; `leads/route.ts` uses `15`. For this route use `30` per RESEARCH.md Pitfall 5.

**Env-var guard pattern** — copy from tiles route (lines 21-23), adapted:
```typescript
// tiles/route.ts lines 21-23 — discriminated union return:
const key = process.env.NEARMAP_API_KEY;
if (!key) return { error: "NEARMAP_API_KEY not configured" };

// In the new route, inline guard (leads/route.ts style):
const apiKey = process.env.NEARMAP_API_KEY;
if (!apiKey) {
  return NextResponse.json({ error: "NEARMAP_API_KEY not configured" }, { status: 500 });
}
```

**JSON body parse + input validation** — copy from leads route (lines 10-14), adapted:
```typescript
// leads/route.ts lines 10-14:
let raw: Partial<LeadInput>;
try {
  raw = (await req.json()) as Partial<LeadInput>;
} catch {
  return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
}

// New route pattern (from RESEARCH.md Pattern 5):
const body = await req.json().catch(() => null);
const { placeId, lat, lng } = body ?? {};
if (!placeId || typeof lat !== "number" || typeof lng !== "number") {
  return NextResponse.json({ error: "Missing placeId, lat, or lng" }, { status: 400 });
}
```

**getSupabaseAdmin() usage** — copy from leads route (lines 30-31):
```typescript
// leads/route.ts lines 30-31:
const supabase = getSupabaseAdmin();
const { error } = await supabase.from("leads").insert({ ... });
```
For Storage, use the same singleton — just call `.storage` instead of `.from()`.

**Error handling / try-catch shape** — copy from leads route (lines 29-60):
```typescript
// leads/route.ts lines 29-60 — two-level try:
try {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from(...).insert(...);
  if (error) {
    console.error("supabase insert failed", error);
    return NextResponse.json({ error: "..." }, { status: 500 });
  }
} catch (e) {
  console.error("supabase client error", e);
  return NextResponse.json({ error: "..." }, { status: 500 });
}

// Tile route upstream failure pattern (lines 50-53):
if (!upstream.ok) {
  return new NextResponse(`Upstream ${provider} ${upstream.status}`, {
    status: upstream.status,
  });
}
```
For the nearmap route, combine: one outer try-catch, `console.error("[nearmap-image]", err)`, return `502` on upstream failure.

**Binary body read** — copy from tiles route (line 56):
```typescript
// tiles/route.ts line 56 — read upstream response as ArrayBuffer:
const body = await upstream.arrayBuffer();
```
Same call is used to capture Nearmap JPEG bytes before passing to Supabase Storage.

**Successful JSON response** — copy from leads route (line 69):
```typescript
// leads/route.ts line 69:
return NextResponse.json({ ok: true }, { status: 201 });

// New route shape:
return NextResponse.json({ url: data.publicUrl, cache: "hit" | "miss" });
```

---

### `src/lib/nearmap.ts` (utility, request-response)

**Analog:** `src/lib/replicate.ts` (exact match — same lazy-singleton + exported constants/types pattern)

**Full file pattern** — copy structure from replicate.ts (lines 1-20):
```typescript
// src/lib/replicate.ts lines 1-20:
import Replicate from "replicate";

let client: Replicate | null = null;

export function getReplicate(): Replicate {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error("REPLICATE_API_TOKEN is not set");
  }
  if (!client) {
    client = new Replicate({ auth: token });
  }
  return client;
}

export const SAM2_MODEL = "meta/sam-2:fe97b453...";

export type Sam2Output = {
  combined_mask: string;
  individual_masks: string[];
};
```

**Adapted for Nearmap** — no SDK class (raw fetch), so `nearmap.ts` exports a URL builder + types rather than a singleton client:
```typescript
// Pattern to follow (no class instantiation needed):
// 1. Validate env var at call time (throw, not return null)
// 2. Export pure URL-builder functions (one per API path)
// 3. Export TypeScript types for API responses
// 4. Export named constants for reuse (BASE_URL, IMAGE_SIZE, BUCKET)
```

**Discriminated union return type** — copy from tiles route `buildUpstreamUrl` (lines 14-24):
```typescript
// tiles/route.ts lines 14-24:
function buildUpstreamUrl(provider: Provider, z: number, x: number, y: number): string | { error: string } {
  if (provider === "mapbox") {
    const token = process.env.MAPBOX_ACCESS_TOKEN;
    if (!token) return { error: "MAPBOX_ACCESS_TOKEN not configured" };
    return `https://api.mapbox.com/...`;
  }
  const key = process.env.NEARMAP_API_KEY;
  if (!key) return { error: "NEARMAP_API_KEY not configured" };
  return `https://api.nearmap.com/tiles/v3/Vert/${z}/${x}/${y}.jpg?apikey=${encodeURIComponent(key)}`;
}
```
Use this `string | { error: string }` pattern for the `buildCoverageUrl` and `buildImageUrl` functions in `nearmap.ts`.

---

### `src/components/roof-editor.tsx` (component, modify in-place)

**Source file:** `src/components/roof-editor.tsx` — read in full above. All patterns are extracted from it directly.

**Ref trio to preserve** — lines 36-38 (must remain intact; new approach populates these identically):
```typescript
// roof-editor.tsx lines 36-38:
const aerialBitmapRef = useRef<ImageBitmap | null>(null);
const maskAlphaRef = useRef<Uint8ClampedArray | null>(null);
const imgDimsRef = useRef<{ w: number; h: number } | null>(null);
```

**Status discriminated union** — lines 21-25 (extend this type; do NOT replace it):
```typescript
// roof-editor.tsx lines 21-25 — existing Status type:
type Status =
  | { kind: "preview" }
  | { kind: "processing" }
  | { kind: "ready" }
  | { kind: "error"; message: string };
```
Add a parallel `ImageState` type for the image-loading state machine. Keep `Status` unchanged — it controls the flood-fill/segmentation phase. `ImageState` controls the pre-segmentation aerial fetch phase:
```typescript
// New type to add (does NOT replace Status):
type ImageState =
  | { kind: "idle" }       // pre-load placeholder + "Load aerial photo" button
  | { kind: "loading" }    // spinner, button disabled
  | { kind: "loaded"; url: string }  // <img> visible, ready for click-to-segment
  | { kind: "error"; message: string } // error message + retry
  | { kind: "fallback" };  // MapLibre shown (error recovery path)
```

**MapLibre init block to remove/guard** — lines 46-99 (the `useEffect` that creates `mapRef.current`). This entire block becomes conditional on `imageState.kind === "fallback"`. The dynamic import of `maplibre-gl` stays inside the fallback branch only.

**aerialBitmapRef population** — lines 116-117 (existing pattern in `segmentAt`; new `onImageLoad` callback must write to the same refs in the same way):
```typescript
// roof-editor.tsx lines 116-117 — existing pattern:
imgDimsRef.current = { w: captured.width, h: captured.height };
aerialBitmapRef.current = await createImageBitmap(captured.canvas);

// New onImageLoad callback (replaces captureMap for the static image path):
const img = imgRef.current;  // ref to new <img> element
aerialBitmapRef.current?.close();
aerialBitmapRef.current = await createImageBitmap(img);
imgDimsRef.current = { w: img.naturalWidth, h: img.naturalHeight }; // 1024 × 1024
maskAlphaRef.current = null;
setStatus({ kind: "preview" }); // segmentation pipeline is now armed
```

**reset() callback** — lines 170-177 (must be extended to also reset `imageState`):
```typescript
// roof-editor.tsx lines 170-177 — existing reset:
const reset = useCallback(() => {
  aerialBitmapRef.current?.close();
  aerialBitmapRef.current = null;
  maskAlphaRef.current = null;
  imgDimsRef.current = null;
  setSelected(null);
  setStatus({ kind: "preview" });
}, []);
// Add: setImageState({ kind: "idle" }); — reset to pre-load state
```

**Spinner component** — lines 363-370 (already exists; reuse for the "loading" imageState):
```typescript
// roof-editor.tsx lines 363-370 — existing Spinner:
function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="animate-spin" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
```

**Loading overlay pattern** — lines 206-213 (existing `busy` overlay; copy this exact structure for the image-fetch loading state):
```typescript
// roof-editor.tsx lines 206-213 — existing busy overlay:
{busy && (
  <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
    <div className="flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background shadow-lg">
      <Spinner />
      Detecting your roof…
    </div>
  </div>
)}
// Reuse for imageState.kind === "loading" — change text to "Loading aerial photo…"
```

**Error overlay pattern** — lines 215-231 (existing error UI; reuse shape for `imageState.kind === "error"`):
```typescript
// roof-editor.tsx lines 215-231:
{status.kind === "error" && (
  <div className="absolute inset-0 flex items-center justify-center bg-surface/95 p-6 text-center">
    <div className="max-w-sm">
      <div className="text-sm font-semibold text-foreground">Couldn&apos;t detect your roof</div>
      <div className="mt-1 text-xs text-muted">{status.message}</div>
      <button type="button" onClick={reset}
        className="mt-4 rounded-xl bg-brand px-3 py-1.5 text-xs font-semibold text-white">
        Try again
      </button>
    </div>
  </div>
)}
```

**Container div + aspect-ratio CSS classes** — lines 183-198 (keep these classes unchanged; replace the inner `<div ref={mapContainerRef}>` with a conditional that shows placeholder/img/map based on `imageState`):
```typescript
// roof-editor.tsx lines 183-198 — outer wrapper classes to keep:
<div className={`relative ${busy ? "cursor-wait" : status.kind === "preview" ? "cursor-crosshair" : "cursor-default"}`}>
  <div
    ref={mapContainerRef}
    className={`aspect-[4/3] w-full sm:aspect-[16/10] ${showMap ? "" : "invisible"}`}
    ...
  />
```

**renderComposite call** — lines 159-168 (unchanged — the segmentation `useEffect` that triggers re-render on colour change is not affected by this phase):
```typescript
// roof-editor.tsx lines 159-168 — keep unchanged:
useEffect(() => {
  if (status.kind !== "ready" || !selected) return;
  renderComposite(
    displayCanvasRef.current,
    aerialBitmapRef.current,
    maskAlphaRef.current,
    imgDimsRef.current,
    selected.hex
  );
}, [selected, status.kind]);
```

---

### `.env.example` (config, modify)

**Analog:** self — lines 14-19 show the existing Nearmap section to extend:
```
# roof-editor.tsx lines 14-19 — existing Nearmap block:
# --- Aerial tiles ---
# Which provider /api/tiles proxies to: "mapbox" (free tier, default) or "nearmap" (paid).
TILE_PROVIDER=mapbox
# Required if TILE_PROVIDER=mapbox. ...
MAPBOX_ACCESS_TOKEN=
# Required if TILE_PROVIDER=nearmap.
NEARMAP_API_KEY=
```

**New lines to append after `NEARMAP_API_KEY=`** (follow the comment style of the existing block):
```
# Required for Nearmap pay-per-site static image API (Phase 1).
# Get from: https://nearmap.com/account — pay-per-site credits must be enabled.
NEARMAP_API_KEY=

# Optional: set to "true" to use the legacy single-call staticmap endpoint instead
# of the two-step Transactional Content API. Try this if coverage calls return 403.
NEARMAP_USE_LEGACY=
```
Note: Do NOT add `NEARMAP_SURVEY_ID` as a static env var — per RESEARCH.md Open Question 2, the survey ID is fetched dynamically per-request from the coverage endpoint.

---

## Shared Patterns

### getSupabaseAdmin() Singleton
**Source:** `src/lib/supabase.ts` lines 1-17
**Apply to:** `src/app/api/nearmap-image/route.ts`
```typescript
// src/lib/supabase.ts lines 1-17:
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  if (!client) {
    client = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
```
Call `getSupabaseAdmin()` at invocation time (inside the route handler), not at module top-level. This matches how `leads/route.ts` uses it (line 30).

### Error Handling Pattern
**Source:** `src/app/api/leads/route.ts` lines 29-60 + `src/app/api/tiles/[z]/[x]/[y]/route.ts` lines 47-64
**Apply to:** `src/app/api/nearmap-image/route.ts`

Three-level error surface:
1. Input validation before try-catch — 400 response
2. Upstream/Supabase failure inside try-catch — `console.error(...)` then 500/502 response
3. Unexpected throw inside try-catch — same `console.error` + 502

Always use `console.error` (not `console.warn` or `console.log`) for errors, matching both analog files.

### Env-Var Guard Pattern
**Source:** `src/app/api/tiles/[z]/[x]/[y]/route.ts` lines 21-23; `src/app/api/leads/route.ts` implicit via `getSupabaseAdmin()` throw
**Apply to:** `src/app/api/nearmap-image/route.ts`, `src/lib/nearmap.ts`

- Server-only keys: no `NEXT_PUBLIC_` prefix, validated at invocation (not module load)
- Guard: check presence → return/throw with descriptive message before any external call
- In route files: `NextResponse.json({ error: "KEY not configured" }, { status: 500 })`
- In lib files: `throw new Error("KEY is not set")` (matches `supabase.ts` line 9 and `replicate.ts` line 7)

### TypeScript Discriminated Union Returns
**Source:** `src/app/api/tiles/[z]/[x]/[y]/route.ts` lines 14-24 (`buildUpstreamUrl` return type)
**Apply to:** `src/lib/nearmap.ts` URL builder functions

```typescript
// tiles/route.ts lines 14-15:
function buildUpstreamUrl(...): string | { error: string } {
```
Use the same `T | { error: string }` pattern for any nearmap.ts function that can fail due to missing env vars or invalid inputs.

### Lazy Singleton for Stateless Lib Utilities
**Source:** `src/lib/replicate.ts` lines 3-13; `src/lib/supabase.ts` lines 3-17
**Apply to:** `src/lib/nearmap.ts`

If `nearmap.ts` wraps any stateful object (e.g., an AbortController factory or a default headers bag), use the `let x: T | null = null; if (!x) { x = ...; } return x;` pattern. If it's purely pure functions, no singleton needed — just export named functions.

### React State + Ref Synchronisation
**Source:** `src/components/roof-editor.tsx` lines 42-43
**Apply to:** `src/components/roof-editor.tsx` (imageState additions)

```typescript
// roof-editor.tsx lines 42-43:
const statusRef = useRef(status);
statusRef.current = status;
```
If `imageState` needs to be read inside event handlers or async callbacks, add a matching `imageStateRef` using the same pattern.

---

## No Analog Found

All four files have close analogs. No entries in this section.

---

## Metadata

**Analog search scope:** `src/app/api/`, `src/lib/`, `src/components/`, `.env.example`
**Files read:** 6 (`tiles/route.ts`, `supabase.ts`, `leads/route.ts`, `replicate.ts`, `roof-editor.tsx`, `.env.example`)
**Pattern extraction date:** 2026-04-23
