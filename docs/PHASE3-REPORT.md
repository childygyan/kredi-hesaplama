# Phase 3 Report — Cluster Tools + Programmatic SEO

**Date:** 2026-09-30
**Repo:** childygyan/kredi-hesaplama (public, branch `main`)

## Decision (per Firoz's refinement)

Head keyword **"kredi hesaplama"** targets the **homepage as the pillar** (no separate
`/kredi-hesaplama/` page — avoids cannibalization). Homepage has exact-match Turkish
title + H1, interactive calculator above the fold, supporting content + FAQ below.

## Pages built (7 total, all in sitemap)

| Page                          | Target keyword            | Calculator                  |
| ----------------------------- | ------------------------- | --------------------------- |
| `/`                           | kredi hesaplama (pillar)  | KrediHesaplayici (genel)    |
| `/ihtiyac-kredisi-hesaplama/` | ihtiyaç kredisi hesaplama | ihtiyaç (KKDF+BSMV)         |
| `/konut-kredisi-hesaplama/`   | konut kredisi hesaplama   | konut (vergiden muaf)       |
| `/tasit-kredisi-hesaplama/`   | taşıt kredisi hesaplama   | taşıt (KKDF+BSMV)           |
| `/erken-odeme-hesaplama/`     | erken ödeme hesaplama     | ErkenOdemeHesaplayici       |
| `/yuzde-hesaplama/`           | yüzde hesaplama           | 3-mode (yüzde/oran/değişim) |
| `/yas-hesaplama/`             | yaş hesaplama             | date → yıl/ay/gün           |

## New libs + components

- `src/lib/yuzde.ts` — yuzdeHesapla / yuzdeOrani / yuzdeDegisim (pure)
- `src/lib/yas.ts` — yasHesapla (real calendar math, leap years)
- `src/components/SssBolumu.astro` — FAQ accordion + FAQPage JSON-LD per page
- `src/components/ErkenOdemeHesaplayici.astro` — early-payoff UI (penalty user-entered)

## SEO / internal linking

- Every page: unique Turkish title/description, canonical, `tr` hreflang + x-default
- Homepage links to all 6 cluster pages; each cluster page breadcrumbs + links back
  to `/` with exact anchor **"kredi hesaplama"** + sibling links
- FAQPage JSON-LD on all 7 pages (verified in built HTML)

## Honesty constraints

- No fabricated rates; examples labeled örnek; KKDF/BSMV defaults labeled as changeable
- No early-closure penalty cap claims (user-entered, default 0)

## Verification

- Tests: **41/41 pass** (7 P1 + 26 P2 + 8 P3: yuzde ×4, yas ×4)
- Typecheck: 0 errors; ESLint: clean; Prettier: clean; Build: clean, 7 pages

## Bugs fixed during phase

- `BaseLayout` accidentally self-closed (`/>`) with children after it in all 7 pages
- `<script>` placed after `</BaseLayout>` in yas/yuzde pages (moved inside)
- Extra `)` in yuzde-hesaplama.astro degisim handler
