#!/usr/bin/env node
/**
 * screenshot-variants.js
 * Usage: node scripts/screenshot-variants.js <slug>
 *
 * For each variant in sites/{slug}/variants/*, serves it on a local port,
 * screenshots the homepage, then writes:
 *   sites/{slug}/variants/{name}/preview.png   — homepage screenshot
 *   sites/{slug}/variants/comparison.html      — side-by-side visual comparison page
 */

import { chromium } from 'playwright'
import { existsSync, readdirSync, writeFileSync, readFileSync } from 'fs'
import { join, resolve } from 'path'
import { createServer } from 'http'
import { readFile } from 'fs/promises'
import { extname } from 'path'

const slug = process.argv[2]
if (!slug) {
  console.error('Usage: node scripts/screenshot-variants.js <slug>')
  process.exit(1)
}

const variantsDir = join('sites', slug, 'variants')
if (!existsSync(variantsDir)) {
  console.error(`No variants directory found at ${variantsDir}`)
  console.error('Run the url-to-site pipeline with variant generation first.')
  process.exit(1)
}

const variantNames = readdirSync(variantsDir, { withFileTypes: true })
  .filter(d => d.isDirectory() && d.name !== 'previews')
  .map(d => d.name)
  .sort()

if (variantNames.length === 0) {
  console.error('No variant directories found.')
  process.exit(1)
}

console.log(`Found ${variantNames.length} variants: ${variantNames.join(', ')}`)

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
}

function serveStatic(dir, port) {
  return new Promise((resolveServer) => {
    const server = createServer(async (req, res) => {
      let urlPath = req.url.split('?')[0]
      if (urlPath === '/') urlPath = '/index.html'
      const filePath = join(dir, urlPath)
      try {
        const data = await readFile(filePath)
        const mime = MIME[extname(filePath)] || 'application/octet-stream'
        res.writeHead(200, { 'Content-Type': mime })
        res.end(data)
      } catch {
        // Try index.html for SPA-style routing
        try {
          const data = await readFile(join(dir, 'index.html'))
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end(data)
        } catch {
          res.writeHead(404)
          res.end('Not found')
        }
      }
    })
    server.listen(port, '127.0.0.1', () => resolveServer(server))
  })
}

const browser = await chromium.launch()
const results = []
let port = 8200

for (const name of variantNames) {
  const outDir = join(variantsDir, name, 'out')
  if (!existsSync(outDir)) {
    console.log(`  [${name}] No out/ directory — skipping (run next build first)`)
    continue
  }

  console.log(`  [${name}] Starting server on port ${port}...`)
  const server = await serveStatic(outDir, port)

  const page = await browser.newPage()
  await page.setViewportSize({ width: 1440, height: 900 })

  try {
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(1200) // allow animations to settle

    const screenshotPath = join(variantsDir, name, 'preview.png')
    await page.screenshot({ path: screenshotPath, fullPage: false })
    console.log(`  [${name}] Screenshot saved → ${screenshotPath}`)

    // Read variant label from metadata if it exists
    let label = name
    const metaPath = join(variantsDir, name, 'variant-meta.json')
    if (existsSync(metaPath)) {
      try { label = JSON.parse(readFileSync(metaPath, 'utf8')).label || name } catch {}
    }

    results.push({ name, label, screenshotPath: `${name}/preview.png` })
  } catch (err) {
    console.error(`  [${name}] Screenshot failed: ${err.message}`)
  } finally {
    await page.close()
    server.close()
    port++
  }
}

await browser.close()

// Generate comparison HTML
const cards = results.map(({ name, label, screenshotPath }, i) => `
  <div class="card" id="card-${i}">
    <div class="label">
      <span class="num">${i + 1}</span>
      <span class="name">${label}</span>
    </div>
    <img src="${screenshotPath}" alt="${label}" />
    <div class="actions">
      <button class="pick-btn" onclick="pick('${name}', this)">
        Deploy this one
      </button>
    </div>
  </div>`).join('\n')

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Design Variants — ${slug}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: #0f0f0f; color: #f0f0f0; padding: 32px; }
  h1 { font-size: 18px; font-weight: 500; color: #888; margin-bottom: 8px; }
  h2 { font-size: 28px; font-weight: 700; margin-bottom: 32px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 24px; }
  .card { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; overflow: hidden; transition: border-color .2s; }
  .card:hover { border-color: #444; }
  .card.selected { border-color: #4ade80; box-shadow: 0 0 0 1px #4ade80; }
  .label { display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-bottom: 1px solid #2a2a2a; }
  .num { width: 24px; height: 24px; background: #2a2a2a; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
  .name { font-size: 13px; font-weight: 500; color: #e0e0e0; }
  img { width: 100%; display: block; border-bottom: 1px solid #2a2a2a; }
  .actions { padding: 14px 16px; }
  .pick-btn { width: 100%; background: #1f2d1f; color: #4ade80; border: 1px solid #2d4a2d; border-radius: 8px; padding: 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s; }
  .pick-btn:hover { background: #2a3d2a; }
  .pick-btn.chosen { background: #4ade80; color: #0a1a0a; border-color: #4ade80; }
  .slug-output { margin-top: 32px; padding: 16px; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; font-family: monospace; font-size: 13px; color: #888; display: none; }
  .slug-output strong { color: #4ade80; }
</style>
</head>
<body>
<h1>${slug}</h1>
<h2>Pick a design</h2>
<div class="grid">${cards}</div>
<div class="slug-output" id="output">
  Selected: <strong id="selected-name"></strong> — tell the agent: "deploy <strong id="selected-name2"></strong>"
</div>
<script>
function pick(name, btn) {
  document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'))
  document.querySelectorAll('.pick-btn').forEach(b => { b.classList.remove('chosen'); b.textContent = 'Deploy this one' })
  btn.classList.add('chosen')
  btn.textContent = 'Selected ✓'
  btn.closest('.card').classList.add('selected')
  document.getElementById('output').style.display = 'block'
  document.getElementById('selected-name').textContent = name
  document.getElementById('selected-name2').textContent = name
}
</script>
</body>
</html>`

const comparisonPath = join(variantsDir, 'comparison.html')
writeFileSync(comparisonPath, html)
console.log(`\nComparison page → ${comparisonPath}`)
console.log('Open it in your browser to pick a variant.\n')

// Open in browser automatically
import { exec } from 'child_process'
exec(`open "${resolve(comparisonPath)}"`)
