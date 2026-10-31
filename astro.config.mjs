import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://agm-2.github.io',
  base: '/',
  // Not Astro's default 4321, which other local Astro sites use: two sites on
  // the same address make the browser load one site's cached files on the other.
  server: { port: 4330 },
});
