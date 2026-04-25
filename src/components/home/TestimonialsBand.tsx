const REVIEWS = [
  {
    quote:
      "The AI colour tool convinced my wife to go Basalt over Surfmist — saved us three months of arguing. Install was three days, spotless, warranty paperwork came through the same week.",
    name: "James M.",
    sub: "Cremorne · Full Colorbond re-roof",
    initials: "JM",
  },
  {
    quote:
      "Got three quotes for a full Colorbond re-roof and this team came in best on price and fastest on timeline. Surfmist looks incredible — two neighbours have already asked for their number.",
    name: "Sarah L.",
    sub: "Chatswood · Colorbond re-roof",
    initials: "SL",
  },
  {
    quote:
      "Storm tore half the roof off on a Tuesday. Tarping crew there in three hours, permanent repair done by Friday. NRMA claim handled by them — I never saw a single form.",
    name: "David R.",
    sub: "Manly · Storm damage repair",
    initials: "DR",
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5 text-amber-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export function TestimonialsBand() {
  return (
    <section className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
            05 — What Sydney says
          </p>
          <h2 className="font-serif text-4xl font-light text-foreground md:text-5xl">
            Trusted on <em className="italic">2,400+</em> homes.
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {REVIEWS.map((r) => (
            <div key={r.name} className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-7">
              <Stars />
              <p className="flex-1 text-sm leading-relaxed text-foreground">&ldquo;{r.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                  {r.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{r.name}</div>
                  <div className="text-xs text-muted">{r.sub}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
