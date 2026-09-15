import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'
import { resolve } from "path";

// Separate build for the on-device OBS overlay page.
// It's served locally by the Rust axum server in src-tauri/src/overlay,
//  not part of the main Tauri window bundle. (See src-tauri/src/overlay/mod.rs)
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: "dist-overlay",
    rollupOptions: {
      input: resolve(__dirname, "overlay.html"),
    },
  },
});
