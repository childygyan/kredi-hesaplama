/**
 * Single source of truth for site-wide configuration.
 * Placeholders marked TODO(Firoz) must be filled by Firoz before production:
 * domain/DNS, AdSense application, affiliate partnerships.
 */
export const SITE = {
  /** TODO(Firoz): production domain — update before launch. */
  siteUrl: 'https://kredi-hesaplama.example.com',
  siteName: 'Kredi Hesaplama',
  locale: 'tr' as const,
  /** TODO(Firoz): real contact e-mail. */
  contactEmail: 'info@example.com',
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
  },
} as const;

export type SiteConfig = typeof SITE;
