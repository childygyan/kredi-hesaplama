/**
 * Kredi hesaplama motoru — ihtiyaç / konut / taşıt kredileri.
 *
 * Matematik: eşit taksitli (anüite) formül
 *   Taksit = Anapara × [r(1+r)^n] / [(1+r)^n − 1]
 * Vergi uygulaması: KKDF + BSMV, aylık faiz üzerinden alınır; efektif aylık
 * oran r_eff = r × (1 + KKDF + BSMV) olarak hesaplanır. Konut kredisi
 * KKDF/BSMV'den muaftır (vergidenMuaf: true).
 *
 * DÜRÜSTLÜK KURALI: Bu motor güncel banka faiz oranlarını bilmez ve sunmaz.
 * Tüm oranlar kullanıcı tarafından girilir. KKDF/BSMV varsayılanları
 * (%15 / %10) yalnızca başlangıç değeridir; oranlar değişebilir.
 */

export class KrediHesaplamaHatasi extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KrediHesaplamaHatasi';
  }
}

export interface KrediGirdisi {
  /** Kredi tutarı (TL). */
  anapara: number;
  /** Aylık faiz oranı, yüzde cinsinden (örn. 3.5 = %3.5). */
  aylikFaizOrani: number;
  /** Vade, ay cinsinden (1–600). */
  vadeAy: number;
  /** KKDF oranı, yüzde. Varsayılan 15. */
  kkdfOrani?: number;
  /** BSMV oranı, yüzde. Varsayılan 10. */
  bsmvOrani?: number;
  /** true ise KKDF/BSMV uygulanmaz (konut kredisi). */
  vergidenMuaf?: boolean;
}

export interface KrediSonucu {
  aylikTaksit: number;
  toplamGeriOdeme: number;
  toplamFaiz: number;
  /** KKDF + BSMV toplamı. */
  toplamVergi: number;
  /** Vergiler dahil efektif aylık oran, yüzde. */
  efektifAylikOran: number;
}

export interface OdemeSatiri {
  ay: number;
  taksit: number;
  anapara: number;
  faiz: number;
  vergi: number;
  kalan: number;
}

const VARSAYILAN_KKDF = 15;
const VARSAYILAN_BSMV = 10;
const EN_UZUN_VADE_AY = 600;

function sayiKontrol(deger: number, ad: string): void {
  if (!Number.isFinite(deger)) {
    throw new KrediHesaplamaHatasi(`${ad} geçerli bir sayı olmalıdır.`);
  }
}

export function girdiKontrol(
  g: KrediGirdisi,
): Required<Omit<KrediGirdisi, 'vergidenMuaf'>> & { vergidenMuaf: boolean } {
  sayiKontrol(g.anapara, 'Kredi tutarı');
  sayiKontrol(g.aylikFaizOrani, 'Faiz oranı');
  sayiKontrol(g.vadeAy, 'Vade');
  const kkdf = g.kkdfOrani ?? VARSAYILAN_KKDF;
  const bsmv = g.bsmvOrani ?? VARSAYILAN_BSMV;
  sayiKontrol(kkdf, 'KKDF oranı');
  sayiKontrol(bsmv, 'BSMV oranı');

  if (g.anapara <= 0) throw new KrediHesaplamaHatasi('Kredi tutarı sıfırdan büyük olmalıdır.');
  if (!Number.isInteger(g.vadeAy) || g.vadeAy < 1 || g.vadeAy > EN_UZUN_VADE_AY) {
    throw new KrediHesaplamaHatasi(`Vade 1 ile ${EN_UZUN_VADE_AY} ay arasında tam sayı olmalıdır.`);
  }
  if (g.aylikFaizOrani < 0 || g.aylikFaizOrani > 100) {
    throw new KrediHesaplamaHatasi('Aylık faiz oranı %0 ile %100 arasında olmalıdır.');
  }
  if (kkdf < 0 || kkdf > 100 || bsmv < 0 || bsmv > 100) {
    throw new KrediHesaplamaHatasi('KKDF ve BSMV oranları %0 ile %100 arasında olmalıdır.');
  }
  return {
    anapara: g.anapara,
    aylikFaizOrani: g.aylikFaizOrani,
    vadeAy: g.vadeAy,
    kkdfOrani: kkdf,
    bsmvOrani: bsmv,
    vergidenMuaf: g.vergidenMuaf ?? false,
  };
}

/** Vergiler dahil efektif aylık oran, yüzde cinsinden (örn. 5 = %5). */
export function efektifAylikOran(g: KrediGirdisi): number {
  const v = girdiKontrol(g);
  const r = v.aylikFaizOrani / 100;
  if (v.vergidenMuaf) return v.aylikFaizOrani;
  return r * (1 + v.kkdfOrani / 100 + v.bsmvOrani / 100) * 100;
}

export function hesaplaKredi(g: KrediGirdisi): KrediSonucu {
  const v = girdiKontrol(g);
  const r = efektifAylikOran(g) / 100;
  const n = v.vadeAy;
  const taksit =
    r === 0 ? v.anapara / n : (v.anapara * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const toplamGeriOdeme = taksit * n;
  const toplamFaizVergi = toplamGeriOdeme - v.anapara;
  // Faiz/vergi ayrımı: faiz = nominal oran üzerinden, vergi = faiz × (KKDF+BSMV).
  const vergiCarpani = v.vergidenMuaf ? 0 : v.kkdfOrani / 100 + v.bsmvOrani / 100;
  const toplamVergi =
    vergiCarpani === 0 ? 0 : toplamFaizVergi * (vergiCarpani / (1 + vergiCarpani));
  const toplamFaiz = toplamFaizVergi - toplamVergi;
  return {
    aylikTaksit: taksit,
    toplamGeriOdeme,
    toplamFaiz,
    toplamVergi,
    efektifAylikOran: r,
  };
}

/** Aylık ödeme planı (amortisman tablosu). Son satırda kalan tutar sıfırlanır. */
export function odemePlani(g: KrediGirdisi): OdemeSatiri[] {
  const v = girdiKontrol(g);
  const { aylikTaksit } = hesaplaKredi(g);
  const rNominal = v.aylikFaizOrani / 100;
  const vergiCarpani = v.vergidenMuaf ? 0 : v.kkdfOrani / 100 + v.bsmvOrani / 100;
  const satirlar: OdemeSatiri[] = [];
  let kalan = v.anapara;
  for (let ay = 1; ay <= v.vadeAy; ay += 1) {
    const faiz = kalan * rNominal;
    const vergi = faiz * vergiCarpani;
    let anaparaPayi = aylikTaksit - faiz - vergi;
    let taksit = aylikTaksit;
    if (ay === v.vadeAy || anaparaPayi >= kalan) {
      // Son taksiti kalan borca eşitle (kuruş farklarını temizler).
      anaparaPayi = kalan;
      taksit = anaparaPayi + faiz + vergi;
    }
    kalan = Math.max(0, kalan - anaparaPayi);
    satirlar.push({ ay, taksit, anapara: anaparaPayi, faiz, vergi, kalan });
  }
  return satirlar;
}

export interface ErkenOdemeGirdisi extends KrediGirdisi {
  /** Yapılmış taksit sayısı (0–vade). */
  odenenAy: number;
  /** Erken kapatma cezası oranı, yüzde. Varsayılan 0. Banka sözleşmenize bakın. */
  erkenKapanisCezasiOrani?: number;
}

export interface ErkenOdemeSonucu {
  kalanAnapara: number;
  odenenToplam: number;
  kalanTaksitSayisi: number;
  cezaTutari: number;
  erkenKapatmaTutari: number;
  /** Vadeye kadar devam etmeye kıyasla tasarruf (negatif olabilir). */
  tasarruf: number;
}

export function erkenOdemeHesapla(g: ErkenOdemeGirdisi): ErkenOdemeSonucu {
  const v = girdiKontrol(g);
  sayiKontrol(g.odenenAy, 'Ödenen ay');
  if (!Number.isInteger(g.odenenAy) || g.odenenAy < 0 || g.odenenAy > v.vadeAy) {
    throw new KrediHesaplamaHatasi('Ödenen ay sayısı 0 ile vade arasında tam sayı olmalıdır.');
  }
  const cezaOrani = g.erkenKapanisCezasiOrani ?? 0;
  sayiKontrol(cezaOrani, 'Erken kapatma cezası');
  if (cezaOrani < 0 || cezaOrani > 100) {
    throw new KrediHesaplamaHatasi('Erken kapatma cezası %0 ile %100 arasında olmalıdır.');
  }
  const sonuc = hesaplaKredi(g);
  const plan = odemePlani(g);
  const kalanAnapara = g.odenenAy === 0 ? v.anapara : (plan[g.odenenAy - 1]?.kalan ?? 0);
  const odenenToplam = sonuc.aylikTaksit * g.odenenAy;
  const cezaTutari = kalanAnapara * (cezaOrani / 100);
  const erkenKapatmaTutari = kalanAnapara + cezaTutari;
  const tasarruf = sonuc.toplamGeriOdeme - (odenenToplam + erkenKapatmaTutari);
  return {
    kalanAnapara,
    odenenToplam,
    kalanTaksitSayisi: v.vadeAy - g.odenenAy,
    cezaTutari,
    erkenKapatmaTutari,
    tasarruf,
  };
}

/** TL biçimlendirme (tr-TR): örn. 11282.54 → "₺11.282,54". */
export function tlBicimle(tutar: number): string {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(tutar);
}

/** Yuvarlama: görüntü amaçlı 2 ondalık. */
export function yuvarla2(tutar: number): number {
  return Math.round((tutar + Number.EPSILON) * 100) / 100;
}
