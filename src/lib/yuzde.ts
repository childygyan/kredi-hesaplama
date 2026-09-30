/** Yüzde hesaplama yardımcıları (pure functions). */

export function yuzdeHesapla(tutar: number, yuzde: number): number {
  if (!Number.isFinite(tutar) || !Number.isFinite(yuzde)) {
    throw new Error('Geçerli sayılar girin.');
  }
  return (tutar * yuzde) / 100;
}

/** `parca`, `butun` sayısının yüzde kaçıdır? */
export function yuzdeOrani(parca: number, butun: number): number {
  if (!Number.isFinite(parca) || !Number.isFinite(butun) || butun === 0) {
    throw new Error('Geçerli sayılar girin (bütün sıfır olamaz).');
  }
  return (parca / butun) * 100;
}

/** `eski` değerden `yeni` değere yüzde değişim (artış pozitif, azalış negatif). */
export function yuzdeDegisim(eski: number, yeni: number): number {
  if (!Number.isFinite(eski) || !Number.isFinite(yeni) || eski === 0) {
    throw new Error('Geçerli sayılar girin (eski değer sıfır olamaz).');
  }
  return ((yeni - eski) / Math.abs(eski)) * 100;
}
