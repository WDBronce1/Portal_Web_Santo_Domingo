/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // PGlite (PostgreSQL WASM) usa literales BigInt y WebAssembly, que solo
    // existen en navegadores modernos. Se sube el target "moderno" del plugin a
    // navegadores con BigInt (coincide con el .browserslistrc del proyecto) y se
    // desactiva el bundle legacy/SystemJS, inútil aquí porque esos navegadores
    // antiguos no pueden ejecutar WASM.
    legacy({
      modernTargets: ['chrome>=79', 'edge>=79', 'firefox>=70', 'safari>=14', 'ios>=14'],
      modernPolyfills: true,
      renderLegacyChunks: false,
    })
  ],
  // PGlite (PostgreSQL en WASM) trae su propio binario .wasm; excluirlo del
  // pre-bundle de Vite evita que el optimizador rompa la carga del módulo.
  optimizeDeps: {
    exclude: ['@electric-sql/pglite'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})
