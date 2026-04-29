import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: './tsconfig.build.json',
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['src/**/*.spec.ts', 'src/**/*.test.ts', 'src/main.ts', 'src/App.vue'],
      entryRoot: 'src',
      cleanVueFileName: true,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src', 'index.ts'),
      name: 'DatePicker', // Nom global pour le build UMD (si tu l'actives)
      fileName: 'date-range-picker',
      formats: ['es', 'cjs'], // ES modules + CommonJS. Ajoute 'umd' si tu veux du <script> CDN
    },

    // Library build: don't ship demo assets (favicon, icons) from `public/`.
    copyPublicDir: false,

    rollupOptions: {
      // Ne bundle PAS Vue avec ton package : il doit venir du projet consommateur
      external: ['vue'],
      output: {
        // Nom de la variable globale pour le build UMD
        globals: {
          vue: 'Vue',
        },
        // Préserve les modules pour permettre le tree-shaking côté consommateur
        exports: 'named',
      },
    },

    // Fichiers CSS générés seront dans dist/style.css
    cssCodeSplit: false,

    // Génère des sourcemaps pour le debug
    sourcemap: true,

    // Ne vide pas le dossier dist entre deux builds (utile en mode watch)
    emptyOutDir: true,
  },
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.spec.ts'],
  },
})
