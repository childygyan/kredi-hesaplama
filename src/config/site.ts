/**
 * Single source of truth for site-wide configuration.
 * Placeholders marked TODO(Firoz) must be filled by Firoz before production:
 * domain/DNS, AdSense application, affiliate partnerships.
 */
export const SITE = {
  /** Production domain (Firoz, 2026-09-30). */
  siteUrl: 'https://kredihesaplama.cc',
  siteName: 'Kredi Hesaplama',
  locale: 'tr' as const,
  /** Contact e-mail (Firoz, 2026-09-30). */
  contactEmail: 'info@kredihesaplama.cc',
  /**
   * TODO(Firoz): Google AdSense publisher ID, e.g. "ca-pub-1234567890123456".
   * While empty, <AdSlot> renders nothing (no broken ad calls).
   */
  adsenseClientId: '',
  affiliate: {
    /**
     * TODO(Firoz): enable only after TR bank affiliate partnerships are signed.
     * While disabled, affiliate CTA slots render nothing.
     */
    enabled: false,
    /**
     * TODO(Firoz): affiliate/lead-gen hedef URL'si (ortaklık sonrası).
     * Örn. "https://example.com/kredi-teklifleri?kaynak=kredi-hesaplama".
     */
    ctaUrl: '',
  },
} as const;

export type SiteConfig = typeof SITE;
