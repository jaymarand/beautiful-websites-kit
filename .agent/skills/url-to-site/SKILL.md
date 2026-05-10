---
name: url-to-site
description: Given a business website URL, scrape it, extract brand, generate a premium multi-page Next.js site using taste-skill + ui-ux-pro-max, build it, and deploy to Cloudflare Pages.
trigger: "url-to-site" or "build a site for" or "redesign"
---

# Skill: URL to Site

## What This Skill Does
Takes one URL. Produces one live Cloudflare Pages URL with a beautifully redesigned multi-page website.

```
URL → scrape → brand extract → ui-ux-pro-max → generate → next build → deploy
```

---

## How to Invoke

```
/url-to-site https://smithsolicitors.co.uk
```

Or:
```
Build a site for https://smithsolicitors.co.uk
```

---

## Step 0: Setup Check

Before first run, verify:

```bash
node --version   # must be 18+
npx playwright install chromium --with-deps 2>/dev/null || npx playwright install chromium
npx wrangler --version 2>/dev/null || echo "run: npm install"

# Check Impeccable is installed (used for I1/I2 variants)
ls ~/.claude/skills/impeccable/skill/reference/ 2>/dev/null \
  || ls .claude/skills/pbakaus__impeccable/skill/reference/ 2>/dev/null \
  || echo "IMPECCABLE_NOT_INSTALLED — run: npx skills add pbakaus/impeccable"
```

Read `.env` — check `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are set.
If not: follow the setup instructions in `cloudflare-deploy/SKILL.md` before continuing.

If Impeccable is not installed: the I1/I2 variants will still be generated using the published Impeccable anti-pattern rules applied manually. Install it for full fidelity: `npx skills add pbakaus/impeccable`

---

## Step 1: Derive Slug

From the URL, create a project slug:
- Strip protocol (`https://`, `http://`)
- Strip `www.`
- Replace dots and slashes with hyphens
- Lowercase, max 60 chars

Example: `https://www.smith-solicitors.co.uk` → `smith-solicitors-co-uk`

Create the output directory:
```bash
mkdir -p sites/{SLUG}
```

---

## Step 2: Scrape the Site

```bash
node scripts/scrape-site.js "{URL}" "sites/{SLUG}"
```

This saves:
- `sites/{SLUG}/page-text.txt` — visible page text
- `sites/{SLUG}/page-html.html` — raw HTML
- `sites/{SLUG}/screenshot.png` — full-page screenshot
- `sites/{SLUG}/brand.json` — extracted brand data
- `sites/{SLUG}/source-url.txt` — source URL

If the script fails (site blocks scrapers, timeout): try again with `--timeout 60000`. If it still fails, ask the user to manually provide the text content and brand colours.

---

## Step 3: Extract Business Content

Read `sites/{SLUG}/page-text.txt` and `sites/{SLUG}/page-html.html`.

Extract the following and save to `sites/{SLUG}/content.json`:

```json
{
  "business_name": "...",
  "niche": "solicitor | accountant | architect | dentist | estate agent | ...",
  "city": "...",
  "tagline": "...",
  "services": ["Service 1", "Service 2", "..."],
  "about_text": "...",
  "phone": "...",
  "email": "...",
  "address": "..."
}
```

Rules:
- Use only real content from the scraped text. Do NOT invent anything.
- `services`: extract every distinct service/practice area mentioned. Minimum 2, maximum 8.
- `about_text`: 2-4 sentences summarising the firm's history, approach, or values. Exact copy from the site, not paraphrased.
- If a field is not found on the site, use an empty string — never a placeholder.
- `niche`: pick the closest match from the list. If unsure, use the most specific category.

---

## Step 4: Brand Data

Read `sites/{SLUG}/brand.json`.

If `extract_status` is `"success"`: use the extracted colours and font.

If `extract_status` is `"fallback"` (extraction couldn't find enough): use archetype-appropriate fallback colours (defined in Step 4.5 below after archetype selection).

In the email/outreach (if this site is used for outreach later), note: "We took creative liberty with the design — we can match your exact brand colours when we talk."

---

## Step 4.5: Select Design Archetype

Based on the `niche` from `content.json`, select the design archetype. This determines the entire aesthetic personality of the site.

**Niche → Archetype mapping:**

| Niche keywords | Archetype | File |
|---|---|---|
| solicitor, barrister, law firm, legal, conveyancer | Editorial Luxury | `prompts/archetypes/editorial-luxury.md` |
| architect, architecture, interior designer | Editorial Luxury | `prompts/archetypes/editorial-luxury.md` |
| estate agent, property, letting agent | Editorial Luxury | `prompts/archetypes/editorial-luxury.md` |
| financial advisor, wealth manager, IFA | Editorial Luxury | `prompts/archetypes/editorial-luxury.md` |
| dentist, dental, orthodontist, dentistry | Clinical Trust | `prompts/archetypes/clinical-trust.md` |
| doctor, gp, clinic, physiotherapist, optician, chiropractor, osteopath | Clinical Trust | `prompts/archetypes/clinical-trust.md` |
| nail bar, nail salon, beauty salon, spa, hair salon, hair studio, lash studio, brow bar, bridal | Studio Luxe | `prompts/archetypes/studio-luxe.md` |
| restaurant, cafe, bakery, butcher, deli, florist, food, catering | Artisan Trade | `prompts/archetypes/artisan-trade.md` |
| accountant, chartered accountant, bookkeeper, tax, payroll | Corporate Precision | `prompts/archetypes/corporate-precision.md` |
| hr consultant, recruitment, insurance, finance broker | Corporate Precision | `prompts/archetypes/corporate-precision.md` |

If the niche doesn't match any keyword: use **Editorial Luxury** as the default.

**Read the archetype file:**
```bash
cat prompts/archetypes/{archetype-slug}.md
```

Save the archetype name to `sites/{SLUG}/archetype.txt`.

**Archetype-specific brand fallbacks** (use when `brand.json` extract_status is `"fallback"`):
- Editorial Luxury: `["#C8A96E", "#1C1410", "#8B7355"]`
- Clinical Trust: `["#1A8C7D", "#0F1F3D", "#4A7B8C"]`
- Studio Luxe: `["#C4956A", "#1A0F0A", "#8B6B5E"]`
- Artisan Trade: `["#C4613A", "#1A0F05", "#8B6B4E"]`
- Corporate Precision: `["#1E3A5F", "#1F2937", "#4A6B8C"]`

---

## Step 5: ui-ux-pro-max Design Recommendations

Check if ui-ux-pro-max is installed:
```bash
python3 ~/.claude/skills/ui-ux-pro-max/src/ui-ux-pro-max/scripts/search.py --help 2>/dev/null \
  && echo "UX_AVAILABLE" || echo "UX_UNAVAILABLE"
```

**If available**, run 3 searches using the detected niche:
```bash
NICHE="{niche} {city} UK"
python3 ~/.claude/skills/ui-ux-pro-max/src/ui-ux-pro-max/scripts/search.py "$NICHE" --domain color --stack nextjs
python3 ~/.claude/skills/ui-ux-pro-max/src/ui-ux-pro-max/scripts/search.py "$NICHE" --domain font --stack nextjs
python3 ~/.claude/skills/ui-ux-pro-max/src/ui-ux-pro-max/scripts/search.py "$NICHE" --domain style --stack nextjs
```

Save the combined output to `sites/{SLUG}/ux-recommendations.txt`.

**If unavailable**: use archetype-appropriate defaults:
- Editorial Luxury: `UX_PALETTE: Warm cream #FDFBF7, espresso #1C1410, gold accent #C8A96E | UX_FONTS: Instrument Serif / Plus Jakarta Sans | UX_LAYOUT: Asymmetric text-left hero, py-28 section padding`
- Clinical Trust: `UX_PALETTE: Off-white #F8FAFB, deep navy #0F1F3D, teal accent #1A8C7D | UX_FONTS: DM Serif Display / DM Sans | UX_LAYOUT: Centered or asymmetric hero with credential badges, py-20`
- Studio Luxe: `UX_PALETTE: Soft blush #FDF5F0, warm near-black #1A0F0A, rose gold #C4956A | UX_FONTS: Cormorant Garamond italic / Nunito Sans | UX_LAYOUT: Image-dominant hero, gallery-forward, py-20`
- Artisan Trade: `UX_PALETTE: Parchment #F5EDD6, deep brown #1A0F05, terracotta #C4613A | UX_FONTS: Playfair Display / Lato | UX_LAYOUT: Full-bleed atmospheric image hero, rule dividers, py-20`
- Corporate Precision: `UX_PALETTE: Neutral linen #F9F8F6, charcoal #1F2937, navy #1E3A5F | UX_FONTS: Space Grotesk / DM Sans | UX_LAYOUT: Asymmetric hero with metric lockup, numbered process, py-20`

---

## Step 6: Check Build Log for Design Variance

Read `sites/build-log.md`. Note which archetypes, font pairings, and colour combinations have already been used.

Rules:
- Do NOT reuse an identical font+colour combination — vary at minimum the accent colour.
- The same archetype can be reused for the same niche (a second solicitor is still Editorial Luxury) but the palette and fonts must differ from the previous site in that archetype.
- If ui-ux-pro-max is available, the search results will naturally push variance. If unavailable, manually offset the accent colour from any previous site in the same archetype.

---

## Step 7: Generate the Next.js Site

Read the generation prompt template at `prompts/nextjs_generation_prompt_v1.md`.

Fill every `{{VARIABLE}}` with real data:

| Variable | Source |
|----------|--------|
| `{{BUSINESS_NAME}}` | content.json |
| `{{NICHE}}` | content.json |
| `{{CITY}}` | content.json |
| `{{TAGLINE}}` | content.json |
| `{{SERVICES_LIST}}` | content.json — comma-separated |
| `{{ABOUT_TEXT}}` | content.json |
| `{{PHONE}}` | content.json |
| `{{EMAIL}}` | content.json |
| `{{ADDRESS}}` | content.json |
| `{{MAPS_URL}}` | Leave empty (filled manually if needed) |
| `{{PIXEL_KEY}}` | Leave empty — pixel tracking added later if needed |
| `{{LEAD_ID}}` | Leave empty |
| `{{AGENCY_DOMAIN}}` | Read from .env `AGENCY_DOMAIN`, or leave empty |
| `{{LOGO_URL}}` | brand.json |
| `{{BRAND_COLOURS}}` | brand.json — JSON array string |
| `{{BRAND_FONT}}` | brand.json |
| `{{UX_PALETTE}}` | ux-recommendations.txt or defaults |
| `{{UX_FONTS}}` | ux-recommendations.txt or defaults |
| `{{UX_LAYOUT}}` | ux-recommendations.txt or defaults |
| `{{SLUG}}` | derived slug |
| `{{BRAND_ACCENT_HEX}}` | brand_colours[0] or #C8A96E |
| `{{BRAND_DARK_HEX}}` | brand_colours[1] or #1C1410 |
| `{{BRAND_MUTED_HEX}}` | brand_colours[2] or #8B7355 |
| `{{DISPLAY_FONT}}` | from UX_FONTS or archetype default |
| `{{BODY_FONT}}` | from UX_FONTS or archetype default |
| `{{ARCHETYPE_NAME}}` | from `sites/{SLUG}/archetype.txt` |
| `{{ARCHETYPE_DIRECTIVES}}` | full content of the archetype file (e.g. `prompts/archetypes/editorial-luxury.md`) |

Now generate ALL required files. Write the base variant to `sites/{SLUG}/variants/v1-archetype/`:

```
sites/{SLUG}/variants/v1-archetype/
  app/
    layout.tsx
    page.tsx
    about/page.tsx
    services/page.tsx
    services/[slug]/page.tsx
    contact/page.tsx
  components/
    Nav.tsx
    AgencyCTA.tsx       ← include only if AGENCY_DOMAIN is set
    AnimateIn.tsx
    ServiceCard.tsx
    Footer.tsx
  tailwind.config.ts
  next.config.ts        ← MUST include output: 'export'
  package.json
  tsconfig.json
  postcss.config.js
```

Write a `variant-meta.json` alongside:
```json
{ "label": "V1 — Archetype default ({{ARCHETYPE_NAME}})", "type": "ours" }
```

**Critical rules (all variants):**
- `next.config.ts` MUST contain `output: 'export'` — fully static, no server runtime
- Every piece of copy comes from content.json — no invented facts
- Hero layout follows the selected archetype
- No 3-equal-column card layout
- No Inter, Roboto, Arial fonts
- No emoji
- `min-h-[100dvh]` on hero, never `h-screen`
- All animations use `transform` and `opacity` only
- Scroll entry animations via IntersectionObserver
- Mobile: asymmetric layouts collapse to single-column below 768px

---

## Step 7.5: Generate Remaining Variants

Generate 4 more variants. **Only the design layer changes — content is identical.** Copy or recreate the app structure with different design files for each.

### V2 — ui-ux-pro-max pushed (Our Skills)

Re-read `sites/{SLUG}/ux-recommendations.txt`. Apply the ui-ux-pro-max colour palette and font pairing more aggressively than V1:
- Use the exact hex values recommended rather than the archetype defaults
- Apply the recommended layout guidance literally
- If ui-ux-pro-max recommended a font pairing, use it (even if it differs from the archetype default)

Write to `sites/{SLUG}/variants/v2-ux-max/` with:
```json
{ "label": "V2 — ui-ux-pro-max driven ({{ARCHETYPE_NAME}})", "type": "ours" }
```

### V3 — Accent variation (Our Skills)

Same archetype as V1 but:
- Shift the brand accent colour 30° hue rotation from V1 (or pick the second strongest colour from `brand.json` if available)
- Swap the display font for the archetype's alternate font (e.g. Editorial Luxury: Cormorant Garamond instead of Instrument Serif; Clinical Trust: Libre Baskerville instead of DM Serif)
- Use the alternative hero layout variant described in the archetype file (if one exists)

Write to `sites/{SLUG}/variants/v3-alt/` with:
```json
{ "label": "V3 — Accent & font alt ({{ARCHETYPE_NAME}})", "type": "ours" }
```

### I1 — Impeccable Typeset + Colorize

Start from V1's files. Read the Impeccable reference files:
```bash
cat ~/.claude/skills/impeccable/skill/reference/typeset.md 2>/dev/null || \
  cat .claude/skills/pbakaus__impeccable/skill/reference/typeset.md 2>/dev/null || \
  echo "IMPECCABLE_UNAVAILABLE"

cat ~/.claude/skills/impeccable/skill/reference/colorize.md 2>/dev/null || \
  cat .claude/skills/pbakaus__impeccable/skill/reference/colorize.md 2>/dev/null || \
  echo "IMPECCABLE_UNAVAILABLE"
```

If available: apply the Impeccable `typeset` rules to the typography (font scale, line-height, letter-spacing, measure) and `colorize` rules to the colour system (OKLCH-based palette, tinted neutrals, contrast ratios). These will override the archetype font choices and colour tokens.

If unavailable: apply these Impeccable core principles manually:
- Typography: enforce a strict modular scale (1.25×), set `line-height: 1.5` on body and `1.1` on display, ensure body text is ≥ 16px, add `text-wrap: balance` to headings
- Colour: convert brand accent to OKLCH for perceptually-uniform variants, ensure 4.5:1 contrast ratio on all text, use tinted neutrals (not pure gray) for backgrounds

Write to `sites/{SLUG}/variants/i1-impeccable-typeset/` with:
```json
{ "label": "I1 — Impeccable Typeset + Colorize", "type": "impeccable" }
```

### I2 — Impeccable Polish

Start from V1's files. Read the Impeccable polish reference:
```bash
cat ~/.claude/skills/impeccable/skill/reference/polish.md 2>/dev/null || \
  cat .claude/skills/pbakaus__impeccable/skill/reference/polish.md 2>/dev/null || \
  echo "IMPECCABLE_UNAVAILABLE"
```

If available: apply the full `/polish` pass — this covers typography refinement, colour system, spacing rhythm, motion, and anti-pattern removal.

If unavailable: apply Impeccable's published core anti-pattern list manually:
- Remove any Inter/Roboto/Arial fonts (replace with archetype font)
- Replace purple-to-blue gradients with single-colour tints
- Remove nested card-in-card patterns
- Ensure heading hierarchy: h1 > h2 > h3 with visible contrast (not just size)
- Add `easing: cubic-bezier(0.16, 1, 0.3, 1)` to all transitions (Impeccable's standard)
- Enforce 8px spacing grid (all padding/margin multiples of 8)
- Add subtle noise texture `0.025` opacity to background for print quality
- Remove any centered hero if archetype is Editorial Luxury, Corporate Precision, or Artisan Trade

Write to `sites/{SLUG}/variants/i2-impeccable-polish/` with:
```json
{ "label": "I2 — Impeccable Polish", "type": "impeccable" }
```

---

## Step 8: Build All Variants

For each variant directory in `sites/{SLUG}/variants/*/`:

```bash
# Shared dependency install — do this ONCE from the first variant
cd sites/{SLUG}/variants/v1-archetype
npm install

# Then for each variant, symlink node_modules and build
for VARIANT in v1-archetype v2-ux-max v3-alt i1-impeccable-typeset i2-impeccable-polish; do
  VDIR="sites/{SLUG}/variants/$VARIANT"
  if [ ! -d "$VDIR/node_modules" ]; then
    ln -s "$(pwd)/sites/{SLUG}/variants/v1-archetype/node_modules" "$VDIR/node_modules"
  fi
  echo "Building $VARIANT..."
  cd "$VDIR"
  npx next build 2>&1
  cd - > /dev/null
done
```

Each build outputs to `sites/{SLUG}/variants/{name}/out/`.

**If a variant build fails:**
- Fix the TypeScript/JSX error in that variant only
- Re-run `npx next build` for that variant
- If it fails 3 times, skip that variant and note it in the preview
- Do NOT skip more than 1 variant — if 2+ fail, stop and show the errors

---

## Step 8.5: Screenshot Previews

```bash
node scripts/screenshot-variants.js {SLUG}
```

This:
1. Serves each `out/` directory on a local port
2. Screenshots the homepage of each at 1440×900
3. Saves `preview.png` to each variant directory
4. Generates `sites/{SLUG}/variants/comparison.html` — a side-by-side visual comparison
5. Opens `comparison.html` in the default browser automatically

**Pause here.** Show the user:
```
5 variants built for {BUSINESS_NAME}:

  V1 — Archetype default ({ARCHETYPE_NAME})
  V2 — ui-ux-pro-max driven ({ARCHETYPE_NAME})
  V3 — Accent & font alt ({ARCHETYPE_NAME})
  I1 — Impeccable Typeset + Colorize
  I2 — Impeccable Polish

Comparison page: sites/{SLUG}/variants/comparison.html (opening in browser)

Which variant do you want to deploy? (reply with V1, V2, V3, I1, or I2)
```

Wait for the user to reply before proceeding. Do not auto-select.

---

## Step 9: Deploy Chosen Variant

Once the user selects a variant (e.g. "V2"):

1. Map the selection to the directory name:
   - V1 → `v1-archetype`
   - V2 → `v2-ux-max`
   - V3 → `v3-alt`
   - I1 → `i1-impeccable-typeset`
   - I2 → `i2-impeccable-polish`

2. The output is already built at `sites/{SLUG}/variants/{dir}/out/`. Deploy it directly:

```bash
export $(grep -v '^#' .env | xargs) 2>/dev/null || true
npx wrangler pages deploy "sites/{SLUG}/variants/{chosen-dir}/out" \
  --project-name "{SLUG}" \
  --commit-dirty=true
```

---

## Step 10: Log and Report

1. Update `sites/build-log.md`:
```markdown
## {BUSINESS_NAME} — {date}
- Slug: {SLUG}
- Source: {URL}
- Live URL: {CLOUDFLARE_URL}
- Archetype: {archetype name}
- Variant chosen: {V1|V2|V3|I1|I2} — {variant label}
- Design: {palette description} / {fonts} / {hero layout}
- Brand status: {success|fallback}
- Variants built: {list of all variants attempted}
```

2. Report to user:
```
✅ Done.

Business:  {BUSINESS_NAME}
Source:    {URL}
Live site: {CLOUDFLARE_URL}

Pages: Home · About · Services ({count}) · Contact
Archetype: {archetype name}
Chosen:    {variant label}
Design:    {one-line description of the aesthetic}
Brand:     {success — matched their colours | fallback — archetype defaults used}
Build:     {next build output: X pages, Y kB}
```

3. Show the live URL prominently so the user can click it immediately.

---

## If Anything Goes Wrong

- **Scrape fails**: site blocks bots. Try `node scripts/scrape-site.js {URL} sites/{SLUG} --timeout 60000`. If still failing, ask the user to paste the text content manually.
- **Build fails after 3 attempts**: paste the error and stop. Don't guess endlessly.
- **Deploy fails**: check `CLOUDFLARE_API_TOKEN` permissions. Token needs "Cloudflare Pages: Edit" scope.
- **No services found on the site**: ask the user "I couldn't find any specific services listed on their site. What services should I include?"
