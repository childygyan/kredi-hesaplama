import { describe, expect, it } from 'vitest';
import { yuzdeDegisim, yuzdeHesapla, yuzdeOrani } from '../src/lib/yuzde';
import { yasHesapla } from '../src/lib/yas';

describe('yuzde', () => {
  it('tutarın yüzdesini hesaplar', () => {
    expect(yuzdeHesapla(200, 15)).toBe(30);
    expect(yuzdeHesapla(100000, 18)).toBe(18000);
  });

  it('parçanın bütüne oranını bulur', () => {
    expect(yuzdeOrani(30, 200)).toBeCloseTo(15, 10);
  });

  it('yüzde değişimi hesaplar (artış/azalış)', () => {
    expect(yuzdeDegisim(100, 120)).toBeCloseTo(20, 10);
    expect(yuzdeDegisim(200, 150)).toBeCloseTo(-25, 10);
  });

  it('geçersiz girdilerde hata fırlatır', () => {
    expect(() => yuzdeHesapla(Number.NaN, 10)).toThrow();
    expect(() => yuzdeOrani(10, 0)).toThrow();
    expect(() => yuzdeDegisim(0, 10)).toThrow();
  });
});

describe('yasHesapla', () => {
  it('tam yaş hesaplar', () => {
    const s = yasHesapla(new Date(1990, 5, 15), new Date(2026, 8, 30));
    expect(s).toEqual({ yil: 36, ay: 3, gun: 15, toplamGun: s.toplamGun });
  });

  it('doğum günü gelmemişse yaşı bir eksik sayar', () => {
    const s = yasHesapla(new Date(1990, 10, 15), new Date(2026, 8, 30));
    expect(s.yil).toBe(35);
    expect(s.ay).toBeGreaterThanOrEqual(0);
  });

  it('artık yıl doğumlularında çalışır', () => {
    const s = yasHesapla(new Date(2000, 1, 29), new Date(2026, 8, 30));
    expect(s.yil).toBe(26);
  });

  it('ileri tarih reddedilir', () => {
    expect(() => yasHesapla(new Date(2030, 0, 1), new Date(2026, 8, 30))).toThrow();
  });
});
