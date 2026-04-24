# Coding Conventions

**Analysis Date:** 2026-04-24

## Naming Patterns

**Files:**
- Components: PascalCase with `.tsx` extension (e.g., `AddressAutocomplete.tsx`, `RoofEditor.tsx`)
- API routes: kebab-case or directory-based routing, `.ts` extension (e.g., `route.ts` in `api/leads/`)
- Libraries/utilities: camelCase with `.ts` extension (e.g., `supabase.ts`, `colorbond.ts`, `leads.ts`)
- Pages: lowercase with `.tsx` extension (e.g., `page.tsx`)

**Functions:**
- Exported functions: camelCase (e.g., `getSupabaseAdmin`, `validateLead`, `AddressAutocomplete`)
- Component functions: PascalCase (e.g., `Step`, `Trust`, `Field`, `LogoMark`)
- Internal/helper functions: camelCase (e.g., `captureMap`, `floodFillMask`, `renderComposite`, `buildText`, `buildHtml`)

**Variables:**
- Constants: SCREAMING_SNAKE_CASE (e.g., `MAX_CAPTURE_DIM`, `FILL_TOLERANCE`, `MAX_FILL_RATIO`, `SAM2_MODEL`, `GOOGLE_KEY`)
- Regular variables: camelCase (e.g., `query`, `suggestions`, `loading`, `error`, `selected`)
- State variables: camelCase (e.g., `submitting`, `done`, `serverError`, `fieldErrors`)
- Refs: camelCase with `Ref` suffix (e.g., `mapRef`, `inputRef`, `debounceRef`, `mapContainerRef`, `displayCanvasRef`)

**Types:**
- Type names: PascalCase (e.g., `ColorbondColour`, `LeadInput`, `ValidationError`, `Status`, `FieldErrors`, `Props`, `Suggestion`)
- Type discriminant unions: use explicit `kind` property (e.g., `{ kind: "preview" }`, `{ kind: "processing" }`, `{ kind: "error"; message: string }`)

## Code Style

**Formatting:**
- No explicit formatter configured (no `.prettierrc`)
- Follows Next.js and TypeScript defaults
- Use 2-space indentation (inferred from codebase)
- Line lengths generally kept under 100 characters
- Trailing commas in multiline objects/arrays

**Linting:**
- ESLint with `next/core-web-vitals` and `next/typescript` configs
- Config file: `eslint.config.mjs` (flat config format)
- Run with: `npm run lint` → `eslint` command

**Key ESLint Rules (Next.js defaults):**
- Core Web Vitals best practices
- TypeScript type safety
- React component best practices
- Accessibility checks

## Import Organization

**Order:**
1. React and external library imports (`import { ... } from "react"`, `import Link from "next/link"`)
2. External third-party imports (`import { ... } from "@supabase/supabase-js"`, `import { ... } from "maplibre-gl"`)
3. Internal absolute imports from `@/` alias (components, utilities, types)
4. Local relative imports (current directory utilities)
5. CSS/style imports last (e.g., `import "maplibre-gl/dist/maplibre-gl.css"`)

**Path Aliases:**
- `@/*` → `./src/*` - Use this for all internal imports

**Example from `roof-editor.tsx`:**
```typescript
import { useCallback, useEffect, useRef, useState } from "react";
import type { Map as MLMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  COLORBOND_COLOURS,
  hexToRgb,
  type ColorbondColour,
} from "@/lib/colorbond";
import { ColorbondPicker } from "@/components/colorbond-picker";
import { LeadForm } from "@/components/lead-form";
```

## Error Handling

**Patterns:**

1. **Validation Result Objects** - Return `{ ok: true; value: T } | { ok: false; errors: Error[] }`
   ```typescript
   export function validateLead(
     input: Partial<LeadInput>
   ): { ok: true; value: LeadInput } | { ok: false; errors: ValidationError[] }
   ```

2. **Try-Catch with Console Logging** - Log errors with context
   ```typescript
   try {
     await notifyContractor(lead);
   } catch (e) {
     console.error("resend notify failed", e);
   }
   ```

3. **Specific Error Messages to Users** - Return user-friendly messages in API responses
   ```typescript
   return NextResponse.json(
     { error: "Could not save your enquiry. Please try again." },
     { status: 500 }
   );
   ```

4. **Error Instanceof Checks** - Type-guard errors before accessing properties
   ```typescript
   setError(e instanceof Error ? e.message : "Something went wrong");
   ```

5. **Best-Effort Operations** - Don't fail main request for non-critical operations (see: email notification in `/api/leads`)

6. **Null Propagation** - Check for null values before using
   ```typescript
   const loc = place.location;
   if (!loc) throw new Error("Address has no coordinates");
   ```

## Logging

**Framework:** `console` (no logging library configured)

**Patterns:**
- Use `console.error()` for errors with context prefix (e.g., `"supabase insert failed"`, `"resend notify failed"`)
- Error logging is secondary — user-facing errors are returned via API responses or UI state
- Log early catches: when an error is caught but handled gracefully, log it for debugging
- No structured logging or log levels beyond error/warn

## Comments

**When to Comment:**
- Complex algorithms: Inline comments explaining logic (e.g., flood-fill tolerance calculation, ref-based state management)
- Non-obvious patterns: Explain why a pattern is used (e.g., `/** Server-only Supabase client using the service role key. Never import from client code. */`)
- Honeypot/security patterns: Mark anti-bot logic (e.g., `/* Honeypot — bots fill this, humans don't see it */`)
- Configuration values: Explain magic numbers (e.g., `FILL_TOLERANCE = 55; // RGB Euclidean distance`)

**JSDoc/TSDoc:**
- Function-level docs: Brief purpose with markdown formatting if needed
- Type definitions: Clarify complex properties
- Exports: Mark important constraints (`@server-only`, warning about usage)

**Example:**
```typescript
/** Server-only Supabase client using the service role key. Never import from client code. */
export function getSupabaseAdmin(): SupabaseClient { ... }

/** 8-digit hex with alpha ignored; lowercase; used as fill for multiply blend. */
hex: `#${string}`;
```

## Function Design

**Size:**
- Generally 20-100 lines for component functions
- API route handlers: 30-70 lines
- Helper/utility functions: 10-50 lines
- Complex algorithms (flood fill, rendering) may exceed due to algorithmic nature

**Parameters:**
- Use object destructuring for multiple parameters in React components
- Typed props objects for components: `type Props = { ... }`
- Use callback parameters for event handlers (e.g., `onSelect: (c: ColorbondColour) => void`)

**Return Values:**
- Components: JSX
- API handlers: `NextResponse` objects with explicit status codes
- Validation: Discriminated union types (`{ ok: true; value }` or `{ ok: false; errors }`)
- Async operations: Promises with explicit types
- Canvas operations: void (side effects on DOM elements)

## Module Design

**Exports:**
- Separate component exports from utility exports
- Export functions/types needed by callers; hide internals
- Named exports preferred over default exports (except `page.tsx`, `layout.tsx`, `route.ts`)

**Barrel Files:**
- Not used in this codebase — each module imports directly from source

**Client/Server Boundaries:**
- Use `"use client"` pragma at top of client components
- Server functions in `lib/` are assumed to be server-only (marked with JSDoc)
- API routes are Node.js server-side by default

## TypeScript

**Type Strictness:**
- `tsconfig.json` has `strict: true` enabled
- Always define prop types for React components
- Use discriminated unions for complex state
- Avoid `any` type — use proper type annotations

**Type Examples:**
```typescript
// Discriminated union for status
type Status =
  | { kind: "preview" }
  | { kind: "processing" }
  | { kind: "ready" }
  | { kind: "error"; message: string };

// Partial types for input validation
export type LeadInput = { ... };
export function validateLead(input: Partial<LeadInput>): { ok: ... } | { ok: ... }

// Generic type parameters for reusable components
type FieldErrors = Partial<Record<"name" | "phone" | "email" | ..., string>>;
```

## Tailwind CSS

**Usage:**
- Utility-first approach with Tailwind v4
- Responsive prefixes: `sm:`, `md:` for breakpoints
- Custom CSS variables for theming (e.g., `--ring`, `--brand`, `--foreground`, `--muted`)
- Inline `style` props for dynamic values
- Theme tokens: `bg-brand`, `text-foreground`, `border-border`, `bg-surface`, `text-muted`

---

*Convention analysis: 2026-04-24*
