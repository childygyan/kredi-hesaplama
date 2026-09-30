import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');

function htmlDosyalari(): string[] {
  if (!existsSync(DIST)) throw new Error('dist/ bulunamadı — önce `npm run build` çalıştırın.');
  const sonuc: string[] = [];
  const gez = (dir: string) => {
    for (const ad of readdirSync(dir)) {
      const yol = join(dir, ad);
      if (statSync(yol).isDirectory()) gez(yol);
      else if (ad.endsWith('.html')) sonuc.push(yol);
    }
  };
  gez(DIST);
  return sonuc;
}

/** İç bağlantıları (href="/...") topla. */
function icBaglantilar(html: string): string[] {
  const baglantilar: string[] = [];
  const re = /href="(\/[^"#]*?)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) baglantilar.push(m[1]);
  return [...new Set(baglantilar)];
}

/** "/yolu/" → dist içindeki karşılığı var mı? (sayfa veya statik dosya) */
function hedefVar(yol: string): boolean {
  const temiz = yol.replace(/\/$/, '');
  if (temiz === '') return existsSync(join(DIST, 'index.html'));
  return (
    existsSync(join(DIST, temiz, 'index.html')) ||
    existsSync(join(DIST, `${temiz}.html`)) ||
    existsSync(join(DIST, temiz))
  );
}

describe('phase 6 — build çıktı denetimleri', () => {
  const dosyalar = htmlDosyalari();
  const icerikSayfalari = dosyalar.filter((d) => !d.endsWith('/404.html'));

  it('kırık iç bağlantı yok', () => {
    const kiriklar: string[] = [];
    for (const dosya of dosyalar) {
      const html = readFileSync(dosya, 'utf8');
      for (const href of icBaglantilar(html)) {
        if (!hedefVar(href)) kiriklar.push(`${dosya} → ${href}`);
      }
    }
    expect(kiriklar).toEqual([]);
  });

  it('her içerik sayfasında tek h1, lang="tr", skip link ve canonical var', () => {
    expect(icerikSayfalari.length).toBeGreaterThanOrEqual(10);
    for (const dosya of icerikSayfalari) {
      const html = readFileSync(dosya, 'utf8');
      expect(html.match(/<h1[\s>]/g)?.length ?? 0, `${dosya}: h1`).toBe(1);
      expect(html.includes('<html lang="tr">'), `${dosya}: lang`).toBe(true);
      expect(html.includes('href="#icerik"'), `${dosya}: skip link`).toBe(true);
      expect(html.includes('rel="canonical"'), `${dosya}: canonical`).toBe(true);
      expect(html.includes('<meta name="description"'), `${dosya}: description`).toBe(true);
    }
  });

  it('sitemap 10 içerik sayfasını içerir, 404 hariç', () => {
    const sitemap = readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8');
    const urller = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(urller.filter((u) => u.endsWith('/404/'))).toEqual([]);
    expect(urller.length).toBe(10);
  });

  it('istemci JS bütçesi: toplam < 150KB', () => {
    let toplam = 0;
    const gez = (dir: string) => {
      for (const ad of readdirSync(dir)) {
        const yol = join(dir, ad);
        if (statSync(yol).isDirectory()) gez(yol);
        else if (ad.endsWith('.js')) toplam += statSync(yol).size;
      }
    };
    gez(DIST);
    expect(toplam).toBeLessThan(150 * 1024);
  });

  it('_headers güvenlik başlıklarını içerir', () => {
    const headers = readFileSync(join(DIST, '_headers'), 'utf8');
    for (const baslik of [
      'X-Content-Type-Options',
      'X-Frame-Options',
      'Referrer-Policy',
      'Content-Security-Policy',
    ]) {
      expect(headers.includes(baslik), baslik).toBe(true);
    }
  });

  it('404.html üretilmiş', () => {
    expect(existsSync(join(DIST, '404.html'))).toBe(true);
  });
});
