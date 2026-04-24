# Codebase Structure

**Analysis Date:** 2026-04-24

## Directory Layout

```
roofing.sydney/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with fonts, metadata
│   │   ├── page.tsx                # Home page (hero, autocomplete)
│   │   ├── globals.css             # Tailwind imports, CSS variables
│   │   ├── api/
│   │   │   ├── leads/
│   │   │   │   └── route.ts        # POST lead form submission
│   │   │   ├── segment/
│   │   │   │   ├── route.ts        # Deprecated POST roof segmentation
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts    # Deprecated GET segmentation result
│   │   │   └── tiles/[z]/[x]/[y]/
│   │   │       └── route.ts        # GET proxied aerial tiles
│   │   ├── preview/
│   │   │   └── page.tsx            # Roof editor page
│   │   ├── privacy/
│   │   │   └── page.tsx            # Privacy policy
│   │   ├── terms/
│   │   │   └── page.tsx            # Terms of service
│   │   ├── robots.ts               # SEO robots.txt
│   │   └── sitemap.ts              # SEO sitemap.xml
│   ├── components/
│   │   ├── address-autocomplete.tsx # Google Places address search
│   │   ├── colorbond-picker.tsx    # Color swatch grid
│   │   ├── lead-form.tsx           # Quote request form
│   │   ├── roof-editor.tsx         # Map + flood-fill + color overlay
│   │   ├── site-header.tsx         # Sticky nav with logo
│   │   └── site-footer.tsx         # Footer links
│   └── lib/
│       ├── colorbond.ts            # Colorbond® color palette
│       ├── email.ts                # Resend email builder
│       ├── leads.ts                # Lead validation schema
│       ├── replicate.ts            # Replicate AI SDK (deprecated)
│       └── supabase.ts             # Supabase admin client
├── .next/                          # Build output (gitignored)
├── node_modules/                   # Dependencies (gitignored)
├── public/                         # Static assets (favicon, OG images)
├── package.json                    # Dependencies, scripts, metadata
├── tsconfig.json                   # TypeScript compiler options
├── next.config.ts                  # Next.js config
├── tailwind.config.ts              # Tailwind CSS config
├── postcss.config.ts               # PostCSS config (Tailwind processing)
└── .gitignore                      # Git exclusions
```

## Directory Purposes

**`src/app/`:**
- Purpose: Next.js App Router pages and API routes
- Contains: Page components (Next.js file-based routing), route handlers, layout hierarchy
- Key files: `page.tsx` (home), `preview/page.tsx` (editor), `layout.tsx` (root), `api/` (routes)

**`src/components/`:**
- Purpose: Reusable React components for UI
- Contains: Client-side interactive components, form widgets, map UI
- Key files: `roof-editor.tsx` (main editor with map+segmentation), `lead-form.tsx` (quote form), `address-autocomplete.tsx` (address search)

**`src/lib/`:**
- Purpose: Shared utilities, service clients, validation, domain logic
- Contains: Type definitions, external SDK initialization, validation functions, constants
- Key files: `colorbond.ts` (color data), `leads.ts` (validation), `supabase.ts` (DB client), `email.ts` (notifications)

**`src/app/api/`:**
- Purpose: Server-side route handlers
- Contains: HTTP request/response logic, external service calls, database operations
- Key files: `leads/route.ts` (lead submission), `tiles/[z]/[x]/[y]/route.ts` (tile proxy)

## Key File Locations

**Entry Points:**
- `src/app/page.tsx`: Home page — address autocomplete, hero, call-to-action
- `src/app/preview/page.tsx`: Roof editor page — validation, RoofEditor props
- `src/app/layout.tsx`: Root HTML layout, metadata, fonts

**Configuration:**
- `package.json`: Dependencies (Next 15, React 19, Tailwind 4, MapLibre, Supabase, Resend)
- `tsconfig.json`: Path alias `@/*` → `src/*`
- `next.config.ts`: Minimal config (placeholder)
- `tailwind.config.ts`: Color palette, spacing, custom theme
- `src/app/globals.css`: CSS variables, Tailwind directives

**Core Logic:**
- `src/components/roof-editor.tsx`: Map initialization, flood-fill algorithm, canvas rendering, color blending
- `src/app/api/tiles/[z]/[x]/[y]/route.ts`: Tile provider selection, upstream proxy, caching
- `src/app/api/leads/route.ts`: Lead validation, database insert, email notification

**Data & Validation:**
- `src/lib/leads.ts`: LeadInput type, validation regex, validateLead()
- `src/lib/colorbond.ts`: ColorbondColour type, COLORBOND_COLOURS array, hexToRgb()

**Services:**
- `src/lib/supabase.ts`: getSupabaseAdmin() singleton with service key
- `src/lib/email.ts`: Resend client, email template builders (HTML/text)
- `src/lib/replicate.ts`: getReplicate() singleton, SAM-2 model reference (deprecated)

**Testing:**
- No test files present in codebase

## Naming Conventions

**Files:**
- **Pages:** `page.tsx` (Next.js convention) or `layout.tsx`, `error.tsx`, `not-found.tsx`
- **Routes:** `route.ts` (Next.js convention for API handlers)
- **Components:** `PascalCase.tsx` (React convention) — e.g., `RoofEditor.tsx`, `LeadForm.tsx`
- **Utilities:** `kebab-case.ts` — e.g., `supabase.ts`, `email.ts`, `colorbond.ts`
- **Styles:** `globals.css` for global styles, inline styles in components via className/style

**Directories:**
- **App directory:** `lowercase` — e.g., `src/app/`, `src/app/api/`, `src/app/preview/`
- **Dynamic routes:** `[brackets]` for segments — e.g., `[z]/[x]/[y]/route.ts`
- **Components:** `src/components/` (plural)
- **Utilities:** `src/lib/` (convention for shared non-component code)

**Functions:**
- **React components:** PascalCase — `AddressAutocomplete()`, `RoofEditor()`
- **Utility functions:** camelCase — `validateLead()`, `hexToRgb()`, `getSupabaseAdmin()`, `floodFillMask()`
- **Helper functions:** camelCase — `segmentAt()`, `resolveAndGo()`, `onSubmit()`

**Variables:**
- **State:** camelCase — `query`, `suggestions`, `status`, `selected`
- **Refs:** camelCase + Ref suffix — `mapRef`, `inputRef`, `aerialBitmapRef`, `statusRef`
- **Constants:** UPPER_SNAKE_CASE — `COLORBOND_COLOURS`, `MAX_CAPTURE_DIM`, `FILL_TOLERANCE`, `MAX_FILL_RATIO`
- **Types:** PascalCase — `ColorbondColour`, `LeadInput`, `ValidationError`, `Status`

**Environment Variables:**
- **Public (client-visible):** `NEXT_PUBLIC_*` prefix — `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_CONTACT_PHONE`
- **Server-only:** No prefix — `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `REPLICATE_API_TOKEN`, `MAPBOX_ACCESS_TOKEN`, `NEARMAP_API_KEY`
- **Configuration:** `TILE_PROVIDER` (string: "mapbox" | "nearmap")

## Where to Add New Code

**New Feature (e.g., a new page or flow):**
- Primary code: `src/app/[feature]/page.tsx` (page) or `src/app/api/[feature]/route.ts` (API)
- Components: `src/components/[FeatureName].tsx`
- Utilities: `src/lib/[feature].ts` (if domain logic needed)
- Tests: N/A (no test framework configured)

**New Component/Module:**
- Implementation: `src/components/[ComponentName].tsx`
- Types: Inline in component file or `src/lib/types.ts` (if shared)
- If client-side interactivity: Use React 19 hooks (useState, useCallback, useEffect, useRef)
- If requires server data: Use searchParams prop or POST to API

**Utilities/Helpers:**
- Shared helpers: `src/lib/[domain].ts`
- Service clients: Follow pattern in `src/lib/supabase.ts` (lazy singleton with error throwing)
- Validation: Use discriminated union return type like validateLead()

**API Endpoints:**
- Route handler: `src/app/api/[path]/route.ts`
- Set `export const runtime = "nodejs"` and `export const maxDuration = X` (timeout config)
- Import validators from `src/lib/` and call before processing
- Wrap external calls in try-catch, return NextResponse.json() with status codes
- Log errors to console (no structured logging)

**SEO/Metadata:**
- Dynamic metadata: Export `metadata` object in page components
- Dynamic sitemap/robots: `src/app/sitemap.ts`, `src/app/robots.ts`

## Special Directories

**`src/app/api/`:**
- Purpose: Route handlers
- Generated: No (source code)
- Committed: Yes
- Next.js dynamically creates routes from directory structure

**`.next/`:**
- Purpose: Build artifacts
- Generated: Yes (by `next build`)
- Committed: No (in .gitignore)

**`node_modules/`:**
- Purpose: Installed dependencies
- Generated: Yes (by npm install)
- Committed: No (in .gitignore)

**`public/`:**
- Purpose: Static files served at root (favicon, images, robots.txt can be here or as routes)
- Generated: No (source)
- Committed: Yes

---

*Structure analysis: 2026-04-24*
