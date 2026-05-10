## DESIGN ARCHETYPE: Clinical Trust

**For:** Dentists, dental practices, orthodontists, doctors, GPs, physiotherapists, opticians, chiropractors, clinics.  
**Signal:** Qualified, safe, reassuring. "You're in the right hands."

### Colour tokens
- **Background**: `#F8FAFB` crisp off-white — clean, not sterile
- **Primary text**: `#0F1F3D` deep navy — serious without being intimidating
- **Accent**: Calm teal `#1A8C7D` or sky blue `#1E6FA8`. Extract from `{{BRAND_COLOURS}}` if a clear blue/teal exists. If fallback, use teal `#1A8C7D`. Avoid NHS blue (too institutional).
- **Borders**: `border-slate-200/70` — cool, clinical, precise
- **Avoid**: warm creams, earthy tones, deep espress — this is healthcare, not a law library.

### Typography
- **Display font**: `DM Serif Display` — authoritative serif with human warmth. Not cold.
- **Body font**: `DM Sans` — clean, highly readable at small sizes.
- **Hierarchy**: Credentials and reassurance phrases in `font-medium text-slate-600 text-sm tracking-wide`. Qualification badges as `text-xs uppercase tracking-[0.14em] font-semibold`.
- **Eyebrow labels**: `text-[11px] uppercase tracking-[0.16em] font-semibold text-brand-accent`

### Hero layout
Centered hero is acceptable here — symmetry signals confidence and authority in healthcare. Headline centered, large DM Serif Display, with credential badges (GDC registered, BDA member, CQC rated) displayed as a trust-signal row directly beneath the headline. Primary CTA: "Book an appointment" → `tel:`.

Alternatively: asymmetric with the image showing the practice interior or a professional headshot of the principal dentist/doctor (not a stock photo of a fake smile).

### Card pattern
Clean white cards with a subtle `border-t-2 border-brand-accent` top accent line. `shadow-sm` only — understated. Rounded `rounded-xl`. No double-bezel here — too decorative for a clinical context.

### Layout rules
- Credentials/accreditations section immediately after hero — this is the trust anchor. GDC number, years established, CQC rating if applicable.
- Services: clean 2-column or asymmetric list — each service with a short, jargon-free description focused on patient outcomes, not clinical terminology.
- Before/after or patient journey section if data supports it (use only real content from the site).
- Section padding `py-20` — clinical precision, not luxury excess.

### Writing tone
Reassuring and plain-English. Patients are anxious — acknowledge this. "We understand visiting the dentist can feel daunting. We're here to make it comfortable." Avoid clinical jargon in headings. Services headings: "Teeth Straightening" not "Orthodontic Treatment." CTAs always about booking and availability, never about products.
