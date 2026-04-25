---
quick_id: 260425-5vu
slug: change-light-theme-hero-section-backgrou
status: complete
date: 2026-04-25
---

# Summary: Light Theme Hero Cream Background

## What Was Done

Replaced the always-dark hero section with a theme-aware design. Light mode now renders a warm cream/off-white gradient; dark mode retains the original navy.

## Changes

### src/app/globals.css
- Replaced `--hero-bg` (single dark value) with `--hero-bg-gradient` in both `:root` (cream) and `[data-theme="dark"]` (navy)
- Added `--hero-button-bg` / `--hero-button-ink` tokens for the inverted Find Roof button
- `:root` hero ink tokens now use dark foreground values for legibility on cream
- `[data-theme="dark"]` hero ink tokens preserve the original light-on-dark values

### src/components/home/HeroBand.tsx
- `ink2`, `ink3`, `heroBorder`, `heroSurface` JS consts now reference CSS variables
- Section `background` uses `var(--hero-bg-gradient)`
- H1, stats numbers, panel header text, form input, "Book an inspection" button — all updated to CSS variable references
- "Find roof" button uses `--hero-button-bg` / `--hero-button-ink` (inverts correctly per theme)
- Swatch unselected border uses `var(--hero-border)`
- SVG overlay badges (address pin + "AI · Recoloured") intentionally kept dark — they overlay a satellite image

## Intentionally Unchanged
- Brand CTA button (`#c8443b` red, `#f1faee` text) — correct on both backgrounds
- SVG aerial image overlay badges — always dark, overlay aerial photo content
