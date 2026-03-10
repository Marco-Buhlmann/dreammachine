import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://dreammachine.vision',
  integrations: [tailwind()],
  output: 'static',
});
