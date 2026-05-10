## DESIGN ARCHETYPE: Studio Luxe

**For:** Nail bars, beauty salons, hair studios, spas, lash studios, bridal studios, brow bars.  
**Signal:** Indulgent, sensory, a treat. "This is time you're spending on yourself."

### Colour tokens
Choose one of two variants based on `{{BRAND_COLOURS}}` and brand tone:

**Light variant** (most salons): 
- Background: soft blush `#FDF5F0` or ivory `#FDFAF7`
- Primary text: warm near-black `#1A0F0A`
- Accent: rose gold `#C4956A`, dusty pink `#D4858A`, or extracted brand rose/warm colour

**Dark variant** (luxury, editorial, nighttime-glam salons):
- Background: deep plum `#140A1A` or near-black `#0E0A0C`
- Primary text: warm cream `#EDE0D8`
- Accent: metallic rose `#E8B4B8` or champagne `#D4B896`

Detect which variant suits the business from `{{BRAND_COLOURS}}`. Default to light.

- **Borders**: `border-rose-100/60` (light) or `border-white/10` (dark)
- **Max 1 accent colour**. Never mix cool and warm accents.

### Typography
- **Display font**: `Cormorant Garamond` (variable weight, use italic variant for hero headings) — the editorial luxury of beauty.
- **Body font**: `Nunito Sans` — soft, approachable, feminine without being frivolous.
- **Heading style**: Large italic Cormorant with generous `tracking-normal` — let the letterforms breathe. Display size: `text-6xl` or larger.
- **Eyebrow labels**: `text-[10px] uppercase tracking-[0.22em] font-medium` in accent colour

### Hero layout
Image-dominant. The hero image (or a gallery of 2 images in asymmetric split) takes 60-65% of the viewport width. Business name and tagline are right-aligned or centered over the imagery. The feeling is editorial magazine, not corporate. Choose an Unsplash image of: hands receiving a nail treatment, a beautifully lit salon interior, close-up of a beauty service in progress.

Never a centered text-only hero — this is a visual business.

### Card pattern
Gallery tiles: `overflow-hidden rounded-2xl` with subtle `scale(1.02)` zoom on hover. Services presented as a vertical accordion or visual panel list with service name, duration, and price. Not cards in a grid.

If showing service cards: soft `bg-white/70 backdrop-blur-sm` glassmorphic feel (light variant) or `bg-white/5 border border-white/10` (dark variant).

### Layout rules
- Gallery or treatment showcase section near the top — this is a visual service, show it first.
- Section padding `py-20`. Sections are intimate, not vast.
- Service list with approximate durations/prices (if in scraped data — never invent prices).
- Testimonial section presented as pull quotes with oversized quotation mark in accent colour.
- Booking CTA is the primary conversion — "Book your appointment" links to `tel:`. Make it prominent.
- About section: personal, first-person if the scraped text supports it ("I opened the salon in 2018 after…")

### Writing tone
Personal and sensory. Speak to the feeling, not the procedure: "Arrive as you are. Leave glowing." Use the owner's voice if the scraped about text is personal. Services descriptions emphasise the experience and the result, not the technical process. No medical/clinical language.
