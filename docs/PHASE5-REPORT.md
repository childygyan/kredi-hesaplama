# Phase 5 Report — Turkish Content Guides

**Date:** 2026-09-30
**Repo:** childygyan/kredi-hesaplama (public, branch `main`)

## Pages built (3 guides under /rehber/)

| Page                                       | Topic                                                                                  |
| ------------------------------------------ | -------------------------------------------------------------------------------------- |
| `/rehber/kredi-maliyeti-nasil-hesaplanir/` | nominal vs efektif maliyet, vade etkisi, adım adım hesap, örnek (etiketli)             |
| `/rehber/kkdf-bsmv-nedir/`                 | KKDF/BSMV tanımları, hangi kredilerde alınır, konut muafiyeti, oran güncelliği         |
| `/rehber/erken-odeme-kurallari/`           | tam/kısmi erken ödeme, faiz tasarrufu mantığı, ceza (sözleşmeye göre), kontrol listesi |

Each guide: unique Turkish content (4-6 sections), breadcrumb with exact "Kredi Hesaplama"
anchor to `/`, FAQ accordion + FAQPage JSON-LD (4-5 Q&A), interlinking between guides
and calculators. Homepage gained a "Kredi Rehberleri" card section.

## Honesty constraints

- All numeric illustrations labeled örnek / "örnek amaçlı"
- KKDF %15 / BSMV %10 described as tool defaults, not current legal facts; readers told
  to confirm with their bank
- No early-closure penalty cap claims; penalty described as contract-dependent
- No invented statistics

## Verification

- Tests: **45/45 pass**
- astro check: **0 errors, 0 warnings, 0 hints** (full output this time)
- ESLint: clean; Build: clean — **10 pages**, all in sitemap with FAQPage JSON-LD

## Bug fixed

- Same `BaseLayout` self-closing (`/>`) mistake repeated in the 3 new guide pages;
  fixed to `>` (caught by astro check ts(17002))
