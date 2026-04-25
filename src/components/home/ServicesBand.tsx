import Image from "next/image";

const SERVICES = [
  {
    n: "/01",
    title: "Colorbond re-roofing",
    body: "Full metal roof replacements in Colorbond® steel. All 22 standard colours plus Ultra and Matt finishes — matched to your home and climate zone.",
    cta: "Get a Colorbond quote",
    photo: "/images/galvalume-install.jpg",
    alt: "Roofers installing standing seam metal roof",
  },
  {
    n: "/02",
    title: "Leak detection & repairs",
    body: "Same-week response across Greater Sydney. Thermal imaging diagnostics, no-mess access, fixed-price repairs with a 12-month labour guarantee.",
    cta: "Report a leak",
    photo: "/images/metal-install-1.jpg",
    alt: "Roofers working on a metal roof repair",
  },
  {
    n: "/03",
    title: "Gutters & downpipes",
    body: "Quad, Half-Round, Fascia-cover. Leaf-guard systems rated for gum leaves. All profiles colour-matched to your Colorbond palette.",
    cta: "Get a gutter quote",
    photo: "/images/metal-shingle.jpg",
    alt: "Large home with premium metal shingle roof",
  },
];

export function ServicesBand() {
  return (
    <section id="services" className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-14 flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
              01 — Services
            </p>
            <h2 className="font-serif text-4xl font-light leading-tight text-foreground md:text-5xl">
              Roofing done the <em className="italic">Sydney way.</em>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted md:text-right">
            Metal roofing built for Australian conditions — cyclonic wind zones, UV extremes,
            bushfire overlay, and salt spray from the coast.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <div key={s.n} className="group relative overflow-hidden rounded-2xl bg-surface">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={s.photo}
                  alt={s.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <span className="absolute top-4 left-4 font-mono text-xs text-white/60">{s.n}</span>
              </div>
              <div className="p-6">
                <h3 className="text-base font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
                <a
                  href="#quote"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                >
                  {s.cta} →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
