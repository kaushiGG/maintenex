import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: false,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      clientPort: 8080,
      timeout: 30000,  // Increase timeout for better connection stability
      overlay: true,   // Show errors in overlay
    },
    watch: {
      usePolling: true,
    },
    allowedHosts: [
      "localhost",
      "52ae2ed6-f06d-4d89-9f04-aa3192072613.lovableproject.com"
    ],
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Polyfill for Next.js dependencies that try to use process
    'process.env': {},
    'process.browser': true
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  build: {
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  }
}));
