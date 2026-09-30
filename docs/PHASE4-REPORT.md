# Phase 4 Report — Monetization Slots

**Date:** 2026-09-30
**Repo:** childygyan/kredi-hesaplama (public, branch `main`)

## What was built

- `src/components/ReklamAlani.astro` — AdSense slot placeholder. Renders the
  `<ins class="adsbygoogle">` unit only when `SITE.adsenseClientId` is set;
  otherwise an invisible HTML comment (no broken ad calls)
- `src/components/BankaCta.astro` — bank affiliate / lead-gen CTA placeholder.
  Renders only when `affiliate.enabled && ctaUrl` are set. Copy is generic
  ("Teklifleri Karşılaştırın", `rel="sponsored nofollow noopener"`); no bank
  names, rates, or partnership claims
- `src/components/ReklamAciklamasi.astro` — Turkish ad disclosure, shown in the
  footer only when AdSense or affiliate is active
- `src/layouts/BaseLayout.astro` — AdSense loader script in `<head>`, only when
  publisher ID is configured; footer includes the disclosure component
- `src/config/site.ts` — added `affiliate.ctaUrl` ('' default, TODO(Firoz))

## Slot placement

- Homepage: ReklamAlani after calculator, BankaCta before FAQ
- 3 loan pages: ReklamAlani after calculator, BankaCta before FAQ
- erken-odeme / yuzde / yas: ReklamAlani after tool section
- All slots currently render as invisible comments (verified in built HTML)

## Honesty constraints

- No fabricated bank partnerships or rates in CTA copy
- Disclosure text is honest about sponsored links not affecting results

## Verification

- Tests: **45/45 pass** (7 P1 + 26 P2 + 8 P3 + 4 P4 config defaults)
- astro check: **0 errors, 0 warnings, 0 hints** (genuinely — see note)
- ESLint: clean; Prettier: clean; Build: clean, 7 pages

## Note (correction)

Phase 2/3 reports claimed "0 errors" from `tail -3` of astro check output; a full
run showed the `<script define:vars>` + TS-annotation pattern had been failing
with ts(8010) all along. Fixed in this phase by switching both calculator
components to a data-attribute + root-relative query pattern (no define:vars),
which is also cleaner for multiple instances per page. ReklamAlani's inline push
script was also rewritten via `set:html` to satisfy ESLint.
