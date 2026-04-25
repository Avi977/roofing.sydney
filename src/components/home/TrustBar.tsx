const CREDENTIALS = [
  "NSW Fair Trading Licensed · 324785C",
  "$20M Public Liability Insurance",
  "Colorbond® Authorised Installer",
  "MBA NSW Member",
  "SafeWork NSW Certified",
  "HIA Award · 2024",
];

export function TrustBar() {
  return (
    <div
      className="overflow-x-auto border-t px-6 py-4"
      style={{ borderColor: "var(--hero-border)", background: "var(--hero-bg)" }}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-x-6 gap-y-2 flex-wrap">
        {CREDENTIALS.map((c, i) => (
          <div key={i} className="flex items-center gap-1.5 whitespace-nowrap text-xs" style={{ color: "var(--hero-ink-3)" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#c8443b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {c}
          </div>
        ))}
      </div>
    </div>
  );
}
