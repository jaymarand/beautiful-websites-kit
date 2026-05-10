---
name: cloudflare-deploy
description: Deploy a static Next.js site (output/export) to Cloudflare Pages using wrangler.
trigger: "cloudflare-deploy" or "deploy to cloudflare" or "wrangler deploy"
---

# Skill: Cloudflare Deploy

## What This Skill Does
Takes a `sites/{slug}/out/` directory (Next.js static export) and deploys it to Cloudflare Pages.
Returns a live `https://{project}.pages.dev` URL.

---

## Prerequisites

**Check once before running:**

```bash
# wrangler must be installed
npx wrangler --version 2>/dev/null || echo "WRANGLER_MISSING"

# Auth: either CLOUDFLARE_API_TOKEN in .env, or wrangler login
grep -q "CLOUDFLARE_API_TOKEN" .env 2>/dev/null && echo "TOKEN_SET" || echo "TOKEN_MISSING"
```

If `WRANGLER_MISSING`: it's in devDependencies — run `npm install` from the kit root.

If `TOKEN_MISSING`: tell the user:
> "I need a Cloudflare API token to deploy. Go to dash.cloudflare.com → My Profile → API Tokens → Create Token → use the 'Edit Cloudflare Pages' template. Paste it in `.env` as `CLOUDFLARE_API_TOKEN=...` and your account ID as `CLOUDFLARE_ACCOUNT_ID=...` (found in the right sidebar of any Cloudflare dashboard page)."

Then stop and wait.

---

## Deployment

Given `SLUG` (the project slug, e.g. `smith-solicitors-co-uk`):

```bash
# Load env
export $(grep -v '^#' .env | xargs) 2>/dev/null || true

# Deploy
npx wrangler pages deploy "sites/${SLUG}/out" \
  --project-name "${SLUG}" \
  --commit-dirty=true \
  2>&1
```

Cloudflare Pages project names: lowercase letters, numbers, hyphens only. Max 63 chars.
If the project doesn't exist yet, wrangler creates it automatically on first deploy.

---

## After Deploy

Parse the wrangler output for the deployment URL. It looks like:
```
✨ Deployment complete! Take a peek over at https://abc123.smith-solicitors-co-uk.pages.dev
```
or for subsequent deploys:
```
✨ Deployment complete! Take a peek over at https://smith-solicitors-co-uk.pages.dev
```

Extract the URL and report it to the user:

```
✅ Deployed: https://{slug}.pages.dev
```

Write the URL to `sites/{slug}/deploy-url.txt` and log it in `sites/build-log.md` alongside the slug, source URL, and timestamp.

---

## Troubleshooting

**`Authentication error`**: Check `CLOUDFLARE_API_TOKEN` is set correctly. The token needs "Cloudflare Pages: Edit" permission.

**`project name already exists with different account`**: The project name is taken in another account. Append a suffix: `{slug}-1`.

**`No such file or directory: sites/{slug}/out`**: The Next.js build hasn't run yet. Run `cd sites/{slug} && npx next build` first.
