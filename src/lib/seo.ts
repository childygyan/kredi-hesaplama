import { SITE } from '../config/site.ts';

/** Absolute canonical URL for a site path (path must start with "/"). */
export function canonicalUrl(path: string): string {
  const clean = path === '/' ? '/' : path.replace(/\/$/, '');
  return `${SITE.siteUrl}${clean}`;
}

/** hreflang entries for a page: Turkish self-reference + x-default. */
export function hreflangLinks(path: string): Array<{ hreflang: string; href: string }> {
  const href = canonicalUrl(path);
  return [
    { hreflang: 'tr', href },
    { hreflang: 'x-default', href },
  ];
}

export interface PageMeta {
  title: string;
  description: string;
  path: string;
  /** Extra JSON-LD blocks to embed. */
  jsonLd?: Array<Record<string, unknown>>;
}

export function websiteJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.siteName,
    url: SITE.siteUrl,
    inLanguage: 'tr',
  };
}

export function organizationJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.siteName,
    url: SITE.siteUrl,
  };
}
