// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

import { SITE } from './src/config/site.ts';

// https://astro.build/config
export default defineConfig({
  site: SITE.siteUrl,
  integrations: [
    tailwind(),
    sitemap({
      // 404 sayfası arama motorlarında indekslenmemeli
      filter: (page) => !page.endsWith('/404/'),
    }),
  ],
});
