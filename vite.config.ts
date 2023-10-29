import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8787/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      filename: "sw.ts",
      srcDir: "src/service-worker",
      includeAssets: ["*.svg"],
      includeManifestIcons: false,
      injectRegister: false,
      registerType: "prompt",
      devOptions: {
        enabled: true,
        navigateFallback: "index.html",
      },
      manifest: {
        name: "Lottie Files Search",
        short_name: "LFS",
        theme_color: "#000",
        icons: [
          {
            src: "512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      strategies: "injectManifest",
    }),
  ],
});
