// Build estático solo para la APK (Capacitor): rutas relativas y JS/CSS para WebViews antiguos (Chrome 87).
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  root: fileURLToPath(new URL('./apk', import.meta.url)), base: './',
  plugins: [react()],
  build: { target: ['es2020', 'chrome87'], cssTarget: ['chrome87'], outDir: fileURLToPath(new URL('./www', import.meta.url)), emptyOutDir: true },
})
