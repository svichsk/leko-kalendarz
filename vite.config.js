import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg}'] // To mówi: pobierz i zapisz WSZYSTKIE pliki offline!
      },
      manifest: {
        // Tu podajesz to co w Krok 1 (plugin sam to wstrzyknie)
        short_name: "LEKalendarz",
        name: "LEKalendarz - Miej leki pod kontrolą",
        start_url: "/",
        display: "standalone",
        theme_color: "#20602C",
        background_color: "#15202b",
        icons: [
          {
            src: "/logo.jpg",
            sizes: "192x192",
            type: "image/jpeg"
          },
          {
            src: "/logo.jpg",
            sizes: "512x512",
            type: "image/jpeg"
          }
        ]
      }
    })
  ]
})