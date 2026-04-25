const SERVICES = [
  "Colorbond re-roofing",
  "Leak detection & repairs",
  "Gutters & downpipes",
  "Insurance claims",
];

const COMPANY = [
  { label: "Colour AI", href: "/preview" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-foreground text-background">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-3 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" className="opacity-80">
                <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8.5Z" />
              </svg>
              <span className="text-sm font-semibold">Australian Roofing Contractors</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed opacity-50">
              Premium metal roofing across Greater Sydney since 2008. Colorbond specialists,
              leak repairs, gutters — and the AI colour visualiser you didn&apos;t know you needed.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest opacity-40">Services</h4>
            <ul className="space-y-2.5">
              {SERVICES.map((s) => (
                <li key={s}>
                  <a href="/#quote" className="text-sm opacity-55 transition-opacity hover:opacity-90">{s}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company + Contact */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest opacity-40">Company</h4>
            <ul className="space-y-2.5">
              {COMPANY.map((c) => (
                <li key={c.href}>
                  <a href={c.href} className="text-sm opacity-55 transition-opacity hover:opacity-90">{c.label}</a>
                </li>
              ))}
              {process.env.NEXT_PUBLIC_CONTACT_PHONE && (
                <li>
                  <a
                    href={`tel:${process.env.NEXT_PUBLIC_CONTACT_PHONE.replace(/[\s()]/g, "")}`}
                    className="text-sm opacity-55 transition-opacity hover:opacity-90"
                  >
                    {process.env.NEXT_PUBLIC_CONTACT_PHONE}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t pt-8 text-xs opacity-35 sm:flex-row sm:justify-between" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <span>&copy; {new Date().getFullYear()} Australian Roofing Contractors &middot; NSW Lic. 324785C</span>
          <span>ABN 82 645 218 904</span>
        </div>
      </div>
    </footer>
  );
}
