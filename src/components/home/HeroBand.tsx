"use client";

import { useState } from "react";
import Link from "next/link";

const SWATCHES = [
  { name: "Monument",  hex: "#7A7975" },
  { name: "Basalt",    hex: "#3B3B3B" },
  { name: "Surfmist",  hex: "#EFECE1" },
  { name: "Manor Red", hex: "#9D4236" },
  { name: "Woodland",  hex: "#4C5457" },
  { name: "Jasper",    hex: "#6A6F59" },
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
    if (stage !== "result") runDemo();
  }

  const ink2 = "var(--hero-ink-2)";
  const ink3 = "var(--hero-ink-3)";
  const heroBorder = "var(--hero-border)";
  const heroSurface = "var(--hero-surface)";

  return (
    <section style={{ background: "var(--hero-bg-gradient)" }}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-10 py-14 lg:grid-cols-[1fr_440px] lg:gap-14">

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
              <button onClick={() => runDemo()}
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: "#c8443b", color: "#f1faee" }}>
                Try colour AI
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </button>
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
                Colour AI · Live
              </div>
              <span className="rounded-full border px-2 py-0.5 text-[10px]" style={{ borderColor: "var(--hero-border)", color: ink3 }}>Beta</span>
            </div>

            {/* Stage */}
            <div style={{ background: "rgba(0,0,0,0.2)", padding: 4 }}>
              {stage === "empty" && (
                <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center" style={{ minHeight: 200 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ink3} strokeWidth="1.5" strokeLinecap="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  <p className="text-sm font-medium" style={{ color: "var(--hero-ink-2)" }}>Enter your address to see your home.</p>
                  <p className="text-xs leading-relaxed" style={{ color: ink3, maxWidth: "28ch" }}>We&apos;ll fetch a satellite view and let you repaint the roof in any Colorbond colour.</p>
                </div>
              )}

              {stage === "loading" && (
                <div className="flex flex-col items-center justify-center gap-4" style={{ minHeight: 200 }}>
                  <div className="relative overflow-hidden rounded-lg" style={{ width: "75%", maxWidth: 240, height: 110, border: "1px solid rgba(200,68,59,0.3)", background: "rgba(200,68,59,0.05)" }}>
                    <div style={{ position: "absolute", left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#c8443b,transparent)", animation: "scan 1.4s linear infinite" }} />
                  </div>
                  <p className="font-mono text-xs" style={{ color: ink2 }}>{loadMsg}</p>
                </div>
              )}

              {stage === "result" && (
                <div style={{ position: "relative" }}>
                  <svg viewBox="0 0 388 228" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%", borderRadius: 8 }}>
                    <defs>
                      <pattern id="g" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#3a4a2e" /><circle cx="2" cy="2" r="1" fill="#4a5a3a" opacity="0.5" /></pattern>
                      <radialGradient id="tg"><stop offset="0%" stopColor="#2d4a1e" /><stop offset="100%" stopColor="#1a2a10" /></radialGradient>
                      <filter id="sh"><feDropShadow dx="2" dy="4" stdDeviation="2" floodOpacity="0.35" /></filter>
                    </defs>
                    <rect width="388" height="228" fill="url(#g)" />
                    <rect x="0" y="0" width="388" height="30" fill="#4a4a48" />
                    <line x1="0" y1="15" x2="388" y2="15" stroke="#c4c4b8" strokeWidth="1.2" strokeDasharray="8,8" opacity="0.4" />
                    <rect x="135" y="30" width="30" height="50" fill="#908a78" opacity="0.75" />
                    <g filter="url(#sh)"><polygon points="18,90 82,90 82,145 18,145" fill="#5a4030" /><polygon points="18,90 50,77 82,90" fill="#7a5040" /></g>
                    <g filter="url(#sh)"><polygon points="298,105 368,105 368,168 298,168" fill="#4a4a47" /><polygon points="298,105 333,92 368,105" fill="#6a6a67" /></g>
                    <circle cx="238" cy="48" r="12" fill="url(#tg)" />
                    <circle cx="258" cy="62" r="9" fill="url(#tg)" />
                    <circle cx="104" cy="162" r="11" fill="url(#tg)" />
                    <circle cx="338" cy="200" r="13" fill="url(#tg)" />
                    <line x1="0" y1="93" x2="388" y2="93" stroke="#2a2a1e" strokeWidth="0.8" opacity="0.5" />
                    <line x1="0" y1="178" x2="388" y2="178" stroke="#2a2a1e" strokeWidth="0.8" opacity="0.5" />
                    <line x1="99" y1="30" x2="99" y2="228" stroke="#2a2a1e" strokeWidth="0.8" opacity="0.4" />
                    <line x1="283" y1="30" x2="283" y2="228" stroke="#2a2a1e" strokeWidth="0.8" opacity="0.4" />
                    <g filter="url(#sh)">
                      <polygon points="116,196 256,196 256,100 116,100" fill="#c8bea4" />
                      <polygon points="111,98 261,98 261,152 111,152" style={{ fill: darken(colour.hex, 0.12) }} />
                      <polygon points="111,149 261,149 261,200 111,200" style={{ fill: colour.hex }} />
                      <line x1="111" y1="151" x2="261" y2="151" stroke="#3a3836" strokeWidth="1.2" />
                      <polygon points="235,152 273,152 273,218 235,218" style={{ fill: darken(colour.hex, 0.08) }} />
                      <line x1="235" y1="185" x2="273" y2="185" stroke="#3a3836" strokeWidth="1" />
                      <rect x="168" y="107" width="12" height="15" fill="#5a4a3a" />
                      <rect x="168" y="105" width="12" height="3" fill="#2a1a0a" />
                    </g>
                  </svg>
                  <div style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(11,37,69,0.85)", color: "#f1faee", borderRadius: 999, padding: "3px 10px", fontSize: 10, display: "flex", alignItems: "center", gap: 4 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    {displayAddr}
                  </div>
                  <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(11,37,69,0.85)", color: "#f1faee", borderRadius: 999, padding: "3px 8px", fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase" }}>
                    AI · Recoloured
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

            {/* Swatches */}
            <div className="grid grid-cols-6 gap-1 px-3 pb-3">
              {SWATCHES.map((s) => (
                <button key={s.hex} onClick={() => handleSwatch(s)}
                  className="overflow-hidden rounded transition-all"
                  style={{ border: `1px solid ${s.hex === colour.hex ? "#c8443b" : "var(--hero-border)"}` }}>
                  <div style={{ height: 20, background: s.hex }} />
                  <div className="py-1 text-center" style={{ fontSize: 8, color: ink3 }}>{s.name}</div>
                </button>
              ))}
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
