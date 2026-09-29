import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // El Service Worker cubre toda la app (así funciona un PWA — un solo scope por origen),
      // pero la cola de sincronización offline real (Dexie) hoy solo está implementada para
      // Muestreo, la pantalla de captura de campo — ver docs/arquitectura-tecnica.md sección 5.
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [
          {
            // Las llamadas a la API nunca se sirven desde caché — siempre intenta red primero;
            // si falla, cada pantalla decide cómo manejarlo (ver useRegistrarMuestreo).
            urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
            handler: "NetworkOnly",
          },
        ],
      },
      manifest: {
        name: "Sierra Nevada — Producción",
        short_name: "Sierra Nevada",
        description: "Sistema de producción de truchas — Sierra Nevada",
        theme_color: "#2a78d6",
        background_color: "#fcfcfb",
        display: "standalone",
        icons: [
          { src: "/pwa-192.svg", sizes: "192x192", type: "image/svg+xml" },
          { src: "/pwa-512.svg", sizes: "512x512", type: "image/svg+xml" },
        ],
      },
    }),
  ],
});
