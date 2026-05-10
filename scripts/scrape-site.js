#!/usr/bin/env node
/**
 * scrape-site.js
 * Usage: node scripts/scrape-site.js <url> <output-dir>
 *
 * Loads the URL in a headless browser and extracts:
 *   page-text.txt      — visible text for Claude to parse business info
 *   page-html.html     — raw HTML (truncated 120KB) for fallback extraction
 *   screenshot.png     — full-page screenshot
 *   brand.json         — logo_url, brand_colours[], brand_font, extract_status
 *   source-url.txt     — original URL
 */

import { chromium } from 'playwright'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const url = process.argv[2]
const outputDir = process.argv[3] || 'sites/scraped'

if (!url) {
  console.error('Usage: node scripts/scrape-site.js <url> <output-dir>')
  process.exit(1)
}

mkdirSync(outputDir, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  viewport: { width: 1440, height: 900 },
})
const page = await context.newPage()

try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
  // Allow lazy images / fonts to settle
  await page.waitForTimeout(2000)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(1000)
  await page.evaluate(() => window.scrollTo(0, 0))
} catch (e) {
  console.error(`Failed to load ${url}: ${e.message}`)
  await browser.close()
  process.exit(1)
}

// ── Page text ──────────────────────────────────────────────────────────────
const bodyText = await page.evaluate(() => {
  // Remove script/style/nav elements to get cleaner copy
  const clone = document.body.cloneNode(true)
  clone.querySelectorAll('script, style, noscript, [aria-hidden="true"]').forEach(el => el.remove())
  return clone.innerText
})
writeFileSync(join(outputDir, 'page-text.txt'), bodyText.slice(0, 60000))

// ── Page HTML ──────────────────────────────────────────────────────────────
const html = await page.content()
writeFileSync(join(outputDir, 'page-html.html'), html.slice(0, 120000))

// ── Screenshot ────────────────────────────────────────────────────────────
await page.screenshot({ path: join(outputDir, 'screenshot.png'), fullPage: true })

// ── Brand extraction ──────────────────────────────────────────────────────
const brand = await page.evaluate(() => {
  const results = {
    logo_url: null,
    brand_colours: [],
    brand_font: null,
    extract_status: 'failed',
  }

  // 1. Logo: find <img> with logo-related attribute values
  const imgs = Array.from(document.querySelectorAll('img'))
  const logoImg = imgs.find(img => {
    const attrs = [img.src, img.alt, img.className, img.id, img.closest('a')?.href || '']
      .join(' ').toLowerCase()
    return attrs.includes('logo')
  })
  if (logoImg?.src) results.logo_url = logoImg.src

  // 2. Fonts: check CSS custom properties and computed styles
  const bodyStyle = window.getComputedStyle(document.body)
  const rawFont = bodyStyle.fontFamily
  if (rawFont) {
    // Take the first declared family, strip quotes
    results.brand_font = rawFont.split(',')[0].trim().replace(/['"]/g, '')
  }

  // Check for heading font separately
  const h1 = document.querySelector('h1, h2, h3')
  if (h1) {
    const h1Font = window.getComputedStyle(h1).fontFamily
    if (h1Font && h1Font !== rawFont) {
      results.brand_font = h1Font.split(',')[0].trim().replace(/['"]/g, '')
    }
  }

  // 3. Colours: CSS custom properties + computed styles
  const root = document.documentElement
  const rootStyle = window.getComputedStyle(root)
  const cssVarCandidates = [
    '--primary', '--primary-color', '--brand-color', '--color-primary',
    '--accent', '--accent-color', '--theme-color', '--main-color',
    '--secondary', '--secondary-color',
  ]
  const colours = new Set()

  for (const varName of cssVarCandidates) {
    const val = rootStyle.getPropertyValue(varName).trim()
    if (val && val.startsWith('#')) colours.add(val)
    if (val && val.startsWith('rgb')) {
      // convert rgb(r,g,b) → hex
      const m = val.match(/\d+/g)
      if (m?.length >= 3) {
        const hex = '#' + m.slice(0, 3).map(n => parseInt(n).toString(16).padStart(2, '0')).join('')
        colours.add(hex)
      }
    }
  }

  // Fallback: background and text colour of major elements
  const candidates = [
    document.querySelector('header'),
    document.querySelector('nav'),
    document.querySelector('.hero, [class*="hero"]'),
    document.querySelector('[class*="primary"], [class*="brand"]'),
    document.body,
  ].filter(Boolean)

  for (const el of candidates) {
    const st = window.getComputedStyle(el)
    const bg = st.backgroundColor
    const color = st.color
    for (const c of [bg, color]) {
      if (!c || c === 'rgba(0, 0, 0, 0)' || c === 'transparent') continue
      const m = c.match(/\d+/g)
      if (m?.length >= 3) {
        const [r, g, b] = m.slice(0, 3).map(Number)
        // Skip near-white and near-black
        const brightness = (r * 299 + g * 587 + b * 114) / 1000
        if (brightness < 15 || brightness > 240) continue
        const hex = '#' + [r, g, b].map(n => n.toString(16).padStart(2, '0')).join('')
        colours.add(hex)
      }
    }
    if (colours.size >= 3) break
  }

  results.brand_colours = [...colours].slice(0, 5)

  // Status
  const hasMin = results.brand_colours.length >= 1 && results.brand_font
  results.extract_status = hasMin ? 'success' : 'fallback'

  return results
})

// Resolve relative logo URL to absolute
if (brand.logo_url && !brand.logo_url.startsWith('http')) {
  try {
    brand.logo_url = new URL(brand.logo_url, url).href
  } catch {
    brand.logo_url = null
  }
}

writeFileSync(join(outputDir, 'brand.json'), JSON.stringify(brand, null, 2))
writeFileSync(join(outputDir, 'source-url.txt'), url)

await browser.close()

console.log(JSON.stringify({
  status: 'ok',
  output_dir: outputDir,
  brand_status: brand.extract_status,
  logo: brand.logo_url,
  colours: brand.brand_colours,
  font: brand.brand_font,
}))
