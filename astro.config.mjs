import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.turskapijaca.com',
  output: 'static',
  build: {
    format: 'file'
  }
});
