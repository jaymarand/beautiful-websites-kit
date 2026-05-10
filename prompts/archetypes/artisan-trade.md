## DESIGN ARCHETYPE: Artisan Trade

**For:** Restaurants, cafes, bakeries, butchers, delis, florists, garden centres, food producers.  
**Signal:** Made with care, by real people. "We've been doing this a long time and we're proud of it."

### Colour tokens
Choose one of two variants based on `{{BRAND_COLOURS}}` and business character:

**Warm light variant** (cafes, bakeries, delis, florists):
- Background: parchment `#F5EDD6` or warm off-white `#FAF7F0`
- Primary text: deep brown `#1A0F05`
- Accent: terracotta `#C4613A`, sage green `#5C7A4E`, or extracted brand earth tone
- Borders: `border-amber-200/50`

**Dark atmospheric variant** (restaurants, bars, supper clubs):
- Background: deep forest `#0F1A0D` or near-black with warm undertone `#100E0B`
- Primary text: warm cream `#F0EBE0`
- Accent: terracotta `#C4613A`, amber `#D4A24A`, or extracted brand
- Borders: `border-white/10`

Detect from `{{BRAND_COLOURS}}`. Restaurants with evening/dinner focus → dark. Cafes, bakeries, florists → light.

### Typography
- **Display font**: `Playfair Display` (use italic for key headings) — timeless editorial with personality.
- **Body font**: `Lato` — warm, readable, unpretentious.
- **Heading style**: Mix roman and italic within a single heading for editorial tension: `<em>Handmade</em> with intention`.
- **Eyebrow labels**: `text-[11px] uppercase tracking-[0.16em] font-semibold` in muted accent
- **Texture detail**: Add a subtle noise texture SVG as a CSS `background-image` at `opacity: 0.025` — gives a crafted, printed-on-paper quality.

### Hero layout
Full-bleed atmospheric image hero. The image occupies 55-65% of the viewport as a full-height side panel (light variant: image right, text left) or full-screen with text overlaid using strong text-shadow (dark variant). 

**For dark variant**: Hero is full-viewport, image fills the background, headline and tagline overlaid center-bottom with `text-shadow: 0 2px 20px rgba(0,0,0,0.8)`. CTA floats up from bottom.

**For light variant**: Image right, text left. Asymmetric — the image is alive, the text is grounded.

Choose Unsplash images of: real food being prepared, hands working with ingredients, a beautifully lit table setting, the interior of the establishment.

### Card pattern
No cards for menus/services — use a clean list with `border-b border-amber-200/30` dividers (light) or `border-white/10` (dark). Prices and descriptions aligned with tabular spacing. This reads like a printed menu, not a SaaS feature grid.

For highlights/specials: asymmetric image+text blocks with the image bleeding off the grid edge.

### Layout rules
- Story section near the top — the founding narrative ("We've been baking on this street since 1987"). Short, personal, real.
- Menu/product section with categories and descriptions (from scraped data only). No invented menu items.
- Section padding `py-20` — let it breathe but keep it intimate, not palatial.
- Opening hours prominently in footer and contact section.
- Location and address given equal prominence to phone — people want to know where you are.
- Thin horizontal rule dividers (`<hr className="border-t border-amber-200/30 my-16">`) between sections — creates the quality of a printed document.

### Writing tone
Story-first, unpretentious. Past tense for the founding story: "We opened on this corner in 2009 with a single oven and a determination to..." Present tense for what they do. Short sentences. Real specifics where available ("Our sourdough takes 48 hours"). Never: "award-winning", "artisan" (they are one — they don't need to say it), "farm-to-table" unless actually stated on their site.
