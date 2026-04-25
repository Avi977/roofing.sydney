"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const SWATCHES = [
  { name: "Current",   hex: "#7A7975", img: "/images/titanium-zinc-hero.jpeg" },
  { name: "Basalt",    hex: "#3B3B3B", img: "/images/titanium-zinc-basalt.jpeg" },
  { name: "Surfmist",  hex: "#EFECE1", img: "/images/titanium-zinc-surfmist.jpeg" },
  { name: "Manor Red", hex: "#9D4236", img: "/images/titanium-zinc-manor-red.jpeg" },
  { name: "Woodland",  hex: "#4C5457", img: "/images/titanium-zinc-woodland.jpeg" },
  { name: "Jasper",    hex: "#6A6F59", img: "/images/titanium-zinc-jasper.jpeg" },
];

type Stage = "empty" | "loading" | "result";

function darken(hex: string, amt: number) {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  const d = (v: number) => Math.round(Math.max(0, v * (1 - amt)));
  return `rgb(${d(r)},${d(g)},${d(b)})`;
}

const LOAD_MSGS = [
  "Locating property…",
  "Fetching aerial imagery…",
  "Segmenting roof surface…",
  "Applying AI recolour…",
];

export function HeroBand() {
  const [stage, setStage] = useState<Stage>("empty");
  const [address, setAddress] = useState("");
  const [displayAddr, setDisplayAddr] = useState("");
  const [colour, setColour] = useState(SWATCHES[0]);
  const [loadMsg, setLoadMsg] = useState(LOAD_MSGS[0]);
  const [swatchOffset, setSwatchOffset] = useState(0);

  function runDemo(addr?: string) {
    const a = (addr ?? address).trim() || "12 Bronte Rd, Bondi Junction NSW";
    setDisplayAddr(a);
    setStage("loading");
    setLoadMsg(LOAD_MSGS[0]);
    let i = 0;
    const tick = setInterval(() => {
      i++;
      if (i < LOAD_MSGS.length) setLoadMsg(LOAD_MSGS[i]);
    }, 600);
    setTimeout(() => { clearInterval(tick); setStage("result"); }, 2600);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runDemo();
  }

  function handleSwatch(s: typeof SWATCHES[0]) {
    setColour(s);
    runDemo();
  }

  const ink2 = "var(--hero-ink-2)";
  const ink3 = "var(--hero-ink-3)";
  const heroBorder = "var(--hero-border)";
  const heroSurface = "var(--hero-surface)";

  return (
    <section style={{ background: "var(--hero-bg-gradient)" }}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-10 py-14 lg:grid-cols-[1fr_500px] lg:gap-14">

          {/* ── Left ── */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs"
              style={{ borderColor: "rgba(200,68,59,0.4)", color: ink2 }}>
              <span className="h-1.5 w-1.5 rounded-full bg-accent" style={{ animation: "pulse-dot 2s ease-in-out infinite" }} />
              <span><span className="mr-1 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">New</span>
                AI roof colour visualiser · Free &amp; instant</span>
            </div>

            <h1 className="font-serif text-5xl font-light leading-[1.06] tracking-tight lg:text-6xl" style={{ color: "var(--hero-ink)" }}>
              See your roof in a{" "}
              <em className="italic" style={{ color: "#c8443b" }}>new colour</em>{" "}
              before you commit.
            </h1>

            <p className="mt-5 max-w-[38ch] text-base leading-relaxed" style={{ color: ink2 }}>
              Sydney&apos;s trusted metal roofing specialists — Colorbond re-roofing, leak repairs
              and gutters. Drop your address to see your home from satellite and paint the roof
              any Colorbond shade you like.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/preview"
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: "#c8443b", color: "#f1faee" }}>
                Try Sydney Roofing
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </Link>
              <a href="#quote"
                className="inline-flex items-center rounded-full px-5 py-3 text-sm transition-colors"
                style={{ border: "1px solid var(--hero-border)", color: "var(--hero-ink-2)" }}>
                Book an inspection
              </a>
            </div>

            <div className="mt-10 flex gap-8">
              {[["2,400+", "Sydney roofs since 2008"], ["25yr", "Workmanship warranty"], ["4.9/5", "Google reviews"]].map(([n, l]) => (
                <div key={l}>
                  <div className="font-serif text-2xl font-semibold" style={{ color: "var(--hero-ink)" }}>{n}</div>
                  <div className="mt-1 text-xs leading-snug" style={{ color: ink3, maxWidth: "14ch" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: AI Panel ── */}
          <div className="overflow-hidden rounded-2xl" style={{ background: heroSurface, border: `1px solid ${heroBorder}` }}>
            {/* Panel head */}
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--hero-border)" }}>
              <div className="flex items-center gap-2 text-xs" style={{ color: "var(--hero-ink-2)" }}>
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Sydney Roofing
              </div>
              <span className="rounded-full border px-2 py-0.5 text-[10px]" style={{ borderColor: "var(--hero-border)", color: ink3 }}>Beta</span>
            </div>

            {/* Stage */}
            <div style={{ background: "rgba(0,0,0,0.2)", padding: 4 }}>
              {stage === "empty" && (
                <div className="relative overflow-hidden" style={{ minHeight: 260 }}>
                  <Image
                    src="/images/titanium-zinc-hero.jpeg"
                    alt="Modern home with titanium zinc roof"
                    fill
                    className="object-cover"
                    sizes="440px"
                    priority
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center" style={{ background: "rgba(0,0,0,0.45)" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(241,250,238,0.7)" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    <p className="text-sm font-medium" style={{ color: "#f1faee" }}>Enter your address to see your home.</p>
                    <p className="text-xs leading-relaxed" style={{ color: "rgba(241,250,238,0.6)", maxWidth: "28ch" }}>We&apos;ll fetch a satellite view and let you repaint the roof in any Colorbond colour.</p>
                  </div>
                </div>
              )}

              {stage === "loading" && (
                <div className="relative flex flex-col items-center justify-center gap-4" style={{ minHeight: 260 }}>
                  <Image
                    src="/images/titanium-zinc-top-view.jpeg"
                    alt="Roof top view"
                    fill
                    className="object-cover"
                    sizes="440px"
                  />
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="relative overflow-hidden rounded-lg" style={{ width: "75%", maxWidth: 240, height: 110, border: "1px solid rgba(200,68,59,0.5)", background: "rgba(200,68,59,0.1)" }}>
                      <div style={{ position: "absolute", left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#c8443b,transparent)", animation: "scan 1.4s linear infinite" }} />
                    </div>
                    <p className="font-mono text-xs" style={{ color: "#f1faee" }}>{loadMsg}</p>
                  </div>
                </div>
              )}

              {stage === "result" && (
                <div className="relative overflow-hidden" style={{ minHeight: 260 }}>
                  <Image
                    src={colour.img}
                    alt={`Roof in ${colour.name}`}
                    fill
                    className="object-cover"
                    sizes="440px"
                  />
                  <div style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(11,37,69,0.85)", color: "#f1faee", borderRadius: 999, padding: "3px 10px", fontSize: 10, display: "flex", alignItems: "center", gap: 4 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    {displayAddr}
                  </div>
                  <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(11,37,69,0.85)", color: "#f1faee", borderRadius: 999, padding: "3px 8px", fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase" }}>
                    {colour.name} · Preview
                  </div>
                </div>
              )}
            </div>

            {/* Address form */}
            <form onSubmit={handleSubmit} className="flex gap-2 p-3">
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 12 Bronte Rd, Bondi Junction"
                className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: "var(--hero-surface)", border: "1px solid var(--hero-border)", color: "var(--hero-ink)" }}
              />
              <button type="submit" className="rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap transition-opacity hover:opacity-90"
                style={{ background: "var(--hero-button-bg)", color: "var(--hero-button-ink)" }}>
                Find roof
              </button>
            </form>

            {/* Swatches carousel */}
            <div className="flex items-center gap-2 px-3 pb-3">
              <button
                onClick={() => setSwatchOffset((o) => Math.max(0, o - 1))}
                disabled={swatchOffset === 0}
                className="flex-shrink-0 rounded-full p-1 transition-opacity disabled:opacity-25 hover:opacity-70"
                style={{ border: "1px solid var(--hero-border)", color: ink2 }}
                aria-label="Previous colours"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <div className="grid flex-1 gap-2" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                {SWATCHES.slice(swatchOffset, swatchOffset + 3).map((s) => (
                  <button key={s.hex} onClick={() => handleSwatch(s)}
                    className="overflow-hidden rounded-lg transition-all hover:scale-[1.03]"
                    style={{ border: `2px solid ${s.hex === colour.hex ? "#c8443b" : "var(--hero-border)"}` }}>
                    <div style={{ height: 36, background: s.hex }} />
                    <div className="py-1.5 text-center font-medium" style={{ fontSize: 11, color: ink2 }}>{s.name}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setSwatchOffset((o) => Math.min(SWATCHES.length - 3, o + 1))}
                disabled={swatchOffset >= SWATCHES.length - 3}
                className="flex-shrink-0 rounded-full p-1 transition-opacity disabled:opacity-25 hover:opacity-70"
                style={{ border: "1px solid var(--hero-border)", color: ink2 }}
                aria-label="Next colours"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>

            {/* Real tool CTA — only in result state */}
            {stage === "result" && (
              <div className="px-3 pb-3">
                <Link href="/preview"
                  className="block rounded-lg py-2 text-center text-xs font-medium transition-colors"
                  style={{ background: "rgba(200,68,59,0.12)", color: "#e06050", border: "1px solid rgba(200,68,59,0.2)" }}>
                  Try it on your actual roof →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
