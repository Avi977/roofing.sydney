# Architecture

**Analysis Date:** 2026-04-24

## Pattern Overview

**Overall:** Next.js 15 App Router with client-server separation

**Key Characteristics:**
- Server-side rendering for landing page and policy pages
- Client-side interactive UI for map/editor (RoofEditor, AddressAutocomplete)
- API routes for backend operations (leads capture, image processing, tile proxying)
- Strict separation between server-only utilities and client components
- Data validation at API boundary with response-based error handling
- Streaming tile proxy for configurable providers (Mapbox/Nearmap)

## Layers

**UI/Presentation Layer:**
- Purpose: Render user interfaces, handle form interactions, manage visual state
- Location: `src/components/`, `src/app/` (page.tsx files)
- Contains: React client components, page components, UI state management
- Depends on: lib/ utilities for validation, data types, and API calls
- Used by: Next.js App Router and client JavaScript

**API Layer:**
- Purpose: Handle HTTP requests, validate input, orchestrate business logic, send responses
- Location: `src/app/api/` (route.ts files)
- Contains: Route handlers for leads, roof segmentation, tile proxying
- Depends on: lib/ for data validation, external service clients, business logic
- Used by: Browser clients, external services

**Service/Integration Layer:**
- Purpose: Abstract external services (Supabase, Resend, Google Maps, Replicate, Mapbox/Nearmap)
- Location: `src/lib/` (e.g., supabase.ts, email.ts, replicate.ts)
- Contains: Client initialization, configuration management, typed wrappers
- Depends on: SDK packages, environment variables
- Used by: API routes and client components

**Data/Type Layer:**
- Purpose: Define schemas, types, validation rules
- Location: `src/lib/` (e.g., leads.ts, colorbond.ts)
- Contains: Type definitions, validation functions, constants
- Depends on: None
- Used by: All layers

## Data Flow

**Address → Preview Flow:**

1. User enters address in AddressAutocomplete (client)
2. Google Places API autocomplete queries (client-side, session token managed)
3. User selects suggestion → resolveAndGo() fetches full place details
4. Router navigates to `/preview?lat=...&lng=...&address=...&placeId=...`
5. PreviewPage (server) validates coordinates within Sydney bounds
6. PreviewPage passes props to RoofEditor (client)

**Aerial Tiles Flow:**

1. MapLibre requests tile from `/api/tiles/[z]/[x]/[y]`
2. Route handler validates tile coordinates
3. Picks provider (Mapbox or Nearmap) from TILE_PROVIDER env
4. Builds upstream URL with credentials from env vars
5. Fetches from upstream, caches in browser (3600s / 86400s CDN)
6. Returns with tile provider header

**Roof Segmentation Flow:**

1. User clicks roof on map in RoofEditor
2. captureMap() extracts canvas to ~1280px max dimension
3. Flood-fill client-side algorithm creates roof mask with tolerance=55
4. User selects color → renderComposite() blends selected Colorbond hex over roof area
5. Client-side only — no server call needed (deprecated Replicate integration)

**Lead Capture Flow:**

1. User fills LeadForm on preview page
2. onSubmit() validates form locally
3. Sends POST to `/api/leads` with lead data + location + selected color
4. API route validates input using validateLead()
5. Inserts into Supabase `leads` table
6. Attempts notifyContractor() via Resend email (best-effort, doesn't fail request)
7. Returns 201 if successful, with field errors on 400

**State Management:**

- Local state only — no Redux/Zustand (React 19 hooks: useState, useRef, useCallback)
- AddressAutocomplete manages: query, suggestions, session token, active index, debounce
- RoofEditor manages: status (preview/processing/ready/error), selected color, refs to canvas/bitmap/mask
- LeadForm manages: form submission state, server errors, field errors
- All state is ephemeral — no persistence across navigation

## Key Abstractions

**Validation Pipeline (Type: Input Validation):**
- Purpose: Ensure lead data conforms to schema before database insert
- Examples: `src/lib/leads.ts` validateLead()
- Pattern: Returns discriminated union { ok: true; value: T } | { ok: false; errors: [] }
- Usage: Called in `/api/leads` route, errors returned to client with field mapping

**Colorbond Colour Palette (Type: Domain Constants):**
- Purpose: Single source of truth for Colorbond® colors with metadata
- Examples: `src/lib/colorbond.ts` COLORBOND_COLOURS array
- Pattern: Exported array of immutable objects with id, name, hex, group
- Usage: Client picker filters by group, server records color selection

**Service Client Singletons (Type: Lazy Initialization):**
- Purpose: Initialize SDK clients once, reuse across requests
- Examples: getSupabaseAdmin(), getResend(), getReplicate(), getPlaces()
- Pattern: Null-checked lazy initialization with error throwing
- Usage: API routes and client components call getter functions

**Flood-fill Mask (Type: Image Processing Algorithm):**
- Purpose: Convert user's click into pixel-level roof mask
- Examples: `src/components/roof-editor.tsx` floodFillMask()
- Pattern: Queue-based BFS with RGB tolerance threshold and max fill ratio cap
- Usage: segmentAt() callback generates mask, renderComposite() applies color

**Tile Proxy (Type: Transparent Proxy):**
- Purpose: Route tile requests to provider, cache headers, error handling
- Examples: `src/app/api/tiles/[z]/[x]/[y]/route.ts`
- Pattern: Configurable provider selection, upstream validation, header pass-through
- Usage: MapLibre requests tiles from /api/tiles, not directly from provider

## Entry Points

**Home Page:**
- Location: `src/app/page.tsx`
- Triggers: User navigates to `/`
- Responsibilities: Render hero, "how it works" section, trust badges, address input form

**Preview Page:**
- Location: `src/app/preview/page.tsx`
- Triggers: AddressAutocomplete resolves address → router.push(/preview?lat=...&lng=...&address=...&placeId=...)
- Responsibilities: Validate coordinates, render RoofEditor with map, color picker, lead form

**API: Leads Endpoint:**
- Location: `src/app/api/leads/route.ts`
- Triggers: POST from LeadForm with name, phone, email, address, coordinates, color, notes
- Responsibilities: Validate input, insert to Supabase, send notification email, return 201/400

**API: Tiles Endpoint:**
- Location: `src/app/api/tiles/[z]/[x]/[y]/route.ts`
- Triggers: MapLibre requests tile at zoom/x/y coordinates
- Responsibilities: Validate coords, proxy to Mapbox or Nearmap, cache, return image

**API: Segment Endpoint (Deprecated):**
- Location: `src/app/api/segment/route.ts` and `src/app/api/segment/[id]/route.ts`
- Triggers: Legacy — no longer used in current flow
- Responsibilities: Was integration with Replicate SAM-2 model; replaced by client-side flood-fill

**Privacy Page:**
- Location: `src/app/privacy/page.tsx`
- Triggers: User navigates to `/privacy`
- Responsibilities: Render privacy policy with service disclosures

**Terms Page:**
- Location: `src/app/terms/page.tsx`
- Triggers: User navigates to `/terms`
- Responsibilities: Render terms of service

## Error Handling

**Strategy:** Discriminated unions for validation; try-catch with user-friendly messages

**Patterns:**

- **Validation errors:** validateLead() returns { ok: false; errors: [{field, message}] }, API returns 400 with errors array for client to map to fields
- **External service errors:** API routes wrap SDK calls in try-catch, log raw error, return generic 502/500 with user message
- **Client-side errors:** Components catch with .catch() or try-catch in async handlers, set error state for display
- **Honeypot spam protection:** Validation detects `company` field presence, treats as invalid without revealing mechanism
- **Bounds validation:** PreviewPage redirects "/" if lat/lng outside Sydney bounds (preventing bad tile requests)
- **Tile errors:** Handler checks upstream response status, returns with same status code to client
- **Flood-fill edge cases:** Checks for minimum fill (200 px), max fill (45% of image), click within canvas bounds

## Cross-Cutting Concerns

**Logging:** Console.log() for errors in API routes (supabase insert, resend notify, replicate call). No structured logging or external service.

**Validation:** 
- **Client-side:** Basic presence checks in form, regex patterns in LeadForm, query state validation
- **Server-side:** Comprehensive validateLead() with regex for name/email/phone (AU-specific), honeypot, field length caps

**Authentication:** 
- **Server routes:** Supabase admin client uses SERVICE_ROLE_KEY (never client key)
- **Client map/places:** Public API keys in NEXT_PUBLIC_* env vars (token usage on client is acceptable)
- **No user sessions:** App is stateless, no sign-in flow

**Request Rate Limiting:** Not implemented; relies on external providers (Google, Mapbox, Resend) rate limiting

**CORS:** Next.js API routes respond with default headers; MapLibre tiles proxied with Content-Type and Cache-Control

---

*Architecture analysis: 2026-04-24*
