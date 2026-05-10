## DESIGN ARCHETYPE: Editorial Luxury

**For:** Solicitors, barristers, architects, premium estate agents, financial advisors, consulting firms.  
**Signal:** Trusted, established, discreet. This firm has been winning since before Google existed.

### Colour tokens
- **Background**: `#FDFBF7` warm cream (or `#F9F7F4` for a marginally cooler variant)
- **Primary text**: `#1C1410` deep espresso — never pure black
- **Accent**: Extract the most distinctive non-black, non-white value from `{{BRAND_COLOURS}}`. If fallback, use `#C8A96E` warm gold. Max 1 accent. Saturation < 80%.
- **Borders**: `border-stone-200/60` — warm, barely-there
- **No AI purple/blue glows, no neon, no cool grays.** Warm grays only throughout.

### Typography
- **Display font**: `Instrument Serif` (variable weight) — editorial, authoritative serif.
- **Body font**: `Plus Jakarta Sans` — modern humanist sans, not tech-bro.
- **Hierarchy**: weight + colour contrast. `font-light` on large display headings, with a bold `text-brand-accent` word for contrast. Never size alone.
- **Eyebrow labels**: `text-[11px] uppercase tracking-[0.18em] font-medium text-brand-accent/80`

### Hero layout
Asymmetric split — text strictly left-aligned, image or typographic lockup on the right. The image should be a professional environment (legal library, oak-panelled office, modern glass atrium, city skyline from an office window). Never centered hero.

### Card pattern
Double-bezel: outer `bg-stone-100/50 ring-1 ring-black/5 p-1.5 rounded-[1.5rem]`, inner `bg-white shadow-[0_1px_1px_rgba(0,0,0,0.04)] rounded-[calc(1.5rem-0.375rem)]`. This reads as crafted, not templated.

### Layout rules
- Section padding minimum `py-28` — the layout must breathe like a premium print publication.
- Services: 2-column zig-zag with alternating text/image positions. Never 3-equal-columns.
- Trust signals: years established + areas of expertise as a typographic lockup, not a stat grid.
- About section image: black-and-white treatment (CSS `filter: grayscale(30%)`) for timeless feel.

### Writing tone
Authoritative and precise. No superlatives ("leading," "best," "premier"). State facts: "Established 1994. Over 2,000 clients advised." First paragraph of hero: one clear sentence about what they do and who for. Never "We are passionate about…"
