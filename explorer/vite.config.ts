import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Static build: `npm run demo` (tools/build-demo.ts) writes the site into docs/, which GitHub Pages serves; any
// static host can serve it too. Three pages: the showcase (index.html), the component gallery (components.html)
// and the theme studio (themes.html). docs/ also holds the guides, so the build never empties it.
export default defineConfig({
  base: './',
  build: {
    outDir: '../docs',
    emptyOutDir: false,
    // The gallery loads every component and story at once, on purpose.
    chunkSizeWarningLimit: 1600,
    rollupOptions: { input: { index: resolve(import.meta.dirname, 'index.html'), components: resolve(import.meta.dirname, 'components.html'), themes: resolve(import.meta.dirname, 'themes.html') } },
  },
});
