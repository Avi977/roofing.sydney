# External Integrations

**Analysis Date:** 2026-04-24

## APIs & External Services

**Address Lookup:**
- Google Places API (New) - Address autocomplete with AU restriction
  - SDK/Client: `@googlemaps/js-api-loader` 2.0.2
  - Implementation: `src/components/address-autocomplete.tsx`
  - Auth: `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` (public, HTTP referrer restricted)

**Aerial Imagery (Tile Source):**
- Mapbox Satellite (default, free tier)
  - SDK/Client: `maplibre-gl` 5.23.0
  - Proxy endpoint: `src/app/api/tiles/[z]/[x]/[y]/route.ts`
  - Auth: `MAPBOX_ACCESS_TOKEN` (server-side proxied)
  - Limit: 50K tile loads/month free tier
- Nearmap (alternative, paid contract)
  - Requires: `NEARMAP_API_KEY`
  - Same proxy endpoint, toggled via `TILE_PROVIDER=nearmap` env var

**Roof Segmentation:**
- Replicate - Meta SAM-2 auto-mask model for roof detection
  - SDK/Client: `replicate` 1.4.0
  - Pinned version: `meta/sam-2:fe97b453a6455861e3bac769b441ca1f1086110da7466dbb65cf1eecfd60dc83`
  - Implementation: `src/app/api/segment/route.ts` (POST), `src/app/api/segment/[id]/route.ts` (poll)
  - Auth: `REPLICATE_API_TOKEN` (server-side)
  - Cost: ~$0.007 per segmentation click; $0.10 trial credit

## Data Storage

**Databases:**
- Supabase PostgreSQL (free tier 500MB, 50K MAU)
  - Connection: `NEXT_PUBLIC_SUPABASE_URL` (public), `SUPABASE_SERVICE_ROLE_KEY` (server-only)
  - Client: `@supabase/supabase-js` 2.103.3
  - Implementation: `src/lib/supabase.ts` (singleton admin client)
  - Schema: `supabase/schema.sql`

**Table: `public.leads`**
- Fields: id (UUID), created_at, name, phone, email, address, lat, lng, place_id, selected_colour_id, selected_colour_name, best_time, notes, source, ip, user_agent
- Access: Service role write-only (RLS enabled, no anon/auth access)
- Index: `leads_created_at_idx` on created_at DESC for queries

**File Storage:**
- Replicate API returns image URLs for masks (transient, fetched server-side)
- MapLibre/Mapbox tiles cached in browser
- No persistent file storage (local filesystem or object storage)

**Caching:**
- Browser HTTP cache via `Cache-Control: public, max-age=3600, s-maxage=86400` on tile responses
- No Redis or server-side caching layer

## Authentication & Identity

**Auth Provider:**
- Custom (none used for users; Supabase service role for API writes only)
- Google Places session tokens for autocomplete quota management (created client-side)

## Email & Notifications

**Contractor Notifications:**
- Resend - Email delivery service (free tier: 100 emails/day)
  - SDK/Client: `resend` 6.12.0
  - Implementation: `src/lib/email.ts` (notifyContractor function)
  - Trigger: After successful lead insert via `src/app/api/leads/route.ts`
  - From: `LEAD_NOTIFICATION_FROM` (defaults to `onboarding@resend.dev`)
  - To: `CONTRACTOR_NOTIFICATION_EMAIL`
  - Reply-to: Customer email (set to allow direct replies from contractor)
  - Content: HTML + plain text email with lead details, colour choice, Google Maps link

## Monitoring & Observability

**Error Tracking:**
- None (logs via console.error in server-side code)

**Logs:**
- console.error for Supabase errors (`src/app/api/leads/route.ts` lines 48, 55)
- console.error for Resend failures (`src/app/api/leads/route.ts` line 66)

## CI/CD & Deployment

**Hosting:**
- Vercel (Next.js native, zero-config deployment)

**CI Pipeline:**
- None detected (assumed GitHub Actions via Vercel auto-deploy)

## Environment Configuration

**Required env vars (demo):**
- `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` - Places API key from Google Cloud Console
- `MAPBOX_ACCESS_TOKEN` - Mapbox public token (default `pk.…` format)

**Required env vars (full MVP):**
- `TILE_PROVIDER` - "mapbox" (default) or "nearmap"
- `REPLICATE_API_TOKEN` - API token from replicate.com
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (public)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key (unused, browser-safe)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for lead inserts (server-only)
- `RESEND_API_KEY` - API key from resend.com (server-only)
- `LEAD_NOTIFICATION_FROM` - Email sender (server-only, defaults to `onboarding@resend.dev`)
- `CONTRACTOR_NOTIFICATION_EMAIL` - Lead recipient email (server-only)

**Optional env vars:**
- `NEXT_PUBLIC_CONTACT_PHONE` - Contact phone in site header (omit to hide)
- `NEARMAP_API_KEY` - Required only if `TILE_PROVIDER=nearmap`

**Secrets location:**
- `.env` file (gitignored) for local dev
- Vercel **Environment Variables** dashboard for production

## Webhooks & Callbacks

**Incoming:**
- POST `/api/leads` - Lead submission from client
- POST `/api/segment` - Replicate prediction creation request
- GET `/api/segment/[id]?x=X&y=Y` - Prediction status poll and mask analysis

**Outgoing:**
- Replicate predictions create async jobs (no webhook, client polls for status)
- Resend sends emails (no callback to app)

## Service-Level Agreements & Limits

**Mapbox Satellite:**
- 50K tile loads/month free

**Replicate SAM-2:**
- $0.10 trial credit
- ~$0.007 per inference (roof segmentation)
- Async prediction with client-side polling

**Supabase PostgreSQL:**
- 500MB database size (free tier)
- 50K monthly active users (free tier)
- Row-level security enabled on `leads` table

**Resend Email:**
- 100 emails/day (free tier)
- Must use `onboarding@resend.dev` until domain verified

---

*Integration audit: 2026-04-24*
