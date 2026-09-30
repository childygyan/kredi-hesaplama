import { describe, expect, it } from 'vitest';
import {
  KrediHesaplamaHatasi,
  efektifAylikOran,
  erkenOdemeHesapla,
  hesaplaKredi,
  odemePlani,
  tlBicimle,
  yuvarla2,
} from '../src/lib/kredi';

const TOL = 0.01;
function yakin(actual: number, expected: number): void {
  expect(Math.abs(actual - expected)).toBeLessThan(TOL);
}

describe('hesaplaKredi — altın değerler (anüite formülü)', () => {
  it('100.000 TL, %4 aylık, 12 ay, KKDF %15 + BSMV %10 → 11.282,54', () => {
    const s = hesaplaKredi({ anapara: 100000, aylikFaizOrani: 4, vadeAy: 12 });
    yakin(s.aylikTaksit, 11282.54);
    yakin(s.toplamGeriOdeme, 135390.49);
  });

  it('konut kredisi (vergiden muaf) → 10.655,22 ve sıfır vergi', () => {
    const s = hesaplaKredi({ anapara: 100000, aylikFaizOrani: 4, vadeAy: 12, vergidenMuaf: true });
    yakin(s.aylikTaksit, 10655.22);
    expect(s.toplamVergi).toBe(0);
  });

  it('sıfır faiz → taksit = anapara / vade', () => {
    const s = hesaplaKredi({ anapara: 12000, aylikFaizOrani: 0, vadeAy: 12 });
    yakin(s.aylikTaksit, 1000);
    expect(s.toplamFaiz).toBe(0);
    expect(s.toplamVergi).toBe(0);
  });

  it('500.000 TL, %3 aylık, 36 ay → 25.535,30', () => {
    const s = hesaplaKredi({ anapara: 500000, aylikFaizOrani: 3, vadeAy: 36 });
    yakin(s.aylikTaksit, 25535.3);
  });
});

describe('efektifAylikOran', () => {
  it('vergiler efektif oranı artırır: %4 → %5', () => {
    yakin(efektifAylikOran({ anapara: 1000, aylikFaizOrani: 4, vadeAy: 12 }), 5);
  });

  it('muafiyette efektif oran nominal orana eşittir', () => {
    yakin(
      efektifAylikOran({ anapara: 1000, aylikFaizOrani: 4, vadeAy: 12, vergidenMuaf: true }),
      4,
    );
  });
});

describe('odemePlani — amortisman değişmezleri', () => {
  const girdi = { anapara: 100000, aylikFaizOrani: 4, vadeAy: 12 };

  it('anapara payları toplamı kredi tutarına eşittir', () => {
    const plan = odemePlani(girdi);
    const toplam = plan.reduce((a, s) => a + s.anapara, 0);
    yakin(toplam, 100000);
  });

  it('son satırda kalan borç sıfırlanır, kalan monoton azalır', () => {
    const plan = odemePlani(girdi);
    expect(plan).toHaveLength(12);
    for (let i = 1; i < plan.length; i += 1) {
      expect(plan[i]!.kalan).toBeLessThanOrEqual(plan[i - 1]!.kalan as number);
    }
    yakin(plan[11]!.kalan, 0);
  });

  it('ilk ay faiz/vergi ayrımı doğrudur', () => {
    const plan = odemePlani(girdi);
    const ilk = plan[0]!;
    yakin(ilk.faiz, 100000 * 0.04); // nominal oran üzerinden
    yakin(ilk.vergi, ilk.faiz * 0.25); // (15+10)/100
    yakin(ilk.taksit, ilk.anapara + ilk.faiz + ilk.vergi);
  });

  it('muaf planda vergi sıfırdır', () => {
    const plan = odemePlani({ ...girdi, vergidenMuaf: true });
    for (const s of plan) expect(s.vergi).toBe(0);
  });
});

describe('erkenOdemeHesapla', () => {
  const girdi = { anapara: 200000, aylikFaizOrani: 3, vadeAy: 24 };

  it('0. ayda kalan borç = anapara; hemen kapatmak tüm faizi kurtarır', () => {
    const s = erkenOdemeHesapla({ ...girdi, odenenAy: 0 });
    yakin(s.kalanAnapara, 200000);
    expect(s.odenenToplam).toBe(0);
    const tam = hesaplaKredi(girdi);
    yakin(s.tasarruf, tam.toplamFaiz + tam.toplamVergi);
  });

  it('vade sonunda kalan borç ve tasarruf sıfırdır', () => {
    const s = erkenOdemeHesapla({ ...girdi, odenenAy: 24 });
    yakin(s.kalanAnapara, 0);
    yakin(s.tasarruf, 0);
  });

  it('ara dönemde erken kapatma faiz tasarrufu sağlar', () => {
    const s = erkenOdemeHesapla({ ...girdi, odenenAy: 12 });
    expect(s.kalanTaksitSayisi).toBe(12);
    expect(s.tasarruf).toBeGreaterThan(0);
    // Kalan borç, ödeme planındaki 12. ay kalanıyla eşleşir.
    const plan = odemePlani(girdi);
    yakin(s.kalanAnapara, plan[11]!.kalan);
  });

  it('ceza oranı kapatma tutarına eklenir', () => {
    const cezasiz = erkenOdemeHesapla({ ...girdi, odenenAy: 12 });
    const cezali = erkenOdemeHesapla({ ...girdi, odenenAy: 12, erkenKapanisCezasiOrani: 2 });
    yakin(cezali.cezaTutari, cezasiz.kalanAnapara * 0.02);
    yakin(cezali.erkenKapatmaTutari, cezasiz.kalanAnapara + cezali.cezaTutari);
  });
});

describe('girdi doğrulama', () => {
  const gecerli = { anapara: 100000, aylikFaizOrani: 3, vadeAy: 12 };
  const hatali: Array<[string, Record<string, number | string>]> = [
    ['sıfır tutar', { ...gecerli, anapara: 0 }],
    ['negatif tutar', { ...gecerli, anapara: -5 }],
    ['sıfır vade', { ...gecerli, vadeAy: 0 }],
    ['kesirli vade', { ...gecerli, vadeAy: 12.5 }],
    ['çok uzun vade', { ...gecerli, vadeAy: 601 }],
    ['negatif faiz', { ...gecerli, aylikFaizOrani: -1 }],
    ['aşırı faiz', { ...gecerli, aylikFaizOrani: 101 }],
    ['negatif KKDF', { ...gecerli, kkdfOrani: -1 }],
    ['NaN tutar', { ...gecerli, anapara: Number.NaN }],
  ];
  it.each(hatali)('%s hata fırlatır', (_ad, girdi) => {
    expect(() => hesaplaKredi(girdi as never)).toThrow(KrediHesaplamaHatasi);
  });

  it('ödenen ay vadeyi aşamaz', () => {
    expect(() => erkenOdemeHesapla({ ...gecerli, odenenAy: 13 })).toThrow(KrediHesaplamaHatasi);
  });
});

describe('biçimlendirme yardımcıları', () => {
  it('tlBicimle tr-TR para birimi üretir', () => {
    const s = tlBicimle(11282.54);
    expect(s).toContain('₺');
    expect(s).toContain('11.282,54');
  });

  it('yuvarla2 iki ondalığa yuvarlar', () => {
    expect(yuvarla2(2.345)).toBe(2.35);
    expect(yuvarla2(2.344)).toBe(2.34);
  });
});
