# Technology Stack

**Analysis Date:** 2026-04-24

## Languages

**Primary:**
- TypeScript 5.x - Full codebase (app router, API routes, components)

**Secondary:**
- JavaScript (ESM) - Build config (`postcss.config.mjs`, `eslint.config.mjs`)
- SQL - Supabase schema at `supabase/schema.sql`

## Runtime

**Environment:**
- Node.js (no explicit version constraint in package.json; production target is Vercel)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` (v3, present)

## Frameworks

**Core:**
- Next.js 15.5.15 - Full-stack framework with App Router
- React 19.1.0 - UI components
- React DOM 19.1.0 - DOM rendering

**Styling:**
- Tailwind CSS 4 - Utility-first CSS framework
- PostCSS 4 (via `@tailwindcss/postcss`) - CSS processing pipeline

**Testing:**
- No test framework configured

**Build/Dev:**
- Turbopack - Build bundler (enabled via `--turbopack` flag in dev/build scripts)
- TypeScript compiler - Type checking

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` 2.103.3 - PostgreSQL backend for lead storage
- `resend` 6.12.0 - Email service for contractor notifications
- `@googlemaps/js-api-loader` 2.0.2 - Google Places API for address autocomplete
- `maplibre-gl` 5.23.0 - Map rendering library (client-side map viewer)
- `replicate` 1.4.0 - AI model orchestration for roof segmentation (Meta SAM-2)

**Image Processing:**
- `sharp` 0.34.5 - High-performance image processing for mask analysis

**Type Definitions:**
- `@types/google.maps` 3.64.0 - TypeScript types for Google Maps
- `@types/node` 20.x - Node.js types
- `@types/react` 19.x - React types
- `@types/react-dom` 19.x - React DOM types

**Linting:**
- `eslint` 9.x - Code linting
- `eslint-config-next` 15.5.15 - Next.js ESLint config
- `@eslint/eslintrc` 3.x - ESLint config compatibility

## Configuration

**Environment:**
- `.env` / `.env.example` at project root defines all configuration
- Public environment variables prefixed with `NEXT_PUBLIC_` (browser-safe)
- Server-only variables without prefix

**Build:**
- `next.config.ts` - Next.js configuration (minimal, no custom overrides)
- `tsconfig.json` - TypeScript compiler options with path alias `@/*` → `./src/*`
- `postcss.config.mjs` - PostCSS pipeline with Tailwind
- `eslint.config.mjs` - ESLint flat config extending Next.js rules

## Platform Requirements

**Development:**
- Node.js (no minimum specified)
- npm (no minimum specified)
- Modern browser with ES2017+ support

**Production:**
- Vercel (optimal deployment target with zero-config support)
- Can run on any Node.js 18+ server supporting Next.js App Router

## Environment Variables

**Required for demo:**
- `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` - Google Places API (New) key, restricted by HTTP referrer
- `MAPBOX_ACCESS_TOKEN` - Mapbox satellite tiles (or `NEARMAP_API_KEY` as alternative)

**For full functionality:**
- `TILE_PROVIDER` - "mapbox" (default) or "nearmap" for aerial tiles
- `REPLICATE_API_TOKEN` - Roof segmentation via Meta SAM-2
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (public)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role (server-only)
- `RESEND_API_KEY` - Email service API key
- `LEAD_NOTIFICATION_FROM` - Email sender address (defaults to `onboarding@resend.dev`)
- `CONTRACTOR_NOTIFICATION_EMAIL` - Lead notification recipient
- `NEXT_PUBLIC_CONTACT_PHONE` - Contact phone in header (optional)

---

*Stack analysis: 2026-04-24*
