# Phase 2 Report — Calculator Engine

**Date:** 2026-09-30
**Repo:** childygyan/kredi-hesaplama (public, branch `main`)

## What was built

- `src/lib/kredi.ts` — pure-TS loan engine (no DOM):
  - `hesaplaKredi`: annuity math `Taksit = Anapara × [r(1+r)^n]/[(1+r)^n − 1]`;
    effective monthly rate `r_eff = r × (1 + KKDF + BSMV)`; konut (`vergidenMuaf`)
    skips KKDF/BSMV entirely
  - `odemePlani`: full amortization schedule (ay, taksit, anapara, faiz, vergi, kalan);
    final installment adjusted so balance zeroes out
  - `erkenOdemeHesapla`: remaining principal after k payments, early-closure amount
    (+ user-entered penalty rate, default 0), interest saved vs full term
  - `tlBicimle` (tr-TR currency), `yuvarla2`, strict input validation via
    `KrediHesaplamaHatasi`
- `src/components/KrediHesaplayici.astro` — reusable client-side calculator UI
  (`ihtiyac`/`konut`/`tasit` variants): tr-TR number parsing ("100.000", "3,5"),
  editable KKDF/BSMV (defaults %15/%10, labeled as defaults that may change),
  results + collapsible amortization table, honest labels throughout
  ("Bu araç güncel faiz oranı sunmaz", "Örnek değer")

## Honesty constraints applied

- No fabricated bank rates anywhere; interest rate is always user-entered
- KKDF %15 / BSMV %10 are editable defaults labeled "varsayılan oranlardır; değişebilir"
- No legal claims about early-repayment penalty caps (user-entered, default 0)

## Verification

- Tests: **33/33 pass** (7 phase-1 + 26 phase-2). Golden vectors hand-verified
  against independent Python computation (11282.54 / 10655.22 / 1000.00 / 25535.30);
  amortization invariants (principal sums, monotonic balance, tax split);
  early-payoff edge cases; 9 invalid-input cases
- Typecheck: 0 errors; ESLint: clean; Prettier: clean; Build: clean

## Notes

- Phase 3 wires the component into loan-type pages + the homepage pillar.
