import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'
import { resolve } from "path";

// Separate build for the on-device OBS overlay pages (match overlay + queue widget).
// They're served locally by the Rust axum server in src-tauri/src/overlay,
//  not part of the main Tauri window bundle. (See src-tauri/src/overlay/mod.rs)
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: "dist-overlay",
    rollupOptions: {
      input: {
        overlay: resolve(__dirname, "overlay.html"),
        queue: resolve(__dirname, "queue.html"),
      },
    },
  },
});
