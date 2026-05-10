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

## Step 3: Build content.json — the source of truth

`content.json` is the single source of truth for everything about this site. Every page, every edit, every redeploy reads from it. Build it once here; never scatter data across separate files.

Start from the template:
```bash
cp content.template.json sites/{SLUG}/content.json
```

Now fill every field by reading `sites/{SLUG}/page-text.txt`, `sites/{SLUG}/page-html.html`, and `sites/{SLUG}/brand.json`.

### 3a. `_meta` section
```json
"_meta": {
  "slug": "{SLUG}",
  "source_url": "{URL}",
  "archetype": "",         ← fill in Step 3b
  "created_at": "{ISO timestamp}",
  "updated_at": "{ISO timestamp}",
  "deploy_url": "",        ← filled after deploy
  "chosen_variant": "",    ← filled after user picks
  "brand_extract_status": "{success|fallback from brand.json}"
}
```

### 3b. Archetype selection — fill `_meta.archetype`

| Niche keywords | Archetype slug |
|---|---|
| solicitor, barrister, law firm, legal, conveyancer | `editorial-luxury` |
| architect, architecture, interior designer | `editorial-luxury` |
| estate agent, property, letting agent | `editorial-luxury` |
| financial advisor, wealth manager, IFA | `editorial-luxury` |
| dentist, dental, orthodontist | `clinical-trust` |
| doctor, gp, clinic, physiotherapist, optician, chiropractor | `clinical-trust` |
| nail bar, nail salon, beauty salon, spa, hair salon, lash studio, brow bar | `studio-luxe` |
| restaurant, cafe, bakery, butcher, deli, florist, food, catering | `artisan-trade` |
| accountant, chartered accountant, bookkeeper, tax, payroll | `corporate-precision` |
| hr consultant, recruitment, insurance, finance broker | `corporate-precision` |

Default if no match: `editorial-luxury`

Read the archetype file: `cat prompts/archetypes/{archetype-slug}.md`

### 3c. `business` section
Extract from scraped text. Use only real content — empty string if not found, never a placeholder.

### 3d. `brand` section
From `brand.json`:
- `logo_url`, `colours` (array of hex strings), `font`
- If `extract_status` is `"fallback"`, use archetype colour defaults:
  - `editorial-luxury`: `["#C8A96E", "#1C1410", "#8B7355"]`
  - `clinical-trust`: `["#1A8C7D", "#0F1F3D", "#4A7B8C"]`
  - `studio-luxe`: `["#C4956A", "#1A0F0A", "#8B6B5E"]`
  - `artisan-trade`: `["#C4613A", "#1A0F05", "#8B6B4E"]`
  - `corporate-precision`: `["#1E3A5F", "#1F2937", "#4A6B8C"]`

### 3e. `agency` section
Read from `.env`:
- `domain` ← `AGENCY_DOMAIN`
- `pixel_key` ← generate a UUID: `node -e "console.log(crypto.randomUUID())"`
- `lead_id` ← generate a UUID

### 3f. `pages.home` section
- `hero_headline`: rewrite their main headline in premium tone, preserve their meaning
- `hero_subtext`: one sentence — what they do and who for
- `trust_signals`: array of 2-4 credibility facts from the site (years established, client count, accreditations, awards). Only real facts — empty array if none found.

### 3g. `pages.about` section
- `headline`: from their about page or "About {Business Name}"
- `story`: 3-5 sentences from their about text, rewritten in premium tone, preserving all facts
- `values`: 3-4 values or principles mentioned on the site. If none stated, derive from their about text.
- `team`: extract any named staff with roles. Empty array if not found.
- `accreditations`: any professional bodies, certifications, or awards mentioned. Empty array if none.

### 3h. `pages.services` array
This is the most important section. Extract every distinct service, then expand each into a full object:

```json
{
  "name": "Property Law",
  "slug": "property-law",
  "overview": "One sentence for the services index page",
  "detail": "3-5 sentences of full page content: what this service covers, who it's for, how the firm approaches it, why to choose this firm. Grounded in scraped content, expanded using niche knowledge. No invented specifics.",
  "cta": "Discuss your property law needs"
}
```

Rules:
- Minimum 2 services, maximum 8
- If fewer than 2 services are found, expand existing ones into sub-topics (e.g. "Property Law" → "Residential Conveyancing" + "Commercial Property")
- `slug`: lowercase hyphenated from the service name
- `detail`: this becomes the full service detail page — write it now so it's editable later

### 3i. `pages.contact` section
- `intro`: 1-2 sentences inviting contact. Warm, not generic.

**After completing all sections, write the final `content.json` to `sites/{SLUG}/content.json`.**

If this is a **from-scratch build** (no source site): fill the template manually from information the user provides. See "Building from Scratch" at the end of this skill.

---

## Step 5: ui-ux-pro-max Design Recommendations

Check if ui-ux-pro-max is installed:
```bash
python3 ~/.claude/skills/ui-ux-pro-max/src/ui-ux-pro-max/scripts/search.py --help 2>/dev/null \
  && echo "UX_AVAILABLE" || echo "UX_UNAVAILABLE"
```

**If available**, run 3 searches using `content.json` fields:
```bash
NICHE="{content.business.niche} {content.business.city} UK"
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

All variables are sourced from `sites/{SLUG}/content.json` — the single source of truth.

| Variable | `content.json` path |
|----------|---------------------|
| `{{BUSINESS_NAME}}` | `business.name` |
| `{{NICHE}}` | `business.niche` |
| `{{CITY}}` | `business.city` |
| `{{TAGLINE}}` | `business.tagline` |
| `{{SERVICES_LIST}}` | `pages.services[].name` — comma-separated |
| `{{ABOUT_TEXT}}` | `pages.about.story` |
| `{{PHONE}}` | `business.phone` |
| `{{EMAIL}}` | `business.email` |
| `{{ADDRESS}}` | `business.address` |
| `{{MAPS_URL}}` | `business.maps_url` |
| `{{PIXEL_KEY}}` | `agency.pixel_key` |
| `{{LEAD_ID}}` | `agency.lead_id` |
| `{{AGENCY_DOMAIN}}` | `agency.domain` |
| `{{LOGO_URL}}` | `brand.logo_url` |
| `{{BRAND_COLOURS}}` | `brand.colours` — JSON array string |
| `{{BRAND_FONT}}` | `brand.font` |
| `{{UX_PALETTE}}` | ux-recommendations.txt or archetype default |
| `{{UX_FONTS}}` | ux-recommendations.txt or archetype default |
| `{{UX_LAYOUT}}` | ux-recommendations.txt or archetype default |
| `{{SLUG}}` | `_meta.slug` |
| `{{BRAND_ACCENT_HEX}}` | `brand.colours[0]` |
| `{{BRAND_DARK_HEX}}` | `brand.colours[1]` |
| `{{BRAND_MUTED_HEX}}` | `brand.colours[2]` |
| `{{DISPLAY_FONT}}` | from UX_FONTS or archetype default |
| `{{BODY_FONT}}` | from UX_FONTS or archetype default |
| `{{ARCHETYPE_NAME}}` | `_meta.archetype` |
| `{{ARCHETYPE_DIRECTIVES}}` | full content of `prompts/archetypes/{_meta.archetype}.md` |

The generation prompt also receives the full `pages` object so service detail pages are generated from `pages.services[].detail` — not invented on the fly.

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

## Step 10: Update content.json, Log, and Report

### 1. Write back to content.json
Update these fields now that the site is live:
```json
"_meta": {
  "deploy_url": "{CLOUDFLARE_URL}",
  "chosen_variant": "{V1|V2|V3|I1|I2}",
  "updated_at": "{ISO timestamp}"
}
```

`content.json` is now the complete record of this site — everything needed to edit, expand, or rebuild it is in one file.

### 2. Update `sites/build-log.md`
```markdown
## {BUSINESS_NAME} — {date}
- Slug: {SLUG}
- Source: {URL}
- Live URL: {CLOUDFLARE_URL}
- Archetype: {archetype name}
- Variant chosen: {V1|V2|V3|I1|I2} — {variant label}
- Design: {palette description} / {fonts} / {hero layout}
- Brand status: {success|fallback}
```

### 3. Report to user
```
✅ Done.

Business:  {BUSINESS_NAME}
Live site: {CLOUDFLARE_URL}

Pages: Home · About · Services ({count}) · Contact
Archetype: {archetype name}
Chosen:    {variant label}
Design:    {one-line description of the aesthetic}

To edit this site later: update sites/{SLUG}/content.json then run /redeploy {SLUG}
```

Show the live URL prominently so the user can click it immediately.

---

## Editing a Deployed Site

All site content lives in `sites/{SLUG}/content.json`. To make any change:

1. Edit the relevant field in `content.json`
2. Tell Claude Code: **`/redeploy {SLUG}`** (or manually rebuild and deploy)

**Common edits:**

| What to change | Field in content.json |
|---|---|
| Phone number | `business.phone` |
| Address | `business.address` |
| Tagline | `business.tagline` |
| About story | `pages.about.story` |
| Add a team member | Append to `pages.about.team[]` |
| Edit a service description | `pages.services[n].detail` |
| Add a new service | Append to `pages.services[]` with name, slug, overview, detail, cta |
| Add an accreditation | Append to `pages.about.accreditations[]` |
| Update trust signals | Edit `pages.home.trust_signals[]` |

After editing `content.json`, rebuild and redeploy the chosen variant:
```bash
cd sites/{SLUG}/variants/{chosen-variant-dir}
npx next build
export $(grep -v '^#' ../../../.env | xargs) 2>/dev/null || true
npx wrangler pages deploy out --project-name {SLUG} --commit-dirty=true
```

---

## Building from Scratch (no source site)

Use this when the business has no existing website, or you're building a speculative site for a niche.

```bash
cp content.template.json sites/{SLUG}/content.json
```

Fill `content.json` from information the user provides or from niche knowledge:

- `business.*` — user provides name, city, phone, email, address
- `brand.*` — leave colours empty; archetype fallbacks will apply
- `pages.services[]` — ask the user for their service list, or use niche defaults:
  - Solicitor defaults: Residential Conveyancing, Commercial Property, Wills & Probate, Family Law, Employment Law
  - Accountant defaults: Bookkeeping, Self-Assessment Tax Returns, VAT Returns, Payroll, Business Accounts
  - Dentist defaults: General Dentistry, Teeth Whitening, Dental Implants, Invisalign, Emergency Dentistry
  - Nail bar defaults: Gel Nails, Acrylic Nails, Nail Art, Manicure, Pedicure
  - Restaurant defaults: Dine In, Private Hire, Takeaway, Catering

Once `content.json` is complete, skip Steps 1-2 (no scraping needed) and continue from Step 4 (ui-ux-pro-max) onwards.

---

## If Anything Goes Wrong

- **Scrape fails**: Try `node scripts/scrape-site.js {URL} sites/{SLUG} --timeout 60000`. If still failing, ask the user to paste the text content — fill `content.json` manually from what they provide.
- **Build fails after 3 attempts**: Show the error and stop. Don't guess endlessly.
- **Deploy fails**: Check `CLOUDFLARE_API_TOKEN` permissions — needs "Cloudflare Pages: Edit" scope.
- **No services found**: Ask "What services should I include?" then add them directly to `pages.services[]` in content.json.
