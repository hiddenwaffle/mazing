import { defineConfig } from 'vite';

// The game is a static, dependency-light single page. Vite serves `index.html`
// at the repo root, bundles the ES modules under `src/js`, and copies static
// runtime assets (the texture atlas and audio) from `public/` verbatim.
export default defineConfig({
  // Relative base so the production build works whether it is hosted at a
  // domain root or a sub-path (e.g. GitHub Pages project sites).
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
});
