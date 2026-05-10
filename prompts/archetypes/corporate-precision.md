## DESIGN ARCHETYPE: Corporate Precision

**For:** Accountants, chartered accountants, bookkeepers, financial advisors, IFAs, HR consultants, recruitment agencies, insurance brokers, tax specialists.  
**Signal:** Precise, results-focused, reliable. "Your numbers are in the right hands."

### Colour tokens
- **Background**: neutral linen `#F9F8F6` — warm enough to feel human, neutral enough to be serious
- **Primary text**: charcoal `#1F2937` — businesslike without being cold
- **Accent**: confident navy `#1E3A5F` or slate blue `#2D5986`. Extract from `{{BRAND_COLOURS}}` if a clear blue/navy exists. If fallback, use `#1E3A5F`. Avoid warm accent colours — accountants are not nail bars.
- **Borders**: `border-slate-200/60`
- **No warm creams or earthy tones.** This palette is precise and controlled.

### Typography
- **Display font**: `Space Grotesk` — modern, geometric, tabular-nums friendly. Reads as intelligent, not flashy.
- **Body font**: `DM Sans` — clean and highly legible at all sizes.
- **Heading style**: Weight contrast. Display headings in `font-bold text-charcoal`, with a key metric or year as a `text-brand-accent` callout. Numbers are design elements in this archetype.
- **Eyebrow labels**: `text-[11px] uppercase tracking-[0.14em] font-semibold text-brand-accent`
- **Numbers as design**: Years established, client count, satisfaction rate — displayed large in `Space Grotesk font-bold text-5xl text-brand-accent` as design anchors, not just stats.

### Hero layout
Asymmetric — text left, metric lockup right. The right-side "image" can instead be a typographic stat block: large number (`text-8xl font-bold text-brand-accent/15`) as a background element with a real stat overlaid (e.g. "£12M in tax savings. For clients like yours."). Or a clean professional environment image (modern office, glass meeting room, city financial district).

Never a centered hero. Corporate Precision commands the left rail.

### Card pattern
Clean flat cards: `bg-white border border-slate-200/80 rounded-xl shadow-sm`. No double-bezel — that's editorial luxury. Corporate Precision reads clean and structured. Top accent line `border-t-2 border-brand-accent` on service cards.

For services/packages: a structured list or 2-column table-style layout with service name, brief description, and a subtle right-arrow indicator.

### Layout rules
- Numbered process section: "How we work" as 1→2→3→4 steps with large numerals in `text-brand-accent/20` as background elements and the step content overlaid. Clients want to understand the process.
- Key metrics / credibility strip early in the page: years established, number of clients, accreditations, software certifications (Xero, QuickBooks, Sage if mentioned).
- Services section: comprehensive — accountants have many service lines. Use the full list from scraped data.
- Section padding `py-20`.
- Professional, factual About section — founding year, principal's qualifications (from scraped data only), firm's specialism.

### Writing tone
Direct and results-oriented. Lead with outcomes, not process: "We handle your books so you can focus on your business." Be specific where the data supports it. Avoid: "passionate", "dedicated", "going the extra mile" — these are table stakes, not differentiators. Use: "Established 2004", "Xero certified partners", "Self-assessment returns filed on time, every time." If they have a niche (e.g. construction contractors, hospitality sector), lean into it heavily — specialisation is the most powerful differentiator for accountants.
