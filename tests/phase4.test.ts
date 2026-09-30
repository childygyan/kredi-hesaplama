import { describe, expect, it } from 'vitest';
import { SITE } from '../src/config/site';

describe('monetization defaults (pasif)', () => {
  it('AdSense varsayılan olarak kapalıdır (ID boş)', () => {
    expect(SITE.adsenseClientId).toBe('');
  });

  it('affiliate varsayılan olarak kapalıdır', () => {
    expect(SITE.affiliate.enabled).toBe(false);
  });

  it('affiliate CTA URL varsayılan olarak boştur', () => {
    expect(SITE.affiliate.ctaUrl).toBe('');
  });

  it('iletişim e-postası hâlâ yer tutucudur (Firoz dolduracak)', () => {
    expect(SITE.contactEmail).toBe('info@example.com');
  });
});
