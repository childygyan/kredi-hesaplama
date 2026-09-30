import { describe, expect, it } from 'vitest';
import { SITE } from '../src/config/site';
import { canonicalUrl, hreflangLinks, organizationJsonLd, websiteJsonLd } from '../src/lib/seo';

describe('site config', () => {
  it('is Turkish-only', () => {
    expect(SITE.locale).toBe('tr');
  });

  it('has a placeholder site URL (Firoz sets the production domain)', () => {
    expect(SITE.siteUrl).toContain('example.com');
  });

  it('AdSense client id is empty by default (no broken ad calls)', () => {
    expect(SITE.adsenseClientId).toBe('');
  });

  it('affiliate CTAs are disabled by default', () => {
    expect(SITE.affiliate.enabled).toBe(false);
  });
});

describe('seo helpers', () => {
  it('canonicalUrl builds absolute URLs and strips trailing slashes', () => {
    expect(canonicalUrl('/')).toBe(`${SITE.siteUrl}/`);
    expect(canonicalUrl('/kredi-hesaplama/')).toBe(`${SITE.siteUrl}/kredi-hesaplama`);
  });

  it('hreflangLinks returns tr self-reference and x-default', () => {
    const links = hreflangLinks('/kredi-hesaplama');
    expect(links).toHaveLength(2);
    expect(links[0]).toEqual({ hreflang: 'tr', href: `${SITE.siteUrl}/kredi-hesaplama` });
    expect(links[1]?.hreflang).toBe('x-default');
  });

  it('JSON-LD blocks are Turkish and reference the site URL', () => {
    const site = websiteJsonLd();
    expect(site['@type']).toBe('WebSite');
    expect(site['inLanguage']).toBe('tr');
    expect(site['url']).toBe(SITE.siteUrl);
    const org = organizationJsonLd();
    expect(org['@type']).toBe('Organization');
    expect(org['url']).toBe(SITE.siteUrl);
  });
});
