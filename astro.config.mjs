import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  // Projeyi tam dinamik sunucu moduna alıyoruz
  output: 'server',
  adapter: cloudflare({
    imageService: 'cloudflare'
  }),
  // Gelecekte domainlere göre yönlendirme yapabilmek için altyapı
  build: {
    format: 'directory'
  }
});
