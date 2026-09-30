# Phase 6 Report — Hardening

**Date:** 2026-09-30
**Repo:** childygyan/kredi-hesaplama (public, branch `main`)

## What was added

- `src/pages/404.astro` — Turkish 404 page (Cloudflare Pages serves `404.html`
  automatically); excluded from sitemap via `filter` in astro.config.mjs
- `public/_headers` — security headers for Cloudflare Pages: nosniff, DENY
  framing, strict referrer policy, minimal permissions policy, CSP
  (`script-src 'self'` + AdSense; `style-src 'self' 'unsafe-inline'` for the
  AdSense unit's inline style)
- `tests/phase6.test.ts` — build-output invariants (6 tests):
  - 0 broken internal links (pages + static files)
  - every content page: exactly one h1, `lang="tr"`, skip link, canonical, description
  - sitemap: 10 content pages, 404 excluded
  - client JS budget: total < 150KB
  - `_headers` contains security headers
  - `404.html` exists

## Verification (final, full output)

- Tests: **51/51 pass** (7 P1 + 26 P2 + 8 P3 + 4 P4 + 6 P6)
- astro check: **0 errors, 0 warnings, 0 hints**
- ESLint: clean
- Prettier: clean (4 files auto-formatted: kredi.ts, yas.ts, +2)
- Build: clean — **11 pages** (10 content + 404), sitemap + robots + _headers in dist

## Accessibility notes

- `lang="tr"`, skip-to-content link, labeled form inputs, aria-live result
  regions, table headers — verified per page by test
- No automated browser/a11y audit run (no such tooling in this environment);
  markup follows WCAG-friendly patterns throughout
