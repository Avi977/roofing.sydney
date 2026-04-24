# Testing Patterns

**Analysis Date:** 2026-04-24

## Test Framework

**Status:** No automated testing framework configured

**Key Finding:** This project has no test runner, assertion library, or test files. Jest, Vitest, or other testing libraries are not installed as dependencies.

**Current State:**
- `package.json`: No test scripts or test dependencies
- No `jest.config.*` files in project root
- No `vitest.config.*` files in project root
- No `.test.*` or `.spec.*` files found in `src/`
- No test fixtures or test data directories

## Manual Testing Approach

**Current Validation Strategy:**
Manual client/server validation replaces automated testing:

1. **Client-side Form Validation** (`src/components/lead-form.tsx`):
   - Field error state tracking: `const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})`
   - Server errors: `const [serverError, setServerError] = useState<string | null>(null)`
   - Error display: `{error && <p className="mt-1 text-xs text-red-600">{error}</p>}`

2. **Server-side Input Validation** (`src/lib/leads.ts`):
   - Validation function: `validateLead(input: Partial<LeadInput>)`
   - Returns: `{ ok: true; value: LeadInput } | { ok: false; errors: ValidationError[] }`
   - Regex patterns for name, email, phone: `NAME_RE`, `EMAIL_RE`, `PHONE_RE`
   - Honeypot field: checks if bot-filled field is empty
   - API error handling: explicit 400 responses for validation failures

3. **Runtime Type Checking**:
   ```typescript
   if (!body.image || typeof body.image !== "string") {
     return NextResponse.json({ error: "Missing image field" }, { status: 400 });
   }
   if (body.image.length > 8 * 1024 * 1024) {
     return NextResponse.json({ error: "Image too large" }, { status: 413 });
   }
   ```

## Validation Patterns

**Lead Validation** (`src/lib/leads.ts`):

```typescript
export function validateLead(
  input: Partial<LeadInput>
): { ok: true; value: LeadInput } | { ok: false; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  const name = (input.name ?? "").trim();
  const phone = (input.phone ?? "").trim();
  const email = (input.email ?? "").trim().toLowerCase();
  const address = (input.address ?? "").trim();

  if (!NAME_RE.test(name)) {
    errors.push({ field: "name", message: "Please enter your full name" });
  }
  if (!PHONE_RE.test(phone.replace(/\s/g, ""))) {
    errors.push({
      field: "phone",
      message: "Please enter a valid Australian phone number",
    });
  }
  if (!EMAIL_RE.test(email)) {
    errors.push({ field: "email", message: "Please enter a valid email" });
  }
  if (address.length < 5) {
    errors.push({ field: "address", message: "Missing address" });
  }
  if (input.company && input.company.length > 0) {
    // Honeypot tripped
    errors.push({ field: "company", message: "Invalid submission" });
  }

  if (errors.length > 0) return { ok: false, errors };

  return { ok: true, value: { ... } };
}
```

**Regex Patterns** (`src/lib/leads.ts`):
- `NAME_RE = /^[\p{L}\p{M}'\-\s.]{2,80}$/u` - Unicode-aware name (2–80 chars, letters/accents/hyphens/spaces/dots)
- `EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/` - Basic email format
- `PHONE_RE = /^(\+?61|0)[\s\-()]?[2-47-9](?:[\s\-()]?\d){7,10}$/` - Australian phone numbers

**Request Validation** (`src/app/api/leads/route.ts`, `src/app/api/segment/route.ts`):
```typescript
let raw: Partial<LeadInput>;
try {
  raw = (await req.json()) as Partial<LeadInput>;
} catch {
  return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
}

const result = validateLead(raw);
if (!result.ok) {
  return NextResponse.json({ errors: result.errors }, { status: 400 });
}
const lead = result.value;
```

## Error Handling Tests (Implicit)

**Client-Side Error Flow** (`src/components/lead-form.tsx`):
```typescript
try {
  const res = await fetch("/api/leads", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (res.status === 201) {
    setDone(true);
    return;
  }
  const body = (await res.json().catch(() => ({}))) as {
    error?: string;
    errors?: { field: keyof FieldErrors; message: string }[];
  };
  if (body.errors) {
    const next: FieldErrors = {};
    for (const err of body.errors) next[err.field] = err.message;
    setFieldErrors(next);
  }
  setServerError(body.error ?? (body.errors ? "Please check the highlighted fields." : "Something went wrong."));
} catch {
  setServerError("Network error. Please try again.");
} finally {
  setSubmitting(false);
}
```

## Coverage

**Requirements:** Not enforced

**Current Coverage:** Unknown (no test suite to measure)

**Manual Testing Checklist (Inferred from code):**
- [ ] Valid lead submission with all required fields
- [ ] Invalid name (< 2 chars, special chars outside allowed set)
- [ ] Invalid AU phone number (format, length)
- [ ] Invalid email format
- [ ] Short address (< 5 chars)
- [ ] Honeypot triggered (company field filled)
- [ ] Network error during submission
- [ ] Server error (500) handling
- [ ] Validation error with field messages (400)
- [ ] Successful submission redirect (201 response, "done" state)
- [ ] Optional fields (bestTime, notes) are truly optional
- [ ] Map loads and tiles render
- [ ] Roof detection (click flood fill)
- [ ] Colour selection updates preview
- [ ] Missing image field in segment request
- [ ] Oversized image in segment request (> 8 MB)

## Test Data (Implicit)

**Lead Examples** (from validation regex patterns):
- Valid name: "Alex Chen", "Jane O'Brien", "José García"
- Valid phone: "0412 345 678", "(02) 9999 8888", "+61 2 9999 8888"
- Valid email: "you@example.com", "alex@company.co.au"
- Valid address: "123 Queen Street, Sydney NSW 2000"

**Colour Test Data** (`src/lib/colorbond.ts`):
- 20 Colorbond colours with IDs, names, hex values, and group classifications
- Groups: "light", "neutral", "earth", "dark"

## Testing Gaps

**Untested Areas:**

1. **Integration testing:**
   - Lead submission end-to-end (form → API → database)
   - Email notification sending (`notifyContractor`)
   - Supabase insert with error handling

2. **Component rendering:**
   - Component mount/unmount
   - State transitions (preview → processing → ready → error)
   - User interactions (click, keyboard navigation)

3. **Map/Canvas operations:**
   - Tile loading and rendering
   - Flood fill algorithm correctness
   - Image capture and composite rendering

4. **API endpoints:**
   - `/api/leads` POST with various inputs
   - `/api/segment` POST with image data
   - `/api/tiles/[z]/[x]/[y]` GET responses

5. **Utilities:**
   - `validateLead()` with edge cases
   - `hexToRgb()` with various hex formats
   - HTML escaping in email builder

## Recommended Testing Structure (If Implemented)

**Framework:** Jest or Vitest

**File organization:**
- `src/lib/__tests__/` - Unit tests for utilities
- `src/lib/leads.test.ts` - Validation tests
- `src/components/__tests__/` - Component tests
- `src/app/api/__tests__/` - API endpoint tests

**Test categories:**

```typescript
// Validation tests
describe("validateLead", () => {
  it("accepts valid input");
  it("rejects invalid names");
  it("rejects invalid phones");
  it("rejects invalid emails");
  it("rejects short addresses");
  it("rejects honeypot submissions");
});

// Component tests
describe("LeadForm", () => {
  it("renders form with all fields");
  it("shows field errors from server");
  it("shows success state on 201");
  it("shows network error on fetch failure");
});

// API tests
describe("POST /api/leads", () => {
  it("returns 400 on invalid JSON");
  it("returns 400 on validation error");
  it("returns 201 on success");
  it("returns 500 on database error");
});
```

---

*Testing analysis: 2026-04-24*
